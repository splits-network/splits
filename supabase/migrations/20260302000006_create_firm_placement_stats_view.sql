-- Aggregated placement statistics per firm
-- Used by the public firm profile to show track record

CREATE OR REPLACE VIEW firm_placement_stats AS
SELECT
    ps.firm_id,
    COUNT(DISTINCT p.id) AS total_placements,
    COUNT(DISTINCT p.id) FILTER (
        WHERE p.hired_at > NOW() - INTERVAL '90 days'
    ) AS recent_placements,
    COALESCE(SUM(ps.split_amount), 0) AS total_revenue,
    COALESCE(AVG(ps.split_amount), 0) AS avg_fee,
    MAX(p.hired_at) AS last_placement_at
FROM placement_splits ps
JOIN placements p ON p.id = ps.placement_id
WHERE p.state = 'completed'
GROUP BY ps.firm_id;

COMMENT ON VIEW firm_placement_stats IS 'Aggregated placement metrics per firm for marketplace profiles';
