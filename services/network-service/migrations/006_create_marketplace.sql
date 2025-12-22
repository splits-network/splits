-- Migration: Add Marketplace Features
-- Description: Add marketplace fields to recruiters table and create marketplace connection/messaging tables
-- Created: 2025-12-21

-- ============================================================================
-- 1. Add Marketplace Fields to Recruiters Table
-- ============================================================================

ALTER TABLE network.recruiters
    ADD COLUMN marketplace_enabled BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN marketplace_profile JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN marketplace_visibility VARCHAR(20) DEFAULT 'public',
    ADD COLUMN marketplace_industries TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN marketplace_specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN marketplace_location VARCHAR(255),
    ADD COLUMN marketplace_tagline VARCHAR(255),
    ADD COLUMN marketplace_years_experience INTEGER,
    ADD COLUMN show_success_metrics BOOLEAN DEFAULT false NOT NULL,
    ADD COLUMN show_contact_info BOOLEAN DEFAULT true NOT NULL;

COMMENT ON COLUMN network.recruiters.marketplace_enabled IS 'Whether recruiter has opted into the marketplace';
COMMENT ON COLUMN network.recruiters.marketplace_profile IS 'Additional marketplace profile data (bio, achievements, etc.)';
COMMENT ON COLUMN network.recruiters.marketplace_visibility IS 'Visibility level: public, limited, hidden';
COMMENT ON COLUMN network.recruiters.marketplace_industries IS 'Industries the recruiter specializes in';
COMMENT ON COLUMN network.recruiters.marketplace_specialties IS 'Job types/roles the recruiter specializes in';
COMMENT ON COLUMN network.recruiters.marketplace_location IS 'Recruiter''s location for filtering';
COMMENT ON COLUMN network.recruiters.marketplace_tagline IS 'Short tagline for marketplace profile';
COMMENT ON COLUMN network.recruiters.marketplace_years_experience IS 'Years of recruiting experience';
COMMENT ON COLUMN network.recruiters.show_success_metrics IS 'Whether to show placement stats publicly';
COMMENT ON COLUMN network.recruiters.show_contact_info IS 'Whether to show email/phone publicly';

-- ============================================================================
-- 2. Create Marketplace Connections Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS network.marketplace_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_user_id UUID NOT NULL, -- identity.users.id
    recruiter_id UUID NOT NULL REFERENCES network.recruiters(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, declined
    message TEXT, -- Initial message from candidate
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    responded_at TIMESTAMPTZ,
    
    CONSTRAINT unique_candidate_recruiter_connection UNIQUE (candidate_user_id, recruiter_id)
);

CREATE INDEX idx_marketplace_connections_candidate ON network.marketplace_connections(candidate_user_id);
CREATE INDEX idx_marketplace_connections_recruiter ON network.marketplace_connections(recruiter_id);
CREATE INDEX idx_marketplace_connections_status ON network.marketplace_connections(status);
CREATE INDEX idx_marketplace_connections_created ON network.marketplace_connections(created_at DESC);

COMMENT ON TABLE network.marketplace_connections IS 'Tracks connection requests between candidates and recruiters';
COMMENT ON COLUMN network.marketplace_connections.candidate_user_id IS 'Candidate user ID from identity service';
COMMENT ON COLUMN network.marketplace_connections.status IS 'Connection status: pending, accepted, declined';

-- ============================================================================
-- 3. Create Marketplace Messages Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS network.marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES network.marketplace_connections(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL, -- identity.users.id
    sender_type VARCHAR(20) NOT NULL, -- candidate, recruiter
    message TEXT NOT NULL,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_sender_type CHECK (sender_type IN ('candidate', 'recruiter'))
);

CREATE INDEX idx_marketplace_messages_connection ON network.marketplace_messages(connection_id);
CREATE INDEX idx_marketplace_messages_sender ON network.marketplace_messages(sender_user_id);
CREATE INDEX idx_marketplace_messages_created ON network.marketplace_messages(created_at DESC);
CREATE INDEX idx_marketplace_messages_unread ON network.marketplace_messages(connection_id, read_at) WHERE read_at IS NULL;

COMMENT ON TABLE network.marketplace_messages IS 'In-app messaging between candidates and recruiters';
COMMENT ON COLUMN network.marketplace_messages.sender_type IS 'Whether sender is candidate or recruiter';
COMMENT ON COLUMN network.marketplace_messages.read_at IS 'When message was read (null = unread)';

-- ============================================================================
-- 4. Create Marketplace Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS network.marketplace_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE network.marketplace_config IS 'Global marketplace configuration (e.g., subscription requirements, metric visibility)';

-- Insert default configuration
INSERT INTO network.marketplace_config (key, value, description) VALUES
    ('require_active_subscription', 'true', 'Whether recruiters must have active subscription to be in marketplace'),
    ('allow_success_metrics', 'true', 'Whether recruiters can show success metrics publicly'),
    ('default_visibility', '"public"', 'Default visibility for new marketplace profiles')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 5. Create Updated Trigger for marketplace_connections
-- ============================================================================

CREATE OR REPLACE FUNCTION network.update_marketplace_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_marketplace_connections_updated_at
    BEFORE UPDATE ON network.marketplace_connections
    FOR EACH ROW
    EXECUTE FUNCTION network.update_marketplace_connections_updated_at();

-- ============================================================================
-- 6. Create Updated Trigger for marketplace_config
-- ============================================================================

CREATE OR REPLACE FUNCTION network.update_marketplace_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_marketplace_config_updated_at
    BEFORE UPDATE ON network.marketplace_config
    FOR EACH ROW
    EXECUTE FUNCTION network.update_marketplace_config_updated_at();
