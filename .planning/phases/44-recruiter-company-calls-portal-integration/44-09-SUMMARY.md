---
phase: 44-recruiter-company-calls-portal-integration
plan: 09
subsystem: ui
tags: [react, calls, tabs, detail-pages, entity-scoped]

requires:
  - phase: 44-06
    provides: Call list page with table/grid views, filters, stats bar
  - phase: 44-07
    provides: Call creation modal with entity linking and scheduling

provides:
  - Company detail Calls tab with full filtering and call creation
  - Job detail Calls tab with full filtering and call creation
  - Entity-scoped call tabs reusable pattern for future entity pages

affects: [44-11, 44-12]

tech-stack:
  added: []
  patterns:
    - "Entity-scoped call tabs: useStandardList with pre-set entity_type/entity_id filters"
    - "Entity call stats: /calls/stats?entity_type=X&entity_id=Y for scoped metrics"

key-files:
  created:
    - apps/portal/src/app/portal/companies/components/shared/company-calls-tab.tsx
    - apps/portal/src/app/portal/roles/components/shared/job-calls-tab.tsx
  modified:
    - apps/portal/src/app/portal/companies/components/shared/company-detail.tsx
    - apps/portal/src/app/portal/roles/components/shared/job-detail.tsx

key-decisions:
  - "Entity call tabs use syncToUrl: false to avoid polluting parent page URL params"
  - "Stats fetched with entity query params for scoped metrics (not global stats)"
  - "defaultLimit: 10 for entity tabs (vs 24 for main list) since tab is secondary content"

patterns-established:
  - "Entity-scoped call tab: reusable pattern with pre-set entity filters, inline stats, and pre-filled creation modal"

duration: 5min
completed: 2026-03-09
---

# Phase 44 Plan 09: Entity Call Tabs Summary

**Calls tabs on company and job detail pages with full filtering, stats, and entity-prefilled call creation**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T06:09:24Z
- **Completed:** 2026-03-09T06:14:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Company detail page has a Calls tab showing calls linked to that company with full filtering
- Job detail page has a Calls tab showing calls linked to that job with full filtering
- New Call buttons on entity pages open creation modal pre-filled with entity context
- Entity-scoped stats summary shows upcoming, this month, avg duration, and follow-up counts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create entity-scoped call tabs** - `911c6ed0` (feat)
2. **Task 2: Integrate call tabs into detail views** - `c1d27825` (feat)

## Files Created/Modified

- `apps/portal/src/app/portal/companies/components/shared/company-calls-tab.tsx` - Company-scoped calls tab with filters, stats, table, pagination, and creation modal
- `apps/portal/src/app/portal/roles/components/shared/job-calls-tab.tsx` - Job-scoped calls tab with same pattern
- `apps/portal/src/app/portal/companies/components/shared/company-detail.tsx` - Added Calls tab entry and rendering
- `apps/portal/src/app/portal/roles/components/shared/job-detail.tsx` - Added Calls tab entry and rendering

## Decisions Made

- Entity call tabs use `syncToUrl: false` to avoid polluting the parent detail page URL with call filter params
- Stats are fetched with entity-scoped query params (`entity_type=company&entity_id=X`) for accurate per-entity metrics
- Default page limit is 10 for entity tabs (lower than main list's 24) since the tab is secondary content within a detail panel

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Company and job detail pages now have full call integration
- Ready for remaining portal integration plans (notifications, real-time updates)

---
*Phase: 44-recruiter-company-calls-portal-integration*
*Completed: 2026-03-09*
