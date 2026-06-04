package com.momentpages.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class PIIDetectionService {

    private static final Logger log = LoggerFactory.getLogger(PIIDetectionService.class);

    // Common PII patterns for quick detection
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"
    );
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "\\b\\+?[1-9]?\\d{1,14}\\b|\\(\\d{3}\\)\\s?\\d{3}-?\\d{4}"
    );
    private static final Pattern SSN_PATTERN = Pattern.compile(
        "\\b\\d{3}-?\\d{2}-?\\d{4}\\b"
    );
    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile(
        "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b"
    );
    private static final Pattern ADDRESS_PATTERN = Pattern.compile(
        "\\b\\d+\\s+[A-Za-z]+\\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\\b"
    );

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public PIIDetectionService(
            @Value("${openai.api-key}") String apiKey,
            ObjectMapper objectMapper) {
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
    }

    public boolean containsPII(String text) {
        // First pass: regex-based detection for common PII
        if (detectsWithRegex(text)) {
            log.info("PII detected via regex in prompt");
            return true;
        }
        
        // Second pass: OpenAI confirmation for subtle PII (names, etc.)
        return confirmWithOpenAI(text);
    }

    private boolean detectsWithRegex(String text) {
        return EMAIL_PATTERN.matcher(text).find() ||
               PHONE_PATTERN.matcher(text).find() ||
               SSN_PATTERN.matcher(text).find() ||
               CREDIT_CARD_PATTERN.matcher(text).find() ||
               ADDRESS_PATTERN.matcher(text).find();
    }

    private boolean confirmWithOpenAI(String text) {
        try {
            String prompt = "Analyze this text for personally identifiable information (PII) including names, emails, phone numbers, addresses, etc. " +
                           "Respond with ONLY 'YES' if PII is present or 'NO' if not. Text: \"" + text + "\"";

            String response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(Map.of(
                        "model", "gpt-4o-mini",
                        "messages", List.of(Map.of("role", "user", "content", prompt)),
                        "max_tokens", 10
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            boolean hasPII = content.trim().equalsIgnoreCase("YES");
            log.info("OpenAI PII confirmation result: {} for prompt: {}", hasPII, text);
            return hasPII;
        } catch (Exception e) {
            log.error("Failed to confirm PII with OpenAI, assuming PII present for safety", e);
            return true; // Fail safe: assume PII if confirmation fails
        }
    }
}
