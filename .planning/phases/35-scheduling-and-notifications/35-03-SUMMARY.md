---
phase: 35-scheduling-and-notifications
plan: 03
subsystem: video-service
tags: [scheduling, reschedule, available-slots, calendar-integration]
depends_on:
  requires: ["35-01", "35-02"]
  provides: ["scheduling-service", "reschedule-endpoints", "available-slots-api"]
  affects: ["35-04", "35-05"]
tech-stack:
  added: []
  patterns: ["scheduling-service-pattern", "magic-link-reschedule"]
key-files:
  created:
    - services/video-service/src/v2/interviews/scheduling-service.ts
  modified:
    - services/video-service/src/v2/interviews/service.ts
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/video-service/src/v2/interviews/token-service.ts
decisions:
  - id: gateway-wildcard-sufficient
    description: "Gateway wildcard /api/v2/interviews/* already proxies all new endpoints"
    rationale: "No gateway changes needed; existing app.all wildcard catches reschedule, available-slots, etc."
metrics:
  duration: "10 minutes"
  completed: "2026-03-08"
---

# Phase 35 Plan 03: Scheduling Backend APIs Summary

Scheduling service with slot computation, reschedule flows, and gateway routing for interview scheduling UI.

## What Was Built

### SchedulingService (scheduling-service.ts)
- `getAvailableSlots()` - computes free time windows from busy slots, working hours, and timezone constraints using 30-minute increments
- `rescheduleInterview()` - validates status, preserves original_scheduled_at on first reschedule, increments reschedule_count, publishes event
- `createRescheduleRequest()` - candidate-initiated reschedule with 2-reschedule limit, magic link token validation
- `acceptRescheduleRequest()` - accepts a pending request, calls rescheduleInterview internally

### Updated Interview Creation (service.ts)
- `createInterview` now accepts `calendar_event_id`, `calendar_connection_id`, `meeting_platform`, `meeting_link`
- Room name generation skipped for non-splits_video platforms (Google Meet, Teams)
- Repository input type updated to accept nullable room_name and new calendar fields

### New Routes (routes.ts)
- `PATCH /api/v2/interviews/:id/reschedule` - authenticated reschedule
- `POST /api/v2/interviews/:id/reschedule-request` - no-auth candidate reschedule via magic link token
- `PATCH /api/v2/interviews/reschedule-requests/:requestId/accept` - authenticated accept
- `POST /api/v2/interviews/available-slots` - authenticated slot computation
- `PATCH /api/v2/interviews/:id` - authenticated partial update for calendar event linking

### Token Service Enhancement (token-service.ts)
- Added `validateMagicLinkToken()` for non-video token validation (reschedule requests)

### Repository Enhancement (repository.ts)
- Added `findRescheduleRequestById()` method

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Gateway wildcard sufficient | Existing `app.all('/api/v2/interviews/*')` already proxies all new endpoints without gateway changes |
| validateMagicLinkToken separate from exchangeMagicLink | Reschedule requests need token validation without LiveKit JWT generation |
| Busy slots as input parameter | Frontend/gateway orchestrates calendar API calls; scheduling service receives pre-fetched busy data |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added findRescheduleRequestById to repository**
- **Found during:** Task 1
- **Issue:** SchedulingService.acceptRescheduleRequest needs to look up a reschedule request by ID, but repository only had findRescheduleRequests (by interview ID)
- **Fix:** Added findRescheduleRequestById method
- **Files modified:** repository.ts

**2. [Rule 2 - Missing Critical] Added validateMagicLinkToken to TokenService**
- **Found during:** Task 2
- **Issue:** Reschedule-request endpoint needs to validate magic link tokens without generating LiveKit JWTs
- **Fix:** Added validateMagicLinkToken method that returns interview/participant info without JWT
- **Files modified:** token-service.ts

**3. [Rule 3 - Blocking] No gateway changes needed**
- **Found during:** Task 2
- **Issue:** Plan specified adding gateway proxy routes, but existing wildcard `app.all('/api/v2/interviews/*')` already catches all sub-paths
- **Fix:** Skipped unnecessary gateway modifications
- **Files modified:** None

## Next Phase Readiness

Backend scheduling APIs are complete. Ready for:
- 35-04: Frontend scheduling UI that calls these endpoints
- 35-05: Notification integration for reschedule events
