-- Create trigger-based sync for candidates, jobs, and companies to search.search_index
-- Part of Phase 01 - Search Infrastructure (Plan 02)
-- This migration establishes real-time sync for the three "primary" entity types

-- ============================================================================
-- CANDIDATE SYNC TO SEARCH_INDEX
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
        -- Build search_vector using same weighting as build_candidates_search_vector()
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
            'skills', NEW.skills
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

CREATE TRIGGER sync_candidate_to_search_index
AFTER INSERT OR UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION search.sync_candidate_to_search_index();

-- ============================================================================
-- JOB SYNC TO SEARCH_INDEX
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_job_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'job',
        NEW.id,
        COALESCE(NEW.title, ''),
        CONCAT_WS(' - ', NULLIF(NEW.company_name, ''), NULLIF(NEW.location, '')),
        CONCAT_WS(' ', NEW.title, NEW.description, NEW.recruiter_description, NEW.candidate_description, NEW.company_name, NEW.company_industry, NEW.company_headquarters_location, NEW.location, NEW.employment_type, NEW.department, NEW.status),
        -- Reuse search_vector from jobs table (already populated by BEFORE trigger)
        NEW.search_vector,
        jsonb_build_object(
            'company_name', NEW.company_name,
            'location', NEW.location,
            'employment_type', NEW.employment_type,
            'department', NEW.department,
            'status', NEW.status,
            'company_industry', NEW.company_industry
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

CREATE TRIGGER sync_job_to_search_index
AFTER INSERT OR UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION search.sync_job_to_search_index();

-- ============================================================================
-- COMPANY SYNC TO SEARCH_INDEX
-- ============================================================================

CREATE OR REPLACE FUNCTION search.sync_company_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'company',
        NEW.id,
        COALESCE(NEW.name, ''),
        CONCAT_WS(' - ', NULLIF(NEW.industry, ''), NULLIF(NEW.headquarters_location, '')),
        CONCAT_WS(' ', NEW.name, NEW.description, NEW.industry, NEW.headquarters_location, NEW.company_size, NEW.website),
        -- Reuse search_vector from companies table (already populated by BEFORE trigger)
        NEW.search_vector,
        jsonb_build_object(
            'industry', NEW.industry,
            'headquarters_location', NEW.headquarters_location,
            'company_size', NEW.company_size,
            'website', NEW.website
        ),
        NEW.id, -- the company IS the organization
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

CREATE TRIGGER sync_company_to_search_index
AFTER INSERT OR UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION search.sync_company_to_search_index();

-- ============================================================================
-- CASCADE COMPANY CHANGES TO JOB SEARCH_INDEX ENTRIES
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
            'company_industry', j.company_industry
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

CREATE TRIGGER cascade_company_to_job_search_index
AFTER UPDATE OF name, industry, headquarters_location ON public.companies
FOR EACH ROW
EXECUTE FUNCTION search.cascade_company_to_job_search_index();

-- ============================================================================
-- DELETE TRIGGERS - Clean up search_index when source rows are deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION search.delete_from_search_index() RETURNS trigger AS $$
BEGIN
    DELETE FROM search.search_index
    WHERE entity_type = TG_ARGV[0]
      AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delete_candidate_from_search_index
AFTER DELETE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('candidate');

CREATE TRIGGER delete_job_from_search_index
AFTER DELETE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('job');

CREATE TRIGGER delete_company_from_search_index
AFTER DELETE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('company');

-- ============================================================================
-- BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill candidates
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'candidate',
    id,
    COALESCE(full_name, ''),
    COALESCE(
        NULLIF(
            CONCAT_WS(' - ',
                NULLIF(CONCAT_WS(' at ', NULLIF(current_title, ''), NULLIF(current_company, '')), ''),
                NULLIF(location, '')
            ),
            ''
        ),
        ''
    ),
    CONCAT_WS(' ', full_name, email, current_title, current_company, skills, bio, location, phone, desired_job_type, linkedin_url, github_url, portfolio_url),
    setweight(to_tsvector('english', COALESCE(full_name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(regexp_replace(email, '[@+._-]', ' ', 'g'), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(current_title, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(current_company, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(skills, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(location, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(regexp_replace(phone, '[^0-9]', ' ', 'g'), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(desired_job_type, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(regexp_replace(linkedin_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
    setweight(to_tsvector('simple', COALESCE(regexp_replace(github_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
    setweight(to_tsvector('simple', COALESCE(regexp_replace(portfolio_url, '[/:._-]', ' ', 'g'), '')), 'D'),
    jsonb_build_object(
        'email', email,
        'location', location,
        'current_title', current_title,
        'current_company', current_company,
        'skills', skills
    ),
    NULL,
    now()
FROM public.candidates
ON CONFLICT (entity_type, entity_id)
DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    organization_id = EXCLUDED.organization_id,
    updated_at = EXCLUDED.updated_at;

-- Backfill jobs
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'job',
    id,
    COALESCE(title, ''),
    CONCAT_WS(' - ', NULLIF(company_name, ''), NULLIF(location, '')),
    CONCAT_WS(' ', title, description, recruiter_description, candidate_description, company_name, company_industry, company_headquarters_location, location, employment_type, department, status),
    search_vector,
    jsonb_build_object(
        'company_name', company_name,
        'location', location,
        'employment_type', employment_type,
        'department', department,
        'status', status,
        'company_industry', company_industry
    ),
    company_id,
    now()
FROM public.jobs
ON CONFLICT (entity_type, entity_id)
DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    organization_id = EXCLUDED.organization_id,
    updated_at = EXCLUDED.updated_at;

-- Backfill companies
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'company',
    id,
    COALESCE(name, ''),
    CONCAT_WS(' - ', NULLIF(industry, ''), NULLIF(headquarters_location, '')),
    CONCAT_WS(' ', name, description, industry, headquarters_location, company_size, website),
    search_vector,
    jsonb_build_object(
        'industry', industry,
        'headquarters_location', headquarters_location,
        'company_size', company_size,
        'website', website
    ),
    id,
    now()
FROM public.companies
ON CONFLICT (entity_type, entity_id)
DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    organization_id = EXCLUDED.organization_id,
    updated_at = EXCLUDED.updated_at;

/*
============================================================================
VERIFICATION QUERIES (run manually after migration)
============================================================================

-- 1. Check search_index has rows for all 3 entity types
SELECT entity_type, COUNT(*) as count
FROM search.search_index
GROUP BY entity_type
ORDER BY entity_type;

-- 2. Verify a candidate entry has correct structure
SELECT entity_type, entity_id, title, subtitle, metadata, length(search_vector::text) as vector_length
FROM search.search_index
WHERE entity_type = 'candidate'
LIMIT 3;

-- 3. Verify a job entry has correct structure
SELECT entity_type, entity_id, title, subtitle, metadata->>'company_name' as company, metadata->>'status' as status
FROM search.search_index
WHERE entity_type = 'job'
LIMIT 3;

-- 4. Verify a company entry has correct structure
SELECT entity_type, entity_id, title, subtitle, metadata->>'industry' as industry
FROM search.search_index
WHERE entity_type = 'company'
LIMIT 3;

-- 5. Test cross-entity search with ts_rank
SELECT entity_type, title, subtitle, ts_rank(search_vector, websearch_to_tsquery('english', 'engineer')) as rank
FROM search.search_index
WHERE search_vector @@ websearch_to_tsquery('english', 'engineer')
ORDER BY rank DESC
LIMIT 10;

-- 6. Verify organization_id mapping
SELECT entity_type, COUNT(*) as total,
       COUNT(organization_id) as with_org_id,
       COUNT(*) - COUNT(organization_id) as without_org_id
FROM search.search_index
GROUP BY entity_type;

-- 7. Test insert trigger - insert a test candidate and verify search_index
INSERT INTO public.candidates (full_name, email, current_title, current_company, location, skills, bio)
VALUES ('Test Candidate', 'test@example.com', 'Senior Engineer', 'Test Corp', 'San Francisco', 'JavaScript,TypeScript', 'Test bio')
RETURNING id;
-- Then check search_index for this candidate_id

-- 8. Test update trigger - update candidate and verify search_index updates
UPDATE public.candidates
SET current_title = 'Principal Engineer'
WHERE email = 'test@example.com';
-- Then verify search_index subtitle updated

-- 9. Test delete trigger - delete test candidate and verify search_index cleanup
DELETE FROM public.candidates WHERE email = 'test@example.com';
-- Then verify no entry in search_index

-- 10. Test company cascade - update company name and verify job entries update
-- Find a company with jobs, update its name, verify job search_index entries updated
*/
