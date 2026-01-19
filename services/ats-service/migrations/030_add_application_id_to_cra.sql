-- Migration: Add application_id to candidate_role_assignments
-- Purpose: Create proper 1-to-1 relationship between applications and CRAs
-- This fixes the bug where multiple applications for same candidate+job share one CRA

-- Add application_id column
ALTER TABLE candidate_role_assignments
ADD COLUMN application_id UUID REFERENCES applications(id) ON DELETE CASCADE;

-- Create index for lookups
CREATE INDEX idx_candidate_role_assignments_application_id
ON candidate_role_assignments(application_id);

-- Backfill existing CRAs with their application_id
-- Match on candidate_id + job_id (assumes one application per pair currently)
UPDATE candidate_role_assignments cra
SET application_id = (
    SELECT a.id 
    FROM applications a 
    WHERE a.candidate_id = cra.candidate_id 
      AND a.job_id = cra.job_id
    ORDER BY a.created_at DESC
    LIMIT 1
);

-- Make application_id required for new records (after backfill)
ALTER TABLE candidate_role_assignments
ALTER COLUMN application_id SET NOT NULL;

-- Drop old unique constraint (candidate_id + job_id)
-- This allowed only one CRA per candidate-job pair, preventing reapplications
DROP INDEX IF EXISTS idx_candidate_role_assignments_unique;

-- Create new unique constraint using application_id
-- Each application gets exactly one active CRA
CREATE UNIQUE INDEX idx_candidate_role_assignments_unique_app
ON candidate_role_assignments(application_id)
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');

-- Add comment for documentation
COMMENT ON COLUMN candidate_role_assignments.application_id IS 
'Foreign key to applications table. Creates 1-to-1 relationship between application and CRA. Required for supporting candidate reapplications to same job.';
