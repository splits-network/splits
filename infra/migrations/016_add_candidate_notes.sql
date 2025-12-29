-- Migration 016: Add candidate_notes column to applications table
-- Allows candidates to add their own notes when submitting applications
-- Created: December 29, 2025

BEGIN;

-- =============================================================================
-- 1. Add candidate_notes column
-- =============================================================================

ALTER TABLE ats.applications 
    ADD COLUMN IF NOT EXISTS candidate_notes TEXT;

COMMENT ON COLUMN ats.applications.candidate_notes IS 'Notes added by the candidate when submitting their application (e.g., cover letter, additional context, reasons for interest)';

-- =============================================================================
-- 2. Add index for searching candidate notes (optional, for future full-text search)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_applications_candidate_notes 
    ON ats.applications USING gin(to_tsvector('english', candidate_notes))
    WHERE candidate_notes IS NOT NULL;

COMMIT;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Verification:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'ats' AND table_name = 'applications' AND column_name = 'candidate_notes';
-- Expected: candidate_notes | text | YES | NULL
