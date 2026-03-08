-- =============================================================================
-- Video Interviewing: Interviews, Participants, Access Tokens
-- =============================================================================

-- Enums
CREATE TYPE interview_status AS ENUM (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'expired'
);

CREATE TYPE interview_type AS ENUM (
    'screening', 'technical', 'cultural', 'final', 'panel', 'debrief'
);

CREATE TYPE interview_participant_role AS ENUM (
    'interviewer', 'candidate', 'observer'
);

-- =============================================================================
-- 1. Interviews
-- =============================================================================
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    room_name TEXT UNIQUE,
    status interview_status NOT NULL DEFAULT 'scheduled',
    interview_type interview_type NOT NULL DEFAULT 'screening',
    title TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    scheduled_duration_minutes INT NOT NULL DEFAULT 60,
    actual_start_at TIMESTAMPTZ,
    actual_end_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    max_duration_seconds INT NOT NULL DEFAULT 14400,
    grace_period_seconds INT NOT NULL DEFAULT 300,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_status ON interviews(status)
    WHERE status IN ('scheduled', 'in_progress');
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at)
    WHERE status = 'scheduled';

-- =============================================================================
-- 2. Interview Participants
-- =============================================================================
CREATE TABLE interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role interview_participant_role NOT NULL,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_interview_participant UNIQUE (interview_id, user_id)
);

CREATE INDEX idx_interview_participants_user ON interview_participants(user_id);

-- =============================================================================
-- 3. Interview Access Tokens (magic links)
-- =============================================================================
CREATE TABLE interview_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES interview_participants(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_interview_access_token UNIQUE (interview_id, participant_id)
);

CREATE INDEX idx_interview_access_tokens_token ON interview_access_tokens(token);

-- =============================================================================
-- updated_at triggers
-- =============================================================================
CREATE TRIGGER set_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
