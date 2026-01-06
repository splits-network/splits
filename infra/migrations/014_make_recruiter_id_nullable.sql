-- Migration 014: Make recruiter_id nullable for direct candidate applications
-- Allows candidates to apply directly without a recruiter
-- Created: December 20, 2025

BEGIN;

-- =============================================================================
-- 1. Make recruiter_id nullable in applications table
-- =============================================================================

ALTER TABLE applications 
    ALTER COLUMN recruiter_id DROP NOT NULL;

COMMENT ON COLUMN applications.recruiter_id IS 'Recruiter who submitted the application (NULL for direct candidate applications)';

-- =============================================================================
-- 2. Add application_source column to track origin
-- =============================================================================

ALTER TABLE applications 
    ADD COLUMN IF NOT EXISTS application_source VARCHAR(50) DEFAULT 'direct' 
    CHECK (application_source IN ('direct', 'recruiter'));

COMMENT ON COLUMN applications.application_source IS 'Source of application: direct (candidate self-service) or recruiter (submitted by recruiter)';

-- Update existing applications to have 'recruiter' source (they all have recruiters)
UPDATE applications SET application_source = 'recruiter' WHERE recruiter_id IS NOT NULL;

-- =============================================================================
-- 3. Add index for direct applications
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_applications_direct 
    ON applications(candidate_id, stage) 
    WHERE recruiter_id IS NULL;

COMMIT;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Verification:
-- SELECT column_name, is_nullable FROM information_schema.columns 
-- WHERE table_schema = 'ats' AND table_name = 'applications' AND column_name = 'recruiter_id';
-- Expected: is_nullable = YES
