-- Migration 031: Add Job Owner Recruiter
-- Purpose: Add job_owner_recruiter_id to jobs table (Specs Owner role)
-- Business Rule: Only recruiters who create job postings get job owner commission
-- Author: GitHub Copilot
-- Date: 2026-01-16

BEGIN;

-- Step 1: Add job_owner_recruiter_id column (nullable - company employees can create jobs without commission)
ALTER TABLE jobs 
ADD COLUMN job_owner_recruiter_id UUID REFERENCES recruiters(id) ON DELETE SET NULL;

-- Step 2: Create index for job owner lookups
CREATE INDEX idx_jobs_owner_recruiter ON jobs(job_owner_recruiter_id) 
WHERE job_owner_recruiter_id IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN jobs.job_owner_recruiter_id IS 'Recruiter who created this job posting (Specs Owner role) - only recruiters receive job owner commission, nullable for company employee-created jobs';

-- Step 4: Backfill existing jobs (optional - set to NULL for now, can be updated manually)
-- Note: Existing jobs created by recruiters can be identified and updated separately if needed
UPDATE jobs
SET job_owner_recruiter_id = NULL
WHERE job_owner_recruiter_id IS NULL;

COMMIT;
