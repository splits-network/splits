---
phase: 35-scheduling-and-notifications
plan: 10
subsystem: ui
tags: [interview, reschedule, countdown, notifications, candidate, magic-link]

requires:
  - phase: 35-07
    provides: Reschedule modal and cancel interview UI
  - phase: 35-09
    provides: Interview reminder notifications
provides:
  - Candidate-facing reschedule request form with slot selection
  - Token-based available-slots endpoint for candidates
  - Live interview countdown in portal notifications
  - Join Now CTA for imminent interviews
affects: [36-recording-and-playback]

tech-stack:
  added: []
  patterns:
    - "Token-based candidate API endpoints (no auth, magic link validated)"
    - "Live countdown with 60-second setInterval polling"
    - "Interview notification category with fa-video icon and badge-accent"

key-files:
  created:
    - apps/candidate/src/app/(public)/interview/[token]/components/reschedule-request-form.tsx
    - apps/portal/src/components/basel/notifications/interview-countdown.tsx
  modified:
    - apps/candidate/src/app/(public)/interview/[token]/prep-page.tsx
    - apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx
    - apps/portal/src/app/portal/notifications/components/browse/list-item.tsx
    - apps/portal/src/app/portal/notifications/components/browse/detail-panel.tsx
    - apps/portal/src/lib/notifications.ts
    - packages/shared-video/src/types.ts
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/token-service.ts
    - services/video-service/src/v2/interviews/types.ts

key-decisions:
  - "reschedule_count added to InterviewContext types in both shared-video and video-service"
  - "Available slots endpoint uses interviewer working hours with no busy slots for simplicity"
  - "Countdown updates every 60 seconds via setInterval, not WebSocket"

patterns-established:
  - "Token-validated GET endpoint pattern for candidate-facing data"
  - "Interview notification rendering with countdown and Join Now CTA"

duration: 6min
completed: 2026-03-08
---

# Phase 35 Plan 10: Candidate Reschedule & Interview Countdown Summary

**Candidate reschedule request form with 2-3 slot selection from prep page, plus live interview countdown with Join Now CTA in portal notifications**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-08T06:11:57Z
- **Completed:** 2026-03-08T06:18:20Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Candidates can request reschedule from prep page by selecting 2-3 preferred time slots
- Max 2 reschedules enforced with pending request status display
- GET available-slots endpoint validates magic link token and computes interviewer working hours
- Live countdown in notifications updates every 60 seconds with urgent styling at < 10 minutes
- Join Now button appears when interview is within 10 minutes

## Task Commits

Each task was committed atomically:

1. **Task 1: Candidate reschedule request flow** - `e3bec4cd` (feat)
2. **Task 2: In-app interview countdown notifications** - `100f424d` (feat)

## Files Created/Modified
- `apps/candidate/src/app/(public)/interview/[token]/components/reschedule-request-form.tsx` - Reschedule form with slot selection, notes, and submit
- `apps/candidate/src/app/(public)/interview/[token]/prep-page.tsx` - Added collapsible "Need to reschedule?" section
- `apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx` - Pass magicToken to PrepPage
- `apps/portal/src/components/basel/notifications/interview-countdown.tsx` - Live countdown component
- `apps/portal/src/app/portal/notifications/components/browse/list-item.tsx` - Interview icon, badge, countdown
- `apps/portal/src/app/portal/notifications/components/browse/detail-panel.tsx` - Interview countdown in detail view
- `apps/portal/src/lib/notifications.ts` - Added interview category icon mapping
- `packages/shared-video/src/types.ts` - Added reschedule_count to InterviewContext
- `services/video-service/src/v2/interviews/routes.ts` - GET available-slots endpoint (token-based)
- `services/video-service/src/v2/interviews/token-service.ts` - Include reschedule_count in responses
- `services/video-service/src/v2/interviews/types.ts` - Added reschedule_count to InterviewContext

## Decisions Made
- Added `reschedule_count` to InterviewContext in both shared-video package and video-service types to keep them in sync
- Available slots endpoint uses interviewer working hours preferences with empty busy slots (no calendar integration needed for candidate-initiated reschedule -- simple and effective)
- Countdown uses 60-second setInterval per CONTEXT.md guidance -- no WebSocket needed for this use case

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 9 - Typography] Changed text-xs to text-sm on notification subject**
- **Found during:** Task 2
- **Issue:** `text-xs` on notification list item subject line (human-readable content)
- **Fix:** Changed to `text-sm` per typography rules
- **Files modified:** `apps/portal/src/app/portal/notifications/components/browse/list-item.tsx`
- **Committed in:** 100f424d

---

**Total deviations:** 1 auto-fixed (1 typography)
**Impact on plan:** Minor typography fix for readability. No scope creep.

## Issues Encountered
- `InterviewContext` type existed in both `packages/shared-video/src/types.ts` and `services/video-service/src/v2/interviews/types.ts` -- both needed `reschedule_count` added to compile cleanly

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 35 (Scheduling & Notifications) is now complete -- all 10 plans executed
- All interview scheduling, calendar integration, reschedule flows, email notifications, in-app notifications, and countdown features are in place
- Ready for Phase 36 (Recording & Playback)

---
*Phase: 35-scheduling-and-notifications*
*Completed: 2026-03-08*
