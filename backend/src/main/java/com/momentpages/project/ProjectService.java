package com.momentpages.project;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentpages.common.exception.BadRequestException;
import com.momentpages.common.exception.ResourceNotFoundException;
import com.momentpages.common.exception.UnauthorizedException;
import com.momentpages.common.util.TokenGenerator;
import com.momentpages.project.dto.*;
import com.momentpages.template.Template;
import com.momentpages.template.TemplateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectContentRepository contentRepository;
    private final TemplateRepository templateRepository;
    private final TokenGenerator tokenGenerator;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public ProjectService(
            ProjectRepository projectRepository,
            ProjectContentRepository contentRepository,
            TemplateRepository templateRepository,
            TokenGenerator tokenGenerator,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper) {
        this.projectRepository = projectRepository;
        this.contentRepository = contentRepository;
        this.templateRepository = templateRepository;
        this.tokenGenerator = tokenGenerator;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CreateProjectResponse createProject(CreateProjectRequest request) {
        Project project = new Project();
        
        // Use provided projectId if available, otherwise generate new one
        if (request.projectId() != null) {
            project.setId(request.projectId());
        }
        
        project.setEventType(request.eventType());
        project.setManagementToken(tokenGenerator.generateManagementToken());

        String canvasJson = null;

        // Prefer frontend-generated canvas JSON
        if (request.canvasJson() != null && !request.canvasJson().isBlank()) {
            canvasJson = request.canvasJson();
        }

        // Fallback: look up template by slug and copy its canvas JSON
        if (canvasJson == null && request.templateId() != null && !request.templateId().isBlank()) {
            Optional<Template> templateOpt = templateRepository.findAll().stream()
                    .filter(t -> t.getSlug() != null && t.getSlug().equalsIgnoreCase(request.templateId()))
                    .findFirst();
            if (templateOpt.isPresent()) {
                Template template = templateOpt.get();
                project.setTemplateId(template.getId());
                canvasJson = template.getCanvasJson();
            }
        }

        project = projectRepository.save(project);

        // If a template was found, copy its canvas JSON as initial content
        if (canvasJson != null && !canvasJson.isBlank()) {
            ProjectContent content = new ProjectContent();
            content.setProjectId(project.getId());
            content.setVersion(1);
            content.setCanvasJson(canvasJson);
            content.setCurrent(true);
            contentRepository.save(content);
        }

        String managementUrl = frontendUrl + "/manage/" + project.getManagementToken();
        String editorUrl = frontendUrl + "/edit/" + project.getId();

        return new CreateProjectResponse(
                project.getId().toString(),
                project.getManagementToken(),
                managementUrl,
                editorUrl
        );
    }

    public Project getProjectById(UUID projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    public Project getProjectByToken(String token) {
        return projectRepository.findByManagementToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    public Project getProjectBySlug(String slug) {
        return projectRepository.findByPublicSlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Page not found"));
    }

    public void validateManagementToken(UUID projectId, String token) {
        Project project = getProjectById(projectId);
        if (!project.getManagementToken().equals(token)) {
            throw new UnauthorizedException("Invalid management token");
        }
    }

    @Transactional
    public ContentSaveResponse saveContent(UUID projectId, String token, Object canvasJson) {
        validateManagementToken(projectId, token);

        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(canvasJson);
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Invalid canvas JSON");
        }

        // Clear current flag on existing content
        contentRepository.clearCurrentFlag(projectId);

        // Determine next version
        Integer maxVersion = contentRepository.findMaxVersionByProjectId(projectId);
        int nextVersion = (maxVersion != null ? maxVersion : 0) + 1;

        // Save new content
        ProjectContent content = new ProjectContent();
        content.setProjectId(projectId);
        content.setVersion(nextVersion);
        content.setCanvasJson(jsonString);
        content.setCurrent(true);
        contentRepository.save(content);

        return new ContentSaveResponse(nextVersion, Instant.now());
    }

    public String getCurrentCanvasJson(UUID projectId) {
        return contentRepository.findByProjectIdAndIsCurrentTrue(projectId)
                .map(ProjectContent::getCanvasJson)
                .orElse(null);
    }

    @Transactional
    public ProjectResponse updateSettings(UUID projectId, String token, UpdateSettingsRequest request) {
        validateManagementToken(projectId, token);
        Project project = getProjectById(projectId);

        if (request.title() != null) {
            project.setTitle(request.title());
        }
        if (request.eventDate() != null) {
            project.setEventDate(request.eventDate());
        }
        if (request.password() != null && !request.password().isBlank()) {
            project.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (Boolean.TRUE.equals(request.removePassword())) {
            project.setPasswordHash(null);
        }

        project = projectRepository.save(project);
        return ProjectResponse.from(project);
    }

    @Transactional
    public void publishProject(UUID projectId) {
        Project project = getProjectById(projectId);

        // Generate unique public slug
        String slug;
        do {
            slug = tokenGenerator.generatePublicSlug();
        } while (projectRepository.existsByPublicSlug(slug));

        project.setPublicSlug(slug);
        project.setStatus("published");
        project.setPublishedAt(Instant.now());

        // Set expiry: event date + 30 days, or published + 365 days if no event date
        if (project.getEventDate() != null) {
            project.setExpiresAt(project.getEventDate().plusSeconds(30L * 24 * 60 * 60));
        } else {
            project.setExpiresAt(Instant.now().plusSeconds(365L * 24 * 60 * 60));
        }

        projectRepository.save(project);
    }

    @Transactional
    public void archiveProject(UUID projectId) {
        Project project = getProjectById(projectId);
        project.setStatus("archived");
        project.setArchivedAt(Instant.now());
        projectRepository.save(project);
    }

    @Transactional
    public void reactivateProject(UUID projectId) {
        Project project = getProjectById(projectId);
        project.setStatus("published");
        project.setArchivedAt(null);

        // Reset expiry: 365 days from now
        project.setExpiresAt(Instant.now().plusSeconds(365L * 24 * 60 * 60));
        projectRepository.save(project);
    }

    @Transactional
    public String saveAsTemplate(UUID projectId) {
        Project project = getProjectById(projectId);
        String canvasJson = getCurrentCanvasJson(projectId);
        if (canvasJson == null || canvasJson.isBlank()) {
            throw new BadRequestException("Project has no content to save as template");
        }

        try {
            var root = objectMapper.readTree(canvasJson);
            var canvasNode = root.path("canvas");
            var elementsNode = root.path("elements");

            // Extract background color
            String backgroundColor = canvasNode.path("backgroundColor").asText("#ffffff");

            // Try to find primary color from first shape element
            String primaryColor = "#64748b";
            String accentColor = "#94a3b8";
            String surfaceColor = "#e2e8f0";

            for (var el : elementsNode) {
                if ("shape".equals(el.path("type").asText())) {
                    var shapeContent = el.path("content");
                    String fill = shapeContent.path("fill").asText();
                    if (!fill.isEmpty() && !"#ffffff".equals(fill) && !"#f8fafc".equals(fill)) {
                        primaryColor = fill;
                        accentColor = fill;
                        surfaceColor = fill + "33"; // 20% opacity approximation
                        break;
                    }
                }
            }

            // Try to infer font sizes from text elements
            int titleSize = 56;
            int subtitleSize = 24;
            int headingSize = 22;
            int bodySize = 18;
            int labelSize = 16;

            for (var el : elementsNode) {
                if ("text".equals(el.path("type").asText())) {
                    var textContent = el.path("content");
                    int fs = textContent.path("fontSize").asInt(16);
                    if (fs >= 48) titleSize = fs;
                    else if (fs >= 28) subtitleSize = fs;
                    else if (fs >= 20) headingSize = fs;
                    else if (fs >= 16) bodySize = fs;
                    else labelSize = fs;
                }
            }

            // Determine page count from canvas JSON
            int pageCount = 1;
            var pagesNode = root.path("pages");
            if (pagesNode.isArray() && pagesNode.size() > 0) {
                pageCount = pagesNode.size();
            }

            // Build layout definition JSON
            var layoutDef = objectMapper.createObjectNode();
            layoutDef.put("layoutType", "invitation-vertical"); // default
            layoutDef.put("pageCount", pageCount);

            var colors = layoutDef.putObject("colors");
            colors.put("primary", primaryColor);
            colors.put("background", backgroundColor);
            colors.put("accent", accentColor);
            colors.put("surface", surfaceColor);

            var typography = layoutDef.putObject("typography");
            typography.put("titleSize", titleSize);
            typography.put("subtitleSize", subtitleSize);
            typography.put("headingSize", headingSize);
            typography.put("bodySize", bodySize);
            typography.put("labelSize", labelSize);

            // Generate unique slug
            String baseSlug = project.getTitle() != null
                    ? project.getTitle().toLowerCase().replaceAll("[^a-z0-9]", "-")
                    : "community";
            String slug = baseSlug;
            int counter = 1;
            while (templateRepository.existsBySlug(slug)) {
                slug = baseSlug + "-" + counter++;
            }

            Template template = new Template();
            template.setName(project.getTitle() != null ? project.getTitle() : "Community Template");
            template.setEventType(project.getEventType());
            template.setCategory("community");
            template.setSlug(slug);
            template.setLayoutDefinition(objectMapper.writeValueAsString(layoutDef));
            template.setActive(true);
            template.setSortOrder(100); // community templates after built-ins

            template = templateRepository.save(template);
            return template.getId().toString();
        } catch (JsonProcessingException e) {
            throw new BadRequestException("Invalid canvas JSON");
        }
    }

    public boolean verifyPagePassword(String slug, String password) {
        Project project = getProjectBySlug(slug);
        if (project.getPasswordHash() == null) {
            return true; // No password set
        }
        return passwordEncoder.matches(password, project.getPasswordHash());
    }

    public record ContentSaveResponse(int version, Instant savedAt) {}
}
