package com.momentpages.ai;

public record AITextRequest(
        String eventType,
        String tone,
        String recipientName,
        String additionalContext
) {}
