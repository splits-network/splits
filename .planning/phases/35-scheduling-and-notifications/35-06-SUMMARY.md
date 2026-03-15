---
phase: 35-scheduling-and-notifications
plan: 06
subsystem: ui, api
tags: [calendar, preferences, working-hours, toast, scheduling, interview]

# Dependency graph
requires:
  - phase: 35-01
    provides: user_calendar_preferences table schema
  - phase: 35-03
    provides: scheduling service and available-slots endpoint
  - phase: 35-04
    provides: ScheduleInterviewModal component
provides:
  - Calendar preferences GET/PUT endpoints in video-service
  - CalendarPreferencesPanel UI component on integrations page
  - Interview stage transition toast with schedule prompt
affects: [35-07, 35-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Calendar preferences upsert via ON CONFLICT (user_id)"
    - "Stage transition toast with auto-dismiss timer"
    - "Clerk user ID to internal UUID resolution in video-service"

key-files:
  created:
    - apps/portal/src/app/portal/integrations/components/calendar-preferences-panel.tsx
  modified:
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/api-gateway/src/routes/v2/video.ts
    - apps/portal/src/app/portal/integrations/page.tsx
    - apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx

key-decisions:
  - "Resolve clerk_user_id to internal UUID for calendar preferences table FK"
  - "PUT method added to gateway video proxy for preferences upsert"
  - "Toast uses useRef timer with cleanup to prevent memory leaks"

patterns-established:
  - "resolveUserId pattern: clerk ID to internal UUID lookup in video-service repository"
  - "Stage transition toast: state flag set only in handler callback, not on render"

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 35 Plan 06: Calendar Preferences & Stage Toast Summary

**Working hours/calendar preferences panel on integrations page with interview stage transition toast prompting schedule action**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T05:54:10Z
- **Completed:** 2026-03-08T05:59:10Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Backend GET/PUT endpoints for calendar preferences with clerk-to-UUID resolution
- CalendarPreferencesPanel with working hours, working days, timezone, and calendar selection
- Interview stage transition toast with "Schedule Now" action that opens ScheduleInterviewModal

## Task Commits

Each task was committed atomically:

1. **Task 1: Create calendar preferences panel on integrations page** - `85e284ec` (feat)
2. **Task 2: Stage trigger toast for interview scheduling** - `d3b7b592` (feat)

## Files Created/Modified
- `apps/portal/src/app/portal/integrations/components/calendar-preferences-panel.tsx` - Working hours, days, timezone, calendar selection UI
- `services/video-service/src/v2/interviews/routes.ts` - GET/PUT calendar-preferences endpoints
- `services/video-service/src/v2/interviews/repository.ts` - getCalendarPreferences, upsertCalendarPreferences, resolveUserId methods
- `services/api-gateway/src/routes/v2/video.ts` - Added PUT method to video proxy switch
- `apps/portal/src/app/portal/integrations/page.tsx` - Render CalendarPreferencesPanel
- `apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx` - Interview stage toast with Schedule Now

## Decisions Made
- Resolved clerk_user_id to internal UUID via users table lookup for calendar preferences FK constraint
- Added PUT method support to gateway video proxy (was missing GET/POST/PATCH/DELETE only)
- Toast auto-dismisses after 8 seconds with ref-based timer cleanup on unmount

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added PUT method to gateway video proxy**
- **Found during:** Task 1 (Calendar preferences endpoints)
- **Issue:** Gateway switch only handled GET/POST/PATCH/DELETE, PUT would return 405
- **Fix:** Added PUT case to video proxy switch statement
- **Files modified:** services/api-gateway/src/routes/v2/video.ts
- **Verification:** TypeScript compiles, PUT method routes to videoService.put()
- **Committed in:** 85e284ec (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for PUT endpoint to work through gateway. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Calendar preferences can be loaded by scheduling modal for slot computation
- Stage toast drives interview scheduling discovery
- Ready for notification and reminder plans (35-07, 35-08)

---
*Phase: 35-scheduling-and-notifications*
*Completed: 2026-03-08*
