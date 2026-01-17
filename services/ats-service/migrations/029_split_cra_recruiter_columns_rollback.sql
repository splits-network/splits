-- Rollback for Migration 029: Split CRA Recruiter Columns
-- Purpose: Revert split recruiter columns back to single recruiter_id
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Drop new indexes
DROP INDEX IF EXISTS idx_cra_candidate_recruiter;
DROP INDEX IF EXISTS idx_cra_company_recruiter;
DROP INDEX IF EXISTS idx_cra_current_gate;
DROP INDEX IF EXISTS idx_cra_routing_flags;

-- Step 2: Drop gate routing columns
ALTER TABLE candidate_role_assignments 
DROP COLUMN IF EXISTS has_company_recruiter,
DROP COLUMN IF EXISTS has_candidate_recruiter,
DROP COLUMN IF EXISTS gate_history,
DROP COLUMN IF EXISTS gate_sequence,
DROP COLUMN IF EXISTS current_gate;

-- Step 3: Drop company_recruiter_id column
ALTER TABLE candidate_role_assignments 
DROP COLUMN IF EXISTS company_recruiter_id;

-- Step 4: Rename candidate_recruiter_id back to recruiter_id
ALTER TABLE candidate_role_assignments 
RENAME COLUMN candidate_recruiter_id TO recruiter_id;

-- Step 5: Recreate old index
CREATE INDEX idx_cra_recruiter ON candidate_role_assignments(recruiter_id) 
WHERE recruiter_id IS NOT NULL;

COMMIT;
