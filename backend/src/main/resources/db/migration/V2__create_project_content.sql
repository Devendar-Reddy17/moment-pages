CREATE TABLE project_content (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version         INT NOT NULL DEFAULT 1,
    canvas_json     JSONB NOT NULL,
    is_current      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_project ON project_content(project_id);
CREATE UNIQUE INDEX idx_content_current ON project_content(project_id) WHERE is_current = TRUE;
