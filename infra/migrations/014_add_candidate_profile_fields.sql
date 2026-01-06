-- Migration 014: Add Candidate Profile Fields
-- Adds additional profile fields for candidate self-service
-- Created: December 19, 2025

BEGIN;

-- =============================================================================
-- Add Profile Fields to candidates
-- =============================================================================

-- Add professional bio/summary field
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add GitHub profile URL
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Add portfolio website URL
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- Add skills as comma-separated text (can be migrated to array later if needed)
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS skills TEXT;

-- Add comments
COMMENT ON COLUMN candidates.bio IS 'Candidate professional bio/summary';
COMMENT ON COLUMN candidates.github_url IS 'GitHub profile URL';
COMMENT ON COLUMN candidates.portfolio_url IS 'Portfolio or personal website URL';
COMMENT ON COLUMN candidates.skills IS 'Comma-separated list of skills';

COMMIT;

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- Verify new columns exist
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'ats' 
--   AND table_name = 'candidates'
--   AND column_name IN ('bio', 'github_url', 'portfolio_url', 'skills');
