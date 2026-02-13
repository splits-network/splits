-- Add structured resume metadata to candidates table
-- Stores AI-extracted professional data (experience, skills, education, certifications)
-- from the candidate's primary resume. No PII - contact info lives on the candidate record.

-- ============================================================================
-- STEP 1: Add resume_metadata JSONB column
-- ============================================================================

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS resume_metadata JSONB DEFAULT NULL;

-- GIN index for JSONB containment queries (e.g., skills matching)
CREATE INDEX IF NOT EXISTS idx_candidates_resume_metadata
ON candidates USING GIN (resume_metadata);

COMMENT ON COLUMN candidates.resume_metadata IS
    'Structured metadata AI-extracted from primary resume. Contains experience[], education[], skills[], certifications[], and computed totals. No PII.';

-- ============================================================================
-- STEP 2: Update build_candidates_search_vector() with resume text parameter
-- New parameter has DEFAULT so existing calls continue to work
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."build_candidates_search_vector"(
    "p_full_name" "text",
    "p_email" "text",
    "p_current_title" "text",
    "p_current_company" "text",
    "p_skills" "text",
    "p_bio" "text",
    "p_location" "text",
    "p_phone" "text",
    "p_desired_job_type" "text",
    "p_linkedin_url" "text",
    "p_github_url" "text",
    "p_portfolio_url" "text",
    "p_resume_text" "text" DEFAULT ''
) RETURNS "tsvector"
    LANGUAGE "plpgsql" IMMUTABLE
AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_full_name, '')), 'A') ||
        -- Replace special chars in email with spaces so "test2" can match "bkorous+test2@gmail.com"
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_email, '[@+._-]', ' ', 'g'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_title, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_skills, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_bio, '')), 'B') ||
        setweight(to_tsvector('english', LEFT(COALESCE(p_resume_text, ''), 10000)), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        -- Replace special chars in phone for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_phone, '[^0-9]', ' ', 'g'), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_desired_job_type, '')), 'C') ||
        -- Replace special chars in URLs for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_linkedin_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_github_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_portfolio_url, '[/:._-]', ' ', 'g'), '')), 'D');
END;
$$;

-- ============================================================================
-- STEP 3: Update trigger to flatten resume_metadata into search text
-- ============================================================================

CREATE OR REPLACE FUNCTION "public"."update_candidates_search_vector"() RETURNS "trigger"
    LANGUAGE "plpgsql"
AS $$
DECLARE
    resume_text text := '';
    skill_names text;
    exp_text text;
    edu_text text;
    cert_text text;
BEGIN
    IF NEW.resume_metadata IS NOT NULL THEN
        -- Skill names
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
        NEW.skills,
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
-- STEP 4: Update search.sync_candidate_to_search_index() to include resume metadata
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_candidate_to_search_index() RETURNS trigger AS $$
DECLARE
    resume_text text := '';
    skill_names text;
    exp_text text;
    edu_text text;
    cert_text text;
BEGIN
    IF NEW.resume_metadata IS NOT NULL THEN
        SELECT string_agg(elem->>'name', ' ') INTO skill_names
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'skills', '[]'::jsonb)) AS elem;

        SELECT string_agg(
            COALESCE(elem->>'title', '') || ' ' || COALESCE(elem->>'company', ''), ' '
        ) INTO exp_text
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'experience', '[]'::jsonb)) AS elem;

        SELECT string_agg(
            COALESCE(elem->>'institution', '') || ' ' ||
            COALESCE(elem->>'field_of_study', '') || ' ' ||
            COALESCE(elem->>'degree', ''), ' '
        ) INTO edu_text
        FROM jsonb_array_elements(COALESCE(NEW.resume_metadata->'education', '[]'::jsonb)) AS elem;

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

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'candidate',
        NEW.id,
        COALESCE(NEW.full_name, ''),
        COALESCE(
            NULLIF(
                CONCAT_WS(' - ',
                    NULLIF(CONCAT_WS(' at ', NULLIF(NEW.current_title, ''), NULLIF(NEW.current_company, '')), ''),
                    NULLIF(NEW.location, '')
                ),
                ''
            ),
            ''
        ),
        CONCAT_WS(' ', NEW.full_name, NEW.email, NEW.current_title, NEW.current_company, NEW.skills, NEW.bio, NEW.location, NEW.phone, NEW.desired_job_type, NEW.linkedin_url, NEW.github_url, NEW.portfolio_url, resume_text),
        -- Build search_vector using same weighting as build_candidates_search_vector()
        build_candidates_search_vector(
            NEW.full_name, NEW.email, NEW.current_title, NEW.current_company,
            NEW.skills, NEW.bio, NEW.location, NEW.phone,
            NEW.desired_job_type, NEW.linkedin_url, NEW.github_url, NEW.portfolio_url,
            resume_text
        ),
        jsonb_build_object(
            'email', NEW.email,
            'location', NEW.location,
            'current_title', NEW.current_title,
            'current_company', NEW.current_company,
            'skills', NEW.skills,
            'total_years_experience', NEW.resume_metadata->>'total_years_experience',
            'highest_degree', NEW.resume_metadata->>'highest_degree'
        ),
        NULL, -- candidates are not org-scoped; access control applied at query time
        now()
    )
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        context = EXCLUDED.context,
        search_vector = EXCLUDED.search_vector,
        metadata = EXCLUDED.metadata,
        organization_id = EXCLUDED.organization_id,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
