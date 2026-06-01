package com.momentpages.ai;

import com.momentpages.project.ProjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
public class AIController {

    private final AIProvider aiProvider;
    private final ProjectService projectService;

    public AIController(AIProvider aiProvider, ProjectService projectService) {
        this.aiProvider = aiProvider;
        this.projectService = projectService;
    }

    public record GenerateTextRequestDTO(
            @NotBlank String projectId,
            @NotBlank String eventType,
            @NotBlank String tone,
            String recipientName,
            String additionalContext
    ) {}

    public record GenerateThemeRequestDTO(
            @NotBlank String projectId,
            @NotBlank String description
    ) {}

    @PostMapping("/generate-text")
    public ResponseEntity<AITextResponse> generateText(
            @RequestHeader("X-Management-Token") String token,
            @Valid @RequestBody GenerateTextRequestDTO dto) {
        projectService.validateManagementToken(UUID.fromString(dto.projectId()), token);

        AITextRequest request = new AITextRequest(
                dto.eventType(), dto.tone(), dto.recipientName(), dto.additionalContext());
        AITextResponse response = aiProvider.generateInvitationText(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-theme")
    public ResponseEntity<AIThemeResponse> generateTheme(
            @RequestHeader("X-Management-Token") String token,
            @Valid @RequestBody GenerateThemeRequestDTO dto) {
        projectService.validateManagementToken(UUID.fromString(dto.projectId()), token);

        AIThemeRequest request = new AIThemeRequest(dto.description());
        AIThemeResponse response = aiProvider.generateTheme(request);
        return ResponseEntity.ok(response);
    }

    public record GeneratePageRequestDTO(
            String projectId,
            @NotBlank String prompt
    ) {}

    @PostMapping("/generate-page")
    public ResponseEntity<AIPageResponse> generatePage(
            @RequestHeader(value = "X-Management-Token", required = false) String token,
            @Valid @RequestBody GeneratePageRequestDTO dto) {
        // If projectId is provided, validate the token
        if (dto.projectId() != null && !dto.projectId().isBlank()) {
            projectService.validateManagementToken(UUID.fromString(dto.projectId()), token);
        }

        AIPageRequest request = new AIPageRequest(dto.prompt());
        AIPageResponse response = aiProvider.generatePage(request);
        return ResponseEntity.ok(response);
    }
}
