-- Expand company profile with new fields and consolidate social links
-- into a flexible JSONB array with custom labels

-- 1. Add new profile columns
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_path TEXT,
  ADD COLUMN IF NOT EXISTS logo_path TEXT,
  ADD COLUMN IF NOT EXISTS mission_statement TEXT,
  ADD COLUMN IF NOT EXISTS benefits_summary TEXT,
  ADD COLUMN IF NOT EXISTS employee_count INTEGER,
  ADD COLUMN IF NOT EXISTS tech_stack TEXT,
  ADD COLUMN IF NOT EXISTS hiring_process TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]';

-- 2. Backfill social_links from existing individual URL columns
UPDATE public.companies
SET social_links = (
  SELECT COALESCE(jsonb_agg(link ORDER BY link->>'url'), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object('url', linkedin_url) AS link
    WHERE linkedin_url IS NOT NULL AND linkedin_url != ''
    UNION ALL
    SELECT jsonb_build_object('url', twitter_url) AS link
    WHERE twitter_url IS NOT NULL AND twitter_url != ''
    UNION ALL
    SELECT jsonb_build_object('url', glassdoor_url) AS link
    WHERE glassdoor_url IS NOT NULL AND glassdoor_url != ''
  ) links
)
WHERE linkedin_url IS NOT NULL AND linkedin_url != ''
   OR twitter_url IS NOT NULL AND twitter_url != ''
   OR glassdoor_url IS NOT NULL AND glassdoor_url != '';

-- 3. Drop the old individual social URL columns
ALTER TABLE public.companies
  DROP COLUMN IF EXISTS linkedin_url,
  DROP COLUMN IF EXISTS twitter_url,
  DROP COLUMN IF EXISTS glassdoor_url;
