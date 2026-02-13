# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Candidates interact with Applicant.Network via natural language through a Custom GPT
**Current focus:** v5.0 Custom GPT -- Phase 12 (OAuth2 Provider)

## Current Position

Phase: 12 of 15 (OAuth2 Provider)
Plan: 01 of TBD in progress
Status: In progress
Last activity: 2026-02-13 -- Completed 12-01-PLAN.md (Schema & Config Foundation)

Progress: [███░░░░░░░] ~27% (4/~15 v5.0 plans)

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
- Total plans completed: 4
- Average duration: 2.5 min
- Total execution time: ~10 minutes

**Cumulative:**
- Total plans completed: 22
- Average duration: 3.3 min
- Total execution time: ~73.5 minutes

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

**v5.0 Research Flags:**
- Phase 12 (OAuth): HIGH priority -- must validate Clerk redirect mechanism, OpenAI callback URL format, PKCE requirement, and token_exchange_method before writing production code.
- Phase 14 (OpenAPI): MEDIUM priority -- verify x-openai-isConsequential behavior, OpenAPI 3.0 vs 3.1 support, action count limits.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 12-01-PLAN.md (Schema & Config Foundation)
Resume file: None
Next: 12-02 (OAuth endpoints)

---
*Created: 2026-02-12*
*Last updated: 2026-02-13 (12-01 schema & config foundation complete)*
