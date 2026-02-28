BEGIN;

CREATE TABLE IF NOT EXISTS candidate_saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Ensure a candidate can only save a specific job once
    UNIQUE(candidate_id, job_id)
);

-- Recommended standard indexes for FKs
CREATE INDEX idx_candidate_saved_jobs_candidate_id ON candidate_saved_jobs(candidate_id);
CREATE INDEX idx_candidate_saved_jobs_job_id ON candidate_saved_jobs(job_id);

COMMIT;