-- Migration: 037_add_placement_role_columns.sql
-- Phase 4: Add 5 separate role fields to placements table for referential approach
-- This replaces the single recruiter_id with specific role fields

-- Add 5 separate role columns for placement attribution
ALTER TABLE placements ADD COLUMN candidate_recruiter_id UUID REFERENCES recruiters(id);
ALTER TABLE placements ADD COLUMN company_recruiter_id UUID REFERENCES recruiters(id);  
ALTER TABLE placements ADD COLUMN job_owner_recruiter_id UUID REFERENCES recruiters(id);
ALTER TABLE placements ADD COLUMN candidate_sourcer_recruiter_id UUID REFERENCES recruiters(id);
ALTER TABLE placements ADD COLUMN company_sourcer_recruiter_id UUID REFERENCES recruiters(id);

-- Add placement_fee column for money calculations
ALTER TABLE placements ADD COLUMN placement_fee NUMERIC CHECK (placement_fee >= 0);

-- Add indexes for performance
CREATE INDEX idx_placements_candidate_recruiter_id ON placements(candidate_recruiter_id);
CREATE INDEX idx_placements_company_recruiter_id ON placements(company_recruiter_id);
CREATE INDEX idx_placements_job_owner_recruiter_id ON placements(job_owner_recruiter_id);
CREATE INDEX idx_placements_candidate_sourcer_recruiter_id ON placements(candidate_sourcer_recruiter_id);
CREATE INDEX idx_placements_company_sourcer_recruiter_id ON placements(company_sourcer_recruiter_id);

-- Add comments for documentation
COMMENT ON COLUMN placements.candidate_recruiter_id IS 'Recruiter representing the candidate (Closer role)';
COMMENT ON COLUMN placements.company_recruiter_id IS 'Recruiter representing the company (Client/Hiring Facilitator role)';
COMMENT ON COLUMN placements.job_owner_recruiter_id IS 'Recruiter who created the job posting (Specs Owner role)';
COMMENT ON COLUMN placements.candidate_sourcer_recruiter_id IS 'Recruiter who first brought the candidate to platform (Discovery role)';
COMMENT ON COLUMN placements.company_sourcer_recruiter_id IS 'Recruiter who first brought the company to platform (BD role)';
COMMENT ON COLUMN placements.placement_fee IS 'Total placement fee amount in USD';

-- Drop the old single recruiter_id column since we now have specific role columns
ALTER TABLE placements DROP COLUMN recruiter_id;