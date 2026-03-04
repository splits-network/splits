---
phase: 27-search-index-enrichment
plan: "01"
subsystem: database
tags: [postgres, tsvector, search, full-text-search, triggers, migrations]

# Dependency graph
requires:
  - phase: 26-company-card-redesign
    provides: v7.0 company card UI consuming stage, tagline, skills, perks, culture tags
  - phase: 22-schema-and-types
    provides: company_skills, company_perks, company_culture_tags junction tables; stage/tagline columns on companies

provides:
  - Updated build_companies_search_vector (11-param overload) with stage/tagline/skills/perks/culture_tags
  - Updated update_companies_search_vector BEFORE trigger querying junction tables
  - Updated sync_company_to_search_index AFTER trigger with enriched context and metadata
  - Backfill of all existing companies via updated_at touch

affects:
  - 27-02 (plan 02 in this phase — any further search enrichment)
  - Any service querying search.search_index for company entities (context/metadata now richer)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Junction aggregation in BEFORE trigger: query junction tables, pass space-separated names as TEXT to pure build_ function"
    - "BEFORE+AFTER trigger separation: BEFORE rebuilds search_vector (company table), AFTER syncs to search.search_index"
    - "Function overloading: new 11-param overload coexists with 6-param baseline; both remain valid"
    - "Backfill via UPDATE SET updated_at = now(): fires all triggers without data loss"

key-files:
  created:
    - supabase/migrations/20260304000001_company_search_enrichment.sql
  modified: []

key-decisions:
  - "New build_companies_search_vector overload: tagline=B (descriptive content), skills_text=B (same weight as candidate skills), stage/perks/culture=C — weight hierarchy reflects search relevance"
  - "Junction aggregation in BEFORE trigger not AFTER: search_vector on companies table stays authoritative; AFTER trigger reads from NEW.search_vector already enriched"
  - "sync_company_to_search_index re-queries junctions independently for context string: ensures search_index.context includes all text for non-tsvector matching"
  - "cascade_company_to_job_search_index left unchanged: new fields are company-specific, not cascaded to job index entries"

patterns-established:
  - "Pattern: build_ functions stay IMMUTABLE (pure text-in, tsvector-out); all side-effectful queries live in the trigger function calling them"
  - "Pattern: backfill via UPDATE with updated_at avoids data loss and re-fires all triggers consistently"

# Metrics
duration: 2min
completed: 2026-03-04
---

# Phase 27 Plan 01: Search Index Enrichment — Company Search Vector Summary

**Enriched company full-text search to include stage, tagline, tech skills, perks, and culture tags via 11-param vector builder and updated BEFORE/AFTER triggers with junction table aggregation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-04T02:23:03Z
- **Completed:** 2026-03-04T02:24:04Z
- **Tasks:** 1 (single migration file)
- **Files modified:** 1

## Accomplishments

- New 11-param `build_companies_search_vector` overload with correct weights: name=A, description/industry/tagline/skills=B, location/size/website/stage/perks/culture=C
- `update_companies_search_vector` BEFORE trigger now queries `company_skills`, `company_perks`, `company_culture_tags` and passes aggregated names to the vector builder
- `search.sync_company_to_search_index` AFTER trigger enriched with stage/tagline/junction text in context and stage/tagline/founded_year in metadata jsonb
- All existing companies backfilled by touching `updated_at`, firing both triggers

## Task Commits

Each task was committed atomically:

1. **Task 1: Create company search enrichment migration** - `711e5ab9` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `supabase/migrations/20260304000001_company_search_enrichment.sql` - Replaces three search functions (build/BEFORE/AFTER) and backfills all companies

## Decisions Made

- **Tagline weight B, stage weight C**: Tagline is descriptive content like description — gives it the same relevance tier. Stage is a categorical attribute, weight C appropriate.
- **Skills text weight B**: Mirrors how candidate skills are weighted in `build_candidates_search_vector`; company tech stack is a primary discovery signal.
- **BEFORE trigger queries junctions, AFTER trigger re-queries for context**: Separation kept clean — BEFORE maintains the tsvector column on companies, AFTER syncs to search_index and needs the text for context string (not just the vector).
- **`cascade_company_to_job_search_index` left untouched**: New fields (stage, tagline, founded_year) are company-entity fields, not denormalized onto jobs; no cascade needed.
- **6-param baseline overload preserved via Postgres function overloading**: No destructive DROP, old callers (if any) still resolve cleanly.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Company search now discovers companies by stage, tagline, tech stack skills, perks, and culture tags
- Junction trigger changes fire on INSERT/UPDATE to companies; junction table changes (adding/removing a skill) will NOT auto-update company search_vector — that is a known limitation; plan 02 can address if needed
- Ready for plan 27-02 (if additional search enrichment is planned) or phase close

---
*Phase: 27-search-index-enrichment*
*Completed: 2026-03-04*
