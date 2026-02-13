# Phase 11: Service Foundation - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

gpt-service microservice exists with database tables and configuration, ready for OAuth and endpoint development. Service starts, passes health check, responds on its configured port. All GPT database tables exist with correct schemas. Environment variables for GPT OAuth are loaded and validated on startup.

</domain>

<decisions>
## Implementation Decisions

### OAuth client model
- Client credentials stored in environment variables (GPT_CLIENT_ID, GPT_CLIENT_SECRET) -- no oauth_clients DB table for v1
- Strict redirect_uri validation: store expected redirect_uri in env var, reject any request that doesn't match
- Always candidate scope: ignore any scope parameter from ChatGPT, every GPT token is candidate-scoped
- Require PKCE (Proof Key for Code Exchange) on authorization code flow: store code_challenge/code_challenge_method on authorization codes table

### Database table scope
- 4 tables in Phase 11:
  - **gpt_authorization_codes**: code, code_challenge, code_challenge_method, clerk_user_id, redirect_uri, expires_at, used_at
  - **gpt_refresh_tokens**: token_hash (SHA-256), clerk_user_id, expires_at, revoked_at, rotated_to
  - **gpt_sessions**: clerk_user_id, last_active, created_at, refresh_token_id
  - **gpt_oauth_events**: event_type, clerk_user_id, metadata (JSONB), ip_address, created_at
- Full audit logging: both auth events (authorize, token_exchange, token_refresh, token_revoke) AND action events (job_search, resume_analyze, etc.)
- TTL columns (expires_at) on authorization codes and refresh tokens now; actual cleanup job deferred to Phase 15
- All indexes upfront: lookup columns (code, token_hash, clerk_user_id), composite indexes, partial indexes for active-only queries, event timestamp indexes

### Service scaffold template
- Use ats-service as the scaffold template (most feature-complete V2 pattern)
- Hybrid code structure: V2 repository/service/routes pattern for OAuth domain (has real DB tables), flat handler structure for proxy endpoints (job search, app status, etc. that call existing services)
- Same Supabase client pattern (@supabase/supabase-js with service_role key) as all other services
- RabbitMQ event publishing for audit events: gpt-service publishes gpt.oauth.* events via EventPublisher, a consumer writes to gpt_oauth_events table -- end-to-end event flow, not direct DB writes from gpt-service

### Claude's Discretion
- Exact column types and constraints (within the table structures above)
- Index naming conventions
- Health check endpoint implementation details
- Fastify plugin registration order
- Error response format for startup validation failures

</decisions>

<specifics>
## Specific Ideas

- User emphasized end-to-end RabbitMQ flow: gpt-service publishes events, a consumer writes to the audit table. Not a fire-and-forget pattern -- must verify the full pipeline works.
- OAuth2 auth flow: ChatGPT -> backend /api/v1/gpt/oauth/authorize -> Clerk login -> session validated -> backend issues GPT access token. Clerk = identity provider, backend = OAuth provider, GPT = OAuth client.
- Opaque tokens over JWTs for instant revocation (decision captured in STATE.md).
- @fastify/formbody is the only new dependency needed (OAuth2 token endpoint requires application/x-www-form-urlencoded POST body).

</specifics>

<deferred>
## Deferred Ideas

- oauth_clients database table for multi-client support -- add only if a second OAuth client is needed
- Token cleanup cron job -- Phase 15 (hardening)
- RabbitMQ consumer for gpt_oauth_events -- needs to exist but may be part of notification-service or a dedicated consumer (decide during planning)
- Rate limiting for GPT endpoints -- Phase 15
- Kubernetes deployment manifest -- Phase 15

</deferred>

---

*Phase: 11-service-foundation*
*Context gathered: 2026-02-13*
