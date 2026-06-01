-- Custom domains table (Phase 2 implementation)
CREATE TABLE custom_domains (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    domain                  VARCHAR(255) UNIQUE NOT NULL,
    verification_status     VARCHAR(20) NOT NULL DEFAULT 'pending',
    ssl_status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at             TIMESTAMPTZ
);

CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
