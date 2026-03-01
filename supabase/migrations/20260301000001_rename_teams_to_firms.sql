-- Rename "teams" terminology to "firms" across all tables, columns, indexes, constraints, and policies
-- This is a pure rename migration — no logic or schema changes

BEGIN;

-- ============================================================
-- 1. Rename tables
-- ============================================================
ALTER TABLE public.teams RENAME TO firms;
ALTER TABLE public.team_members RENAME TO firm_members;
ALTER TABLE public.team_invitations RENAME TO firm_invitations;

-- ============================================================
-- 2. Rename columns (team_id → firm_id)
-- ============================================================
ALTER TABLE public.firm_members RENAME COLUMN team_id TO firm_id;
ALTER TABLE public.firm_invitations RENAME COLUMN team_id TO firm_id;
ALTER TABLE public.split_configurations RENAME COLUMN team_id TO firm_id;
ALTER TABLE public.placement_splits RENAME COLUMN team_id TO firm_id;

-- ============================================================
-- 3. Rename indexes
-- ============================================================
ALTER INDEX idx_teams_owner RENAME TO idx_firms_owner;
ALTER INDEX idx_teams_status RENAME TO idx_firms_status;
ALTER INDEX idx_team_members_team RENAME TO idx_firm_members_firm;
ALTER INDEX idx_team_members_recruiter RENAME TO idx_firm_members_recruiter;
ALTER INDEX idx_team_members_status RENAME TO idx_firm_members_status;
ALTER INDEX idx_team_invitations_team RENAME TO idx_firm_invitations_firm;
ALTER INDEX idx_team_invitations_email RENAME TO idx_firm_invitations_email;
ALTER INDEX idx_team_invitations_token RENAME TO idx_firm_invitations_token;
ALTER INDEX idx_split_configs_team RENAME TO idx_split_configs_firm;
ALTER INDEX idx_placement_splits_team RENAME TO idx_placement_splits_firm;

-- Rename the composite index on split_configurations (team_id, is_default)
-- This index was created with a WHERE clause, so we reference it by name
ALTER INDEX idx_split_configs_default RENAME TO idx_split_configs_firm_default;

-- ============================================================
-- 4. Rename constraints
-- ============================================================

-- Primary keys (auto-renamed with table, but explicit names need updating)
ALTER TABLE public.firms RENAME CONSTRAINT teams_pkey TO firms_pkey;
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_pkey TO firm_members_pkey;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_pkey TO firm_invitations_pkey;

-- Unique constraints
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_team_id_recruiter_id_key TO firm_members_firm_id_recruiter_id_key;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_token_key TO firm_invitations_token_key;

-- Check constraints
ALTER TABLE public.firms RENAME CONSTRAINT teams_status_check TO firms_status_check;
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_role_check TO firm_members_role_check;
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_status_check TO firm_members_status_check;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_role_check TO firm_invitations_role_check;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_status_check TO firm_invitations_status_check;

-- Foreign key constraints
ALTER TABLE public.firms RENAME CONSTRAINT teams_owner_user_id_fkey TO firms_owner_user_id_fkey;
ALTER TABLE public.firms RENAME CONSTRAINT teams_billing_organization_id_fkey TO firms_billing_organization_id_fkey;
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_team_id_fkey TO firm_members_firm_id_fkey;
ALTER TABLE public.firm_members RENAME CONSTRAINT team_members_recruiter_id_fkey TO firm_members_recruiter_id_fkey;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_team_id_fkey TO firm_invitations_firm_id_fkey;
ALTER TABLE public.firm_invitations RENAME CONSTRAINT team_invitations_invited_by_fkey TO firm_invitations_invited_by_fkey;
ALTER TABLE public.placement_splits RENAME CONSTRAINT placement_splits_team_id_fkey TO placement_splits_firm_id_fkey;
ALTER TABLE public.split_configurations RENAME CONSTRAINT split_configurations_team_id_fkey TO split_configurations_firm_id_fkey;

-- ============================================================
-- 5. Rename trigger
-- ============================================================
ALTER TRIGGER update_teams_updated_at ON public.firms RENAME TO update_firms_updated_at;

-- ============================================================
-- 6. Drop and recreate RLS policies with new names
--    (Postgres does not support RENAME for policies)
-- ============================================================

-- firms (was teams)
DROP POLICY IF EXISTS teams_select_policy ON public.firms;
DROP POLICY IF EXISTS teams_insert_policy ON public.firms;
DROP POLICY IF EXISTS teams_update_policy ON public.firms;

CREATE POLICY firms_select_policy ON public.firms
    FOR SELECT USING (
        owner_user_id = auth.uid()
        OR id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid() AND fm.status = 'active'
        )
    );

CREATE POLICY firms_insert_policy ON public.firms
    FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY firms_update_policy ON public.firms
    FOR UPDATE USING (owner_user_id = auth.uid());

-- firm_members (was team_members)
DROP POLICY IF EXISTS team_members_select_policy ON public.firm_members;
DROP POLICY IF EXISTS team_members_modify_policy ON public.firm_members;

CREATE POLICY firm_members_select_policy ON public.firm_members
    FOR SELECT USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid() AND fm.status = 'active'
        )
    );

CREATE POLICY firm_members_modify_policy ON public.firm_members
    USING (
        firm_id IN (
            SELECT fm.firm_id
            FROM public.firm_members fm
            JOIN public.recruiters r ON r.id = fm.recruiter_id
            WHERE r.user_id = auth.uid()
              AND fm.status = 'active'
              AND fm.role IN ('owner', 'admin')
        )
    );

-- ============================================================
-- 7. Update table comments
-- ============================================================
COMMENT ON TABLE public.firms IS 'Recruiting firms that can operate as unified entities with shared billing and revenue';
COMMENT ON TABLE public.firm_members IS 'Membership relationships between recruiters and firms';
COMMENT ON TABLE public.firm_invitations IS 'Pending invitations for recruiters to join firms';

COMMIT;
