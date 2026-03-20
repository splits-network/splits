-- Update marketplace_visibility: rename 'private' to 'limited'
-- Affects candidates table (has CHECK constraint) and recruiters table (no constraint)

-- 1. Drop old CHECK constraint first (it rejects 'limited')
ALTER TABLE public.candidates DROP CONSTRAINT candidates_marketplace_visibility_check;

-- 2. Migrate existing data
UPDATE public.candidates SET marketplace_visibility = 'limited' WHERE marketplace_visibility = 'private';
UPDATE public.recruiters SET marketplace_visibility = 'limited' WHERE marketplace_visibility = 'private';

-- 3. Add new CHECK constraint
ALTER TABLE public.candidates ADD CONSTRAINT candidates_marketplace_visibility_check
  CHECK (marketplace_visibility = ANY (ARRAY['public'::text, 'limited'::text, 'hidden'::text]));

-- 4. Update column comment
COMMENT ON COLUMN public.candidates.marketplace_visibility IS 'Controls candidate visibility to recruiters: public (all), limited (connected only), hidden (none)';
