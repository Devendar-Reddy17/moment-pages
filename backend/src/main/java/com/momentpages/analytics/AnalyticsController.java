package com.momentpages.analytics;

import com.momentpages.project.Project;
import com.momentpages.project.ProjectService;
import com.momentpages.response.PageResponseRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class AnalyticsController {

    private final AnalyticsRepository analyticsRepository;
    private final ProjectService projectService;
    private final PageResponseRepository responseRepository;

    public AnalyticsController(
            AnalyticsRepository analyticsRepository,
            ProjectService projectService,
            PageResponseRepository responseRepository) {
        this.analyticsRepository = analyticsRepository;
        this.projectService = projectService;
        this.responseRepository = responseRepository;
    }

    @PostMapping("/public/pages/{slug}/analytics")
    public ResponseEntity<Void> recordEvent(
            @PathVariable String slug,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Project project = projectService.getProjectBySlug(slug);

        String eventType = body.get("eventType");
        if (eventType == null || eventType.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        AnalyticsEvent event = new AnalyticsEvent();
        event.setProjectId(project.getId());
        event.setEventType(eventType);
        event.setVisitorHash(hashVisitor(request));

        analyticsRepository.save(event);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/projects/{projectId}/analytics")
    public ResponseEntity<?> getAnalytics(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);

        long totalViews = analyticsRepository.countByProjectIdAndEventType(projectId, "view");
        long uniqueViews = analyticsRepository.countUniqueViews(projectId);
        long unlocks = analyticsRepository.countByProjectIdAndEventType(projectId, "unlock");
        long totalResponses = responseRepository.countByProjectId(projectId);

        List<Object[]> viewsByDayRaw = analyticsRepository.getViewsByDay(projectId);
        List<Map<String, Object>> viewsByDay = viewsByDayRaw.stream()
                .map(row -> Map.<String, Object>of("date", row[0].toString(), "count", ((Number) row[1]).longValue()))
                .toList();

        return ResponseEntity.ok(Map.of(
                "totalViews", totalViews,
                "uniqueViews", uniqueViews,
                "unlocks", unlocks,
                "totalResponses", totalResponses,
                "viewsByDay", viewsByDay
        ));
    }

    private String hashVisitor(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        String ua = request.getHeader("User-Agent");
        String raw = ip + "|" + (ua != null ? ua : "");
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash).substring(0, 32);
        } catch (NoSuchAlgorithmException e) {
            return raw.hashCode() + "";
        }
    }
}
