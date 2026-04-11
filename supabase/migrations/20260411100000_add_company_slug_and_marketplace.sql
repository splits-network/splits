-- Add slug and marketplace visibility columns to companies
-- for public company directory in candidate app

-- 1. Add new columns
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS marketplace_visible BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketplace_approved_at TIMESTAMPTZ;

-- 2. Backfill slugs from company name
UPDATE public.companies c
SET slug = sub.generated_slug
FROM (
  SELECT
    c2.id,
    lower(regexp_replace(
      regexp_replace(c2.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )) AS generated_slug
  FROM public.companies c2
  WHERE c2.slug IS NULL AND c2.name IS NOT NULL
) sub
WHERE c.id = sub.id;

-- 3. De-duplicate slugs by appending -2, -3, etc.
DO $$
DECLARE
  rec RECORD;
  base_slug TEXT;
  counter INT;
  new_slug TEXT;
BEGIN
  FOR rec IN
    SELECT id, slug
    FROM public.companies
    WHERE slug IN (
      SELECT slug FROM public.companies
      WHERE slug IS NOT NULL
      GROUP BY slug HAVING count(*) > 1
    )
    ORDER BY created_at ASC
  LOOP
    -- Skip the first occurrence (keep its slug)
    IF NOT EXISTS (
      SELECT 1 FROM public.companies
      WHERE slug = rec.slug AND id <> rec.id AND created_at < (
        SELECT created_at FROM public.companies WHERE id = rec.id
      )
    ) THEN
      CONTINUE;
    END IF;

    base_slug := rec.slug;
    counter := 2;
    LOOP
      new_slug := base_slug || '-' || counter;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.companies WHERE slug = new_slug
      );
      counter := counter + 1;
    END LOOP;

    UPDATE public.companies SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- 4. Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug
  ON public.companies (slug) WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_companies_marketplace
  ON public.companies (marketplace_visible, status)
  WHERE marketplace_visible = true AND status = 'active';

-- 5. Auto-enable marketplace for active companies with at least one active job
UPDATE public.companies
SET marketplace_visible = true,
    marketplace_approved_at = now()
WHERE status = 'active'
  AND id IN (
    SELECT DISTINCT company_id FROM public.jobs WHERE status = 'active'
  );
