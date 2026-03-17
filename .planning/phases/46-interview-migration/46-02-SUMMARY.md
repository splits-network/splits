---
phase: 46-interview-migration
plan: 02
subsystem: backend-services
tags: [cleanup, video-service, ai-service, notification-service, api-gateway, integration-service]
depends_on:
  requires: [45]
  provides: [clean-backend-no-interview-code]
  affects: [46-03, 46-04]
tech-stack:
  added: []
  patterns: [call-only-webhook, shared-signed-url-helper]
key-files:
  created:
    - services/video-service/src/v2/calls/call-recording-webhook.ts
    - services/video-service/src/v2/shared/signed-url-helper.ts
  modified:
    - services/video-service/src/v2/routes.ts
    - services/video-service/src/v2/calls/call-recording-routes.ts
    - services/video-service/src/index.ts
    - services/api-gateway/src/routes/v2/routes.ts
    - services/ai-service/src/domain-consumer.ts
    - services/ai-service/src/index.ts
    - services/ai-service/tests/unit/domain-consumer.test.ts
    - services/notification-service/src/domain-consumer.ts
    - services/notification-service/src/index.ts
    - services/notification-service/src/service.ts
    - services/notification-service/src/templates/index.ts
    - services/integration-service/src/v2/calendar/service.ts
  deleted:
    - services/video-service/src/v2/interviews/ (10 files)
    - services/api-gateway/src/routes/v2/video.ts
    - services/ai-service/src/v2/transcription/ (3 files)
    - services/notification-service/src/consumers/interviews/consumer.ts
    - services/notification-service/src/services/interviews/service.ts
    - services/notification-service/src/templates/interviews/ (4 files)
    - services/notification-service/src/jobs/send-interview-reminders.ts
decisions:
  - id: move-signed-url-helper
    summary: "Moved signed-url-helper from interviews/ to shared/ since call-recording-routes depends on it"
  - id: call-only-webhook
    summary: "Created dedicated call recording webhook replacing unified interview+call webhook"
metrics:
  duration: 5min
  completed: 2026-03-09
---

# Phase 46 Plan 02: Backend Interview Code Removal Summary

**One-liner:** Deleted all interview-specific backend code from 5 services (video, gateway, ai, notification, integration) — ~5,800 lines removed

## What Was Done

### Task 1: Video-service and API Gateway cleanup
- Deleted entire `services/video-service/src/v2/interviews/` directory (10 files: routes, service, repository, recording-routes, recording-service, recording-webhook, scheduling-service, token-service, signed-url-helper, types)
- Moved `signed-url-helper.ts` to `shared/` directory since `call-recording-routes.ts` depends on `generateSignedUrl` and `extractStoragePath`
- Created `call-recording-webhook.ts` in the calls directory — the unified webhook previously tried interview egress first then fell back to call egress; now it only handles call egress directly at `/api/v2/calls/recording/webhook`
- Simplified `routes.ts` to only register call recording routes and webhook
- Deleted `services/api-gateway/src/routes/v2/video.ts` (interview proxy) and removed from route registration

### Task 2: AI-service, Notification-service, Integration-service cleanup
- Deleted `services/ai-service/src/v2/transcription/` directory (3 files: service, summarizer, repository) — the interview-specific transcription pipeline
- Removed `interview.recording_ready` event binding and handler from ai-service domain consumer
- Removed `TranscriptionPipelineService` from constructor chain (domain-consumer + index.ts)
- Deleted notification-service interview directories: consumers/interviews/, services/interviews/, templates/interviews/
- Deleted `send-interview-reminders.ts` cron job and removed the Cron scheduling + shutdown handling
- Removed all interview event bindings (5 events) and handlers from notification-service domain consumer
- Removed `InterviewsEmailService` from NotificationService class
- Removed interview template re-export from templates/index.ts
- Updated integration-service calendar service comment from "interview scheduling" to "call scheduling"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved signed-url-helper to shared directory**
- **Found during:** Task 1
- **Issue:** `call-recording-routes.ts` imports `generateSignedUrl` and `extractStoragePath` from `../interviews/signed-url-helper` — deleting interviews/ would break the call recording routes
- **Fix:** Moved file to `services/video-service/src/v2/shared/signed-url-helper.ts` and updated import path
- **Files modified:** call-recording-routes.ts, shared/signed-url-helper.ts (new)
- **Commit:** c0b9f668

**2. [Rule 2 - Missing Critical] Created call-only recording webhook**
- **Found during:** Task 1
- **Issue:** The unified webhook in `interviews/recording-webhook.ts` was the ONLY LiveKit egress webhook endpoint. Deleting it would break call recording completion flow.
- **Fix:** Created `services/video-service/src/v2/calls/call-recording-webhook.ts` with call-only logic (no interview fallback pattern)
- **Files created:** call-recording-webhook.ts
- **Commit:** c0b9f668

**3. [Rule 1 - Bug] Updated swagger tags in video-service index.ts**
- **Found during:** Task 1
- **Issue:** Swagger tag still referenced "interviews" after all interview code was deleted
- **Fix:** Changed tag name to "calls" and description to "Call recording lifecycle management"
- **Commit:** c0b9f668

**4. [Rule 1 - Bug] Removed unused Cron import from notification-service index.ts**
- **Found during:** Task 2
- **Issue:** After removing the interview reminders cron job, the `Cron` import from 'croner' was unused
- **Fix:** Removed the import
- **Commit:** 5d69725f

## Verification

All five services build successfully:
- video-service: clean build
- api-gateway: clean build
- ai-service: clean build
- notification-service: clean build
- integration-service: clean build

All interview directories confirmed deleted. Call system paths remain intact.

## Next Phase Readiness

Backend is fully clean of interview-specific code. Ready for:
- 46-03: Frontend interview code removal
- 46-04: Database migration to drop interview tables
