-- Migration: Update guarantee_days constraint to allow 0
-- This allows companies to set no guarantee period for roles

-- Drop the existing constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_guarantee_days_check;

-- Add updated constraint that allows 0
ALTER TABLE jobs ADD CONSTRAINT jobs_guarantee_days_check
    CHECK (guarantee_days >= 0 AND guarantee_days <= 365);

-- Update comment to reflect the change
COMMENT ON COLUMN jobs.guarantee_days IS 'Placement guarantee period in days (0 = no guarantee, default 90). Used to calculate when company billing is triggered.';
