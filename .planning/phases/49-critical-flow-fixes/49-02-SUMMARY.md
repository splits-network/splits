---
phase: 49-critical-flow-fixes
plan: 02
subsystem: ui, api
tags: [nextjs, calls, video, livekit, signed-url, recording-playback]

# Dependency graph
requires:
  - phase: 42-call-data-model-service-layer
    provides: Call token generation endpoint and recording playback-url endpoint
  - phase: 44-recruiter-company-calls-portal-integration
    provides: Call detail page, recording tab, call-detail-header with Join Call button
provides:
  - Working Join Call page that generates token and redirects to video app
  - Recording playback using signed URLs instead of raw storage paths
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Token-and-redirect pattern for video app join flow"
    - "Signed URL fetch before media element rendering"

key-files:
  created:
    - apps/portal/src/app/portal/calls/[id]/join/page.tsx
  modified:
    - apps/portal/src/app/portal/calls/[id]/components/recording-tab.tsx

key-decisions:
  - "Reused useCreateCall().generateToken() hook for join page instead of direct API call"
  - "Show loading state while fetching signed URL before rendering media player"

patterns-established:
  - "Join page pattern: client component with useEffect → generate token → redirect"

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 49 Plan 02: Call Join Page and Recording Playback Summary

**Join Call page with token redirect to video app, recording tab using signed playback URLs**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T00:01:09Z
- **Completed:** 2026-03-10T00:04:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created /portal/calls/[id]/join page that generates access token and redirects to video app
- Fixed recording tab to fetch signed URL from playback-url endpoint instead of using raw blob_url
- Join Call button in call-detail-header now works (previously 404)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Join Call page** - `79ad2de4` (feat)
2. **Task 2: Fix recording playback signed URL** - `3bd44052` (fix)

## Files Created/Modified
- `apps/portal/src/app/portal/calls/[id]/join/page.tsx` - Join Call page with token generation and video app redirect
- `apps/portal/src/app/portal/calls/[id]/components/recording-tab.tsx` - Recording playback using signed URL from playback-url endpoint

## Decisions Made
- Reused `useCreateCall().generateToken()` hook for the join page rather than making a direct API call, keeping the token generation logic DRY
- Added a loading state in recording tab while fetching the signed URL, preventing the media player from trying to load with no URL

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Call join flow is complete end-to-end
- Recording playback uses proper signed URLs
- Ready for further call feature work

---
*Phase: 49-critical-flow-fixes*
*Completed: 2026-03-09*
