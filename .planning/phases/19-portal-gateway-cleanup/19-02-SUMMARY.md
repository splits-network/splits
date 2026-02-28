---
phase: 19-portal-gateway-cleanup
plan: 02
subsystem: api
tags: [fastify, api-gateway, routing, admin, cleanup]

# Dependency graph
requires:
  - phase: 17-admin-gateway
    provides: admin-gateway now handles all admin API traffic
  - phase: 18-admin-app
    provides: admin app routes through admin-gateway, not api-gateway
provides:
  - api-gateway with zero admin routes — only user-facing traffic
  - clean swagger tags (no admin tag)
  - chat.ts with only /api/v2/chat routes
  - site-notifications.ts with only public GET route
  - content.ts with only public GET routes for pages and navigation
affects: [portal, candidate, corporate, future-routing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Api-gateway = user-facing only; admin-gateway = admin traffic only"
    - "Admin routes removed from api-gateway rather than duplicated"

key-files:
  created: []
  modified:
    - services/api-gateway/src/routes/v2/chat.ts
    - services/api-gateway/src/routes/v2/site-notifications.ts
    - services/api-gateway/src/routes/v2/content.ts
    - services/api-gateway/src/index.ts

key-decisions:
  - "Removed requireAuth import from chat.ts (no longer needed after admin route removal)"
  - "Removed buildAuthHeaders import from site-notifications.ts and content.ts (public-only routes need no auth headers)"
  - "Stale comment about /site-notifications/all being admin-only removed alongside the route itself"

patterns-established:
  - "Api-gateway comment headers updated to reflect public-only nature of content routes"

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 19 Plan 02: Remove Admin Routes from Api-Gateway Summary

**Api-gateway stripped of all admin routes — 558 lines removed, leaving only user-facing chat, public site-notifications, and public content/navigation reads**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T02:28:08Z
- **Completed:** 2026-02-28T02:32:00Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Removed two admin chat route handlers (`/api/v2/admin/chat` and `/api/v2/admin/chat/*`) from chat.ts
- Removed five admin site-notification routes (GET /all, POST, PATCH /:id, POST /bulk-delete, DELETE /:id) from site-notifications.ts
- Removed ten admin content routes (POST/PATCH/DELETE pages, POST /import, all five content-images endpoints, POST navigation) from content.ts
- Cleaned up unused imports (`requireAuth` from chat.ts, `buildAuthHeaders` from site-notifications.ts and content.ts)
- Removed `admin` swagger tag and `/api/v2/admin/chat` rate-limit exemption from index.ts
- Build passes clean with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove admin routes from api-gateway** - `0fbc5e9b` (feat)

**Plan metadata:** (see docs commit below)

## Files Created/Modified
- `services/api-gateway/src/routes/v2/chat.ts` - Retained only user-facing /api/v2/chat and /api/v2/chat/* routes; removed requireAuth import
- `services/api-gateway/src/routes/v2/site-notifications.ts` - Retained only public GET /api/v2/site-notifications route; removed requireAuth and unused admin imports
- `services/api-gateway/src/routes/v2/content.ts` - Retained only public GET routes for pages (list, by-slug, by-id) and navigation (list, by-id); removed buildAuthHeaders import
- `services/api-gateway/src/index.ts` - Removed admin swagger tag, /api/v2/admin/chat rate limit exemption, and stale admin comment

## Decisions Made
- Removed `requireAuth` import from chat.ts since neither remaining user-facing chat route uses `preHandler: requireAuth()` (they pass auth headers but don't enforce at gateway level)
- Removed `buildAuthHeaders` import from content.ts — all remaining routes pass `{}` as auth headers since they are public
- Cleaned stale comment in index.ts that warned about `/site-notifications/all` being admin-only (route is now gone)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Api-gateway now cleanly serves only user-facing traffic
- Admin traffic routes exclusively through admin-gateway
- Ready for any remaining Phase 19 cleanup plans

---
*Phase: 19-portal-gateway-cleanup*
*Completed: 2026-02-28*
