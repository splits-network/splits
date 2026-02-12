-- Migration: Remove redundant role_entity_type column from user_roles
-- role_entity_type always mirrored role_name for entity-linked roles:
--   role_name='recruiter' → role_entity_type='recruiter'
--   role_name='candidate' → role_entity_type='candidate'
--   org-scoped roles → role_entity_type=NULL
-- Since role_name already determines the entity type, this column is redundant.

-- Step 1: Drop the index that references role_entity_type
DROP INDEX IF EXISTS idx_user_roles_entity;

-- Step 2: Recreate the index on just role_entity_id (still useful for lookups)
CREATE INDEX IF NOT EXISTS idx_user_roles_entity_id
    ON public.user_roles(role_entity_id)
    WHERE deleted_at IS NULL AND role_entity_id IS NOT NULL;

-- Step 3: Drop the redundant column
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS role_entity_type;

-- Step 4: Update column comments
COMMENT ON COLUMN public.user_roles.role_entity_id IS 'Links to the domain entity: recruiters.id when role_name=recruiter, candidates.id when role_name=candidate, NULL for org-scoped roles';
