# Project Research Summary

**Project:** Splits Network v5.0 -- Custom GPT (Applicant.Network)
**Domain:** Custom GPT with Actions backend for a recruiting marketplace (candidate-facing)
**Researched:** 2026-02-13
**Confidence:** MEDIUM-HIGH

## Executive Summary

The v5.0 Custom GPT milestone requires building a `gpt-service` microservice that serves two purposes: (1) acting as an OAuth2 authorization server so OpenAI's ChatGPT can authenticate Applicant.Network candidates, and (2) providing GPT-optimized API endpoints for job search, application management, and resume analysis. The critical insight is that this service is a **translation layer**, not new domain logic. All underlying capabilities (job search with full-text search, AI fit analysis, application management, RBAC) already exist in ats-service and ai-service. The work is bridging OpenAI's GPT Actions protocol with these existing services while maintaining security and usability.

The recommended approach is hand-rolled OAuth2 routes (not a library) since there is exactly one client (OpenAI) and one grant type (authorization code). The service follows existing V2 patterns: Fastify, direct Supabase queries, `shared-access-context` for RBAC, and RabbitMQ events for observability. Only one genuinely new dependency is needed: `@fastify/formbody` for parsing the OAuth token endpoint's `application/x-www-form-urlencoded` body. Everything else already exists in the monorepo. GPT access tokens should be opaque strings (not JWTs), validated via hashed database lookup, because instant revocation matters more than stateless verification at GPT request volumes.

The primary risks are: (1) the OAuth2 token exchange failing silently because the project's `{ data: ... }` response envelope breaks the OAuth2 spec (token endpoint must return bare `{ access_token, token_type, ... }`), (2) the OpenAPI schema being rejected by GPT Actions' strict parser due to missing response schemas or unsupported features, and (3) cross-user data leakage if `resolveAccessContext` is not enforced on every endpoint. All three risks have clear mitigations. The secondary risk is that OpenAI-specific behaviors (timeout limits, PKCE requirement, callback URL format) could not be verified against current documentation and must be validated by creating a minimal GPT in GPT Builder before writing production code.

## Key Findings

### Recommended Stack

The gpt-service requires almost no new infrastructure. It plugs into the existing Fastify + Supabase + Clerk ecosystem with minimal additions.

**New dependency (genuinely new):**
- `@fastify/formbody` ^8.0.2: Parse `application/x-www-form-urlencoded` bodies -- OAuth2 token endpoint requires this content type per RFC 6749

**Reused from monorepo (already in other services):**
- `jsonwebtoken` ^9.0.3: Available for token signing if needed; already in api-gateway
- `uuid`: Generate authorization codes and token IDs; already in identity-service
- `@clerk/backend`: Validate Clerk sessions during OAuth callback; already in identity-service
- All shared packages (`shared-config`, `shared-fastify`, `shared-logging`, `shared-types`, `shared-access-context`)

**What NOT to add:**
- `@fastify/oauth2`: Wrong tool -- this is an OAuth2 CLIENT library, not a provider. Already unused in api-gateway (listed but never imported).
- `@jmondi/oauth2-server` or `@node-oauth/oauth2-server`: Over-engineered for single-client use case. Library interfaces assume multiple clients with varying grants and scopes.
- Redis for token storage: Tokens need durable storage with revocation tracking, not ephemeral cache. Consistent with "single Supabase Postgres database" rule.
- `passport.js` or `@fastify/passport`: Session-based middleware, wrong paradigm for stateless token auth.
- `openai` npm package: gpt-service RECEIVES calls from GPT, it does not CALL OpenAI API. That package belongs in ai-service.
- YAML parsing library: Defer unless JSON schema conversion is actually needed. Serve schema as raw text.
- RSA/JWKS signing infrastructure: HS256 or opaque tokens are sufficient when issuer and verifier are the same system.

### Expected Features

**Must have (table stakes -- GPT is non-functional without these):**
- TS-1: OpenAPI 3.0.1 Action Schema -- the contract with OpenAI, must include operationIds and full response schemas
- TS-2: OAuth2 Authorization Code Provider -- enables all authenticated features (3 endpoints: authorize, callback, token)
- TS-3: Job Search via structured parameters -- primary use case, works without auth for public jobs
- TS-4: Application Status Lookup -- core personalized feature with human-readable stage labels
- TS-5: Application Submission with two-phase confirmation -- core write action, defense-in-depth safety
- TS-6: GPT Instructions Document -- behavioral configuration defining personality, capabilities, and constraints
- TS-7: GPT-Friendly Error Responses -- standard error codes with human-readable messages (not stack traces)
- TS-8: Per-User Data Isolation -- security fundamental via resolveAccessContext, candidate-only scope enforcement
- TS-9: GPT-Specific Rate Limiting -- per-user throttle tiers, per-endpoint limits for expensive operations

**Should have (differentiators -- high value, low-medium complexity):**
- DIFF-1: Resume Analysis and Job Fit Scoring -- "killer feature" using existing ai-service pipeline, returns fit score + matched/missing skills
- DIFF-2: Job Detail Deep Dive -- very low complexity wrapper around existing `findJob()` with include params
- DIFF-6: Pre-Screen Question Answering -- free if DIFF-2 and TS-5 are built (answers submitted with application)

**Defer to post-MVP:**
- DIFF-3: Smart Job Recommendations -- high complexity, needs embedding/matching design work
- DIFF-4: Conversational Application Builder -- primarily GPT Instructions optimization, not backend work
- DIFF-5: Application Progress Notifications -- requires "last interaction" tracking, nice but not critical

**Anti-features (explicitly do NOT build):**
- Server-side NLP/intent parsing -- the GPT IS the NLP layer; adding a second creates double-interpretation errors
- Raw internal API response passthrough -- create GPT-specific DTOs with human-readable values
- Recruiter/admin features -- candidate-only scope for v5.0, recruiter GPT is a separate future milestone
- File upload through GPT Actions -- unreliable; use candidate's already-uploaded resumes
- Autonomous multi-step workflows -- violates confirmation safety pattern
- GPT response caching -- stale data is worse than slight latency at this scale
- Custom chat history/memory -- redundant with ChatGPT's built-in memory, creates privacy concerns

### Architecture Approach

The gpt-service is a new Fastify microservice that sits behind the api-gateway with a separate auth path. GPT requests flow: ChatGPT -> NGINX -> api-gateway (skips Clerk auth for `/api/v1/gpt/*`) -> gpt-service (validates its own opaque tokens via hashed DB lookup). The gpt-service queries Supabase directly (no HTTP calls between services, per architecture rules) and uses `resolveAccessContext` for RBAC, but forces candidate-only scope regardless of the user's actual roles. Two auth systems coexist but never overlap: Clerk JWTs for portal/candidate app, GPT opaque tokens for ChatGPT.

**Major components:**

1. **OAuth2 routes** (`/oauth/authorize`, `/oauth/callback`, `/oauth/token`) -- Account linking flow that bridges Clerk identity with GPT tokens. Authorize redirects to Clerk login, callback issues authorization code, token endpoint exchanges code for access/refresh tokens.
2. **GPT auth middleware** -- Validates opaque bearer tokens via SHA-256 hashed DB lookup, resolves access context, enforces candidate-only scope. Every request goes through this.
3. **GPT API routes** (`/api/v1/gpt/jobs`, `/api/v1/gpt/applications`, `/api/v1/gpt/resume/analyze`) -- GPT-optimized endpoints returning human-readable DTOs. Flat structures, no UUIDs in display fields, relative dates, enum-to-label translation.
4. **OpenAPI schema server** -- Static YAML served at `/api/v1/gpt/openapi.yaml`, hand-crafted for GPT Actions requirements with detailed descriptions, operationIds, and `x-openai-isConsequential` annotations.
5. **API gateway modifications** -- Auth bypass for GPT routes, proxy registration to gpt-service, GPT-specific rate limit tier keyed on userId (not token suffix).

**Key architectural decisions:**
- **Opaque tokens over JWTs** -- instant revocation, no signing key infrastructure, DB lookup is fast enough at GPT scale
- **`/api/v1/gpt/*` namespace** -- separate from `/api/v2/` for independent versioning, clean auth boundary, isolated OpenAPI schema
- **Direct DB access** -- follows "no HTTP between services" rule; gpt-service has its own repository layer reading existing tables
- **Static OpenAPI schema** -- hand-crafted, not auto-generated, because it is a contract with OpenAI requiring specific descriptions and annotations

**New database tables (5):**
- `gpt_authorization_codes` -- short-lived (10 min), single-use, plaintext acceptable
- `gpt_refresh_tokens` -- long-lived (30 days), SHA-256 hashed, rotation on use
- `gpt_sessions` -- OAuth flow state management (15 min TTL)
- `gpt_oauth_events` -- audit log for all OAuth and action events
- `oauth_clients` -- registered OAuth clients (just the one GPT, but extensible)

### Critical Pitfalls

1. **OAuth2 response envelope conflict** -- The project wraps ALL responses in `{ data: ... }` but OAuth2 requires bare `{ access_token, token_type, expires_in, refresh_token }`. **Prevention:** Explicitly exclude OAuth endpoints from the gateway's response wrapper. The gpt-service OAuth routes must send raw RFC 6749 responses. Test token exchange with a mock OAuth client before connecting to ChatGPT.

2. **OpenAPI schema rejected by GPT Actions parser** -- GPT Actions has a stricter parser than standard validators. Missing `operationId`, empty response schemas, deep `$ref` chains, or OpenAPI 3.1 features cause silent failures. **Prevention:** Use 3.0.1 only, add descriptions on every operation and parameter, inline schemas (max 2-level `$ref`), test in GPT Builder before writing backend code. The existing starter schema has empty response schemas -- these MUST be expanded.

3. **Cross-user data leakage** -- If `resolveAccessContext` is skipped or GPT tokens grant broader permissions than intended, User A sees User B's data. **Prevention:** Every endpoint calls `resolveAccessContext`, every query filters by `candidateId`, GPT tokens force candidate-only scope regardless of user's actual roles. Add explicit tenant isolation tests (User A cannot access User B's resources via any endpoint).

4. **Write-action confirmation bypass** -- The GPT may auto-populate `confirmed: true` without showing users a summary. The GPT Instructions are soft guidance, not hard enforcement. **Prevention:** Two-call pattern enforced server-side: first call always returns CONFIRMATION_REQUIRED with rich summary data (job title, company, resume used), second call with `confirmed: true` executes. Monitor the CONFIRMATION_REQUIRED-to-submission ratio. Consider a `confirmation_token` nonce.

5. **Clerk/GPT token lifecycle mismatch** -- GPT tokens remain valid after Clerk sessions expire or users are deactivated. **Prevention:** Short-lived access tokens (1 hour), user-exists check on every request, Clerk webhook integration (`user.deleted`, `user.updated`) to revoke all GPT tokens for affected users. Extend existing identity-service webhook handler.

## Implications for Roadmap

Based on dependency analysis, architecture patterns, and risk ordering, the suggested structure is 6 phases:

### Phase 1: Service Scaffold and Database Schema
**Rationale:** Everything depends on the gpt-service existing and having database tables. This is zero-risk foundational work that unblocks all subsequent phases.
**Delivers:** New `gpt-service` Fastify microservice (scaffold, health check, build pipeline, K8s manifest). Database migration for all 5 new tables. Shared types for GPT domain in `shared-types`. Service registration in api-gateway.
**Addresses:** Service foundation, DB schema
**Complexity:** Low

### Phase 2: OAuth2 Provider and API Gateway Integration
**Rationale:** Authentication is the critical path -- every authenticated feature depends on OAuth working. This is the highest-risk phase and should be validated early. If OAuth fails with OpenAI, all subsequent phases are blocked.
**Delivers:** Three OAuth endpoints (/authorize, /callback, /token), Clerk redirect-based authentication, token issuance with hashed storage, token refresh with rotation, api-gateway auth bypass for `/api/v1/gpt/*`, CORS configuration for ChatGPT origins, GPT-specific rate limit tier.
**Addresses:** TS-2 (OAuth), TS-8 (Data Isolation foundation), TS-9 (Rate Limiting foundation)
**Avoids:** Pitfall #1 (response envelope -- bare OAuth responses), Pitfall #5 (redirect URI mismatch), Pitfall #13 (CORS), Pitfall #14 (auth middleware rejection)
**Complexity:** HIGH -- This is the hardest phase. Must resolve the Clerk redirect mechanism and validate against real GPT Builder.

### Phase 3: Read Endpoints
**Rationale:** Read endpoints are safer, simpler, and deliver immediate user value. Building these before write endpoints lets the GPT be functional (even if read-only) while write safety patterns are perfected.
**Delivers:** `GET /api/v1/gpt/jobs` (search with structured parameters), `GET /api/v1/gpt/jobs/:id` (details with requirements and pre-screen questions), `GET /api/v1/gpt/applications` (status with human-readable stage labels), `GET /api/v1/gpt/resumes` (list candidate resumes). GPT-friendly response DTOs.
**Addresses:** TS-3 (Job Search), TS-4 (Application Status), TS-7 (Error Responses), DIFF-2 (Job Details)
**Avoids:** Pitfall #3 (data leakage -- resolveAccessContext on every request), Pitfall #6 (NL mapping -- granular schema parameters with enum descriptions), Pitfall #10 (response format -- flat DTOs with human-readable values)
**Complexity:** Low-Medium

### Phase 4: Write Endpoints and AI Integration
**Rationale:** Write actions require the confirmation safety pattern and build on read endpoints (need job details for confirmation summaries). Resume analysis depends on auth being solid.
**Delivers:** `POST /api/v1/gpt/applications` (two-phase confirmation with rich summary), `POST /api/v1/gpt/resume/analyze` (AI fit scoring via existing pipeline), pre-screen question collection in application flow, duplicate application prevention.
**Addresses:** TS-5 (Application Submission), DIFF-1 (Resume Analysis), DIFF-6 (Pre-Screen Q&A)
**Avoids:** Pitfall #4 (confirmation bypass -- server-side two-call enforcement with dedup), Pitfall #5 (timeout -- async pattern or time budget for resume analysis)
**Complexity:** Medium

### Phase 5: OpenAPI Schema and GPT Configuration
**Rationale:** The schema documents what was built in Phases 3-4. GPT Instructions require understanding all endpoints and flows. These cannot be finalized until endpoints are stable and tested.
**Delivers:** Complete OpenAPI 3.0.1 YAML schema with all operations, parameters, response schemas, auth config, and `x-openai-isConsequential` annotations. Comprehensive GPT Instructions document. Schema serving endpoint. Custom GPT configuration in OpenAI platform.
**Addresses:** TS-1 (OpenAPI Schema), TS-6 (GPT Instructions)
**Avoids:** Pitfall #1 (schema rejected -- test every operationId in GPT Builder), Pitfall #11 (vague instructions -- comprehensive coverage of all scenarios), Pitfall #15 (schema drift -- validate schema against actual routes)
**Complexity:** Medium

### Phase 6: Production Hardening
**Rationale:** Hardening should happen after core features work. Rate limit tuning requires real traffic patterns. Token lifecycle management needs end-to-end testing.
**Delivers:** Tuned per-endpoint rate limits based on real usage, Clerk webhook integration for token revocation (user.deleted, user.updated), token cleanup cron job (expire old tokens/codes), audit log review, monitoring and alerting dashboards, privacy policy and terms of service pages.
**Addresses:** TS-9 (Rate Limiting tuning), Pitfall #7 (token lifecycle), Pitfall #8 (rate limit conflicts), Pitfall #12 (legal URLs for GPT Store)
**Complexity:** Medium

### Phase Ordering Rationale

- **Phase 1 before 2:** OAuth routes need database tables and service scaffold to exist.
- **Phase 2 before 3:** Every authenticated endpoint depends on token validation working. Validate OAuth with real GPT Builder before investing in endpoint development.
- **Phase 3 before 4:** Write endpoints need read data for confirmation summaries (job details for "Apply to Senior Engineer at Acme Corp?"). Read endpoints are also simpler to validate.
- **Phase 5 after 3-4:** The OpenAPI schema must document actual, tested endpoints. Writing the schema before endpoints exist causes drift.
- **Phase 6 last:** Hardening and tuning require the system to be functionally complete. Rate limits need real usage data.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (OAuth):** HIGH priority. Must resolve: (a) Clerk redirect mechanism for OAuth callback -- how to redirect user to Clerk login and get proof of authentication back, (b) OpenAI's exact callback URL format, (c) whether PKCE is required, (d) `token_exchange_method` (basic vs post). **Recommend:** Create minimal GPT in GPT Builder with a single test endpoint to validate the full OAuth flow before writing production code.
- **Phase 5 (OpenAPI Schema):** MEDIUM priority. Must verify: (a) `x-openai-isConsequential` flag behavior, (b) OpenAPI 3.0 vs 3.1 support, (c) action count limits, (d) response size limits.

Phases with standard patterns (skip phase research):
- **Phase 1 (Scaffold):** Standard Fastify service creation, follows existing service patterns exactly (copy ai-service structure).
- **Phase 3 (Read Endpoints):** Thin wrappers around existing repository methods. V2 patterns well-documented in codebase.
- **Phase 4 (Write Endpoints):** Confirmation pattern is well-designed in research. AI integration reuses existing pipeline.
- **Phase 6 (Hardening):** Standard rate limiting, webhook handling, and deployment patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only 1 new dependency. Everything else reused from monorepo. Hand-rolled OAuth justified by single-client scope. |
| Features | MEDIUM-HIGH | Table stakes and differentiators clearly mapped to existing infrastructure. OpenAI-specific constraints (action limits, file upload, timeout) from training data, not live-verified. |
| Architecture | HIGH | Direct codebase analysis of api-gateway auth, routing, CORS, and rate limiting. All integration points verified against actual code. Service patterns well-established. |
| Pitfalls | MEDIUM-HIGH | Codebase-specific pitfalls (response envelope, auth middleware, CORS, rate limiter key) are HIGH confidence from code inspection. OpenAI-specific pitfalls (timeout limits, parser behavior, PKCE) are MEDIUM from training data. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

1. **Clerk redirect-based authentication for OAuth callback**: The exact mechanism for redirecting users to Clerk, authenticating them, and getting proof back to the OAuth callback needs investigation. Options include Clerk hosted sign-in page with redirect, Clerk session cookies, or a lightweight candidate app page. **Resolution:** Investigate during Phase 2 planning; consult Clerk docs at https://clerk.com/docs.

2. **OpenAI GPT Actions current documentation**: `x-openai-isConsequential` behavior, exact OAuth callback URL format, PKCE requirement, supported OpenAPI versions, action timeout limits, and token refresh behavior were not verified (WebSearch unavailable). **Resolution:** Consult https://platform.openai.com/docs/actions before Phase 2 begins. Create minimal GPT in Builder to test empirically.

3. **Token format disagreement (JWT vs opaque)**: STACK.md recommends JWT access tokens for stateless gateway verification. ARCHITECTURE.md recommends opaque tokens for instant revocation. **Resolution:** Use opaque tokens. At GPT request volumes (tens per user per session), DB lookup is not a bottleneck. Instant revocation is more valuable. If scale demands it later, add Redis token cache with 30s TTL.

4. **OpenAI token refresh behavior**: How frequently OpenAI refreshes tokens, whether it handles refresh token rotation, and error recovery on failed refreshes are unknown. **Resolution:** Test empirically during Phase 2 implementation.

5. **ChatGPT CORS origins**: Exact domains (`chat.openai.com`, `chatgpt.com`, others) need confirmation. Most GPT Action calls may be server-to-server, making CORS only relevant for OAuth redirect flow. **Resolution:** Verify during Phase 2; start permissive, tighten after testing.

## Sources

### Primary (HIGH confidence)
- `services/api-gateway/src/index.ts` -- Auth hook patterns (lines 283-377), rate limiter config (lines 178-200), CORS config (lines 38-43), service registry
- `services/api-gateway/src/auth.ts` -- Clerk JWT verification, multi-client auth loop
- `packages/shared-access-context/src/index.ts` -- resolveAccessContext, role extraction, candidateId resolution (line 142)
- `services/ats-service/src/v2/` -- V2 service pattern (jobs, applications, candidates repositories with search, pagination, role-based filtering)
- `services/ai-service/src/v2/reviews/` -- AI review pipeline (fit analysis, resume text extraction)
- `docs/gpt/01_PRD_Custom_GPT.md` through `05_GPT_Instructions_Template.md` -- Existing GPT documentation
- `.planning/PROJECT.md` -- v5.0 milestone context and constraints
- npm registry (verified) -- @fastify/formbody 8.0.2, @jmondi/oauth2-server 4.2.2, @node-oauth/oauth2-server 5.2.1, @fastify/oauth2 8.2.0, jsonwebtoken 9.0.3

### Secondary (MEDIUM confidence)
- OpenAI GPT Actions OAuth2 specification -- training data through May 2025
- OpenAPI 3.0 specification requirements for GPT Actions
- GPT parameter mapping and response interpretation behavior
- RFC 6749 (OAuth 2.0 Authorization Code Grant)
- RFC 7636 (PKCE -- may be required by GPT Actions)

### Tertiary (LOW confidence -- needs validation before implementation)
- GPT Actions HTTP timeout (~45 seconds, unverified)
- OpenAPI 3.0 vs 3.1 requirement (recommend 3.0 to be safe)
- Maximum ~30 operations per GPT (anecdotal)
- Exact ChatGPT CORS origins (may have additional domains)
- GPT Store review criteria (may have changed since May 2025)
- `x-openai-isConsequential` exact behavior and enforcement

---
*Research completed: 2026-02-13*
*Ready for roadmap: yes*
