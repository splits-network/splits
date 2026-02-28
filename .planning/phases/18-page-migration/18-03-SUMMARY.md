---
phase: 18-page-migration
plan: 03
subsystem: api
tags: [fastify, supabase, admin, rest-api, backend]

requires:
  - phase: 17-admin-app-gateway-scaffold
    provides: admin-gateway proxy routing /admin/{service}/admin/* to domain services

provides:
  - /admin/* routes in identity-service (users, organizations, counts)
  - /admin/* routes in ats-service (jobs, applications, candidates, assignments, placements, counts)
  - /admin/* routes in network-service (recruiters, recruiter-companies, counts)
  - /admin/* routes in billing-service (payouts, escrow, billing-profiles, counts)
  - /admin/* routes in notification-service (site-notifications CRUD, notification-log, counts)

affects:
  - 18-04-PLAN through 18-10-PLAN (admin pages that consume these endpoints)

tech-stack:
  added: []
  patterns:
    - AdminRepository/AdminService/AdminRoutes triad per service for permissive admin queries
    - /admin/* route prefix separates admin surface from user-facing /api/v2/* endpoints
    - paginate() + buildPagination() helpers for consistent pagination across admin repos

key-files:
  created:
    - services/identity-service/src/v2/admin/repository.ts
    - services/identity-service/src/v2/admin/service.ts
    - services/identity-service/src/v2/admin/routes.ts
    - services/ats-service/src/v2/admin/repository.ts
    - services/ats-service/src/v2/admin/service.ts
    - services/ats-service/src/v2/admin/routes.ts
    - services/network-service/src/v2/admin/repository.ts
    - services/network-service/src/v2/admin/service.ts
    - services/network-service/src/v2/admin/routes.ts
    - services/billing-service/src/v2/admin/repository.ts
    - services/billing-service/src/v2/admin/service.ts
    - services/billing-service/src/v2/admin/routes.ts
    - services/notification-service/src/v2/admin/repository.ts
    - services/notification-service/src/v2/admin/service.ts
    - services/notification-service/src/v2/admin/routes.ts
  modified:
    - services/identity-service/src/v2/routes.ts
    - services/ats-service/src/v2/routes.ts
    - services/network-service/src/v2/routes.ts
    - services/billing-service/src/v2/routes.ts
    - services/notification-service/src/v2/routes.ts

key-decisions:
  - "Admin routes added directly to domain services under /admin/* prefix — clean separation from user-scoped /api/v2/* routes"
  - "No service layer needed for admin counts — direct repository calls suffice"
  - "network-service admin uses recruiters + recruiter_companies tables (no 'matches' table exists)"
  - "notification-service admin covers both site_notifications (CRUD) and notification_log (read-only)"
  - "billing-service admin uses placement_payout_transactions (payouts) and escrow_holds — aligns with existing table names"
  - "Admin-gateway proxy already correct: rewritePrefix:'' strips /admin/{service}, leaving /admin/* intact for domain services"

patterns-established:
  - "AdminRepository pattern: no access context resolution, direct permissive queries, paginate()/buildPagination() helpers"
  - "AdminService pattern: thin delegation layer, one method per repository method"
  - "Admin route registration: appended at end of registerV2Routes() in each service"
  - "getAdminCounts(): parallel Promise.all queries returning aggregate counts for sidebar badges"

duration: 12min
completed: 2026-02-27
---

# Phase 18 Plan 03: Admin Domain Service Routes Summary

**Permissive /admin/* REST endpoints in 5 domain services with pagination, search, and aggregate count endpoints for admin sidebar badges**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-02-27T00:00:00Z
- **Completed:** 2026-02-27T00:12:00Z
- **Tasks:** 2
- **Files modified:** 20

## Accomplishments

- Created admin route triads (repository/service/routes) in all 5 domain services
- All list endpoints support pagination (page/limit), search, sort_by/sort_order, and entity-specific filters
- Each service exposes a `GET /admin/counts` endpoint returning aggregate counts for admin sidebar badges
- Admin-gateway proxy confirmed correct: `rewritePrefix: ''` strips `/admin/{service}`, domain services receive `/admin/*`
- All 5 services compile cleanly with `tsc -b`

## Task Commits

1. **Task 1: Admin routes in identity-service and ats-service** - `357ac9bb` (feat)
2. **Task 2: Admin routes in network, billing, notification services + gateway** - `790e79d8` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `services/identity-service/src/v2/admin/repository.ts` - AdminIdentityRepository: users, organizations, counts
- `services/identity-service/src/v2/admin/service.ts` - AdminIdentityService: thin delegation layer
- `services/identity-service/src/v2/admin/routes.ts` - GET /admin/users, /admin/users/:id, /admin/organizations, /admin/counts
- `services/ats-service/src/v2/admin/repository.ts` - AdminAtsRepository: jobs, applications, candidates, assignments, placements, counts
- `services/ats-service/src/v2/admin/service.ts` - AdminAtsService: thin delegation layer
- `services/ats-service/src/v2/admin/routes.ts` - GET /admin/jobs, /admin/jobs/:id, /admin/applications, /admin/candidates, /admin/assignments, /admin/placements, /admin/counts
- `services/network-service/src/v2/admin/repository.ts` - AdminNetworkRepository: recruiters, recruiter-companies, counts
- `services/network-service/src/v2/admin/service.ts` - AdminNetworkService: thin delegation layer
- `services/network-service/src/v2/admin/routes.ts` - GET /admin/recruiters, PATCH /admin/recruiters/:id/status, GET /admin/recruiter-companies, /admin/counts
- `services/billing-service/src/v2/admin/repository.ts` - AdminBillingRepository: placement_payout_transactions, escrow_holds, company_billing_profiles, counts
- `services/billing-service/src/v2/admin/service.ts` - AdminBillingService: thin delegation layer
- `services/billing-service/src/v2/admin/routes.ts` - GET /admin/payouts, /admin/escrow, /admin/billing-profiles, /admin/counts
- `services/notification-service/src/v2/admin/repository.ts` - AdminNotificationRepository: site_notifications CRUD, notification_log, counts
- `services/notification-service/src/v2/admin/service.ts` - AdminNotificationService: thin delegation layer
- `services/notification-service/src/v2/admin/routes.ts` - Full CRUD for /admin/site-notifications, GET /admin/notification-log, /admin/counts
- `services/identity-service/src/v2/routes.ts` - Appended admin route registration
- `services/ats-service/src/v2/routes.ts` - Appended admin route registration
- `services/network-service/src/v2/routes.ts` - Appended admin route registration
- `services/billing-service/src/v2/routes.ts` - Appended admin route registration
- `services/notification-service/src/v2/routes.ts` - Appended admin route registration

## Decisions Made

- Admin routes added under `/admin/*` prefix in domain services — clean separation from user-scoped `/api/v2/*` routes
- No changes needed to admin-gateway `routes.ts` — existing `rewritePrefix: ''` correctly strips `/admin/{service}`, leaving `/admin/users` etc. intact
- `network-service` admin covers `recruiters` and `recruiter_companies` tables (no "matches" table found in network-service; plan's "matches" reference was navigated to recruiter-companies relationship data)
- `notification-service` admin covers both `site_notifications` (full CRUD) and `notification_log` (read-only list) — gives admin full control of site banners plus visibility into delivery logs
- `billing-service` payouts endpoint targets `placement_payout_transactions` table (matching existing repository naming)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Adjustment] Network service has no "matches" table**
- **Found during:** Task 2 (network-service admin routes)
- **Issue:** Plan specified "companies, matches" for network-service admin, but no matches table exists in network-service (ATS handles companies; network handles recruiter relationships)
- **Fix:** Implemented `listRecruitersAdmin` and `listRecruiterCompaniesAdmin` instead — these are the actual entities in network-service that admin needs
- **Files modified:** `services/network-service/src/v2/admin/repository.ts`
- **Verification:** Build passes, routes align with actual DB schema

---

**Total deviations:** 1 (minor table name adjustment)
**Impact on plan:** Admin endpoint coverage complete and aligned with actual database schema.

## Issues Encountered

None - all five services compiled successfully on first attempt.

## Next Phase Readiness

- All domain services now expose `/admin/*` endpoints for admin app page consumption
- Admin-gateway routing confirmed correct for all 5 services
- Admin pages (plans 18-04 through 18-10) can begin consuming these endpoints via `/admin/{service}/admin/*` through the gateway
- Counts endpoints ready for sidebar badge display

---
*Phase: 18-page-migration*
*Completed: 2026-02-27*
