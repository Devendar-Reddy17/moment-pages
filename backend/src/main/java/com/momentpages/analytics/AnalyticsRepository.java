package com.momentpages.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, UUID> {

    long countByProjectIdAndEventType(UUID projectId, String eventType);

    @Query("SELECT COUNT(DISTINCT ae.visitorHash) FROM AnalyticsEvent ae WHERE ae.projectId = :projectId AND ae.eventType = 'view'")
    long countUniqueViews(UUID projectId);

    @Query(value = "SELECT DATE(created_at) as date, COUNT(*) as count FROM analytics_events " +
            "WHERE project_id = :projectId AND event_type = 'view' " +
            "GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30", nativeQuery = true)
    List<Object[]> getViewsByDay(UUID projectId);
}
