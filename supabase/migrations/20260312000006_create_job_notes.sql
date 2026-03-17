-- =============================================================================
-- Job Notes: Per-job notes with visibility control (mirrors application_notes)
-- =============================================================================

CREATE TABLE public.job_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_by_user_id UUID NOT NULL REFERENCES public.users(id),
    created_by_type TEXT NOT NULL CHECK (created_by_type IN (
        'company_recruiter', 'hiring_manager', 'company_admin', 'platform_admin'
    )),
    note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN (
        'general', 'note', 'info_request', 'info_response', 'improvement_request'
    )),
    visibility TEXT NOT NULL DEFAULT 'company_only' CHECK (visibility IN (
        'shared', 'company_only'
    )),
    message_text TEXT NOT NULL,
    in_response_to_id UUID REFERENCES public.job_notes(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query: notes for a job, newest first
CREATE INDEX idx_job_notes_job ON public.job_notes (job_id, created_at DESC);

-- Lookup by creator
CREATE INDEX idx_job_notes_created_by ON public.job_notes (created_by_user_id);

-- Threading
CREATE INDEX idx_job_notes_thread ON public.job_notes (in_response_to_id)
    WHERE in_response_to_id IS NOT NULL;

-- Visibility-scoped queries
CREATE INDEX idx_job_notes_visibility ON public.job_notes (job_id, visibility, created_at DESC);

-- Auto-update timestamp
CREATE TRIGGER set_job_notes_updated_at
    BEFORE UPDATE ON public.job_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE public.job_notes ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend uses service_role key)
CREATE POLICY job_notes_service_all
    ON public.job_notes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read notes (visibility filtering done in service layer)
CREATE POLICY job_notes_read
    ON public.job_notes
    FOR SELECT
    TO authenticated
    USING (true);
