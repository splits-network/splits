-- Expand job status enum to include draft, early, and priority
-- Add activates_at for early→active auto-transition
-- Add closes_at for auto-close on expiry date

-- 1. Expand the status check constraint to all 8 values
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status = ANY (ARRAY[
    'draft'::text,
    'pending'::text,
    'early'::text,
    'active'::text,
    'priority'::text,
    'paused'::text,
    'filled'::text,
    'closed'::text
  ]));

-- 2. Add activates_at: scheduled date for early→active promotion
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS activates_at timestamptz NULL;

-- 3. Add closes_at: scheduled date for auto-close
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS closes_at timestamptz NULL;

-- 4. Partial index for the early→active promotion sweep
CREATE INDEX IF NOT EXISTS idx_jobs_activates_at
  ON public.jobs (activates_at)
  WHERE status = 'early' AND activates_at IS NOT NULL;

-- 5. Partial index for the auto-close sweep
CREATE INDEX IF NOT EXISTS idx_jobs_closes_at
  ON public.jobs (closes_at)
  WHERE status IN ('early', 'active', 'priority') AND closes_at IS NOT NULL;
