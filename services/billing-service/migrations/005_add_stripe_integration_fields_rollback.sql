-- Rollback Migration 005: Remove Stripe integration fields
-- Date: 2026-01-24

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
