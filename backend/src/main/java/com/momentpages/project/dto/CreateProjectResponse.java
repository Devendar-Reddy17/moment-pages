package com.momentpages.project.dto;

public record CreateProjectResponse(
        String projectId,
        String managementToken,
        String managementUrl,
        String editorUrl
) {}
