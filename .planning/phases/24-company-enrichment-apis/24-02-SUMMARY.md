---
phase: 24-company-enrichment-apis
plan: 02
subsystem: api
tags: [fastify, api-gateway, proxy, perks, culture-tags, company-skills, bulk-replace]

# Dependency graph
requires:
  - phase: 23-lookup-apis
    provides: ats-service endpoints for perks, culture-tags, company-perks, company-skills, company-culture-tags
provides:
  - Gateway proxy routes for all Phase 23 lookup and junction endpoints
  - Gateway bulk-replace PUT routes for company perks, skills, and culture-tags
affects: [25-company-profile-ui, frontend-company-enrichment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ATS_RESOURCES array extended with new resource entries for automatic CRUD proxy registration
    - registerBulkReplaceRoutes extended with company-scoped PUT routes following existing job/candidate pattern

key-files:
  created: []
  modified:
    - services/api-gateway/src/routes/v2/ats.ts

key-decisions:
  - "Used ATS_RESOURCES array registration pattern for company-perks/skills/culture-tags — consistent with candidate-skills and job-skills"
  - "Company junction bulk-replace routes placed in registerBulkReplaceRoutes to run before CRUD routes, avoiding path collision with /companies/:id"

patterns-established:
  - "Company junction bulk-replace: PUT /api/v2/companies/:companyId/{resource} registered before CRUD to avoid Fastify route conflicts"

# Metrics
duration: 5min
completed: 2026-03-03
---

# Phase 24 Plan 02: Gateway Proxy Routes for Company Enrichment APIs Summary

**10 new gateway routes wiring perks/culture-tags lookup endpoints and company-perks/skills/culture-tags bulk-replace PUTs through api-gateway to ats-service**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-03
- **Completed:** 2026-03-03
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Added 5 new ATS_RESOURCES entries (perks, culture-tags, company-perks, company-skills, company-culture-tags) enabling automatic GET+POST+CRUD proxy registration
- Added 3 explicit PUT bulk-replace routes for company junction tables (perks, skills, culture-tags) inside registerBulkReplaceRoutes
- All routes authenticated via requireAuth() preHandler, consistent with all other gateway routes
- Gateway builds cleanly with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add lookup and junction resources to ATS_RESOURCES array** - `76212aa0` (feat)
2. **Task 2: Add company junction bulk-replace PUT routes** - `76212aa0` (feat, included in same commit)

**Plan metadata:** pending (docs commit)

## Files Created/Modified

- `services/api-gateway/src/routes/v2/ats.ts` - Added 5 ATS_RESOURCES entries + 3 company bulk-replace PUT routes

## Decisions Made

- ATS_RESOURCES pattern used for all junction list resources (company-perks, company-skills, company-culture-tags) — consistent with how candidate-skills and job-skills are handled. Extra CRUD methods registered are harmless (ats-service returns 404 for unsupported methods).
- Bulk-replace company routes registered in `registerBulkReplaceRoutes` (before standard CRUD) to prevent path collision with the generic `/companies/:id` route that `registerResourceRoutes` creates.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 10 new gateway routes are live and authenticated
- Frontend can now call perks/culture-tags typeahead search via GET /api/v2/perks and GET /api/v2/culture-tags
- Frontend can call find-or-create via POST /api/v2/perks and POST /api/v2/culture-tags
- Frontend can list company junctions via GET /api/v2/company-{perks,skills,culture-tags}?company_id=...
- Frontend can bulk-replace company junctions via PUT /api/v2/companies/:companyId/{perks,skills,culture-tags}
- Ready for Phase 25 company profile UI work

---
*Phase: 24-company-enrichment-apis*
*Completed: 2026-03-03*
