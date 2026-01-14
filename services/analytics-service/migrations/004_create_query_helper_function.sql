-- Migration: Create helper function for querying analytics schema
-- Date: 2026-01-13
-- Description: Create RPC function to query analytics schema since PostgREST doesn't expose it by default

-- Create function to query metrics_monthly table
CREATE OR REPLACE FUNCTION query_metrics_monthly(
    p_metric_types text[],
    p_start_date date,
    p_end_date date,
    p_recruiter_id uuid DEFAULT NULL,
    p_company_id uuid DEFAULT NULL
)
RETURNS TABLE (
    metric_type text,
    time_value text,
    value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.metric_type,
        m.time_value::text,
        m.value
    FROM analytics.metrics_monthly m
    WHERE m.metric_type = ANY(p_metric_types)
        AND m.time_value >= p_start_date
        AND m.time_value <= p_end_date
        AND (p_recruiter_id IS NULL OR m.dimension_recruiter_id = p_recruiter_id)
        AND (p_company_id IS NULL OR m.dimension_company_id = p_company_id)
    ORDER BY m.time_value ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION query_metrics_monthly TO authenticated;
GRANT EXECUTE ON FUNCTION query_metrics_monthly TO service_role;
