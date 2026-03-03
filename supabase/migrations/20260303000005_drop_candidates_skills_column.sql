-- Drop legacy candidates.skills TEXT column
-- Skills are now managed via the candidate_skills junction table
-- Also updates the search trigger to pull skills from candidate_skills

-- ============================================================================
-- 1. UPDATE SEARCH TRIGGER — replace NEW.skills with candidate_skills subquery
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_candidate_to_search_index() RETURNS trigger AS $$
DECLARE
    skills_text TEXT;
BEGIN
    -- Build skills text from candidate_skills junction table
    SELECT string_agg(s.name, ' ') INTO skills_text
    FROM public.candidate_skills cs
    JOIN public.skills s ON s.id = cs.skill_id
    WHERE cs.candidate_id = NEW.id;

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
        CONCAT_WS(' ', NEW.full_name, NEW.email, NEW.current_title, NEW.current_company, skills_text, NEW.bio, NEW.location, NEW.phone, NEW.desired_job_type, NEW.linkedin_url, NEW.github_url, NEW.portfolio_url),
        setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.email, '[@+._-]', ' ', 'g'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.current_title, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.current_company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(skills_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.phone, '[^0-9]', ' ', 'g'), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.desired_job_type, '')), 'C') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.linkedin_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.github_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.portfolio_url, '[/:._-]', ' ', 'g'), '')), 'D'),
        jsonb_build_object(
            'email', NEW.email,
            'location', NEW.location,
            'current_title', NEW.current_title,
            'current_company', NEW.current_company,
            'skills', skills_text,
            'desired_job_type', NEW.desired_job_type,
            'desired_salary_min', NEW.desired_salary_min,
            'desired_salary_max', NEW.desired_salary_max,
            'open_to_remote', NEW.open_to_remote,
            'open_to_relocation', NEW.open_to_relocation,
            'availability', NEW.availability
        ),
        NULL,
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

-- ============================================================================
-- 2. TRIGGER ON candidate_skills — refresh parent candidate's search index
-- ============================================================================

CREATE OR REPLACE FUNCTION search.refresh_candidate_search_on_skill_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Touch the candidate's updated_at to re-fire the search sync trigger
    UPDATE public.candidates
    SET updated_at = NOW()
    WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_candidate_skills_search_refresh
AFTER INSERT OR DELETE ON public.candidate_skills
FOR EACH ROW EXECUTE FUNCTION search.refresh_candidate_search_on_skill_change();

-- ============================================================================
-- 3. DROP THE LEGACY COLUMN
-- ============================================================================

ALTER TABLE public.candidates DROP COLUMN IF EXISTS skills;

-- ============================================================================
-- 4. BACKFILL search index metadata with skills from candidate_skills
-- ============================================================================

UPDATE search.search_index si
SET
    metadata = si.metadata || jsonb_build_object(
        'skills', (
            SELECT string_agg(s.name, ', ')
            FROM public.candidate_skills cs
            JOIN public.skills s ON s.id = cs.skill_id
            WHERE cs.candidate_id = si.entity_id
        )
    ),
    updated_at = now()
WHERE si.entity_type = 'candidate';
