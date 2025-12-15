-- Migration: Teams and Agencies (Phase 4B)
-- Description: Enable recruiting agencies to operate as unified entities with multiple team members
-- Date: 2025-12-15

-- Create teams table
CREATE TABLE IF NOT EXISTS network.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_user_id UUID NOT NULL REFERENCES identity.users(id) ON DELETE RESTRICT,
    billing_organization_id UUID REFERENCES identity.organizations(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS network.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES network.teams(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES network.recruiters(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'collaborator')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
    UNIQUE(team_id, recruiter_id)
);

-- Create split_configurations table for team economics
CREATE TABLE IF NOT EXISTS network.split_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES network.teams(id) ON DELETE CASCADE,
    model TEXT NOT NULL CHECK (model IN ('flat_split', 'tiered_split', 'individual_credit', 'hybrid')),
    config JSONB NOT NULL DEFAULT '{}', -- Model-specific config (e.g., owner_percentage, team_overhead_fee)
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create placement_splits table for tracking individual split distributions
CREATE TABLE IF NOT EXISTS network.placement_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placement_id UUID NOT NULL REFERENCES ats.placements(id) ON DELETE CASCADE,
    team_id UUID REFERENCES network.teams(id) ON DELETE SET NULL,
    recruiter_id UUID NOT NULL REFERENCES network.recruiters(id) ON DELETE RESTRICT,
    split_percentage DECIMAL(5, 2) NOT NULL CHECK (split_percentage >= 0 AND split_percentage <= 100),
    split_amount DECIMAL(10, 2), -- Calculated from placement fee
    split_configuration_id UUID REFERENCES network.split_configurations(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create team_invitations table for managing invites
CREATE TABLE IF NOT EXISTS network.team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES network.teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'collaborator')),
    invited_by UUID NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_teams_owner ON network.teams(owner_user_id);
CREATE INDEX idx_teams_status ON network.teams(status);
CREATE INDEX idx_team_members_team ON network.team_members(team_id);
CREATE INDEX idx_team_members_recruiter ON network.team_members(recruiter_id);
CREATE INDEX idx_team_members_status ON network.team_members(status);
CREATE INDEX idx_split_configs_team ON network.split_configurations(team_id);
CREATE INDEX idx_split_configs_default ON network.split_configurations(team_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_placement_splits_placement ON network.placement_splits(placement_id);
CREATE INDEX idx_placement_splits_team ON network.placement_splits(team_id);
CREATE INDEX idx_placement_splits_recruiter ON network.placement_splits(recruiter_id);
CREATE INDEX idx_team_invitations_team ON network.team_invitations(team_id);
CREATE INDEX idx_team_invitations_token ON network.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON network.team_invitations(email);

-- Create updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON network.teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for split_configurations
CREATE TRIGGER update_split_configurations_updated_at
    BEFORE UPDATE ON network.split_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON network.teams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON network.team_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON network.split_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON network.placement_splits TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON network.team_invitations TO authenticated;

-- Add RLS policies (basic - refine per security requirements)
ALTER TABLE network.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.split_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.placement_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE network.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view teams they own or are members of
CREATE POLICY teams_select_policy ON network.teams
    FOR SELECT
    USING (
        owner_user_id = auth.uid()
        OR id IN (
            SELECT tm.team_id
            FROM network.team_members tm
            JOIN network.recruiters r ON r.id = tm.recruiter_id
            WHERE r.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- Policy: Only team owners can update teams
CREATE POLICY teams_update_policy ON network.teams
    FOR UPDATE
    USING (owner_user_id = auth.uid());

-- Policy: Any authenticated user can create a team
CREATE POLICY teams_insert_policy ON network.teams
    FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());

-- Policy: Team members can view other members in their teams
CREATE POLICY team_members_select_policy ON network.team_members
    FOR SELECT
    USING (
        team_id IN (
            SELECT tm.team_id
            FROM network.team_members tm
            JOIN network.recruiters r ON r.id = tm.recruiter_id
            WHERE r.user_id = auth.uid() AND tm.status = 'active'
        )
    );

-- Policy: Team owners and admins can manage team members
CREATE POLICY team_members_modify_policy ON network.team_members
    FOR ALL
    USING (
        team_id IN (
            SELECT tm.team_id
            FROM network.team_members tm
            JOIN network.recruiters r ON r.id = tm.recruiter_id
            WHERE r.user_id = auth.uid()
              AND tm.status = 'active'
              AND tm.role IN ('owner', 'admin')
        )
    );

-- Comments for documentation
COMMENT ON TABLE network.teams IS 'Recruiting agencies and team accounts that can operate as unified entities';
COMMENT ON TABLE network.team_members IS 'Membership relationships between recruiters and teams';
COMMENT ON TABLE network.split_configurations IS 'Economic split models for team-based fee distribution';
COMMENT ON TABLE network.placement_splits IS 'Individual split distributions for each placement';
COMMENT ON TABLE network.team_invitations IS 'Pending invitations for recruiters to join teams';
