-- Migration: Backfill candidate_role_assignments from existing applications
-- Creates assignment records for all existing applications with recruiters
-- This establishes fiscal tracking and recruiter attribution per candidate-job pairing

BEGIN;

-- Step 1: Backfill assignments from applications
INSERT INTO candidate_role_assignments (
    id,
    job_id,
    candidate_id,
    recruiter_id,
    state,
    proposed_at,
    accepted_at,
    submitted_at,
    closed_at,
    proposed_by,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid() as id,
    a.job_id,
    a.candidate_id,
    a.recruiter_id,
    -- Infer state from application stage
    CASE 
        WHEN a.stage IN ('hired', 'rejected') THEN 'closed'
        WHEN a.stage IN ('submitted', 'interview', 'offer') THEN 'submitted'
        WHEN a.stage = 'screen' THEN 'accepted'
        ELSE 'accepted' -- Default for older applications
    END as state,
    a.created_at as proposed_at,
    a.created_at as accepted_at, -- Assume immediate acceptance for backfill
    CASE 
        WHEN a.stage IN ('submitted', 'interview', 'offer', 'hired', 'rejected') THEN a.created_at
        ELSE NULL
    END as submitted_at,
    CASE 
        WHEN a.stage IN ('hired', 'rejected') THEN a.updated_at
        ELSE NULL
    END as closed_at,
    a.created_by as proposed_by, -- Track who created the original application
    a.created_at,
    a.updated_at
FROM applications a
WHERE a.recruiter_id IS NOT NULL
AND NOT EXISTS (
    -- Don't create duplicates if assignment already exists
    SELECT 1 FROM candidate_role_assignments cra
    WHERE cra.job_id = a.job_id
    AND cra.candidate_id = a.candidate_id
    AND cra.recruiter_id = a.recruiter_id
);

-- Step 2: Log backfill results
DO $$
DECLARE
    backfilled_count INTEGER;
    applications_with_recruiters INTEGER;
BEGIN
    -- Count backfilled assignments
    SELECT COUNT(*) INTO backfilled_count 
    FROM candidate_role_assignments 
    WHERE proposed_at = accepted_at; -- Backfilled records have same timestamp
    
    -- Count applications with recruiters
    SELECT COUNT(*) INTO applications_with_recruiters
    FROM applications
    WHERE recruiter_id IS NOT NULL;
    
    RAISE NOTICE 'Backfilled % candidate_role_assignments from % applications with recruiters', 
        backfilled_count, applications_with_recruiters;
END $$;

-- Step 3: Verify no duplicate assignments per candidate-job pair
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT job_id, candidate_id, COUNT(*) as cnt
        FROM candidate_role_assignments
        GROUP BY job_id, candidate_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Found % duplicate assignments - migration failed', duplicate_count;
    END IF;
    
    RAISE NOTICE 'Verification passed: No duplicate assignments found';
END $$;

-- Step 4: Verify all applications with recruiters have assignments
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM applications a
    WHERE a.recruiter_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM candidate_role_assignments cra
        WHERE cra.job_id = a.job_id
        AND cra.candidate_id = a.candidate_id
        AND cra.recruiter_id = a.recruiter_id
    );
    
    IF missing_count > 0 THEN
        RAISE WARNING 'Found % applications with recruiters missing assignments', missing_count;
    ELSE
        RAISE NOTICE 'Verification passed: All applications with recruiters have assignments';
    END IF;
END $$;

COMMIT;
