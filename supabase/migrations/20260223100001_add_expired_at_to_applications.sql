-- Add expired_at timestamp to applications
-- Replaces stage='expired' with a timestamp overlay that preserves pipeline position.
-- NULL = active application, NOT NULL = expired (stage still shows where it was).

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS expired_at timestamp with time zone DEFAULT NULL;

-- Track when we last sent a pre-expiration warning (for dedup)
ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS last_warning_sent_at timestamp with time zone DEFAULT NULL;

-- Index for finding expired and soon-to-expire applications
CREATE INDEX IF NOT EXISTS idx_applications_expired_at
ON public.applications(expired_at) WHERE expired_at IS NOT NULL;

-- Backfill: restore previous stage for existing expired applications
-- Uses application_audit_log to find the stage before expiration
-- Audit log stores old_value/new_value as jsonb: { "stage": "company_review" }
WITH previous_stages AS (
    SELECT DISTINCT ON (application_id)
        application_id,
        old_value->>'stage' AS previous_stage
    FROM application_audit_log
    WHERE action = 'stage_changed'
      AND new_value->>'stage' = 'expired'
    ORDER BY application_id, created_at DESC
)
UPDATE public.applications a
SET expired_at = a.updated_at,
    stage = COALESCE(ps.previous_stage, 'submitted')
FROM previous_stages ps
WHERE ps.application_id = a.id
AND a.stage = 'expired';

-- Catch any expired apps without audit log entries
UPDATE public.applications
SET expired_at = updated_at,
    stage = 'submitted'
WHERE stage = 'expired' AND expired_at IS NULL;
