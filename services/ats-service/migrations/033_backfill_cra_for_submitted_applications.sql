-- Migration: Backfill CRA records for submitted applications without gate records
-- Purpose: Create candidate_role_assignments records for legacy applications that predate the gate system
-- Date: 2026-01-19

-- Insert CRA records for submitted applications that don't have them
INSERT INTO candidate_role_assignments (
    id,
    application_id,
    candidate_id,
    job_id,
    proposed_by,
    candidate_recruiter_id,
    company_recruiter_id,
    state,
    current_gate,
    gate_sequence,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    a.id,
    a.candidate_id,
    a.job_id,
    COALESCE(
        r.user_id,  -- Use recruiter's user_id if available
        j.job_owner_id, 
        (
            -- Fallback: get a company admin from the organization
            SELECT m.user_id 
            FROM memberships m 
            WHERE m.organization_id = c.identity_organization_id 
            AND m.role = 'company_admin' 
            LIMIT 1
        )
    ),
    a.recruiter_id,  -- candidate_recruiter_id (the recruiter who submitted)
    NULL,            -- company_recruiter_id (no company-side recruiter)
    'submitted',     -- state matches application stage
    'company',       -- current_gate: needs company review
    '["company"]'::jsonb,  -- gate_sequence: only company gate for submitted stage
    a.created_at,
    NOW()
FROM applications a
JOIN jobs j ON j.id = a.job_id
JOIN companies c ON c.id = j.company_id
LEFT JOIN recruiters r ON r.id = a.recruiter_id
LEFT JOIN candidate_role_assignments cra ON cra.application_id = a.id
WHERE a.stage = 'submitted'
  AND cra.id IS NULL  -- Only for applications without CRA records
  AND c.identity_organization_id IS NOT NULL;  -- Must have organization link

-- Log the backfill results
DO $$
DECLARE
    backfilled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backfilled_count
    FROM candidate_role_assignments
    WHERE created_at >= NOW() - INTERVAL '1 second';
    
    RAISE NOTICE 'Backfilled % CRA records for submitted applications', backfilled_count;
END $$;
