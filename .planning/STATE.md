# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Candidates interact with Applicant.Network via natural language through a Custom GPT
**Current focus:** v5.0 Custom GPT -- Phase 15 (Production Hardening)

## Current Position

Phase: 15 of 15 (Production Hardening)
Plan: 2 of 2 (all plans complete)
Status: Phase complete -- v5.0 complete
Last activity: 2026-02-13 -- Completed 15-01-PLAN.md (GPT Service Production Hardening)

Progress: [██████████] 100% (17/17 v5.0 plans)

## Performance Metrics

**Velocity (v2.0):**
- Total plans completed: 7
- Average duration: 4.4 min
- Total execution time: ~31 minutes

**Velocity (v3.0):**
- Total plans completed: 6
- Average duration: 3.2 min
- Total execution time: ~19 minutes

**Velocity (v4.0):**
- Total plans completed: 5
- Average duration: 2.7 min
- Total execution time: ~13.5 minutes

**Velocity (v5.0):**
- Total plans completed: 17
- Average duration: 3.1 min
- Total execution time: ~54 minutes

**Cumulative:**
- Total plans completed: 35
- Average duration: 3.3 min
- Total execution time: ~118 minutes

## Accumulated Context

### Decisions

- Backend as OAuth provider for GPT (Clerk = identity, backend = OAuth provider, GPT = OAuth client)
- New gpt-service microservice (nano-service philosophy)
- Applicant.Network features first (candidate-facing)
- Confirmation safety pattern for all write actions
- Opaque tokens over JWTs (instant revocation, DB lookup fast enough at GPT scale)
- Used registerHealthCheck + HealthCheckers from shared-fastify for gpt-service (standardized health check pattern)
- gpt-service scaffold: no Swagger/Sentry -- minimal for Phase 11, add as needed later
- Nack without requeue (requeue: false) on audit consumer failures to prevent poison message loops
- Bind gpt.oauth.# and gpt.action.# routing keys upfront for future extensibility
- ES256 asymmetric signing replaces symmetric jwtSecret (Phase 12)
- Access token TTL reduced to 15 min (900s) for tighter security (Phase 12)
- Auth code TTL reduced to 5 min (300s) per OAuth best practices (Phase 12)
- /api/v1/gpt/* prefix for OAuth routes to distinguish from Clerk-authenticated v2 routes (Phase 12)
- Forward Authorization and x-gpt-clerk-user-id headers for token validation and Connected Apps (Phase 12)
- ChatGPT origins merged with CORS_ORIGIN for production flexibility (Phase 12)
- jose library for ES256 JWT signing over jsonwebtoken (ESM-compatible, native ES256 support) (Phase 12-02)
- Token prefixes (gpt_at_, gpt_rt_) for operational visibility in logs (Phase 12-02)
- Replay detection revokes ALL user sessions on rotated token usage (security-first approach) (Phase 12-02)
- Dual-auth pattern: GPT Bearer tokens OR x-gpt-clerk-user-id header for sessions/revoke endpoints (Phase 12-04)
- KeyLike type from jose instead of CryptoKey for cross-platform ES256 key handling (Phase 12-04)
- Authorize endpoint returns JSON (not 302 redirect) because consent page uses fetch() (Phase 12-05)
- Direct Clerk webhook endpoint in gpt-service for user.deleted events (Phase 12-06)
- Deferred webhook signature verification to Phase 15 (Phase 12-06)
- In-memory confirmation token store (15-minute expiry, crypto.randomUUID with gpt_confirm_ prefix) (Phase 13-01)
- Hardcoded 5 results per page for job search (keeps GPT responses concise) (Phase 13-01)
- Active application stages filter by default (9 active stages vs 2 inactive) (Phase 13-01)
- Salary range formatting: $XXk-$XXk, $XXk+, Up to $XXk, or null (Phase 13-01)
- Return 200 with empty array for job search with no results (not 404) (Phase 13-02)
- UUID regex validation for job ID parameter (Phase 13-02)
- Include company data in job detail response for GPT context (Phase 13-02)
- 10 applications per page vs 5 jobs per page (different pagination limits) (Phase 13-02)
- Two-step confirmation prevents accidental AI-driven submissions (Phase 13-03)
- Required pre-screen questions block submission until answered (Phase 13-03)
- Duplicate check includes original application date in error message (Phase 13-03)
- Confirmation token validated for user ownership (security) (Phase 13-03)
- Event publishing failures logged but don't fail request (Phase 13-03)
- Resume text priority: GPT-provided > stored resume > error (enables chat-based resume upload) (Phase 13-04)
- Use concerns field from ai-service as gaps (more descriptive than missing_skills) (Phase 13-04)
- Synthetic application_id with timestamp for GPT analysis tracking (Phase 13-04)
- ai-service URL defaults to port 3009 (http://ai-service:3009) (Phase 13-04)
- OpenAPI 3.0.1 (not 3.1) for GPT Builder compatibility (Phase 14-01)
- Static hand-crafted schema with rich behavioral descriptions (not auto-generated) (Phase 14-01)
- x-openai-isConsequential: true on submitApplication, false on analyzeResume (Phase 14-01)
- Public schema endpoints (no auth) for GPT Builder import (Phase 14-01)
- Load schema at module initialization for performance (Phase 14-01)
- GPT Instructions structured as 13 sections covering identity, all action flows, error handling, privacy, formatting, boundaries, guided workflows, and examples (Phase 14-02)
- Four example conversation snippets demonstrate job search, application submission with two-step confirmation, resume analysis, and application status (Phase 14-02)
- Applicant Network branding exclusively in GPT (no Splits Network mentions) (Phase 14-02)
- No emoji in GPT responses for professional and clean formatting (Phase 14-02)
- Empathy-first error handling pattern: acknowledge -> explain briefly -> offer solution (Phase 14-02)
- Pre-screen questions presented one at a time conversationally (not all at once) (Phase 14-02)
- Prompt injection defense with explicit stay-in-role instructions (Phase 14-02)
- Route-level @fastify/rate-limit config overrides for tiered GPT rate limiting (Phase 15-02)
- Bearer token suffix keying for per-user rate limit buckets with gpt-read:/gpt-write: prefixes (Phase 15-02)
- 2 replicas safe for gpt-service (audit consumer uses exclusive queues) (Phase 15-01)
- 30-day retention for expired OAuth artifacts before token cleanup (Phase 15-01)
- Skip webhook signature verification in dev when CLERK_WEBHOOK_SECRET not configured (Phase 15-01)
- gpt_oauth_events kept indefinitely, not cleaned up by CronJob (Phase 15-01)
- OAuth endpoints classified as read tier (30/min) since not computationally expensive (Phase 15-02)

### Pending Todos

None.

### Blockers/Concerns

**From v2.0:**
- User must run migration `20260214000001_search_index_company_access_control.sql` in Supabase and rebuild search-service Docker container for v2.0 access control to take effect.

**From v3.0:**
- User should run `supabase gen types typescript` to regenerate database.types.ts after applying Phase 4 migration.

**From v4.0:**
- User must apply migration `20260217000001_add_commute_types_and_job_level.sql` and run `supabase gen types typescript` to regenerate database.types.ts.
- User must apply migration `20260218000001_search_index_add_commute_and_level.sql` to update search index triggers.

**From v5.0 (Phase 11):**
- User must apply migration `20260220000001_create_gpt_oauth_tables.sql` and run `supabase gen types typescript` to regenerate database.types.ts.

**From v5.0 (Phase 12):**
- User must apply migration `20260221000001_add_scopes_to_gpt_oauth_tables.sql` and run `supabase gen types typescript` to regenerate database.types.ts.
- User must add `GPT_EC_PRIVATE_KEY` environment variable (base64-encoded EC private key PEM) for ES256 JWT signing.
- User must configure GPT Builder with OAuth URLs and add `GPT_REDIRECT_URI` from OpenAI.
- User must add GitHub environment secrets: GPT_CLIENT_ID, GPT_CLIENT_SECRET, GPT_EC_PRIVATE_KEY, GPT_REDIRECT_URI.

**From v5.0 (Phase 14):**
- User must manually configure GPT Builder (platform.openai.com/gpts) with Instructions, OAuth, and Actions (see 14-02-SUMMARY.md for full setup steps).
- User must provide profile picture for GPT.
- User must configure privacy policy URL.
- GPT_REDIRECT_URI catch-22: Need to create GPT to get redirect URI, but need redirect URI to configure OAuth (resolve by creating GPT first, getting redirect URI, then updating environment).

**From v5.0 (Phase 15):**
- User must create a NEW Clerk webhook endpoint in Clerk Dashboard (separate from identity-service webhook).
  - URL: `https://<api-domain>/api/v1/gpt/webhooks/clerk`
  - Events: `user.deleted` only
  - Copy the signing secret (`whsec_...`) → add as `CLERK_WEBHOOK_SECRET` GitHub environment secret.

**v5.0 Research Flags:**
- Phase 14 (OpenAPI): MEDIUM priority -- verify x-openai-isConsequential behavior, OpenAPI 3.0 vs 3.1 support, action count limits.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed Phase 15 (Production Hardening) -- all plans complete
Resume file: None
Next: v5.0 Custom GPT complete -- all 17 plans across 5 phases executed

---
*Created: 2026-02-12*
*Last updated: 2026-02-13 (Phase 15 complete, v5.0 complete)*
