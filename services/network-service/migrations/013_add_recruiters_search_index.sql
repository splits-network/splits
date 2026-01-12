-- Migration: Add Full-Text Search for Recruiters
-- Description: Vector-only search with user email fetched inline (no denormalization)
-- Includes same email tokenization fix as candidates (regexp_replace)
-- Follows vector-only pattern from migration 024 (jobs requirements)
-- Created: 2026-01-12

-- ============================================================================
-- Add Search Infrastructure to Recruiters Table
-- ============================================================================

-- Add search_vector column only - no denormalized data columns
ALTER TABLE public.recruiters 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================================================
-- Create Search Vector Builder Function (Vector-Only Pattern)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.build_recruiters_search_vector(
  p_recruiter_id uuid
) RETURNS tsvector AS $$
DECLARE
  v_user_name text;
  v_user_email text;
  v_bio text;
  v_tagline text;
  v_industries text;
  v_specialties text;
  v_location text;
  v_phone text;
BEGIN
  -- Fetch user data inline (no denormalization)
  SELECT u.name, u.email
  INTO v_user_name, v_user_email
  FROM public.users u
  JOIN public.recruiters r ON r.user_id = u.id
  WHERE r.id = p_recruiter_id;
  
  -- Fetch recruiter data
  SELECT 
    bio, 
    tagline, 
    array_to_string(industries, ' '), 
    array_to_string(specialties, ' '), 
    location, 
    phone
  INTO v_bio, v_tagline, v_industries, v_specialties, v_location, v_phone
  FROM public.recruiters
  WHERE id = p_recruiter_id;
  
  RETURN 
    -- Weight A: Name (highest priority - recruiter identity)
    setweight(to_tsvector('english', COALESCE(v_user_name, '')), 'A') ||
    
    -- Weight B: Email, Bio, Tagline (high priority - contact and expertise)
    -- Email: Use 'simple' config with regexp_replace to split on special chars
    -- Enables partial matching (e.g., "test2" finds "bkorous+test2@gmail.com")
    setweight(to_tsvector('simple', COALESCE(regexp_replace(v_user_email, '[@+._-]', ' ', 'g'), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(v_bio, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(v_tagline, '')), 'B') ||
    
    -- Weight C: Industries, Specialties, Location (medium priority)
    setweight(to_tsvector('english', COALESCE(v_industries, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(v_specialties, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(v_location, '')), 'C') ||
    
    -- Weight D: Phone (low priority - use 'simple' with digit extraction)
    setweight(to_tsvector('simple', COALESCE(regexp_replace(v_phone, '[^0-9]', ' ', 'g'), '')), 'D');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Create Function to Sync User Data Changes to Recruiters Search Vector
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_recruiter_user_search_vector() RETURNS trigger AS $$
BEGIN
  -- When user name/email changes, rebuild search vector for all their recruiter profiles
  UPDATE public.recruiters
  SET search_vector = build_recruiters_search_vector(id)
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Trigger to Update Search Vector on Recruiters Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_recruiters_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := build_recruiters_search_vector(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create Triggers
-- ============================================================================

-- Trigger on public.users table to sync name and email changes
DROP TRIGGER IF EXISTS sync_recruiter_user_search_vector ON public.users;
CREATE TRIGGER sync_recruiter_user_search_vector
AFTER INSERT OR UPDATE OF name, email ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_recruiter_user_search_vector();

-- Trigger on recruiters table to rebuild search vector
DROP TRIGGER IF EXISTS update_recruiters_search_vector_trigger ON public.recruiters;
CREATE TRIGGER update_recruiters_search_vector_trigger
BEFORE INSERT OR UPDATE ON public.recruiters
FOR EACH ROW
EXECUTE FUNCTION public.update_recruiters_search_vector();

-- ============================================================================
-- Populate Existing Rows
-- ============================================================================

-- Build search vectors for all existing rows using vector-only function
UPDATE public.recruiters
SET search_vector = build_recruiters_search_vector(id);

-- ============================================================================
-- Create GIN Index for Full-Text Search
-- ============================================================================

CREATE INDEX IF NOT EXISTS recruiters_search_vector_idx 
ON public.recruiters USING GIN(search_vector);

-- ============================================================================
-- Verification Query (for testing)
-- ============================================================================

-- Test search: SELECT r.id, u.name, u.email, ts_rank(r.search_vector, websearch_to_tsquery('english', 'test2')) AS rank
-- FROM recruiters r
-- JOIN public.users u ON r.user_id = u.id
-- WHERE r.search_vector @@ websearch_to_tsquery('english', 'test2')
-- ORDER BY rank DESC;
