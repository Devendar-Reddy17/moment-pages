package com.momentpages.project;

import com.momentpages.project.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping("/projects")
    public ResponseEntity<CreateProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {
        CreateProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        Project project = projectService.getProjectById(projectId);
        return ResponseEntity.ok(ProjectResponse.from(project));
    }

    @GetMapping("/projects/by-token")
    public ResponseEntity<ProjectResponse> getProjectByToken(
            @RequestHeader("X-Management-Token") String token) {
        Project project = projectService.getProjectByToken(token);
        return ResponseEntity.ok(ProjectResponse.from(project));
    }

    @GetMapping("/projects/{projectId}/content")
    public ResponseEntity<?> getContent(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        String canvasJson = projectService.getCurrentCanvasJson(projectId);
        if (canvasJson == null) {
            return ResponseEntity.ok(java.util.Map.of("canvasJson", java.util.Map.of()));
        }
        try {
            var jsonNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(canvasJson);
            return ResponseEntity.ok(java.util.Map.of("canvasJson", jsonNode));
        } catch (Exception e) {
            return ResponseEntity.ok(java.util.Map.of("canvasJson", canvasJson));
        }
    }

    @PutMapping("/projects/{projectId}/content")
    public ResponseEntity<ProjectService.ContentSaveResponse> updateContent(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token,
            @Valid @RequestBody UpdateContentRequest request) {
        var response = projectService.saveContent(projectId, token, request.canvasJson());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/projects/{projectId}/settings")
    public ResponseEntity<ProjectResponse> updateSettings(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token,
            @Valid @RequestBody UpdateSettingsRequest request) {
        ProjectResponse response = projectService.updateSettings(projectId, token, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/projects/{projectId}/publish")
    public ResponseEntity<?> publishProject(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        // TODO: Create Stripe Checkout Session and return URL
        // For now, publish directly (will be replaced with Stripe flow)
        projectService.publishProject(projectId);
        Project project = projectService.getProjectById(projectId);
        return ResponseEntity.ok(java.util.Map.of(
                "publicSlug", project.getPublicSlug(),
                "publicUrl", "https://momentpages.com/p/" + project.getPublicSlug()
        ));
    }

    @PostMapping("/projects/{projectId}/reactivate")
    public ResponseEntity<?> reactivateProject(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        // TODO: Create Stripe Checkout Session for reactivation
        projectService.reactivateProject(projectId);
        return ResponseEntity.ok(java.util.Map.of("status", "reactivated"));
    }

    @PostMapping("/projects/{projectId}/template")
    public ResponseEntity<?> saveAsTemplate(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        String templateId = projectService.saveAsTemplate(projectId);
        return ResponseEntity.ok(java.util.Map.of("templateId", templateId));
    }
}
