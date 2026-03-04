---
phase: 22-schema-and-types
plan: 01
subsystem: database
tags: [postgres, supabase, rls, migrations, trigram, gin-index]

# Dependency graph
requires: []
provides:
  - perks lookup table with slug deduplication and trigram typeahead index
  - culture_tags lookup table with slug deduplication and trigram typeahead index
  - company_perks junction table with composite PK and CASCADE deletes
  - company_culture_tags junction table with composite PK and CASCADE deletes
  - company_skills junction table reusing existing skills table
  - companies.stage column with CHECK constraint (8 values)
  - companies.founded_year, tagline, linkedin_url, twitter_url, glassdoor_url columns
  - RLS on all 5 new tables with authenticated + service_role policies
affects:
  - 22-02-types (TypeScript types need these tables)
  - 23-lookup-apis (API endpoints target these tables)
  - 24-company-enrichment-apis (scalar fields and computed stats)
  - 25-company-settings-ui (UI forms write to these tables)
  - 27-search-index-enrichment (search triggers index new fields)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Skills pattern: id UUID PK + name TEXT + slug TEXT UNIQUE + is_approved + created_by + trigram index"
    - "Junction pattern: composite PK (entity_id, lookup_id) + ON DELETE CASCADE on both FKs"
    - "RLS pattern: {table}_select/_insert/_update/_delete for authenticated + {table}_service_role bypass"

key-files:
  created:
    - supabase/migrations/20260303000006_company_profile_enhancement.sql
  modified: []

key-decisions:
  - "Followed skills migration pattern exactly for perks and culture_tags tables"
  - "company_skills reuses existing skills table (no new lookup, cross-entity skill matching)"
  - "stage as TEXT with CHECK constraint over ENUM type (easier to extend)"
  - "founded_year as SMALLINT (sufficient range, minimal storage)"
  - "All junction tables omit source/is_required columns — company junctions are simpler than candidate_skills/job_skills"

patterns-established:
  - "Lookup table: name + slug (unique) + is_approved + created_by + gin trigram index"
  - "Company junction: company_id + lookup_id composite PK + CASCADE deletes on both sides"

# Metrics
duration: 1min
completed: 2026-03-03
---

# Phase 22 Plan 01: Schema & Types (Migration) Summary

**Postgres migration creating perks and culture_tags lookup tables, three company junction tables, and six new scalar columns on companies with a CHECK-constrained stage enum**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-03T22:41:04Z
- **Completed:** 2026-03-03T22:41:47Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created perks and culture_tags as first-class lookup tables matching the skills pattern with slug deduplication and trigram GIN indexes for typeahead
- Created company_perks, company_culture_tags, and company_skills junction tables with composite PKs and CASCADE deletes on both foreign keys
- Added six new nullable scalar columns to companies: stage (constrained to 8 values), founded_year, tagline, linkedin_url, twitter_url, glassdoor_url
- Enabled RLS on all 5 new tables with authenticated read/write policies and service_role bypass

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration for new tables and company columns** - `f89e1676` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `supabase/migrations/20260303000006_company_profile_enhancement.sql` - All new tables, columns, indexes, and RLS policies for v7.0 company profile enhancement

## Decisions Made
- Followed the skills migration pattern exactly — same column layout, same RLS naming convention, same index pattern
- company_skills reuses existing skills table rather than creating a duplicate lookup, enabling cross-entity matching (candidate skills vs company tech stack)
- stage stored as TEXT with CHECK constraint (not ENUM) consistent with how commute_types and job_level are handled in v4.0
- Junction tables for companies are simpler than candidate_skills/job_skills (no source or is_required fields needed)
- founded_year as SMALLINT (2-byte integer, covers year range 0-32767, sufficient for all real use cases)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Migration runs via standard Supabase migration tooling.

## Next Phase Readiness
- Migration creates all required tables and columns for plan 22-02 (TypeScript types)
- All 5 new tables and 6 new company columns exist and are ready for type definitions
- No blockers for Phase 23 (Lookup APIs) after types are defined

---
*Phase: 22-schema-and-types*
*Completed: 2026-03-03*
