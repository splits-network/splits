-- Migration: Add role field to payouts table
-- Phase 6: Commission Calculator - Enable 5-role commission tracking
-- Date: 2026-01-16

-- Add role enum column to payouts table
-- Nullable for backward compatibility with existing payout records
ALTER TABLE billing.payouts
ADD COLUMN role TEXT CHECK (role IN (
    'candidate_recruiter',  -- Closer - represents the candidate
    'company_recruiter',    -- Client/Hiring Facilitator - represents the company
    'job_owner',            -- Specs Owner - created the job posting
    'candidate_sourcer',    -- Discovery - first brought candidate to platform
    'company_sourcer'       -- BD - first brought company to platform
));

-- Add comment explaining the role field
COMMENT ON COLUMN billing.payouts.role IS 
'Commission role that earned this payout. Part of the 5-role commission structure. NULL for legacy payouts created before Phase 6.';

-- Create index on role for efficient filtering
CREATE INDEX idx_payouts_role ON billing.payouts(role) WHERE role IS NOT NULL;

-- Create composite index for placement_id + role (common query pattern)
CREATE INDEX idx_payouts_placement_role ON billing.payouts(placement_id, role);
