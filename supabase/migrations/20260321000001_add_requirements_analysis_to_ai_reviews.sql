-- Add matched/missing requirements arrays to ai_reviews (mirrors matched_skills/missing_skills pattern)
ALTER TABLE public.ai_reviews
  ADD COLUMN IF NOT EXISTS matched_requirements text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS missing_requirements text[] DEFAULT '{}'::text[];
