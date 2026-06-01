package com.momentpages.project.dto;

import com.momentpages.project.Project;

import java.time.Instant;

public record ProjectResponse(
        String id,
        String publicSlug,
        String title,
        String eventType,
        Instant eventDate,
        String status,
        boolean hasPassword,
        String customDomain,
        String templateId,
        Instant createdAt,
        Instant updatedAt,
        Instant publishedAt,
        Instant archivedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId().toString(),
                project.getPublicSlug(),
                project.getTitle(),
                project.getEventType(),
                project.getEventDate(),
                project.getStatus(),
                project.getPasswordHash() != null,
                project.getCustomDomain(),
                project.getTemplateId() != null ? project.getTemplateId().toString() : null,
                project.getCreatedAt(),
                project.getUpdatedAt(),
                project.getPublishedAt(),
                project.getArchivedAt()
        );
    }
}
