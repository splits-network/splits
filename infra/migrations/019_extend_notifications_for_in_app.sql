-- Migration: 019_extend_notifications_for_in_app
-- Date: 2025-12-21
-- Description: Extend notification_log table to support in-app notifications alongside email

-- Add new columns to existing notification_log table
ALTER TABLE notifications.notification_log
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email' 
    CHECK (channel IN ('email', 'in_app', 'both')),
  ADD COLUMN IF NOT EXISTS read BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS action_url TEXT,
  ADD COLUMN IF NOT EXISTS action_label TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' 
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ADD COLUMN IF NOT EXISTS category TEXT;

-- Add indexes for in-app notification queries (user's unread notifications)
CREATE INDEX IF NOT EXISTS idx_notification_log_user_unread 
  ON notifications.notification_log(recipient_user_id, read, created_at DESC) 
  WHERE channel IN ('in_app', 'both') AND read = FALSE AND dismissed = FALSE;

-- Index for user's notification list by channel
CREATE INDEX IF NOT EXISTS idx_notification_log_user_channel 
  ON notifications.notification_log(recipient_user_id, channel, created_at DESC);

-- Index for querying by category
CREATE INDEX IF NOT EXISTS idx_notification_log_category 
  ON notifications.notification_log(category, created_at DESC)
  WHERE channel IN ('in_app', 'both');

-- Comments for documentation
COMMENT ON COLUMN notifications.notification_log.channel IS 'Delivery channel: email (sent via Resend), in_app (shown in UI), or both (dual record approach)';
COMMENT ON COLUMN notifications.notification_log.read IS 'Whether in-app notification has been read by user';
COMMENT ON COLUMN notifications.notification_log.read_at IS 'Timestamp when user marked notification as read';
COMMENT ON COLUMN notifications.notification_log.dismissed IS 'Whether user dismissed/archived this notification';
COMMENT ON COLUMN notifications.notification_log.action_url IS 'Deep link URL for in-app notifications (e.g., /applications/123)';
COMMENT ON COLUMN notifications.notification_log.action_label IS 'CTA button text (e.g., "View Application", "Review Candidate")';
COMMENT ON COLUMN notifications.notification_log.priority IS 'Notification priority for UI sorting and styling';
COMMENT ON COLUMN notifications.notification_log.category IS 'Notification category (e.g., application, placement, collaboration, system)';

-- Note: We use dual records approach:
-- - Each notification event creates TWO records: one for email (channel='email'), one for in-app (channel='in_app')
-- - Email records use: resend_message_id, status, sent_at, error_message
-- - In-app records use: read, read_at, dismissed, action_url, action_label
-- - This keeps concerns separated and allows independent lifecycle for each channel
