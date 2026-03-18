-- Push Notifications Support
-- Adds push_subscriptions table for Web Push API endpoints
-- and push_enabled column to notification_preferences

-- ── Push Subscriptions ──────────────────────────────────────────────────────

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    CONSTRAINT uq_push_endpoint UNIQUE (endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);

-- RLS: users can only manage their own push subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY push_subscriptions_select ON push_subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY push_subscriptions_insert ON push_subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY push_subscriptions_delete ON push_subscriptions
    FOR DELETE USING (user_id = auth.uid());

-- Service role bypasses RLS for backend operations

-- ── Push Preference Column ──────────────────────────────────────────────────

ALTER TABLE notification_preferences
    ADD COLUMN push_enabled BOOLEAN NOT NULL DEFAULT true;
