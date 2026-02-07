-- Migration: Create recruiter_company_invitations table
-- Purpose: Enable recruiters to invite new companies to join the Splits Network platform
-- via email, shareable link, or invite code

CREATE TABLE IF NOT EXISTS recruiter_company_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Recruiter who created the invitation
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,

    -- Invitation identifiers (all generated on create)
    invite_code VARCHAR(13) NOT NULL UNIQUE,      -- Format: "SPLITS-X7K9M2"
    invite_link_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),

    -- Optional fields for email invitations
    invited_email VARCHAR(255),
    company_name_hint VARCHAR(255),
    personal_message TEXT,

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

    -- Expiration (30 days default)
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),

    -- Acceptance tracking
    accepted_at TIMESTAMPTZ,
    accepted_by_user_id UUID REFERENCES users(id),
    created_organization_id UUID REFERENCES organizations(id),
    created_company_id UUID REFERENCES companies(id),

    -- Audit trail
    email_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_recruiter_company_invitations_recruiter_id
    ON recruiter_company_invitations(recruiter_id);

CREATE INDEX idx_recruiter_company_invitations_invite_code
    ON recruiter_company_invitations(invite_code);

CREATE INDEX idx_recruiter_company_invitations_invite_link_token
    ON recruiter_company_invitations(invite_link_token);

CREATE INDEX idx_recruiter_company_invitations_status
    ON recruiter_company_invitations(status);

CREATE INDEX idx_recruiter_company_invitations_invited_email
    ON recruiter_company_invitations(invited_email)
    WHERE invited_email IS NOT NULL;

CREATE INDEX idx_recruiter_company_invitations_expires_at
    ON recruiter_company_invitations(expires_at)
    WHERE status = 'pending';

-- Trigger for updated_at
CREATE TRIGGER update_recruiter_company_invitations_updated_at
    BEFORE UPDATE ON recruiter_company_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE recruiter_company_invitations IS 'Tracks recruiter invitations to bring new companies onto the Splits Network platform';
COMMENT ON COLUMN recruiter_company_invitations.invite_code IS 'Short alphanumeric code (SPLITS-XXXXXX) for SMS/text sharing';
COMMENT ON COLUMN recruiter_company_invitations.invite_link_token IS 'UUID token for shareable URL (/join/{token})';
COMMENT ON COLUMN recruiter_company_invitations.personal_message IS 'Optional personalized message from recruiter to include in invitation';
