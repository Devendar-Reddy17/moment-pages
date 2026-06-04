package com.momentpages.media;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {

    List<Media> findByProjectIdOrderByUploadedAtDesc(UUID projectId);

    long countByProjectId(UUID projectId);

    Optional<Media> findByFileKey(String fileKey);

    List<Media> findByFileKeyStartingWithOrderByUploadedAtDesc(String fileKeyPrefix);
}
