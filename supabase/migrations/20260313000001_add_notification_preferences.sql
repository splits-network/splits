-- =============================================================================
-- Notification Preferences: Per-user, per-category channel preferences
-- Opt-out model: missing row = all enabled (email + in_app)
-- =============================================================================

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_notification_pref UNIQUE (user_id, category),
    CONSTRAINT chk_notification_pref_category CHECK (
        category IN (
            'applications', 'interviews', 'offers_hires', 'placements',
            'candidates', 'jobs_matches', 'calls', 'messaging',
            'billing', 'security', 'invitations', 'engagement'
        )
    )
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

CREATE TRIGGER set_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_select" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notification_preferences_insert" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notification_preferences_update" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notification_preferences_delete" ON notification_preferences
    FOR DELETE USING (user_id = auth.uid());
