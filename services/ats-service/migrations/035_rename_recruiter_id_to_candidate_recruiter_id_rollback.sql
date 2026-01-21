-- Rollback migration: Rename candidate_recruiter_id back to recruiter_id
-- Rollback for Phase 1 of consolidating application flow

-- Rename candidate_recruiter_id back to recruiter_id
ALTER TABLE public.applications
RENAME COLUMN candidate_recruiter_id TO recruiter_id;

-- Update the comment back to original
COMMENT ON COLUMN public.applications.recruiter_id IS 'Recruiter assigned to represent candidate';