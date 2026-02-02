-- Remove legacy single-recruiter fields and triggers from placements table
-- These are no longer needed with the new multi-recruiter placement model
-- Created: 2026-02-02

-- 1. Drop the trigger that was causing the error
DROP TRIGGER IF EXISTS sync_placements_recruiter_data_trigger ON public.users;

-- 2. Drop the trigger function
DROP FUNCTION IF EXISTS sync_placements_recruiter_data();

-- 3. Remove the legacy recruiter name and email columns from placements
ALTER TABLE public.placements 
DROP COLUMN IF EXISTS recruiter_name,
DROP COLUMN IF EXISTS recruiter_email;

-- 4. Update the search vector function to not include the removed fields
-- (The search vector should now use the specific recruiter role fields)
CREATE OR REPLACE FUNCTION build_placements_search_vector(
    candidate_name text,
    candidate_email text,
    job_title text,
    company_name text,
    state text,
    salary numeric,
    failure_reason text
) RETURNS tsvector AS $$
BEGIN
    RETURN to_tsvector('english', 
        COALESCE(candidate_name, '') || ' ' ||
        COALESCE(candidate_email, '') || ' ' ||
        COALESCE(job_title, '') || ' ' ||
        COALESCE(company_name, '') || ' ' ||
        COALESCE(state, '') || ' ' ||
        COALESCE(salary::text, '') || ' ' ||
        COALESCE(failure_reason, '')
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Update existing placement search vectors with the new function signature
UPDATE public.placements
SET search_vector = build_placements_search_vector(
    candidate_name,
    candidate_email,
    job_title,
    company_name,
    state,
    salary,
    failure_reason
)
WHERE search_vector IS NOT NULL;