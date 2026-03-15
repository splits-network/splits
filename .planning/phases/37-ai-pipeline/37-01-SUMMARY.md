---
phase: 37-ai-pipeline
plan: 01
subsystem: database-schema
tags: [transcripts, ai-pipeline, notes, migration]
dependency_graph:
  requires: [36-recording]
  provides: [transcript-table, interview-summary-note-type, pipeline-status-tracking]
  affects: [37-02-transcription-service, 37-03-frontend]
tech_stack:
  added: []
  patterns: [pipeline-status-column, jsonb-segments]
key_files:
  created:
    - supabase/migrations/20260310000001_add_interview_transcripts.sql
  modified:
    - packages/shared-types/src/models.ts
    - packages/shared-types/src/index.ts
    - packages/shared-ui/src/application-notes/types.ts
decisions:
  - id: transcript-segments-jsonb
    description: Store transcript segments as JSONB array with start/end/text/speaker fields
    rationale: Flexible schema for speaker diarization data without separate table overhead
  - id: six-state-pipeline
    description: Pipeline uses 6 states (pending, transcribing, summarizing, posting, complete, failed)
    rationale: Granular step display per CONTEXT.md locked decision
metrics:
  duration: ~3min
  completed: 2026-03-08
---

# Phase 37 Plan 01: AI Pipeline Schema Foundation Summary

**One-liner:** Transcript table with JSONB segments, interview_summary note type, and 6-state pipeline status tracking on interviews.

## What Was Done

### Task 1: Database Migration
Created `20260310000001_add_interview_transcripts.sql` with three parts:
1. **interview_transcripts table** - stores full transcript text and JSONB segments array (start, end, text, speaker), linked to interviews via unique index
2. **Note type constraint update** - added `interview_summary` as 9th valid note_type on application_notes
3. **Pipeline status columns** - added `transcript_status` (6-value CHECK: pending, transcribing, summarizing, posting, complete, failed) and `transcript_error` to interviews table

### Task 2: TypeScript Type Updates
- Added `interview_summary` to `ApplicationNoteType` union in shared-types
- Created `TranscriptSegment` and `InterviewTranscript` interfaces matching DB schema
- Exported new types from shared-types index
- Added `interview_summary` config to `NOTE_TYPE_CONFIG` with `fa-sparkles` icon and `badge-secondary` color

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Migration SQL syntax verified correct
- CHECK constraint includes all 9 note types
- transcript_status CHECK includes all 6 values including 'posting'
- `pnpm --filter @splits-network/shared-types build` passes
- `pnpm --filter @splits-network/shared-ui build` passes

## Commits

| Hash | Message |
|------|---------|
| a6c798ae | feat(37-01): add interview transcripts table, note type, and pipeline status |
| 69f3cabd | feat(37-01): add interview_summary type and transcript model interfaces |

## Next Phase Readiness

Plan 02 (transcription service) can proceed immediately - all schema and types are in place.
