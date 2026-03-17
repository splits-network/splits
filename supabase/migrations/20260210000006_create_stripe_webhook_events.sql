-- Store all Stripe webhook events for debugging, replay, and idempotency
-- Billing service writes to this table before processing each event

BEGIN;

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    api_version TEXT,
    livemode BOOLEAN NOT NULL DEFAULT false,
    payload JSONB NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (processing_status IN ('pending', 'processing', 'succeeded', 'failed', 'skipped')),
    processing_error TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint for idempotency — reject duplicate event IDs
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id
    ON stripe_webhook_events(stripe_event_id);

-- Query by type (e.g., find all invoice.payment_succeeded events)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type
    ON stripe_webhook_events(event_type);

-- Query by status (e.g., find all failed events for retry)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processing_status
    ON stripe_webhook_events(processing_status);

-- Query recent events (debugging)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at
    ON stripe_webhook_events(created_at DESC);

COMMIT;
