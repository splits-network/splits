-- Add 'pitch' to application_notes note_type constraint
-- Used when a recruiter submits a candidate with a pitch message

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
