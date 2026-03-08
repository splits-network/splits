---
phase: 38-panel-notes-polish
plan: 01
subsystem: video-interviewing
tags: [interviews, notes, migration, api, panel]
dependency-graph:
  requires: [37-01, 33-02]
  provides: [interview-notes-api, enriched-interview-listing, round-naming]
  affects: [38-02, 38-03, 38-04]
tech-stack:
  added: []
  patterns: [upsert-notes, enriched-context-query, cross-table-posting]
key-files:
  created:
    - supabase/migrations/20260311000001_extend_interviews_for_panel_notes.sql
  modified:
    - services/video-service/src/v2/interviews/types.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/service.ts
    - packages/shared-types/src/models.ts
decisions:
  - id: upsert-note-design
    description: One note document per participant per interview (upsert on conflict)
  - id: cross-table-posting
    description: video-service directly inserts into application_notes table for note posting
  - id: round-numbering
    description: Chronological position (1-based) computed from scheduled_at order
metrics:
  duration: ~3 minutes
  completed: 2026-03-08
---

# Phase 38 Plan 01: Backend Migration and API Summary

Database schema extensions and backend API endpoints for panel/notes features with enriched interview listing.

## What Was Done

### Task 1: Database Migration
- Added `round_name TEXT` column to interviews table (optional label like "Technical Screen")
- Created `interview_notes` table with unique constraint per participant per interview
- Added `interview_note` to application_notes note_type CHECK constraint
- Index on interview_id, updated_at trigger via existing function

### Task 2: Backend Types, Repository, and API Routes
- **Types**: Added `InterviewNote`, `InterviewNoteWithUser`, `InterviewWithFullContext` interfaces; added `round_name` to `Interview` and `CreateInterviewInput`; added `transcript_status`/`transcript_error` to `Interview` type
- **Repository**: `saveInterviewNote` (upsert), `getInterviewNotes` (with user/role enrichment), `findByApplicationIdWithContext` (enriched listing with round numbers, recording/transcript/summary status), `postNotesToApplication` (converts notes to application_notes)
- **Routes**: `PUT /api/v2/interviews/:id/notes`, `GET /api/v2/interviews/:id/notes`, `POST /api/v2/interviews/:id/notes/post-to-application`; updated `GET /api/v2/interviews` to support `include_context=true`
- **Service**: Passes `round_name` through to repository on create
- **shared-types**: Added `'interview_note'` to `ApplicationNoteType` union

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Missing transcript_status/transcript_error on Interview type**
- **Found during:** Task 2 (build verification)
- **Issue:** Migration 20260310000001 added `transcript_status` and `transcript_error` columns to interviews table, but the TypeScript `Interview` interface was never updated
- **Fix:** Added `transcript_status: string | null` and `transcript_error: string | null` to the Interview interface
- **Files modified:** services/video-service/src/v2/interviews/types.ts

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 5f70a33d | Database migration for round_name and interview_notes |
| 2 | 01507c6c | Backend types, repository, and API routes |

## Verification

- `pnpm --filter @splits-network/shared-types build` passes
- `pnpm --filter @splits-network/video-service build` passes
- Migration SQL syntactically valid with correct timestamp ordering
- Routes follow existing patterns (requireUserContext, error handling, { data: ... } envelope)

## Next Phase Readiness

Plan 01 provides the data layer and API surface needed by:
- Plan 02: Frontend interviews tab (uses `findByApplicationIdWithContext`)
- Plan 03: In-call notes panel (uses `saveInterviewNote`, `postNotesToApplication`)
- Plan 04: Panel call layout (uses round_name display)
