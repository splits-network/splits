-- Fix public.update_candidates_search_vector() — broken since 20260303000005
-- That migration dropped candidates.skills but forgot to update this trigger.
-- The function still referenced NEW.skills, causing runtime errors on every
-- candidate INSERT/UPDATE, leaving search_vector stale/NULL.

-- ============================================================================
-- 1. FIX THE BEFORE TRIGGER — replace NEW.skills with candidate_skills subquery
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."update_candidates_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
AS $$
DECLARE
    resume_text text := '';
    skills_text text;
    skill_names text;
    exp_text text;
    edu_text text;
    cert_text text;
BEGIN
    -- Build skills text from candidate_skills junction table (skills column was dropped)
    SELECT string_agg(s.name, ' ') INTO skills_text
    FROM public.candidate_skills cs
    JOIN public.skills s ON s.id = cs.skill_id
    WHERE cs.candidate_id = NEW.id;

    IF NEW.resume_metadata IS NOT NULL THEN
        -- Skill names from resume
        SELECT string_agg(elem->>'name', ' ') INTO skill_names
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'skills', '[]'::jsonb)) AS elem;

        -- Experience titles + companies
        SELECT string_agg(
            COALESCE(elem->>'title', '') || ' ' || COALESCE(elem->>'company', ''), ' '
        ) INTO exp_text
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'experience', '[]'::jsonb)) AS elem;

        -- Education institutions + fields + degrees
        SELECT string_agg(
            COALESCE(elem->>'institution', '') || ' ' ||
            COALESCE(elem->>'field_of_study', '') || ' ' ||
            COALESCE(elem->>'degree', ''), ' '
        ) INTO edu_text
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'education', '[]'::jsonb)) AS elem;

        -- Certifications
        SELECT string_agg(
            COALESCE(elem->>'name', '') || ' ' || COALESCE(elem->>'issuer', ''), ' '
        ) INTO cert_text
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'certifications', '[]'::jsonb)) AS elem;

        resume_text := COALESCE(skill_names, '') || ' ' ||
                       COALESCE(exp_text, '') || ' ' ||
                       COALESCE(edu_text, '') || ' ' ||
                       COALESCE(cert_text, '') || ' ' ||
                       COALESCE(NEW.resume_metadata->>'professional_summary', '');
    END IF;

    NEW.search_vector := build_candidates_search_vector(
        NEW.full_name,
        NEW.email,
        NEW.current_title,
        NEW.current_company,
        skills_text,
        NEW.bio,
        NEW.location,
        NEW.phone,
        NEW.desired_job_type,
        NEW.linkedin_url,
        NEW.github_url,
        NEW.portfolio_url,
        resume_text
    );
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. BACKFILL — re-fire trigger on all candidates to rebuild search_vector
-- ============================================================================

UPDATE public.candidates SET updated_at = NOW();
