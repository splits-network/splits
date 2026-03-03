---
phase: 23-lookup-apis
plan: 01
subsystem: api
tags: [fastify, supabase, typeahead, find-or-create, perks, slug-deduplication]

# Dependency graph
requires:
  - phase: 22-schema-and-types
    provides: perks table migration and Perk shared types
provides:
  - PerkRepository: search, getById, getBySlug, create against perks table
  - PerkService: searchPerks, findOrCreate (slug dedup + AccessContextResolver)
  - GET /api/v2/perks: typeahead search endpoint (ilike, up to 20 results)
  - POST /api/v2/perks: find-or-create endpoint (200 if existing, 201 if new)
affects: [25-company-profile-ui, any future perk junction modules]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "findOrCreate returns { perk, created: boolean } so routes can distinguish 200 vs 201"
    - "PerkRepository mirrors SkillRepository exactly (no list method — perks only need typeahead)"

key-files:
  created:
    - services/ats-service/src/v2/perks/repository.ts
    - services/ats-service/src/v2/perks/service.ts
    - services/ats-service/src/v2/perks/routes.ts
  modified:
    - services/ats-service/src/v2/routes.ts

key-decisions:
  - "findOrCreate returns { perk, created } tuple so route layer picks 200 vs 201 status code"
  - "No list-all endpoint for perks — typeahead search only (unlike skills which has list)"
  - "Default limit 20 for perks (vs 10 for skills) since perks are broader/fewer in number"

patterns-established:
  - "Lookup module pattern: repository / service / routes + registration in v2/routes.ts"
  - "POST find-or-create returns 200 for existing, 201 for new — use tuple internally"

# Metrics
duration: 1min
completed: 2026-03-03
---

# Phase 23 Plan 01: Perks Lookup API Summary

**GET /api/v2/perks (ilike typeahead) and POST /api/v2/perks (slug-dedup find-or-create returning 200/201) wired into ats-service v2 route tree**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-03-03T23:16:13Z
- **Completed:** 2026-03-03T23:17:12Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- PerkRepository with search (ilike), getById, getBySlug, create — mirrors SkillRepository exactly
- PerkService with searchPerks and findOrCreate (slug dedup + AccessContextResolver for created_by UUID resolution)
- Perk routes registered: GET for typeahead, POST for idempotent find-or-create
- ats-service builds cleanly with all four files in place

## Task Commits

1. **Task 1: Create perks repository, service, and routes** - `b0a1dd74` (feat)
2. **Task 2: Register perk routes in v2 routes** - `a4679b9c` (feat)

## Files Created/Modified

- `services/ats-service/src/v2/perks/repository.ts` - Supabase queries for perks table
- `services/ats-service/src/v2/perks/service.ts` - Find-or-create logic with slug deduplication
- `services/ats-service/src/v2/perks/routes.ts` - GET (typeahead) and POST (find-or-create) endpoints
- `services/ats-service/src/v2/routes.ts` - Added perk module import and registration

## Decisions Made

- `findOrCreate` returns `{ perk, created: boolean }` tuple so routes can return 200 for existing records and 201 for newly created ones — cleaner than checking response state after the fact.
- No list-all endpoint added for perks (unlike skills which has one). Perks are only needed via typeahead in the UI.
- Default search limit set to 20 (skills uses 10) since perks are broader categories with fewer total entries.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GET /api/v2/perks and POST /api/v2/perks are callable from the frontend (Phase 25 perk picker UI)
- Pattern established for culture-tags lookup API (Phase 23 plan 02) — mirror this module exactly with table name substitution

---
*Phase: 23-lookup-apis*
*Completed: 2026-03-03*
