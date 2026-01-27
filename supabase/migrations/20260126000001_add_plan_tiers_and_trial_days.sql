-- Migration: Add tier, trial_days columns and update plans with final pricing copy
-- This migration adds Stripe subscription support for recruiter onboarding

-- Step 1: Add new columns to plans table
ALTER TABLE "public"."plans" 
ADD COLUMN IF NOT EXISTS "tier" text,
ADD COLUMN IF NOT EXISTS "trial_days" integer DEFAULT 14,
ADD COLUMN IF NOT EXISTS "price_cents" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "interval" text DEFAULT 'month';

-- Step 2: Add constraint for tier values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_tier_check'
    ) THEN
        ALTER TABLE "public"."plans" 
        ADD CONSTRAINT "plans_tier_check" 
        CHECK (("tier" IS NULL OR "tier" = ANY (ARRAY['starter'::text, 'pro'::text, 'partner'::text])));
    END IF;
END
$$;

-- Step 3: Add constraint for interval values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'plans_interval_check'
    ) THEN
        ALTER TABLE "public"."plans" 
        ADD CONSTRAINT "plans_interval_check" 
        CHECK (("interval" IS NULL OR "interval" = ANY (ARRAY['month'::text, 'year'::text])));
    END IF;
END
$$;

-- Step 4: Update or insert the three recruiter plans with final pricing copy

-- Starter Plan (Free)
INSERT INTO "public"."plans" (
    "name", 
    "slug",
    "tier",
    "price_monthly", 
    "price_cents",
    "interval",
    "trial_days",
    "is_active", 
    "stripe_price_id",
    "features"
) VALUES (
    'Starter',
    'starter',
    'starter',
    0,
    0,
    'month',
    0, -- No trial for free plan
    true,
    NULL, -- No Stripe price for free plan
    '{
        "headline": "Start making split placements — no commitment required",
        "subheadline": "Perfect for recruiters exploring split recruiting and building momentum inside the network.",
        "included": [
            "Access to open roles across the network",
            "Unlimited candidate submissions",
            "Full ATS workflow and application tracking",
            "Email notifications and activity updates",
            "Participation in split placements",
            "Base payout eligibility on successful hires"
        ],
        "not_included": [
            "Priority role access",
            "Advanced analytics",
            "API access",
            "Team or firm management"
        ],
        "cta_text": "Get Started",
        "footnote": "Payout percentages are finalized at hire time and depend on role participation.",
        "is_popular": false
    }'::jsonb
)
ON CONFLICT ("slug") 
DO UPDATE SET
    "name" = EXCLUDED."name",
    "tier" = EXCLUDED."tier",
    "price_monthly" = EXCLUDED."price_monthly",
    "price_cents" = EXCLUDED."price_cents",
    "interval" = EXCLUDED."interval",
    "trial_days" = EXCLUDED."trial_days",
    "is_active" = EXCLUDED."is_active",
    "features" = EXCLUDED."features",
    "updated_at" = NOW();

-- Pro Plan (Most Popular - $99/month)
INSERT INTO "public"."plans" (
    "name", 
    "slug",
    "tier",
    "price_monthly", 
    "price_cents",
    "interval",
    "trial_days",
    "is_active", 
    "stripe_price_id",
    "features"
) VALUES (
    'Pro',
    'pro',
    'pro',
    99,
    9900,
    'month',
    14, -- 14-day free trial
    true,
    NULL, -- Set after creating Stripe price
    '{
        "headline": "Higher upside for serious recruiters",
        "subheadline": "Designed for active recruiters who want better economics, faster access, and deeper insight.",
        "included": [
            "Everything in Starter",
            "Higher payout bonuses on successful placements",
            "Priority access to newly released roles",
            "Performance analytics dashboard",
            "Advanced reporting and placement insights",
            "Priority email support"
        ],
        "not_included": [
            "White-label branding",
            "Multi-recruiter team management",
            "Custom integrations"
        ],
        "cta_text": "Start Pro Trial",
        "footnote": "Subscription tier increases incentive potential but does not guarantee placements.",
        "is_popular": true,
        "annual_price_cents": 99900,
        "annual_savings_text": "2 months free"
    }'::jsonb
)
ON CONFLICT ("slug") 
DO UPDATE SET
    "name" = EXCLUDED."name",
    "tier" = EXCLUDED."tier",
    "price_monthly" = EXCLUDED."price_monthly",
    "price_cents" = EXCLUDED."price_cents",
    "interval" = EXCLUDED."interval",
    "trial_days" = EXCLUDED."trial_days",
    "is_active" = EXCLUDED."is_active",
    "features" = EXCLUDED."features",
    "updated_at" = NOW();

-- Partner Plan ($249/month)
INSERT INTO "public"."plans" (
    "name", 
    "slug",
    "tier",
    "price_monthly", 
    "price_cents",
    "interval",
    "trial_days",
    "is_active", 
    "stripe_price_id",
    "features"
) VALUES (
    'Partner',
    'partner',
    'partner',
    249,
    24900,
    'month',
    14, -- 14-day free trial
    true,
    NULL, -- Set after creating Stripe price
    '{
        "headline": "Built for firms, power users, and sourcing partners",
        "subheadline": "Maximum incentives, early access, and the tools needed to scale recruiting as a business.",
        "included": [
            "Everything in Pro",
            "Maximum payout bonuses",
            "Exclusive early access to select roles",
            "Multi-recruiter team and firm management",
            "API access",
            "White-label options",
            "Priority support and account management",
            "Approved custom integrations"
        ],
        "not_included": [],
        "cta_text": "Contact Sales",
        "footnote": "All payouts are determined at hire time and follow platform placement rules.",
        "is_popular": false,
        "annual_price_cents": 249900,
        "annual_savings_text": "2 months free"
    }'::jsonb
)
ON CONFLICT ("slug") 
DO UPDATE SET
    "name" = EXCLUDED."name",
    "tier" = EXCLUDED."tier",
    "price_monthly" = EXCLUDED."price_monthly",
    "price_cents" = EXCLUDED."price_cents",
    "interval" = EXCLUDED."interval",
    "trial_days" = EXCLUDED."trial_days",
    "is_active" = EXCLUDED."is_active",
    "features" = EXCLUDED."features",
    "updated_at" = NOW();

-- Step 5: Add stripe_customer_id to subscriptions table if not exists
ALTER TABLE "public"."subscriptions"
ADD COLUMN IF NOT EXISTS "stripe_customer_id" text,
ADD COLUMN IF NOT EXISTS "trial_start" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "trial_end" timestamp with time zone;

-- Create index for stripe_customer_id lookups
CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripe_customer_id" 
ON "public"."subscriptions" ("stripe_customer_id");
