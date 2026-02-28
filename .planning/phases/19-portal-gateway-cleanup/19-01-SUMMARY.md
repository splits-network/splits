---
phase: 19-portal-gateway-cleanup
plan: 01
subsystem: ui
tags: [nextjs, portal, admin, sidebar, dashboard, cleanup]

# Dependency graph
requires:
  - phase: 18-page-migration
    provides: redirect stubs at apps/portal/src/app/portal/admin/ (now deleted)
provides:
  - Portal sidebar with no Admin App nav item
  - Portal user dropdown with no Admin App menu item
  - Dashboard client with no admin view branch
  - Deleted 7 admin-only dashboard hooks
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin-only UI removed from portal; platform_admin role display remains for portal UX"

key-files:
  created: []
  modified:
    - apps/portal/src/components/sidebar.tsx
    - apps/portal/src/components/user-dropdown.tsx
    - apps/portal/src/app/portal/dashboard/dashboard-client.tsx

key-decisions:
  - "isAdmin and platform_admin role kept in filterByRole and role display — admins are valid portal users"
  - "Admin users visiting dashboard now see recruiter or company view (or generic fallback), not a dedicated admin view"
  - "No redirects from /portal/admin — natural 404 is correct per Phase 18-10 decision"

patterns-established:
  - "Portal is recruiter/company-user app only; all admin UI lives in admin app"

# Metrics
duration: 2min
completed: 2026-02-28
---

# Phase 19 Plan 01: Remove Portal Admin UI Summary

**Portal stripped of all admin-specific nav, routes, dashboard views, and 7 unused admin hooks — portal is now purely recruiter/company-user app**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-28T02:27:49Z
- **Completed:** 2026-02-28T02:29:45Z
- **Tasks:** 2
- **Files modified:** 3 modified, 11 deleted

## Accomplishments

- Removed Admin App nav item from sidebar and Admin App link from user dropdown
- Deleted `apps/portal/src/app/portal/admin/` directory (layout.tsx + page.tsx redirect stubs)
- Removed `AdminView` import and `if (isAdmin)` branch from dashboard-client.tsx
- Deleted `admin-view.tsx` component and 7 admin-only dashboard hooks (1,019 lines of dead code)
- Portal builds cleanly with zero errors — confirmed via `pnpm --filter @splits-network/portal build`

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove admin navigation and redirect stubs** - `7d7d2b4d` (feat)
2. **Task 2: Remove admin dashboard view and unused hooks** - `1b9c97bf` (feat)

**Plan metadata:** (pending — see final commit)

## Files Created/Modified

- `apps/portal/src/components/sidebar.tsx` - Admin App nav item removed from navItems array
- `apps/portal/src/components/user-dropdown.tsx` - Admin App menu item removed from isAdmin block
- `apps/portal/src/app/portal/dashboard/dashboard-client.tsx` - AdminView import + branch removed, isAdmin removed from destructure
- `apps/portal/src/app/portal/admin/layout.tsx` - DELETED (redirect stub)
- `apps/portal/src/app/portal/admin/page.tsx` - DELETED (redirect stub)
- `apps/portal/src/components/basel/dashboard/views/admin-view.tsx` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-platform-stats.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-online-activity.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-platform-activity.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-top-performers.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-marketplace-health.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-platform-pipeline.ts` - DELETED
- `apps/portal/src/app/portal/dashboard/hooks/use-platform-financials.ts` - DELETED

## Decisions Made

- `isAdmin` and `platform_admin` role references kept in `filterByRole` and role display logic — admins are valid portal users who need access to recruiter/company features; only admin-specific links/views were removed
- Admin users visiting `/portal/dashboard` now see the recruiter or company view based on their other roles, or the generic fallback — no dedicated admin dashboard in portal
- No redirects from `/portal/admin` — natural 404 is correct per Phase 18-10 decision

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Portal is clean of admin UI — ready for remaining Phase 19 plans (gateway cleanup)
- No blockers or concerns

---
*Phase: 19-portal-gateway-cleanup*
*Completed: 2026-02-28*
