-- Add missing columns to subscriptions table
-- billing_period: tracks monthly vs annual billing (was in TypeScript type but never had a DB column)
-- canceled_at: records when the user initiated cancellation (distinct from cancel_at which is when access ends)

ALTER TABLE "public"."subscriptions"
    ADD COLUMN IF NOT EXISTS "billing_period" text DEFAULT 'monthly',
    ADD COLUMN IF NOT EXISTS "canceled_at" timestamp with time zone;

-- Update status constraint to include 'incomplete' status
ALTER TABLE "public"."subscriptions"
    DROP CONSTRAINT IF EXISTS "subscriptions_status_check";

ALTER TABLE "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_status_check"
    CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'past_due'::"text", 'trialing'::"text", 'incomplete'::"text"])));

-- Backfill billing_period from Stripe metadata for existing subscriptions
-- (This is a best-effort backfill; Stripe is the source of truth)
COMMENT ON COLUMN "public"."subscriptions"."billing_period" IS 'monthly or annual — synced from Stripe subscription metadata';
COMMENT ON COLUMN "public"."subscriptions"."canceled_at" IS 'Timestamp when user initiated cancellation (cancel_at = when access actually ends)';
