-- The payout_audit_log table requires payout_id NOT NULL, but the new
-- automated flow uses payout_schedules (not the legacy payouts table).
-- Make payout_id nullable and add schedule_id + placement_id columns
-- so audit entries can reference the schedule/placement directly.

-- 1. Make payout_id nullable (FK to payouts was already dropped)
ALTER TABLE public.payout_audit_log ALTER COLUMN payout_id DROP NOT NULL;

-- 2. Make created_by nullable (system/cron operations have no user)
ALTER TABLE public.payout_audit_log ALTER COLUMN created_by DROP NOT NULL;

-- 3. Make action nullable (not all event_types use action field)
ALTER TABLE public.payout_audit_log ALTER COLUMN action DROP NOT NULL;

-- 4. Add schedule_id and placement_id columns for the new flow
ALTER TABLE public.payout_audit_log ADD COLUMN IF NOT EXISTS schedule_id uuid;
ALTER TABLE public.payout_audit_log ADD COLUMN IF NOT EXISTS placement_id uuid;

-- 5. Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_payout_audit_schedule ON public.payout_audit_log (schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payout_audit_placement ON public.payout_audit_log (placement_id) WHERE placement_id IS NOT NULL;

-- 6. Add comments
COMMENT ON COLUMN public.payout_audit_log.schedule_id IS 'Reference to payout_schedules.id (for schedule-based audit entries)';
COMMENT ON COLUMN public.payout_audit_log.placement_id IS 'Reference to placements.id (for tracing audit entries to a placement)';
