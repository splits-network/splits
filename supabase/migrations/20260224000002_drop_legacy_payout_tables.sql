-- Drop legacy payout tables that are no longer used.
-- The platform now uses placement_splits + placement_payout_transactions.
-- payout_schedules, payout_audit_log, and escrow_holds are KEPT (actively used).

-- 1. Drop foreign key constraints from active tables that reference payouts
ALTER TABLE IF EXISTS public.escrow_holds DROP CONSTRAINT IF EXISTS escrow_holds_payout_id_fkey;
ALTER TABLE IF EXISTS public.payout_audit_log DROP CONSTRAINT IF EXISTS payout_audit_log_payout_id_fkey;
ALTER TABLE IF EXISTS public.payout_schedules DROP CONSTRAINT IF EXISTS payout_schedules_payout_id_fkey;

-- 2. Drop the legacy payout_splits table
DROP TABLE IF EXISTS public.payout_splits;

-- 3. Drop the legacy payouts table
DROP TABLE IF EXISTS public.payouts;
