-- Migration: Create GPT OAuth tables
-- Purpose: Database infrastructure for v5.0 Custom GPT OAuth flow
--
-- Tables created:
--   1. gpt_refresh_tokens   - Hashed refresh tokens with rotation chain
--   2. gpt_authorization_codes - PKCE authorization codes with TTL
--   3. gpt_sessions          - Active GPT sessions linked to refresh tokens
--   4. gpt_oauth_events      - Audit log for all OAuth and GPT action events
--
-- Architecture: Backend acts as OAuth provider, Clerk provides identity,
-- ChatGPT is the OAuth client. Opaque tokens stored as SHA-256 hashes.

-- ============================================================================
-- Table 1: gpt_refresh_tokens (created first -- referenced by other tables)
-- ============================================================================
CREATE TABLE public.gpt_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    clerk_user_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    rotated_to UUID DEFAULT NULL REFERENCES public.gpt_refresh_tokens(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary lookup by token hash
CREATE INDEX idx_gpt_refresh_tokens_hash
    ON public.gpt_refresh_tokens (token_hash);

-- Find all tokens for a user
CREATE INDEX idx_gpt_refresh_tokens_clerk_user_id
    ON public.gpt_refresh_tokens (clerk_user_id);

-- Fast lookup for valid active tokens only
CREATE INDEX idx_gpt_refresh_tokens_active
    ON public.gpt_refresh_tokens (token_hash)
    WHERE revoked_at IS NULL AND expires_at > now();

-- ============================================================================
-- Table 2: gpt_authorization_codes
-- ============================================================================
CREATE TABLE public.gpt_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    code_challenge TEXT NOT NULL,
    code_challenge_method TEXT NOT NULL DEFAULT 'S256'
        CHECK (code_challenge_method IN ('S256', 'plain')),
    clerk_user_id TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Primary lookup by authorization code
CREATE INDEX idx_gpt_auth_codes_code
    ON public.gpt_authorization_codes (code);

-- Find codes by user
CREATE INDEX idx_gpt_auth_codes_clerk_user_id
    ON public.gpt_authorization_codes (clerk_user_id);

-- Fast lookup for valid unused codes only
CREATE INDEX idx_gpt_auth_codes_active
    ON public.gpt_authorization_codes (code)
    WHERE used_at IS NULL AND expires_at > now();

-- ============================================================================
-- Table 3: gpt_sessions
-- ============================================================================
CREATE TABLE public.gpt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT NOT NULL,
    refresh_token_id UUID REFERENCES public.gpt_refresh_tokens(id),
    last_active TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Find sessions by user
CREATE INDEX idx_gpt_sessions_clerk_user_id
    ON public.gpt_sessions (clerk_user_id);

-- Find session by refresh token
CREATE INDEX idx_gpt_sessions_refresh_token_id
    ON public.gpt_sessions (refresh_token_id);

-- ============================================================================
-- Table 4: gpt_oauth_events (audit log)
-- ============================================================================
CREATE TABLE public.gpt_oauth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    clerk_user_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Filter by event type
CREATE INDEX idx_gpt_oauth_events_type
    ON public.gpt_oauth_events (event_type);

-- Find events by user
CREATE INDEX idx_gpt_oauth_events_clerk_user_id
    ON public.gpt_oauth_events (clerk_user_id);

-- Time-range queries, recent first
CREATE INDEX idx_gpt_oauth_events_created_at
    ON public.gpt_oauth_events (created_at DESC);

-- Composite: user + event type filtering
CREATE INDEX idx_gpt_oauth_events_user_type
    ON public.gpt_oauth_events (clerk_user_id, event_type);
