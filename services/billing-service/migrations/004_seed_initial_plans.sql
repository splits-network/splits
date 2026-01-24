-- Migration 004: Seed Initial Plans
-- Date: 2026-01-22
-- Description: Add the three core subscription plans with correct naming

-- Insert initial subscription plans (lowercase names per addendum v1.1)
INSERT INTO billing.plans (
    name,
    slug,
    description,
    price_cents,
    currency,
    billing_interval,
    features,
    status,
    created_at,
    updated_at
) VALUES
(
    'free',
    'free',
    'Free plan for new recruiters',
    0,
    'usd',
    'monthly',
    '{"job_access": "limited", "commission_rate": 20, "support": "community", "placement_limit": 2}',
    'active',
    NOW(),
    NOW()
),
(
    'pro',
    'pro',
    'Professional plan for active recruiters',
    9900,
    'usd',
    'monthly',
    '{"job_access": "full", "commission_rate": 30, "support": "email", "placement_limit": null}',
    'active',
    NOW(),
    NOW()
),
(
    'partner',
    'partner',
    'Premium plan for high-volume recruiters',
    24900,
    'usd',
    'monthly',
    '{"job_access": "priority", "commission_rate": 40, "support": "priority", "placement_limit": null}',
    'active',
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    features = EXCLUDED.features,
    status = EXCLUDED.status,
    updated_at = NOW();