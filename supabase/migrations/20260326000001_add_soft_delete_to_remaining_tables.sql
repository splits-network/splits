-- Migration: Add soft delete (deleted_at) to tables missing it
-- Date: 2026-03-18
-- Description: Adds deleted_at column for soft delete support
--   to recruiter_reputation, recruiter_company_invitations, automation_rules,
--   fraud_signals, subscription_discounts, and company_reputation.
--   call_recordings already has deleted_at and is skipped.
--
-- ROLLBACK:
-- ALTER TABLE recruiter_reputation DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE recruiter_company_invitations DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE automation_rules DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE fraud_signals DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE subscription_discounts DROP COLUMN IF EXISTS deleted_at;
-- ALTER TABLE company_reputation DROP COLUMN IF EXISTS deleted_at;

-- 1. recruiter_reputation
ALTER TABLE recruiter_reputation ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiter_reputation_not_deleted
    ON recruiter_reputation(deleted_at) WHERE deleted_at IS NULL;

-- 2. recruiter_company_invitations
ALTER TABLE recruiter_company_invitations ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_recruiter_company_invitations_not_deleted
    ON recruiter_company_invitations(deleted_at) WHERE deleted_at IS NULL;

-- 3. automation_rules
ALTER TABLE automation_rules ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_automation_rules_not_deleted
    ON automation_rules(deleted_at) WHERE deleted_at IS NULL;

-- 4. fraud_signals
ALTER TABLE fraud_signals ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_fraud_signals_not_deleted
    ON fraud_signals(deleted_at) WHERE deleted_at IS NULL;

-- 5. subscription_discounts
ALTER TABLE subscription_discounts ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_discounts_not_deleted
    ON subscription_discounts(deleted_at) WHERE deleted_at IS NULL;

-- 6. company_reputation
ALTER TABLE company_reputation ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_company_reputation_not_deleted
    ON company_reputation(deleted_at) WHERE deleted_at IS NULL;
