---
phase: 47-critical-bug-fixes-event-wiring
plan: 01
subsystem: video-calls-notifications
tags: [bugfix, sessionStorage, rabbitmq, event-wiring, notifications]
depends_on: [42, 43, 44]
provides: [video-call-join-fix, recording-notification-fix, reminder-email-fix]
affects: [48]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - apps/video/src/components/join-flow.tsx
    - services/notification-service/src/domain-consumer.ts
    - services/notification-service/src/consumers/calls/consumer.ts
decisions: []
metrics:
  duration: 4min
  completed: 2026-03-09
---

# Phase 47 Plan 01: Critical Bug Fixes - Video Call Flow Summary

**SessionStorage key mismatch fix, recording event name correction, and 24h/1h reminder binding addition**

## What Was Done

### Task 1: Fix sessionStorage key mismatch in video app join flow
- **File:** `apps/video/src/components/join-flow.tsx`
- **Bug:** Writer used `call:${id}` (colon) but reader in `call/[callId]/page.tsx` expected `call-${id}` (hyphen)
- **Fix:** Changed colon to hyphen on line 23
- **Impact:** Users can now join video calls after token exchange
- **Commit:** 8b431251

### Task 2: Fix recording event name and add reminder binding
- **File:** `services/notification-service/src/domain-consumer.ts`
  - Changed `call.recording.ready` to `call.recording_ready` (binding + switch case) to match video-service publisher
  - Added `call.reminder` binding + switch case for 24h/1h reminder events from call-service scheduler
- **File:** `services/notification-service/src/consumers/calls/consumer.ts`
  - Added `reminderType` to `CallEventPayload` interface with normalization
  - Added `handleReminder()` method that sends emails via existing `sendReminder` template
  - 24h reminders show "24 hours", 1h reminders show "1 hour" as timeUntil
  - No in-app toast for reminders (only 5-min `starting_soon` gets toast)
- **Commit:** 2486aea5

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `call:` key format eliminated from join-flow.tsx (only `call: result.call` object property remains)
2. `call-${result.call.id}` hyphen key confirmed on line 23
3. `call.recording.ready` (dot format) eliminated from notification-service
4. `call.recording_ready` (underscore format) confirmed in binding + switch case
5. `call.reminder` binding + switch case confirmed in domain-consumer.ts
6. `handleReminder` method confirmed in calls/consumer.ts
7. Video app builds successfully
8. Notification-service builds successfully

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 8b431251 | fix(47-01): fix sessionStorage key mismatch in video app join flow |
| 2 | 2486aea5 | fix(47-01): fix recording event name mismatch and add reminder binding |
