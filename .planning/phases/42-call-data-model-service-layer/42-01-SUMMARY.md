---
phase: 42-call-data-model-service-layer
plan: 01
subsystem: database
tags: [postgres, migration, rls, enums, call-system, polymorphic-links]

# Dependency graph
requires:
  - phase: interviews-schema
    provides: users table FK targets, update_updated_at_column() trigger function
provides:
  - call_types lookup table with 3 seed types
  - calls table with status enum, soft delete, livekit_room_name
  - call_entity_links polymorphic junction table
  - call_participants with consent tracking
  - call_access_tokens for magic link auth
  - call_recordings, call_transcripts, call_summaries, call_notes artifact tables
  - interviews.call_id nullable FK for Phase 46 migration
  - RLS policies on all call tables
affects: [42-02 call-service repository, 42-03 call-service routes, 46 interview-to-call migration]

# Tech tracking
tech-stack:
  added: []
  patterns: [polymorphic entity linking via junction table, participant-based RLS inheritance, lookup table instead of enum for extensible types]

key-files:
  created:
    - supabase/migrations/20260312000001_create_call_tables.sql
    - supabase/migrations/20260312000002_add_call_id_to_interviews.sql
  modified: []

key-decisions:
  - "RLS uses participant-based access only (entity stakeholder access deferred to service layer)"
  - "call_notes update/delete restricted to note author (user_id = auth.uid())"
  - "Multiple recordings per call supported (stop/restart scenario)"

patterns-established:
  - "Participant-based RLS inheritance: child tables check call_participants for access"
  - "Polymorphic entity linking: (entity_type, entity_id) composite index for efficient reverse lookups"
  - "Lookup table pattern: call_types as TEXT PRIMARY KEY with metadata columns instead of enum"

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 42 Plan 01: Call Data Model Summary

**Complete call database schema with 9 tables, 3 enums, polymorphic entity links, artifact storage, and participant-based RLS**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T22:02:06Z
- **Completed:** 2026-03-08T22:03:27Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Created full call system schema: call_types lookup, calls, entity links, participants, access tokens, recordings, transcripts, summaries, notes
- Polymorphic entity linking with composite index on (entity_type, entity_id) for efficient reverse lookups
- RLS policies on all 9 tables using participant-based access inheritance
- Nullable call_id FK on interviews table with partial unique index for Phase 46 backward compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create call system migration** - `0b753f74` (feat)
2. **Task 2: Add call_id FK to interviews table** - `37570f9e` (feat)

## Files Created/Modified
- `supabase/migrations/20260312000001_create_call_tables.sql` - All call tables, enums, indexes, triggers, RLS policies
- `supabase/migrations/20260312000002_add_call_id_to_interviews.sql` - Nullable call_id FK with partial unique index

## Decisions Made
- RLS policies use participant-based access only; entity stakeholder access handled at service layer (service_role_key bypasses RLS anyway)
- call_notes update/delete policies restricted to the note author, not all call participants
- Multiple recordings per call supported for stop/restart scenarios

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All call tables exist and ready for call-service repository layer (Plan 42-02)
- Polymorphic entity index validated in schema (performance blocker from research resolved)
- interviews.call_id ready for Phase 46 migration wiring

---
*Phase: 42-call-data-model-service-layer*
*Completed: 2026-03-08*
