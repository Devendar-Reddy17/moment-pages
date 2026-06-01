package com.momentpages.template;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/templates")
public class TemplateController {

    private final TemplateRepository templateRepository;

    public TemplateController(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @GetMapping
    public ResponseEntity<?> listTemplates(
            @RequestParam(required = false) String eventType) {

        List<Template> templates;
        if (eventType != null && !eventType.isBlank()) {
            templates = templateRepository.findByEventTypeAndIsActiveTrueOrderBySortOrder(eventType);
        } else {
            templates = templateRepository.findByIsActiveTrueOrderBySortOrder();
        }

        var response = templates.stream().map(t -> Map.of(
                "id", t.getId().toString(),
                "slug", t.getSlug() != null ? t.getSlug() : "",
                "name", t.getName(),
                "eventType", t.getEventType(),
                "category", t.getCategory() != null ? t.getCategory() : "free",
                "thumbnailUrl", t.getThumbnailUrl() != null ? t.getThumbnailUrl() : "",
                "layoutDefinition", t.getLayoutDefinition() != null ? t.getLayoutDefinition() : ""
        )).toList();

        return ResponseEntity.ok(response);
    }
}
