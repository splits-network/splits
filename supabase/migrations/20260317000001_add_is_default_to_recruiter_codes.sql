-- Add is_default flag to recruiter_codes
-- Allows recruiters to mark one code as their default for auto-attaching to shared job links.

BEGIN;

ALTER TABLE public.recruiter_codes
    ADD COLUMN is_default boolean NOT NULL DEFAULT false;

-- Ensure at most one default code per recruiter (only among active, non-deleted codes)
CREATE UNIQUE INDEX idx_recruiter_codes_one_default_per_recruiter
    ON public.recruiter_codes (recruiter_id)
    WHERE is_default = true AND deleted_at IS NULL;

COMMIT;