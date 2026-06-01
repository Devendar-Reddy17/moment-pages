CREATE TABLE analytics_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    event_type      VARCHAR(30) NOT NULL,
    visitor_hash    VARCHAR(64),
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_project ON analytics_events(project_id);
CREATE INDEX idx_analytics_type ON analytics_events(project_id, event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
