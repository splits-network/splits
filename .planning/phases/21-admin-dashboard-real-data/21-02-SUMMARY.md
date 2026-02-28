---
phase: 21-admin-dashboard-real-data
plan: 02
subsystem: ui
tags: [nextjs, react, hooks, charts, dashboard, admin, sparklines, time-series]

requires:
  - phase: 21-01-admin-dashboard-real-data
    provides: Backend /admin/stats and /admin/chart-data endpoints with sparkline, trend, and time-series data

provides:
  - useAdminStats hook fetching real sparkline/trend data from /admin/stats endpoints with period param
  - useAdminChartData hook fetching time-series chart data from /admin/chart-data endpoints
  - DashboardStats tiles wired to real sparkline arrays and trend percentages
  - DashboardCharts rendering real AreaChart/LineChart/BarChart/PieChart data from API
  - DashboardActivity empty state replacing PLACEHOLDER array
  - Metrics page with real time-series data and working period selector

affects:
  - No further phases — this completes Phase 21 (final phase)

tech-stack:
  added: []
  patterns:
    - useAdminChartData hook pattern: parallel fetch from identity+ats /admin/chart-data with period param
    - safeFetch helper reused across both hooks for resilient parallel fetching
    - ChartCard loading skeleton via DaisyUI skeleton class when chartData.loading is true
    - Empty state pattern for activity feed (fa-inbox icon + "No recent activity" text)

key-files:
  created:
    - apps/admin/src/hooks/use-admin-chart-data.ts
  modified:
    - apps/admin/src/hooks/use-admin-stats.ts
    - apps/admin/src/app/secure/components/dashboard-stats.tsx
    - apps/admin/src/app/secure/components/dashboard-charts.tsx
    - apps/admin/src/app/secure/components/dashboard-activity.tsx
    - apps/admin/src/app/secure/components/dashboard-actions.tsx
    - apps/admin/src/app/secure/page.tsx
    - apps/admin/src/app/secure/metrics/page.tsx

key-decisions:
  - "Removed Revenue Trend, Fraud by Type, Billing Distribution charts — no time-series endpoints exist for these"
  - "dashboard-actions pendingApplications -> applications.total — new AdminStats shape uses StatMetric for applications"
  - "ChartCard sample prop removed entirely — real data renders without badge, skeleton shown when loading"
  - "useAdminStats includes timePeriod in useCallback deps — refetch triggers when period changes"

patterns-established:
  - "ChartDataResult interface: userGrowth/jobPostings/applicationVolume/hiringFunnel/hiringFunnelLabels with loading+error"
  - "StatMetric interface: { total, sparkline, trend } for any metric that has time-series data"
  - "toStatMetric() helper for safe extraction from unknown API response shapes"

duration: 3min
completed: 2026-02-28
---

# Phase 21 Plan 02: Admin Dashboard Real Data — Frontend Wiring Summary

**Dashboard stat tiles and charts now fetch real sparkline, trend, and time-series data from backend /admin/stats and /admin/chart-data endpoints — all hardcoded sample data eliminated**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-28T05:38:38Z
- **Completed:** 2026-02-28T05:42:00Z
- **Tasks:** 2
- **Files modified:** 8 (7 modified, 1 created)

## Accomplishments

- `useAdminStats` now passes `?period=` to `/admin/stats` endpoints and returns `StatMetric` (total/sparkline/trend) for users, jobs, applications, recruiters
- New `useAdminChartData` hook fetches time-series from `/admin/identity/admin/chart-data` and `/admin/ats/admin/chart-data` in parallel, re-fetches when period changes
- `DashboardStats` tiles show real sparklines and trend percentages — zero hardcoded arrays
- `DashboardCharts` renders real AreaChart, BarChart, LineChart, PieChart data — zero Math.random() calls
- `DashboardActivity` shows proper empty state (fa-inbox icon + text) instead of PLACEHOLDER items
- Metrics page replaces `getChartData()` with `useAdminChartData`, shows loading skeletons

## Task Commits

1. **Task 1: Update useAdminStats and create useAdminChartData** - `88f87e25` (feat)
2. **Task 2: Wire dashboard components and metrics to real data** - `c51274b2` (feat)

## Files Created/Modified

- `apps/admin/src/hooks/use-admin-chart-data.ts` - New hook for time-series chart data from /admin/chart-data
- `apps/admin/src/hooks/use-admin-stats.ts` - Expanded with StatMetric shape, period param passed to API
- `apps/admin/src/app/secure/components/dashboard-stats.tsx` - Real sparklines/trends, removed SAMPLE_UP/DOWN/FLAT
- `apps/admin/src/app/secure/components/dashboard-charts.tsx` - Real chart data, removed all hardcoded arrays
- `apps/admin/src/app/secure/components/dashboard-activity.tsx` - Empty state, removed PLACEHOLDER + Sample Data badge
- `apps/admin/src/app/secure/components/dashboard-actions.tsx` - Fixed pendingApplications -> applications.total
- `apps/admin/src/app/secure/page.tsx` - Added useAdminChartData, passes stats+chartData to DashboardCharts
- `apps/admin/src/app/secure/metrics/page.tsx` - Real data via useAdminChartData, removed Revenue chart + info alert

## Decisions Made

- Removed "Revenue Trend", "Fraud by Type", and "Billing Distribution" charts — no time-series endpoints exist for these metrics. Reduced chart rows from 5 to 3 for a clean layout with only data-backed charts.
- `dashboard-actions.tsx` used `stats.pendingApplications` which no longer exists in the new `AdminStats` shape. Updated to `stats.applications.total` which is the correct field. This was a required fix (Rule 1 — Bug) caught by the TypeScript build.
- Kept `activeNotifications` tile removed from stats grid (it was already removed by reducing to 8 tiles including the new `recruiters` tile with real sparkline data).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed dashboard-actions.tsx referencing removed AdminStats field**

- **Found during:** Task 2 verification (build failure)
- **Issue:** `dashboard-actions.tsx` used `stats.pendingApplications` which was removed when AdminStats was restructured to use StatMetric objects
- **Fix:** Changed to `stats.applications.total` (the correct field in the new shape)
- **Files modified:** `apps/admin/src/app/secure/components/dashboard-actions.tsx`
- **Verification:** Build passed after fix
- **Committed in:** `c51274b2` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — Bug from type mismatch after interface restructure)
**Impact on plan:** Necessary fix for compilation, no scope creep.

## Issues Encountered

None beyond the `pendingApplications` type mismatch which was auto-fixed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 21 is the final phase — all v6.0 Admin App work is complete
- Dashboard stat tiles show real sparklines and trends from database
- Charts render real time-series data with working period selector (7d/30d/90d/1y/all)
- Activity feed shows proper empty state when no activity exists
- Zero hardcoded sample data remains in the admin app

---
*Phase: 21-admin-dashboard-real-data*
*Completed: 2026-02-28*
