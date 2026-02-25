-- Replace the legacy payout_audit_log with a properly-named table
-- aligned to the new placement-based payout flow.
-- The old table referenced the now-dropped `payouts` table.
-- The new table references placement_payout_transactions, payout_schedules, and placements.

-- 1. Drop old table (it has 0 rows, no data loss)
DROP TABLE IF EXISTS public.payout_audit_log;

-- 2. Create new table aligned with the actual payout entities
CREATE TABLE public.placement_payout_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    placement_id uuid NOT NULL,
    schedule_id uuid,
    transaction_id uuid,
    event_type text NOT NULL,
    action text,
    old_status text,
    new_status text,
    old_amount numeric,
    new_amount numeric,
    reason text,
    metadata jsonb,
    changed_by uuid,
    changed_by_role varchar(50),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Comments
COMMENT ON TABLE public.placement_payout_audit_log IS 'Immutable audit trail for placement payout processing (schedules, transactions, transfers)';
COMMENT ON COLUMN public.placement_payout_audit_log.placement_id IS 'The placement this audit entry relates to';
COMMENT ON COLUMN public.placement_payout_audit_log.schedule_id IS 'The payout_schedule that triggered this action (if applicable)';
COMMENT ON COLUMN public.placement_payout_audit_log.transaction_id IS 'The placement_payout_transaction this entry relates to (if per-recruiter)';
COMMENT ON COLUMN public.placement_payout_audit_log.event_type IS 'Event category: processing, completed, failed, action';
COMMENT ON COLUMN public.placement_payout_audit_log.action IS 'Specific action: schedule_processing, schedule_completed, trigger_processing, transfer_sent, etc.';
COMMENT ON COLUMN public.placement_payout_audit_log.metadata IS 'Additional context: Stripe IDs, error details, amounts, etc.';
COMMENT ON COLUMN public.placement_payout_audit_log.changed_by IS 'User who performed the action (null for system/cron)';
COMMENT ON COLUMN public.placement_payout_audit_log.changed_by_role IS 'Role: platform_admin, system, cron';

-- 4. Indexes
CREATE INDEX idx_placement_payout_audit_placement ON public.placement_payout_audit_log (placement_id);
CREATE INDEX idx_placement_payout_audit_schedule ON public.placement_payout_audit_log (schedule_id) WHERE schedule_id IS NOT NULL;
CREATE INDEX idx_placement_payout_audit_transaction ON public.placement_payout_audit_log (transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_placement_payout_audit_event_type ON public.placement_payout_audit_log (event_type);
CREATE INDEX idx_placement_payout_audit_created_at ON public.placement_payout_audit_log (created_at DESC);

-- 5. Grants
GRANT ALL ON TABLE public.placement_payout_audit_log TO anon;
GRANT ALL ON TABLE public.placement_payout_audit_log TO authenticated;
GRANT ALL ON TABLE public.placement_payout_audit_log TO service_role;
