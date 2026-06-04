package com.momentpages.ai;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public record AIEditResponse(List<Operation> operations) {
    public record Operation(
            String type, // "add", "delete", "modify", "add-page", "delete-page", "move-to-page", "set-background-image"
            String elementId,
            Optional<Map<String, Object>> element,
            Optional<Integer> targetPage,
            Optional<String> pageName,
            Optional<String> imagePrompt
    ) {}
}
