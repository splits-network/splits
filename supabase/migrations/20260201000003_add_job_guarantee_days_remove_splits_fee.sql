-- Migration: Add guarantee_days to jobs table and remove splits_fee_percentage
--
-- Purpose:
-- 1. Add configurable guarantee period per job (previously hardcoded to 90 days)
-- 2. Remove legacy splits_fee_percentage field (splits are now calculated by role)

BEGIN;

-- 1. Add guarantee_days column to jobs table with default 90 days
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS guarantee_days INTEGER DEFAULT 90;

-- Add constraint to ensure reasonable range (1-365 days)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_guarantee_days_check'
    ) THEN
        ALTER TABLE jobs ADD CONSTRAINT jobs_guarantee_days_check
            CHECK (guarantee_days >= 1 AND guarantee_days <= 365);
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN jobs.guarantee_days IS 'Placement guarantee period in days (default 90). Used to calculate when company billing is triggered.';

-- 2. Remove splits_fee_percentage column from jobs table (no longer used - splits are role-based)

-- First drop the check constraint if it exists
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_splits_fee_percentage_check;

-- Then drop the column
ALTER TABLE jobs DROP COLUMN IF EXISTS splits_fee_percentage;

COMMIT;
