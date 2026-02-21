-- Enrich search_index metadata for advanced field-level filtering
-- Adds salary, relocation, and candidate preference fields to metadata
-- Adds GIN index on metadata for filter query performance

-- ============================================================================
-- 1. GIN INDEX ON METADATA FOR FILTER PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS search_index_metadata_gin
    ON search.search_index USING GIN (metadata jsonb_path_ops);

-- ============================================================================
-- 2. UPDATE CANDIDATE TRIGGER — add preference fields to metadata
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_candidate_to_search_index() RETURNS trigger AS $$
BEGIN
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
        CONCAT_WS(' ', NEW.full_name, NEW.email, NEW.current_title, NEW.current_company, NEW.skills, NEW.bio, NEW.location, NEW.phone, NEW.desired_job_type, NEW.linkedin_url, NEW.github_url, NEW.portfolio_url),
        setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(NEW.email, '[@+._-]', ' ', 'g'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.current_title, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.current_company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.skills, '')), 'B') ||
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
            'skills', NEW.skills,
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
-- 3. UPDATE JOB TRIGGER — add salary + relocation to metadata
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_job_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'job',
        NEW.id,
        COALESCE(NEW.title, ''),
        CONCAT_WS(' - ', NULLIF(NEW.company_name, ''), NULLIF(NEW.location, '')),
        CONCAT_WS(' ', NEW.title, NEW.description, NEW.recruiter_description, NEW.candidate_description, NEW.company_name, NEW.company_industry, NEW.company_headquarters_location, NEW.location, NEW.employment_type, NEW.department, NEW.status, array_to_string(NEW.commute_types, ' '), NEW.job_level),
        NEW.search_vector,
        jsonb_build_object(
            'company_name', NEW.company_name,
            'location', NEW.location,
            'employment_type', NEW.employment_type,
            'department', NEW.department,
            'status', NEW.status,
            'company_industry', NEW.company_industry,
            'commute_types', COALESCE(to_jsonb(NEW.commute_types), '[]'::jsonb),
            'job_level', NEW.job_level,
            'salary_min', NEW.salary_min,
            'salary_max', NEW.salary_max,
            'open_to_relocation', NEW.open_to_relocation
        ),
        NEW.company_id,
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
-- 4. UPDATE CASCADE TRIGGER — include new fields in company cascade
-- ============================================================================

CREATE OR REPLACE FUNCTION search.cascade_company_to_job_search_index() RETURNS trigger AS $$
BEGIN
    UPDATE search.search_index si
    SET
        subtitle = CONCAT_WS(' - ', NULLIF(j.company_name, ''), NULLIF(j.location, '')),
        metadata = jsonb_build_object(
            'company_name', j.company_name,
            'location', j.location,
            'employment_type', j.employment_type,
            'department', j.department,
            'status', j.status,
            'company_industry', j.company_industry,
            'commute_types', COALESCE(to_jsonb(j.commute_types), '[]'::jsonb),
            'job_level', j.job_level,
            'salary_min', j.salary_min,
            'salary_max', j.salary_max,
            'open_to_relocation', j.open_to_relocation
        ),
        search_vector = j.search_vector,
        updated_at = now()
    FROM public.jobs j
    WHERE si.entity_type = 'job'
      AND si.entity_id = j.id
      AND j.company_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. BACKFILL CANDIDATE METADATA
-- ============================================================================

UPDATE search.search_index si
SET
    metadata = jsonb_build_object(
        'email', c.email,
        'location', c.location,
        'current_title', c.current_title,
        'current_company', c.current_company,
        'skills', c.skills,
        'desired_job_type', c.desired_job_type,
        'desired_salary_min', c.desired_salary_min,
        'desired_salary_max', c.desired_salary_max,
        'open_to_remote', c.open_to_remote,
        'open_to_relocation', c.open_to_relocation,
        'availability', c.availability
    ),
    updated_at = now()
FROM public.candidates c
WHERE si.entity_type = 'candidate'
  AND si.entity_id = c.id;

-- ============================================================================
-- 6. BACKFILL JOB METADATA
-- ============================================================================

UPDATE search.search_index si
SET
    metadata = jsonb_build_object(
        'company_name', j.company_name,
        'location', j.location,
        'employment_type', j.employment_type,
        'department', j.department,
        'status', j.status,
        'company_industry', j.company_industry,
        'commute_types', COALESCE(to_jsonb(j.commute_types), '[]'::jsonb),
        'job_level', j.job_level,
        'salary_min', j.salary_min,
        'salary_max', j.salary_max,
        'open_to_relocation', j.open_to_relocation
    ),
    updated_at = now()
FROM public.jobs j
WHERE si.entity_type = 'job'
  AND si.entity_id = j.id;
