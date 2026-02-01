-- Add company_id to memberships table to support company-scoped memberships
-- Migration: 20260201000002_add_company_scoped_memberships.sql
-- Purpose: Allow memberships to be scoped to specific companies (company_id set) or organization-wide (company_id null)

-- Add company_id column (nullable for org-scoped memberships)
ALTER TABLE public.memberships
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Add index for company_id lookups
CREATE INDEX idx_memberships_company_id ON public.memberships(company_id);

-- Add composite index for user + company queries
CREATE INDEX idx_memberships_user_company ON public.memberships(user_id, company_id);

-- Add comment explaining usage
COMMENT ON COLUMN public.memberships.company_id IS
'Company scope - if set, membership is for specific company; if null, membership is org-wide. Company admins are company-scoped. Hiring managers can be company-scoped or org-scoped.';

-- Ensure deleted_at column exists for soft deletes
ALTER TABLE public.memberships
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Note: Not adding unique constraint because users can have the same role across different companies
-- Example: User can be hiring_manager for Company A and hiring_manager for Company B
