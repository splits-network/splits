-- Add start_date to applications so recruiters can record the expected
-- start date when extending an offer.  The value is later copied to the
-- placement record at hire time.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS start_date date;

COMMENT ON COLUMN public.applications.start_date
  IS 'Expected start date set when an offer is extended';
