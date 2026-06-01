package com.momentpages.response;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentpages.project.Project;
import com.momentpages.project.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ResponseController {

    private final PageResponseRepository responseRepository;
    private final ProjectService projectService;
    private final ObjectMapper objectMapper;

    public ResponseController(
            PageResponseRepository responseRepository,
            ProjectService projectService,
            ObjectMapper objectMapper) {
        this.responseRepository = responseRepository;
        this.projectService = projectService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/public/pages/{slug}/responses")
    public ResponseEntity<?> submitResponse(
            @PathVariable String slug,
            @RequestBody Map<String, Object> body) {
        Project project = projectService.getProjectBySlug(slug);

        if (!"published".equals(project.getStatus())) {
            return ResponseEntity.notFound().build();
        }

        Object fields = body.get("fields");
        String visitorName = (String) body.get("visitorName");

        PageResponse response = new PageResponse();
        response.setProjectId(project.getId());
        response.setVisitorName(visitorName);

        try {
            response.setResponseData(objectMapper.writeValueAsString(fields));
        } catch (JsonProcessingException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid response data"));
        }

        response = responseRepository.save(response);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id", response.getId()));
    }

    @GetMapping("/projects/{projectId}/responses")
    public ResponseEntity<?> getResponses(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);

        List<PageResponse> responses = responseRepository.findByProjectIdOrderBySubmittedAtDesc(projectId);

        List<Map<String, Object>> responseList = responses.stream().map(r -> {
            Object fields = null;
            try {
                fields = objectMapper.readValue(r.getResponseData(), Object.class);
            } catch (Exception e) {
                fields = Map.of();
            }
            return Map.<String, Object>of(
                    "id", r.getId().toString(),
                    "visitorName", r.getVisitorName() != null ? r.getVisitorName() : "",
                    "submittedAt", r.getSubmittedAt().toString(),
                    "fields", fields
            );
        }).toList();

        return ResponseEntity.ok(Map.of(
                "totalResponses", responses.size(),
                "responses", responseList
        ));
    }
}
