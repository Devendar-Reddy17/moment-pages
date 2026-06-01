package com.momentpages.project;

import com.momentpages.common.util.TokenGenerator;
import com.momentpages.project.dto.CreateProjectRequest;
import com.momentpages.project.dto.CreateProjectResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void createProject_shouldGenerateManagementToken() {
        CreateProjectRequest request = new CreateProjectRequest("birthday", null);
        CreateProjectResponse response = projectService.createProject(request);

        assertNotNull(response.projectId());
        assertNotNull(response.managementToken());
        assertTrue(response.managementToken().length() > 50);
        assertTrue(response.managementUrl().contains("/manage/"));
        assertTrue(response.editorUrl().contains("/edit/"));
    }

    @Test
    void createProject_shouldPersistWithDraftStatus() {
        CreateProjectRequest request = new CreateProjectRequest("dinner", null);
        CreateProjectResponse response = projectService.createProject(request);

        Project project = projectRepository.findById(
                java.util.UUID.fromString(response.projectId())).orElseThrow();
        assertEquals("draft", project.getStatus());
        assertEquals("dinner", project.getEventType());
        assertNull(project.getPublicSlug());
    }

    @Test
    void publishProject_shouldGenerateSlug() {
        CreateProjectRequest request = new CreateProjectRequest("coffee", null);
        CreateProjectResponse response = projectService.createProject(request);

        java.util.UUID projectId = java.util.UUID.fromString(response.projectId());
        projectService.publishProject(projectId);

        Project project = projectRepository.findById(projectId).orElseThrow();
        assertEquals("published", project.getStatus());
        assertNotNull(project.getPublicSlug());
        assertEquals(8, project.getPublicSlug().length());
        assertNotNull(project.getPublishedAt());
        assertNotNull(project.getExpiresAt());
    }

    @Test
    void validateManagementToken_shouldThrowOnInvalidToken() {
        CreateProjectRequest request = new CreateProjectRequest("proposal", null);
        CreateProjectResponse response = projectService.createProject(request);

        java.util.UUID projectId = java.util.UUID.fromString(response.projectId());

        assertDoesNotThrow(() ->
                projectService.validateManagementToken(projectId, response.managementToken()));

        assertThrows(Exception.class, () ->
                projectService.validateManagementToken(projectId, "wrong-token"));
    }
}
