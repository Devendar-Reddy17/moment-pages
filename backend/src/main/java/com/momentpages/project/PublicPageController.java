package com.momentpages.project;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentpages.common.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/pages")
public class PublicPageController {

    private final ProjectService projectService;
    private final ObjectMapper objectMapper;

    public PublicPageController(ProjectService projectService, ObjectMapper objectMapper) {
        this.projectService = projectService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getPublicPage(@PathVariable String slug) {
        Project project;
        try {
            project = projectService.getProjectBySlug(slug);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }

        if ("archived".equals(project.getStatus())) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "This page has been archived"));
        }

        if ("draft".equals(project.getStatus())) {
            return ResponseEntity.notFound().build();
        }

        boolean requiresPassword = project.getPasswordHash() != null;

        if (requiresPassword) {
            return ResponseEntity.ok(Map.of(
                    "title", project.getTitle() != null ? project.getTitle() : "",
                    "eventType", project.getEventType(),
                    "requiresPassword", true
            ));
        }

        String canvasJson = projectService.getCurrentCanvasJson(project.getId());
        Object parsedCanvas = null;
        try {
            parsedCanvas = canvasJson != null ? objectMapper.readValue(canvasJson, Object.class) : Map.of();
        } catch (Exception e) {
            parsedCanvas = Map.of();
        }

        return ResponseEntity.ok(Map.of(
                "title", project.getTitle() != null ? project.getTitle() : "",
                "eventType", project.getEventType(),
                "requiresPassword", false,
                "canvasJson", parsedCanvas
        ));
    }

    @PostMapping("/{slug}/unlock")
    public ResponseEntity<?> unlockPage(
            @PathVariable String slug,
            @RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password required"));
        }

        if (!projectService.verifyPagePassword(slug, password)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Incorrect password"));
        }

        Project project = projectService.getProjectBySlug(slug);
        String canvasJson = projectService.getCurrentCanvasJson(project.getId());
        Object parsedCanvas = null;
        try {
            parsedCanvas = canvasJson != null ? objectMapper.readValue(canvasJson, Object.class) : Map.of();
        } catch (Exception e) {
            parsedCanvas = Map.of();
        }

        return ResponseEntity.ok(Map.of(
                "title", project.getTitle() != null ? project.getTitle() : "",
                "eventType", project.getEventType(),
                "requiresPassword", false,
                "canvasJson", parsedCanvas
        ));
    }
}
