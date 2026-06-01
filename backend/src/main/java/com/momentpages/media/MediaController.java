package com.momentpages.media;

import com.momentpages.project.ProjectService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/media")
public class MediaController {

    private final MediaService mediaService;
    private final ProjectService projectService;

    public MediaController(MediaService mediaService, ProjectService projectService) {
        this.mediaService = mediaService;
        this.projectService = projectService;
    }

    public record UploadUrlRequest(
            @NotBlank String fileName,
            @NotBlank String mimeType,
            @Positive long fileSize
    ) {}

    @PostMapping("/upload-url")
    public ResponseEntity<?> requestUploadUrl(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token,
            @Valid @RequestBody UploadUrlRequest request) {
        projectService.validateManagementToken(projectId, token);

        var result = mediaService.generateUploadUrl(
                projectId, request.fileName(), request.mimeType(), request.fileSize());

        return ResponseEntity.ok(Map.of(
                "uploadUrl", result.uploadUrl(),
                "mediaId", result.mediaId(),
                "fileKey", result.fileKey()
        ));
    }

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadDirect(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token,
            @RequestParam("file") MultipartFile file) {
        projectService.validateManagementToken(projectId, token);

        try {
            String publicUrl = mediaService.uploadDirect(
                    projectId,
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload",
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                    file.getBytes()
            );
            return ResponseEntity.ok(Map.of("publicUrl", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{mediaId}/confirm")
    public ResponseEntity<?> confirmUpload(
            @PathVariable UUID projectId,
            @PathVariable UUID mediaId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);

        String publicUrl = mediaService.confirmUpload(projectId, mediaId);
        return ResponseEntity.ok(Map.of("publicUrl", publicUrl));
    }

    @GetMapping
    public ResponseEntity<?> listMedia(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);

        List<Media> mediaList = mediaService.listMedia(projectId);
        var response = mediaList.stream().map(m -> Map.of(
                "id", m.getId().toString(),
                "fileName", m.getFileName(),
                "mimeType", m.getMimeType(),
                "fileSize", m.getFileSize(),
                "publicUrl", mediaService.buildPublicUrl(m.getFileKey()),
                "uploadedAt", m.getUploadedAt().toString()
        )).toList();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @PathVariable UUID projectId,
            @PathVariable UUID mediaId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);
        mediaService.deleteMedia(projectId, mediaId);
        return ResponseEntity.noContent().build();
    }
}
