package com.momentpages.archival;

import com.momentpages.project.Project;
import com.momentpages.project.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ArchivalService {

    private static final Logger log = LoggerFactory.getLogger(ArchivalService.class);

    private final ProjectRepository projectRepository;

    public ArchivalService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    /**
     * Runs daily at 2:00 AM UTC.
     * Archives published pages that have passed their expiry date (event_date + 30 days).
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void archiveExpiredProjects() {
        Instant now = Instant.now();
        List<Project> expired = projectRepository.findExpiredProjects(now);

        if (expired.isEmpty()) {
            return;
        }

        log.info("Archiving {} expired projects", expired.size());

        for (Project project : expired) {
            project.setStatus("archived");
            project.setArchivedAt(now);
            projectRepository.save(project);
            log.debug("Archived project: {}", project.getId());
        }

        log.info("Archival complete. {} projects archived.", expired.size());
    }
}
