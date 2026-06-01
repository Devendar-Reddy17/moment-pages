package com.momentpages.ai;

import java.util.List;

public record AIThemeResponse(
        List<String> colorPalette,
        Typography typography,
        String layoutSuggestion,
        String backgroundPrompt
) {
    public record Typography(String heading, String body) {}
}
