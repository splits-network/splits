-- Comprehensive full-text search for recruiter-candidates
-- Enables Google-style multi-word search across all relevant fields

-- Add denormalized columns for search
ALTER TABLE public.recruiter_candidates 
ADD COLUMN IF NOT EXISTS candidate_name text,
ADD COLUMN IF NOT EXISTS candidate_email text,
ADD COLUMN IF NOT EXISTS candidate_location text,
ADD COLUMN IF NOT EXISTS candidate_linkedin_url text,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Enable trigram extension for substring matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function to build search vector
CREATE OR REPLACE FUNCTION public.build_recruiter_candidate_search_vector(
  p_candidate_name text,
  p_candidate_email text,
  p_candidate_location text,
  p_status text
) RETURNS tsvector AS $$
BEGIN
  RETURN 
    setweight(to_tsvector('english', COALESCE(p_candidate_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(p_candidate_email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(p_candidate_location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(p_status, '')), 'D');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to sync candidate data to recruiter_candidates
CREATE OR REPLACE FUNCTION public.sync_recruiter_candidate_search_fields() RETURNS trigger AS $$
BEGIN
  -- When candidate changes, update all recruiter_candidates rows
  UPDATE public.recruiter_candidates rc
  SET 
    candidate_name = NEW.full_name,
    candidate_email = NEW.email,
    candidate_location = NEW.location,
    candidate_linkedin_url = NEW.linkedin_url,
    search_vector = build_recruiter_candidate_search_vector(
      NEW.full_name,
      NEW.email,
      NEW.location,
      rc.status
    )
  WHERE rc.candidate_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search fields when recruiter_candidates changes
CREATE OR REPLACE FUNCTION public.update_recruiter_candidate_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := build_recruiter_candidate_search_vector(
    NEW.candidate_name,
    NEW.candidate_email,
    NEW.candidate_location,
    NEW.status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on candidates table
DROP TRIGGER IF EXISTS sync_recruiter_candidate_search ON public.candidates;
CREATE TRIGGER sync_recruiter_candidate_search
AFTER INSERT OR UPDATE OF full_name, email, location, linkedin_url ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.sync_recruiter_candidate_search_fields();

-- Trigger on recruiter_candidates table
DROP TRIGGER IF EXISTS update_search_vector_trigger ON public.recruiter_candidates;
CREATE TRIGGER update_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.recruiter_candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_recruiter_candidate_search_vector();

-- Populate existing rows with candidate data
UPDATE public.recruiter_candidates rc
SET 
  candidate_name = c.full_name,
  candidate_email = c.email,
  candidate_location = c.location,
  candidate_linkedin_url = c.linkedin_url
FROM public.candidates c
WHERE rc.candidate_id = c.id;

-- Build search vectors for existing rows
UPDATE public.recruiter_candidates
SET search_vector = build_recruiter_candidate_search_vector(
  candidate_name,
  candidate_email,
  candidate_location,
  status
);

-- Create GIN index for full-text search (scales to millions of rows)
CREATE INDEX IF NOT EXISTS recruiter_candidates_search_vector_idx 
ON public.recruiter_candidates USING GIN(search_vector);

-- Create trigram indexes for substring matching as fallback
CREATE INDEX IF NOT EXISTS recruiter_candidates_candidate_name_trgm_idx 
ON public.recruiter_candidates USING gin(candidate_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS recruiter_candidates_candidate_email_trgm_idx 
ON public.recruiter_candidates USING gin(candidate_email gin_trgm_ops);
