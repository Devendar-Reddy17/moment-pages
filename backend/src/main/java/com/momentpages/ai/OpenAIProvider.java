package com.momentpages.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIProvider implements AIProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAIProvider.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String model;
    private final int maxTokens;

    public OpenAIProvider(
            @Value("${openai.api-key}") String apiKey,
            @Value("${openai.model}") String model,
            @Value("${openai.max-tokens}") int maxTokens,
            ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
        this.objectMapper = objectMapper;
        this.model = model;
        this.maxTokens = maxTokens;
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
