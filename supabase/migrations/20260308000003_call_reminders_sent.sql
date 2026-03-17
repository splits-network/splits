-- =============================================================================
-- Call Reminders Sent — deduplication table for scheduler reminders
-- Phase 44-04: Tracks which reminders have been sent for each call
-- =============================================================================

CREATE TABLE call_reminders_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_reminder UNIQUE (call_id, reminder_type)
);

CREATE INDEX idx_call_reminders_sent_call ON call_reminders_sent(call_id);

-- RLS: service role only (scheduler is backend-only)
ALTER TABLE call_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; no authenticated user policies needed
-- End of migration
