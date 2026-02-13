---
phase: 01-search-infrastructure
plan: 02
subsystem: database
tags: [postgres, triggers, tsvector, full-text-search, supabase, search-index-sync]

# Dependency graph
requires:
  - phase: 01-01
    provides: search.search_index table with UNIQUE constraint on (entity_type, entity_id), GIN index on search_vector
provides:
  - Trigger-based real-time sync for candidates, jobs, companies to search.search_index
  - Company cascade trigger to update job search_index entries when company data changes
  - Delete triggers to clean up search_index on row deletion
  - Backfill of existing data into search_index
affects: [01-03-search-service, global-search-ui, entity-search-endpoints]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AFTER INSERT OR UPDATE triggers for search_index sync
    - ON CONFLICT (entity_type, entity_id) DO UPDATE for UPSERT pattern
    - TG_ARGV pattern for reusable delete trigger function
    - CASCADE triggers for denormalized data consistency

key-files:
  created:
    - supabase/migrations/20260213000003_search_index_triggers_core.sql
  modified: []

key-decisions:
  - "Reuse search_vector from jobs/companies tables (already populated by BEFORE triggers) to avoid duplicating complex requirements-aware logic"
  - "AFTER triggers for sync (not BEFORE) so NEW.search_vector is already populated"
  - "Company cascade trigger updates job search_index entries when company name/industry/location changes"

patterns-established:
  - "Pattern 1: AFTER INSERT OR UPDATE trigger syncs entity to search_index with UPSERT (ON CONFLICT DO UPDATE)"
  - "Pattern 2: CASCADE trigger updates related search_index entries when denormalized fields change"
  - "Pattern 3: TG_ARGV[0] for parameterized delete trigger function (single function for all entity types)"

# Metrics
duration: 1min
completed: 2026-02-13
---

# Phase 01 Plan 02: Entity Sync Triggers Summary

**Trigger-based real-time sync for candidates, jobs, and companies to search.search_index with cascade updates and automatic cleanup**

## Performance

- **Duration:** 1 minute
- **Started:** 2026-02-13T05:48:11Z
- **Completed:** 2026-02-13T05:49:42Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created trigger functions to sync candidates, jobs, companies to search.search_index on INSERT/UPDATE
- Established company cascade trigger to update job search_index entries when company data changes
- Implemented delete triggers to clean up search_index when source rows are deleted
- Backfilled all existing candidates, jobs, companies into search_index
- Documented verification queries for manual testing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create trigger functions and triggers for candidates, jobs, companies** - `e42c3dc7` (feat)
2. **Task 2: Verify search_index population with SQL queries** - (verification queries included in migration file, no separate commit)

## Files Created/Modified

- `supabase/migrations/20260213000003_search_index_triggers_core.sql` - Trigger functions for candidates, jobs, companies sync to search.search_index, company cascade trigger, delete triggers, backfill statements, and verification queries

## Decisions Made

**1. Reuse search_vector from jobs/companies tables**
- Rationale: Jobs and companies tables already have populated search_vector columns maintained by their own BEFORE triggers. Reusing these avoids duplicating complex requirements-aware logic (jobs includes job_requirements in search_vector via a STABLE function that queries the job_requirements table).

**2. AFTER triggers for sync (not BEFORE)**
- Rationale: AFTER triggers run after the row is committed and BEFORE triggers on the source table have already populated search_vector. This allows us to read NEW.search_vector which is already computed.

**3. Company cascade trigger**
- Rationale: When company name/industry/location changes, the jobs table has triggers that update denormalized company_name/company_industry/company_headquarters_location columns. We need to cascade those changes to search_index job entries to keep subtitle/metadata in sync.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all entity tables have existing search_vector columns and triggers, allowing us to reuse computed tsvectors instead of duplicating logic.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 03 (Relational Entity Triggers):**
- Pattern established for AFTER INSERT OR UPDATE triggers syncing to search_index
- TG_ARGV delete trigger pattern ready for reuse with applications, placements, recruiter_candidates

**Ready for Search Service:**
- search.search_index now populated with candidates, jobs, companies
- Cross-entity search via ts_rank ready to implement
- Organization_id mapping established for access control filtering

**No blockers:** All prerequisites met for relational entity trigger implementation.

---
*Phase: 01-search-infrastructure*
*Completed: 2026-02-13*
