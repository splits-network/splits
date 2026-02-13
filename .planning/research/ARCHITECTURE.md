# Architecture Patterns: Custom GPT Actions Backend

**Domain:** Custom GPT with OAuth2-authenticated Actions backend for recruiting marketplace
**Researched:** 2026-02-13
**Confidence:** HIGH (codebase analysis) / MEDIUM (GPT Actions spec from training data, not live-verified)

## Executive Summary

The Custom GPT Actions backend requires a new `gpt-service` microservice that serves as an OAuth2 provider and GPT-specific API layer. This service has a fundamentally different auth model from existing services: instead of Clerk JWTs from browser sessions, it receives bearer tokens that the gpt-service itself issues after an OAuth2 authorization code flow. The gpt-service sits *behind* the api-gateway but with a separate auth path -- the gateway routes GPT requests to gpt-service which handles its own token validation, then gpt-service queries the database directly using `shared-access-context` (following the established "no HTTP calls between services" rule).

**Critical architectural insight:** The GPT is NOT a frontend app. It is an external OAuth2 client. The backend must act as an OAuth2 Authorization Server, but the identity provider is still Clerk. This creates a two-layer auth model: Clerk authenticates the human, gpt-service issues and validates GPT-scoped tokens.

## Recommended Architecture

### High-Level Request Flow

```
ChatGPT Custom GPT
    |
    | (1) HTTP request with Bearer token (GPT access token)
    v
NGINX Ingress (api.splits.network)
    |
    | (2) Routes /api/v1/gpt/* to api-gateway
    v
API Gateway (Fastify)
    |
    | (3) Detects /api/v1/gpt/* path prefix
    | (4) SKIPS Clerk JWT validation for this prefix
    | (5) Proxies request to gpt-service with raw Bearer token
    v
GPT Service (Fastify)
    |
    | (6) Validates GPT access token from Bearer header
    | (7) Resolves clerk_user_id from gpt_tokens table
    | (8) Uses resolveAccessContext(clerkUserId) for RBAC
    | (9) Queries Supabase directly for domain data
    | (10) Returns GPT-formatted response
    v
Response flows back through gateway to ChatGPT
```

### OAuth2 Authorization Flow (One-Time Account Linking)

```
User clicks "Sign in" in ChatGPT Custom GPT
    |
    v
(1) ChatGPT redirects to:
    https://api.splits.network/api/v1/gpt/oauth/authorize
    ?client_id=<gpt_client_id>
    &redirect_uri=https://chatgpt.com/aip/<plugin_id>/oauth/callback
    &response_type=code
    &state=<random_state>
    &scope=candidate
    |
    v
(2) gpt-service receives authorize request
    - Validates client_id against oauth_clients table
    - Validates redirect_uri matches registered callback
    - Stores state + client_id + scope in gpt_sessions table
    - Redirects user to Clerk login page:
      https://accounts.applicant.network/sign-in
      ?redirect_url=https://api.splits.network/api/v1/gpt/oauth/callback
      &state=<session_id>
    |
    v
(3) User authenticates with Clerk (existing Clerk login page)
    - Email/password, Google, etc.
    - Clerk issues session
    |
    v
(4) Clerk redirects back to gpt-service callback:
    https://api.splits.network/api/v1/gpt/oauth/callback
    ?state=<session_id>
    - gpt-service extracts Clerk session from cookie/token
    - Validates user via Clerk Backend SDK
    - Retrieves clerk_user_id
    |
    v
(5) gpt-service generates authorization code
    - Stores: auth_code -> {clerk_user_id, client_id, scope, expires_at}
    - Redirects to ChatGPT callback:
      https://chatgpt.com/aip/<plugin_id>/oauth/callback
      ?code=<auth_code>
      &state=<original_state>
    |
    v
(6) ChatGPT exchanges code for tokens (server-to-server):
    POST https://api.splits.network/api/v1/gpt/oauth/token
    Content-Type: application/x-www-form-urlencoded

    grant_type=authorization_code
    &code=<auth_code>
    &client_id=<gpt_client_id>
    &client_secret=<gpt_client_secret>
    &redirect_uri=https://chatgpt.com/aip/<plugin_id>/oauth/callback
    |
    v
(7) gpt-service validates code, issues tokens:
    {
      "access_token": "<jwt_or_opaque_token>",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "<refresh_token>"
    }
    - Stores token in gpt_tokens table linked to clerk_user_id
    |
    v
(8) ChatGPT stores tokens, uses access_token for all subsequent API calls:
    GET /api/v1/gpt/jobs?keywords=senior+engineer
    Authorization: Bearer <access_token>
```

### Token Refresh Flow

```
(1) ChatGPT detects 401 response (expired access token)
    |
    v
(2) ChatGPT sends refresh request:
    POST /api/v1/gpt/oauth/token
    grant_type=refresh_token
    &refresh_token=<refresh_token>
    &client_id=<gpt_client_id>
    &client_secret=<gpt_client_secret>
    |
    v
(3) gpt-service validates refresh token
    - Checks gpt_tokens table: not revoked, not expired
    - Resolves clerk_user_id
    - Issues new access_token (and optionally new refresh_token)
    - Invalidates old access_token
    |
    v
(4) Returns new tokens to ChatGPT
```

## Component Boundaries

### New Components

| Component | Type | Responsibility | Location |
|-----------|------|----------------|----------|
| **gpt-service** | New microservice | OAuth2 provider + GPT API endpoints | `services/gpt-service/` |
| **GPT auth middleware** | New module in gpt-service | Validate GPT tokens, resolve user | `services/gpt-service/src/v2/shared/auth.ts` |
| **OAuth routes** | New routes in gpt-service | /authorize, /callback, /token, /revoke | `services/gpt-service/src/v2/oauth/` |
| **GPT API routes** | New routes in gpt-service | Jobs search, resume analysis, applications | `services/gpt-service/src/v2/` |
| **OpenAPI schema** | Static file | Served at /.well-known/openapi.yaml | `services/gpt-service/src/openapi/` |
| **DB tables** | Schema additions | gpt_tokens, gpt_auth_codes, oauth_clients | Supabase migration |

### Modified Components

| Component | Type | Modification | Why |
|-----------|------|-------------|-----|
| **api-gateway auth hook** | Existing | Skip Clerk auth for `/api/v1/gpt/*` paths | GPT tokens are NOT Clerk JWTs |
| **api-gateway routes** | Existing | Add proxy routes for gpt-service | Route GPT requests to gpt-service |
| **api-gateway index.ts** | Existing | Register gpt-service in ServiceRegistry | Connect to gpt-service URL |
| **api-gateway deployment.yaml** | Existing | Add GPT_SERVICE_URL env var | K8s routing |
| **K8s ingress.yaml** | Unchanged | Already routes api.splits.network/* to api-gateway | No change needed |

### Unchanged Components

| Component | Why Unchanged |
|-----------|--------------|
| **ats-service** | gpt-service queries DB directly, not via HTTP |
| **ai-service** | gpt-service queries DB directly OR uses internal-service-key for AI calls |
| **document-service** | gpt-service can use Supabase Storage SDK directly |
| **identity-service** | User data accessed via shared DB |
| **shared-access-context** | gpt-service uses resolveAccessContext() as-is |
| **Clerk configuration** | Existing Candidate app Clerk instance used for GPT login |
| **NGINX Ingress** | Already routes all api.splits.network to api-gateway |

## Integration Points with Existing Architecture

### 1. API Gateway Integration

The api-gateway already has a pattern for skipping Clerk auth on certain paths (webhooks, public endpoints, internal service calls). GPT routes follow the same pattern.

**Current auth skip patterns in api-gateway/src/index.ts:**
```typescript
// Already exists:
if (request.url.includes('/webhooks/')) return;           // Signature-verified
if (request.url.startsWith('/api/public/')) return;       // Public
if (request.url.startsWith('/api/marketplace/')) return;  // Public

// NEW: Add GPT route skip
if (request.url.startsWith('/api/v1/gpt/')) return;       // GPT token auth (handled by gpt-service)
```

**Gateway proxy pattern** (same as all other services):
```typescript
// services/api-gateway/src/routes/v2/gpt.ts (new file)
export function registerGptRoutes(app: FastifyInstance, services: ServiceRegistry) {
    const gptService = () => services.get('gpt');

    // Proxy ALL /api/v1/gpt/* requests to gpt-service
    // Note: v1 namespace, not v2, because this is a separate API surface
    app.all('/api/v1/gpt/*', async (request, reply) => {
        const path = request.url; // Pass full path through
        const correlationId = getCorrelationId(request);

        // Forward the raw Authorization header (GPT token, NOT Clerk)
        const headers: Record<string, string> = {};
        if (request.headers.authorization) {
            headers['authorization'] = request.headers.authorization as string;
        }
        headers['x-correlation-id'] = correlationId;

        // Proxy to gpt-service
        const response = await gptService().get(path, request.query, correlationId, headers);
        return reply.send(response);
    });
}
```

**ServiceRegistry addition** (api-gateway/src/index.ts):
```typescript
services.register('gpt', process.env.GPT_SERVICE_URL || 'http://localhost:3014');
```

### 2. Database Integration (Direct Access)

The gpt-service follows the existing pattern: direct Supabase client for database queries, using `shared-access-context` for RBAC. This adheres to the "no HTTP calls between services" rule.

**gpt-service accesses these existing tables (read-only):**
- `jobs` (with company join) -- for job search
- `candidates` -- for user's candidate profile
- `applications` -- for application status
- `companies` -- for company context
- `users` -- via resolveAccessContext

**gpt-service owns these new tables (read-write):**
- `oauth_clients` -- registered OAuth clients (the GPT itself)
- `gpt_auth_codes` -- short-lived authorization codes
- `gpt_tokens` -- access and refresh tokens
- `gpt_sessions` -- OAuth flow state management
- `gpt_audit_log` -- all GPT-initiated actions

### 3. Auth Integration (Clerk + Custom OAuth)

**Two auth systems coexist, never overlap:**

| System | Used By | Validated By | Token Format |
|--------|---------|-------------|-------------|
| Clerk JWT | Portal app, Candidate app | api-gateway AuthMiddleware | JWT signed by Clerk |
| GPT tokens | ChatGPT Custom GPT | gpt-service auth middleware | Opaque token (DB lookup) |

**Critical rule:** GPT tokens and Clerk JWTs never mix. The api-gateway does NOT validate GPT tokens. The gpt-service does NOT validate Clerk JWTs. The bridge between them is the `clerk_user_id` stored in the `gpt_tokens` table, which was established during the OAuth flow.

### 4. AI Service Integration

For resume analysis and fit scoring, gpt-service needs AI capabilities. Two options:

**Option A: Direct AI calls from gpt-service (RECOMMENDED)**
- gpt-service calls OpenAI API directly for GPT-specific AI tasks
- Uses its own `OPENAI_API_KEY` env var
- Keeps AI logic GPT-specific (prompt formatting, response parsing)
- No dependency on existing ai-service

**Option B: Internal service call to ai-service**
- gpt-service calls ai-service via `x-internal-service-key` header
- Reuses existing AI review infrastructure
- Creates coupling between services

**Recommendation: Option A.** The GPT AI tasks (resume parsing for GPT responses, natural language query interpretation) are different from existing ai-service tasks (formal fit analysis for ATS). Keeping them separate follows nano-service philosophy and avoids coupling.

### 5. Document Service Integration (Resume Uploads)

For resume analysis, the GPT needs to handle file uploads. ChatGPT sends files as part of the action request.

**Approach:** gpt-service uses Supabase Storage SDK directly (same pattern as document-service).
- Receives file from ChatGPT action
- Stores in Supabase Storage bucket (`gpt-uploads/`)
- Processes/analyzes the resume
- Returns analysis to GPT

This avoids HTTP calls to document-service while reusing the same storage backend.

## gpt-service Internal Architecture

Following the V2 service pattern established in the codebase:

```
services/gpt-service/
├── Dockerfile
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts                          # Entry point, Fastify server setup
    ├── v2/
    │   ├── shared/
    │   │   ├── auth.ts                   # GPT token validation middleware
    │   │   ├── events.ts                 # EventPublisher for audit
    │   │   ├── helpers.ts                # Common helpers
    │   │   └── pagination.ts             # Reuse shared pagination
    │   ├── oauth/
    │   │   ├── types.ts                  # OAuth types (AuthCode, Token, Client)
    │   │   ├── repository.ts             # oauth_clients, gpt_auth_codes, gpt_tokens CRUD
    │   │   ├── service.ts                # OAuth flow logic (validate, issue, refresh, revoke)
    │   │   └── routes.ts                 # /authorize, /callback, /token, /revoke
    │   ├── jobs/
    │   │   ├── types.ts                  # GPT job search types
    │   │   ├── repository.ts             # Job queries (read from existing jobs table)
    │   │   ├── service.ts                # Search logic, natural language parsing
    │   │   └── routes.ts                 # GET /api/v1/gpt/jobs
    │   ├── applications/
    │   │   ├── types.ts                  # GPT application types
    │   │   ├── repository.ts             # Application queries/writes
    │   │   ├── service.ts                # Confirmation enforcement, status logic
    │   │   └── routes.ts                 # GET/POST /api/v1/gpt/applications
    │   ├── resume/
    │   │   ├── types.ts                  # Resume analysis types
    │   │   ├── service.ts                # AI-powered resume parsing + fit scoring
    │   │   └── routes.ts                 # POST /api/v1/gpt/resume/analyze
    │   └── routes.ts                     # Route registry
    └── openapi/
        └── schema.yaml                   # OpenAPI 3.0 spec served at /.well-known/openapi.yaml
```

### GPT Token Validation Middleware

```typescript
// services/gpt-service/src/v2/shared/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { SupabaseClient } from '@supabase/supabase-js';
import { AccessContextResolver } from '@splits-network/shared-access-context';

export interface GptAuthContext {
    tokenId: string;
    clerkUserId: string;
    scope: string;
    // AccessContext fields resolved from clerkUserId
    candidateId: string | null;
    identityUserId: string | null;
}

export class GptAuthMiddleware {
    private accessResolver: AccessContextResolver;

    constructor(private supabase: SupabaseClient) {
        this.accessResolver = new AccessContextResolver(supabase);
    }

    createMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                return reply.status(401).send({
                    error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' }
                });
            }

            const token = authHeader.substring(7);

            // Look up token in database
            const { data: tokenRecord, error } = await this.supabase
                .from('gpt_tokens')
                .select('id, clerk_user_id, scope, expires_at, revoked_at')
                .eq('access_token_hash', this.hashToken(token))
                .is('revoked_at', null)
                .maybeSingle();

            if (error || !tokenRecord) {
                return reply.status(401).send({
                    error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
                });
            }

            // Check expiry
            if (new Date(tokenRecord.expires_at) < new Date()) {
                return reply.status(401).send({
                    error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' }
                });
            }

            // Resolve full access context from clerk_user_id
            const context = await this.accessResolver.resolve(tokenRecord.clerk_user_id);

            // Attach GPT auth context to request
            (request as any).gptAuth = {
                tokenId: tokenRecord.id,
                clerkUserId: tokenRecord.clerk_user_id,
                scope: tokenRecord.scope,
                candidateId: context.candidateId,
                identityUserId: context.identityUserId,
            } as GptAuthContext;
        };
    }

    private hashToken(token: string): string {
        // SHA-256 hash for secure token storage
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}
```

## Database Schema

### New Tables

```sql
-- OAuth2 client registration (the Custom GPT itself)
CREATE TABLE oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT UNIQUE NOT NULL,          -- Public client identifier
    client_secret_hash TEXT NOT NULL,         -- SHA-256 hash of client secret
    name TEXT NOT NULL,                       -- "Applicant Network GPT"
    redirect_uris TEXT[] NOT NULL,            -- Allowed callback URLs
    scopes TEXT[] NOT NULL DEFAULT '{candidate}', -- Allowed scopes
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Short-lived authorization codes (10 minute TTL)
CREATE TABLE gpt_auth_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,               -- The authorization code
    client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
    clerk_user_id TEXT NOT NULL,             -- User who authorized
    scope TEXT NOT NULL DEFAULT 'candidate',
    redirect_uri TEXT NOT NULL,              -- Must match on exchange
    expires_at TIMESTAMPTZ NOT NULL,         -- code + 10 minutes
    used_at TIMESTAMPTZ,                     -- Set when exchanged (prevents replay)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Access and refresh tokens
CREATE TABLE gpt_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id TEXT NOT NULL REFERENCES oauth_clients(client_id),
    clerk_user_id TEXT NOT NULL,
    access_token_hash TEXT UNIQUE NOT NULL,   -- SHA-256 of access token
    refresh_token_hash TEXT UNIQUE,           -- SHA-256 of refresh token
    scope TEXT NOT NULL DEFAULT 'candidate',
    access_token_expires_at TIMESTAMPTZ NOT NULL,  -- 1 hour
    refresh_token_expires_at TIMESTAMPTZ,          -- 30 days
    revoked_at TIMESTAMPTZ,                        -- Null = active
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for token lookup performance
CREATE INDEX idx_gpt_tokens_access_hash ON gpt_tokens(access_token_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_gpt_tokens_refresh_hash ON gpt_tokens(refresh_token_hash) WHERE revoked_at IS NULL;
CREATE INDEX idx_gpt_tokens_clerk_user ON gpt_tokens(clerk_user_id);
CREATE INDEX idx_gpt_auth_codes_code ON gpt_auth_codes(code) WHERE used_at IS NULL;

-- OAuth flow session state
CREATE TABLE gpt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT UNIQUE NOT NULL,              -- CSRF state parameter
    client_id TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'candidate',
    redirect_uri TEXT NOT NULL,
    clerk_redirect_url TEXT,                 -- Where to redirect after Clerk login
    expires_at TIMESTAMPTZ NOT NULL,         -- 15 minute TTL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log for all GPT-initiated actions
CREATE TABLE gpt_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES gpt_tokens(id),
    clerk_user_id TEXT NOT NULL,
    action TEXT NOT NULL,                    -- e.g., 'search_jobs', 'submit_application'
    endpoint TEXT NOT NULL,                  -- e.g., 'GET /api/v1/gpt/jobs'
    request_summary JSONB,                   -- Sanitized request params
    response_status INTEGER NOT NULL,
    confirmed BOOLEAN DEFAULT false,         -- For write actions
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gpt_audit_log_user ON gpt_audit_log(clerk_user_id);
CREATE INDEX idx_gpt_audit_log_created ON gpt_audit_log(created_at);
```

### Token Lifecycle

| State | access_token | refresh_token | access_token_expires_at | revoked_at |
|-------|-------------|---------------|------------------------|------------|
| Active | hash present | hash present | future | NULL |
| Access expired | hash present | hash present | past | NULL |
| Refreshed | NEW hash | same or new | future | NULL (old row revoked) |
| Revoked | hash present | hash present | any | SET |

**Token durations:**
- Access token: 1 hour (short-lived, limits blast radius)
- Refresh token: 30 days (allows persistent session)
- Authorization code: 10 minutes (one-time use)
- OAuth session state: 15 minutes (login flow timeout)

## Key Decision: gpt-service Goes Through api-gateway

**Decision:** GPT requests route through api-gateway, NOT directly to gpt-service via separate ingress.

**Rationale:**

1. **Single ingress point** -- all api.splits.network traffic goes through api-gateway. Adding a second ingress for GPT creates operational complexity (separate TLS certs, separate rate limiting, separate CORS).

2. **Rate limiting** -- api-gateway already has Redis-backed rate limiting. GPT requests benefit from this without reimplementing.

3. **Observability** -- all requests logged in one place with correlation IDs.

4. **CORS irrelevant** -- ChatGPT makes server-to-server calls, not browser calls. CORS doesn't apply. The api-gateway's CORS config won't block GPT requests because they aren't browser-origin requests.

5. **Auth skip is trivial** -- adding one `if (request.url.startsWith('/api/v1/gpt/'))` check to the auth hook is a 1-line change.

**Alternative considered:** Separate K8s ingress for gpt-service at e.g., `gpt.splits.network`. Rejected because it adds infrastructure complexity for no real benefit. The api-gateway proxy is lightweight (same pattern as all other services).

## Key Decision: Opaque Tokens (Not JWTs)

**Decision:** GPT access tokens are opaque random strings, validated via database lookup.

**Rationale:**

1. **Revocation** -- JWTs can't be revoked before expiry without a blacklist (which is just a database lookup anyway). Opaque tokens can be instantly revoked by setting `revoked_at`.

2. **Simplicity** -- no JWT signing keys to manage, no key rotation, no JWT library needed in gpt-service.

3. **Security** -- token value is never stored (only hash), so database compromise doesn't leak usable tokens.

4. **Performance** -- single indexed DB lookup per request is fast enough. At GPT scale (tens of requests per user per session, not thousands per second), DB validation is not a bottleneck.

**Alternative considered:** JWT access tokens with short expiry. Would eliminate DB lookup per request but makes revocation complex and adds JWT infrastructure. Not worth it at GPT scale.

## Key Decision: /api/v1/gpt/* Namespace

**Decision:** GPT endpoints live under `/api/v1/gpt/` not `/api/v2/`.

**Rationale:**

1. **Separate API surface** -- GPT API serves a different client (ChatGPT) with different auth, different response formats, different rate limits. It's not a v2 extension.

2. **Versioning independence** -- GPT API can evolve independently of the main v2 API. When GPT needs v2, it becomes `/api/v2/gpt/`.

3. **Clean auth boundary** -- api-gateway can skip Clerk auth for all `/api/v1/gpt/*` in one rule.

4. **OpenAPI isolation** -- GPT Actions require their own OpenAPI schema. Keeping the namespace separate makes the schema self-contained.

## Key Decision: Direct DB Access (Not Service-to-Service HTTP)

**Decision:** gpt-service queries the Supabase database directly for jobs, applications, candidates data.

**Rationale:**

1. **Codebase rule** -- CLAUDE.md explicitly states "No HTTP calls between services -- use direct database queries or RabbitMQ events."

2. **Performance** -- direct DB query is faster than gpt-service -> api-gateway -> ats-service -> DB -> ats-service -> api-gateway -> gpt-service.

3. **Existing pattern** -- all V2 services access the shared Supabase database directly. gpt-service is no different.

4. **Access control** -- gpt-service uses `resolveAccessContext(clerkUserId)` from `shared-access-context` package, same as all other services.

**What gpt-service reads from existing tables:**
- `jobs` (with `companies` join) -- job search, job details
- `candidates` -- candidate profile for the authenticated user
- `applications` (with `jobs` join) -- application status, history
- `users`, `memberships`, `user_roles` -- via resolveAccessContext (automatic)

**What gpt-service writes to existing tables:**
- `applications` -- creating new applications (with confirmation enforcement)
- `gpt_audit_log` -- logging all actions (new table, owned by gpt-service)

## OpenAPI Schema Strategy

**Decision:** Serve a static OpenAPI 3.0 YAML file at a well-known endpoint.

**How Custom GPT Actions work (from training data, MEDIUM confidence):**
1. When configuring a Custom GPT, you paste or link an OpenAPI schema
2. ChatGPT reads the schema to understand available endpoints
3. `operationId` values become the action names the GPT can invoke
4. `description` fields on operations and parameters guide the GPT's understanding
5. The schema must include server URL and auth configuration

**Schema serving approach:**
```typescript
// services/gpt-service/src/v2/routes.ts
import fs from 'fs';
import path from 'path';

// Serve OpenAPI schema for GPT configuration
app.get('/api/v1/gpt/openapi.yaml', async (request, reply) => {
    const schemaPath = path.join(__dirname, '../openapi/schema.yaml');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    reply.header('Content-Type', 'text/yaml').send(schema);
});

// Also serve at well-known path
app.get('/.well-known/openapi.yaml', async (request, reply) => {
    const schemaPath = path.join(__dirname, '../openapi/schema.yaml');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    reply.header('Content-Type', 'text/yaml').send(schema);
});
```

**Schema structure:**
```yaml
openapi: 3.0.1
info:
  title: Applicant Network GPT API
  version: 1.0.0
  description: >
    API for the Applicant Network Custom GPT. Enables job search,
    resume analysis, application management via natural language.
servers:
  - url: https://api.splits.network
security:
  - OAuth2: [candidate]
components:
  securitySchemes:
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://api.splits.network/api/v1/gpt/oauth/authorize
          tokenUrl: https://api.splits.network/api/v1/gpt/oauth/token
          scopes:
            candidate: Access candidate features (jobs, applications, resume)
paths:
  /api/v1/gpt/jobs:
    get:
      operationId: searchJobs
      summary: Search for job postings
      description: >
        Search available job postings by keywords, location, salary range,
        commute type, and job level. Returns paginated results.
      parameters:
        - name: keywords
          in: query
          schema:
            type: string
          description: Search terms (job title, skills, company name)
        - name: location
          in: query
          schema:
            type: string
          description: City, state, or "remote"
        # ... more parameters
      responses:
        '200':
          description: Job search results
          # ... schema
  # ... more paths
```

**OpenAPI requirements for GPT Actions (MEDIUM confidence, from training):**
- Must be OpenAPI 3.0 (not 3.1 -- ChatGPT may not support 3.1 yet)
- operationId is required and must be unique
- Descriptions are critical -- the GPT uses them to decide when to call each action
- Maximum ~30 endpoints per GPT (practical limit)
- Request bodies should be simple, flat objects when possible
- Response schemas help the GPT format output

## Patterns to Follow

### Pattern 1: Confirmation Safety for Write Actions

**What:** All mutation endpoints require `confirmed: true` in the request body. If missing, return a CONFIRMATION_REQUIRED error with a summary of what will happen.

**When:** Any POST/PATCH/DELETE endpoint that modifies data.

**Why:** Prevents the AI from accidentally executing actions. Forces a human-in-the-loop confirmation step within the ChatGPT conversation.

**Example:**
```typescript
// services/gpt-service/src/v2/applications/service.ts
async createApplication(
    clerkUserId: string,
    data: { jobId: string; confirmed?: boolean }
): Promise<any> {
    // Load job details for confirmation summary
    const job = await this.jobRepository.findJob(data.jobId);
    if (!job) throw new Error('Job not found');

    // Resolve user's candidate profile
    const context = await this.accessResolver.resolve(clerkUserId);
    if (!context.candidateId) {
        throw new Error('No candidate profile found. Please create a profile first.');
    }

    // Confirmation check
    if (!data.confirmed) {
        return {
            status: 'CONFIRMATION_REQUIRED',
            message: 'Please confirm you want to submit this application.',
            summary: {
                job_title: job.title,
                company: job.company?.name,
                location: job.location,
                salary_range: job.salary_min && job.salary_max
                    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                    : 'Not specified',
            },
            instruction: 'Call this endpoint again with confirmed: true to proceed.'
        };
    }

    // Execute the write
    const application = await this.applicationRepository.create({
        job_id: data.jobId,
        candidate_id: context.candidateId,
        status: 'draft',
        source: 'gpt',  // Track GPT-originated applications
        created_at: new Date().toISOString(),
    }, clerkUserId);

    // Audit log
    await this.auditLog('submit_application', clerkUserId, {
        application_id: application.id,
        job_id: data.jobId,
        confirmed: true,
    });

    return { status: 'SUCCESS', application };
}
```

### Pattern 2: GPT-Optimized Response Format

**What:** GPT responses should be concise, structured, and include only fields the GPT needs to present to the user. No internal IDs unless needed for follow-up actions.

**When:** All GPT API endpoints.

**Why:** ChatGPT has a context window. Sending full database rows wastes tokens and confuses the model. Lean responses produce better GPT outputs.

**Example:**
```typescript
// Transform job for GPT consumption (not raw DB row)
function formatJobForGpt(job: any): GptJobResult {
    return {
        id: job.id,  // Needed for "apply to this job" follow-up
        title: job.title,
        company: job.company?.name || 'Unknown',
        location: job.location || 'Not specified',
        commute_type: job.commute_types?.join(', ') || 'Not specified',
        job_level: job.job_level || 'Not specified',
        salary_range: formatSalaryRange(job.salary_min, job.salary_max),
        posted: formatRelativeDate(job.created_at),  // "3 days ago" not ISO timestamp
        description_preview: truncate(job.description, 200),  // Short preview
        // Intentionally omit: internal_notes, job_owner_id, organization_id, etc.
    };
}
```

### Pattern 3: Scope-Restricted Access

**What:** GPT tokens are scoped to `candidate` role. Even if the underlying Clerk user has recruiter/admin roles, GPT access is limited to candidate-level operations.

**When:** All GPT API endpoints.

**Why:** Security principle of least privilege. The GPT should only access what a candidate needs -- not admin functions, not recruiter functions.

**Example:**
```typescript
// GPT auth middleware enforces scope
if (gptAuth.scope !== 'candidate') {
    return reply.status(403).send({
        error: { code: 'SCOPE_DENIED', message: 'This GPT only supports candidate operations' }
    });
}

// Even if user is a platform_admin, GPT sees candidate-level data
// Override isPlatformAdmin for GPT requests
const context = await this.accessResolver.resolve(gptAuth.clerkUserId);
const gptContext = {
    ...context,
    isPlatformAdmin: false,  // Never admin via GPT
    roles: ['candidate'],     // Force candidate scope
};
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Proxying GPT Requests Through Other Services

**What:** gpt-service calls ats-service HTTP endpoints to get job data.

**Why bad:** Violates "no HTTP between services" rule. Adds latency. Creates coupling.

**Instead:** gpt-service queries Supabase directly using its own repository layer.

### Anti-Pattern 2: Sharing Clerk JWTs as GPT Tokens

**What:** Using Clerk JWTs directly as the OAuth2 access token.

**Why bad:** Clerk JWTs are issued for browser sessions with specific audience/issuer claims. ChatGPT can't obtain Clerk JWTs. You'd need Clerk to issue tokens for ChatGPT as a client, which isn't how Clerk works.

**Instead:** gpt-service is a custom OAuth2 provider. It issues its own opaque tokens. Clerk is only used during the authorization flow to verify the user's identity.

### Anti-Pattern 3: Storing Tokens in Plaintext

**What:** Storing access_token and refresh_token values directly in the database.

**Why bad:** Database breach exposes all active tokens. Tokens can be used to impersonate users.

**Instead:** Store SHA-256 hashes of tokens. Generate tokens with `crypto.randomBytes(32).toString('hex')`, store `crypto.createHash('sha256').update(token).digest('hex')`. Validate by hashing the incoming token and comparing to stored hash.

### Anti-Pattern 4: Returning Full Database Rows to GPT

**What:** Sending `reply.send({ data: rawDbRow })` from GPT endpoints.

**Why bad:** Leaks internal fields (organization_id, deleted_at, internal_notes). Wastes GPT context window with irrelevant data. Produces worse GPT responses.

**Instead:** Transform all responses through GPT-specific formatter functions that select only user-relevant fields.

### Anti-Pattern 5: Separate Ingress for GPT Service

**What:** Creating a new K8s ingress at `gpt.splits.network` pointing directly to gpt-service.

**Why bad:** Bypasses rate limiting, CORS, logging, correlation IDs. Two ingresses to manage. ChatGPT OpenAPI schema references a different domain.

**Instead:** Route through api-gateway at `api.splits.network/api/v1/gpt/*`. One ingress, one domain, consistent infrastructure.

## Scalability Considerations

| Concern | At 100 GPT users | At 10K GPT users | At 100K GPT users |
|---------|-------------------|-------------------|--------------------|
| **Token validation** | DB lookup per request (~5ms) | Same, indexed query | Add Redis token cache (30s TTL) |
| **gpt-service pods** | 1 pod | 2 pods | 3-5 pods (stateless, horizontal) |
| **Token storage** | Hundreds of rows | Tens of thousands | Partition by created_at, auto-expire old tokens |
| **Rate limiting** | api-gateway default | Per-user GPT throttle (lower than web) | Per-user + global GPT ceiling |
| **Audit log** | Small table | Index on created_at | Partition by month, archive old |

## Suggested Build Order

Based on dependency analysis of the architecture:

### Phase 1: Foundation (OAuth + Token Infrastructure)
**Build in this order:**
1. Database migration (oauth_clients, gpt_tokens, gpt_auth_codes, gpt_sessions, gpt_audit_log)
2. gpt-service scaffold (Fastify server, health check, basic config)
3. Token generation and validation (hash, store, lookup)
4. OAuth routes (/authorize, /callback, /token, /revoke)
5. api-gateway integration (auth skip, proxy routes, service registration)

**Why first:** Everything else depends on authentication working. Can't test any GPT endpoint without a valid token flow.

### Phase 2: Core GPT Endpoints
**Build in this order:**
1. Job search endpoint (read-only, simplest)
2. Application status endpoint (read-only)
3. Application submission endpoint (write with confirmation)
4. Resume analysis endpoint (AI integration)

**Why second:** These are the actual GPT Actions. Build read endpoints first (safer, simpler), then writes (need confirmation pattern).

### Phase 3: OpenAPI Schema + GPT Configuration
**Build in this order:**
1. OpenAPI 3.0 schema (YAML file documenting all endpoints)
2. Schema serving endpoint
3. GPT Instructions document
4. Custom GPT configuration in OpenAI platform

**Why third:** Schema documents what was built in Phase 2. Can't configure the GPT until endpoints exist.

### Phase 4: Production Hardening
1. GPT-specific rate limiting (per-user throttle)
2. Audit log integration
3. Token cleanup cron job (expire old tokens)
4. Monitoring and alerting
5. K8s deployment manifest

## Sources

**HIGH confidence (codebase analysis):**
- `services/api-gateway/src/auth.ts` -- Clerk JWT validation pattern, multi-tenant auth
- `services/api-gateway/src/index.ts` -- Auth skip patterns, service registration, rate limiting
- `services/api-gateway/src/routes/v2/common.ts` -- Standard proxy pattern
- `services/api-gateway/src/helpers/auth-headers.ts` -- x-clerk-user-id forwarding
- `packages/shared-access-context/src/index.ts` -- resolveAccessContext, AccessContext interface
- `services/ats-service/src/v2/jobs/service.ts` -- V2 service pattern with AccessContextResolver
- `infra/k8s/ingress.yaml` -- Current ingress routing (api.splits.network -> api-gateway)
- `infra/k8s/api-gateway/deployment.yaml` -- Service URL env vars, resource config
- `docs/deployment/internal-service-authentication.md` -- Internal service key pattern
- `docs/guidance/service-architecture-pattern.md` -- V2 service file structure
- `docs/gpt/01_PRD_Custom_GPT.md` -- Product requirements
- `docs/gpt/02_Architecture_Custom_GPT.md` -- Architecture overview
- `docs/gpt/03_Technical_Specification.md` -- Technical spec
- `docs/gpt/04_OpenAPI_Starter.yaml` -- OpenAPI starter schema

**MEDIUM confidence (training data, not live-verified):**
- OpenAI Custom GPT Actions OAuth2 specification -- based on training data through May 2025. The OAuth2 flow (authorization code grant) is standard; specific GPT Actions requirements (e.g., exact callback URL format, supported OpenAPI versions) should be verified against current OpenAI documentation before implementation.
- OpenAPI 3.0 schema requirements for GPT Actions -- general structure is well-understood, but edge cases (max endpoints, field length limits, supported auth schemes) should be verified.

**LOW confidence (needs validation during implementation):**
- Exact ChatGPT OAuth callback URL format (`https://chatgpt.com/aip/<plugin_id>/oauth/callback` vs other patterns) -- verify in OpenAI GPT configuration UI
- Whether GPT Actions support refresh tokens or only access tokens -- verify in OpenAI docs
- Maximum number of actions per GPT -- anecdotal "~30" from training data
- Whether OpenAPI 3.1 is supported -- recommend 3.0 to be safe, verify later
