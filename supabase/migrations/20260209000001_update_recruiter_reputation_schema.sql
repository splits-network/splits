-- Remove obsolete proposal-based fields (proposals are now tracked in applications)
-- These fields were added when proposals were a separate entity, but now the
-- application stage tracks proposal state directly.

ALTER TABLE public.recruiter_reputation
  DROP COLUMN IF EXISTS proposals_accepted,
  DROP COLUMN IF EXISTS proposals_declined,
  DROP COLUMN IF EXISTS proposals_timed_out;

-- Add index for efficient lookups when querying by last calculation time
-- (useful for batch recalculation jobs)
CREATE INDEX IF NOT EXISTS idx_recruiter_reputation_last_calculated
  ON public.recruiter_reputation(last_calculated_at);
