-- Remove denormalized columns from applications table
-- These columns (candidate_name, candidate_email, job_title, company_name)
-- duplicate data from candidates, jobs, and companies tables via FKs.
-- The repository already JOINs to these tables for all reads.
-- These columns only fed search_vector and search_index triggers.

-- 1. Rewrite BEFORE INSERT/UPDATE trigger to JOIN for search data
CREATE OR REPLACE FUNCTION public.update_applications_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_candidate_name text;
    v_candidate_email text;
    v_job_title text;
    v_company_name text;
BEGIN
    SELECT c.full_name, c.email
    INTO v_candidate_name, v_candidate_email
    FROM public.candidates c
    WHERE c.id = NEW.candidate_id;

    SELECT j.title, COALESCE(co.name, '3rd Party Firm')
    INTO v_job_title, v_company_name
    FROM public.jobs j
    LEFT JOIN public.companies co ON co.id = j.company_id
    WHERE j.id = NEW.job_id;

    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(v_candidate_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(v_job_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(v_candidate_email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(v_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.stage, '')), 'C');
    RETURN NEW;
END;
$$;

-- 2. Rewrite cascade trigger from candidates — only rebuild search_vector via JOINs
CREATE OR REPLACE FUNCTION public.sync_applications_candidate_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.applications a
    SET search_vector = (
        SELECT
            setweight(to_tsvector('english', COALESCE(NEW.full_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(j.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(COALESCE(co.name, '3rd Party Firm'), '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(a.stage, '')), 'C')
        FROM public.jobs j
        LEFT JOIN public.companies co ON co.id = j.company_id
        WHERE j.id = a.job_id
    )
    WHERE a.candidate_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 3. Rewrite cascade trigger from jobs — only rebuild search_vector via JOINs
CREATE OR REPLACE FUNCTION public.sync_applications_job_data()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.applications a
    SET search_vector = (
        SELECT
            setweight(to_tsvector('english', COALESCE(c.full_name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(c.email, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(
                COALESCE((SELECT co.name FROM public.companies co WHERE co.id = NEW.company_id), '3rd Party Firm'),
            '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(a.stage, '')), 'C')
        FROM public.candidates c
        WHERE c.id = a.candidate_id
    )
    WHERE a.job_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 4. Rewrite search index sync to JOIN for all data
CREATE OR REPLACE FUNCTION search.sync_application_to_search_index()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    v_company_id uuid;
    v_organization_id uuid;
    v_candidate_name text;
    v_candidate_email text;
    v_job_title text;
    v_company_name text;
BEGIN
    -- Lookup candidate data
    SELECT c.full_name, c.email
    INTO v_candidate_name, v_candidate_email
    FROM public.candidates c
    WHERE c.id = NEW.candidate_id;

    -- Lookup job + company data
    SELECT j.company_id, co.identity_organization_id, j.title, COALESCE(co.name, '3rd Party Firm')
    INTO v_company_id, v_organization_id, v_job_title, v_company_name
    FROM public.jobs j
    LEFT JOIN public.companies co ON co.id = j.company_id
    WHERE j.id = NEW.job_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, company_id, updated_at)
    VALUES (
        'application',
        NEW.id,
        COALESCE(v_candidate_name, '') || ' - ' || COALESCE(v_job_title, ''),
        CONCAT_WS(' at ', NULLIF(v_job_title, ''), NULLIF(v_company_name, '')),
        CONCAT_WS(' ', v_candidate_name, v_candidate_email, v_job_title, v_company_name, NEW.stage),
        NEW.search_vector,
        jsonb_build_object(
            'candidate_name', v_candidate_name,
            'candidate_email', v_candidate_email,
            'job_title', v_job_title,
            'company_name', v_company_name,
            'stage', NEW.stage
        ),
        v_organization_id,
        v_company_id,
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
        company_id = EXCLUDED.company_id,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$;

-- 5. Drop the old build function (logic is now inline in triggers)
DROP FUNCTION IF EXISTS public.build_applications_search_vector(text, text, text, text, text);

-- 6. Drop denormalized columns
ALTER TABLE public.applications
    DROP COLUMN IF EXISTS candidate_name,
    DROP COLUMN IF EXISTS candidate_email,
    DROP COLUMN IF EXISTS job_title,
    DROP COLUMN IF EXISTS company_name;

-- 7. Backfill search vectors with correct joined data
UPDATE public.applications a
SET search_vector = (
    SELECT
        setweight(to_tsvector('english', COALESCE(c.full_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(j.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(c.email, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(COALESCE(co.name, '3rd Party Firm'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(a.stage, '')), 'C')
    FROM public.candidates c
    JOIN public.jobs j ON j.id = a.job_id
    LEFT JOIN public.companies co ON co.id = j.company_id
    WHERE c.id = a.candidate_id
);
