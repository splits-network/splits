-- Migration: Remove platform organization and legacy platform_admin memberships
-- After Phase 4 migrated platform_admin to user_roles and Phase 5 updated the access layer,
-- the legacy platform organization and its memberships are dead weight. This migration
-- removes them to eliminate synthetic data from the system.

-- ============================================================================
-- Step 1: Pre-flight validation - Ensure migration has run
-- ============================================================================
-- Verify that platform_admin rows exist in user_roles before deleting legacy data.
-- If no platform_admin rows exist, the Phase 4 migration hasn't been applied yet.
DO $$
DECLARE
    platform_admin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO platform_admin_count
    FROM public.user_roles
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    IF platform_admin_count = 0 THEN
        RAISE EXCEPTION 'No platform_admin rows found in user_roles — refusing to delete legacy data before migration is confirmed. Run migration 20260215000001_platform_admin_to_user_roles.sql first.';
    END IF;

    RAISE NOTICE 'Pre-flight check passed: % platform_admin rows found in user_roles', platform_admin_count;
END $$;

-- ============================================================================
-- Step 2: Soft-delete platform_admin memberships
-- ============================================================================
-- Mark all platform_admin memberships as deleted (soft-delete pattern).
-- All queries filter on deleted_at IS NULL, so these rows become invisible.
UPDATE public.memberships
SET
    deleted_at = now(),
    updated_at = now()
WHERE role_name = 'platform_admin'
  AND deleted_at IS NULL;

-- ============================================================================
-- Step 3: Verify no non-deleted memberships reference platform org
-- ============================================================================
-- Before hard-deleting the platform organization, ensure no active memberships reference it.
-- The soft-deleted platform_admin memberships from Step 2 have deleted_at set, so they won't block.
DO $$
DECLARE
    platform_org_id UUID;
    active_membership_count INTEGER;
    invitation_count INTEGER;
    company_count INTEGER;
    team_count INTEGER;
BEGIN
    -- Get the platform organization ID
    SELECT id INTO platform_org_id
    FROM public.organizations
    WHERE type = 'platform'
    LIMIT 1;

    IF platform_org_id IS NULL THEN
        RAISE NOTICE 'No platform organization found — skipping FK verification';
        RETURN;
    END IF;

    -- Check for active memberships (should be 0 after soft-delete in Step 2)
    SELECT COUNT(*) INTO active_membership_count
    FROM public.memberships
    WHERE organization_id = platform_org_id
      AND deleted_at IS NULL;

    IF active_membership_count > 0 THEN
        RAISE EXCEPTION 'Found % active memberships referencing platform organization — cannot delete', active_membership_count;
    END IF;

    -- Check for invitations
    SELECT COUNT(*) INTO invitation_count
    FROM public.invitations
    WHERE organization_id = platform_org_id;

    IF invitation_count > 0 THEN
        RAISE EXCEPTION 'Found % invitations referencing platform organization — cannot delete', invitation_count;
    END IF;

    -- Check for companies
    SELECT COUNT(*) INTO company_count
    FROM public.companies
    WHERE identity_organization_id = platform_org_id;

    IF company_count > 0 THEN
        RAISE EXCEPTION 'Found % companies referencing platform organization — cannot delete', company_count;
    END IF;

    -- Check for teams
    SELECT COUNT(*) INTO team_count
    FROM public.teams
    WHERE organization_id = platform_org_id;

    IF team_count > 0 THEN
        RAISE EXCEPTION 'Found % teams referencing platform organization — cannot delete', team_count;
    END IF;

    RAISE NOTICE 'FK verification passed: no active references to platform organization';
END $$;

-- ============================================================================
-- Step 4: Hard-delete platform_admin memberships before org deletion
-- ============================================================================
-- The memberships table has FK to organizations (NOT cascade delete).
-- We must delete ALL membership rows (including soft-deleted ones) before deleting the org.
DELETE FROM public.memberships
WHERE organization_id IN (
    SELECT id FROM public.organizations WHERE type = 'platform'
);

-- ============================================================================
-- Step 5: Hard-delete the platform organization
-- ============================================================================
-- Now that all memberships are deleted, we can delete the organization.
DELETE FROM public.organizations
WHERE type = 'platform';

-- ============================================================================
-- Step 6: Update organizations_type_check constraint
-- ============================================================================
-- Remove 'platform' from the allowed types in the CHECK constraint.
-- Only 'company' remains (recruiter is a TypeScript type, not in DB constraint).
ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE public.organizations ADD CONSTRAINT organizations_type_check
    CHECK (type = ANY (ARRAY['company'::text]));

-- ============================================================================
-- Step 7: Update table comments
-- ============================================================================
-- Document that platform_admin is no longer org-scoped.
COMMENT ON TABLE public.memberships IS 'Org-scoped role assignments (company_admin, hiring_manager). Platform admin is in user_roles, not here.';
COMMENT ON TABLE public.organizations IS 'Organizations in the system. Type is ''company'' only (platform org removed in Phase 6).';

-- ============================================================================
-- ROLLBACK (run manually if needed — reverse the migration)
-- ============================================================================
-- To rollback this migration:
-- 1. Re-insert platform organization (save the ID before deletion if needed)
-- 2. Restore CHECK constraint with 'platform' included
-- 3. Note: membership data cannot be automatically restored (one-way cleanup)
--
-- Example rollback SQL (replace {platform_org_id} with saved ID):
--
-- INSERT INTO public.organizations (id, name, type, created_at, updated_at)
-- VALUES ('{platform_org_id}', 'Splits Network', 'platform', now(), now());
--
-- ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
-- ALTER TABLE public.organizations ADD CONSTRAINT organizations_type_check
--     CHECK (type = ANY (ARRAY['company'::text, 'platform'::text]));
--
-- COMMENT ON TABLE public.organizations IS 'Organizations in the system. Types: company, platform.';
