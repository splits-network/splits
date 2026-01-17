-- Add role column to placement_splits for multi-role attribution
-- This allows one recruiter to have multiple rows for multiple roles
-- Migration: 002_add_role_to_placement_splits
-- Date: 2026-01-17

-- Add role column with CHECK constraint for valid roles
ALTER TABLE placement_splits 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'candidate_recruiter'
CHECK (role IN (
    'candidate_recruiter',
    'company_recruiter',
    'job_owner',
    'candidate_sourcer',
    'company_sourcer'
));

-- Update unique constraint to prevent duplicate role assignments
-- (one recruiter can only fill one role per placement)
ALTER TABLE placement_splits 
DROP CONSTRAINT IF EXISTS placement_splits_placement_id_recruiter_id_key,
ADD CONSTRAINT unique_placement_recruiter_role UNIQUE (placement_id, recruiter_id, role);

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_placement_splits_role ON placement_splits(role);
CREATE INDEX IF NOT EXISTS idx_placement_splits_placement_role ON placement_splits(placement_id, role);

-- Add comment
COMMENT ON COLUMN placement_splits.role IS 'Commission role for this split - determines what this recruiter did to earn this allocation';

-- Note: Existing rows will default to 'candidate_recruiter' role
-- Run backfill script if needed to correctly set roles from placement_snapshot
