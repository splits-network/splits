---
phase: 02-search-api
plan: 02
subsystem: api
tags: [fastify, api-gateway, proxy, authentication]

# Dependency graph
requires:
  - phase: 02-01
    provides: search-service with GET /api/v2/search endpoint

provides:
  - API gateway proxy routes for search endpoints
  - Authentication enforcement on search API
  - Service registry entry for search-service at port 3012

affects: [03-search-ui, frontend-search-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - API gateway proxy pattern for custom routes (non-CRUD)
    - Structured error forwarding from backend services

key-files:
  created:
    - services/api-gateway/src/routes/v2/search.ts
  modified:
    - services/api-gateway/src/index.ts
    - services/api-gateway/src/routes/v2/common.ts
    - services/api-gateway/src/routes/v2/routes.ts

key-decisions:
  - "Follow analytics.ts pattern for custom proxy routes instead of generic registerResourceRoutes"
  - "Require authentication for search endpoints via requireAuth() preHandler"
  - "Forward structured errors from search-service including jsonBody when available"

patterns-established:
  - "Custom endpoint proxy: analytics.ts pattern for non-standard CRUD routes"
  - "Error forwarding: check error.jsonBody before falling back to error.message"

# Metrics
duration: 2min
completed: 2026-02-13
---

# Phase 2 Plan 2: API Gateway Search Integration Summary

**Search-service wired to API gateway with authentication-required proxy at GET /api/v2/search**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T06:23:56Z
- **Completed:** 2026-02-13T06:26:22Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- search-service registered in ServiceRegistry at port 3012 (SEARCH_SERVICE_URL)
- GET /api/v2/search proxied through gateway with auth required
- Query params and auth headers forwarded to search-service
- Structured error responses forwarded from search-service to client
- Both services compile with no TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Register search-service in API gateway and create proxy routes** - `3516a087` (feat)
2. **Task 2: Verify end-to-end search API wiring** - (verification only, no commit)

**Plan metadata:** (will be committed in final metadata commit)

## Files Created/Modified

- `services/api-gateway/src/routes/v2/search.ts` - Proxy route for GET /api/v2/search with auth and error handling
- `services/api-gateway/src/index.ts` - Registered search service at port 3012
- `services/api-gateway/src/routes/v2/common.ts` - Added 'search' to ServiceName type union
- `services/api-gateway/src/routes/v2/routes.ts` - Imported and registered search routes

## Decisions Made

**Pattern choice: Custom proxy vs generic CRUD**
- Followed analytics.ts pattern for custom endpoint proxy instead of registerResourceRoutes
- Reason: Search has single GET endpoint with non-standard response format (typeahead groups vs standard pagination)

**Error forwarding strategy**
- Check for error.jsonBody before falling back to error.message
- Reason: Preserves structured validation errors from search-service (e.g., VALIDATION_ERROR with details)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward API gateway proxy registration following existing patterns.

## User Setup Required

None - no external service configuration required. Search service URL configurable via SEARCH_SERVICE_URL environment variable (defaults to http://localhost:3012).

## Next Phase Readiness

**Phase 2 (Search API) complete.** All prerequisites satisfied for Phase 3 (Search UI):

✅ **SC1:** Typeahead endpoint returns top 5 per entity type
- Verified: searchTypeahead queries each entity type with limit 5
- Response format: `{ groups: TypeaheadGroup[] }` with entity_type, count, results

✅ **SC2:** Full endpoint returns paginated results
- Verified: searchFull returns `{ data: SearchResult[], pagination: { total, page, limit, total_pages } }`
- Standard V2 pagination format

✅ **SC3:** Role-based access control
- Verified: AccessContextResolver used in repository layer
- Platform admins see all, company users see org-scoped + public, recruiters/candidates see public + null-org entities

✅ **SC4:** Malformed queries return validation errors
- Verified: VALIDATION_ERROR code used for invalid mode, missing query
- Structured error responses forwarded through gateway

**Ready for:**
- Frontend search UI components (typeahead dropdown, full search results page)
- API client integration in shared-api-client package
- Search keyboard shortcuts and global search modal

**No blockers or concerns.**

---
*Phase: 02-search-api*
*Completed: 2026-02-13*
