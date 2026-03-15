-- Monthly messaging initiation counters for free-tier rate limiting
-- Tracks how many new conversations a user initiates per billing period

CREATE TABLE IF NOT EXISTS public.messaging_initiation_counters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id),
    period_start date NOT NULL,
    period_end date NOT NULL,
    count integer NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, period_start)
);

CREATE INDEX idx_messaging_counters_user_period
    ON public.messaging_initiation_counters (user_id, period_start);
