package com.momentpages.ai;

import java.util.List;

public record AITextResponse(List<Suggestion> suggestions) {

    public record Suggestion(String title, String body, String cta) {}
}
