-- Add webhook logging table for tracking Stripe webhook events
-- This supports idempotency and debugging of webhook processing

CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    data JSONB,
    error TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for checking if event has been processed (idempotency)
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_id_status 
    ON webhook_logs (event_id, status);

-- Index for querying by event type
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type 
    ON webhook_logs (event_type);

-- Index for querying by processing time
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed_at 
    ON webhook_logs (processed_at DESC);