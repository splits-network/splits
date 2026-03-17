-- Add primary, secondary, accent, neutral severity options to site_notifications

BEGIN;

-- Drop existing severity constraint and add expanded one
ALTER TABLE site_notifications
    DROP CONSTRAINT IF EXISTS site_notifications_severity_check;

ALTER TABLE site_notifications
    ADD CONSTRAINT site_notifications_severity_check
    CHECK (severity IN ('info', 'warning', 'error', 'critical', 'primary', 'secondary', 'accent', 'neutral'));

COMMIT;
