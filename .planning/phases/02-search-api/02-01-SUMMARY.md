---
phase: 02-search-api
plan: 01
subsystem: api
tags: [fastify, supabase, search, full-text-search, access-control, websearch]

# Dependency graph
requires:
  - phase: 01-search-infrastructure
    provides: search.search_index table with GIN index and trigger-based sync
provides:
  - search-service with GET /api/v2/search endpoint
  - Typeahead mode (top 5 per entity type)
  - Full search mode (paginated results)
  - Role-based access control via AccessContextResolver
  - Query validation and sanitization
affects: [02-02-typeahead-ui, 02-03-full-search-ui, api-gateway]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nano-service pattern for focused search functionality"
    - "AccessContextResolver for role-based filtering"
    - "textSearch('search_vector', query, { type: 'websearch' }) for full-text search"
    - "Query validation with min 2 chars, sanitization with null byte removal"

key-files:
  created:
    - services/search-service/package.json
    - services/search-service/src/index.ts
    - services/search-service/src/v2/search/types.ts
    - services/search-service/src/v2/search/repository.ts
    - services/search-service/src/v2/search/service.ts
    - services/search-service/src/v2/routes.ts
  modified: []

key-decisions:
  - "Query each entity type separately for typeahead (max 7 parallel queries) instead of single query with grouping - simpler and faster with GIN index"
  - "Sort by updated_at desc instead of ts_rank (Supabase JS doesn't expose ts_rank in query builder) - newest results first is acceptable heuristic"
  - "Clamp limit to max 100 to prevent abuse"
  - "Access control: platform admins see all, company users see org-scoped + public, recruiters/candidates see public + null-org entities"

patterns-established:
  - "SearchRepository with AccessContextResolver for role-based filtering"
  - "SearchService validates and sanitizes queries before repository calls"
  - "ValidationError class with code property for structured error responses"
  - "Route handler reads x-clerk-user-id header and returns 401 if missing"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 2 Plan 1: Search Service Summary

**New search-service with GET /api/v2/search endpoint querying search.search_index via textSearch, supporting typeahead (top 5 per type) and full (paginated) modes with role-based access control**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T06:17:40Z
- **Completed:** 2026-02-13T06:20:23Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created search-service nano-service with Fastify server on port 3012
- Implemented typeahead search returning top 5 results per entity type grouped by label
- Implemented full search with pagination and total count
- Applied role-based access control via AccessContextResolver (platform admins see all, company users see org-scoped + public, recruiters/candidates see public entities)
- Query validation (min 2 chars, max 200 chars, not empty/whitespace) and sanitization (null bytes removed, whitespace collapsed)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create search-service scaffold and types** - `1f25a992` (feat)
2. **Task 2: Create search repository with access control and search service with validation** - `64b625a2` (feat)

## Files Created/Modified
- `services/search-service/package.json` - Service package definition with minimal dependencies (no Redis, RabbitMQ, Swagger)
- `services/search-service/tsconfig.json` - Standard TypeScript config
- `services/search-service/src/index.ts` - Fastify server bootstrap with health check at /health, port 3012
- `services/search-service/src/v2/search/types.ts` - SearchMode, SearchableEntityType, SearchParams, SearchResult, TypeaheadResponse, TypeaheadGroup, ENTITY_TYPE_LABELS
- `services/search-service/src/v2/search/repository.ts` - Database access layer querying search.search_index with textSearch and access control
- `services/search-service/src/v2/search/service.ts` - Business logic with query validation, sanitization, and mode routing
- `services/search-service/src/v2/routes.ts` - GET /api/v2/search route handler

## Decisions Made
- **Typeahead approach:** Query each entity type separately (max 7 parallel queries) instead of single query with post-processing grouping. Each query hits the GIN index independently and is faster/simpler than single query with client-side grouping.
- **Sort heuristic:** Sort by updated_at desc instead of ts_rank (Supabase JS query builder doesn't expose ts_rank directly for ordering). Newest results first is an acceptable heuristic for relevance.
- **Access control filter for company users:** `.or('organization_id.in.(${orgIds}),organization_id.is.null,entity_type.in.(job,company)')` shows org-scoped entities + null-org entities (candidates, recruiters) + all jobs/companies (marketplace browsing).
- **Access control filter for recruiters/candidates:** `.or('organization_id.is.null,entity_type.in.(job,company)')` shows null-org entities + all jobs/companies. Applications and placements hidden from non-org users in search (accessed via direct navigation).
- **Query sanitization:** Remove null bytes, collapse whitespace, limit to 200 chars. websearch_to_tsquery handles special characters safely via Postgres parameterization.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Search service ready for API Gateway integration
- Typeahead and full search endpoints functional with role-based filtering
- Ready for frontend typeahead UI (Plan 02-02) and full search UI (Plan 02-03)
- **Next step:** Update API Gateway to forward /api/v2/search requests to search-service:3012

---
*Phase: 02-search-api*
*Completed: 2026-02-13*
