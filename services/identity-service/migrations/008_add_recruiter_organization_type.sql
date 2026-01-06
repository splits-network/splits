-- Add 'recruiter' type to organizations type constraint
-- This fixes the error when completing recruiter onboarding
-- Date: 2025-12-22
-- Issue: Organizations table constraint only allowed 'company' and 'platform' types,
--        but the code tries to create 'recruiter' type organizations during onboarding

ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_type_check;

ALTER TABLE organizations 
ADD CONSTRAINT organizations_type_check 
CHECK (type = ANY (ARRAY['company'::text, 'platform'::text, 'recruiter'::text]));
