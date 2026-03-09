---
phase: 44-recruiter-company-calls-portal-integration
plan: 12
subsystem: notifications
tags: [rabbitmq, notifications, toasts, polling, in-app, daisyui]

requires:
  - phase: 44-03
    provides: call-service routes and lifecycle events
  - phase: 44-06
    provides: notification email service and consumer for call events

provides:
  - CallInAppNotificationService for in-app call notifications
  - Call toast components with action buttons (Accept/Decline/Join)
  - useCallNotifications polling hook for real-time toast display
  - Decline route (POST /api/v2/calls/:id/decline)
  - Event bindings for call.starting_soon, call.declined, call.participant.joined

affects: [portal-layout, call-ui, notification-system]

tech-stack:
  added: []
  patterns:
    - "In-app notification service separate from email service"
    - "Polling-based real-time call toast notifications (10s interval)"
    - "Normalized snake_case/camelCase event payload handling"

key-files:
  created:
    - services/notification-service/src/services/calls/in-app-service.ts
    - apps/portal/src/components/notifications/call-toast.tsx
    - apps/portal/src/hooks/use-call-notifications.ts
  modified:
    - services/notification-service/src/consumers/calls/consumer.ts
    - services/notification-service/src/domain-consumer.ts
    - services/call-service/src/v2/call-action-routes.ts
    - services/call-service/src/v2/service.ts

key-decisions:
  - "In-app notifications use notification_log table with channel='in_app' and status='sent'"
  - "Decline removes participant from call and publishes call.declined event"
  - "Call toasts poll at 10s intervals (faster than bell's 15s) for time-sensitive events"
  - "Initial load marks existing notifications as seen to avoid stale toast flood"

patterns-established:
  - "CallInAppNotificationService: direct DB inserts for in-app-only notifications"
  - "normalizePayload: handles both snake_case and camelCase event payloads"

duration: 9min
completed: 2026-03-09
---

# Phase 44 Plan 12: In-App Call Notifications Summary

**In-app call notification service with toast components for instant calls, starting-soon, participant-joined, and decline events using polling-based real-time delivery**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-09T06:34:00Z
- **Completed:** 2026-03-09T06:43:20Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created CallInAppNotificationService with 7 notification methods (starting_soon, instant, participant_joined, decline, recording_ready, cancellation, reschedule)
- Added 3 new RabbitMQ event bindings and consumer handlers (call.starting_soon, call.declined, call.participant.joined)
- Built call toast component with 4 variants and auto-dismiss timers (30s, 60s, 5s, 10s)
- Added POST /api/v2/calls/:id/decline route with participant removal and event publishing
- Created useCallNotifications hook with 10s polling for time-sensitive call toasts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create in-app notification service for call events** - `c1596861` (feat)
2. **Task 2: Create call toast components and real-time notification hook** - `eaa456fe` (feat)

## Files Created/Modified
- `services/notification-service/src/services/calls/in-app-service.ts` - In-app notification creation for all call event types
- `services/notification-service/src/consumers/calls/consumer.ts` - 3 new event handlers + payload normalization
- `services/notification-service/src/domain-consumer.ts` - 3 new RabbitMQ event bindings + routing
- `services/call-service/src/v2/call-action-routes.ts` - Decline route
- `services/call-service/src/v2/service.ts` - declineCall method with participant removal
- `apps/portal/src/components/notifications/call-toast.tsx` - Toast component with 4 variants
- `apps/portal/src/hooks/use-call-notifications.ts` - Polling hook for real-time toast display

## Decisions Made
- In-app notifications write directly to notification_log with channel='in_app' and status='sent' (no email sending needed)
- Decline action removes the declining participant from the call and publishes call.declined event to remaining participants
- Call toasts use 10s polling (faster than bell's 15s) since call events are time-sensitive
- Initial hook load marks existing unread call notifications as seen to prevent stale toast flood on page load
- Payload normalization handles both snake_case (from call-service) and camelCase for backwards compatibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Event payload snake_case/camelCase mismatch**
- **Found during:** Task 1 (consumer updates)
- **Issue:** Call-service publishes events with snake_case keys (call_id, scheduled_at) but consumer expected camelCase (callId, scheduledAt)
- **Fix:** Added normalizePayload method to handle both formats
- **Files modified:** services/notification-service/src/consumers/calls/consumer.ts
- **Verification:** TypeScript compiles clean
- **Committed in:** c1596861

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for correct event processing. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 12 plans in Phase 44 are now complete
- Call notification system ready for integration with portal layout (CallToastContainer needs to be mounted in portal layout)
- The useCallNotifications hook and CallToastContainer should be added to the portal's root layout in a future integration task

---
*Phase: 44-recruiter-company-calls-portal-integration*
*Completed: 2026-03-09*
