---
phase: 21-admin-dashboard-real-data
plan: 01
subsystem: api
tags: [fastify, supabase, time-series, sparklines, admin, stats, charts]

requires:
  - phase: 18-03-admin-domain-endpoints
    provides: Admin route structure and /admin/* pattern in domain services

provides:
  - GET /admin/stats?period= in identity-service (users sparkline, trend, total)
  - GET /admin/chart-data?period= in identity-service (userGrowth time-series)
  - GET /admin/stats?period= in ats-service (jobs/applications sparkline+trend, applicationFunnel)
  - GET /admin/chart-data?period= in ats-service (jobPostings, applicationVolume, hiringFunnel)
  - GET /admin/stats?period= in network-service (recruiters sparkline+trend, recruiterStatus breakdown)
  - Period bucketing helper (7d/30d/90d/1y/all) across all three services

affects:
  - plan-02 (frontend wiring — connects dashboard to these endpoints)
  - apps/admin dashboard-stats, dashboard-charts components

tech-stack:
  added: []
  patterns:
    - Separate stats-repository.ts and chart-repository.ts to keep main repository under 200 lines
    - async countRows() helper wraps Supabase count queries (avoids PromiseLike type issues with .then())
    - Promise.all() parallelization for bucket queries (N parallel DB queries per metric)
    - Period config map (7d/30d/90d/1y/all) → buckets, bucketMs, periodMs

key-files:
  created:
    - services/identity-service/src/v2/admin/stats-repository.ts
    - services/identity-service/src/v2/admin/chart-repository.ts
    - services/ats-service/src/v2/admin/stats-repository.ts
    - services/ats-service/src/v2/admin/chart-repository.ts
  modified:
    - services/identity-service/src/v2/admin/repository.ts
    - services/identity-service/src/v2/admin/service.ts
    - services/identity-service/src/v2/admin/routes.ts
    - services/ats-service/src/v2/admin/service.ts
    - services/ats-service/src/v2/admin/routes.ts
    - services/network-service/src/v2/admin/repository.ts
    - services/network-service/src/v2/admin/service.ts
    - services/network-service/src/v2/admin/routes.ts

key-decisions:
  - "Extracted stats/chart logic to separate *-repository.ts files — main repository already at/near 200 lines"
  - "Used async countRows() helper to avoid Supabase PromiseLike type errors from .then() chaining"
  - "network-service stats inline in repository (not extracted) — file stayed under 200 lines total"
  - "All period query: 7d=7 buckets, 30d=10, 90d=10, 1y=12, all=10 flat distribution"
  - "Trend = ((current - prev) / prev) * 100, capped at 100 if prev=0"

patterns-established:
  - "Stats extraction pattern: if repository would exceed 200 lines, extract to stats-repository.ts + chart-repository.ts"
  - "countRows(supabase, table, from?, to?) helper for safe typed Supabase count queries"
  - "getAdminStats(period) / getAdminChartData(period) as standard service method names for admin analytics"

duration: 5min
completed: 2026-02-28
---

# Phase 21 Plan 01: Admin Dashboard Real Data — Backend Stats Endpoints Summary

**Sparkline arrays, trend percentages, status breakdowns, and labeled time-series chart data from real DB queries across identity, ats, and network services, all period-parameterized**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-02-28T05:31:02Z
- **Completed:** 2026-02-28T05:35:41Z
- **Tasks:** 2
- **Files modified:** 12 (8 modified, 4 created)

## Accomplishments

- identity-service: GET /admin/stats and GET /admin/chart-data with period-bucketed user growth sparklines and labeled time-series
- ats-service: GET /admin/stats (jobs/applications sparklines + applicationFunnel by status) and GET /admin/chart-data (jobPostings BarChart, applicationVolume LineChart, hiringFunnel multi-series)
- network-service: GET /admin/stats with recruiter sparkline, trend, and recruiterStatus breakdown by active/pending/suspended/inactive

## Task Commits

1. **Task 1 + Task 2: Add /admin/stats and /admin/chart-data routes** - `a9fc7509` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `services/identity-service/src/v2/admin/stats-repository.ts` - getIdentityAdminStats() with sparkline+trend for users table
- `services/identity-service/src/v2/admin/chart-repository.ts` - getIdentityAdminChartData() returning userGrowth [{x,y}]
- `services/identity-service/src/v2/admin/repository.ts` - Added getSupabase() accessor
- `services/identity-service/src/v2/admin/service.ts` - Added getAdminStats() and getAdminChartData() delegation
- `services/identity-service/src/v2/admin/routes.ts` - GET /admin/stats and GET /admin/chart-data registered
- `services/ats-service/src/v2/admin/stats-repository.ts` - getAtsAdminStats() for jobs, applications, applicationFunnel
- `services/ats-service/src/v2/admin/chart-repository.ts` - getAtsAdminChartData() for jobPostings, applicationVolume, hiringFunnel
- `services/ats-service/src/v2/admin/service.ts` - Added getAdminStats() and getAdminChartData()
- `services/ats-service/src/v2/admin/routes.ts` - GET /admin/stats and GET /admin/chart-data registered
- `services/network-service/src/v2/admin/repository.ts` - Added countRecruiters() helper and getAdminStats() method inline
- `services/network-service/src/v2/admin/service.ts` - Added getAdminStats() delegation
- `services/network-service/src/v2/admin/routes.ts` - GET /admin/stats registered

## Decisions Made

- Supabase query builder `.then()` returns `PromiseLike` not `Promise`, which causes TypeScript errors when used with `Promise<T>` typed arrays. Fixed by extracting `async countRows()` helper that `await`s the query and returns a real `Promise<number>`.
- Extracted stats/chart logic to separate `stats-repository.ts` and `chart-repository.ts` files in the same `admin/` directory to keep repositories under 200 lines (ats-service repository was already at 211 lines before these changes).
- network-service stats kept inline in repository since file stayed at 183 lines after addition.

## Deviations from Plan

None — plan executed exactly as written. The TypeScript `.then()` type issue was a known-pattern problem resolved with the `countRows()` helper approach.

## Issues Encountered

- Supabase query builder `.then()` returns `PromiseLike<T>` (not `Promise<T>`), which TypeScript rejects when typed arrays expect `Promise<T>[]`. Resolved by extracting `async countRows()` and `countRowsInRange()` helpers that `await` queries and return native `Promise<number>`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All three backend endpoints are ready for frontend wiring
- Plan 02 can connect dashboard-stats.tsx and dashboard-charts.tsx to these real endpoints
- The `{ data: { users: { sparkline, trend, total } } }` envelope matches existing admin API client patterns

---
*Phase: 21-admin-dashboard-real-data*
*Completed: 2026-02-28*
