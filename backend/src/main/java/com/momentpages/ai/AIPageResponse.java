package com.momentpages.ai;

import java.util.List;
import java.util.Map;

public record AIPageResponse(
        Canvas canvas,
        List<Map<String, Object>> elements
) {
    public record Canvas(int width, int height, String backgroundColor) {}
}
