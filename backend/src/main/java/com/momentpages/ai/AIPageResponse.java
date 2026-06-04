package com.momentpages.ai;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public record AIPageResponse(
        Canvas canvas,
        List<Page> pages
) {
    public record Canvas(int width, int height, String backgroundColor, Optional<String> backgroundImagePrompt) {}
    public record Page(String name, List<Map<String, Object>> elements) {}
}
