-- Add a combo Google provider that grants both Calendar and Email
-- scopes in a single OAuth flow. Uses category 'combo' so the integrations
-- page can show it under both Calendar and Email tabs.
-- The slug starts with 'google_' so existing CalendarService and EmailService
-- routing (provider_slug.startsWith('google_')) works automatically.

-- First, add 'combo' to the category constraint
ALTER TABLE integration_providers
    DROP CONSTRAINT IF EXISTS integration_providers_category_check;

ALTER TABLE integration_providers
    ADD CONSTRAINT integration_providers_category_check
    CHECK (category IN ('calendar', 'email', 'ats', 'linkedin', 'combo'));

-- Seed the combo provider
INSERT INTO integration_providers (slug, name, category, icon, description, oauth_auth_url, oauth_token_url, oauth_scopes, sort_order)
VALUES (
    'google_combo',
    'Google Calendar & Email',
    'combo',
    'fa-brands fa-google',
    'Calendar sync and email — one connection for everything Google',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    ARRAY[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar.events.owned',
        'https://www.googleapis.com/auth/calendar.events.freebusy',
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
    ],
    0
)
ON CONFLICT (slug) DO NOTHING;
