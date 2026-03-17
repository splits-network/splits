-- Add slug column to organizations for human-readable URLs
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Backfill slugs from organization name
UPDATE public.organizations
SET slug = lower(regexp_replace(
  regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE slug IS NULL AND name IS NOT NULL;

-- De-duplicate slugs by appending -2, -3, etc.
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  counter INT;
  new_slug TEXT;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM public.organizations
    WHERE slug IN (
      SELECT slug FROM public.organizations
      WHERE slug IS NOT NULL
      GROUP BY slug HAVING count(*) > 1
    )
    ORDER BY created_at ASC
  LOOP
    -- Skip the first occurrence (keep its slug)
    IF NOT EXISTS (
      SELECT 1 FROM public.organizations
      WHERE slug = rec.slug AND id <> rec.id AND created_at < (
        SELECT created_at FROM public.organizations WHERE id = rec.id
      )
    ) THEN
      CONTINUE;
    END IF;

    base_slug := rec.slug;
    counter := 2;
    LOOP
      new_slug := base_slug || '-' || counter;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.organizations WHERE slug = new_slug
      );
      counter := counter + 1;
    END LOOP;

    UPDATE public.organizations SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- Create unique partial index after all slugs are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug
  ON public.organizations (slug) WHERE slug IS NOT NULL;
