-- Phase 38 Plan 01: Panel notes schema extensions
-- Adds round_name to interviews, creates interview_notes table,
-- and adds 'interview_note' to application_notes note_type constraint

-- Part 1: Add round_name column to interviews (optional label like "Technical Screen", "Culture Fit")
ALTER TABLE interviews
    ADD COLUMN round_name TEXT;

-- Part 2: Create interview_notes table (one note document per participant per interview, upsert-friendly)
CREATE TABLE interview_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES interview_participants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_interview_note_per_participant UNIQUE (interview_id, participant_id)
);

CREATE INDEX idx_interview_notes_interview ON interview_notes(interview_id);

CREATE TRIGGER set_interview_notes_updated_at BEFORE UPDATE ON interview_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Part 3: Add 'interview_note' to application_notes note_type constraint
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
    'pitch',
    'interview_summary',
    'interview_note'
  ));

COMMENT ON COLUMN public.application_notes.note_type IS 'Type of note: info_request, info_response, note, improvement_request, stage_transition, interview_feedback, general, pitch, interview_summary, or interview_note';
