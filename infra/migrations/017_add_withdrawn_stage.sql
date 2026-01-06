-- Migration 017: Add 'withdrawn' stage to applications
-- Allows candidates to withdraw their applications
-- Created: December 20, 2025

BEGIN;

-- Drop existing stage constraint
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_stage_check;

-- Add new constraint with 'withdrawn' stage
ALTER TABLE applications ADD CONSTRAINT applications_stage_check
    CHECK (stage IN ('draft', 'screen', 'submitted', 'interview', 'offer', 'hired', 'rejected', 'withdrawn'));

COMMENT ON CONSTRAINT applications_stage_check ON applications IS 
    'Valid application stages including withdrawn for candidate self-service';

COMMIT;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Verification:
-- 1. Check constraint: 
--    SELECT conname, pg_get_constraintdef(oid) 
--    FROM pg_constraint 
--    WHERE conname = 'applications_stage_check';
--
-- 2. Test withdrawal:
--    UPDATE applications SET stage = 'withdrawn' WHERE id = '<test-id>';
