CREATE TABLE payments (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id              UUID NOT NULL REFERENCES projects(id),
    stripe_session_id       VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_intent   VARCHAR(255),
    amount_cents            INT NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'gbp',
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_type            VARCHAR(30) NOT NULL,
    metadata                JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at            TIMESTAMPTZ
);

CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_stripe ON payments(stripe_session_id);
