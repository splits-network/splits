-- Backfill slugs for recruiters that were created without one
-- (e.g., onboarding flow didn't pass name, so slug was never generated)

-- Step 1: Generate base slugs from user names
UPDATE public.recruiters r
SET slug = sub.generated_slug
FROM (
  SELECT
    r2.id,
    lower(regexp_replace(
      regexp_replace(
        regexp_replace(u.name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'),
      '-+', '-', 'g'
    )) AS generated_slug
  FROM public.recruiters r2
  JOIN public.users u ON u.id = r2.user_id
  WHERE r2.slug IS NULL AND u.name IS NOT NULL AND u.name <> ''
) sub
WHERE r.id = sub.id;

-- Step 2: De-duplicate any collisions with existing slugs
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  counter INT;
  new_slug TEXT;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM public.recruiters
    WHERE slug IS NOT NULL
      AND slug IN (
        SELECT slug FROM public.recruiters
        WHERE slug IS NOT NULL
        GROUP BY slug HAVING count(*) > 1
      )
    ORDER BY created_at ASC
  LOOP
    -- Keep the earliest recruiter's slug, rename duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.recruiters
      WHERE slug = rec.slug AND id <> rec.id AND created_at < (
        SELECT created_at FROM public.recruiters WHERE id = rec.id
      )
    ) THEN
      CONTINUE;
    END IF;

    base_slug := rec.slug;
    counter := 2;
    LOOP
      new_slug := base_slug || '-' || counter;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.recruiters WHERE slug = new_slug
      );
      counter := counter + 1;
    END LOOP;

    UPDATE public.recruiters SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;
