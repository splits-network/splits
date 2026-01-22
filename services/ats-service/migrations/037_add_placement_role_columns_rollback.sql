-- Rollback Migration: 037_add_placement_role_columns_rollback.sql
-- Removes the 5 role columns and placement_fee added in 037

-- Drop indexes first
DROP INDEX IF EXISTS idx_placements_candidate_recruiter_id;
DROP INDEX IF EXISTS idx_placements_company_recruiter_id;
DROP INDEX IF EXISTS idx_placements_job_owner_recruiter_id;
DROP INDEX IF EXISTS idx_placements_candidate_sourcer_recruiter_id;
DROP INDEX IF EXISTS idx_placements_company_sourcer_recruiter_id;

-- Drop the new columns
ALTER TABLE placements DROP COLUMN IF EXISTS candidate_recruiter_id;
ALTER TABLE placements DROP COLUMN IF EXISTS company_recruiter_id;
ALTER TABLE placements DROP COLUMN IF EXISTS job_owner_recruiter_id;
ALTER TABLE placements DROP COLUMN IF EXISTS candidate_sourcer_recruiter_id;
ALTER TABLE placements DROP COLUMN IF EXISTS company_sourcer_recruiter_id;
ALTER TABLE placements DROP COLUMN IF EXISTS placement_fee;

-- Restore the original recruiter_id column since we dropped it
ALTER TABLE placements ADD COLUMN recruiter_id UUID REFERENCES recruiters(id);
CREATE INDEX idx_placements_recruiter_id ON placements(recruiter_id);
COMMENT ON COLUMN placements.recruiter_id IS 'Recruiter associated with the placement';