-- Recent completed placements per firm
-- Used by the public firm profile detail page

CREATE OR REPLACE VIEW firm_recent_placements AS
SELECT
    ps.firm_id,
    p.id AS placement_id,
    p.job_title,
    p.hired_at,
    p.salary,
    p.state
FROM placement_splits ps
JOIN placements p ON p.id = ps.placement_id
WHERE p.state = 'completed'
ORDER BY p.hired_at DESC;

COMMENT ON VIEW firm_recent_placements IS 'Recent completed placements per firm for profile display';
