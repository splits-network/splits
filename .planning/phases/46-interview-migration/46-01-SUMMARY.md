---
phase: 46-interview-migration
plan: 01
subsystem: database
tags: [postgres, migration, schema-cleanup, drop-table]

# Dependency graph
requires:
  - phase: 42-call-data-model-service-layer
    provides: Call system tables that replace interview tables
provides:
  - Complete removal of interview database schema (7 tables, 3 enums, 3 triggers)
  - Clean application_notes constraint without interview-specific note types
affects: [46-02 through 46-05 interview code cleanup plans]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - supabase/migrations/20260313000001_drop_interview_tables.sql
  modified: []

key-decisions:
  - "Kept interview_feedback note type -- it is a general-purpose note type not tied to interview schema"
  - "No interview_id column existed on applications table -- FK was interviews.application_id, dropped with table"

patterns-established: []

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 46 Plan 01: Drop Interview Database Objects Summary

**Single migration dropping 7 interview tables, 3 enums, and 3 triggers with application_notes constraint cleanup**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T20:03:37Z
- **Completed:** 2026-03-09T20:05:37Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Dropped all 7 interview tables in correct dependency order with CASCADE
- Dropped all 3 interview-specific Postgres enums
- Rebuilt application_notes note_type constraint without interview_summary and interview_note
- Preserved user_calendar_preferences table (shared with call calendar system)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create migration to drop all interview database objects** - `6f2dd7b1` (feat)

## Files Created/Modified
- `supabase/migrations/20260313000001_drop_interview_tables.sql` - Complete interview schema removal migration

## Decisions Made
- Kept `interview_feedback` as a note type -- it is a general-purpose label for user-written feedback about interviews, not tied to the interview database schema
- Confirmed no `interview_id` column exists on the `applications` table -- the FK was `interviews.application_id` referencing `applications.id`, which is dropped when the interviews table is dropped
- Used `IF EXISTS` guards throughout for idempotency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Interview schema fully removed from database
- Ready for code cleanup plans (service deletion, frontend removal, type cleanup)
- Call system tables remain intact and unaffected

---
*Phase: 46-interview-migration*
*Completed: 2026-03-09*
