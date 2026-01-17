-- Rollback for Migration 030: Create Sourcer Tables
-- Purpose: Remove company_sourcers and revert candidate_sourcers field naming
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Drop company_sourcers table (CASCADE removes all constraints/indexes)
DROP TABLE IF EXISTS company_sourcers CASCADE;

-- Step 2: Revert candidate_sourcers index
DROP INDEX IF EXISTS idx_candidate_sourcers_recruiter;

CREATE INDEX idx_candidate_sourcers_user ON candidate_sourcers(sourcer_user_id);

-- Step 3: Revert candidate_sourcers foreign key constraint
ALTER TABLE candidate_sourcers
DROP CONSTRAINT IF EXISTS candidate_sourcers_sourcer_recruiter_id_fkey;

ALTER TABLE candidate_sourcers
ADD CONSTRAINT candidate_sourcers_sourcer_user_id_fkey 
FOREIGN KEY (sourcer_user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Step 4: Revert candidate_sourcers field naming
ALTER TABLE candidate_sourcers 
RENAME COLUMN sourcer_recruiter_id TO sourcer_user_id;

COMMIT;
