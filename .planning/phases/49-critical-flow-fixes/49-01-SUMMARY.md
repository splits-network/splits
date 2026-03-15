---
phase: 49-critical-flow-fixes
plan: 01
subsystem: call-events-and-tokens
tags: [rabbitmq, events, token, call-service, video-service]
dependency-graph:
  requires: [42-call-data-model-service-layer, 44-recruiter-company-calls-portal-integration]
  provides: [call-event-participants, token-field-alignment]
  affects: [notification-service-email-delivery, instant-call-redirect]
tech-stack:
  added: []
  patterns: [event-payload-enrichment]
key-files:
  created: []
  modified:
    - services/call-service/src/v2/service.ts
    - services/call-service/src/v2/call-lifecycle-service.ts
    - services/call-service/src/v2/token-service.ts
    - services/video-service/src/v2/calls/call-recording-webhook.ts
    - services/video-service/src/v2/routes.ts
decisions: []
metrics:
  duration: 2min
  completed: 2026-03-09
---

# Phase 49 Plan 01: Call Event Participants & Token Field Fix Summary

**One-liner:** Add participants array to 4 RabbitMQ call events and rename token response field to access_token for frontend compatibility.

## What Was Done

### Task 1: Add participants array to all 4 event payloads
- **call.created** (`service.ts`): Replaced `participant_count` with `participants` array mapped from `enrichedParticipants`
- **call.cancelled** (`call-lifecycle-service.ts`): Added participant fetch before publish, included in payload
- **call.rescheduled** (`call-lifecycle-service.ts`): Added participant fetch before publish, included in payload
- **call.recording_ready** (`call-recording-webhook.ts`): Added `callRecordingRepository` to webhook config, fetched participants via existing `getCallParticipants()` method, included in payload
- Updated `routes.ts` to pass `callRecordingRepository` into the webhook registration config

All participant arrays use the format `{ user_id, role }` (snake_case) matching the notification-service normalizer.

### Task 2: Fix token response field name
- Renamed return field from `token` to `access_token` in `TokenService.createToken()`
- Added `call_id` to the return type since the frontend `CallTokenResult` expects it
- Updated return type signature to `{ access_token: string; livekit_token: string; call_id: string }`
- The route handler sends `result` directly via `{ data: result }`, so no route changes needed

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 9347b6f0 | Add participants array to all 4 call event payloads |
| 2 | d934ea68 | Rename token response field to access_token with call_id |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/call-service build` -- passes
- `pnpm --filter @splits-network/video-service build` -- passes
- All 4 event publish calls confirmed to include `participants:` array via grep
- Token service confirmed to return `access_token` field

## Next Phase Readiness

No blockers. The notification-service consumer already handles both snake_case and camelCase via `normalizePayload`, so these enriched events will be consumed without consumer changes.
