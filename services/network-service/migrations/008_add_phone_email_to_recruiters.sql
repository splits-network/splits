-- Migration: Add Email and Phone to Recruiters Table
-- Description: Add email and phone fields directly to recruiters table so they don't rely on users
-- Created: 2026-01-04

-- ============================================================================
-- Add Phone to Recruiters Table
-- ============================================================================

ALTER TABLE recruiters
    ADD COLUMN phone VARCHAR(20);

COMMENT ON COLUMN recruiters.phone IS 'Recruiter phone number for direct contact';
