package com.momentpages.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectContentRepository extends JpaRepository<ProjectContent, UUID> {

    Optional<ProjectContent> findByProjectIdAndIsCurrentTrue(UUID projectId);

    @Query("SELECT MAX(pc.version) FROM ProjectContent pc WHERE pc.projectId = :projectId")
    Integer findMaxVersionByProjectId(UUID projectId);

    @Modifying
    @Query("UPDATE ProjectContent pc SET pc.isCurrent = false WHERE pc.projectId = :projectId AND pc.isCurrent = true")
    void clearCurrentFlag(UUID projectId);
}
