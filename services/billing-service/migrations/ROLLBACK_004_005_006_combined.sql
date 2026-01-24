-- COMBINED ROLLBACK: Billing/Subscription Migrations 004-006
-- Date: 2026-01-24
-- Run this script to revert all Stripe/billing integration changes
-- Execute in Supabase SQL Editor

-- ============================================
-- STEP 1: Rollback Migration 006 - Drop Stripe Connect and Company Billing tables
-- ============================================

-- Drop indexes
DROP INDEX IF EXISTS billing.idx_stripe_connect_accounts_user_id;
DROP INDEX IF EXISTS billing.idx_stripe_connect_accounts_stripe_id;
DROP INDEX IF EXISTS billing.idx_company_payment_terms_company_id;
DROP INDEX IF EXISTS billing.idx_company_payment_terms_stripe_customer_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_job_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_user_id;
DROP INDEX IF EXISTS billing.idx_promotion_charges_status;
DROP INDEX IF EXISTS billing.idx_promotion_charges_expires_at;

-- Drop tables
DROP TABLE IF EXISTS billing.promotion_charges;
DROP TABLE IF EXISTS billing.company_payment_terms;
DROP TABLE IF EXISTS billing.stripe_connect_accounts;

-- ============================================
-- STEP 2: Rollback Migration 005 - Remove Stripe integration fields
-- ============================================

-- Drop indexes first
DROP INDEX IF EXISTS billing.idx_plans_stripe_product_id;
DROP INDEX IF EXISTS billing.idx_plans_stripe_price_id;
DROP INDEX IF EXISTS billing.idx_subscriptions_stripe_customer_id;
DROP INDEX IF EXISTS billing.idx_subscriptions_stripe_subscription_id;

-- Remove Stripe columns from plans table
ALTER TABLE billing.plans 
    DROP COLUMN IF EXISTS stripe_product_id,
    DROP COLUMN IF EXISTS stripe_price_id;

-- Remove Stripe columns from subscriptions table
ALTER TABLE billing.subscriptions 
    DROP COLUMN IF EXISTS stripe_customer_id,
    DROP COLUMN IF EXISTS stripe_subscription_id,
    DROP COLUMN IF EXISTS stripe_session_id;

-- ============================================
-- STEP 3: Rollback Migration 004 - Remove seeded plans
-- ============================================

DELETE FROM billing.plans WHERE slug IN ('free', 'pro', 'partner');

-- ============================================
-- STEP 4: Rollback Migration 004 - Drop webhook_logs table
-- ============================================

DROP INDEX IF EXISTS idx_webhook_logs_event_id_status;
DROP INDEX IF EXISTS idx_webhook_logs_event_type;
DROP INDEX IF EXISTS idx_webhook_logs_processed_at;

DROP TABLE IF EXISTS webhook_logs;
DROP TABLE IF EXISTS billing.webhook_logs;

-- ============================================
-- VERIFICATION: Check what remains in billing schema
-- ============================================

-- Uncomment to verify:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'billing';
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'billing' AND table_name = 'plans';
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'billing' AND table_name = 'subscriptions';
