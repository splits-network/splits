-- Add recording columns to interviews table
ALTER TABLE interviews
    ADD COLUMN recording_enabled BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN recording_status TEXT DEFAULT NULL
        CHECK (recording_status IN ('pending', 'recording', 'processing', 'ready', 'failed')),
    ADD COLUMN recording_egress_id TEXT,
    ADD COLUMN recording_blob_url TEXT,
    ADD COLUMN recording_duration_seconds INT,
    ADD COLUMN recording_file_size_bytes BIGINT,
    ADD COLUMN recording_started_at TIMESTAMPTZ,
    ADD COLUMN recording_ended_at TIMESTAMPTZ,
    ADD COLUMN recording_consent_given_at TIMESTAMPTZ;

-- Partial index for finding recordings that need processing
CREATE INDEX idx_interviews_recording_status
    ON interviews(recording_status)
    WHERE recording_status IS NOT NULL;

-- Track per-participant recording consent
CREATE TABLE interview_recording_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES interview_participants(id) ON DELETE CASCADE,
    consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_recording_consent UNIQUE (interview_id, participant_id)
);
