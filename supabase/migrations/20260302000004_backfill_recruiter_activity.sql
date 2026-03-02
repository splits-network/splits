-- Backfill recruiter_activity from existing tables

-- Placements (all recruiter roles)
INSERT INTO recruiter_activity (recruiter_id, activity_type, description, metadata, created_at)
SELECT recruiter_id, activity_type, description, metadata, created_at
FROM (
    -- Candidate recruiters
    SELECT
        p.candidate_recruiter_id AS recruiter_id,
        CASE WHEN p.state = 'completed' THEN 'placement_completed' ELSE 'placement_created' END AS activity_type,
        CASE WHEN p.state = 'completed' THEN 'Completed a placement' ELSE 'Started a new placement' END AS description,
        jsonb_build_object('placement_id', p.id, 'job_title', p.job_title) AS metadata,
        p.created_at
    FROM placements p
    WHERE p.candidate_recruiter_id IS NOT NULL

    UNION ALL

    -- Company recruiters
    SELECT
        p.company_recruiter_id AS recruiter_id,
        CASE WHEN p.state = 'completed' THEN 'placement_completed' ELSE 'placement_created' END AS activity_type,
        CASE WHEN p.state = 'completed' THEN 'Completed a placement' ELSE 'Started a new placement' END AS description,
        jsonb_build_object('placement_id', p.id, 'job_title', p.job_title) AS metadata,
        p.created_at
    FROM placements p
    WHERE p.company_recruiter_id IS NOT NULL

    UNION ALL

    -- Job owner recruiters
    SELECT
        p.job_owner_recruiter_id AS recruiter_id,
        CASE WHEN p.state = 'completed' THEN 'placement_completed' ELSE 'placement_created' END AS activity_type,
        CASE WHEN p.state = 'completed' THEN 'Completed a placement' ELSE 'Started a new placement' END AS description,
        jsonb_build_object('placement_id', p.id, 'job_title', p.job_title) AS metadata,
        p.created_at
    FROM placements p
    WHERE p.job_owner_recruiter_id IS NOT NULL
) placement_activity;

-- Company relationships (accepted)
INSERT INTO recruiter_activity (recruiter_id, activity_type, description, metadata, created_at)
SELECT
    rc.recruiter_id,
    'company_connected',
    'Partnered with a new company',
    jsonb_build_object('company_id', rc.company_id),
    rc.created_at
FROM recruiter_companies rc
WHERE rc.status = 'active';

-- Candidate relationships
INSERT INTO recruiter_activity (recruiter_id, activity_type, description, metadata, created_at)
SELECT
    rc.recruiter_id,
    'candidate_connected',
    'Connected with a new candidate',
    jsonb_build_object('candidate_id', rc.candidate_id),
    rc.created_at
FROM recruiter_candidates rc;

-- Referral signups
INSERT INTO recruiter_activity (recruiter_id, activity_type, description, metadata, created_at)
SELECT
    rcl.recruiter_id,
    'referral_signup',
    'Referral code used by a new signup',
    jsonb_build_object('signup_type', rcl.signup_type),
    rcl.created_at
FROM recruiter_codes_log rcl
WHERE rcl.recruiter_id IS NOT NULL;
