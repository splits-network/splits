-- Migration: Fix candidates email search to support partial matching
-- Problem: to_tsvector('english', email) treats "test2@gmail.com" as one token
-- Solution: Use 'simple' config for email which treats each word part as separate token

-- Drop existing function
DROP FUNCTION IF EXISTS public.build_candidates_search_vector(text, text, text, text, text, text, text, text, text, text, text, text);

-- Recreate function with special character replacement for email/phone/URLs
CREATE OR REPLACE FUNCTION public.build_candidates_search_vector(
    p_full_name text,
    p_email text,
    p_current_title text,
    p_current_company text,
    p_skills text,
    p_bio text,
    p_location text,
    p_phone text,
    p_desired_job_type text,
    p_linkedin_url text,
    p_github_url text,
    p_portfolio_url text
)
RETURNS tsvector
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_full_name, '')), 'A') ||
        -- Replace special chars in email with spaces so "test2" can match "bkorous+test2@gmail.com"
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_email, '[@+._-]', ' ', 'g'), '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_title, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_current_company, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_skills, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_bio, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(p_location, '')), 'C') ||
        -- Replace special chars in phone for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_phone, '[^0-9]', ' ', 'g'), '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(p_desired_job_type, '')), 'C') ||
        -- Replace special chars in URLs for partial matching
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_linkedin_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_github_url, '[/:._-]', ' ', 'g'), '')), 'D') ||
        setweight(to_tsvector('simple', COALESCE(regexp_replace(p_portfolio_url, '[/:._-]', ' ', 'g'), '')), 'D');
END;
$$;

-- Update all existing candidates to rebuild search vectors
UPDATE public.candidates
SET search_vector = build_candidates_search_vector(
    full_name,
    email,
    current_title,
    current_company,
    skills,
    bio,
    location,
    phone,
    desired_job_type,
    linkedin_url,
    github_url,
    portfolio_url
)
WHERE search_vector IS NULL OR email IS NOT NULL;

-- Create GIN index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_candidates_search_vector ON public.candidates USING gin(search_vector);
