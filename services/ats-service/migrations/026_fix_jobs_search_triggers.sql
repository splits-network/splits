-- Migration: Fix Jobs Search Triggers
-- Description: Update triggers to use new build_jobs_search_vector(uuid) signature
-- Fixes error: function build_jobs_search_vector(text, text, ...) does not exist
-- Migration 024 changed function signature but didn't update triggers
-- Created: 2026-01-12

-- ============================================================================
-- Update Trigger Functions to Use New Signature
-- ============================================================================

-- Update sync function for companies table
CREATE OR REPLACE FUNCTION public.sync_jobs_company_data() RETURNS trigger AS $$
BEGIN
  -- When company changes, rebuild search vector for all jobs at that company
  UPDATE public.jobs j
  SET 
    company_name = NEW.name,
    company_industry = NEW.industry,
    company_headquarters_location = NEW.headquarters_location,
    search_vector = build_jobs_search_vector(
      j.id,  -- job_id for requirements query
      j.title,
      j.description,
      j.recruiter_description,
      j.candidate_description,
      j.location,
      j.department,
      j.employment_type,
      NEW.name,  -- updated company name
      NEW.industry,  -- updated company industry
      NEW.headquarters_location,  -- updated company location
      j.status
    )
  WHERE j.company_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update trigger function for jobs table
-- Note: This was already correctly updated in migration 024, but included here for completeness
CREATE OR REPLACE FUNCTION public.update_jobs_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := build_jobs_search_vector(
    NEW.id,  -- job_id for requirements query
    NEW.title,
    NEW.description,
    NEW.recruiter_description,
    NEW.candidate_description,
    NEW.location,
    NEW.department,
    NEW.employment_type,
    NEW.company_name,
    NEW.company_industry,
    NEW.company_headquarters_location,
    NEW.status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers already exist from migration 017, no need to recreate
-- They will now use the updated trigger functions

-- ============================================================================
-- Note: No need to repopulate existing rows
-- Migration 024 already ran UPDATE to rebuild all search vectors
-- ============================================================================
