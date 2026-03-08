---
phase: 35-scheduling-and-notifications
plan: 01
subsystem: database, api
tags: [postgres, supabase, typescript, scheduling, calendar, interviews]

requires:
  - phase: 33-livekit-infrastructure
    provides: interviews schema and video-service foundation
provides:
  - Scheduling columns on interviews table (calendar_event_id, meeting_platform, meeting_link, reschedule tracking)
  - user_calendar_preferences table for working hours and timezone
  - interview_reschedule_requests table for reschedule workflow
  - Updated TypeScript types matching all new columns
  - Repository methods for updating interviews and managing reschedule requests
affects: [35-02 through 35-10, calendar-sync, notification-service, scheduling-service]

tech-stack:
  added: []
  patterns:
    - Generic partial update method (updateInterview) for flexible field updates
    - Reschedule request workflow (pending/accepted/declined status)

key-files:
  created:
    - supabase/migrations/20260308000001_extend_interviews_for_scheduling.sql
  modified:
    - services/video-service/src/v2/interviews/types.ts
    - services/video-service/src/v2/interviews/repository.ts

key-decisions:
  - "meeting_platform defaults to splits_video with enum-like TEXT column"
  - "working_days uses ISO day numbers (1=Monday, 7=Sunday)"
  - "Reschedule requests stored separately from interview columns for audit trail"

patterns-established:
  - "Reschedule workflow: request table with proposed_times JSONB + accepted_time"
  - "Calendar preferences: one row per user with working hours and timezone"

duration: 2min
completed: 2026-03-08
---

# Phase 35 Plan 01: Schema Foundation Summary

**Extended interviews schema with calendar event linking, meeting platform choice, reschedule tracking, and user calendar preferences table**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T05:39:30Z
- **Completed:** 2026-03-08T05:40:56Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Migration adds 9 new columns to interviews table for calendar and reschedule features
- user_calendar_preferences table stores working hours, timezone, and calendar connection per user
- interview_reschedule_requests table enables structured reschedule workflow with proposed times
- TypeScript types and repository methods updated to match all new schema

## Task Commits

Each task was committed atomically:

1. **Task 1: Create scheduling schema migration** - `ab11fc95` (feat)
2. **Task 2: Update video-service types and repository** - `5ca60a5d` (feat)

## Files Created/Modified
- `supabase/migrations/20260308000001_extend_interviews_for_scheduling.sql` - Schema extensions for scheduling
- `services/video-service/src/v2/interviews/types.ts` - Added MeetingPlatform, UserCalendarPreferences, InterviewRescheduleRequest types
- `services/video-service/src/v2/interviews/repository.ts` - Added updateInterview, findUpcoming, reschedule request CRUD methods

## Decisions Made
- meeting_platform uses TEXT with default 'splits_video' rather than a PostgreSQL enum (easier to extend)
- working_days stored as INT[] with ISO day numbers for international compatibility
- Reschedule requests in separate table (not just interview columns) to preserve audit trail of multiple reschedule attempts
- proposed_times stored as JSONB array of {start, end} objects for flexibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema foundation ready for all downstream scheduling plans
- Types and repository methods available for calendar-service and scheduling-service
- No blockers for Plan 02+

---
*Phase: 35-scheduling-and-notifications*
*Completed: 2026-03-08*
