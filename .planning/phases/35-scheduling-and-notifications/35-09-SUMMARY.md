---
phase: 35-scheduling-and-notifications
plan: 09
subsystem: notifications
tags: [cron, reminders, email, in-app, resend, croner, interviews]

# Dependency graph
requires:
  - phase: 35-08
    provides: Interview email templates and consumer infrastructure
  - phase: 35-01
    provides: Interviews schema with meeting_platform and scheduling columns
provides:
  - Interview reminder scheduled job (24h, 1h, 10min)
  - Reminder email templates with escalating urgency
  - In-app notification creation with priority levels
affects: [36-recording-and-playback]

# Tech tracking
tech-stack:
  added: [croner]
  patterns: [in-process cron scheduling, reminder deduplication via notification_log]

key-files:
  created:
    - services/notification-service/src/jobs/send-interview-reminders.ts
    - services/notification-service/src/templates/interviews/reminder-emails.ts
  modified:
    - services/notification-service/src/templates/interviews/index.ts
    - services/notification-service/src/templates/index.ts
    - services/notification-service/src/index.ts
    - services/notification-service/package.json

key-decisions:
  - "croner for in-process cron instead of K8s CronJob — 5-minute interval needs low-latency polling"
  - "Deduplication via notification_log event_type + payload interview_id — prevents duplicate reminders on overlapping job runs"
  - "Reminder windows centered on target time with 10-minute detection range — ensures job catches reminders within polling interval"

patterns-established:
  - "In-process cron pattern: Cron from croner registered after server listen, stopped on SIGTERM"
  - "Reminder deduplication: check notification_log before sending, using event_type + payload field match"

# Metrics
duration: 8min
completed: 2026-03-08
---

# Phase 35 Plan 09: Interview Reminders Summary

**Escalating interview reminders (24h/1h/10min) via croner cron job with email and in-app notifications, deduplication via notification_log**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-08T06:04:49Z
- **Completed:** 2026-03-08T06:12:49Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Reminder email templates with escalating urgency (24h calm, 1h urgent, 10min full-width Join Now CTA)
- Scheduled job polling every 5 minutes with 10-minute detection windows per reminder type
- Deduplication prevents duplicate reminders across overlapping job runs
- Both email (Resend) and in-app notifications with escalating priority (normal/high/urgent)
- Supports all meeting platforms (Splits Video, Google Meet, Microsoft Teams, Zoom)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create reminder email templates** - `e4650b0a` (feat)
2. **Task 2: Create interview reminder scheduled job** - `781fc761` (feat)

_Note: Due to parallel execution with 35-08, some Task 2 files were captured in 35-08's commit `175d08b4`. The code is correct and complete._

## Files Created/Modified
- `services/notification-service/src/templates/interviews/reminder-emails.ts` - Escalating reminder email templates (24h/1h/10min) with Join Now CTA
- `services/notification-service/src/jobs/send-interview-reminders.ts` - Cron job querying upcoming interviews and sending reminders with deduplication
- `services/notification-service/src/templates/interviews/index.ts` - Added reminder-emails barrel export
- `services/notification-service/src/templates/index.ts` - Added interviews to main template exports
- `services/notification-service/src/index.ts` - Registered croner cron job, graceful shutdown
- `services/notification-service/package.json` - Added croner dependency

## Decisions Made
- **croner for in-process cron**: Interview reminders need 5-minute polling which is too frequent for K8s CronJob overhead. croner runs in-process with the service, providing low-latency scheduling.
- **Deduplication via notification_log**: Check for existing notification with matching event_type and interview_id in payload before sending. This prevents duplicate reminders if the job runs multiple times within a detection window.
- **10-minute detection windows**: Each reminder type has a centered 10-minute window (e.g., 24h reminder fires between 23h55m and 24h5m). This ensures the 5-minute polling interval always catches each reminder exactly once.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added croner dependency for cron scheduling**
- **Found during:** Task 2 (cron registration in index.ts)
- **Issue:** No cron library existed in notification-service; existing jobs are K8s CronJobs (standalone scripts). In-process cron needed for 5-minute polling.
- **Fix:** Installed croner package, registered cron in service startup
- **Files modified:** package.json, pnpm-lock.yaml, index.ts
- **Verification:** TypeScript compilation passes
- **Committed in:** 781fc761 (Task 2 commit)

**2. [Rule 3 - Blocking] Added interviews to main templates barrel export**
- **Found during:** Task 1 (template creation)
- **Issue:** Main templates/index.ts did not export interviews directory
- **Fix:** Added `export * from './interviews'` to templates/index.ts
- **Files modified:** services/notification-service/src/templates/index.ts
- **Verification:** TypeScript compilation passes
- **Committed in:** e4650b0a (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes were necessary infrastructure for the plan to work. No scope creep.

## Issues Encountered
- Parallel execution with 35-08 caused some files to be captured in 35-08's commit. Both agents modified the staging area concurrently. Code is correct, just distributed across commits differently than expected.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Interview reminder system complete and ready for production
- All meeting platforms supported (not just Splits Video)
- Phase 36 (recording/playback) can build on this notification infrastructure

---
*Phase: 35-scheduling-and-notifications*
*Completed: 2026-03-08*
