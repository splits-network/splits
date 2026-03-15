---
phase: 44-recruiter-company-calls-portal-integration
plan: 04
subsystem: api
tags: [scheduler, reminders, timeouts, no-show, call-lifecycle, rabbitmq]

requires:
  - phase: 44-01
    provides: call_status enum (missed, no_show), calls table with scheduling columns
provides:
  - Periodic scheduler for call reminders (24h, 1h, 5min)
  - Instant call timeout detection (5min auto-miss)
  - Scheduled call no-show detection (15min grace period)
  - call_reminders_sent deduplication table
  - call.reminder, call.starting_soon, call.missed, call.no_show events
affects: [44-05, 44-06, notification-service]

tech-stack:
  added: []
  patterns: [interval-based-scheduler, reminder-deduplication, event-driven-lifecycle]

key-files:
  created:
    - services/call-service/src/v2/scheduler.ts
    - services/call-service/src/v2/scheduler-repository.ts
    - supabase/migrations/20260308000002_call_reminders_sent.sql
  modified:
    - services/call-service/src/index.ts

key-decisions:
  - "Scheduler repository in separate file (scheduler-repository.ts) to keep main repository under 200 lines"
  - "Reminder windows use ranges (e.g., 23h-25h) to tolerate 1-minute interval drift"
  - "Tick uses running guard to prevent overlapping executions"

patterns-established:
  - "Scheduler pattern: setInterval + tick guard + graceful shutdown via onClose hook"
  - "Reminder dedup: call_reminders_sent table with UNIQUE(call_id, reminder_type)"

duration: 2min
completed: 2026-03-09
---

# Phase 44 Plan 04: Call Scheduler Summary

**Interval-based call scheduler with 24h/1h/5min reminders, 5-min instant timeout, and 15-min no-show detection publishing RabbitMQ events**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T05:46:19Z
- **Completed:** 2026-03-09T05:48:05Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Scheduler repository with reminder queries, timeout/no-show detection, and status update methods
- CallScheduler class running every 60s with parallel processing of reminders, timeouts, and no-shows
- Deduplication via call_reminders_sent table prevents duplicate reminder notifications
- Graceful shutdown integrated with Fastify onClose hook and SIGTERM handler

## Task Commits

Each task was committed atomically:

1. **Task 1: Add scheduler query methods to repository** - `bfe01b54` (feat)
2. **Task 2: Create scheduler module and register in service startup** - `fb24b8b8` (feat)

## Files Created/Modified
- `services/call-service/src/v2/scheduler-repository.ts` - Query methods for reminders, timeouts, no-shows, status updates
- `services/call-service/src/v2/scheduler.ts` - CallScheduler class with interval-based tick processing
- `services/call-service/src/index.ts` - Scheduler instantiation and lifecycle hooks
- `supabase/migrations/20260308000002_call_reminders_sent.sql` - Deduplication table for sent reminders

## Decisions Made
- Created separate scheduler-repository.ts rather than adding methods to main repository (200-line rule)
- Reminder windows use ranges (23h-25h, 55min-65min, 4min-6min) to handle interval drift
- Running guard prevents overlapping tick executions
- 5-min reminders publish `call.starting_soon` (separate event type for in-app toast handling)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Scheduler events ready for notification-service consumption (call.reminder, call.starting_soon, call.missed, call.no_show)
- Repository queries ready for use by other plans needing call lifecycle data

---
*Phase: 44-recruiter-company-calls-portal-integration*
*Completed: 2026-03-09*
