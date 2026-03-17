-- =============================================================================
-- Phase 46: Drop all interview-related database objects
-- =============================================================================
-- The call system (calls, call_participants, call_notes, etc.) fully replaces
-- the interview schema. No production data exists in interview tables.
-- This migration removes all interview tables, enums, triggers, and cleans
-- up the application_notes note_type constraint.
--
-- NOTE: user_calendar_preferences is intentionally preserved -- it is shared
-- infrastructure used by the call calendar system.
--
-- NOTE: There is no interview_id column on the applications table.
-- The FK went the other direction: interviews.application_id -> applications.id.
-- =============================================================================

-- =============================================================================
-- 1. Drop triggers (before dropping tables to avoid dependency issues)
-- =============================================================================
DROP TRIGGER IF EXISTS set_interviews_updated_at ON interviews;
DROP TRIGGER IF EXISTS set_interview_notes_updated_at ON interview_notes;
DROP TRIGGER IF EXISTS set_interview_reschedule_requests_updated_at ON interview_reschedule_requests;

-- =============================================================================
-- 2. Drop dependent tables (tables with FKs to interviews/interview_participants)
-- =============================================================================
DROP TABLE IF EXISTS interview_notes CASCADE;
DROP TABLE IF EXISTS interview_recording_consents CASCADE;
DROP TABLE IF EXISTS interview_access_tokens CASCADE;
DROP TABLE IF EXISTS interview_reschedule_requests CASCADE;
DROP TABLE IF EXISTS interview_transcripts CASCADE;

-- =============================================================================
-- 3. Drop interview_participants (FK to interviews)
-- =============================================================================
DROP TABLE IF EXISTS interview_participants CASCADE;

-- =============================================================================
-- 4. Drop interviews table (root table)
-- =============================================================================
DROP TABLE IF EXISTS interviews CASCADE;

-- =============================================================================
-- 5. Drop interview-related enums
-- =============================================================================
DROP TYPE IF EXISTS interview_status CASCADE;
DROP TYPE IF EXISTS interview_type CASCADE;
DROP TYPE IF EXISTS interview_participant_role CASCADE;

-- =============================================================================
-- 6. Rebuild application_notes note_type constraint without interview values
-- =============================================================================
-- Remove interview_summary and interview_note from the allowed note_type values.
-- Remaining values: info_request, info_response, note, improvement_request,
-- stage_transition, interview_feedback, general, pitch
-- Note: interview_feedback is kept -- it is a general note type for feedback
-- about interviews posted by users, not tied to the interview schema.
ALTER TABLE public.application_notes DROP CONSTRAINT IF EXISTS application_notes_note_type_check;

ALTER TABLE public.application_notes ADD CONSTRAINT application_notes_note_type_check
  CHECK (note_type IN (
    'info_request',
    'info_response',
    'note',
    'improvement_request',
    'stage_transition',
    'interview_feedback',
    'general',
    'pitch'
  ));

COMMENT ON COLUMN public.application_notes.note_type IS 'Type of note: info_request, info_response, note, improvement_request, stage_transition, interview_feedback, general, or pitch';
