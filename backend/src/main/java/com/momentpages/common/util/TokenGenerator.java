package com.momentpages.common.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

@Component
public class TokenGenerator {

    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();

    @Value("${app.management-token-length:64}")
    private int tokenByteLength;

    /**
     * Generates a cryptographically secure management token.
     * 64 bytes → ~86 character Base64URL string.
     */
    public String generateManagementToken() {
        byte[] bytes = new byte[tokenByteLength];
        secureRandom.nextBytes(bytes);
        return encoder.encodeToString(bytes);
    }

    /**
     * Generates a short public slug (8 characters, alphanumeric).
     */
    public String generatePublicSlug() {
        String chars = "abcdefghijkmnopqrstuvwxyz23456789"; // no ambiguous chars (0, O, l, 1)
        StringBuilder sb = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
