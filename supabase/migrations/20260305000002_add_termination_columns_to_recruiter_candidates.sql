-- Add missing termination columns to recruiter_candidates
ALTER TABLE public.recruiter_candidates
  ADD COLUMN IF NOT EXISTS terminated_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS termination_reason text;
