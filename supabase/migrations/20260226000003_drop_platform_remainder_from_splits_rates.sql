-- ============================================================================
-- Remove platform_remainder_rate from splits_rates
--
-- The platform remainder is NOT a fixed column — it's computed dynamically:
--   platform_take = 100% - sum(filled role rates from each recruiter's tier)
--
-- Each role in a placement may be filled by a recruiter on a different tier
-- (or unfilled entirely), so the actual platform take varies per placement.
-- Storing it as a fixed column per tier was misleading.
-- ============================================================================

-- Drop old constraints that reference platform_remainder_rate
ALTER TABLE public.splits_rates DROP CONSTRAINT IF EXISTS splits_rates_non_negative;
ALTER TABLE public.splits_rates DROP CONSTRAINT IF EXISTS splits_rates_sum_to_100;

-- Drop the column
ALTER TABLE public.splits_rates DROP COLUMN platform_remainder_rate;

-- Add corrected constraints (role rates only)
ALTER TABLE public.splits_rates ADD CONSTRAINT splits_rates_valid_range CHECK (
    candidate_recruiter_rate BETWEEN 0 AND 100 AND
    job_owner_rate BETWEEN 0 AND 100 AND
    company_recruiter_rate BETWEEN 0 AND 100 AND
    candidate_sourcer_rate BETWEEN 0 AND 100 AND
    company_sourcer_rate BETWEEN 0 AND 100
);

ALTER TABLE public.splits_rates ADD CONSTRAINT splits_rates_max_100 CHECK (
    candidate_recruiter_rate +
    job_owner_rate +
    company_recruiter_rate +
    candidate_sourcer_rate +
    company_sourcer_rate <= 100
);
