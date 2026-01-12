-- Comprehensive full-text search for jobs
-- Enables Google-style multi-word search across job and company fields
-- Migration: 017 - Add jobs search index

-- Add denormalized columns for search
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_industry text,
ADD COLUMN IF NOT EXISTS company_headquarters_location text,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Enable trigram extension for substring matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function to build search vector with weighted fields
CREATE OR REPLACE FUNCTION public.build_jobs_search_vector(
  p_title text,
  p_description text,
  p_recruiter_description text,
  p_candidate_description text,
  p_location text,
  p_company_name text,
  p_company_industry text,
  p_company_headquarters_location text,
  p_employment_type text,
  p_department text,
  p_status text
) RETURNS tsvector AS $$
BEGIN
  RETURN 
    -- Primary job fields (highest weight)
    setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
    
    -- Secondary important fields
    setweight(to_tsvector('english', COALESCE(p_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_recruiter_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_candidate_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_company_name, '')), 'B') ||
    
    -- Supporting fields
    setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_company_industry, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_company_headquarters_location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_employment_type, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_department, '')), 'C') ||
    
    -- Low-priority fields
    setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to sync company data to jobs
CREATE OR REPLACE FUNCTION public.sync_jobs_company_data() RETURNS trigger AS $$
BEGIN
  -- When company changes, update all jobs for that company
  UPDATE public.jobs j
  SET 
    company_name = NEW.name,
    company_industry = NEW.industry,
    company_headquarters_location = NEW.headquarters_location,
    search_vector = build_jobs_search_vector(
      j.title,
      j.description,
      j.recruiter_description,
      j.candidate_description,
      j.location,
      NEW.name,
      NEW.industry,
      NEW.headquarters_location,
      j.employment_type,
      j.department,
      j.status
    )
  WHERE j.company_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector when jobs change
CREATE OR REPLACE FUNCTION public.update_jobs_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := build_jobs_search_vector(
    NEW.title,
    NEW.description,
    NEW.recruiter_description,
    NEW.candidate_description,
    NEW.location,
    NEW.company_name,
    NEW.company_industry,
    NEW.company_headquarters_location,
    NEW.employment_type,
    NEW.department,
    NEW.status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on companies table to sync company data
DROP TRIGGER IF EXISTS sync_jobs_company_data ON public.companies;
CREATE TRIGGER sync_jobs_company_data
AFTER INSERT OR UPDATE OF name, industry, headquarters_location ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.sync_jobs_company_data();

-- Trigger on jobs table to update search vector
DROP TRIGGER IF EXISTS update_jobs_search_vector_trigger ON public.jobs;
CREATE TRIGGER update_jobs_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_jobs_search_vector();

-- Populate existing rows with company data
UPDATE public.jobs j
SET 
  company_name = c.name,
  company_industry = c.industry,
  company_headquarters_location = c.headquarters_location
FROM public.companies c
WHERE j.company_id = c.id;

-- Build search vectors for existing rows
UPDATE public.jobs
SET search_vector = build_jobs_search_vector(
  title,
  description,
  recruiter_description,
  candidate_description,
  location,
  company_name,
  company_industry,
  company_headquarters_location,
  employment_type,
  department,
  status
);

-- Create GIN index for full-text search (scales to millions of rows)
CREATE INDEX IF NOT EXISTS jobs_search_vector_idx 
ON public.jobs USING GIN(search_vector);

-- Create trigram indexes for substring matching as fallback
CREATE INDEX IF NOT EXISTS jobs_title_trgm_idx 
ON public.jobs USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS jobs_company_name_trgm_idx 
ON public.jobs USING gin(company_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS jobs_description_trgm_idx 
ON public.jobs USING gin(description gin_trgm_ops);

-- Performance note: These indexes add approximately 5-10% to table size
-- but provide 10-100x faster full-text search compared to ILIKE queries
