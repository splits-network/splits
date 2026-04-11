-- Add cumulative platform stats columns to marketplace_health_daily
-- These support the public platform-summary endpoint for real footer/landing stats

ALTER TABLE "analytics"."marketplace_health_daily"
    ADD COLUMN IF NOT EXISTS "total_recruiters" integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "cumulative_placements" integer DEFAULT 0;

COMMENT ON COLUMN "analytics"."marketplace_health_daily"."total_recruiters"
    IS 'Total registered recruiters on the platform (all-time)';
COMMENT ON COLUMN "analytics"."marketplace_health_daily"."cumulative_placements"
    IS 'Cumulative placements completed on the platform (all-time)';
