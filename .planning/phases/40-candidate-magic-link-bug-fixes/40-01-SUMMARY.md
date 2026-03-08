---
phase: 40-candidate-magic-link-bug-fixes
plan: 01
subsystem: api
tags: [recording, consent, magic-link, fetch, video]

# Dependency graph
requires:
  - phase: 36-recording-pipeline
    provides: dual-auth consent endpoint reading body.token
provides:
  - Fixed submitConsent sending magic-link token in request body
affects: [candidate-portal, video-interviews]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - packages/shared-video/src/hooks/use-recording-state.ts

key-decisions:
  - "Branch on magicToken presence: body for magic link, Bearer header for Clerk auth"

patterns-established: []

# Metrics
duration: 1min
completed: 2026-03-08
---

# Phase 40 Plan 01: Fix Recording Consent Magic-Link Token Summary

**submitConsent now sends magic-link token in JSON body instead of Bearer header, matching backend body.token extraction**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-08T10:13:57Z
- **Completed:** 2026-03-08T10:14:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Fixed BUG-01: candidate recording consent via magic link now works
- Magic link path sends `{ token }` in POST body matching backend `body.token` check
- Clerk auth path unchanged -- still uses `Authorization: Bearer` header

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix submitConsent to send token in request body** - `b79003aa` (fix)

## Files Created/Modified
- `packages/shared-video/src/hooks/use-recording-state.ts` - Fixed submitConsent to branch on magic token vs Clerk auth

## Decisions Made
- Branch on `magicToken` parameter presence: when provided, send in JSON body (magic link candidates have no Clerk session); when absent, use Bearer header from `getToken()` (authenticated users)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Recording consent fix deployed, ready for remaining magic-link bug fixes in plan 02
- No blockers

---
*Phase: 40-candidate-magic-link-bug-fixes*
*Completed: 2026-03-08*
