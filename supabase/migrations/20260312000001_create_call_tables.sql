-- =============================================================================
-- Call System: Types, Calls, Entity Links, Participants, Tokens, Artifacts
-- =============================================================================

-- =============================================================================
-- Enums
-- =============================================================================
CREATE TYPE call_status AS ENUM (
    'scheduled', 'active', 'completed', 'cancelled'
);

CREATE TYPE call_entity_type AS ENUM (
    'application', 'job', 'company', 'firm', 'candidate'
);

CREATE TYPE call_participant_role AS ENUM (
    'host', 'participant', 'observer'
);

-- =============================================================================
-- 1. Call Types (lookup table)
-- =============================================================================
CREATE TABLE call_types (
    slug TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    default_duration_minutes INT NOT NULL DEFAULT 60,
    requires_recording_consent BOOLEAN NOT NULL DEFAULT true,
    supports_ai_summary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO call_types (slug, label, default_duration_minutes, requires_recording_consent, supports_ai_summary) VALUES
    ('interview', 'Interview', 60, true, true),
    ('client_meeting', 'Client Meeting', 30, true, true),
    ('internal_call', 'Internal Call', 30, false, false);

-- =============================================================================
-- 2. Calls
-- =============================================================================
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_type TEXT NOT NULL REFERENCES call_types(slug),
    status call_status NOT NULL DEFAULT 'scheduled',
    title TEXT,
    livekit_room_name TEXT UNIQUE,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INT,
    created_by UUID NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calls_status ON calls(status)
    WHERE status IN ('scheduled', 'active');
CREATE INDEX idx_calls_call_type ON calls(call_type);
CREATE INDEX idx_calls_scheduled_at ON calls(scheduled_at)
    WHERE status = 'scheduled';
CREATE INDEX idx_calls_created_by ON calls(created_by);

CREATE TRIGGER set_calls_updated_at BEFORE UPDATE ON calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. Call Entity Links (polymorphic junction table)
-- =============================================================================
CREATE TABLE call_entity_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    entity_type call_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_entity_link UNIQUE (call_id, entity_type, entity_id)
);

CREATE INDEX idx_call_entity_links_entity ON call_entity_links(entity_type, entity_id);
CREATE INDEX idx_call_entity_links_call ON call_entity_links(call_id);

-- =============================================================================
-- 4. Call Participants
-- =============================================================================
CREATE TABLE call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role call_participant_role NOT NULL,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_participant UNIQUE (call_id, user_id)
);

CREATE INDEX idx_call_participants_user ON call_participants(user_id);
CREATE INDEX idx_call_participants_call ON call_participants(call_id);

-- =============================================================================
-- 5. Call Access Tokens (magic links)
-- =============================================================================
CREATE TABLE call_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_access_tokens_token ON call_access_tokens(token);
CREATE INDEX idx_call_access_tokens_call ON call_access_tokens(call_id);

-- =============================================================================
-- 6. Call Recordings (multiple per call — stop/restart supported)
-- =============================================================================
CREATE TABLE call_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    recording_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (recording_status IN ('pending', 'recording', 'processing', 'ready', 'failed')),
    egress_id TEXT,
    blob_url TEXT,
    duration_seconds INT,
    file_size_bytes BIGINT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_recordings_call ON call_recordings(call_id);

-- =============================================================================
-- 7. Call Transcripts
-- =============================================================================
CREATE TABLE call_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    storage_url TEXT NOT NULL,
    transcript_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (transcript_status IN ('pending', 'processing', 'ready', 'failed')),
    error TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_transcripts_call ON call_transcripts(call_id);

CREATE TRIGGER set_call_transcripts_updated_at BEFORE UPDATE ON call_transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. Call Summaries (one per call)
-- =============================================================================
CREATE TABLE call_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    summary JSONB NOT NULL,
    summary_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (summary_status IN ('pending', 'processing', 'ready', 'failed')),
    error TEXT,
    model TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_summary UNIQUE (call_id)
);

CREATE TRIGGER set_call_summaries_updated_at BEFORE UPDATE ON call_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 9. Call Notes (one per participant per call)
-- =============================================================================
CREATE TABLE call_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_note_per_user UNIQUE (call_id, user_id)
);

CREATE INDEX idx_call_notes_call ON call_notes(call_id);

CREATE TRIGGER set_call_notes_updated_at BEFORE UPDATE ON call_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- call_types: readable by all authenticated users
ALTER TABLE call_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_types_select" ON call_types
    FOR SELECT USING (auth.role() = 'authenticated');

-- calls: participant-based access
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calls_select" ON calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = calls.id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "calls_insert" ON calls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "calls_update" ON calls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = calls.id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "calls_delete" ON calls
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = calls.id
              AND cp.user_id = auth.uid()
        )
    );

-- call_entity_links: inherit from parent call
ALTER TABLE call_entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_entity_links_select" ON call_entity_links
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_entity_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_entity_links_insert" ON call_entity_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_entity_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_entity_links_delete" ON call_entity_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_entity_links.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_participants: inherit from parent call
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_participants_select" ON call_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_participants.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_participants_insert" ON call_participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "call_participants_delete" ON call_participants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_participants.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_access_tokens: inherit from parent call
ALTER TABLE call_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_access_tokens_select" ON call_access_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_access_tokens.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_access_tokens_insert" ON call_access_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_access_tokens.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_recordings: inherit from parent call
ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_recordings_select" ON call_recordings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_recordings.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_recordings_insert" ON call_recordings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_recordings.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_transcripts: inherit from parent call
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_transcripts_select" ON call_transcripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_transcripts.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_transcripts_insert" ON call_transcripts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_transcripts.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_summaries: inherit from parent call
ALTER TABLE call_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_summaries_select" ON call_summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_summaries.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_summaries_insert" ON call_summaries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_summaries.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_summaries_update" ON call_summaries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_summaries.call_id
              AND cp.user_id = auth.uid()
        )
    );

-- call_notes: inherit from parent call
ALTER TABLE call_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "call_notes_select" ON call_notes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_notes.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_notes_insert" ON call_notes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM call_participants cp
            WHERE cp.call_id = call_notes.call_id
              AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "call_notes_update" ON call_notes
    FOR UPDATE USING (
        call_notes.user_id = auth.uid()
    );

CREATE POLICY "call_notes_delete" ON call_notes
    FOR DELETE USING (
        call_notes.user_id = auth.uid()
    );
