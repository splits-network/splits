-- =============================================================================
-- Extend Interviews Schema for Scheduling Features
-- Phase 35: Calendar linking, meeting platform, reschedule tracking,
--           user calendar preferences
-- =============================================================================

-- =============================================================================
-- 1. Add scheduling columns to interviews table
-- =============================================================================
ALTER TABLE interviews
    ADD COLUMN calendar_event_id TEXT,
    ADD COLUMN calendar_connection_id UUID REFERENCES oauth_connections(id),
    ADD COLUMN meeting_platform TEXT NOT NULL DEFAULT 'splits_video',
    ADD COLUMN meeting_link TEXT,
    ADD COLUMN original_scheduled_at TIMESTAMPTZ,
    ADD COLUMN reschedule_count INT NOT NULL DEFAULT 0,
    ADD COLUMN reschedule_requested_by TEXT,
    ADD COLUMN reschedule_requested_at TIMESTAMPTZ,
    ADD COLUMN reschedule_notes TEXT;

-- Partial index for calendar event lookups
CREATE INDEX idx_interviews_calendar_event
    ON interviews(calendar_event_id)
    WHERE calendar_event_id IS NOT NULL;

-- =============================================================================
-- 2. User Calendar Preferences
-- =============================================================================
CREATE TABLE user_calendar_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    connection_id UUID REFERENCES oauth_connections(id),
    primary_calendar_id TEXT,
    additional_calendar_ids TEXT[] DEFAULT '{}',
    working_hours_start TIME NOT NULL DEFAULT '09:00',
    working_hours_end TIME NOT NULL DEFAULT '17:00',
    working_days INT[] NOT NULL DEFAULT '{1,2,3,4,5}',
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- working_days uses ISO day numbers: 1=Monday, 7=Sunday

CREATE INDEX idx_user_calendar_preferences_user
    ON user_calendar_preferences(user_id);

CREATE TRIGGER set_user_calendar_preferences_updated_at
    BEFORE UPDATE ON user_calendar_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 3. Interview Reschedule Requests
-- =============================================================================
CREATE TABLE interview_reschedule_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    requested_by TEXT NOT NULL,
    requested_by_user_id UUID REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined')),
    proposed_times JSONB NOT NULL DEFAULT '[]',
    accepted_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_interview_reschedule_requests_interview
    ON interview_reschedule_requests(interview_id);

CREATE TRIGGER set_interview_reschedule_requests_updated_at
    BEFORE UPDATE ON interview_reschedule_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
