---
phase: 23-lookup-apis
plan: 02
subsystem: api
tags: [culture-tags, fastify, supabase, typeahead, find-or-create, ats-service]

# Dependency graph
requires:
  - phase: 22-schema-and-types
    provides: culture_tags table migration and CultureTag shared types
provides:
  - CultureTagRepository with search, getById, getBySlug, create against culture_tags table
  - CultureTagService with searchCultureTags, getCultureTag, findOrCreate (slug deduplication, 200/201 distinction)
  - registerCultureTagRoutes with GET /api/v2/culture-tags (typeahead) and POST /api/v2/culture-tags (find-or-create)
affects:
  - 23-lookup-apis plan 03 (routes.ts registration)
  - 25-company-profile-ui (culture tag picker typeahead)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Find-or-create with { entity, created } return tuple for 200/201 disambiguation"
    - "Slug-based deduplication: normalize to lowercase, strip special chars, dedupe before insert"
    - "Repository delegates Supabase client via getSupabase() for shared client access"

key-files:
  created:
    - services/ats-service/src/v2/culture-tags/repository.ts
    - services/ats-service/src/v2/culture-tags/service.ts
    - services/ats-service/src/v2/culture-tags/routes.ts
  modified: []

key-decisions:
  - "findOrCreate returns { cultureTag, created } tuple (mirrors perks pattern) for clean 200/201 HTTP status in routes"
  - "GET /api/v2/culture-tags returns empty array when no q param (no list endpoint needed - search only)"
  - "routes.ts registration deferred to orchestrator/plan-03 to avoid parallel conflict with plan-01"

patterns-established:
  - "Culture-tags module is structurally identical to perks module — future lookup modules should follow this same 3-file pattern"

# Metrics
duration: 2min
completed: 2026-03-03
---

# Phase 23 Plan 02: Culture Tags Lookup API Summary

**Culture tag typeahead search and slug-deduplicating find-or-create endpoints in ats-service, mirroring the perks module pattern exactly**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-03T23:16:35Z
- **Completed:** 2026-03-03T23:17:48Z
- **Tasks:** 2
- **Files modified:** 3 created

## Accomplishments

- CultureTagRepository with search (ilike typeahead, min 1 char, default limit 20), getById, getBySlug, and create against `culture_tags` table
- CultureTagService with slug-based deduplication in `findOrCreate`, returning `{ cultureTag, created }` tuple for HTTP 200/201 disambiguation
- Culture tag routes providing GET (typeahead search) and POST (find-or-create) following the same contract as the perks module

## Task Commits

Each task was committed atomically:

1. **Task 1: Create culture-tags repository, service, and routes** - `27e04c43` (feat)
2. **Task 2: Verify exports, defer routes.ts registration** - no separate commit (verification only, no code changes)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `services/ats-service/src/v2/culture-tags/repository.ts` - CultureTagRepository: Supabase queries for culture_tags table
- `services/ats-service/src/v2/culture-tags/service.ts` - CultureTagService: find-or-create with slug deduplication
- `services/ats-service/src/v2/culture-tags/routes.ts` - registerCultureTagRoutes: GET search + POST find-or-create

## Decisions Made

- `findOrCreate` returns `{ cultureTag, created }` tuple (mirrors perks module pattern exactly) to allow routes to return 200 for existing records and 201 for newly created ones
- GET endpoint returns empty array when no `q` param supplied — no paginated list endpoint needed (search-only lookup)
- routes.ts registration in `services/ats-service/src/v2/routes.ts` intentionally deferred to avoid parallel write conflict with plan-01 (which also modifies routes.ts); orchestrator or plan-03 handles registration for all new modules together

## Deviations from Plan

None - plan executed exactly as written. The initial routes.ts POST implementation was self-corrected during authoring (overly complex dynamic import replaced with clean tuple pattern matching perks) before the first commit.

## Issues Encountered

None - initial draft of routes.ts used an over-engineered pattern; corrected to match perks before committing.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Culture-tags module is complete and ready for routes.ts registration
- Plan-03 (or orchestrator) should register `registerCultureTagRoutes` in `services/ats-service/src/v2/routes.ts` alongside perks registration
- Phase 25 UI can use `GET /api/v2/culture-tags?q=...` for typeahead and `POST /api/v2/culture-tags` for creation

---
*Phase: 23-lookup-apis*
*Completed: 2026-03-03*
