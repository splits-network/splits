-- Recruiter activity feed: stores per-recruiter activity events
CREATE TABLE public.recruiter_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'placement_created',
        'placement_completed',
        'company_connected',
        'candidate_connected',
        'invitation_accepted',
        'referral_signup',
        'profile_verified',
        'profile_updated'
    )),
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary query pattern: latest N per recruiter
CREATE INDEX idx_recruiter_activity_lookup
    ON public.recruiter_activity (recruiter_id, created_at DESC);

-- Admin/cleanup queries by type
CREATE INDEX idx_recruiter_activity_type
    ON public.recruiter_activity (activity_type);

-- Enable RLS
ALTER TABLE public.recruiter_activity ENABLE ROW LEVEL SECURITY;

-- Service role full access (backend uses service_role key)
CREATE POLICY recruiter_activity_service_all
    ON public.recruiter_activity
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Authenticated users can read activity (public profile data)
CREATE POLICY recruiter_activity_read
    ON public.recruiter_activity
    FOR SELECT
    TO authenticated
    USING (true);

-- Anon can read activity (public marketplace)
CREATE POLICY recruiter_activity_anon_read
    ON public.recruiter_activity
    FOR SELECT
    TO anon
    USING (true);

-- View: latest 5 per recruiter for Supabase relational select joins
CREATE VIEW public.recruiter_activity_recent AS
SELECT id, recruiter_id, activity_type, description, metadata, created_at
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY recruiter_id ORDER BY created_at DESC) AS rn
    FROM public.recruiter_activity
) sub
WHERE rn <= 5;
