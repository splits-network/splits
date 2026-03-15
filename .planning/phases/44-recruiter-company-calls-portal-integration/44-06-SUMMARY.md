---
phase: 44-recruiter-company-calls-portal-integration
plan: 06
subsystem: ui
tags: [next.js, react, portal, calls, standard-list, daisy-ui, basel-ui]

requires:
  - phase: 44-02
    provides: Call scheduling API with stats/tags endpoints

provides:
  - Portal calls list page with table/grid views
  - Call sidebar navigation item
  - Call stats bar, filters, and controls
  - Frontend types mirroring call-service API

affects: [44-07, 44-08, 44-09, 44-10, 44-11]

tech-stack:
  added: []
  patterns:
    - "Call list uses useStandardList hook with /calls endpoint"
    - "Separate stats/tags fetches via createAuthenticatedClient"

key-files:
  created:
    - apps/portal/src/app/portal/calls/page.tsx
    - apps/portal/src/app/portal/calls/types.ts
    - apps/portal/src/app/portal/calls/hooks/use-calls.ts
    - apps/portal/src/app/portal/calls/components/shared/call-stats-bar.tsx
    - apps/portal/src/app/portal/calls/components/shared/controls-bar.tsx
    - apps/portal/src/app/portal/calls/components/shared/call-filters.tsx
    - apps/portal/src/app/portal/calls/components/table/call-table.tsx
    - apps/portal/src/app/portal/calls/components/table/call-row.tsx
    - apps/portal/src/app/portal/calls/components/grid/call-grid.tsx
    - apps/portal/src/app/portal/calls/components/grid/call-card.tsx
  modified:
    - apps/portal/src/components/sidebar.tsx

key-decisions:
  - "Calls sidebar item placed after Calendar in management section"
  - "Table view as default viewMode (not grid) since calls are data-dense"
  - "Stats bar integrated into page header with neutral background"

patterns-established:
  - "Call list follows roles feature pattern: useStandardList + BaselControlsBarShell + table/grid views"

duration: 5min
completed: 2026-03-09
---

# Phase 44 Plan 06: Portal Calls List Page Summary

**Portal calls section with sidebar nav, standard list page (table/grid), filters by type/status/date/tags, and stats overview bar**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-09T05:57:36Z
- **Completed:** 2026-03-09T06:02:36Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Added top-level "Calls" sidebar item visible to recruiters and business users
- Created full call list page following roles feature pattern with table and grid views
- Built stats bar showing upcoming, this week, this month, avg duration, and follow-up counts
- Implemented comprehensive filters: call type, status, tags, follow-up, date range
- Created frontend types mirroring call-service API response types

## Task Commits

Each task was committed atomically:

1. **Task 1: Create call list page with hooks, types, and sidebar nav item** - `77459aca` (feat)
2. **Task 2: Clean up controls-bar** - `2a07e382` (refactor)

## Files Created/Modified
- `apps/portal/src/app/portal/calls/page.tsx` - Call list page with standard list pattern
- `apps/portal/src/app/portal/calls/types.ts` - CallListItem, CallFilters, CallStats types and formatters
- `apps/portal/src/app/portal/calls/hooks/use-calls.ts` - Data fetching hook with useStandardList
- `apps/portal/src/app/portal/calls/components/shared/call-stats-bar.tsx` - 5-stat overview bar
- `apps/portal/src/app/portal/calls/components/shared/controls-bar.tsx` - Search, view toggle, filters shell
- `apps/portal/src/app/portal/calls/components/shared/call-filters.tsx` - Filter dropdown components
- `apps/portal/src/app/portal/calls/components/table/call-table.tsx` - Table view with responsive column hiding
- `apps/portal/src/app/portal/calls/components/table/call-row.tsx` - Table row with status badges and entity display
- `apps/portal/src/app/portal/calls/components/grid/call-grid.tsx` - Grid layout wrapper
- `apps/portal/src/app/portal/calls/components/grid/call-card.tsx` - Card with participant avatars and status
- `apps/portal/src/components/sidebar.tsx` - Added Calls nav item

## Decisions Made
- Calls sidebar item placed after Calendar in management section, using fa-video icon
- Table view set as default viewMode since call data is dense and benefits from columnar layout
- Stats bar uses neutral background matching the roles header pattern
- All components were created in Task 1 since the plan had overlapping file lists between tasks

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Call list page ready for call detail page (plan 44-07)
- Entity-scoped call tabs can reference these components
- Call creation modal can integrate with the controls bar

---
*Phase: 44-recruiter-company-calls-portal-integration*
*Completed: 2026-03-09*
