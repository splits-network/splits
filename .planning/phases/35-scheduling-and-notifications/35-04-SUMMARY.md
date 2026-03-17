---
phase: 35-scheduling-and-notifications
plan: 04
subsystem: ui
tags: [react, scheduling, modal, calendar, video, daisyui]

requires:
  - phase: 35-01
    provides: "Schema extensions for meeting_platform, calendar_event_id, reschedule tables"
  - phase: 35-02
    provides: "Calendar event lifecycle and webhook integration"
provides:
  - "ScheduleInterviewModal with platform choice (Splits Video, Google Meet, Teams)"
  - "PlatformSelector sub-component for meeting platform selection"
  - "AvailableSlotsList sub-component for free/busy slot display"
  - "ApplicationSearch sub-component for linking interviews to applications"
affects: [35-05, 35-06, 35-07, 35-08]

tech-stack:
  added: []
  patterns:
    - "Platform-aware scheduling: only splits_video creates interview DB records"
    - "Free/busy slot computation from calendar availability API"
    - "Auto-generated interview titles (non-editable)"

key-files:
  created:
    - "apps/portal/src/components/basel/scheduling/platform-selector.tsx"
    - "apps/portal/src/components/basel/scheduling/available-slots-list.tsx"
    - "apps/portal/src/components/basel/scheduling/application-search.tsx"
  modified:
    - "apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx"
    - "apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx"

key-decisions:
  - "applicationId and applicationStage are optional props to avoid breaking candidate toolbar caller"
  - "Free/busy slot computation done client-side from calendar availability data"
  - "Slots limited to 100 to prevent massive list rendering"
  - "Business hours default 9-17 weekdays for slot computation"

patterns-established:
  - "Platform selector radio-card pattern with disabled state + connect link"
  - "Slot grouping by day with scrollable container"

duration: 4min
completed: 2026-03-08
---

# Phase 35 Plan 04: Schedule Interview Modal Overhaul Summary

**ScheduleInterviewModal with 3-platform choice, free/busy slot display, auto-titles, 30-min default, and terminal state blocking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T05:47:18Z
- **Completed:** 2026-03-08T05:51:07Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Three reusable scheduling sub-components: PlatformSelector, AvailableSlotsList, ApplicationSearch
- Overhauled ScheduleInterviewModal with platform choice, calendar-based slot display, and DB-only mode
- Terminal state blocking prevents scheduling for rejected/hired/withdrawn applications
- Only Splits Network Video creates interview DB records; Google Meet and Teams are calendar-only

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scheduling sub-components** - `11c4051b` (feat)
2. **Task 2: Overhaul ScheduleInterviewModal** - `f7e91877` (feat)

## Files Created/Modified
- `apps/portal/src/components/basel/scheduling/platform-selector.tsx` - Meeting platform selection with radio-card pattern
- `apps/portal/src/components/basel/scheduling/available-slots-list.tsx` - Time slots grouped by day with scrollable container
- `apps/portal/src/components/basel/scheduling/application-search.tsx` - Debounced application search with terminal state blocking
- `apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx` - Overhauled 3-step wizard with platform choice
- `apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx` - Updated caller to pass applicationId and stage

## Decisions Made
- Made applicationId and applicationStage optional props on ScheduleInterviewModal to maintain backward compatibility with the candidate toolbar (which has no application context)
- Client-side slot computation from calendar free/busy data (simpler than requiring a backend endpoint)
- Slots capped at 100 entries to prevent excessive DOM rendering
- Default business hours (9-17 Mon-Fri) used for slot filtering; user-configurable hours will come via integrations page preferences

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 9 - Typography] Fixed text-xs in existing schedule-interview-modal.tsx**
- **Found during:** Task 2
- **Issue:** Original modal used text-xs for legend labels and descriptions
- **Fix:** All legend labels and descriptions changed to text-sm
- **Files modified:** schedule-interview-modal.tsx
- **Committed in:** f7e91877

---

**Total deviations:** 1 auto-fixed (1 typography)
**Impact on plan:** Typography fix necessary for Basel design compliance. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Scheduling modal ready for integration with calendar page slot-click (Plan 05)
- Reschedule and cancellation flows can build on this modal structure (Plan 06)
- Notification triggers can hook into the submit handler (Plan 07)

---
*Phase: 35-scheduling-and-notifications*
*Completed: 2026-03-08*
