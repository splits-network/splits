-- Migration: Split user_roles into memberships + user_roles
-- user_roles currently stores both org-scoped roles (company_admin, hiring_manager, platform_admin)
-- and entity-linked roles (recruiter, candidate). This migration separates them:
--   memberships: org-scoped roles with organization_id (NOT NULL) and optional company_id
--   user_roles: entity-linked roles with role_entity_id (NOT NULL)

-- ============================================================================
-- Step 1: Create memberships table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    role_name TEXT NOT NULL REFERENCES public.roles(name),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Note: The _deprecated_memberships table from migration 000004 still exists as historical backup.
-- This new memberships table is a fresh table with a cleaner schema.

-- ============================================================================
-- Step 2: Add indexes and constraints for memberships
-- ============================================================================

-- Unique constraint: one role per user per org/company combination
CREATE UNIQUE INDEX IF NOT EXISTS uq_membership_assignment
    ON public.memberships (
        user_id,
        role_name,
        organization_id,
        COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_memberships_user_id
    ON public.memberships(user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_memberships_org_id
    ON public.memberships(organization_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_memberships_company_id
    ON public.memberships(company_id)
    WHERE deleted_at IS NULL AND company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_memberships_role_name
    ON public.memberships(role_name)
    WHERE deleted_at IS NULL;

-- Comments
COMMENT ON TABLE public.memberships IS 'Org-scoped role assignments: company_admin, hiring_manager, platform_admin. Always has organization_id.';
COMMENT ON COLUMN public.memberships.role_name IS 'References roles.name: company_admin, hiring_manager, platform_admin';
COMMENT ON COLUMN public.memberships.organization_id IS 'Organization this membership belongs to (NOT NULL)';
COMMENT ON COLUMN public.memberships.company_id IS 'Optional company scope. NULL means org-wide access.';

-- ============================================================================
-- Step 3: Migrate org-scoped rows from user_roles → memberships
-- Preserving original IDs for traceability
-- ============================================================================
INSERT INTO public.memberships (id, user_id, role_name, organization_id, company_id, created_at, updated_at, deleted_at)
SELECT
    ur.id,
    ur.user_id,
    ur.role_name,
    ur.organization_id,
    ur.company_id,
    ur.created_at,
    ur.updated_at,
    ur.deleted_at
FROM public.user_roles ur
WHERE ur.organization_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 4: Validate migration counts
-- ============================================================================
DO $$
DECLARE
    source_count INTEGER;
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count
    FROM public.user_roles WHERE organization_id IS NOT NULL;

    SELECT COUNT(*) INTO migrated_count
    FROM public.memberships;

    RAISE NOTICE 'Org-scoped role migration: % source rows → % memberships rows', source_count, migrated_count;

    IF source_count <> migrated_count THEN
        RAISE WARNING 'Migration count mismatch! Expected %, got %', source_count, migrated_count;
    END IF;
END $$;

-- ============================================================================
-- Step 5: Delete migrated org-scoped rows from user_roles
-- ============================================================================
DELETE FROM public.user_roles
WHERE organization_id IS NOT NULL;

-- ============================================================================
-- Step 6: Drop org/company indexes from user_roles (no longer needed)
-- ============================================================================
DROP INDEX IF EXISTS idx_user_roles_org_id;
DROP INDEX IF EXISTS idx_user_roles_company_id;
DROP INDEX IF EXISTS uq_user_role_assignment;

-- ============================================================================
-- Step 7: Drop organization_id and company_id columns from user_roles
-- ============================================================================
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS organization_id;
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS company_id;

-- ============================================================================
-- Step 8: Make role_entity_id NOT NULL (all remaining rows are entity-linked)
-- ============================================================================
-- First, clean up any rows without role_entity_id (shouldn't exist but safety check)
DELETE FROM public.user_roles WHERE role_entity_id IS NULL;

ALTER TABLE public.user_roles ALTER COLUMN role_entity_id SET NOT NULL;

-- ============================================================================
-- Step 9: Create new unique index for user_roles (entity-linked only)
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_entity_assignment
    ON public.user_roles (user_id, role_name, role_entity_id)
    WHERE deleted_at IS NULL;

-- ============================================================================
-- Step 10: Update table and column comments
-- ============================================================================
COMMENT ON TABLE public.user_roles IS 'Entity-linked role assignments: recruiter, candidate. Always has role_entity_id.';
COMMENT ON COLUMN public.user_roles.role_name IS 'References roles.name: recruiter, candidate';
COMMENT ON COLUMN public.user_roles.role_entity_id IS 'Links to the domain entity: recruiters.id when role_name=recruiter, candidates.id when role_name=candidate (NOT NULL)';

-- ============================================================================
-- Step 11: Final validation
-- ============================================================================
DO $$
DECLARE
    user_roles_with_null_entity INTEGER;
    memberships_without_org INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_roles_with_null_entity
    FROM public.user_roles WHERE role_entity_id IS NULL AND deleted_at IS NULL;

    SELECT COUNT(*) INTO memberships_without_org
    FROM public.memberships WHERE organization_id IS NULL AND deleted_at IS NULL;

    IF user_roles_with_null_entity > 0 THEN
        RAISE WARNING 'Found % user_roles without role_entity_id!', user_roles_with_null_entity;
    END IF;

    IF memberships_without_org > 0 THEN
        RAISE WARNING 'Found % memberships without organization_id!', memberships_without_org;
    END IF;

    RAISE NOTICE 'Migration complete: user_roles is now entity-linked only, memberships is org-scoped only';
END $$;
