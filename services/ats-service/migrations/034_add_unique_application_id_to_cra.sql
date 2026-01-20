-- Migration 034: Add unique constraint on application_id in candidate_role_assignments
-- This enforces 1:1 relationship between applications and CRAs
-- Each application can have only one CRA record

-- Add unique constraint
ALTER TABLE candidate_role_assignments
ADD CONSTRAINT candidate_role_assignments_application_id_key UNIQUE (application_id);

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT candidate_role_assignments_application_id_key ON candidate_role_assignments 
IS 'Enforces 1:1 relationship - each application can have only one CRA record';
