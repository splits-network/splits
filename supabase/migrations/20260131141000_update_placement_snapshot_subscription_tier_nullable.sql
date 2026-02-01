-- Make placement_snapshot.subscription_tier optional (per-role tiers are canonical)

BEGIN;

ALTER TABLE placement_snapshot
    ALTER COLUMN subscription_tier DROP NOT NULL;

ALTER TABLE placement_snapshot
    DROP CONSTRAINT IF EXISTS placement_snapshot_subscription_tier_check;

COMMIT;
