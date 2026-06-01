package com.momentpages.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateRepository extends JpaRepository<Template, UUID> {

    List<Template> findByEventTypeAndIsActiveTrueOrderBySortOrder(String eventType);

    List<Template> findByIsActiveTrueOrderBySortOrder();

    boolean existsBySlug(String slug);
}
