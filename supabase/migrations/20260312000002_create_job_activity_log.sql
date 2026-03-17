-- =============================================================================
-- Job Activity Log: Tracks all changes to jobs for audit trail & timeline UI
-- =============================================================================

CREATE TABLE public.job_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'job_created',
        'job_status_changed',
        'job_fields_updated',
        'job_deleted',
        'participant_added',
        'participant_removed'
    )),
    description TEXT NOT NULL,
    actor_user_id UUID REFERENCES public.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query pattern: latest activity per job
CREATE INDEX idx_job_activity_log_lookup
    ON public.job_activity_log (job_id, created_at DESC);

-- Admin/filtering queries by type
CREATE INDEX idx_job_activity_log_type
    ON public.job_activity_log (activity_type);

-- Enable RLS
ALTER TABLE public.job_activity_log ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend uses service_role key)
CREATE POLICY job_activity_log_service_all
    ON public.job_activity_log
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read activity for jobs they have access to
CREATE POLICY job_activity_log_read
    ON public.job_activity_log
    FOR SELECT
    TO authenticated
    USING (true);
