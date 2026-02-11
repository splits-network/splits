-- Migration: Update memberships table role constraint to ensure production alignment
-- This migration ensures the memberships.role column has the correct constraint
-- matching our user roles documentation (4 primary roles)

-- Step 1: Check if the constraint exists and drop it if needed
DO $$
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'memberships' 
    AND constraint_name = 'memberships_role_check' 
    AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE public.memberships DROP CONSTRAINT memberships_role_check;
  END IF;
END $$;

-- Step 2: Add the correct role constraint with the 4 primary membership roles
ALTER TABLE public.memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN (
    'platform_admin',
    'company_admin', 
    'hiring_manager',
    'recruiter'
  ));

-- Step 3: Validate existing data against the new constraint
-- This will fail if there are any invalid roles in production
DO $$
DECLARE
  invalid_roles_count INTEGER;
BEGIN
  -- Count any memberships with roles not in allowed list
  SELECT COUNT(*) INTO invalid_roles_count
  FROM public.memberships 
  WHERE role NOT IN ('platform_admin', 'company_admin', 'hiring_manager', 'recruiter');
  
  -- Log the count for reference
  RAISE NOTICE 'Found % memberships with invalid roles that need cleanup', invalid_roles_count;
  
  -- If there are invalid roles, we should handle them
  IF invalid_roles_count > 0 THEN
    -- Log the specific invalid roles for manual review
    RAISE NOTICE 'Invalid roles found: %', (
      SELECT array_agg(DISTINCT role) 
      FROM public.memberships 
      WHERE role NOT IN ('platform_admin', 'company_admin', 'hiring_manager', 'recruiter')
    );
    
    -- Uncomment the line below if you want the migration to fail when invalid roles exist
    -- RAISE EXCEPTION 'Cannot apply constraint: % memberships have invalid roles', invalid_roles_count;
  END IF;
END $$;

-- Step 4: Add helpful indexes if they don't exist  
CREATE INDEX IF NOT EXISTS idx_memberships_role_organization 
  ON public.memberships(role, organization_id) 
  WHERE deleted_at IS NULL;

-- Step 5: Update table comment to reflect the constraint
COMMENT ON TABLE public.memberships IS 'User memberships in organizations with role-based access control. Supports 4 primary roles: platform_admin, company_admin, hiring_manager, recruiter';

COMMENT ON COLUMN public.memberships.role IS 'User role within the organization: platform_admin (platform management), company_admin (full company control), hiring_manager (limited hiring control), recruiter (candidate submission)';

-- Step 6: Verify the constraint is properly applied
DO $$
BEGIN
  -- Confirm the constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'memberships' 
    AND constraint_name = 'memberships_role_check' 
    AND constraint_type = 'CHECK'
  ) THEN
    RAISE EXCEPTION 'Failed to apply memberships_role_check constraint';
  END IF;
  
  RAISE NOTICE 'Successfully applied memberships role constraint with 4 primary roles';
END $$;