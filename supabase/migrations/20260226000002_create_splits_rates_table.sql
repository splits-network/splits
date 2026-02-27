-- ============================================================================
-- splits_rates: Database-driven commission rates per plan tier
-- Replaces hardcoded COMMISSION_RATES constants in shared-types and calculator
-- ============================================================================

CREATE TABLE public.splits_rates (
    id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id                   uuid NOT NULL REFERENCES public.plans(id),

    -- Five-role commission percentages (0-100 scale)
    candidate_recruiter_rate  numeric(5,2) NOT NULL,
    job_owner_rate            numeric(5,2) NOT NULL,
    company_recruiter_rate    numeric(5,2) NOT NULL,
    candidate_sourcer_rate    numeric(5,2) NOT NULL,
    company_sourcer_rate      numeric(5,2) NOT NULL,
    platform_remainder_rate   numeric(5,2) NOT NULL,

    -- Versioning: NULL effective_to = currently active
    effective_from            timestamptz NOT NULL DEFAULT now(),
    effective_to              timestamptz,

    created_at                timestamptz NOT NULL DEFAULT now(),
    updated_at                timestamptz NOT NULL DEFAULT now(),

    -- All rates must be non-negative
    CONSTRAINT splits_rates_non_negative CHECK (
        candidate_recruiter_rate >= 0 AND
        job_owner_rate >= 0 AND
        company_recruiter_rate >= 0 AND
        candidate_sourcer_rate >= 0 AND
        company_sourcer_rate >= 0 AND
        platform_remainder_rate >= 0
    ),

    -- All rates must sum to exactly 100
    CONSTRAINT splits_rates_sum_to_100 CHECK (
        candidate_recruiter_rate +
        job_owner_rate +
        company_recruiter_rate +
        candidate_sourcer_rate +
        company_sourcer_rate +
        platform_remainder_rate = 100
    )
);

-- Enforce exactly one active rate set per plan at a time
CREATE UNIQUE INDEX idx_splits_rates_active_plan
    ON public.splits_rates(plan_id) WHERE effective_to IS NULL;

-- Lookup by plan_id
CREATE INDEX idx_splits_rates_plan_id ON public.splits_rates(plan_id);

-- Enable RLS
ALTER TABLE public.splits_rates ENABLE ROW LEVEL SECURITY;

-- Public read access (rates are not sensitive)
CREATE POLICY "splits_rates_public_read" ON public.splits_rates
    FOR SELECT USING (true);

-- ============================================================================
-- Seed current commission rates (same values as existing hardcoded constants)
-- ============================================================================

-- Starter tier (free): 20/10/10/6/6/48
INSERT INTO public.splits_rates (
    plan_id, candidate_recruiter_rate, job_owner_rate, company_recruiter_rate,
    candidate_sourcer_rate, company_sourcer_rate, platform_remainder_rate
)
SELECT id, 20, 10, 10, 6, 6, 48
FROM public.plans WHERE tier = 'starter' AND is_active = true;

-- Pro tier (paid): 30/15/15/8/8/24
INSERT INTO public.splits_rates (
    plan_id, candidate_recruiter_rate, job_owner_rate, company_recruiter_rate,
    candidate_sourcer_rate, company_sourcer_rate, platform_remainder_rate
)
SELECT id, 30, 15, 15, 8, 8, 24
FROM public.plans WHERE tier = 'pro' AND is_active = true;

-- Partner tier (premium): 40/20/20/10/10/0
INSERT INTO public.splits_rates (
    plan_id, candidate_recruiter_rate, job_owner_rate, company_recruiter_rate,
    candidate_sourcer_rate, company_sourcer_rate, platform_remainder_rate
)
SELECT id, 40, 20, 20, 10, 10, 0
FROM public.plans WHERE tier = 'partner' AND is_active = true;
