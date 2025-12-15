-- Migration: ATS Integrations (Phase 4C)
-- Description: Enable bidirectional synchronization with ATS platforms
-- Date: 2025-12-15

-- Create integrations table
CREATE TABLE IF NOT EXISTS ats.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES ats.companies(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('greenhouse', 'lever', 'workable', 'ashby', 'generic')),
    api_key_encrypted TEXT NOT NULL, -- Encrypted with application secret
    api_base_url TEXT, -- For generic integrations or custom endpoints
    webhook_url TEXT, -- ATS webhook endpoint (for receiving updates)
    webhook_secret TEXT, -- Secret for verifying webhook signatures
    sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sync_roles BOOLEAN NOT NULL DEFAULT TRUE,
    sync_candidates BOOLEAN NOT NULL DEFAULT TRUE,
    sync_applications BOOLEAN NOT NULL DEFAULT TRUE,
    sync_interviews BOOLEAN NOT NULL DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ,
    last_sync_error TEXT,
    config JSONB DEFAULT '{}', -- Platform-specific configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(company_id, platform) -- One integration per platform per company
);

-- Create sync logs table
CREATE TABLE IF NOT EXISTS ats.sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ats.integrations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('role', 'candidate', 'application', 'stage', 'interview')),
    entity_id UUID, -- ID in our system (nullable if entity creation failed)
    external_id TEXT, -- ID in ATS system
    action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'skipped')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')), -- ATS → Splits or Splits → ATS
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'conflict')),
    error_message TEXT,
    error_code TEXT,
    request_payload JSONB, -- Data sent/received
    response_payload JSONB,
    retry_count INTEGER DEFAULT 0,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create external entity mapping table (for ID mapping between systems)
CREATE TABLE IF NOT EXISTS ats.external_entity_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ats.integrations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('role', 'candidate', 'application', 'company')),
    internal_id UUID NOT NULL, -- Our system ID
    external_id TEXT NOT NULL, -- ATS system ID
    metadata JSONB DEFAULT '{}', -- Additional mapping data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(integration_id, entity_type, internal_id),
    UNIQUE(integration_id, entity_type, external_id)
);

-- Create sync queue table (for async processing)
CREATE TABLE IF NOT EXISTS ats.sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES ats.integrations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('role', 'candidate', 'application', 'stage', 'interview')),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    priority INTEGER DEFAULT 5, -- 1 (highest) to 10 (lowest)
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_error TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_integrations_company ON ats.integrations(company_id);
CREATE INDEX idx_integrations_platform ON ats.integrations(platform);
CREATE INDEX idx_integrations_sync_enabled ON ats.integrations(sync_enabled) WHERE sync_enabled = TRUE;

CREATE INDEX idx_sync_logs_integration ON ats.sync_logs(integration_id);
CREATE INDEX idx_sync_logs_entity ON ats.sync_logs(entity_type, entity_id);
CREATE INDEX idx_sync_logs_external ON ats.sync_logs(external_id);
CREATE INDEX idx_sync_logs_status ON ats.sync_logs(status);
CREATE INDEX idx_sync_logs_synced_at ON ats.sync_logs(synced_at DESC);

CREATE INDEX idx_external_map_integration ON ats.external_entity_map(integration_id);
CREATE INDEX idx_external_map_internal ON ats.external_entity_map(entity_type, internal_id);
CREATE INDEX idx_external_map_external ON ats.external_entity_map(entity_type, external_id);

CREATE INDEX idx_sync_queue_integration ON ats.sync_queue(integration_id);
CREATE INDEX idx_sync_queue_status ON ats.sync_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_sync_queue_scheduled ON ats.sync_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_sync_queue_priority ON ats.sync_queue(priority, scheduled_at) WHERE status = 'pending';

-- Create updated_at trigger for integrations
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON ats.integrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for external_entity_map
CREATE TRIGGER update_external_entity_map_updated_at
    BEFORE UPDATE ON ats.external_entity_map
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ats.integrations TO authenticated;
GRANT SELECT, INSERT ON ats.sync_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ats.external_entity_map TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ats.sync_queue TO authenticated;

-- Add RLS policies
ALTER TABLE ats.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats.external_entity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE ats.sync_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Company admins can manage their integrations
CREATE POLICY integrations_company_policy ON ats.integrations
    FOR ALL
    USING (
        company_id IN (
            SELECT o.id
            FROM identity.organizations o
            JOIN identity.memberships m ON m.organization_id = o.id
            WHERE m.user_id = auth.uid() AND m.role IN ('admin', 'owner')
        )
    );

-- Policy: Users can view sync logs for their company's integrations
CREATE POLICY sync_logs_view_policy ON ats.sync_logs
    FOR SELECT
    USING (
        integration_id IN (
            SELECT i.id
            FROM ats.integrations i
            JOIN ats.companies c ON c.id = i.company_id
            JOIN identity.organizations o ON o.id = c.identity_organization_id
            JOIN identity.memberships m ON m.organization_id = o.id
            WHERE m.user_id = auth.uid()
        )
    );

-- Policy: Service can insert sync logs
CREATE POLICY sync_logs_insert_policy ON ats.sync_logs
    FOR INSERT
    WITH CHECK (TRUE); -- Service role will handle this

-- Policy: Users can view external mappings for their company
CREATE POLICY external_map_policy ON ats.external_entity_map
    FOR ALL
    USING (
        integration_id IN (
            SELECT i.id
            FROM ats.integrations i
            JOIN ats.companies c ON c.id = i.company_id
            JOIN identity.organizations o ON o.id = c.identity_organization_id
            JOIN identity.memberships m ON m.organization_id = o.id
            WHERE m.user_id = auth.uid()
        )
    );

-- Policy: Sync queue access for service
CREATE POLICY sync_queue_policy ON ats.sync_queue
    FOR ALL
    USING (TRUE); -- Service role manages queue

-- Add helper function to get integration by company and platform
CREATE OR REPLACE FUNCTION ats.get_integration_by_company_platform(
    p_company_id UUID,
    p_platform TEXT
) RETURNS ats.integrations AS $$
    SELECT * FROM ats.integrations
    WHERE company_id = p_company_id AND platform = p_platform
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Add helper function to map external ID to internal ID
CREATE OR REPLACE FUNCTION ats.map_external_to_internal(
    p_integration_id UUID,
    p_entity_type TEXT,
    p_external_id TEXT
) RETURNS UUID AS $$
    SELECT internal_id FROM ats.external_entity_map
    WHERE integration_id = p_integration_id
      AND entity_type = p_entity_type
      AND external_id = p_external_id
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Add helper function to map internal ID to external ID
CREATE OR REPLACE FUNCTION ats.map_internal_to_external(
    p_integration_id UUID,
    p_entity_type TEXT,
    p_internal_id UUID
) RETURNS TEXT AS $$
    SELECT external_id FROM ats.external_entity_map
    WHERE integration_id = p_integration_id
      AND entity_type = p_entity_type
      AND internal_id = p_internal_id
    LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Comments for documentation
COMMENT ON TABLE ats.integrations IS 'ATS platform integrations for companies (Greenhouse, Lever, etc.)';
COMMENT ON TABLE ats.sync_logs IS 'Audit log of all synchronization operations between ATS and Splits Network';
COMMENT ON TABLE ats.external_entity_map IS 'Bidirectional mapping between internal and external entity IDs';
COMMENT ON TABLE ats.sync_queue IS 'Async queue for processing sync operations';

COMMENT ON COLUMN ats.integrations.api_key_encrypted IS 'API key encrypted with application secret, never exposed to frontend';
COMMENT ON COLUMN ats.sync_logs.direction IS 'inbound = ATS → Splits, outbound = Splits → ATS';
COMMENT ON COLUMN ats.sync_queue.priority IS '1 (highest) to 10 (lowest), used for queue ordering';
