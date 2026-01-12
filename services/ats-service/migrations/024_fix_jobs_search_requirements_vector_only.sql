-- Fix Jobs Search: Requirements in Vector Only (No Denormalization)
-- Removes unnecessary requirements_text column and simplifies to vector-only approach
-- Created: January 12, 2026

-- 1. Drop the problematic denormalized column and its triggers
ALTER TABLE public.jobs DROP COLUMN IF EXISTS requirements_text;

DROP TRIGGER IF EXISTS sync_jobs_requirements_data_insert_trigger ON public.job_requirements;
DROP TRIGGER IF EXISTS sync_jobs_requirements_data_update_trigger ON public.job_requirements;
DROP TRIGGER IF EXISTS sync_jobs_requirements_data_delete_trigger ON public.job_requirements;
DROP FUNCTION IF EXISTS sync_jobs_requirements_data();
DROP FUNCTION IF EXISTS aggregate_job_requirements(UUID);

-- 2. Update build_jobs_search_vector to query requirements inline
CREATE OR REPLACE FUNCTION build_jobs_search_vector(
    p_job_id UUID,
    p_title TEXT,
    p_description TEXT,
    p_recruiter_description TEXT,
    p_candidate_description TEXT,
    p_location TEXT,
    p_department TEXT,
    p_employment_type TEXT,
    p_company_name TEXT,
    p_company_industry TEXT,
    p_company_headquarters_location TEXT,
    p_status TEXT
) RETURNS tsvector AS $$
DECLARE
    requirements_text TEXT;
BEGIN
    -- Query job_requirements and concatenate for search
    SELECT string_agg(
        COALESCE(requirement_type, '') || ' ' || 
        COALESCE(description, ''),
        ' '
    ) INTO requirements_text
    FROM public.job_requirements
    WHERE job_id = p_job_id;
    
    -- Build weighted search vector including requirements
    RETURN 
        setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_recruiter_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_candidate_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(requirements_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_industry, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_headquarters_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_department, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Update the jobs trigger to include job_id for requirements query
CREATE OR REPLACE FUNCTION update_jobs_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := build_jobs_search_vector(
        NEW.id,  -- Pass job_id so function can query requirements
        NEW.title,
        NEW.description,
        NEW.recruiter_description,
        NEW.candidate_description,
        NEW.location,
        NEW.department,
        NEW.employment_type,
        NEW.company_name,
        NEW.company_industry,
        NEW.company_headquarters_location,
        NEW.status
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Add trigger on job_requirements to update parent job's search vector
CREATE OR REPLACE FUNCTION update_job_search_on_requirements_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the parent job's search_vector when requirements change
    UPDATE public.jobs
    SET search_vector = build_jobs_search_vector(
        id,
        title,
        description,
        recruiter_description,
        candidate_description,
        location,
        department,
        employment_type,
        company_name,
        company_industry,
        company_headquarters_location,
        status
    )
    WHERE id = COALESCE(NEW.job_id, OLD.job_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing requirements triggers if any
DROP TRIGGER IF EXISTS update_job_search_on_requirements_insert ON public.job_requirements;
DROP TRIGGER IF EXISTS update_job_search_on_requirements_update ON public.job_requirements;
DROP TRIGGER IF EXISTS update_job_search_on_requirements_delete ON public.job_requirements;

-- Create single trigger for all requirements changes
CREATE TRIGGER update_job_search_on_requirements_change
    AFTER INSERT OR UPDATE OR DELETE ON public.job_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_job_search_on_requirements_change();

-- 5. Rebuild all search vectors with requirements included
UPDATE public.jobs
SET search_vector = build_jobs_search_vector(
    id,
    title,
    description,
    recruiter_description,
    candidate_description,
    location,
    department,
    employment_type,
    company_name,
    company_industry,
    company_headquarters_location,
    status
);

-- 6. Verify update
DO $$
DECLARE
    updated_count INTEGER;
    jobs_with_requirements INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count FROM public.jobs WHERE search_vector IS NOT NULL;
    SELECT COUNT(DISTINCT job_id) INTO jobs_with_requirements FROM public.job_requirements;
    
    RAISE NOTICE 'Migration 024 completed:';
    RAISE NOTICE '  - Removed requirements_text column (no denormalization)';
    RAISE NOTICE '  - Updated % job search vectors', updated_count;
    RAISE NOTICE '  - % jobs have requirements data', jobs_with_requirements;
    RAISE NOTICE '  - Requirements now queried inline in search vector function';
    RAISE NOTICE '  - Single trigger handles all requirements changes (INSERT/UPDATE/DELETE)';
END $$;
