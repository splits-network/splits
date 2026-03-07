-- Add accepted_by_candidate column to applications table
-- Mirrors the existing accepted_by_company column
-- Used when a candidate formally accepts a job offer at the 'offer' stage

ALTER TABLE public.applications
    ADD COLUMN IF NOT EXISTS accepted_by_candidate boolean DEFAULT false;
