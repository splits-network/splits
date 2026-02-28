---
phase: 18-page-migration
plan: 07
subsystem: ui
tags: [nextjs, react, daisyui, tailwindcss, clerk, admin, users, organizations, companies, jobs, candidates]

# Dependency graph
requires:
  - phase: 18-03
    provides: Admin route endpoints in domain services (identity, ats, network)
  - phase: 18-04
    provides: AdminDataTable, AdminPageHeader, useStandardList wrapper, AdminLoadingState

provides:
  - Users directory page with avatar, email, roles, created, last-active columns
  - Organizations directory page with name/slug, type, member count, status filter
  - Companies directory page with name, industry, location, jobs, placements columns
  - Jobs list page with status/commute/level filters and row click navigation
  - Job detail page with two-tab UI (Overview + Candidates)
  - Candidates directory page with resume status badges

affects:
  - 18-08 through 18-10 (other admin page plans — same patterns apply)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - useStandardList with defaultLimit (not pageSize) and defaultFilters
    - data/goToPage pattern from hook (linter enforces over items/setPage aliases)
    - 'use client' tables + server page.tsx with Suspense + AdminLoadingState
    - Job detail page: client component with useEffect fetch + tab state

key-files:
  created:
    - apps/admin/src/app/secure/users/page.tsx
    - apps/admin/src/app/secure/users/components/user-table.tsx
    - apps/admin/src/app/secure/organizations/page.tsx
    - apps/admin/src/app/secure/organizations/components/org-table.tsx
    - apps/admin/src/app/secure/companies/page.tsx
    - apps/admin/src/app/secure/companies/components/company-table.tsx
    - apps/admin/src/app/secure/jobs/page.tsx
    - apps/admin/src/app/secure/jobs/components/job-table.tsx
    - apps/admin/src/app/secure/jobs/[id]/page.tsx
    - apps/admin/src/app/secure/jobs/[id]/components/job-overview.tsx
    - apps/admin/src/app/secure/jobs/[id]/components/job-candidates.tsx
    - apps/admin/src/app/secure/candidates/page.tsx
    - apps/admin/src/app/secure/candidates/components/candidate-table.tsx
  modified: []

key-decisions:
  - "useStandardList option is defaultLimit not pageSize — caught during build"
  - "Return values are data/goToPage not items/setPage — linter enforced the canonical form"
  - "Job detail page is 'use client' with useEffect fetch — cannot use Suspense since [id] is dynamic and needs client-side Clerk token"
  - "JobCandidates uses syncToUrl: false — prevents candidate pagination from polluting job detail URL"

patterns-established:
  - "Directory table pattern: 'use client' component, useStandardList, AdminDataTable, server page.tsx with Suspense"
  - "Detail page pattern: 'use client' page, useEffect + createAuthenticatedClient, tab state via useState"

# Metrics
duration: 8min
completed: 2026-02-28
---

# Phase 18 Plan 07: Directory Pages (Users, Orgs, Companies, Jobs, Candidates) Summary

**Five admin directory pages plus job detail view using AdminDataTable and useStandardList; server-side filtering, sorting, and pagination via identity/ats/network admin endpoints**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Users page: avatar+name cell with initial fallback, email, roles badges (multiple per user), created/last-active dates
- Organizations page: name+slug display, type badge, member count column, owner, status filter dropdown
- Companies page: name, industry, city+state location, job count, placement count columns
- Jobs list: status/commute type/level triple-filter with search, row-click nav to detail
- Job detail: two-tab layout — Overview (info card, description, requirements) + Candidates (applications for that job)
- Candidates page: resume status badge system (uploaded/pending/processing/failed/none), search + filter

## Task Commits

1. **Task 1: Users, Organizations, Companies pages** - `17b95ec3` (feat)
2. **Task 2: Jobs list+detail and Candidates pages** - `6cf5cf6f` (feat)

## Files Created

- `apps/admin/src/app/secure/users/page.tsx` - Server page with Suspense wrapper
- `apps/admin/src/app/secure/users/components/user-table.tsx` - Avatar cell, roles badges, 5 columns
- `apps/admin/src/app/secure/organizations/page.tsx` - Server page with Suspense wrapper
- `apps/admin/src/app/secure/organizations/components/org-table.tsx` - Status filter, 6 columns
- `apps/admin/src/app/secure/companies/page.tsx` - Server page with Suspense wrapper
- `apps/admin/src/app/secure/companies/components/company-table.tsx` - 6 columns including job/placement counts
- `apps/admin/src/app/secure/jobs/page.tsx` - Server page with Suspense wrapper
- `apps/admin/src/app/secure/jobs/components/job-table.tsx` - Triple filter (status/commute/level), row-click nav
- `apps/admin/src/app/secure/jobs/[id]/page.tsx` - Client detail page with fetch + tab state
- `apps/admin/src/app/secure/jobs/[id]/components/job-overview.tsx` - Info card + description + requirements panels
- `apps/admin/src/app/secure/jobs/[id]/components/job-candidates.tsx` - Applications list filtered by job_id
- `apps/admin/src/app/secure/candidates/page.tsx` - Server page with Suspense wrapper
- `apps/admin/src/app/secure/candidates/components/candidate-table.tsx` - Resume status badges, search + filter

## Decisions Made

- **defaultLimit not pageSize:** useStandardList option naming caught during first build failure.
- **data/goToPage over items/setPage:** Linter enforced canonical return value names; both are valid aliases but linter prefers primary names.
- **Job detail as client component:** Dynamic route with Clerk token requirement makes server fetch impractical; useEffect + createAuthenticatedClient is the established pattern.
- **syncToUrl: false on JobCandidates:** Prevents the candidates pagination page param from overwriting the job detail URL state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] useStandardList API mismatch**
- **Found during:** First build attempt
- **Issue:** Used `pageSize` instead of `defaultLimit`; used `pagination.total`/`pagination.totalPages` instead of top-level `total`/`totalPages`; used `setPage` instead of `goToPage`
- **Fix:** Corrected all API usage to match actual hook return values; linter auto-fixed remaining files
- **Files modified:** All table components

## Issues Encountered

None beyond the API mismatch caught and fixed during first build.

## Next Phase Readiness

- Directory pages are complete. Remaining admin pages (18-05 through 18-10) can follow same table pattern.
- Job detail tab pattern is reusable for recruiter/application detail pages.

---
*Phase: 18-page-migration*
*Completed: 2026-02-28*
