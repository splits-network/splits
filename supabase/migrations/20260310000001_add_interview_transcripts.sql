-- AI Pipeline: transcript storage, interview_summary note type, pipeline status tracking
-- Phase 37 Plan 01: Foundation schema for transcription pipeline

-- Part 1: interview_transcripts table
-- segments JSONB stores array of: { start: number, end: number, text: string, speaker: string }
-- where start/end are seconds from recording start, speaker is participant name or role
CREATE TABLE interview_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    full_text TEXT NOT NULL,
    segments JSONB NOT NULL DEFAULT '[]',
    language TEXT DEFAULT 'en',
    whisper_model TEXT,
    processing_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_interview_transcripts_interview ON interview_transcripts(interview_id);

-- Part 2: Add 'interview_summary' to application_notes note_type CHECK constraint
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
    'interview_summary'
  ));

COMMENT ON COLUMN public.application_notes.note_type IS 'Type of note: info_request, info_response, note, improvement_request, stage_transition, interview_feedback, general, pitch, or interview_summary';

-- Part 3: Add AI pipeline status columns to interviews table
ALTER TABLE interviews
    ADD COLUMN transcript_status TEXT DEFAULT NULL
        CHECK (transcript_status IN ('pending', 'transcribing', 'summarizing', 'posting', 'complete', 'failed')),
    ADD COLUMN transcript_error TEXT;
