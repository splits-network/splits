-- ATS Integrations — Phase 6
-- Company-level ATS platform connections with sync tracking

-- ─── ATS Integrations (company-level) ─────────────────────────────────────
CREATE TABLE ats_integrations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL,
    platform        TEXT NOT NULL CHECK (platform IN ('greenhouse', 'lever', 'workable', 'ashby', 'generic')),
    api_key_encrypted TEXT,                          -- never exposed to frontend
    api_base_url    TEXT,
    webhook_url     TEXT,
    webhook_secret  TEXT,
    sync_enabled    BOOLEAN NOT NULL DEFAULT false,
    sync_roles      BOOLEAN NOT NULL DEFAULT true,
    sync_candidates BOOLEAN NOT NULL DEFAULT true,
    sync_applications BOOLEAN NOT NULL DEFAULT true,
    sync_interviews BOOLEAN NOT NULL DEFAULT false,
    last_synced_at  TIMESTAMPTZ,
    last_sync_error TEXT,
    config          JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_ats_integrations_company_platform
    ON ats_integrations (company_id, platform);

CREATE INDEX idx_ats_integrations_sync_enabled
    ON ats_integrations (sync_enabled)
    WHERE sync_enabled = true;

-- ─── External Entity Mapping ──────────────────────────────────────────────
-- Bidirectional ID mapping: Splits ID ↔ ATS ID
CREATE TABLE ats_entity_map (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id  UUID NOT NULL REFERENCES ats_integrations(id) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL CHECK (entity_type IN ('role', 'candidate', 'application', 'stage', 'interview')),
    internal_id     TEXT NOT NULL,
    external_id     TEXT NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_ats_entity_map_internal
    ON ats_entity_map (integration_id, entity_type, internal_id);

CREATE UNIQUE INDEX uq_ats_entity_map_external
    ON ats_entity_map (integration_id, entity_type, external_id);

-- ─── Sync Log ─────────────────────────────────────────────────────────────
CREATE TABLE ats_sync_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id  UUID NOT NULL REFERENCES ats_integrations(id) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,
    entity_id       TEXT,
    external_id     TEXT,
    action          TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'skipped')),
    direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status          TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'conflict')),
    error_message   TEXT,
    error_code      TEXT,
    request_payload JSONB,
    response_payload JSONB,
    retry_count     INT NOT NULL DEFAULT 0,
    synced_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ats_sync_log_integration
    ON ats_sync_log (integration_id, synced_at DESC);

CREATE INDEX idx_ats_sync_log_status
    ON ats_sync_log (status)
    WHERE status IN ('failed', 'conflict');

-- ─── Sync Queue ───────────────────────────────────────────────────────────
CREATE TABLE ats_sync_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id  UUID NOT NULL REFERENCES ats_integrations(id) ON DELETE CASCADE,
    entity_type     TEXT NOT NULL,
    entity_id       TEXT NOT NULL,
    action          TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    priority        INT NOT NULL DEFAULT 5,
    payload         JSONB NOT NULL DEFAULT '{}',
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count     INT NOT NULL DEFAULT 0,
    max_retries     INT NOT NULL DEFAULT 3,
    last_error      TEXT,
    scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ats_sync_queue_pending
    ON ats_sync_queue (priority, scheduled_at)
    WHERE status = 'pending';

-- ─── Seed ATS providers ──────────────────────────────────────────────────
INSERT INTO integration_providers (slug, name, category, icon, description, oauth_scopes, sort_order) VALUES
(
    'greenhouse',
    'Greenhouse',
    'ats',
    'fa-duotone fa-regular fa-seedling',
    'Sync candidates, jobs, and applications with Greenhouse ATS',
    ARRAY[]::TEXT[],
    10
),
(
    'lever',
    'Lever',
    'ats',
    'fa-duotone fa-regular fa-arrows-up-down',
    'Sync candidates, opportunities, and pipeline stages with Lever',
    ARRAY[]::TEXT[],
    11
),
(
    'workable',
    'Workable',
    'ats',
    'fa-duotone fa-regular fa-briefcase',
    'Sync candidates and job postings with Workable',
    ARRAY[]::TEXT[],
    12
),
(
    'ashby',
    'Ashby',
    'ats',
    'fa-duotone fa-regular fa-chart-mixed',
    'Sync recruiting data with Ashby',
    ARRAY[]::TEXT[],
    13
);

-- ─── Updated_at triggers ──────────────────────────────────────────────────
CREATE TRIGGER trg_ats_integrations_updated_at
    BEFORE UPDATE ON ats_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ats_entity_map_updated_at
    BEFORE UPDATE ON ats_entity_map
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ──────────────────────────────────────────────────────────────────
ALTER TABLE ats_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_entity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats_sync_queue ENABLE ROW LEVEL SECURITY;
