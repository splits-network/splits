-- Migration: Fix applications search vector after notes columns were removed
-- The build_applications_search_vector and update_applications_search_vector functions
-- were referencing notes, recruiter_notes, and candidate_notes columns that no longer exist.

-- Step 1: Update build_applications_search_vector to remove notes parameters
CREATE OR REPLACE FUNCTION "public"."build_applications_search_vector"(
    "p_candidate_name" "text",
    "p_candidate_email" "text",
    "p_job_title" "text",
    "p_company_name" "text",
    "p_stage" "text"
) RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_candidate_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_job_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_stage, '')), 'C');
END;
$$;

-- Step 2: Update the trigger function to not reference notes columns
CREATE OR REPLACE FUNCTION "public"."update_applications_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_applications_search_vector(
        NEW.candidate_name,
        NEW.candidate_email,
        NEW.job_title,
        NEW.company_name,
        NEW.stage
    );
    RETURN NEW;
END;
$$;

-- Step 3: Drop the old function with the old signature (8 parameters)
-- We need to explicitly drop it because PostgreSQL keeps functions with different signatures
DROP FUNCTION IF EXISTS "public"."build_applications_search_vector"(
    "text", "text", "text", "text", "text", "text", "text", "text"
);
