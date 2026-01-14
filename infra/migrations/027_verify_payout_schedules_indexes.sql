-- Migration: Verify payout_schedules indexes exist
-- This migration ensures all required indexes are present for optimal query performance

-- Index on status for filtering active/pending schedules
CREATE INDEX IF NOT EXISTS idx_payout_schedules_status 
ON payout_schedules(status);

-- Index on scheduled_date for date-based queries and automation processing
CREATE INDEX IF NOT EXISTS idx_payout_schedules_scheduled_date 
ON payout_schedules(scheduled_date);

-- Index on placement_id for placement-to-schedule lookups
CREATE INDEX IF NOT EXISTS idx_payout_schedules_placement 
ON payout_schedules(placement_id);

-- Composite index for automated processing queries (status + scheduled_date)
CREATE INDEX IF NOT EXISTS idx_payout_schedules_automation 
ON payout_schedules(status, scheduled_date)
WHERE status IN ('scheduled', 'pending');

-- Index on processed_at for reporting and analytics
CREATE INDEX IF NOT EXISTS idx_payout_schedules_processed_at 
ON payout_schedules(processed_at)
WHERE processed_at IS NOT NULL;

-- Index on guarantee_completion_date for guarantee tracking
CREATE INDEX IF NOT EXISTS idx_payout_schedules_guarantee_completion 
ON payout_schedules(guarantee_completion_date)
WHERE guarantee_completion_date IS NOT NULL;

COMMENT ON INDEX idx_payout_schedules_status IS 'Optimizes queries filtering by schedule status';
COMMENT ON INDEX idx_payout_schedules_scheduled_date IS 'Optimizes date-based schedule queries';
COMMENT ON INDEX idx_payout_schedules_placement IS 'Optimizes placement-to-schedule lookups';
COMMENT ON INDEX idx_payout_schedules_automation IS 'Optimizes automated processing queries';
COMMENT ON INDEX idx_payout_schedules_processed_at IS 'Optimizes reporting on processed schedules';
COMMENT ON INDEX idx_payout_schedules_guarantee_completion IS 'Optimizes guarantee period tracking';
