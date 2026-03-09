-- Call Calendar Events tracking table
-- Maps call participants to their Google/Microsoft Calendar event IDs
-- so we can update/delete calendar events on reschedule/cancel.

CREATE TABLE IF NOT EXISTS call_calendar_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id         UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connection_id   UUID NOT NULL REFERENCES oauth_connections(id) ON DELETE CASCADE,
    calendar_id     TEXT NOT NULL,
    provider_event_id TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (call_id, user_id)
);

-- Index for lookup by call_id (update/delete all events for a call)
CREATE INDEX idx_call_calendar_events_call_id ON call_calendar_events(call_id);

-- RLS: participant-based access
ALTER TABLE call_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their own calendar events"
    ON call_calendar_events FOR SELECT
    USING (user_id = auth.uid());

-- Service role can do everything (calendar sync runs as service)
CREATE POLICY "Service role full access on call_calendar_events"
    ON call_calendar_events FOR ALL
    USING (auth.role() = 'service_role');
