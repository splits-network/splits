-- Migration: Create user_roles table and migrate data from memberships, recruiters, and candidates
-- This table replaces the memberships table as the single source of truth for user roles

-- Step 1: Create the user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id),
    role_name TEXT NOT NULL REFERENCES public.roles(name),
    role_entity_id UUID,
    role_entity_type TEXT,
    organization_id UUID REFERENCES public.organizations(id),
    company_id UUID REFERENCES public.companies(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Step 2: Add unique constraint to prevent duplicate role assignments
-- A user can only have one of each role per org/company combination
-- NULLs in organization_id/company_id are treated as distinct, so we use COALESCE
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_assignment
    ON public.user_roles (
        user_id,
        role_name,
        COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
        COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::uuid)
    )
    WHERE deleted_at IS NULL;

-- Step 3: Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
    ON public.user_roles(user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_name
    ON public.user_roles(role_name)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_org_id
    ON public.user_roles(organization_id)
    WHERE deleted_at IS NULL AND organization_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_company_id
    ON public.user_roles(company_id)
    WHERE deleted_at IS NULL AND company_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_entity
    ON public.user_roles(role_entity_id, role_entity_type)
    WHERE deleted_at IS NULL AND role_entity_id IS NOT NULL;

-- Step 4: Add table and column comments
COMMENT ON TABLE public.user_roles IS 'Assigns roles to users. Replaces memberships table. Each row represents a single role assignment with optional org/company scoping and entity linkage.';
COMMENT ON COLUMN public.user_roles.role_name IS 'References roles.name: platform_admin, company_admin, hiring_manager, recruiter, candidate';
COMMENT ON COLUMN public.user_roles.role_entity_id IS 'Links to the domain entity: recruiters.id for recruiter role, candidates.id for candidate role, NULL for org roles';
COMMENT ON COLUMN public.user_roles.role_entity_type IS 'Type of entity referenced by role_entity_id: recruiter, candidate, or NULL';
COMMENT ON COLUMN public.user_roles.organization_id IS 'Organization scope for org-level roles (company_admin, hiring_manager, platform_admin)';
COMMENT ON COLUMN public.user_roles.company_id IS 'Company scope for company-specific roles. NULL means org-wide access.';

-- Step 5: Migrate existing memberships → user_roles
-- Preserving the original membership ID for traceability
INSERT INTO public.user_roles (id, user_id, role_name, organization_id, company_id, created_at, updated_at)
SELECT
    m.id,
    m.user_id,
    m.role,
    m.organization_id,
    m.company_id,
    m.created_at,
    m.updated_at
FROM public.memberships m
WHERE m.deleted_at IS NULL
  AND m.role IS NOT NULL
  AND m.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 6: Migrate active recruiters → user_roles (recruiter role with entity link)
INSERT INTO public.user_roles (user_id, role_name, role_entity_id, role_entity_type, created_at)
SELECT
    r.user_id,
    'recruiter',
    r.id,
    'recruiter',
    r.created_at
FROM public.recruiters r
WHERE r.status = 'active'
  AND r.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 7: Migrate candidates with user accounts → user_roles (candidate role with entity link)
INSERT INTO public.user_roles (user_id, role_name, role_entity_id, role_entity_type, created_at)
SELECT
    c.user_id,
    'candidate',
    c.id,
    'candidate',
    c.created_at
FROM public.candidates c
WHERE c.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 8: Validate migration counts
DO $$
DECLARE
    membership_count INTEGER;
    user_roles_from_memberships INTEGER;
    active_recruiters INTEGER;
    user_roles_recruiters INTEGER;
    candidates_with_users INTEGER;
    user_roles_candidates INTEGER;
BEGIN
    -- Count source memberships
    SELECT COUNT(*) INTO membership_count
    FROM public.memberships WHERE deleted_at IS NULL AND role IS NOT NULL AND user_id IS NOT NULL;

    -- Count migrated membership roles
    SELECT COUNT(*) INTO user_roles_from_memberships
    FROM public.user_roles WHERE organization_id IS NOT NULL AND deleted_at IS NULL;

    -- Count active recruiters with user accounts
    SELECT COUNT(*) INTO active_recruiters
    FROM public.recruiters WHERE status = 'active' AND user_id IS NOT NULL;

    -- Count migrated recruiter roles
    SELECT COUNT(*) INTO user_roles_recruiters
    FROM public.user_roles WHERE role_name = 'recruiter' AND role_entity_type = 'recruiter' AND deleted_at IS NULL;

    -- Count candidates with user accounts
    SELECT COUNT(*) INTO candidates_with_users
    FROM public.candidates WHERE user_id IS NOT NULL;

    -- Count migrated candidate roles
    SELECT COUNT(*) INTO user_roles_candidates
    FROM public.user_roles WHERE role_name = 'candidate' AND role_entity_type = 'candidate' AND deleted_at IS NULL;

    RAISE NOTICE 'Migration summary:';
    RAISE NOTICE '  Memberships: % source → % user_roles', membership_count, user_roles_from_memberships;
    RAISE NOTICE '  Recruiters:  % active → % user_roles', active_recruiters, user_roles_recruiters;
    RAISE NOTICE '  Candidates:  % with users → % user_roles', candidates_with_users, user_roles_candidates;
END $$;
