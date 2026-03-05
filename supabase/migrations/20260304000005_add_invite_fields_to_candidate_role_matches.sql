-- Add invite tracking fields to candidate_role_matches
-- Supports the "Invite to Apply" feature where company users can express interest in matched candidates

ALTER TABLE public.candidate_role_matches
    ADD COLUMN invited_by uuid,
    ADD COLUMN invited_at timestamptz,
    ADD COLUMN invite_status text CHECK (invite_status IN ('sent', 'denied', 'applied'));

-- Index for querying matches by invite status
CREATE INDEX idx_candidate_role_matches_invite_status
    ON public.candidate_role_matches (invite_status)
    WHERE invite_status IS NOT NULL;
