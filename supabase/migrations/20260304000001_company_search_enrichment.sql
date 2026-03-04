-- ============================================================================
-- Company Search Enrichment
-- Phase 27: Search Index Enrichment — Plan 01
-- ============================================================================
-- Updates the company search vector builder and search index sync trigger to
-- include all v7.0 fields: stage, tagline, and aggregated junction data
-- (skills, perks, culture tags). Backfills existing companies.
--
-- This migration replaces three functions:
--   1. public.build_companies_search_vector   (pure vector builder, now 11 params)
--   2. public.update_companies_search_vector  (BEFORE trigger, queries junctions)
--   3. search.sync_company_to_search_index    (AFTER trigger, enriched context/metadata)
-- ============================================================================

-- ============================================================================
-- 1. Replace build_companies_search_vector (11 params, still IMMUTABLE)
-- ============================================================================
-- The new overload accepts all enrichment fields as plain text.
-- The 6-param overload from the baseline remains (Postgres overloading) but is
-- no longer called by the updated trigger.

CREATE OR REPLACE FUNCTION public.build_companies_search_vector(
    p_name                TEXT,
    p_description         TEXT,
    p_industry            TEXT,
    p_headquarters_location TEXT,
    p_company_size        TEXT,
    p_website             TEXT,
    p_stage               TEXT,
    p_tagline             TEXT,
    p_skills_text         TEXT,
    p_perks_text          TEXT,
    p_culture_tags_text   TEXT
) RETURNS tsvector
    LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_industry, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_tagline, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_skills_text, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_headquarters_location, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_company_size, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_website, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_stage, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_perks_text, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_culture_tags_text, '')), 'C');
END;
$$;

-- ============================================================================
-- 2. Replace update_companies_search_vector BEFORE trigger function
-- ============================================================================
-- Queries junction tables to aggregate skill/perk/culture tag names, then
-- calls the new 11-param build_companies_search_vector.

CREATE OR REPLACE FUNCTION public.update_companies_search_vector() RETURNS trigger AS $$
DECLARE
    v_skills_text       TEXT;
    v_perks_text        TEXT;
    v_culture_tags_text TEXT;
BEGIN
    SELECT string_agg(s.name, ' ') INTO v_skills_text
    FROM public.company_skills cs
    JOIN public.skills s ON s.id = cs.skill_id
    WHERE cs.company_id = NEW.id;

    SELECT string_agg(p.name, ' ') INTO v_perks_text
    FROM public.company_perks cp
    JOIN public.perks p ON p.id = cp.perk_id
    WHERE cp.company_id = NEW.id;

    SELECT string_agg(ct.name, ' ') INTO v_culture_tags_text
    FROM public.company_culture_tags cct
    JOIN public.culture_tags ct ON ct.id = cct.culture_tag_id
    WHERE cct.company_id = NEW.id;

    NEW.search_vector := public.build_companies_search_vector(
        NEW.name,
        NEW.description,
        NEW.industry,
        NEW.headquarters_location,
        NEW.company_size,
        NEW.website,
        NEW.stage,
        NEW.tagline,
        v_skills_text,
        v_perks_text,
        v_culture_tags_text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. Replace search.sync_company_to_search_index AFTER trigger function
-- ============================================================================
-- Aggregates junction data for context string and enriches metadata with
-- stage, tagline, and founded_year. search_vector is taken from NEW.search_vector
-- which was already enriched by the BEFORE trigger above.

CREATE OR REPLACE FUNCTION search.sync_company_to_search_index() RETURNS trigger AS $$
DECLARE
    v_skills_text       TEXT;
    v_perks_text        TEXT;
    v_culture_tags_text TEXT;
BEGIN
    SELECT string_agg(s.name, ' ') INTO v_skills_text
    FROM public.company_skills cs
    JOIN public.skills s ON s.id = cs.skill_id
    WHERE cs.company_id = NEW.id;

    SELECT string_agg(p.name, ' ') INTO v_perks_text
    FROM public.company_perks cp
    JOIN public.perks p ON p.id = cp.perk_id
    WHERE cp.company_id = NEW.id;

    SELECT string_agg(ct.name, ' ') INTO v_culture_tags_text
    FROM public.company_culture_tags cct
    JOIN public.culture_tags ct ON ct.id = cct.culture_tag_id
    WHERE cct.company_id = NEW.id;

    INSERT INTO search.search_index (
        entity_type, entity_id, title, subtitle, context,
        search_vector, metadata, organization_id, updated_at
    )
    VALUES (
        'company',
        NEW.id,
        COALESCE(NEW.name, ''),
        CONCAT_WS(' - ', NULLIF(NEW.industry, ''), NULLIF(NEW.headquarters_location, '')),
        CONCAT_WS(' ',
            NEW.name,
            NEW.description,
            NEW.industry,
            NEW.headquarters_location,
            NEW.company_size,
            NEW.website,
            NEW.stage,
            NEW.tagline,
            v_skills_text,
            v_perks_text,
            v_culture_tags_text
        ),
        NEW.search_vector,
        jsonb_build_object(
            'industry',               NEW.industry,
            'headquarters_location',  NEW.headquarters_location,
            'company_size',           NEW.company_size,
            'website',                NEW.website,
            'stage',                  NEW.stage,
            'tagline',                NEW.tagline,
            'founded_year',           NEW.founded_year
        ),
        NEW.id,  -- the company IS the organization
        now()
    )
    ON CONFLICT (entity_type, entity_id) DO UPDATE SET
        title           = EXCLUDED.title,
        subtitle        = EXCLUDED.subtitle,
        context         = EXCLUDED.context,
        search_vector   = EXCLUDED.search_vector,
        metadata        = EXCLUDED.metadata,
        organization_id = EXCLUDED.organization_id,
        updated_at      = EXCLUDED.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. Backfill existing companies
-- ============================================================================
-- Touch updated_at to fire both BEFORE and AFTER triggers for every company,
-- rebuilding search_vector and re-syncing to search.search_index with enrichment.

UPDATE public.companies SET updated_at = now();

/*
============================================================================
VERIFICATION QUERIES (run manually after migration)
============================================================================

-- 1. Confirm company search_index entries include new metadata keys
SELECT
    entity_id,
    title,
    subtitle,
    metadata->>'stage'        AS stage,
    metadata->>'tagline'      AS tagline,
    metadata->>'founded_year' AS founded_year,
    length(search_vector::text) AS vector_length
FROM search.search_index
WHERE entity_type = 'company'
LIMIT 5;

-- 2. Verify stage is searchable (replace 'Series A' with a known value)
SELECT entity_type, title, ts_rank(search_vector, websearch_to_tsquery('english', 'Series A')) AS rank
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'Series A')
ORDER BY rank DESC
LIMIT 10;

-- 3. Verify tagline is searchable (use a known tagline word)
SELECT entity_type, title, metadata->>'tagline' AS tagline
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'your_tagline_word')
LIMIT 5;

-- 4. Verify skills searchable (replace 'React' with a known skill)
SELECT entity_type, title
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'React')
LIMIT 5;

-- 5. Verify perks searchable (replace 'Remote' with a known perk)
SELECT entity_type, title
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'Remote')
LIMIT 5;

-- 6. Verify culture tags searchable (replace 'Inclusive' with a known tag)
SELECT entity_type, title
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'Inclusive')
LIMIT 5;

-- 7. Confirm existing search fields still work (name, industry, location)
SELECT entity_type, title, subtitle
FROM search.search_index
WHERE entity_type = 'company'
  AND search_vector @@ websearch_to_tsquery('english', 'technology')
ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', 'technology')) DESC
LIMIT 5;

-- 8. Spot-check context column includes all enrichment text
SELECT entity_id, context
FROM search.search_index
WHERE entity_type = 'company'
LIMIT 3;

-- 9. Verify count — every company should have a search_index row
SELECT
    (SELECT COUNT(*) FROM public.companies)     AS total_companies,
    (SELECT COUNT(*) FROM search.search_index WHERE entity_type = 'company') AS indexed;

-- 10. Test live trigger — insert a test company with stage/tagline and verify
INSERT INTO public.companies (name, industry, stage, tagline)
VALUES ('Test Corp', 'Software', 'Series A', 'Building the future')
RETURNING id;
-- Then: SELECT context FROM search.search_index WHERE entity_id = '<returned-id>';
-- Expect: context contains 'Series A' and 'Building the future'
-- Cleanup: DELETE FROM public.companies WHERE name = 'Test Corp';

============================================================================
*/
