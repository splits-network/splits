---
phase: 44-recruiter-company-calls-portal-integration
plan: 02
subsystem: call-service
tags: [scheduling, authorization, stats, tags, search]
completed: 2026-03-09
duration: 9min
dependency-graph:
  requires: [44-01]
  provides: [call-scheduling-api, call-stats-api, call-tags-api, creator-authorization]
  affects: [44-06, 44-07, 44-08]
tech-stack:
  added: []
  patterns: [lifecycle-service-extraction, list-pre-filter-pattern, stats-repository-pattern]
key-files:
  created:
    - services/call-service/src/v2/call-lifecycle-service.ts
    - services/call-service/src/v2/call-action-routes.ts
    - services/call-service/src/v2/stats-repository.ts
    - services/call-service/src/v2/list-helpers.ts
  modified:
    - services/call-service/src/v2/repository.ts
    - services/call-service/src/v2/artifact-repository.ts
    - services/call-service/src/v2/service.ts
    - services/call-service/src/v2/routes.ts
    - services/call-service/src/v2/types.ts
decisions:
  - id: 44-02-01
    description: "Extract lifecycle methods (start/end/cancel/reschedule) into call-lifecycle-service.ts for 200-line compliance"
  - id: 44-02-02
    description: "Extract per-call action routes into call-action-routes.ts to keep routes.ts under 200 lines"
  - id: 44-02-03
    description: "Stats use parallel Supabase count queries instead of RPC/raw SQL for consistency with existing patterns"
  - id: 44-02-04
    description: "Search pre-filters extracted into list-helpers.ts as standalone function (not class method)"
---

# Phase 44 Plan 02: Call Scheduling API & Authorization Summary

Extended call-service with scheduling support, creator-only authorization, tag management, text search across participants/entities, and stats aggregation for the call history dashboard.

## What was done

### Task 1: Repository extensions (tags, search, stats)
- Added tag CRUD methods to `ArtifactRepository` (addCallTags, removeCallTags, getCallTags, listTags)
- Added `CallStats` type with upcoming/weekly/monthly counts, avg duration, follow-up count
- Created `StatsRepository` with parallel count queries for efficient stats aggregation
- Created `list-helpers.ts` with `resolveCallIdFilters()` for search pre-filtering
- Extended `createCall` to persist agenda, duration_minutes_planned, pre_call_notes
- Added `cancelCall` repository method with cancelled_by and cancel_reason columns
- Added needs_follow_up and tag filtering to listCalls
- Text search across participant names (users table), company names, and job titles

### Task 2: Service logic and routes
- Added `rescheduleCall` with creator-only authorization, status validation, future-time check
- Updated `cancelCall` with creator-only authorization and cancel reason passthrough
- Added `getStats` endpoint resolving clerk user to internal ID then querying stats
- Added `listTags` endpoint delegating to artifact repository
- Updated `createCall` to process tags and include scheduling context (scheduled_at, agenda) in events
- New routes: `GET /api/v2/calls/stats`, `GET /api/v2/calls/tags`, `PUT /api/v2/calls/:id/reschedule`
- Stats and tags routes registered before `/:id` to avoid param matching conflicts
- Updated create route to accept agenda, duration_minutes_planned, pre_call_notes, tags
- Updated update route to accept agenda and needs_follow_up
- Updated cancel route to accept optional reason body and pass clerkUserId for authorization
- Extracted lifecycle service and action routes for 200-line compliance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] File size violations required extraction**
- **Found during:** Task 1 and Task 2
- **Issue:** repository.ts (523 lines), service.ts (370 lines), routes.ts (303 lines) all exceeded 200-line limit
- **Fix:** Extracted stats-repository.ts, list-helpers.ts, call-lifecycle-service.ts, call-action-routes.ts
- **Files created:** 4 new files
- **Commits:** d74cbc46, 7e4ff9e4

**2. [Rule 1 - Bug] Task 1 changes already committed by prior plan execution**
- **Found during:** Task 1 commit
- **Issue:** Repository/artifact/types changes were bundled into commit d74cbc46 (44-03 plan) by a concurrent execution
- **Fix:** Verified changes were correct and complete, skipped redundant commit
- **Impact:** None - all intended changes are in the codebase

## Verification

- TypeScript build passes: `pnpm --filter @splits-network/call-service build`
- Stats route registered before /:id route (line 42 vs line 96 in routes.ts)
- All queries use Supabase parameterized queries (no string interpolation)
- Creator-only authorization on cancel and reschedule
- All new files under 200-line limit

## Commits

| Commit | Description |
|--------|-------------|
| d74cbc46 | Repository: tag CRUD, search helpers, stats repo, cancel with reason (bundled with 44-03) |
| 7e4ff9e4 | Service/routes: scheduling logic, authorization, stats/tags endpoints |

## Next Phase Readiness

All backend API endpoints needed for the portal call management UI are now available:
- Call creation with full scheduling fields (agenda, duration, pre-call notes, tags)
- Reschedule and cancel with proper authorization
- Stats for dashboard overview
- Tag listing and filtering
- Text search across participants and entities
- Follow-up filtering
