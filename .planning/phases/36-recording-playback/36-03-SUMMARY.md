---
phase: 36-recording-playback
plan: 03
subsystem: api
tags: [livekit, egress, recording, webhook, fastify, azure-blob]

requires:
  - phase: 36-01
    provides: Database schema with recording columns on interviews table
  - phase: 36-02
    provides: RecordingService with LiveKit EgressClient and Azure Blob upload

provides:
  - Recording CRUD API endpoints (start, stop, consent, status)
  - LiveKit Egress webhook handler with signature verification
  - interview.recording_ready event publishing
  - Azure and LiveKit WebSocket environment config loading

affects: [36-04, 36-05, 36-06]

tech-stack:
  added: []
  patterns:
    - WebhookReceiver signature verification for LiveKit callbacks
    - Always-200 webhook response pattern for external callbacks
    - Dual auth pattern (magic link token OR Clerk) on consent endpoint

key-files:
  created:
    - services/video-service/src/v2/interviews/recording-routes.ts
    - services/video-service/src/v2/interviews/recording-webhook.ts
  modified:
    - services/video-service/src/v2/routes.ts
    - services/video-service/src/index.ts

key-decisions:
  - "Interviewer-only access control for start/stop recording"
  - "Dual auth on consent endpoint: magic link token OR Clerk header"
  - "Participant-gated blob URL access on GET recording status"

patterns-established:
  - "Recording route config pattern: repository + recordingService + tokenService"
  - "Webhook always returns 200 with error logged, not thrown"

duration: 2min
completed: 2026-03-08
---

# Phase 36 Plan 03: Recording API Routes Summary

**Recording CRUD endpoints (start/stop/consent/status) with LiveKit Egress webhook handler and Azure Blob env config**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T07:06:49Z
- **Completed:** 2026-03-08T07:09:13Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Recording start/stop endpoints with interviewer-only authorization via participant role check
- Consent endpoint supporting both magic link (token body) and authenticated (Clerk header) users
- GET recording status endpoint with participant-gated blob URL access
- LiveKit Egress webhook with WebhookReceiver signature verification and event publishing
- Azure Storage and LiveKit WebSocket URL environment config wired through route registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Create recording CRUD routes and webhook handler** - `13acbad0` (feat)
2. **Task 2: Register recording routes and add env config** - `f5cf04c8` (feat)

## Files Created/Modified
- `services/video-service/src/v2/interviews/recording-routes.ts` - 4 CRUD endpoints: start, stop, consent, status
- `services/video-service/src/v2/interviews/recording-webhook.ts` - LiveKit Egress webhook with signature verification
- `services/video-service/src/v2/routes.ts` - Imports and wires recording routes/webhook into V2 route tree
- `services/video-service/src/index.ts` - Loads Azure and LiveKit WebSocket env vars, passes to route config

## Decisions Made
- Interviewer-only access for start/stop: verified via participant lookup with role check
- Consent endpoint uses dual auth: magic link token (for candidates) or Clerk header (for authenticated users)
- GET recording endpoint returns blob URL only to participants (not arbitrary authenticated users)
- Webhook always returns 200 regardless of processing errors to prevent LiveKit retry storms

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. Azure and LiveKit env vars are loaded from environment with warning logs if missing.

## Next Phase Readiness
- Recording API routes are ready for frontend integration (36-04+)
- Webhook endpoint ready to receive LiveKit Egress callbacks
- interview.recording_ready event will be available for downstream consumers

---
*Phase: 36-recording-playback*
*Completed: 2026-03-08*
