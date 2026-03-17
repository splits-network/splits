-- =============================================================================
-- Recruiter Response Metrics (Analytics)
-- Tracks response rate and avg response time per recruiter, computed daily.
-- =============================================================================

-- Analytics table: one row per recruiter per computation date
CREATE TABLE IF NOT EXISTS analytics.recruiter_response_metrics (
    recruiter_id UUID NOT NULL,
    response_rate NUMERIC,              -- % of info_requests that got responses (0-100)
    avg_response_time_hours NUMERIC,    -- average hours between request and response
    total_requests INTEGER NOT NULL DEFAULT 0,
    total_responses INTEGER NOT NULL DEFAULT 0,
    metric_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (recruiter_id, metric_date)
);

CREATE INDEX idx_recruiter_response_metrics_date
    ON analytics.recruiter_response_metrics (metric_date DESC);

-- Public view: latest metrics per recruiter (for PostgREST relational joins)
CREATE OR REPLACE VIEW public.recruiter_response_metrics_latest AS
SELECT DISTINCT ON (recruiter_id)
    recruiter_id,
    response_rate,
    avg_response_time_hours,
    total_requests,
    total_responses,
    metric_date
FROM analytics.recruiter_response_metrics
ORDER BY recruiter_id, metric_date DESC;
