-- Rollback Migration 004: Drop webhook_logs table
-- Date: 2026-01-24

-- Drop indexes
DROP INDEX IF EXISTS idx_webhook_logs_event_id_status;
DROP INDEX IF EXISTS idx_webhook_logs_event_type;
DROP INDEX IF EXISTS idx_webhook_logs_processed_at;

-- Drop table
DROP TABLE IF EXISTS webhook_logs;
DROP TABLE IF EXISTS billing.webhook_logs;
