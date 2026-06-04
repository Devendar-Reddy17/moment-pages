package com.momentpages.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentpages.media.Media;
import com.momentpages.media.MediaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import software.amazon.awssdk.services.s3.S3Client;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OpenAIProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAIProvider.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final int maxTokens;
    private final PIIDetectionService piiDetectionService;
    private final MediaRepository mediaRepository;
    private final S3Client s3Client;
    @Value("${r2.bucket-name}")
    private String bucketName;
    @Value("${app.backend-url}")
    private String backendUrl;

    public OpenAIProvider(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model}") String model,
            @Value("${openai.max-tokens}") int maxTokens,
            ObjectMapper objectMapper,
            PIIDetectionService piiDetectionService,
            MediaRepository mediaRepository,
            S3Client s3Client) {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .exchangeStrategies(strategies)
                .build();
        this.objectMapper = objectMapper;
        this.model = model;
        this.maxTokens = maxTokens;
        this.piiDetectionService = piiDetectionService;
        this.mediaRepository = mediaRepository;
        this.s3Client = s3Client;
    }

    @Override
    public AITextResponse generateInvitationText(AITextRequest request) {
        String prompt = loadPromptTemplate("prompts/invitation-text.txt")
                .replace("{{eventType}}", request.eventType())
                .replace("{{tone}}", request.tone())
                .replace("{{recipientName}}", request.recipientName() != null ? request.recipientName() : "someone special")
                .replace("{{additionalContext}}", request.additionalContext() != null ? request.additionalContext() : "");

        String response = callOpenAI(prompt);

        try {
            return objectMapper.readValue(response, AITextResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI text response", e);
            return new AITextResponse(List.of(
                    new AITextResponse.Suggestion("You're Invited!", response, "Join Us")
            ));
        }
    }

    @Override
    public AIThemeResponse generateTheme(AIThemeRequest request) {
        String prompt = loadPromptTemplate("prompts/theme-suggestion.txt")
                .replace("{{description}}", request.description());

        String response = callOpenAI(prompt);

        try {
            return objectMapper.readValue(response, AIThemeResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI theme response", e);
            return new AIThemeResponse(
                    List.of("#1a1a2e", "#16213e", "#e94560", "#ffffff"),
                    new AIThemeResponse.Typography("Playfair Display", "Inter"),
                    "centered-hero",
                    "An elegant abstract background"
            );
        }
    }

    @Override
    public AIPageResponse generatePage(AIPageRequest request) {
        String prompt = loadPromptTemplate("prompts/generate-page.txt")
                .replace("{{prompt}}", request.prompt());

        String response = callOpenAI(prompt);

        try {
            return objectMapper.readValue(response, AIPageResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI page response", e);
            // Return a sensible fallback with single page
            List<Map<String, Object>> fallbackElements = List.of(
                    Map.of("type", "text", "x", 140, "y", 200, "width", 800, "height", 120,
                            "content", Map.of("html", "<p style='font-size:48px;color:#1f2937'>Your Invitation</p>",
                                    "plainText", "Your Invitation", "fontFamily", "Inter",
                                    "fontSize", 48, "color", "#1f2937", "textAlign", "center")),
                    Map.of("type", "text", "x", 140, "y", 400, "width", 800, "height", 80,
                            "content", Map.of("html", "<p style='font-size:20px;color:#4b5563'>We'd love for you to join us!</p>",
                                    "plainText", "We'd love for you to join us!", "fontFamily", "Inter",
                                    "fontSize", 20, "color", "#4b5563", "textAlign", "center"))
            );
            return new AIPageResponse(
                    new AIPageResponse.Canvas(1080, 1920, "#fdf2f8", Optional.empty()),
                    List.of(new AIPageResponse.Page("Page 1", fallbackElements))
            );
        }
    }

    @Override
    public AIEditResponse editCanvas(AIEditRequest request) {
        String prompt = loadPromptTemplate("prompts/edit-canvas.txt")
                .replace("{{canvasState}}", request.canvasState())
                .replace("{{prompt}}", request.prompt());

        String response = callOpenAI(prompt);

        try {
            return objectMapper.readValue(response, AIEditResponse.class);
        } catch (Exception e) {
            log.error("Failed to parse AI edit response", e);
            // Return empty operations on error
            return new AIEditResponse(List.of());
        }
    }

    @Override
    public AIImageResponse generateImage(AIImageRequest request) {
        try {
            log.info("Generating image with prompt: {}", request.prompt());

            // Check for PII
            boolean containsPII = piiDetectionService.containsPII(request.prompt());
            log.info("PII detection result: {}", containsPII);

            // If no PII, check for existing shared image (deduplication)
            if (!containsPII) {
                String promptHash = hashPrompt(request.prompt());
                String sharedFileKey = "ai-generated/shared/" + promptHash + ".png";
                
                Optional<Media> existingMedia = mediaRepository.findByFileKey(sharedFileKey);
                if (existingMedia.isPresent()) {
                    String existingUrl = backendUrl + "/api/v1/media/" + sharedFileKey;
                    log.info("Returning existing shared image: {}", existingUrl);
                    return new AIImageResponse(existingUrl);
                }
            }

            // Generate new image
            Map<String, Object> requestBody = Map.of(
                    "model", "gpt-image-1-mini",
                    "prompt", request.prompt(),
                    "n", 1,
                    "size", "1024x1024"
            );

            log.info("Sending request to DALL-E API: {}", requestBody);

            String response = webClient.post()
                    .uri("/images/generations")
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            clientResponse -> clientResponse.bodyToMono(String.class)
                                    .map(errorBody -> {
                                        log.error("DALL-E API error response: {}", errorBody);
                                        return new RuntimeException("DALL-E API error: " + errorBody);
                                    })
                    )
                    .bodyToMono(String.class)
                    .block();

            //log.info("DALL-E API response: {}", response);

            JsonNode root = objectMapper.readTree(response);
            JsonNode dataNode = root.path("data");

            if (!dataNode.isArray() || dataNode.isEmpty()) {
                throw new RuntimeException("No image returned from OpenAI");
            }

            JsonNode imageNode = dataNode.get(0);

            // Handle base64 response
            if (!imageNode.has("b64_json")) {
                throw new RuntimeException("Expected b64_json but none found");
            }

            String base64Image = imageNode.get("b64_json").asText();
            byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Image);

            // Determine storage location based on PII and projectId
            String fileKey;
            UUID mediaId = UUID.randomUUID();
            String fileName = mediaId + ".png";

            if (!containsPII) {
                // Shared folder (no PII)
                String promptHash = hashPrompt(request.prompt());
                fileKey = "ai-generated/shared/" + promptHash + ".png";
            } else if (request.projectId() != null) {
                // Project folder (has PII and projectId provided)
                fileKey = "projects/" + request.projectId() + "/" + fileName;
            } else {
                // Fallback to shared folder if no projectId (shouldn't happen with new flow)
                String promptHash = hashPrompt(request.prompt());
                fileKey = "ai-generated/shared/" + promptHash + ".png";
            }

            // Upload to R2
            s3Client.putObject(
                    software.amazon.awssdk.services.s3.model.PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(fileKey)
                            .contentType("image/png")
                            .build(),
                    software.amazon.awssdk.core.sync.RequestBody.fromBytes(imageBytes)
            );

            // Save media record
            Media media = new Media();
            media.setId(mediaId);
            media.setProjectId(request.projectId());
            media.setFileKey(fileKey);
            media.setFileName(fileName);
            media.setMimeType("image/png");
            media.setFileSize(imageBytes.length);
            media.setTags(request.prompt()); // Save prompt as tags for search
            mediaRepository.save(media);

            String imageUrl = backendUrl + "/api/v1/media/" + fileKey;
            log.info("Generated image saved at: {}", fileKey);

            return new AIImageResponse(imageUrl);
        } catch (Exception e) {
            log.error("Failed to generate image", e);
            throw new RuntimeException("Failed to generate image", e);
        }
    }

    private String hashPrompt(String prompt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(prompt.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception e) {
            log.error("Failed to hash prompt", e);
            return UUID.randomUUID().toString().substring(0, 16);
        }
    }

    @Override
    public AIImageResponse moveTempImage(UUID tempMediaId, UUID projectId) {
        // No longer needed with new approach - images are saved directly to correct location
        throw new RuntimeException("moveTempImage is deprecated - images are now saved directly to correct location");
    }

    private String callOpenAI(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", maxTokens,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a creative invitation designer. Respond only in valid JSON."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            String responseJson = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // Extract content from OpenAI response
            var responseMap = objectMapper.readValue(responseJson, Map.class);
            var choices = (List<Map<String, Object>>) responseMap.get("choices");
            var message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("OpenAI API call failed", e);
            throw new RuntimeException("AI generation failed", e);
        }
    }

    private String loadPromptTemplate(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load prompt template: {}", path, e);
            return "";
        }
    }
}
