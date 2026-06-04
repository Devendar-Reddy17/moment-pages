package com.momentpages.project.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateProjectRequest(
        @NotBlank(message = "Event type is required")
        String eventType,
        String templateId,
        String canvasJson,
        UUID projectId
) {}
