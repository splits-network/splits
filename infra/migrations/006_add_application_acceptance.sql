-- Migration 006: Add Application Acceptance Tracking
-- This migration adds fields to track when company users accept candidate submissions
-- allowing them to view full (unmasked) candidate details.

-- Add acceptance tracking to applications table
ALTER TABLE ats.applications 
ADD COLUMN IF NOT EXISTS accepted_by_company BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Add index for querying accepted applications by acceptance status
CREATE INDEX IF NOT EXISTS idx_applications_accepted 
ON ats.applications(accepted_by_company);

-- Add comment explaining the fields
COMMENT ON COLUMN ats.applications.accepted_by_company IS 
'When true, company has accepted this candidate submission and can see full candidate details';

COMMENT ON COLUMN ats.applications.accepted_at IS 
'Timestamp when company accepted this candidate submission';
