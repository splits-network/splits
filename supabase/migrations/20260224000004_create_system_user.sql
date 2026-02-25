-- Create a dedicated system user for automated operations (billing, cron jobs, escrow releases).
-- Uses a well-known UUID so it can be referenced reliably across services via SYSTEM_USER_ID env var.

INSERT INTO public.users (
    id,
    clerk_user_id,
    name,
    email,
    onboarding_status,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_automated',
    'System',
    'system@splits.network',
    'completed',
    now(),
    now()
) ON CONFLICT (id) DO NOTHING;
