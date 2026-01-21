-- Migration: Rename recruiter_id to candidate_recruiter_id in applications table for clarity
-- Phase 1 of consolidating application flow

-- Rename recruiter_id to candidate_recruiter_id for absolute clarity
ALTER TABLE public.applications
RENAME COLUMN recruiter_id TO candidate_recruiter_id;

-- Update the comment to reflect the new purpose
COMMENT ON COLUMN public.applications.candidate_recruiter_id IS 'Recruiter representing the candidate (Closer role) - optional';