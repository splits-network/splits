-- Create company_reputation table
-- Mirrors recruiter_reputation pattern for tracking company reliability on the platform.

CREATE TABLE IF NOT EXISTS public.company_reputation (
    company_id uuid NOT NULL PRIMARY KEY REFERENCES companies(id),

    -- Volume metrics
    total_applications_received integer DEFAULT 0,
    total_hires integer DEFAULT 0,
    total_placements integer DEFAULT 0,
    completed_placements integer DEFAULT 0,
    failed_placements integer DEFAULT 0,

    -- Rate metrics
    hire_rate numeric,
    completion_rate numeric,

    -- Responsiveness
    avg_review_time_hours numeric,
    avg_feedback_time_hours numeric,

    -- Expiration accountability
    total_expired_in_company_stages integer DEFAULT 0,
    expiration_rate numeric,

    -- Score
    reputation_score numeric DEFAULT 50.0
        CHECK (reputation_score >= 0 AND reputation_score <= 100),

    last_calculated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_reputation_score
ON public.company_reputation(reputation_score DESC);

CREATE INDEX IF NOT EXISTS idx_company_reputation_last_calculated
ON public.company_reputation(last_calculated_at);

-- Extend recruiter_reputation with pipeline reliability columns
ALTER TABLE public.recruiter_reputation
ADD COLUMN IF NOT EXISTS total_expired_in_recruiter_stages integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pipeline_reliability_rate numeric;
