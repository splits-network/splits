-- Fix: Duplicate candidate records per user_id cause 500 errors
-- Root cause: Race condition during onboarding + case-sensitive email lookup
-- allows two concurrent requests to both create a candidate for the same user.

-- Step 1: Remove duplicate candidates, keeping the one with the most applications
-- (or the newest if tied). Reassign any applications from the duplicate to the keeper.
DO $$
DECLARE
  dup RECORD;
  keeper_id UUID;
  dupe_id UUID;
BEGIN
  FOR dup IN
    SELECT user_id
    FROM candidates
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING count(*) > 1
  LOOP
    -- Pick the keeper: most applications, then newest created_at
    SELECT c.id INTO keeper_id
    FROM candidates c
    LEFT JOIN (
      SELECT candidate_id, count(*) as app_count
      FROM applications
      GROUP BY candidate_id
    ) a ON a.candidate_id = c.id
    WHERE c.user_id = dup.user_id
    ORDER BY COALESCE(a.app_count, 0) DESC, c.created_at DESC
    LIMIT 1;

    -- For each duplicate (not the keeper)
    FOR dupe_id IN
      SELECT id FROM candidates
      WHERE user_id = dup.user_id AND id != keeper_id
    LOOP
      -- Reassign important relational data to the keeper
      UPDATE applications SET candidate_id = keeper_id WHERE candidate_id = dupe_id;
      UPDATE placements SET candidate_id = keeper_id WHERE candidate_id = dupe_id;
      UPDATE documents SET entity_id = keeper_id WHERE entity_type = 'candidate' AND entity_id = dupe_id;

      -- Delete disposable/duplicate-safe references
      DELETE FROM candidate_sourcers WHERE candidate_id = dupe_id;
      DELETE FROM candidate_skills WHERE candidate_id = dupe_id;
      DELETE FROM candidate_saved_jobs WHERE candidate_id = dupe_id;
      DELETE FROM candidate_role_matches WHERE candidate_id = dupe_id;
      DELETE FROM job_recommendations WHERE candidate_id = dupe_id;
      DELETE FROM marketplace_events WHERE candidate_id = dupe_id;
      DELETE FROM recruiter_candidates WHERE candidate_id = dupe_id;
      DELETE FROM recruiter_saved_candidates WHERE candidate_id = dupe_id;

      -- Delete the duplicate candidate
      DELETE FROM candidates WHERE id = dupe_id;
    END LOOP;
  END LOOP;
END $$;

-- Step 2: Add unique partial index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS candidates_user_id_unique
  ON candidates (user_id)
  WHERE user_id IS NOT NULL;
