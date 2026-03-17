---
phase: 40-candidate-magic-link-bug-fixes
plan: 02
subsystem: api
tags: [fastify, react-hooks, interview-notes, dual-auth, video-service]

# Dependency graph
requires:
  - phase: 39-integration-wiring-auth-fixes
    provides: dual-auth on GET /interviews/:id/notes endpoint
provides:
  - mine=true query filter on GET /interviews/:id/notes
  - Hook correctly reads single-note response for note restoration
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "mine=true query filter pattern for returning current user's resource"

key-files:
  created: []
  modified:
    - services/video-service/src/v2/interviews/routes.ts
    - packages/shared-video/src/hooks/use-interview-notes.ts

key-decisions:
  - "mine=true returns single object or null, not a filtered array"
  - "Filter by participant_id for magic link, user_id for Clerk auth"

patterns-established:
  - "mine=true filter: endpoint returns single resource for current user instead of full collection"

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 40 Plan 02: Interview Notes Restore Bug Fix Summary

**GET notes endpoint gains mine=true filter; hook reads single-note response so notes restore on page refresh/reconnect**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T10:14:14Z
- **Completed:** 2026-03-08T10:18:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- GET /interviews/:id/notes?mine=true returns single note object (or null) filtered to authenticated user
- Magic link path filters by participant_id, Clerk path filters by resolved user_id
- Hook's loadNotes adds mine=true to fetch URL so result.data.content reads correctly
- Existing array response for GET /notes without mine param remains unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Add mine=true filter to GET notes endpoint** - `68cf1ee0` (feat)
2. **Task 2: Fix hook to request and read current user's note** - `730e600f` (fix)

## Files Created/Modified
- `services/video-service/src/v2/interviews/routes.ts` - Added mine=true query param support to GET notes handler
- `packages/shared-video/src/hooks/use-interview-notes.ts` - Added mine=true to loadNotes fetch URL

## Decisions Made
- mine=true returns a single object `{ data: InterviewNoteWithUser | null }` rather than a filtered array, because the hook expects `result.data.content` on a single object
- For magic link auth, filter by participant_id (available from token validation); for Clerk auth, filter by user_id (resolved from clerkUserId)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Notes now restore correctly on page refresh for both Clerk and magic-link users
- No blockers for remaining phase 40 plans

---
*Phase: 40-candidate-magic-link-bug-fixes*
*Completed: 2026-03-08*
