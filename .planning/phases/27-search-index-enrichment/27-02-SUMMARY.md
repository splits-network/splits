---
phase: 27-search-index-enrichment
plan: 02
subsystem: database
tags: [postgres, triggers, search, full-text-search, junction-tables]

# Dependency graph
requires:
  - phase: 27-search-index-enrichment/27-01
    provides: Enriched company search vector builder and sync trigger that respond to companies.updated_at touch
  - phase: 22-company-profile-schema
    provides: company_skills, company_perks, company_culture_tags junction tables

provides:
  - Junction table cascade triggers that touch parent company row on INSERT/DELETE
  - 3 trigger functions in search schema (cascade_company_skills_to_search, cascade_company_perks_to_search, cascade_company_culture_tags_to_search)
  - 6 triggers total (INSERT + DELETE on each of the 3 junction tables)

affects:
  - Any future phase that modifies junction table data will automatically get search refresh
  - Search queries against company skills, perks, or culture tags stay current without extra coordination

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Junction cascade via touch: INSERT/DELETE on junction fires UPDATE companies SET updated_at = now() to reuse parent entity triggers"
    - "COALESCE(NEW.company_id, OLD.company_id) in trigger function handles both INSERT and DELETE in a single function"
    - "Separate function per junction table for future-proofing, even when current logic is identical"

key-files:
  created:
    - supabase/migrations/20260304000002_company_junction_search_triggers.sql
  modified: []

key-decisions:
  - "Touch strategy reuses Plan 27-01 enriched triggers rather than duplicating junction aggregation logic"
  - "No UPDATE trigger on junction tables — composite PK means rows are inserted or deleted, never updated"
  - "Separate trigger functions per table for future extensibility even though current bodies are identical"

patterns-established:
  - "Junction cascade pattern: AFTER INSERT/DELETE fires UPDATE on parent table to propagate search refresh transitively"

# Metrics
duration: 8min
completed: 2026-03-04
---

# Phase 27 Plan 02: Junction Table Cascade Triggers Summary

**3 trigger functions and 6 triggers that cascade search index refresh from company_skills, company_perks, and company_culture_tags to the parent companies row via a touch update.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-04T02:23:33Z
- **Completed:** 2026-03-04T02:31:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Created `search.cascade_company_skills_to_search()` with INSERT and DELETE triggers on `public.company_skills`
- Created `search.cascade_company_perks_to_search()` with INSERT and DELETE triggers on `public.company_perks`
- Created `search.cascade_company_culture_tags_to_search()` with INSERT and DELETE triggers on `public.company_culture_tags`
- All triggers use the touch strategy (`UPDATE public.companies SET updated_at = now()`) to reuse the enriched search vector and sync functions from Plan 27-01
- Added 7 verification queries covering trigger existence, function existence, INSERT/DELETE cascade tests, bulk-replace pattern, and search correctness

## Task Commits

Each task was committed atomically:

1. **Task 1: Create junction table cascade triggers** - `9e349214` (feat)

**Plan metadata:** (combined with task commit — single-task plan)

## Files Created/Modified

- `supabase/migrations/20260304000002_company_junction_search_triggers.sql` - 3 trigger functions + 6 triggers cascading junction table changes to parent company search refresh

## Decisions Made

- Touch strategy (`UPDATE companies SET updated_at = now()`) reuses the enriched BEFORE/AFTER triggers from Plan 27-01 rather than duplicating junction aggregation queries. This keeps the cascade chain simple: junction change → company touch → company BEFORE trigger rebuilds search_vector → company AFTER trigger syncs search_index.
- No UPDATE trigger on junction tables because `company_skills`, `company_perks`, and `company_culture_tags` all use composite primary keys — rows are only ever inserted or deleted, never updated in place.
- Separate function bodies per table rather than a generic parameterized function, to allow future divergence (e.g., cascade_company_skills_to_search may one day need to update a skills count column or denormalized field).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both Plan 27-01 (enriched company search vector) and Plan 27-02 (junction cascade triggers) are complete
- Search index now stays current when companies add/remove skills, perks, or culture tags
- Phase 27 complete — search index enrichment for v7.0 company profile data is fully implemented

---
*Phase: 27-search-index-enrichment*
*Completed: 2026-03-04*
