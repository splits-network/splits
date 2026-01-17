-- Rollback: Remove role field from payouts table
-- Phase 6: Commission Calculator rollback
-- Date: 2026-01-16

-- Drop indexes
DROP INDEX IF EXISTS billing.idx_payouts_placement_role;
DROP INDEX IF EXISTS billing.idx_payouts_role;

-- Remove role column
ALTER TABLE billing.payouts DROP COLUMN IF EXISTS role;
