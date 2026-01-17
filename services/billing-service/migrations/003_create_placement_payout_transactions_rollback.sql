-- Rollback: Drop placement_payout_transactions table
-- Migration: 003_create_placement_payout_transactions (rollback)

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_update_placement_payout_transaction_updated_at ON placement_payout_transactions;
DROP FUNCTION IF EXISTS update_placement_payout_transaction_updated_at();

-- Drop indexes (automatically dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_payout_transactions_created_at;
DROP INDEX IF EXISTS idx_payout_transactions_stripe_transfer;
DROP INDEX IF EXISTS idx_payout_transactions_status;
DROP INDEX IF EXISTS idx_payout_transactions_recruiter;
DROP INDEX IF EXISTS idx_payout_transactions_placement;

-- Drop table
DROP TABLE IF EXISTS placement_payout_transactions;
