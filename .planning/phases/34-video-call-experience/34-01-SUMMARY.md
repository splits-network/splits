---
phase: 34-video-call-experience
plan: "01"
subsystem: video
tags: [livekit, react-hooks, video-interview, shared-package, token-enrichment]

# Dependency graph
requires:
  - phase: 33-infrastructure
    provides: "video-service with interview CRUD, token generation, LiveKit server SDK"
provides:
  - "shared-video package with hooks, types, and LiveKit config"
  - "Enriched token endpoint returning job/company/participant context"
affects: [34-02 (lobby UI), 34-03 (in-call UI), 34-04 (candidate flow)]

# Tech tracking
tech-stack:
  added: ["@livekit/components-react", "@livekit/components-styles", "livekit-client"]
  patterns: ["shared-video package for cross-app video components", "enriched token response for single-fetch lobby data"]

key-files:
  created:
    - "packages/shared-video/package.json"
    - "packages/shared-video/src/types.ts"
    - "packages/shared-video/src/hooks/use-interview-token.ts"
    - "packages/shared-video/src/hooks/use-call-duration.ts"
    - "packages/shared-video/src/lib/livekit-config.ts"
    - "packages/shared-video/src/index.ts"
  modified:
    - "services/video-service/src/v2/interviews/types.ts"
    - "services/video-service/src/v2/interviews/repository.ts"
    - "services/video-service/src/v2/interviews/token-service.ts"

key-decisions:
  - "Users table has name + profile_image_url; joined directly for participant enrichment"
  - "Enriched context fetched via sequential queries (interviews -> applications -> jobs -> companies + users) rather than complex joins"
  - "LiveKit deps installed in shared-video, portal, and candidate simultaneously"

patterns-established:
  - "InterviewContext type: shared between frontend (shared-video) and backend (video-service)"
  - "Token response includes full interview context to eliminate extra API calls from lobby UI"

# Metrics
duration: 12min
completed: 2026-03-08
---

# Phase 34 Plan 01: Shared Video Package and Token Enrichment Summary

**shared-video package with LiveKit hooks/types plus enriched token endpoints returning job, company, and participant context for lobby display**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-08T00:47:27Z
- **Completed:** 2026-03-08T00:59:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Created shared-video workspace package with CallState, InterviewContext, TokenResult, and LocalUserChoices types
- Built useInterviewToken hook supporting both authenticated and magic link token fetching
- Built useCallDuration hook for in-call timer with MM:SS formatting
- Enriched video-service token endpoints to return job title, company name, and participant names/avatars

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shared-video package with hooks and types** - `0f00db6f` (feat) - Previously committed
2. **Task 2: Enrich token endpoint with interview context** - `8a1f6563` (feat)

## Files Created/Modified
- `packages/shared-video/package.json` - Package definition with LiveKit dependencies
- `packages/shared-video/src/types.ts` - CallState, InterviewContext, TokenResult, LocalUserChoices
- `packages/shared-video/src/hooks/use-interview-token.ts` - Token fetching hook for auth + magic link flows
- `packages/shared-video/src/hooks/use-call-duration.ts` - Elapsed time tracker with formatted output
- `packages/shared-video/src/lib/livekit-config.ts` - getLiveKitUrl() and default room options
- `packages/shared-video/src/index.ts` - Public exports
- `services/video-service/src/v2/interviews/types.ts` - Added InterviewContext, InterviewWithContext, InterviewParticipantWithUser
- `services/video-service/src/v2/interviews/repository.ts` - Added findByIdWithContext joining interviews/applications/jobs/companies/users
- `services/video-service/src/v2/interviews/token-service.ts` - Updated both endpoints to return enriched InterviewContext

## Decisions Made
- Used sequential Supabase queries (interviews -> applications -> jobs -> companies, then users batch) rather than attempting complex nested selects. Simpler, more debuggable, and the additional queries are negligible for a token endpoint called once per session.
- Participant names/avatars resolved from the `users` table (`name`, `profile_image_url` columns) rather than Clerk. Keeps the backend self-contained without external API calls during token generation.
- Task 1 was already committed from a prior session (commit `0f00db6f`). Verified all files matched plan requirements and skipped re-committing.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- Task 1 (shared-video package) was already committed in a prior session as part of commit `0f00db6f`. All files matched the plan specification exactly, so no changes were needed. Only Task 2 required new work.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- shared-video package ready for portal and candidate to consume for lobby and in-call UIs
- Token endpoints return all data needed for lobby display (job title, company name, participant names/avatars)
- Next plans can build VideoLobby and VideoRoom components using the hooks and types from shared-video

---
*Phase: 34-video-call-experience*
*Completed: 2026-03-08*
