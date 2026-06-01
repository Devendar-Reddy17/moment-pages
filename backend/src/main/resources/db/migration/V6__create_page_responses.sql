CREATE TABLE page_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    response_data   JSONB NOT NULL,
    visitor_name    VARCHAR(255),
    visitor_hash    VARCHAR(64),
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_responses_project ON page_responses(project_id);
CREATE INDEX idx_responses_submitted ON page_responses(project_id, submitted_at);
