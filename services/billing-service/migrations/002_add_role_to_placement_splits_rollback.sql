-- Rollback: Remove role column from placement_splits
-- Migration: 002_add_role_to_placement_splits (rollback)

-- Drop indexes
DROP INDEX IF EXISTS idx_placement_splits_placement_role;
DROP INDEX IF EXISTS idx_placement_splits_role;

-- Restore original unique constraint
ALTER TABLE placement_splits 
DROP CONSTRAINT IF EXISTS unique_placement_recruiter_role,
ADD CONSTRAINT placement_splits_placement_id_recruiter_id_key UNIQUE (placement_id, recruiter_id);

-- Remove role column
ALTER TABLE placement_splits DROP COLUMN IF EXISTS role;
