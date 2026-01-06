-- Revert migration: Remove 'recruiter' from organizations type constraint
-- Recruiters should NOT have organizations - only company_admin users create organizations

ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_type_check;

ALTER TABLE organizations
ADD CONSTRAINT organizations_type_check
CHECK (type IN ('company', 'platform'));
