# Technology Stack: Custom GPT with Actions Backend

**Project:** Splits Network - Custom GPT (Applicant.Network)
**Researched:** 2026-02-13
**Confidence:** HIGH (stack decisions) / MEDIUM (OpenAI-specific behavior, web search unavailable)

## Overview

This document covers stack **additions only** for the gpt-service microservice. The existing stack (Fastify 5, Supabase Postgres, Clerk, TypeScript, RabbitMQ, Redis) is validated and unchanged. The new capability is: **acting as an OAuth2 authorization server** so OpenAI's Custom GPT can authenticate users and call platform APIs.

## Decision Summary

| Capability | Recommendation | Rationale |
|-----------|---------------|-----------|
| OAuth2 provider | Hand-rolled Fastify routes | Narrowly scoped single-client flow; library overhead unjustified |
| Token signing/verification | `jsonwebtoken` ^9.0.3 | Already in api-gateway; proven, well-understood |
| Token storage | Supabase Postgres tables | Consistent with all services; no new infrastructure |
| OpenAPI schema serving | Static YAML file served via Fastify route | Simple, version-controlled, no runtime generation needed |
| Form body parsing | `@fastify/formbody` ^8.0.2 | OAuth2 token endpoint requires `application/x-www-form-urlencoded` |
| Confirmation safety | Application-level pattern (no library) | Domain logic, not a library concern |
| Rate limiting | Existing Redis + `@fastify/rate-limit` via api-gateway | Already configured; add GPT-specific rate limit tiers |

## Recommended Stack Additions

### New Dependencies for gpt-service

| Technology | Version | Purpose | Why This |
|------------|---------|---------|----------|
| `@fastify/formbody` | ^8.0.2 | Parse `application/x-www-form-urlencoded` bodies | OAuth2 token endpoint (`/oauth/token`) receives form-encoded POST per RFC 6749 Section 4.1.3. Fastify does not parse this content type by default. This is a tiny, official Fastify plugin. |
| `jsonwebtoken` | ^9.0.3 | Sign and verify GPT access tokens and refresh tokens | Already used in api-gateway (^9.0.2). Proven JWT library. Keeps token infrastructure consistent across services. |
| `@types/jsonwebtoken` | ^9.0.7 | TypeScript definitions | Already in api-gateway devDependencies. |
| `uuid` | ^11.0.3 (or ^13.0.0) | Generate authorization codes, token IDs | Already used in identity-service and document-service. Use whichever version is current in the monorepo for consistency. |

### Existing Dependencies (Already Available)

These are already in the monorepo and used by other services. The gpt-service follows the same pattern:

| Technology | Version | Purpose |
|------------|---------|---------|
| `fastify` | ^5.6.2 | HTTP server framework |
| `@supabase/supabase-js` | ^2.86.2 | Database client for token storage |
| `@fastify/swagger` | ^9.5.0 | Internal Swagger docs (service-level) |
| `@fastify/swagger-ui` | ^5.2.3 | Internal Swagger UI |
| `@splits-network/shared-config` | workspace:* | Environment/config loading |
| `@splits-network/shared-fastify` | workspace:* | Server builder, error handler, health checks |
| `@splits-network/shared-logging` | workspace:* | Structured logging |
| `@splits-network/shared-types` | workspace:* | Shared domain types |
| `@splits-network/shared-access-context` | workspace:* | resolveAccessContext for authorization |
| `@sentry/node` | ^10.32.1 | Error tracking |
| `amqplib` | ^0.10.9 | RabbitMQ event publishing |

## Critical Decision: OAuth2 Provider Approach

### Decision: Hand-rolled Fastify routes (NOT an OAuth2 server library)

**Evaluated alternatives:**

| Option | Version | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **Hand-rolled routes** | N/A | Minimal code (~200 lines), no new dependency, full control, exactly matches GPT's narrow needs | Must implement correctly per RFC 6749 | **RECOMMENDED** |
| `@jmondi/oauth2-server` | 4.2.2 | Full RFC compliance, Fastify adapter, TypeScript native, authorization code grant built-in | Heavy abstraction for single-client use case, requires implementing 3 repository interfaces (client, token, scope), adds indirection | Not recommended |
| `@node-oauth/oauth2-server` | 5.2.1 | Full RFC compliance, well-maintained fork of oauth2-server | Express-oriented API, requires adapter glue for Fastify, heavier dependency tree | Not recommended |
| `@fastify/oauth2` | 8.2.0 | Already in api-gateway package.json | **Wrong tool**: this is an OAuth2 CLIENT (for consuming OAuth), NOT a provider/server. Cannot be used for our use case. Already unused in api-gateway (listed but never imported). | **Incorrect tool** |

**Why hand-rolled wins:**

1. **Single client**: OpenAI's GPT is the ONLY OAuth2 client. There is no client registry, no dynamic client registration, no multi-tenant OAuth complexity. The client_id and client_secret are configured once in the GPT builder UI and stored as environment variables.

2. **Single grant type**: Authorization code flow only. No client_credentials, no implicit, no ROPC. One flow, three endpoints.

3. **Narrow scope**: The entire OAuth2 provider is three endpoints:
   - `GET /oauth/authorize` -- Redirect to Clerk login, store authorization state
   - `GET /oauth/callback` -- Clerk redirects back, issue authorization code
   - `POST /oauth/token` -- Exchange code for access token (or refresh token for new access token)

4. **Library overhead**: `@jmondi/oauth2-server` requires implementing `OAuthClientRepository`, `OAuthTokenRepository`, and `OAuthScopeRepository` interfaces. For a single static client, this is ceremony without value. The repository interfaces assume multiple clients with varying grants, scopes, and redirect URIs.

5. **Debuggability**: When something goes wrong with OpenAI's token exchange (and it will during development), hand-rolled code with explicit logging at each step is far easier to debug than tracing through library abstractions.

6. **Security surface**: Fewer dependencies = smaller attack surface. The hand-rolled approach uses only `jsonwebtoken` (already audited, already in use) and `crypto.randomBytes` (Node.js built-in) for authorization codes.

### Implementation Pattern

```
gpt-service/src/
  oauth/
    types.ts           # OAuthCode, OAuthToken, GPTAccessToken interfaces
    repository.ts      # Supabase CRUD for auth codes and tokens
    service.ts         # Business logic: validate, issue, refresh, revoke
    routes.ts          # Three Fastify route handlers
  v1/
    gpt/
      routes.ts        # GPT action endpoints (jobs, applications, etc.)
  index.ts             # Service entry point
```

**The three OAuth endpoints:**

```typescript
// 1. GET /api/v1/gpt/oauth/authorize
//    OpenAI redirects user here with: client_id, redirect_uri, state, response_type=code
//    Service validates client_id, stores state, redirects to Clerk login

// 2. GET /api/v1/gpt/oauth/callback
//    Clerk redirects here after login with Clerk session
//    Service validates Clerk session, generates authorization code,
//    redirects to OpenAI's redirect_uri with code + state

// 3. POST /api/v1/gpt/oauth/token
//    OpenAI sends: grant_type, code (or refresh_token), client_id, client_secret
//    Content-Type: application/x-www-form-urlencoded (hence @fastify/formbody)
//    Service validates, returns { access_token, refresh_token, token_type, expires_in }
```

## Token Strategy

### Access Tokens

| Property | Value | Rationale |
|----------|-------|-----------|
| Format | JWT (signed with HS256) | Stateless verification at api-gateway; consistent with existing auth pattern |
| Lifetime | 1 hour (3600 seconds) | Short-lived for security. OpenAI automatically refreshes using refresh_token. |
| Signing key | Dedicated `GPT_JWT_SECRET` env var | Separate from Clerk secrets. If compromised, revoke without affecting Clerk auth. |
| Payload | `{ sub: clerkUserId, iss: "splits-gpt", aud: "openai-gpt", iat, exp, jti, scope: "candidate" }` | `sub` maps to existing clerkUserId for downstream resolution via resolveAccessContext. `jti` enables revocation. |

### Refresh Tokens

| Property | Value | Rationale |
|----------|-------|-----------|
| Format | Opaque string (crypto.randomBytes(32).toString('hex')) | Not decoded client-side; used only for exchange. |
| Lifetime | 30 days | Long enough for persistent GPT sessions; short enough for security rotation. |
| Storage | Supabase `gpt_refresh_tokens` table | Enables revocation, rotation, audit trail. |
| Rotation | Issue new refresh token on each use; invalidate old one | Prevents replay attacks. Standard refresh token rotation per OAuth2 best practices. |

### Authorization Codes

| Property | Value | Rationale |
|----------|-------|-----------|
| Format | Opaque string (crypto.randomBytes(32).toString('hex')) | One-time use, short-lived. |
| Lifetime | 10 minutes | Per RFC 6749 Section 4.1.2 recommendation. |
| Storage | Supabase `gpt_authorization_codes` table | Must persist across redirect chain (authorize -> Clerk -> callback -> token exchange). |
| Single use | Delete on exchange | Prevents replay. |

## Database Tables (New)

Three new tables in the `public` schema:

```sql
-- OAuth2 authorization codes (short-lived, single-use)
CREATE TABLE public.gpt_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    clerk_user_id TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    state TEXT,                    -- OpenAI's state parameter, returned on redirect
    scope TEXT DEFAULT 'candidate',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,          -- NULL until exchanged; prevents replay
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gpt_auth_codes_code ON public.gpt_authorization_codes(code);
CREATE INDEX idx_gpt_auth_codes_expires ON public.gpt_authorization_codes(expires_at);

-- OAuth2 refresh tokens (long-lived, rotated on use)
CREATE TABLE public.gpt_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,  -- SHA-256 hash, never store plaintext
    clerk_user_id TEXT NOT NULL,
    scope TEXT DEFAULT 'candidate',
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,           -- NULL until revoked
    replaced_by UUID,                 -- Points to new token after rotation
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gpt_refresh_tokens_hash ON public.gpt_refresh_tokens(token_hash);
CREATE INDEX idx_gpt_refresh_tokens_user ON public.gpt_refresh_tokens(clerk_user_id);

-- Audit log for GPT OAuth events (observability)
CREATE TABLE public.gpt_oauth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,  -- 'authorize', 'token_exchange', 'refresh', 'revoke'
    clerk_user_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gpt_oauth_events_type ON public.gpt_oauth_events(event_type);
CREATE INDEX idx_gpt_oauth_events_user ON public.gpt_oauth_events(clerk_user_id);
CREATE INDEX idx_gpt_oauth_events_created ON public.gpt_oauth_events(created_at);
```

**Why these tables and not Redis:**
- Authorization codes need to survive service restarts (redirect chain spans multiple HTTP requests)
- Refresh tokens require durable storage with revocation tracking
- Audit log is a compliance requirement for OAuth operations
- Redis is appropriate for caching, not for authorization state that must not be lost
- Consistent with the project's "single Supabase Postgres database" rule

**Why hash refresh tokens:**
- If the database is compromised, plaintext refresh tokens would allow impersonation
- Store SHA-256 hash of the token; compare hashes on exchange
- Authorization codes are ephemeral (10 min) and single-use, so plaintext is acceptable

## OpenAPI Schema for GPT Actions

### Approach: Static YAML File Served via Route

The GPT Actions OpenAPI schema is a separate, hand-crafted YAML file. It is NOT auto-generated from Fastify's Swagger plugin.

**Why separate from Fastify Swagger:**
1. The GPT-facing OpenAPI schema is a **contract with OpenAI**, not internal documentation
2. It must follow OpenAI's specific requirements (operationIds, descriptions that guide GPT behavior, x-openai-isConsequential annotations)
3. Auto-generated schemas include internal details (health checks, Swagger UI routes) that should not be exposed to GPT
4. The schema is version-controlled and reviewed as a first-class artifact

**Implementation:**

```typescript
// gpt-service/src/v1/gpt/openapi.ts
import { readFileSync } from 'fs';
import { join } from 'path';

// Serve the static OpenAPI schema
app.get('/api/v1/gpt/openapi.yaml', async (request, reply) => {
    const schema = readFileSync(
        join(__dirname, '../../openapi/gpt-actions.yaml'),
        'utf-8'
    );
    reply.type('text/yaml').send(schema);
});

// Also serve as JSON for flexibility
app.get('/api/v1/gpt/openapi.json', async (request, reply) => {
    // Parse YAML to JSON at startup, cache in memory
    reply.type('application/json').send(cachedJsonSchema);
});
```

**No additional YAML parsing library needed.** The schema is served as a raw text file. If JSON conversion is needed, use the `yaml` package (^2.8.2) -- but this can be deferred until actually needed. Start with YAML-only serving.

### OpenAI GPT Actions OpenAPI Requirements

**Confidence: MEDIUM** -- Based on training data knowledge of OpenAI's GPT Actions specification. WebSearch/WebFetch unavailable to verify against current docs. Key requirements as understood:

| Requirement | Details |
|-------------|---------|
| OpenAPI version | 3.0.x or 3.1.x (3.0.1 used in existing starter) |
| Authentication | `securitySchemes` with `type: oauth2`, `flows.authorizationCode` specifying `authorizationUrl` and `tokenUrl` |
| operationId | **Required** on every path operation. GPT uses these to decide which action to call. Must be descriptive (e.g., `searchJobs`, `createApplication`). |
| Description quality | `summary` and `description` on operations guide GPT's tool selection. Write them as if instructing the AI. |
| x-openai-isConsequential | Boolean annotation on operations. `true` = GPT must confirm with user before calling. `false` = GPT can call without confirmation. |
| Response descriptions | Must describe what GPT should tell the user based on the response. |
| Schema size | Keep the schema focused. Large schemas with many endpoints degrade GPT's action selection accuracy. |
| Server URL | Single `servers[0].url` pointing to production API base URL. |

**Verification needed:** The `x-openai-isConsequential` flag behavior should be verified against current OpenAI documentation before implementation. This is flagged as a research gap.

## Confirmation Safety Pattern

### Approach: Dual-layer confirmation (OpenAI built-in + application-level)

**Layer 1: OpenAI's `x-openai-isConsequential` flag**

```yaml
paths:
  /api/v1/gpt/applications:
    post:
      operationId: createApplication
      x-openai-isConsequential: true  # GPT asks user to confirm
      summary: Submit a job application on behalf of the user
```

When `x-openai-isConsequential: true`, ChatGPT displays a confirmation dialog to the user before making the API call. This is the first line of defense.

**Layer 2: Application-level `confirmed` flag**

Even with OpenAI's confirmation, the backend independently enforces confirmation:

```typescript
// In gpt-service route handler
if (!body.confirmed) {
    return reply.status(400).send({
        error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'This action requires explicit confirmation. Please confirm you want to proceed.',
            action_summary: {
                type: 'create_application',
                job_title: job.title,
                company: job.company_name,
            }
        }
    });
}
```

**Why both layers:**
- OpenAI's flag could be bypassed if someone calls the API directly (not through GPT)
- The application-level check ensures write safety regardless of caller
- The GPT instructions template tells GPT to set `confirmed: true` only after user confirms
- Defense in depth: if either layer fails, the other catches it

**No library needed.** This is pure application logic in route handlers.

## Integration Points with Existing Stack

### 1. Clerk Authentication (Identity Bridge)

The gpt-service does NOT verify Clerk JWTs directly for GPT action requests. Instead:

```
GPT Action Request Flow:
  ChatGPT -> api-gateway -> gpt-service
                |
                v
    GPT access token verified at api-gateway
    (new auth path, separate from Clerk JWT path)
    Sets x-clerk-user-id header (extracted from GPT token's sub claim)
                |
                v
    gpt-service reads x-clerk-user-id header
    Uses resolveAccessContext() for authorization (same as all V2 services)
```

**During OAuth flow only**, the gpt-service interacts with Clerk:
- `GET /oauth/authorize` redirects to Clerk's hosted login page
- `GET /oauth/callback` validates the Clerk session/code to confirm the user authenticated
- This uses `@clerk/backend` to verify the user's identity during the OAuth handshake

**Integration approach for the callback:**
The authorize endpoint redirects the user to the Clerk-hosted sign-in page for the `candidate` app. After Clerk authenticates the user, it redirects back to the callback URL. The callback verifies the Clerk session and extracts the `clerkUserId` to bind to the authorization code.

**Implementation note:** The exact mechanism for Clerk redirect-based auth (as opposed to JWT verification) needs investigation during implementation. Options include:
- Redirecting to the candidate app's sign-in page, which sets a Clerk session cookie, then redirecting back to the callback
- Using Clerk's OAuth-compatible endpoints if available
- Using a lightweight sign-in page hosted by the candidate app that redirects back with proof of authentication

This is flagged as a **research gap** that should be resolved in the first implementation phase.

### 2. API Gateway Routing

The api-gateway needs a new auth path for GPT tokens:

```typescript
// In api-gateway auth hook, add GPT token path:
// If request path starts with /api/v1/gpt/ AND has Bearer token that is NOT a Clerk JWT:
//   1. Verify token using GPT_JWT_SECRET (jsonwebtoken.verify)
//   2. Extract clerkUserId from token's sub claim
//   3. Set x-clerk-user-id header
//   4. Proxy to gpt-service

// OAuth endpoints (/api/v1/gpt/oauth/*) should bypass auth entirely
// (they ARE the auth flow, not consumers of it)
```

**No new dependencies for api-gateway.** It already has `jsonwebtoken`. The change is routing logic only.

### 3. Supabase Database

All token storage uses the existing Supabase client pattern:

```typescript
// gpt-service repository pattern (matches ai-service, ats-service, etc.)
export class OAuthRepository {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async createAuthorizationCode(data: CreateAuthCodeData): Promise<AuthCode> {
        const { data: code, error } = await this.supabase
            .from('gpt_authorization_codes')
            .insert(data)
            .select()
            .single();
        if (error) throw error;
        return code;
    }
    // ... standard repository CRUD
}
```

### 4. RabbitMQ Events

The gpt-service publishes events for observability:

```typescript
// Events published:
'gpt.oauth.authorized'     // User completed OAuth linking
'gpt.oauth.token_issued'   // Access token issued
'gpt.oauth.token_refreshed' // Token refreshed
'gpt.action.executed'      // GPT action endpoint called
'gpt.action.confirmed'     // Write action confirmed and executed
```

These events can be consumed by analytics-service and notification-service for tracking GPT usage metrics.

## What NOT to Add

### 1. @fastify/oauth2 (WRONG TOOL)

**Already in api-gateway package.json but unused.** This is an OAuth2 CLIENT library (for consuming external OAuth providers like Google, Facebook). It cannot act as an OAuth2 PROVIDER. Do not use it for this feature. Consider removing the unused dependency from api-gateway in a cleanup pass.

### 2. @jmondi/oauth2-server or @node-oauth/oauth2-server

**Over-engineered for single-client use case.** These libraries shine when building a multi-tenant OAuth2 provider with multiple clients, varying grant types, and dynamic scopes. Our use case is one client (OpenAI), one grant type (authorization code), one scope (candidate). The library abstraction adds complexity without corresponding value.

### 3. Separate Redis token store

**Tokens belong in Postgres, not Redis.** Reasons:
- Refresh tokens are long-lived (30 days) and require durable storage with revocation tracking
- Authorization codes must survive the redirect chain (authorize -> Clerk -> callback -> exchange)
- Audit trail of OAuth events needs persistent storage
- Redis is for caching and rate limiting (ephemeral data), not authorization state
- The project rule: "single Supabase Postgres database"

**Exception:** Access tokens are JWTs verified statelessly. They do not need storage at all (verified by signature). If token revocation before expiry is needed later, a Redis revocation list could be added -- but this is a future optimization, not a launch requirement.

### 4. Passport.js or @fastify/passport

**Session-based auth middleware, wrong paradigm.** The GPT flow is stateless token-based auth. Passport.js adds session management, strategy patterns, and serialize/deserialize hooks that are unnecessary. The project already handles auth via Clerk JWTs and custom middleware.

### 5. YAML parsing library (for now)

**Defer unless needed.** The OpenAPI schema is served as a static YAML file. If JSON conversion is needed, the `yaml` package (^2.8.2) can be added later. No need to add it preemptively.

### 6. OpenAI SDK for the gpt-service

**The openai npm package (^4.82.1) is NOT needed in gpt-service.** The gpt-service does not call the OpenAI API. It RECEIVES calls FROM OpenAI's GPT. The openai package is correctly used in ai-service for candidate-job fit analysis -- do not confuse the two services.

### 7. Separate signing key infrastructure (JWKS, RSA)

**HS256 with a symmetric secret is sufficient.** The GPT access tokens are verified only by our own api-gateway. There is no third-party token verification scenario. HS256 (HMAC-SHA256) is simpler, faster, and appropriate when the issuer and verifier are the same system. If the platform later becomes a public OAuth2 provider for third-party integrations, upgrade to RS256 with JWKS at that time.

## Environment Variables (New)

```bash
# GPT OAuth Configuration
GPT_CLIENT_ID=splits-gpt-client          # Configured in OpenAI GPT builder
GPT_CLIENT_SECRET=<generated-secret>      # Configured in OpenAI GPT builder
GPT_JWT_SECRET=<32-byte-random-secret>    # Signs GPT access tokens (separate from Clerk)
GPT_TOKEN_EXPIRY=3600                     # Access token lifetime in seconds (1 hour)
GPT_REFRESH_TOKEN_EXPIRY=2592000          # Refresh token lifetime in seconds (30 days)
GPT_AUTH_CODE_EXPIRY=600                  # Authorization code lifetime in seconds (10 min)
GPT_REDIRECT_URI=https://chat.openai.com/aip/<plugin-id>/oauth/callback  # OpenAI's callback URL

# Clerk Candidate App (for OAuth redirect flow)
# These already exist in shared-config for the candidate app
APP_CLERK_PUBLISHABLE_KEY=<existing>
APP_CLERK_SECRET_KEY=<existing>
```

## Installation (gpt-service package.json)

```json
{
    "name": "@splits-network/gpt-service",
    "version": "0.1.0",
    "private": true,
    "main": "./dist/index.js",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc -b",
        "start": "node dist/index.js",
        "clean": "rm -rf dist *.tsbuildinfo",
        "test": "vitest"
    },
    "dependencies": {
        "@fastify/formbody": "^8.0.2",
        "@fastify/swagger": "^9.5.0",
        "@fastify/swagger-ui": "^5.2.3",
        "@clerk/backend": "^2.4.0",
        "@sentry/node": "^10.32.1",
        "@splits-network/shared-access-context": "workspace:*",
        "@splits-network/shared-config": "workspace:*",
        "@splits-network/shared-fastify": "workspace:*",
        "@splits-network/shared-logging": "workspace:*",
        "@splits-network/shared-types": "workspace:*",
        "@supabase/supabase-js": "^2.86.2",
        "amqplib": "^0.10.9",
        "fastify": "^5.6.2",
        "jsonwebtoken": "^9.0.3"
    },
    "devDependencies": {
        "@types/amqplib": "^0.10.5",
        "@types/jsonwebtoken": "^9.0.7",
        "@types/node": "^24.10.1",
        "@vitest/coverage-v8": "^2.1.9",
        "tsx": "^4.19.2",
        "typescript": "^5.9.3",
        "vitest": "^2.1.9"
    }
}
```

**New dependencies (not already in any service):** Only `@fastify/formbody` ^8.0.2.
**Everything else** is already used across the monorepo.

## API Gateway Changes (No New Dependencies)

The api-gateway already has `jsonwebtoken` and all routing infrastructure. Changes needed:

1. **New route registration** for `/api/v1/gpt/*` proxy to gpt-service
2. **GPT token verification** in the auth hook (verify HS256 JWT with `GPT_JWT_SECRET`)
3. **Auth bypass** for OAuth endpoints (`/api/v1/gpt/oauth/*`)
4. **Rate limit tier** for GPT-sourced requests (lower than authenticated users, higher than anonymous)

These are code changes, not dependency additions.

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| OAuth2 provider approach (hand-rolled) | HIGH | Well-understood RFC, narrow scope, team controls both sides |
| Token strategy (JWT access, opaque refresh) | HIGH | Industry standard pattern, jsonwebtoken already in use |
| Database schema for tokens | HIGH | Follows existing Supabase migration patterns exactly |
| Fastify formbody requirement | HIGH | OAuth2 token endpoint MUST accept form-encoded POST per RFC 6749 |
| OpenAI GPT Actions OpenAPI spec | MEDIUM | Based on training data; x-openai-isConsequential behavior not verified against current docs |
| Clerk redirect flow for OAuth | MEDIUM | Exact mechanism for redirect-based auth with Clerk needs implementation-phase research |
| GPT_REDIRECT_URI format | LOW | OpenAI's exact callback URL format may have changed; verify during GPT builder setup |

## Research Gaps

1. **OpenAI GPT Actions current documentation** -- WebSearch/WebFetch were unavailable. The `x-openai-isConsequential` flag, exact OAuth callback URL format, and any new schema requirements should be verified against https://platform.openai.com/docs/actions before implementation begins.

2. **Clerk redirect-based authentication** -- The OAuth flow requires redirecting users to Clerk for login and getting proof of authentication back. The exact mechanism (Clerk hosted pages, session cookies, or Clerk's own OAuth endpoints) needs investigation. The Clerk docs at https://clerk.com/docs should be consulted.

3. **OpenAI's token refresh behavior** -- How frequently OpenAI refreshes tokens, whether it handles refresh token rotation gracefully, and error recovery behavior should be tested empirically during development.

## Sources

| Source | Type | What It Provided |
|--------|------|-----------------|
| `npm view @jmondi/oauth2-server` | npm registry (verified) | Version 4.2.2, Fastify adapter support, RFC compliance, TypeScript native |
| `npm view @node-oauth/oauth2-server` | npm registry (verified) | Version 5.2.1, Express-oriented, fork of oauth2-server |
| `npm view @fastify/oauth2` | npm registry (verified) | Version 8.2.0, OAuth2 CLIENT library (not provider) |
| `npm view @fastify/formbody` | npm registry (verified) | Version 8.0.2, Fastify 5 compatible |
| `npm view jsonwebtoken` | npm registry (verified) | Version 9.0.3 |
| `services/api-gateway/src/auth.ts` | Codebase (verified) | Existing Clerk JWT verification pattern |
| `services/api-gateway/src/index.ts` | Codebase (verified) | Auth hook structure, route registration pattern |
| `services/ai-service/src/` | Codebase (verified) | V2 service pattern, repository pattern, package.json template |
| `docs/gpt/*.md` | Codebase (verified) | PRD, architecture, tech spec, OpenAPI starter, GPT instructions |
| RFC 6749 (OAuth 2.0) | Training data | Authorization code flow specification |
