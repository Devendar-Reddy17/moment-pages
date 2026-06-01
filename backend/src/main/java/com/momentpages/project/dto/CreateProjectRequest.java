package com.momentpages.project.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateProjectRequest(
        @NotBlank(message = "Event type is required")
        String eventType,
        String templateId,
        String canvasJson
) {}
