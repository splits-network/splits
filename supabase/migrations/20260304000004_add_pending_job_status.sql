-- Add 'pending' to the jobs status check constraint
-- Roles created/edited by recruiters will be set to 'pending' until company approval
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'paused'::text, 'filled'::text, 'closed'::text]));
