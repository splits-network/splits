-- Add company_id to invitations table to support company-scoped invitations
-- Migration: 20260201000001_add_company_scoped_invitations.sql
-- Purpose: Allow invitations to be scoped to specific companies (company_id set) or organization-wide (company_id null)

-- Add company_id column (nullable for org-scoped invitations)
ALTER TABLE public.invitations
ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Add index for company_id lookups
CREATE INDEX idx_invitations_company_id ON public.invitations(company_id);

-- Add composite index for organization + company queries
CREATE INDEX idx_invitations_org_company ON public.invitations(organization_id, company_id);

-- Add comment explaining usage
COMMENT ON COLUMN public.invitations.company_id IS
'Company scope - if set, invitation is for specific company; if null, invitation is org-wide. Hiring managers can be company-scoped or org-scoped based on invitation.';

-- Ensure deleted_at column exists for soft deletes
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
