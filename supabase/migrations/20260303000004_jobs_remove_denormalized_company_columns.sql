-- Remove denormalized company columns from jobs table
-- company_name, company_industry, company_headquarters_location duplicate data
-- from the companies table via company_id FK.
-- For off-platform jobs (no company_id), display defaults to "3rd Party Firm".

-- 1. Rewrite build_jobs_search_vector to JOIN companies for data
CREATE OR REPLACE FUNCTION public.build_jobs_search_vector(
    p_job_id uuid,
    p_title text,
    p_description text,
    p_recruiter_description text,
    p_candidate_description text,
    p_location text,
    p_department text,
    p_employment_type text,
    p_company_id uuid,
    p_status text
) RETURNS tsvector
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    requirements_text text;
    v_company_name text;
    v_company_industry text;
    v_company_hq text;
BEGIN
    -- Get requirements text
    SELECT string_agg(
        COALESCE(requirement_type, '') || ' ' || COALESCE(description, ''),
        ' '
    ) INTO requirements_text
    FROM public.job_requirements
    WHERE job_id = p_job_id;

    -- Get company data via JOIN (NULL for off-platform jobs)
    IF p_company_id IS NOT NULL THEN
        SELECT co.name, co.industry, co.headquarters_location
        INTO v_company_name, v_company_industry, v_company_hq
        FROM public.companies co
        WHERE co.id = p_company_id;
    END IF;

    RETURN
        setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(v_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(requirements_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(v_company_industry, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(v_company_hq, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_department, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$;

-- 2. Rewrite BEFORE INSERT/UPDATE trigger
CREATE OR REPLACE FUNCTION public.update_jobs_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector := build_jobs_search_vector(
        NEW.id,
        NEW.title,
        NEW.description,
        NEW.recruiter_description,
        NEW.candidate_description,
        NEW.location,
        NEW.department,
        NEW.employment_type,
        NEW.company_id,
        NEW.status
    );
    RETURN NEW;
END;
$$;

-- 3. Rewrite cascade trigger from companies — only rebuild search_vector
CREATE OR REPLACE FUNCTION public.sync_jobs_company_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.jobs j
    SET search_vector = build_jobs_search_vector(
        j.id,
        j.title,
        j.description,
        j.recruiter_description,
        j.candidate_description,
        j.location,
        j.department,
        j.employment_type,
        j.company_id,
        j.status
    )
    WHERE j.company_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 4. Rewrite requirements change trigger
CREATE OR REPLACE FUNCTION public.update_job_search_on_requirements_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.jobs j
    SET search_vector = build_jobs_search_vector(
        j.id,
        j.title,
        j.description,
        j.recruiter_description,
        j.candidate_description,
        j.location,
        j.department,
        j.employment_type,
        j.company_id,
        j.status
    )
    WHERE j.id = COALESCE(NEW.job_id, OLD.job_id);
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 5. Rewrite job search index sync to JOIN companies for data
CREATE OR REPLACE FUNCTION search.sync_job_to_search_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_company_name text;
    v_company_industry text;
BEGIN
    -- Lookup company data via JOIN
    IF NEW.company_id IS NOT NULL THEN
        SELECT co.name, co.industry
        INTO v_company_name, v_company_industry
        FROM public.companies co
        WHERE co.id = NEW.company_id;
    END IF;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'job',
        NEW.id,
        COALESCE(NEW.title, ''),
        CONCAT_WS(' - ', NULLIF(v_company_name, ''), NULLIF(NEW.location, '')),
        CONCAT_WS(' ', NEW.title, NEW.description, NEW.recruiter_description, NEW.candidate_description, v_company_name, v_company_industry, NEW.location, NEW.employment_type, NEW.department, NEW.status, array_to_string(NEW.commute_types, ' '), NEW.job_level),
        NEW.search_vector,
        jsonb_build_object(
            'company_name', COALESCE(v_company_name, '3rd Party Firm'),
            'location', NEW.location,
            'employment_type', NEW.employment_type,
            'department', NEW.department,
            'status', NEW.status,
            'company_industry', v_company_industry,
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
$$;

-- 6. Rewrite company cascade to search index to JOIN jobs for data
CREATE OR REPLACE FUNCTION search.cascade_company_to_job_search_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE search.search_index si
    SET
        subtitle = CONCAT_WS(' - ', NULLIF(NEW.name, ''), NULLIF(j.location, '')),
        metadata = jsonb_build_object(
            'company_name', COALESCE(NEW.name, '3rd Party Firm'),
            'location', j.location,
            'employment_type', j.employment_type,
            'department', j.department,
            'status', j.status,
            'company_industry', NEW.industry,
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
$$;

-- 7. Drop old function signatures
DROP FUNCTION IF EXISTS public.build_jobs_search_vector(text, text, text, text, text, text, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.build_jobs_search_vector(uuid, text, text, text, text, text, text, text, text, text, text, text);

-- 8. Drop the trigram index on company_name
DROP INDEX IF EXISTS public.jobs_company_name_trgm_idx;

-- 9. Drop denormalized columns
ALTER TABLE public.jobs
    DROP COLUMN IF EXISTS company_name,
    DROP COLUMN IF EXISTS company_industry,
    DROP COLUMN IF EXISTS company_headquarters_location;

-- 10. Backfill search vectors
UPDATE public.jobs j
SET search_vector = build_jobs_search_vector(
    j.id,
    j.title,
    j.description,
    j.recruiter_description,
    j.candidate_description,
    j.location,
    j.department,
    j.employment_type,
    j.company_id,
    j.status
);
