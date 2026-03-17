-- Migration: Add scopes columns to GPT OAuth tables
-- Purpose: Phase 12 OAuth2 Provider - Add scope support for granular permissions
--
-- Changes:
--   1. gpt_authorization_codes.scopes    - Scopes requested in authorization
--   2. gpt_sessions.scopes               - Currently active scopes for session
--   3. gpt_sessions.granted_scopes       - Cumulative record of all scopes ever granted
--
-- All columns use TEXT[] (Postgres array) with NOT NULL DEFAULT '{}' constraint.
-- Scope validation is handled in application code (no CHECK constraints).

-- ============================================================================
-- 1. Add scopes column to gpt_authorization_codes
-- ============================================================================
ALTER TABLE public.gpt_authorization_codes
    ADD COLUMN scopes TEXT[] NOT NULL DEFAULT '{}';

-- ============================================================================
-- 2. Add scopes and granted_scopes columns to gpt_sessions
-- ============================================================================
ALTER TABLE public.gpt_sessions
    ADD COLUMN scopes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.gpt_sessions
    ADD COLUMN granted_scopes TEXT[] NOT NULL DEFAULT '{}';
