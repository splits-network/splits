-- Migration 005: Add Stripe Integration Fields
-- Date: 2026-01-22
-- Description: Add Stripe-specific fields to support billing integration

-- Add Stripe fields to plans table
ALTER TABLE billing.plans 
    ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add Stripe fields to subscriptions table
ALTER TABLE billing.subscriptions 
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
    ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_stripe_product_id ON billing.plans(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON billing.plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON billing.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON billing.subscriptions(stripe_subscription_id);