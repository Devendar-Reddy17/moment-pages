package com.momentpages.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findByManagementToken(String managementToken);

    Optional<Project> findByPublicSlug(String publicSlug);

    Optional<Project> findByCustomDomain(String customDomain);

    boolean existsByPublicSlug(String publicSlug);

    @Query("SELECT p FROM Project p WHERE p.status = 'published' AND p.expiresAt <= :now")
    List<Project> findExpiredProjects(Instant now);
}
