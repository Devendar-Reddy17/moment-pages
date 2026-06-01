CREATE TABLE projects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_slug         VARCHAR(12) UNIQUE,
    management_token    VARCHAR(128) UNIQUE NOT NULL,
    title               VARCHAR(255),
    event_type          VARCHAR(50) NOT NULL,
    event_date          TIMESTAMPTZ,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
    password_hash       VARCHAR(255),
    custom_domain       VARCHAR(255),
    template_id         UUID,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at        TIMESTAMPTZ,
    archived_at         TIMESTAMPTZ,
    expires_at          TIMESTAMPTZ
);

CREATE INDEX idx_projects_slug ON projects(public_slug);
CREATE INDEX idx_projects_token ON projects(management_token);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_custom_domain ON projects(custom_domain);
CREATE INDEX idx_projects_expires_at ON projects(expires_at) WHERE status = 'published';
