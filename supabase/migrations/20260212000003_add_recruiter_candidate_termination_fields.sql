-- Add termination tracking fields to recruiter_candidates table
-- Mirrors the termination_reason/terminated_by pattern from recruiter_companies

ALTER TABLE recruiter_candidates
  ADD COLUMN IF NOT EXISTS termination_reason TEXT,
  ADD COLUMN IF NOT EXISTS terminated_by UUID REFERENCES users(id);

-- Index for looking up who terminated relationships
CREATE INDEX IF NOT EXISTS idx_recruiter_candidates_terminated_by
  ON recruiter_candidates(terminated_by)
  WHERE terminated_by IS NOT NULL;
