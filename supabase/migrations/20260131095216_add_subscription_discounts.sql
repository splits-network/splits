-- Add discount tracking table for Stripe promotion code usage
-- File: services/billing-service/migrations/add_subscription_discounts.sql

BEGIN;

-- Table to track discount code usage per subscription
CREATE TABLE subscription_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_promotion_code_id TEXT NOT NULL,
    stripe_discount_id TEXT,
    promotion_code TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'amount')),
    discount_value NUMERIC NOT NULL,
    discount_duration TEXT NOT NULL CHECK (discount_duration IN ('once', 'repeating', 'forever')),
    discount_duration_in_months INTEGER,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscription_discounts_subscription_id ON subscription_discounts(subscription_id);
CREATE INDEX idx_subscription_discounts_stripe_promotion_code_id ON subscription_discounts(stripe_promotion_code_id);
CREATE INDEX idx_subscription_discounts_applied_at ON subscription_discounts(applied_at);

-- Ensure one discount per subscription (prevent stacking)
CREATE UNIQUE INDEX idx_subscription_discounts_unique_subscription ON subscription_discounts(subscription_id) 
WHERE applied_at IS NOT NULL;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated at trigger
CREATE TRIGGER set_updated_at_subscription_discounts 
    BEFORE UPDATE ON subscription_discounts 
    FOR EACH ROW 
    EXECUTE FUNCTION set_updated_at_column();

COMMIT;
