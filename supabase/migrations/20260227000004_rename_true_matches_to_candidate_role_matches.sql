-- Rename true_matches → candidate_role_matches
-- The table holds ALL match tiers (standard + true); "true" is just the premium AI-scored tier.

ALTER TABLE public.true_matches RENAME TO candidate_role_matches;

-- Rename indexes to match new table name
ALTER INDEX idx_true_matches_candidate RENAME TO idx_candidate_role_matches_candidate;
ALTER INDEX idx_true_matches_job RENAME TO idx_candidate_role_matches_job;
ALTER INDEX idx_true_matches_score RENAME TO idx_candidate_role_matches_score;
ALTER INDEX idx_true_matches_tier RENAME TO idx_candidate_role_matches_tier;
ALTER INDEX idx_true_matches_status RENAME TO idx_candidate_role_matches_status;

-- Rename unique constraint
ALTER INDEX true_matches_candidate_id_job_id_key RENAME TO candidate_role_matches_candidate_id_job_id_key;

-- Rename primary key
ALTER INDEX true_matches_pkey RENAME TO candidate_role_matches_pkey;
