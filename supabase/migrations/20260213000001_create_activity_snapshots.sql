-- Activity snapshots for historical online user tracking
-- Populated every 5 minutes by analytics-service rollup job

CREATE TABLE IF NOT EXISTS analytics.activity_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    total_online integer NOT NULL DEFAULT 0,
    portal_online integer NOT NULL DEFAULT 0,
    candidate_online integer NOT NULL DEFAULT 0,
    corporate_online integer NOT NULL DEFAULT 0,
    authenticated_online integer NOT NULL DEFAULT 0,
    anonymous_online integer NOT NULL DEFAULT 0,
    snapshot_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_snapshots_at ON analytics.activity_snapshots(snapshot_at DESC);

COMMENT ON TABLE analytics.activity_snapshots IS 'Historical snapshots of online user counts, captured every 5 minutes';
