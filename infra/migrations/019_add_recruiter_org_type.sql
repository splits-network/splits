-- Migration 019: Add 'recruiter' to organization type constraint
-- Fixes onboarding error where recruiter organizations cannot be created
-- Created: December 23, 2025

BEGIN;

-- Drop the existing constraint
ALTER TABLE identity.organizations 
    DROP CONSTRAINT IF EXISTS organizations_type_check;

-- Add new constraint that includes 'recruiter'
ALTER TABLE identity.organizations 
    ADD CONSTRAINT organizations_type_check 
    CHECK (type = ANY (ARRAY['company'::text, 'platform'::text, 'recruiter'::text]));

COMMENT ON COLUMN identity.organizations.type IS 'Organization type: company (hiring companies), platform (internal), recruiter (individual recruiter orgs)';

COMMIT;
