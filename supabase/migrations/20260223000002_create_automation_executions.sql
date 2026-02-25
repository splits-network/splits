-- Add missing columns to automation_executions table
-- The table already exists in baseline with: id, rule_id, entity_type, entity_id,
-- trigger_data, status, executed_at, execution_result, error_message,
-- requires_approval, approved_by, approved_at, rejected_by, rejected_at,
-- rejection_reason, created_at

-- Add trigger_event_type for tracking which event triggered this execution
ALTER TABLE public.automation_executions
ADD COLUMN IF NOT EXISTS trigger_event_type text;

-- Add updated_at for consistency
ALTER TABLE public.automation_executions
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add index for pending approvals lookup
CREATE INDEX IF NOT EXISTS idx_automation_executions_pending
ON public.automation_executions(status, requires_approval) WHERE status = 'pending';

-- Helper functions for atomically incrementing rule counters
CREATE OR REPLACE FUNCTION increment_rule_triggered(rule_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE automation_rules
    SET times_triggered = times_triggered + 1,
        last_triggered_at = now(),
        updated_at = now()
    WHERE id = rule_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_rule_executed(rule_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE automation_rules
    SET times_executed = times_executed + 1,
        last_executed_at = now(),
        updated_at = now()
    WHERE id = rule_uuid;
END;
$$ LANGUAGE plpgsql;
