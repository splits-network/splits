---
phase: 18-page-migration
plan: 06
subsystem: ui
tags: [nextjs, daisyui, react, admin, useStandardList, CRUD]

requires:
  - phase: 18-04
    provides: AdminDataTable, AdminPageHeader, AdminConfirmModal shared components
  - phase: 18-03
    provides: admin endpoints /admin/network/admin/recruiters, /admin/ats/admin/assignments, /admin/ats/admin/placements, /admin/ats/admin/applications, /admin/notification/admin/site-notifications

provides:
  - Recruiters page with approve/suspend actions and status filters
  - Assignments page with status filters and recruiter-job table
  - Placements page with status filters and fee display
  - Applications page with stage color-coded filters
  - Notifications page with full CRUD (create/edit modal, delete confirm, active toggle)

affects: ["18-07", "18-08", "18-09", "18-10"]

tech-stack:
  added: []
  patterns:
    - "Page + Table component split: page owns filters/pagination, table owns column definitions"
    - "RecruiterActions component: isolated action mutation logic with confirm modal"
    - "NotificationForm: dual-mode create/edit modal with type/severity selects and date fields"

key-files:
  created:
    - apps/admin/src/app/secure/recruiters/page.tsx
    - apps/admin/src/app/secure/recruiters/components/recruiter-table.tsx
    - apps/admin/src/app/secure/recruiters/components/recruiter-actions.tsx
    - apps/admin/src/app/secure/assignments/page.tsx
    - apps/admin/src/app/secure/assignments/components/assignment-table.tsx
    - apps/admin/src/app/secure/placements/page.tsx
    - apps/admin/src/app/secure/placements/components/placement-table.tsx
    - apps/admin/src/app/secure/applications/page.tsx
    - apps/admin/src/app/secure/applications/components/application-table.tsx
    - apps/admin/src/app/secure/notifications/page.tsx
    - apps/admin/src/app/secure/notifications/components/notification-form.tsx
    - apps/admin/src/app/secure/notifications/components/notification-table.tsx
  modified:
    - apps/admin/src/app/secure/payouts/audit/page.tsx (bug fix)
    - apps/admin/src/app/secure/candidates/components/candidate-table.tsx (hook API fix)
    - apps/admin/src/app/secure/companies/components/company-table.tsx (hook API fix)
    - apps/admin/src/app/secure/jobs/components/job-table.tsx (hook API fix)
    - apps/admin/src/app/secure/organizations/components/org-table.tsx (hook API fix)
    - apps/admin/src/app/secure/users/components/user-table.tsx (hook API fix)
    - apps/admin/src/app/secure/payouts/components/payout-table.tsx (hook API fix)
    - apps/admin/src/app/secure/payouts/escrow/components/escrow-table.tsx (hook API fix)
    - apps/admin/src/app/secure/jobs/[id]/components/job-candidates.tsx (hook API fix)
    - apps/admin/src/app/secure/automation/page.tsx (hook API fix)
    - apps/admin/src/app/secure/matches/page.tsx (hook API fix)
    - apps/admin/src/app/secure/decision-log/page.tsx (hook API fix)
    - apps/admin/src/app/secure/fraud/page.tsx (hook API fix)
    - apps/admin/src/app/secure/settings/page.tsx (type fix)

key-decisions:
  - "RecruiterActions is a standalone component — keeps action mutation logic isolated from table columns"
  - "NotificationForm uses type/severity as local string state cast to enum types at submit time — avoids prop type complexity"
  - "Notifications page passes SiteNotification directly to edit modal; form accepts loose initial type to avoid complex prop type mapping"

patterns-established:
  - "Operations pages: filter buttons on left, search on right, table card below, pagination inside card"
  - "Actions column: edit (pen icon) + delete (trash, error color), confirm modal for delete"
  - "Active toggle: inline checkbox/toggle in table row, immediate PATCH on change"

duration: 13min
completed: 2026-02-28
---

# Phase 18 Plan 06: Operations Pages Summary

**5 Operations pages built with Basel design: Recruiters (approve/suspend actions), Assignments, Placements, Applications (stage color coding), Notifications (full CRUD with create/edit modal + delete confirm + active toggle)**

## Performance

- **Duration:** 13 min
- **Started:** 2026-02-28T01:15:31Z
- **Completed:** 2026-02-28T01:28:45Z
- **Tasks:** 2
- **Files modified:** 26 (12 created, 14 modified for bug fixes)

## Accomplishments

- Recruiters page with pending/active/suspended filters and approve/suspend action buttons backed by confirm modals
- Assignments, Placements, Applications pages with appropriate filter buttons and stage color-coded badges
- Notifications page with full CRUD: create/edit modal form (type, severity, title, message, dates), inline active toggle per row, delete with confirmation
- Fixed deprecated `useStandardList` hook API usage across 13 pre-existing files (pageSize→defaultLimit, items→data, sortField/sortDir/setSort→sortBy/sortOrder/handleSort, pagination.totalPages→totalPages)

## Task Commits

1. **Task 1: Recruiters and Assignments pages** - `53746161` (feat)
2. **Task 2: Placements, Applications, Notifications pages** - committed via `516548d9` by parallel agent

## Files Created/Modified

- `apps/admin/src/app/secure/recruiters/page.tsx` - Recruiters list with status filter tabs and pagination
- `apps/admin/src/app/secure/recruiters/components/recruiter-table.tsx` - Sortable table with clerk_user_id, status badge, headline, bio, joined date
- `apps/admin/src/app/secure/recruiters/components/recruiter-actions.tsx` - Approve/Suspend actions with AdminConfirmModal
- `apps/admin/src/app/secure/assignments/page.tsx` - Assignments list with status filters
- `apps/admin/src/app/secure/assignments/components/assignment-table.tsx` - Recruiter + job + status table
- `apps/admin/src/app/secure/placements/page.tsx` - Placements with status filter buttons
- `apps/admin/src/app/secure/placements/components/placement-table.tsx` - Candidate, job, company, start date, status, fee
- `apps/admin/src/app/secure/applications/page.tsx` - Applications with stage filter buttons
- `apps/admin/src/app/secure/applications/components/application-table.tsx` - Candidate info, job, stage color badge, applied date
- `apps/admin/src/app/secure/notifications/page.tsx` - Full CRUD page with create button and is_active/severity filters
- `apps/admin/src/app/secure/notifications/components/notification-form.tsx` - Create/edit modal (type, severity, title, message, dates, active, dismissible)
- `apps/admin/src/app/secure/notifications/components/notification-table.tsx` - Table with inline active toggle, edit/delete actions

## Decisions Made

- RecruiterActions component is isolated from the table so the table stays presentational and actions can be tested independently
- NotificationForm accepts a loose `initial` prop type to avoid complex Partial<SiteNotification> mapping when editing from the table's SiteNotification type

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed metadata export from client component in payouts/audit/page.tsx**
- **Found during:** Task 1 (first build attempt)
- **Issue:** `export const metadata` cannot be exported from a `'use client'` component — Next.js compile error
- **Fix:** Removed the metadata export (page uses layout.tsx title)
- **Files modified:** apps/admin/src/app/secure/payouts/audit/page.tsx
- **Verification:** Build passes
- **Committed in:** 53746161

**2. [Rule 1 - Bug] Fixed deprecated useStandardList API in 13 pre-existing files**
- **Found during:** Task 1 (TypeScript compilation errors)
- **Issue:** Multiple files used old hook properties: `pageSize` (not in options), `sortField`/`sortDir`/`setSort` (renamed to `sortBy`/`sortOrder`/`handleSort`), `items` (renamed `data`), `pagination.totalPages` (snake_case `total_pages` on the object; `totalPages` is top-level)
- **Fix:** Updated all 13 files to current hook API
- **Files modified:** candidate-table, company-table, job-table, org-table, user-table, payout-table, escrow-table, job-candidates, automation/page, matches/page, decision-log/page, fraud/page, settings/page
- **Verification:** Build compiles clean, TypeScript passes
- **Committed in:** 53746161

---

**Total deviations:** 2 auto-fixed (1 bug, 1 bulk API fix)
**Impact on plan:** All fixes necessary for build to succeed. No scope creep.

## Issues Encountered

- Parallel agent (18-09) had already committed some Task 2 files before this plan committed them — no conflict, the files were identical.
- `.next` build cache became stale after type errors; cleared with `rm -rf .next` to get clean build.

## Next Phase Readiness

- All 5 Operations pages functional with real admin endpoints
- Build compiles clean — no TypeScript errors remaining
- Ready for remaining pages (Intelligence, Finance, Directory, etc.)

---
*Phase: 18-page-migration*
*Completed: 2026-02-28*
