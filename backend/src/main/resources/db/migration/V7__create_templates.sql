CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    event_type      VARCHAR(50) NOT NULL,
    category        VARCHAR(50),
    canvas_json     JSONB NOT NULL,
    thumbnail_url   VARCHAR(512),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_type ON templates(event_type);

-- Add FK to projects table now that templates exists
ALTER TABLE projects ADD CONSTRAINT fk_projects_template
    FOREIGN KEY (template_id) REFERENCES templates(id);
