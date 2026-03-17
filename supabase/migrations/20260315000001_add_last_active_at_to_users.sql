-- Add last_active_at column to users table for persistent "last seen" tracking
-- Populated by: presence pings (throttled) and Clerk session.created webhooks

ALTER TABLE public.users
ADD COLUMN last_active_at TIMESTAMPTZ;

-- Index for sorting candidates by recent activity (NULLs last)
CREATE INDEX idx_users_last_active_at ON public.users (last_active_at DESC NULLS LAST);
