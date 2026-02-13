-- Migration: Add company-level access control to search_index
-- Adds company_id column and fixes organization_id to use actual org UUIDs
-- This enables company-scoped users to only see their company's data in search

-- ============================================================================
-- 1. SCHEMA CHANGES
-- ============================================================================

ALTER TABLE search.search_index ADD COLUMN IF NOT EXISTS company_id uuid;

CREATE INDEX IF NOT EXISTS search_index_company_id_idx
    ON search.search_index (company_id);

-- ============================================================================
-- 2. UPDATE TRIGGER FUNCTIONS (CREATE OR REPLACE)
-- ============================================================================

-- --------------------------------------------------------------------------
-- 2a. CANDIDATES - No change (both NULL, marketplace entity)
-- --------------------------------------------------------------------------
-- Candidate trigger unchanged - company_id and organization_id remain NULL

-- --------------------------------------------------------------------------
-- 2b. JOBS - company_id = job.company_id, organization_id = company.identity_organization_id
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search.sync_job_to_search_index() RETURNS trigger AS $$
DECLARE
    v_organization_id uuid;
BEGIN
    -- Lookup the actual organization ID from the company
    SELECT c.identity_organization_id INTO v_organization_id
    FROM public.companies c
    WHERE c.id = NEW.company_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, company_id, updated_at)
    VALUES (
        'job',
        NEW.id,
        COALESCE(NEW.title, ''),
        CONCAT_WS(' - ', NULLIF(NEW.company_name, ''), NULLIF(NEW.location, '')),
        CONCAT_WS(' ', NEW.title, NEW.description, NEW.recruiter_description, NEW.candidate_description, NEW.company_name, NEW.company_industry, NEW.company_headquarters_location, NEW.location, NEW.employment_type, NEW.department, NEW.status),
        NEW.search_vector,
        jsonb_build_object(
            'company_name', NEW.company_name,
            'location', NEW.location,
            'employment_type', NEW.employment_type,
            'department', NEW.department,
            'status', NEW.status,
            'company_industry', NEW.company_industry
        ),
        v_organization_id,
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
        company_id = EXCLUDED.company_id,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- 2c. COMPANIES - company_id = company.id, organization_id = company.identity_organization_id
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search.sync_company_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, company_id, updated_at)
    VALUES (
        'company',
        NEW.id,
        COALESCE(NEW.name, ''),
        CONCAT_WS(' - ', NULLIF(NEW.industry, ''), NULLIF(NEW.headquarters_location, '')),
        CONCAT_WS(' ', NEW.name, NEW.description, NEW.industry, NEW.headquarters_location, NEW.company_size, NEW.website),
        NEW.search_vector,
        jsonb_build_object(
            'industry', NEW.industry,
            'headquarters_location', NEW.headquarters_location,
            'company_size', NEW.company_size,
            'website', NEW.website
        ),
        NEW.identity_organization_id,
        NEW.id,
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
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- 2d. APPLICATIONS - company_id + organization_id from job → company lookup
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search.sync_application_to_search_index() RETURNS trigger AS $$
DECLARE
    v_company_id uuid;
    v_organization_id uuid;
BEGIN
    -- Lookup company_id from job, then organization_id from company
    SELECT j.company_id, c.identity_organization_id
    INTO v_company_id, v_organization_id
    FROM public.jobs j
    LEFT JOIN public.companies c ON c.id = j.company_id
    WHERE j.id = NEW.job_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, company_id, updated_at)
    VALUES (
        'application',
        NEW.id,
        COALESCE(NEW.candidate_name, '') || ' - ' || COALESCE(NEW.job_title, ''),
        CONCAT_WS(' at ', NULLIF(NEW.job_title, ''), NULLIF(NEW.company_name, '')),
        CONCAT_WS(' ', NEW.candidate_name, NEW.candidate_email, NEW.job_title, NEW.company_name, NEW.stage),
        NEW.search_vector,
        jsonb_build_object('candidate_name', NEW.candidate_name, 'candidate_email', NEW.candidate_email, 'job_title', NEW.job_title, 'company_name', NEW.company_name, 'stage', NEW.stage),
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
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- 2e. PLACEMENTS - company_id = placement.company_id, organization_id from company
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search.sync_placement_to_search_index() RETURNS trigger AS $$
DECLARE
    v_organization_id uuid;
BEGIN
    -- Lookup organization_id from company
    SELECT c.identity_organization_id INTO v_organization_id
    FROM public.companies c
    WHERE c.id = NEW.company_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, company_id, updated_at)
    VALUES (
        'placement',
        NEW.id,
        COALESCE(NEW.candidate_name, '') || ' - ' || COALESCE(NEW.job_title, ''),
        CONCAT_WS(' at ', NULLIF(NEW.job_title, ''), NULLIF(NEW.company_name, '')),
        CONCAT_WS(' ', NEW.candidate_name, NEW.candidate_email, NEW.job_title, NEW.company_name, NEW.state, CASE WHEN NEW.salary IS NOT NULL THEN NEW.salary::text ELSE '' END, NEW.failure_reason),
        NEW.search_vector,
        jsonb_build_object('candidate_name', NEW.candidate_name, 'job_title', NEW.job_title, 'company_name', NEW.company_name, 'state', NEW.state, 'salary', NEW.salary),
        v_organization_id,
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
        company_id = EXCLUDED.company_id,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------------
-- 2f. RECRUITERS - No change (both NULL, marketplace entity)
-- --------------------------------------------------------------------------
-- Recruiter trigger unchanged - company_id and organization_id remain NULL

-- --------------------------------------------------------------------------
-- 2g. RECRUITER_CANDIDATES - No change (both NULL, recruiter-scoped)
-- --------------------------------------------------------------------------
-- Recruiter_candidate trigger unchanged - scoping deferred to future migration

-- ============================================================================
-- 3. UPDATE CASCADE TRIGGERS
-- ============================================================================

-- Update cascade: when company identity_organization_id changes, update all related search entries
CREATE OR REPLACE FUNCTION search.cascade_company_to_job_search_index() RETURNS trigger AS $$
BEGIN
    -- Update job search entries for this company
    UPDATE search.search_index si
    SET
        subtitle = CONCAT_WS(' - ', NULLIF(j.company_name, ''), NULLIF(j.location, '')),
        metadata = jsonb_build_object(
            'company_name', j.company_name,
            'location', j.location,
            'employment_type', j.employment_type,
            'department', j.department,
            'status', j.status,
            'company_industry', j.company_industry
        ),
        search_vector = j.search_vector,
        organization_id = NEW.identity_organization_id,
        updated_at = now()
    FROM public.jobs j
    WHERE si.entity_type = 'job'
      AND si.entity_id = j.id
      AND j.company_id = NEW.id;

    -- Update company's own search entry organization_id
    UPDATE search.search_index
    SET organization_id = NEW.identity_organization_id,
        updated_at = now()
    WHERE entity_type = 'company'
      AND entity_id = NEW.id;

    -- Update application search entries for jobs in this company
    UPDATE search.search_index si
    SET organization_id = NEW.identity_organization_id,
        company_id = NEW.id,
        updated_at = now()
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    WHERE si.entity_type = 'application'
      AND si.entity_id = a.id
      AND j.company_id = NEW.id;

    -- Update placement search entries for this company
    UPDATE search.search_index si
    SET organization_id = NEW.identity_organization_id,
        updated_at = now()
    WHERE si.entity_type = 'placement'
      AND si.company_id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to include identity_organization_id in the watched columns
DROP TRIGGER IF EXISTS cascade_company_to_job_search_index ON public.companies;
CREATE TRIGGER cascade_company_to_job_search_index
AFTER UPDATE OF name, industry, headquarters_location, identity_organization_id ON public.companies
FOR EACH ROW
EXECUTE FUNCTION search.cascade_company_to_job_search_index();

-- ============================================================================
-- 4. BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill jobs: set company_id and correct organization_id
UPDATE search.search_index si
SET
    company_id = j.company_id,
    organization_id = c.identity_organization_id
FROM public.jobs j
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE si.entity_type = 'job'
  AND si.entity_id = j.id;

-- Backfill companies: set company_id and correct organization_id
UPDATE search.search_index si
SET
    company_id = co.id,
    organization_id = co.identity_organization_id
FROM public.companies co
WHERE si.entity_type = 'company'
  AND si.entity_id = co.id;

-- Backfill applications: set company_id and organization_id via job → company
UPDATE search.search_index si
SET
    company_id = j.company_id,
    organization_id = c.identity_organization_id
FROM public.applications a
JOIN public.jobs j ON j.id = a.job_id
LEFT JOIN public.companies c ON c.id = j.company_id
WHERE si.entity_type = 'application'
  AND si.entity_id = a.id;

-- Backfill placements: set company_id and organization_id via company
UPDATE search.search_index si
SET
    company_id = p.company_id,
    organization_id = c.identity_organization_id
FROM public.placements p
LEFT JOIN public.companies c ON c.id = p.company_id
WHERE si.entity_type = 'placement'
  AND si.entity_id = p.id;

-- Candidates, recruiters, recruiter_candidates: already NULL, no update needed

-- ============================================================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================================================

/*
-- 1. Verify company_id and organization_id population
SELECT entity_type,
       COUNT(*) as total,
       COUNT(company_id) as with_company_id,
       COUNT(organization_id) as with_org_id
FROM search.search_index
GROUP BY entity_type
ORDER BY entity_type;

-- Expected:
-- application: with_company_id > 0, with_org_id > 0
-- candidate: with_company_id = 0, with_org_id = 0
-- company: with_company_id > 0, with_org_id > 0
-- job: with_company_id > 0, with_org_id > 0
-- placement: with_company_id > 0, with_org_id > 0
-- recruiter: with_company_id = 0, with_org_id = 0
-- recruiter_candidate: with_company_id = 0, with_org_id = 0

-- 2. Verify organization_id is actual org UUID (not company UUID)
SELECT si.entity_type, si.entity_id, si.company_id, si.organization_id,
       c.id as company_uuid, c.identity_organization_id as org_uuid
FROM search.search_index si
JOIN public.companies c ON c.id = si.company_id
WHERE si.entity_type = 'job'
LIMIT 5;

-- Expected: si.organization_id = c.identity_organization_id (NOT c.id)
*/
