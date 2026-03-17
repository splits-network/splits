BEGIN;

-- Recruiters can save/bookmark jobs for quick access
CREATE TABLE IF NOT EXISTS recruiter_saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(recruiter_id, job_id)
);

CREATE INDEX idx_recruiter_saved_jobs_recruiter_id ON recruiter_saved_jobs(recruiter_id);
CREATE INDEX idx_recruiter_saved_jobs_job_id ON recruiter_saved_jobs(job_id);

-- Recruiters can save/bookmark candidates for quick access
CREATE TABLE IF NOT EXISTS recruiter_saved_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE(recruiter_id, candidate_id)
);

CREATE INDEX idx_recruiter_saved_candidates_recruiter_id ON recruiter_saved_candidates(recruiter_id);
CREATE INDEX idx_recruiter_saved_candidates_candidate_id ON recruiter_saved_candidates(candidate_id);

COMMIT;
