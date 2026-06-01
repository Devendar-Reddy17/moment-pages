package com.momentpages.project.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateContentRequest(
        @NotNull(message = "Canvas JSON is required")
        Object canvasJson
) {}
