-- Migration: Add commute_types and job_level columns to jobs table
-- Purpose: Foundation for v4.0 commute type multi-select and job level single-select
--
-- commute_types: TEXT[] array allowing multi-select from 6 valid values
--   remote, hybrid_1 (1 day in office), hybrid_2, hybrid_3, hybrid_4, in_office
--
-- job_level: TEXT single-select from 8 seniority levels
--   entry, mid, senior, lead, manager, director, vp, c_suite
--
-- Both columns default to NULL so existing rows are unaffected.

-- Add commute_types column (multi-select array)
ALTER TABLE public.jobs
  ADD COLUMN commute_types text[] DEFAULT NULL;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_commute_types_check
  CHECK (commute_types <@ ARRAY['remote', 'hybrid_1', 'hybrid_2', 'hybrid_3', 'hybrid_4', 'in_office']::text[]);

-- Add job_level column (single-select)
ALTER TABLE public.jobs
  ADD COLUMN job_level text DEFAULT NULL;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_job_level_check
  CHECK (job_level = ANY (ARRAY['entry'::text, 'mid'::text, 'senior'::text, 'lead'::text, 'manager'::text, 'director'::text, 'vp'::text, 'c_suite'::text]));
