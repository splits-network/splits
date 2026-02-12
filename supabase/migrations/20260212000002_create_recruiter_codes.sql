-- Migration: Create recruiter referral codes system
-- Purpose: Enable recruiters to create shareable referral codes that track
-- and attribute sourcing of new platform users (candidates, companies, recruiters).

-- ============================================================================
-- Step 1: Create recruiter_codes table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recruiter_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id),
    code VARCHAR(10) NOT NULL UNIQUE,
    label VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recruiter_codes_recruiter_id
    ON public.recruiter_codes(recruiter_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_recruiter_codes_code
    ON public.recruiter_codes(code);

CREATE INDEX IF NOT EXISTS idx_recruiter_codes_status
    ON public.recruiter_codes(status)
    WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_recruiter_codes_updated_at
    BEFORE UPDATE ON public.recruiter_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE public.recruiter_codes IS 'Recruiter referral codes for tracking sourcing attribution of new platform signups';
COMMENT ON COLUMN public.recruiter_codes.code IS 'Unique 8-character alphanumeric code used in URL: ?rec_code=xxx';
COMMENT ON COLUMN public.recruiter_codes.label IS 'Optional campaign label for tracking (e.g., LinkedIn Q1 2026)';
COMMENT ON COLUMN public.recruiter_codes.status IS 'active or inactive - inactive codes cannot be used for new signups';

-- ============================================================================
-- Step 2: Create recruiter_codes_log table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recruiter_codes_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recruiter_code_id UUID NOT NULL REFERENCES public.recruiter_codes(id),
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id),
    user_id UUID NOT NULL REFERENCES public.users(id),
    signup_type VARCHAR(20),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recruiter_codes_log_code_id
    ON public.recruiter_codes_log(recruiter_code_id);

CREATE INDEX IF NOT EXISTS idx_recruiter_codes_log_recruiter_id
    ON public.recruiter_codes_log(recruiter_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_recruiter_codes_log_user_id
    ON public.recruiter_codes_log(user_id);

-- Comments
COMMENT ON TABLE public.recruiter_codes_log IS 'Tracks each usage of a recruiter referral code during signup';
COMMENT ON COLUMN public.recruiter_codes_log.recruiter_id IS 'Denormalized from recruiter_codes for query convenience';
COMMENT ON COLUMN public.recruiter_codes_log.signup_type IS 'Role chosen during onboarding: recruiter, company, or candidate. NULL until onboarding completes.';

-- ============================================================================
-- Step 3: Add referred_by_recruiter_id to users table
-- ============================================================================
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS referred_by_recruiter_id UUID REFERENCES public.recruiters(id);

CREATE INDEX IF NOT EXISTS idx_users_referred_by_recruiter_id
    ON public.users(referred_by_recruiter_id)
    WHERE referred_by_recruiter_id IS NOT NULL;

COMMENT ON COLUMN public.users.referred_by_recruiter_id IS 'Recruiter who referred this user via rec_code. Set at signup, used during onboarding to create sourcer relationships.';
