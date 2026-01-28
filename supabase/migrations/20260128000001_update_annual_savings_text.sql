-- Migration: Update annual savings text for Pro and Partner plans
-- Updates the features JSONB to include comparative price savings text

-- Pro Plan
UPDATE "public"."plans"
SET "features" = jsonb_set(
    "features", 
    '{annual_savings_text}', 
    '"Save ~16%"'
)
WHERE "slug" = 'pro';

-- Partner Plan
UPDATE "public"."plans"
SET "features" = jsonb_set(
    "features", 
    '{annual_savings_text}', 
    '"Save ~16%"'
)
WHERE "slug" = 'partner';
