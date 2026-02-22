-- OAuth Connections & Integration Providers
-- Phase 1: Foundation for calendar, email, and third-party integrations

-- ─── Integration Providers ──────────────────────────────────────────────────
-- Static-ish catalog of supported providers. Rows are managed by the platform,
-- not by end users.

CREATE TABLE integration_providers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,           -- 'google_calendar', 'microsoft_calendar', 'google_email', etc.
    name            TEXT NOT NULL,                  -- 'Google Calendar'
    category        TEXT NOT NULL,                  -- 'calendar', 'email', 'ats', 'linkedin'
    icon            TEXT,                           -- FontAwesome class e.g. 'fa-google'
    description     TEXT,
    oauth_auth_url  TEXT,                           -- e.g. 'https://accounts.google.com/o/oauth2/v2/auth'
    oauth_token_url TEXT,                           -- e.g. 'https://oauth2.googleapis.com/token'
    oauth_scopes    TEXT[],                         -- default scopes requested
    is_active       BOOLEAN NOT NULL DEFAULT true,  -- feature flag
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── OAuth Connections ──────────────────────────────────────────────────────
-- One row per user+provider connection.  Stores encrypted tokens.

CREATE TABLE oauth_connections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id       TEXT NOT NULL,
    organization_id     TEXT,                       -- nullable; some integrations are personal
    provider_id         UUID NOT NULL REFERENCES integration_providers(id) ON DELETE CASCADE,
    provider_slug       TEXT NOT NULL,              -- denormalized for fast lookups
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'error')),
    access_token_enc    TEXT,                       -- encrypted at rest
    refresh_token_enc   TEXT,                       -- encrypted at rest
    token_expires_at    TIMESTAMPTZ,
    scopes_granted      TEXT[],                     -- actual scopes user approved
    provider_account_id TEXT,                       -- e.g. Google email, Microsoft UPN
    provider_account_name TEXT,                     -- display name from provider
    metadata            JSONB NOT NULL DEFAULT '{}',-- provider-specific extras
    last_synced_at      TIMESTAMPTZ,
    last_error          TEXT,
    error_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each user can only connect one account per provider
CREATE UNIQUE INDEX uq_oauth_connections_user_provider
    ON oauth_connections (clerk_user_id, provider_slug)
    WHERE status != 'revoked';

-- Fast lookups by user
CREATE INDEX idx_oauth_connections_clerk_user
    ON oauth_connections (clerk_user_id);

-- Fast lookups by org
CREATE INDEX idx_oauth_connections_org
    ON oauth_connections (organization_id)
    WHERE organization_id IS NOT NULL;

-- Token refresh worker needs to find expiring tokens
CREATE INDEX idx_oauth_connections_expiring
    ON oauth_connections (token_expires_at)
    WHERE status = 'active' AND token_expires_at IS NOT NULL;

-- ─── Seed providers ─────────────────────────────────────────────────────────

INSERT INTO integration_providers (slug, name, category, icon, description, oauth_auth_url, oauth_token_url, oauth_scopes, sort_order) VALUES
(
    'google_calendar',
    'Google Calendar',
    'calendar',
    'fa-brands fa-google',
    'Sync interviews and meetings with Google Calendar',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    ARRAY['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    1
),
(
    'microsoft_calendar',
    'Microsoft Outlook',
    'calendar',
    'fa-brands fa-microsoft',
    'Sync interviews and meetings with Outlook Calendar',
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    ARRAY['Calendars.ReadWrite', 'User.Read', 'offline_access'],
    2
),
(
    'google_email',
    'Gmail',
    'email',
    'fa-brands fa-google',
    'Track email conversations with candidates and recruiters',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.send'],
    3
),
(
    'microsoft_email',
    'Microsoft Outlook Mail',
    'email',
    'fa-brands fa-microsoft',
    'Track email conversations with candidates and recruiters',
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    ARRAY['Mail.ReadWrite', 'Mail.Send', 'User.Read', 'offline_access'],
    4
);

-- ─── Updated_at trigger ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_oauth_connections_updated_at
    BEFORE UPDATE ON oauth_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_integration_providers_updated_at
    BEFORE UPDATE ON integration_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Service-role key bypasses RLS. These policies are for defense-in-depth.

ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_providers ENABLE ROW LEVEL SECURITY;

-- Providers are readable by everyone (catalog)
CREATE POLICY "providers_readable" ON integration_providers
    FOR SELECT USING (true);

-- Connections: users can only see their own
CREATE POLICY "connections_own_user" ON oauth_connections
    FOR ALL USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));
