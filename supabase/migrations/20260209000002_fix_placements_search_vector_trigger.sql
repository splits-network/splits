-- Fix all placement search vector trigger functions
-- Migration 20260202000001 dropped recruiter_name/recruiter_email columns from placements
-- and created a new 7-param build_placements_search_vector, but didn't update the
-- trigger functions that call it. This causes "record new has no field recruiter_name" errors.

-- 1. Fix the BEFORE INSERT/UPDATE trigger on placements
CREATE OR REPLACE FUNCTION "public"."update_placements_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.search_vector := build_placements_search_vector(
        NEW.candidate_name,
        NEW.candidate_email,
        NEW.job_title,
        NEW.company_name,
        NEW.state,
        NEW.salary,
        NEW.failure_reason
    );
    RETURN NEW;
END;
$$;

-- 2. Fix sync trigger when candidate data changes (trigger on candidates table)
CREATE OR REPLACE FUNCTION "public"."sync_placements_candidate_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.placements
    SET
        candidate_name = NEW.full_name,
        candidate_email = NEW.email,
        search_vector = build_placements_search_vector(
            NEW.full_name,
            NEW.email,
            job_title,
            company_name,
            state,
            salary,
            failure_reason
        )
    WHERE candidate_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 3. Fix sync trigger when company data changes (trigger on companies table)
CREATE OR REPLACE FUNCTION "public"."sync_placements_company_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE public.placements p
    SET
        company_name = NEW.name,
        search_vector = build_placements_search_vector(
            p.candidate_name,
            p.candidate_email,
            p.job_title,
            NEW.name,
            p.state,
            p.salary,
            p.failure_reason
        )
    FROM public.jobs j
    WHERE p.job_id = j.id AND j.company_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 4. Fix sync trigger when job data changes (trigger on jobs table)
CREATE OR REPLACE FUNCTION "public"."sync_placements_job_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_company_name TEXT;
BEGIN
    SELECT c.name INTO v_company_name
    FROM public.companies c
    WHERE c.id = NEW.company_id;

    UPDATE public.placements
    SET
        job_title = NEW.title,
        company_name = v_company_name,
        search_vector = build_placements_search_vector(
            candidate_name,
            candidate_email,
            NEW.title,
            v_company_name,
            state,
            salary,
            failure_reason
        )
    WHERE job_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 5. Drop the old 9-param overload of build_placements_search_vector (no longer needed)
DROP FUNCTION IF EXISTS "public"."build_placements_search_vector"(text, text, text, text, text, text, text, numeric, text);
