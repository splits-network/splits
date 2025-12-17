-- ============================================================================
-- Migration: Add Candidate Verification Status
-- ============================================================================
-- This migration adds a verification_status field to track whether a candidate's
-- information has been verified (e.g., LinkedIn profile checked, references verified)
--
-- Status values:
-- - 'unverified': Default state when recruiter adds candidate
-- - 'pending': Verification in progress
-- - 'verified': Candidate information has been confirmed
-- - 'rejected': Verification failed (e.g., fake LinkedIn, incorrect info)
-- ============================================================================

-- Add verification_status column to ats.candidates
ALTER TABLE ats.candidates
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified'
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add index for filtering by verification status
CREATE INDEX IF NOT EXISTS idx_candidates_verification_status ON ats.candidates(verification_status);

-- Add verification metadata column for storing verification details
ALTER TABLE ats.candidates
ADD COLUMN IF NOT EXISTS verification_metadata JSONB DEFAULT '{}'::jsonb;

-- Comments
COMMENT ON COLUMN ats.candidates.verification_status IS 'Verification status: unverified (default), pending, verified, rejected';
COMMENT ON COLUMN ats.candidates.verification_metadata IS 'Additional verification details: verified_by, verified_at, verification_method, rejection_reason, etc.';

-- Add verified_at and verified_by for tracking
ALTER TABLE ats.candidates
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by_user_id UUID REFERENCES identity.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN ats.candidates.verified_at IS 'Timestamp when candidate was verified';
COMMENT ON COLUMN ats.candidates.verified_by_user_id IS 'User who verified the candidate (typically platform admin or senior recruiter)';
