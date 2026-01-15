-- Backfill candidate_sourcers table from existing candidates.recruiter_id
-- This migrates historical sourcer relationships into the new tracking system

INSERT INTO candidate_sourcers (
    candidate_id,
    sourcer_user_id,
    sourcer_type,
    sourced_at,
    protection_window_days,
    protection_expires_at,
    notes
)
SELECT 
    c.id as candidate_id,
    c.recruiter_id as sourcer_user_id,
    'recruiter' as sourcer_type,
    c.created_at as sourced_at,
    365 as protection_window_days,
    (c.created_at + INTERVAL '365 days') as protection_expires_at,
    'Migrated from legacy recruiter_id field' as notes
FROM candidates c
WHERE c.recruiter_id IS NOT NULL
  AND NOT EXISTS (
    -- Don't create duplicates if already exists
    SELECT 1 FROM candidate_sourcers cs 
    WHERE cs.candidate_id = c.id
  );

-- Log the migration results
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM candidate_sourcers
    WHERE notes = 'Migrated from legacy recruiter_id field';
    
    RAISE NOTICE 'Backfilled % candidate sourcer records from legacy recruiter_id field', migrated_count;
END $$;
