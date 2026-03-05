-- Add expiry and usage limit fields to recruiter_codes
-- expiry_date:     optional date after which code is invalid for new signups
-- max_uses:        optional hard cap on total signups via this code
-- uses_remaining:  managed countdown; NULL means unlimited

ALTER TABLE public.recruiter_codes
    ADD COLUMN IF NOT EXISTS expiry_date    TIMESTAMPTZ  NULL,
    ADD COLUMN IF NOT EXISTS max_uses       INTEGER      NULL CHECK (max_uses > 0),
    ADD COLUMN IF NOT EXISTS uses_remaining INTEGER      NULL CHECK (uses_remaining >= 0);
