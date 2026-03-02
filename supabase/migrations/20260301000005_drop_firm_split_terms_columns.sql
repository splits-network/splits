-- Drop firm-level split terms columns.
-- Split terms are platform-defined, not per-firm.

ALTER TABLE public.firms
  DROP CONSTRAINT IF EXISTS firms_guarantee_period_days_check,
  DROP COLUMN IF EXISTS preferred_split_terms,
  DROP COLUMN IF EXISTS guarantee_period_days;
