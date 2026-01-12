-- Denormalize candidate search fields onto recruiter_candidates for fast filtering
-- This avoids inefficient subqueries and cross-table OR conditions

-- Add denormalized search columns
ALTER TABLE public.recruiter_candidates 
ADD COLUMN IF NOT EXISTS candidate_name text,
ADD COLUMN IF NOT EXISTS candidate_email text;

-- Create function to sync candidate data
CREATE OR REPLACE FUNCTION public.sync_recruiter_candidate_search_fields() RETURNS trigger AS $$
BEGIN
  -- When candidate changes, update all recruiter_candidates rows
  UPDATE public.recruiter_candidates
  SET 
    candidate_name = NEW.full_name,
    candidate_email = NEW.email
  WHERE candidate_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on candidates table
DROP TRIGGER IF EXISTS sync_recruiter_candidate_search ON public.candidates;
CREATE TRIGGER sync_recruiter_candidate_search
AFTER INSERT OR UPDATE OF full_name, email ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.sync_recruiter_candidate_search_fields();

-- Populate existing rows
UPDATE public.recruiter_candidates rc
SET 
  candidate_name = c.full_name,
  candidate_email = c.email
FROM public.candidates c
WHERE rc.candidate_id = c.id;

-- Create indexes for fast search
CREATE INDEX IF NOT EXISTS recruiter_candidates_candidate_name_idx 
ON public.recruiter_candidates USING gin(candidate_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS recruiter_candidates_candidate_email_idx 
ON public.recruiter_candidates USING gin(candidate_email gin_trgm_ops);

-- Enable pg_trgm extension for trigram matching (supports ILIKE efficiently)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
