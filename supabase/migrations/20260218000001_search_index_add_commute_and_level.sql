-- Update job search index to include commute_types and job_level
-- Part of Phase 10 - Frontend & Search (Plan 03)
-- This migration adds commute_types and job_level to job search metadata and context

-- ============================================================================
-- 1. UPDATE sync_job_to_search_index() FUNCTION
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
        -- Reuse search_vector from jobs table (already populated by BEFORE trigger)
        NEW.search_vector,
        jsonb_build_object(
            'company_name', NEW.company_name,
            'location', NEW.location,
            'employment_type', NEW.employment_type,
            'department', NEW.department,
            'status', NEW.status,
            'company_industry', NEW.company_industry,
            'commute_types', COALESCE(to_jsonb(NEW.commute_types), '[]'::jsonb),
            'job_level', NEW.job_level
        ),
        NEW.company_id, -- jobs are scoped to companies
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
-- 2. UPDATE cascade_company_to_job_search_index() FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION search.cascade_company_to_job_search_index() RETURNS trigger AS $$
BEGIN
    -- When a company changes, re-sync all its jobs to search_index
    -- The jobs table already has triggers that update denormalized company fields
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
            'job_level', j.job_level
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
-- 3. BACKFILL EXISTING JOB ENTRIES IN SEARCH_INDEX
-- ============================================================================

UPDATE search.search_index si
SET
    context = CONCAT_WS(' ', j.title, j.description, j.recruiter_description, j.candidate_description, j.company_name, j.company_industry, j.company_headquarters_location, j.location, j.employment_type, j.department, j.status, array_to_string(j.commute_types, ' '), j.job_level),
    metadata = jsonb_build_object(
        'company_name', j.company_name,
        'location', j.location,
        'employment_type', j.employment_type,
        'department', j.department,
        'status', j.status,
        'company_industry', j.company_industry,
        'commute_types', COALESCE(to_jsonb(j.commute_types), '[]'::jsonb),
        'job_level', j.job_level
    ),
    updated_at = now()
FROM public.jobs j
WHERE si.entity_type = 'job'
  AND si.entity_id = j.id;

/*
============================================================================
VERIFICATION QUERIES (run manually after migration)
============================================================================

-- 1. Check metadata now includes commute_types and job_level
SELECT entity_id, metadata->>'job_level' as level, metadata->'commute_types' as commute
FROM search.search_index
WHERE entity_type = 'job'
LIMIT 5;

-- 2. Test search for "remote" returns jobs with remote commute type
SELECT entity_id, title, metadata->'commute_types' as commute
FROM search.search_index
WHERE entity_type = 'job'
  AND context ILIKE '%remote%';

-- 3. Test search for "senior" returns jobs with senior level
SELECT entity_id, title, metadata->>'job_level' as level
FROM search.search_index
WHERE entity_type = 'job'
  AND context ILIKE '%senior%';

-- 4. Verify all job entries have the new metadata fields
SELECT
    COUNT(*) as total_jobs,
    COUNT(*) FILTER (WHERE metadata ? 'commute_types') as with_commute_types,
    COUNT(*) FILTER (WHERE metadata ? 'job_level') as with_job_level
FROM search.search_index
WHERE entity_type = 'job';
*/
