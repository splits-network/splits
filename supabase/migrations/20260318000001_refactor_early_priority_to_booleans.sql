-- Refactor: Move early/priority from job status values to boolean toggle columns
-- These are visibility modifiers, not lifecycle stages

-- 1. Add boolean columns
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_early_access boolean NOT NULL DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS is_priority boolean NOT NULL DEFAULT false;

-- 2. Migrate existing data
UPDATE public.jobs SET is_early_access = true, status = 'active' WHERE status = 'early';
UPDATE public.jobs SET is_priority = true, status = 'active' WHERE status = 'priority';

-- 3. Update status constraint (remove early/priority)
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status = ANY(ARRAY[
    'draft'::text,
    'pending'::text,
    'active'::text,
    'paused'::text,
    'filled'::text,
    'closed'::text
  ]));

-- 4. Replace indexes
DROP INDEX IF EXISTS idx_jobs_activates_at;
CREATE INDEX idx_jobs_early_access_activates ON public.jobs (activates_at)
  WHERE is_early_access = true AND activates_at IS NOT NULL;

DROP INDEX IF EXISTS idx_jobs_closes_at;
CREATE INDEX idx_jobs_closes_at ON public.jobs (closes_at)
  WHERE status = 'active' AND closes_at IS NOT NULL;

CREATE INDEX idx_jobs_early_access ON public.jobs (is_early_access)
  WHERE is_early_access = true;

CREATE INDEX idx_jobs_priority ON public.jobs (is_priority)
  WHERE is_priority = true;
