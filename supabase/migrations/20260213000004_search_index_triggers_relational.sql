-- Migration: Search Index Triggers for Relational Entities
-- Phase: 01-search-infrastructure, Plan: 03
-- Purpose: Create trigger-based sync from recruiters, applications, placements, and recruiter_candidates to search.search_index
-- These entities require cross-table JOINs to denormalize data for the search index

-- ============================================================================
-- SHARED DELETE FUNCTION (idempotent - may already exist from Plan 02)
-- ============================================================================

CREATE OR REPLACE FUNCTION search.delete_from_search_index() RETURNS trigger AS $$
BEGIN
    DELETE FROM search.search_index
    WHERE entity_type = TG_ARGV[0]
      AND entity_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. RECRUITERS (entity_type: 'recruiter')
-- ============================================================================

-- Sync function: Inserts/updates recruiter data in search_index
-- Looks up user name/email from users table via user_id FK
CREATE OR REPLACE FUNCTION search.sync_recruiter_to_search_index() RETURNS trigger AS $$
DECLARE
    v_user_name text;
    v_user_email text;
BEGIN
    -- Lookup user data from users table
    SELECT u.name, u.email
    INTO v_user_name, v_user_email
    FROM public.users u
    WHERE u.id = NEW.user_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'recruiter',
        NEW.id,
        COALESCE(v_user_name, ''),
        CONCAT_WS(' - ', NULLIF(NEW.tagline, ''), NULLIF(NEW.location, '')),
        CONCAT_WS(' ', v_user_name, v_user_email, NEW.bio, NEW.tagline, array_to_string(NEW.industries, ' '), array_to_string(NEW.specialties, ' '), NEW.location, NEW.phone),
        NEW.search_vector,  -- Already computed by update_recruiters_search_vector trigger
        jsonb_build_object('email', v_user_email, 'location', NEW.location, 'tagline', NEW.tagline, 'industries', NEW.industries, 'specialties', NEW.specialties, 'status', NEW.status, 'marketplace_enabled', NEW.marketplace_enabled),
        NULL,  -- Recruiters are not org-scoped
        now()
    )
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        context = EXCLUDED.context,
        search_vector = EXCLUDED.search_vector,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire after INSERT/UPDATE on recruiters
CREATE TRIGGER sync_recruiter_to_search_index
AFTER INSERT OR UPDATE ON public.recruiters
FOR EACH ROW
EXECUTE FUNCTION search.sync_recruiter_to_search_index();

-- Cascade function: When user name/email changes, update recruiter search index entries
CREATE OR REPLACE FUNCTION search.cascade_user_to_recruiter_search_index() RETURNS trigger AS $$
BEGIN
    UPDATE search.search_index si
    SET
        title = NEW.name,
        context = CONCAT_WS(' ', NEW.name, NEW.email, r.bio, r.tagline, array_to_string(r.industries, ' '), array_to_string(r.specialties, ' '), r.location, r.phone),
        search_vector = r.search_vector,  -- Already updated by sync_recruiter_user_search_vector trigger
        metadata = jsonb_set(
            jsonb_set(si.metadata, '{email}', to_jsonb(NEW.email)),
            '{name}', to_jsonb(NEW.name)
        ),
        updated_at = now()
    FROM public.recruiters r
    WHERE si.entity_type = 'recruiter'
      AND si.entity_id = r.id
      AND r.user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cascade trigger: Fire when user name/email changes
CREATE TRIGGER cascade_user_to_recruiter_search_index
AFTER UPDATE OF name, email ON public.users
FOR EACH ROW
EXECUTE FUNCTION search.cascade_user_to_recruiter_search_index();

-- Delete trigger: Remove from search_index when recruiter deleted
CREATE TRIGGER delete_recruiter_from_search_index
AFTER DELETE ON public.recruiters
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('recruiter');

-- ============================================================================
-- 2. APPLICATIONS (entity_type: 'application')
-- ============================================================================

-- Sync function: Uses existing denormalized columns (candidate_name, job_title, company_name)
-- These are maintained by existing cascade triggers on candidates/jobs/companies
CREATE OR REPLACE FUNCTION search.sync_application_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'application',
        NEW.id,
        COALESCE(NEW.candidate_name, '') || ' - ' || COALESCE(NEW.job_title, ''),
        CONCAT_WS(' at ', NULLIF(NEW.job_title, ''), NULLIF(NEW.company_name, '')),
        CONCAT_WS(' ', NEW.candidate_name, NEW.candidate_email, NEW.job_title, NEW.company_name, NEW.stage),
        NEW.search_vector,  -- Already computed by update_applications_search_vector trigger
        jsonb_build_object('candidate_name', NEW.candidate_name, 'candidate_email', NEW.candidate_email, 'job_title', NEW.job_title, 'company_name', NEW.company_name, 'stage', NEW.stage),
        NULL,  -- Organization filtering done at query time via access context
        now()
    )
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        context = EXCLUDED.context,
        search_vector = EXCLUDED.search_vector,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire after INSERT/UPDATE on applications
CREATE TRIGGER sync_application_to_search_index
AFTER INSERT OR UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION search.sync_application_to_search_index();

-- Delete trigger: Remove from search_index when application deleted
CREATE TRIGGER delete_application_from_search_index
AFTER DELETE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('application');

-- ============================================================================
-- 3. PLACEMENTS (entity_type: 'placement')
-- ============================================================================

-- Sync function: Uses existing denormalized columns (candidate_name, job_title, company_name, recruiter_name)
-- These are maintained by existing cascade triggers
CREATE OR REPLACE FUNCTION search.sync_placement_to_search_index() RETURNS trigger AS $$
BEGIN
    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'placement',
        NEW.id,
        COALESCE(NEW.candidate_name, '') || ' - ' || COALESCE(NEW.job_title, ''),
        CONCAT_WS(' at ', NULLIF(NEW.job_title, ''), NULLIF(NEW.company_name, '')),
        CONCAT_WS(' ', NEW.candidate_name, NEW.candidate_email, NEW.job_title, NEW.company_name, NEW.state, CASE WHEN NEW.salary IS NOT NULL THEN NEW.salary::text ELSE '' END, NEW.failure_reason),
        NEW.search_vector,  -- Already computed by update_placements_search_vector trigger
        jsonb_build_object('candidate_name', NEW.candidate_name, 'job_title', NEW.job_title, 'company_name', NEW.company_name, 'state', NEW.state, 'salary', NEW.salary),
        NULL,  -- Organization filtering done at query time
        now()
    )
    ON CONFLICT (entity_type, entity_id)
    DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        context = EXCLUDED.context,
        search_vector = EXCLUDED.search_vector,
        metadata = EXCLUDED.metadata,
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire after INSERT/UPDATE on placements
CREATE TRIGGER sync_placement_to_search_index
AFTER INSERT OR UPDATE ON public.placements
FOR EACH ROW
EXECUTE FUNCTION search.sync_placement_to_search_index();

-- Delete trigger: Remove from search_index when placement deleted
CREATE TRIGGER delete_placement_from_search_index
AFTER DELETE ON public.placements
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('placement');

-- ============================================================================
-- 4. RECRUITER_CANDIDATES (entity_type: 'recruiter_candidate')
-- ============================================================================

-- Sync function: Uses denormalized candidate columns, looks up recruiter name
CREATE OR REPLACE FUNCTION search.sync_recruiter_candidate_to_search_index() RETURNS trigger AS $$
DECLARE
    v_recruiter_name text;
BEGIN
    -- Lookup recruiter name for context
    SELECT u.name INTO v_recruiter_name
    FROM public.users u
    JOIN public.recruiters r ON r.user_id = u.id
    WHERE r.id = NEW.recruiter_id;

    INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
    VALUES (
        'recruiter_candidate',
        NEW.id,
        COALESCE(NEW.candidate_name, ''),
        CONCAT_WS(' - Recruiter: ', NULLIF(NEW.candidate_location, ''), v_recruiter_name),
        CONCAT_WS(' ', NEW.candidate_name, NEW.candidate_email, NEW.candidate_location, NEW.status, v_recruiter_name),
        NEW.search_vector,  -- Already computed by update_recruiter_candidate_search_vector trigger
        jsonb_build_object('candidate_name', NEW.candidate_name, 'candidate_email', NEW.candidate_email, 'candidate_location', NEW.candidate_location, 'status', NEW.status, 'recruiter_name', v_recruiter_name, 'recruiter_id', NEW.recruiter_id),
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
        updated_at = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Fire after INSERT/UPDATE on recruiter_candidates
CREATE TRIGGER sync_recruiter_candidate_to_search_index
AFTER INSERT OR UPDATE ON public.recruiter_candidates
FOR EACH ROW
EXECUTE FUNCTION search.sync_recruiter_candidate_to_search_index();

-- Delete trigger: Remove from search_index when recruiter_candidate deleted
CREATE TRIGGER delete_recruiter_candidate_from_search_index
AFTER DELETE ON public.recruiter_candidates
FOR EACH ROW
EXECUTE FUNCTION search.delete_from_search_index('recruiter_candidate');

-- ============================================================================
-- BACKFILL EXISTING DATA
-- ============================================================================

-- Backfill recruiters
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'recruiter' AS entity_type,
    r.id AS entity_id,
    COALESCE(u.name, '') AS title,
    CONCAT_WS(' - ', NULLIF(r.tagline, ''), NULLIF(r.location, '')) AS subtitle,
    CONCAT_WS(' ', u.name, u.email, r.bio, r.tagline, array_to_string(r.industries, ' '), array_to_string(r.specialties, ' '), r.location, r.phone) AS context,
    r.search_vector,
    jsonb_build_object('email', u.email, 'location', r.location, 'tagline', r.tagline, 'industries', r.industries, 'specialties', r.specialties, 'status', r.status, 'marketplace_enabled', r.marketplace_enabled) AS metadata,
    NULL AS organization_id,
    now() AS updated_at
FROM public.recruiters r
JOIN public.users u ON u.id = r.user_id
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;

-- Backfill applications
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'application' AS entity_type,
    a.id AS entity_id,
    COALESCE(a.candidate_name, '') || ' - ' || COALESCE(a.job_title, '') AS title,
    CONCAT_WS(' at ', NULLIF(a.job_title, ''), NULLIF(a.company_name, '')) AS subtitle,
    CONCAT_WS(' ', a.candidate_name, a.candidate_email, a.job_title, a.company_name, a.stage) AS context,
    a.search_vector,
    jsonb_build_object('candidate_name', a.candidate_name, 'candidate_email', a.candidate_email, 'job_title', a.job_title, 'company_name', a.company_name, 'stage', a.stage) AS metadata,
    NULL AS organization_id,
    now() AS updated_at
FROM public.applications a
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;

-- Backfill placements
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'placement' AS entity_type,
    p.id AS entity_id,
    COALESCE(p.candidate_name, '') || ' - ' || COALESCE(p.job_title, '') AS title,
    CONCAT_WS(' at ', NULLIF(p.job_title, ''), NULLIF(p.company_name, '')) AS subtitle,
    CONCAT_WS(' ', p.candidate_name, p.candidate_email, p.job_title, p.company_name, p.state, CASE WHEN p.salary IS NOT NULL THEN p.salary::text ELSE '' END, p.failure_reason) AS context,
    p.search_vector,
    jsonb_build_object('candidate_name', p.candidate_name, 'job_title', p.job_title, 'company_name', p.company_name, 'state', p.state, 'salary', p.salary) AS metadata,
    NULL AS organization_id,
    now() AS updated_at
FROM public.placements p
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;

-- Backfill recruiter_candidates
INSERT INTO search.search_index (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id, updated_at)
SELECT
    'recruiter_candidate' AS entity_type,
    rc.id AS entity_id,
    COALESCE(rc.candidate_name, '') AS title,
    CONCAT_WS(' - Recruiter: ', NULLIF(rc.candidate_location, ''), u.name) AS subtitle,
    CONCAT_WS(' ', rc.candidate_name, rc.candidate_email, rc.candidate_location, rc.status, u.name) AS context,
    rc.search_vector,
    jsonb_build_object('candidate_name', rc.candidate_name, 'candidate_email', rc.candidate_email, 'candidate_location', rc.candidate_location, 'status', rc.status, 'recruiter_name', u.name, 'recruiter_id', rc.recruiter_id) AS metadata,
    NULL AS organization_id,
    now() AS updated_at
FROM public.recruiter_candidates rc
JOIN public.recruiters r ON r.id = rc.recruiter_id
JOIN public.users u ON u.id = r.user_id
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    context = EXCLUDED.context,
    search_vector = EXCLUDED.search_vector,
    metadata = EXCLUDED.metadata,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- COMPREHENSIVE VERIFICATION QUERIES (run these after migration)
-- ============================================================================

/*
-- 1. All 7 entity types present in search_index
SELECT entity_type, COUNT(*) as count
FROM search.search_index
GROUP BY entity_type
ORDER BY entity_type;

-- Expected output: 7 rows (candidate, job, company, recruiter, application, placement, recruiter_candidate)

-- 2. Cross-entity search test - find "engineer" across all entity types
SELECT entity_type, title, subtitle,
       ts_rank(search_vector, websearch_to_tsquery('english', 'engineer')) as rank
FROM search.search_index
WHERE search_vector @@ websearch_to_tsquery('english', 'engineer')
ORDER BY rank DESC
LIMIT 15;

-- Expected: Results from multiple entity types (jobs, candidates, applications, etc.)

-- 3. Verify search_vector is populated (no NULLs)
SELECT entity_type,
       COUNT(*) as total,
       COUNT(search_vector) as with_vector,
       COUNT(*) - COUNT(search_vector) as null_vectors
FROM search.search_index
GROUP BY entity_type;

-- Expected: null_vectors = 0 for all entity types

-- 4. Verify metadata structure per entity type
SELECT entity_type, jsonb_object_keys(metadata) as key
FROM search.search_index
GROUP BY entity_type, jsonb_object_keys(metadata)
ORDER BY entity_type, key;

-- Expected: Different keys per entity type matching the sync functions

-- 5. Multi-word search across all entities
SELECT entity_type, title, subtitle,
       ts_rank(search_vector, websearch_to_tsquery('english', 'software engineer')) as rank
FROM search.search_index
WHERE search_vector @@ websearch_to_tsquery('english', 'software engineer')
ORDER BY rank DESC
LIMIT 10;

-- Expected: Ranked results across multiple entity types

-- 6. Verify recruiter cascade trigger works
-- Test: Update a user's name and verify recruiter search_index entry updates
-- UPDATE public.users SET name = 'New Name Test' WHERE id = (SELECT user_id FROM public.recruiters LIMIT 1);
-- Then query search_index for recruiters and verify the name updated

-- 7. Verify delete triggers work
-- Test: Delete a recruiter and verify search_index entry removed
-- DELETE FROM public.recruiters WHERE id = 'test-id';
-- SELECT * FROM search.search_index WHERE entity_type = 'recruiter' AND entity_id = 'test-id';
-- Expected: 0 rows

-- 8. Test recruiter search with user email
SELECT entity_type, title, subtitle, metadata->>'email' as email,
       ts_rank(search_vector, websearch_to_tsquery('english', 'test')) as rank
FROM search.search_index
WHERE entity_type = 'recruiter'
  AND search_vector @@ websearch_to_tsquery('english', 'test')
ORDER BY rank DESC
LIMIT 10;

-- Expected: Recruiters with "test" in name, email, bio, etc.
*/
