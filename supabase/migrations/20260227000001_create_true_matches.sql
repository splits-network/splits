-- Drop and recreate candidate_role_matches with proper schema
-- Old table had: no FK constraints, schema/code mismatch, never populated
DROP TABLE IF EXISTS public.candidate_role_matches CASCADE;

-- Recreate candidate_role_matches with proper FKs and scoring columns
CREATE TABLE public.candidate_role_matches (
    id                 uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id       uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    job_id             uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    match_score        numeric(5,2) NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    rule_score         numeric(5,2) NOT NULL DEFAULT 0 CHECK (rule_score BETWEEN 0 AND 100),
    skills_score       numeric(5,2) NOT NULL DEFAULT 0 CHECK (skills_score BETWEEN 0 AND 100),
    ai_score           numeric(5,2) CHECK (ai_score BETWEEN 0 AND 100),
    match_factors      jsonb NOT NULL DEFAULT '{}',
    match_tier         text NOT NULL CHECK (match_tier IN ('standard', 'true')),
    status             text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'applied')),
    generated_at       timestamptz NOT NULL DEFAULT now(),
    generated_by       text NOT NULL DEFAULT 'system',
    dismissed_by       uuid,
    dismissed_at       timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (candidate_id, job_id)
);

-- Indexes for common query patterns
CREATE INDEX idx_candidate_role_matches_candidate ON public.candidate_role_matches (candidate_id);
CREATE INDEX idx_candidate_role_matches_job       ON public.candidate_role_matches (job_id);
CREATE INDEX idx_candidate_role_matches_score     ON public.candidate_role_matches (match_score DESC);
CREATE INDEX idx_candidate_role_matches_tier      ON public.candidate_role_matches (match_tier);
CREATE INDEX idx_candidate_role_matches_status    ON public.candidate_role_matches (status) WHERE status = 'active';

-- Grant access
GRANT ALL ON TABLE public.candidate_role_matches TO anon, authenticated, service_role;
