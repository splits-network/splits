-- Migration: Backfill submitted applications with company_id
-- Purpose: Update all applications in "submitted" stage to have the correct company_id
-- Company ID: 6a2b9b0b-dadf-4db8-a84f-0059d41f9b49

-- First, let's see what we're working with
-- SELECT id, candidate_id, job_id, stage, company_id, created_at 
-- FROM applications 
-- WHERE stage = 'submitted';

-- Update all applications in "submitted" stage that don't have a company_id
-- or need to be associated with this specific company
UPDATE applications
SET company_id = '6a2b9b0b-dadf-4db8-a84f-0059d41f9b49'
WHERE stage = 'submitted' 
  AND (company_id IS NULL OR company_id != '6a2b9b0b-dadf-4db8-a84f-0059d41f9b49');

-- Alternative: If you want to update based on the job's company_id instead:
-- UPDATE applications a
-- SET company_id = j.company_id
-- FROM jobs j
-- WHERE a.job_id = j.id
--   AND a.stage = 'submitted'
--   AND (a.company_id IS NULL OR a.company_id != j.company_id);

-- Verify the update
-- SELECT id, candidate_id, job_id, stage, company_id, created_at 
-- FROM applications 
-- WHERE stage = 'submitted';
