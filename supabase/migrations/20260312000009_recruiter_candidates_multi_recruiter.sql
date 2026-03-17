-- Phase 1E: Allow multiple active recruiter relationships per candidate
-- The old model limited candidates to one active recruiter.
-- New model: N recruiters per candidate, but no duplicate pairs.

-- Deduplicate: keep the most recently updated row for each active pair
DELETE FROM recruiter_candidates
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY recruiter_id, candidate_id
        ORDER BY updated_at DESC, created_at DESC
      ) AS rn
    FROM recruiter_candidates
    WHERE status = 'active'
  ) ranked
  WHERE rn > 1
);

-- Add unique constraint to prevent duplicate active recruiter-candidate pairs
-- (same recruiter can't represent the same candidate twice simultaneously)
CREATE UNIQUE INDEX "idx_recruiter_candidates_active_pair"
  ON "public"."recruiter_candidates" ("recruiter_id", "candidate_id")
  WHERE "status" = 'active';
