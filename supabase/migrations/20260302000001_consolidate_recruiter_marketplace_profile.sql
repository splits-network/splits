-- ============================================================
-- Consolidate recruiters.marketplace_profile (JSONB) into
-- discrete columns. Add candidate_recruiter / company_recruiter
-- boolean flags. Fix the DB status constraint to match reality.
-- Candidates table marketplace_profile is NOT touched.
-- ============================================================

-- 1. Add recruiter role type flags
ALTER TABLE public.recruiters
  ADD COLUMN IF NOT EXISTS candidate_recruiter boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_recruiter   boolean NOT NULL DEFAULT false;

-- 2. Migrate bio_rich → bio (prefer richer markdown content)
UPDATE public.recruiters
SET bio = marketplace_profile->>'bio_rich'
WHERE (marketplace_profile->>'bio_rich') IS NOT NULL
  AND trim(marketplace_profile->>'bio_rich') <> '';

-- 3. Drop marketplace_profile from recruiters ONLY
ALTER TABLE public.recruiters DROP COLUMN IF EXISTS marketplace_profile;

-- 4. Expand status CHECK to include 'inactive' (soft-delete state)
ALTER TABLE public.recruiters DROP CONSTRAINT IF EXISTS recruiters_status_check;
ALTER TABLE public.recruiters ADD CONSTRAINT recruiters_status_check
  CHECK (status = ANY (ARRAY['pending','active','suspended','inactive']));
