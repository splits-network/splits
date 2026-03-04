-- Migration: Junction Table Cascade Triggers for Company Search Refresh
-- Phase: 27-search-index-enrichment, Plan: 02
-- Purpose: When company_skills, company_perks, or company_culture_tags records are
--          inserted or deleted, "touch" the parent companies row so that the enriched
--          BEFORE/AFTER triggers from Plan 27-01 fire and rebuild the search index.
--
-- Design: Touch strategy (UPDATE companies SET updated_at = now())
--   - Reuses the enriched search vector builder and sync function from Plan 27-01
--   - No UPDATE trigger needed — junction tables use composite PKs; rows are only
--     inserted or deleted, never updated
--   - Separate functions per table (future-proof for table-specific column references)

-- ============================================================================
-- 1. COMPANY SKILLS CASCADE
-- ============================================================================

CREATE OR REPLACE FUNCTION search.cascade_company_skills_to_search() RETURNS trigger AS $$
DECLARE
    v_company_id UUID;
BEGIN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
    UPDATE public.companies SET updated_at = now() WHERE id = v_company_id;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_company_skills_to_search_insert
AFTER INSERT ON public.company_skills
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_skills_to_search();

CREATE TRIGGER cascade_company_skills_to_search_delete
AFTER DELETE ON public.company_skills
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_skills_to_search();

-- ============================================================================
-- 2. COMPANY PERKS CASCADE
-- ============================================================================

CREATE OR REPLACE FUNCTION search.cascade_company_perks_to_search() RETURNS trigger AS $$
DECLARE
    v_company_id UUID;
BEGIN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
    UPDATE public.companies SET updated_at = now() WHERE id = v_company_id;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_company_perks_to_search_insert
AFTER INSERT ON public.company_perks
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_perks_to_search();

CREATE TRIGGER cascade_company_perks_to_search_delete
AFTER DELETE ON public.company_perks
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_perks_to_search();

-- ============================================================================
-- 3. COMPANY CULTURE TAGS CASCADE
-- ============================================================================

CREATE OR REPLACE FUNCTION search.cascade_company_culture_tags_to_search() RETURNS trigger AS $$
DECLARE
    v_company_id UUID;
BEGIN
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
    UPDATE public.companies SET updated_at = now() WHERE id = v_company_id;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cascade_company_culture_tags_to_search_insert
AFTER INSERT ON public.company_culture_tags
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_culture_tags_to_search();

CREATE TRIGGER cascade_company_culture_tags_to_search_delete
AFTER DELETE ON public.company_culture_tags
FOR EACH ROW EXECUTE FUNCTION search.cascade_company_culture_tags_to_search();

/*
============================================================================
VERIFICATION QUERIES (run manually after migration)
============================================================================

-- 1. Confirm all 6 triggers exist on the 3 junction tables
SELECT trigger_name, event_object_table, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name LIKE 'cascade_company_%_to_search_%'
ORDER BY event_object_table, event_manipulation;

-- Expected: 6 rows
-- cascade_company_culture_tags_to_search_delete  company_culture_tags  DELETE  AFTER
-- cascade_company_culture_tags_to_search_insert  company_culture_tags  INSERT  AFTER
-- cascade_company_perks_to_search_delete         company_perks         DELETE  AFTER
-- cascade_company_perks_to_search_insert         company_perks         INSERT  AFTER
-- cascade_company_skills_to_search_delete        company_skills        DELETE  AFTER
-- cascade_company_skills_to_search_insert        company_skills        INSERT  AFTER

-- 2. Confirm all 3 cascade functions exist in the search schema
SELECT routine_name, routine_schema
FROM information_schema.routines
WHERE routine_schema = 'search'
  AND routine_name LIKE 'cascade_company_%_to_search'
ORDER BY routine_name;

-- Expected: 3 rows
-- cascade_company_culture_tags_to_search  search
-- cascade_company_perks_to_search         search
-- cascade_company_skills_to_search        search

-- 3. Test skill cascade: add a skill to a company, verify search index updates
-- Step 1: Note current updated_at for a company that has skills
SELECT c.id, c.name, c.updated_at
FROM public.companies c
JOIN public.company_skills cs ON cs.company_id = c.id
LIMIT 1;

-- Step 2: Insert a new company_skills record
-- INSERT INTO public.company_skills (company_id, skill_id)
-- VALUES ('<company_id>', '<skill_id>');

-- Step 3: Verify the company's updated_at changed (trigger fired)
-- SELECT id, name, updated_at FROM public.companies WHERE id = '<company_id>';

-- Step 4: Verify search_index entry was refreshed (updated_at should match)
-- SELECT entity_id, updated_at FROM search.search_index
-- WHERE entity_type = 'company' AND entity_id = '<company_id>';

-- 4. Test perk cascade: remove a perk from a company, verify search index updates
-- DELETE FROM public.company_perks
-- WHERE company_id = '<company_id>' AND perk_id = '<perk_id>';
-- Then verify companies.updated_at and search.search_index.updated_at changed.

-- 5. Test culture tag cascade: add a culture tag, verify search index updates
-- INSERT INTO public.company_culture_tags (company_id, culture_tag_id)
-- VALUES ('<company_id>', '<culture_tag_id>');
-- Then verify companies.updated_at and search.search_index.updated_at changed.

-- 6. Test bulk-replace pattern (DELETE all + INSERT new): verify single company touch
-- BEGIN;
-- DELETE FROM public.company_skills WHERE company_id = '<company_id>';
-- INSERT INTO public.company_skills (company_id, skill_id)
-- SELECT '<company_id>', id FROM public.skills WHERE name IN ('React', 'TypeScript') LIMIT 2;
-- COMMIT;
-- Then verify search.search_index updated_at is current and search_vector includes new skill names.

-- 7. Verify search finds company by newly added skill
-- SELECT entity_type, title, updated_at
-- FROM search.search_index
-- WHERE entity_type = 'company'
--   AND search_vector @@ to_tsquery('english', 'React')
-- ORDER BY updated_at DESC
-- LIMIT 5;
============================================================================
*/
