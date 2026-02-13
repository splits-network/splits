-- Migration: Move platform_admin from memberships to user_roles
-- Platform admin is a system-level role, not an organization-scoped role.
-- This migration makes role_entity_id nullable in user_roles and migrates all
-- platform_admin rows from memberships → user_roles with NULL role_entity_id.

-- ============================================================================
-- Step 1: Make role_entity_id nullable in user_roles
-- ============================================================================
-- Platform admins don't link to a domain entity (recruiter/candidate), so
-- role_entity_id must be nullable to support them.
ALTER TABLE public.user_roles ALTER COLUMN role_entity_id DROP NOT NULL;

-- ============================================================================
-- Step 2: Restructure unique indexes to handle NULL role_entity_id
-- ============================================================================
-- The current index uq_user_role_entity_assignment covers (user_id, role_name, role_entity_id).
-- This doesn't work for platform_admin because all rows have role_entity_id=NULL,
-- and NULLs are not equal in unique indexes — no duplicate prevention.
--
-- Solution: Split into two partial indexes:
--   1. Entity-linked roles (recruiter, candidate) → unique on (user_id, role_name, role_entity_id)
--   2. Platform admin → unique on (user_id, role_name) only

-- Drop the existing index
DROP INDEX IF EXISTS public.uq_user_role_entity_assignment;

-- Create entity-linked uniqueness index (for recruiter/candidate with role_entity_id NOT NULL)
CREATE UNIQUE INDEX uq_user_role_entity
    ON public.user_roles (user_id, role_name, role_entity_id)
    WHERE deleted_at IS NULL AND role_entity_id IS NOT NULL;

-- Create platform admin uniqueness index (prevents duplicate platform_admin per user)
CREATE UNIQUE INDEX uq_user_role_platform_admin
    ON public.user_roles (user_id, role_name)
    WHERE deleted_at IS NULL AND role_name = 'platform_admin';

-- ============================================================================
-- Step 3: Migrate platform_admin rows from memberships → user_roles
-- ============================================================================
-- Move all active platform_admin rows. role_entity_id = NULL for system-level role.
INSERT INTO public.user_roles (id, user_id, role_name, role_entity_id, created_at, updated_at)
SELECT
    gen_random_uuid(),
    m.user_id,
    m.role_name,
    NULL, -- Platform admin has no entity link
    m.created_at,
    COALESCE(m.updated_at, now())
FROM public.memberships m
WHERE m.role_name = 'platform_admin'
  AND m.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Step 4: Atomic validation — hard fail on count mismatch
-- ============================================================================
-- Ensure every platform_admin in memberships has a matching row in user_roles.
-- If counts don't match, abort the entire transaction.
DO $$
DECLARE
    source_count INTEGER;
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count
    FROM public.memberships
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    SELECT COUNT(*) INTO migrated_count
    FROM public.user_roles
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    IF source_count <> migrated_count THEN
        RAISE EXCEPTION 'Platform admin migration count mismatch: % in memberships, % in user_roles. Aborting.', source_count, migrated_count;
    END IF;

    RAISE NOTICE 'Platform admin migration validated: % rows migrated successfully', migrated_count;
END $$;

-- ============================================================================
-- Step 5: Update table and column comments
-- ============================================================================
COMMENT ON TABLE public.user_roles IS 'Role assignments: entity-linked (recruiter, candidate) with role_entity_id, and system-level (platform_admin) with NULL role_entity_id.';
COMMENT ON COLUMN public.user_roles.role_entity_id IS 'Links to domain entity: recruiters.id for recruiter, candidates.id for candidate. NULL for system-level roles (platform_admin).';

-- ============================================================================
-- ROLLBACK (run manually if needed — reverse the migration)
-- ============================================================================
-- To rollback this migration:
-- 1. Delete migrated platform_admin rows from user_roles
-- 2. Restore NOT NULL constraint on role_entity_id
-- 3. Drop the two new partial indexes
-- 4. Recreate the original single unique index
--
-- DELETE FROM public.user_roles WHERE role_name = 'platform_admin';
-- ALTER TABLE public.user_roles ALTER COLUMN role_entity_id SET NOT NULL;
-- DROP INDEX IF EXISTS public.uq_user_role_platform_admin;
-- DROP INDEX IF EXISTS public.uq_user_role_entity;
-- CREATE UNIQUE INDEX uq_user_role_entity_assignment ON public.user_roles (user_id, role_name, role_entity_id) WHERE deleted_at IS NULL;
