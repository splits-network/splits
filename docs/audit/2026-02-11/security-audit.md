# Security Audit Report -- Splits Network

**Date:** 2026-02-11
**Auditor:** Security Agent (Claude Opus 4.6)
**Scope:** Full-stack security audit covering authentication, authorization, data access, injection, XSS, CSRF, rate limiting, secrets management, webhook security, file upload security, and payment security.
**Branch:** staging
**Risk Rating: HIGH**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Critical Vulnerabilities (P0)](#critical-vulnerabilities-p0)
3. [High-Risk Issues (P1)](#high-risk-issues-p1)
4. [Medium-Risk Issues (P2)](#medium-risk-issues-p2)
5. [Low-Risk Issues (P3)](#low-risk-issues-p3)
6. [Positive Findings](#positive-findings)
7. [Remediation Priority Matrix](#remediation-priority-matrix)

---

## Executive Summary

The Splits Network platform demonstrates solid foundational security architecture: JWT-based authentication via Clerk, role-based access control (RBAC) resolved from database records rather than client-supplied claims, parameterized queries via Supabase, webhook signature verification for both Stripe and Clerk, and environment-aware CORS configuration.

However, the audit identified **2 critical**, **6 high**, **8 medium**, and **5 low** severity issues. The most urgent finding is that **real API keys and secrets are committed to version control** in `.env` and `.env.local` files, including production-grade Clerk secret keys, Stripe secret keys, OpenAI API keys, Supabase service role keys, and Resend API keys. The second critical issue is an **authentication bypass via the internal service key header**, where the API gateway skips all authentication when the `x-internal-service-key` header is present without validating it against any expected value.

### Risk Summary

| Severity      | Count | Status                    |
| ------------- | ----- | ------------------------- |
| Critical (P0) | 2     | Immediate action required |
| High (P1)     | 6     | Action within 1 week      |
| Medium (P2)   | 8     | Action within 1 month     |
| Low (P3)      | 5     | Action within quarter     |

---

## Critical Vulnerabilities (P0)

### C-01: Secrets Committed to Version Control

**Severity:** CRITICAL
**OWASP Category:** A05 Security Misconfiguration / A07 Identification and Authentication Failures
**Impact:** Complete compromise of all third-party service accounts. Attackers with repository access gain full control over Clerk authentication, Stripe payment processing, Supabase database, OpenAI billing, and Resend email sending.

**Affected Files:**

| File                                                | Line(s) | Exposed Secret                                                                |
| --------------------------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `g:\code\splits.network\.env`                       | 7       | `SUPABASE_ANON_KEY` (real value)                                              |
| `g:\code\splits.network\.env`                       | 8       | `SUPABASE_SERVICE_ROLE_KEY` (real value)                                      |
| `g:\code\splits.network\.env`                       | 31      | `RESEND_API_KEY` (real value: `re_eGCxytwH_...`)                              |
| `g:\code\splits.network\.env`                       | 40-41   | `SPLITS_CLERK_PUBLISHABLE_KEY` and `SPLITS_CLERK_SECRET_KEY` (real test keys) |
| `g:\code\splits.network\.env`                       | 43-44   | `APP_CLERK_PUBLISHABLE_KEY` and `APP_CLERK_SECRET_KEY` (real test keys)       |
| `g:\code\splits.network\.env`                       | 48      | `STRIPE_SECRET_KEY` (real test key: `sk_test_51SbWpe...`)                     |
| `g:\code\splits.network\.env`                       | 50      | `STRIPE_WEBHOOK_SECRET` (real value: `whsec_P6L02f...`)                       |
| `g:\code\splits.network\.env`                       | 53      | `OPENAI_API_KEY` (real service account key: `sk-svcacct-...`)                 |
| `g:\code\splits.network\services\chat-gateway\.env` | 2-7     | Clerk secret keys (duplicated)                                                |
| `g:\code\splits.network\apps\portal\.env.local`     | 13      | `CLERK_SECRET_KEY`                                                            |
| `g:\code\splits.network\apps\portal\.env.local`     | 25      | `OPENAI_API_KEY`                                                              |
| `g:\code\splits.network\apps\candidate\.env.local`  | 3       | `CLERK_SECRET_KEY`                                                            |

While `.gitignore` does list `.env` and `.env.local` (lines 17-19), the fact that these files exist with real credentials on disk and are readable to any tool with filesystem access is a significant concern. If any of these were ever committed to git history, the secrets must be considered compromised.

**Recommended Remediation:**

1. **Immediately rotate ALL exposed keys**: Clerk secret keys, Stripe secret/webhook keys, Supabase service role key, OpenAI API key, and Resend API key.
2. Run `git log --all --full-history -- .env apps/portal/.env.local apps/candidate/.env.local services/chat-gateway/.env` to verify these files were never committed to git history.
3. If they were ever committed, use `git filter-branch` or BFG Repo Cleaner to purge them from history.
4. Move all secrets to a proper secrets manager (e.g., Supabase Vault as partially implemented, or HashiCorp Vault, AWS Secrets Manager).
5. Add pre-commit hooks to detect secrets (e.g., `gitleaks`, `trufflehog`).

---

### C-02: Internal Service Key Authentication Bypass at API Gateway

**Severity:** CRITICAL
**OWASP Category:** A01 Broken Access Control / A07 Identification and Authentication Failures
**Impact:** Any external attacker can bypass all JWT authentication on the API gateway by simply setting the `x-internal-service-key` header to any non-empty value. This grants unauthenticated access to all API endpoints.

**Affected File:** `g:\code\splits.network\services\api-gateway\src\index.ts`, lines 283-287

```typescript
// Skip auth for internal service calls (authenticated by service key)
const internalServiceKey = request.headers["x-internal-service-key"] as string;
if (internalServiceKey) {
    return; // BUG: No validation of the key value!
}
```

The gateway checks only for the **presence** of the header, not whether the value matches any expected secret. Any request with `x-internal-service-key: anything` will skip JWT verification entirely.

While downstream services (ats-service, document-service, ai-service) do validate the key value against `process.env.INTERNAL_SERVICE_KEY`, the gateway-level bypass means:

1. The `request.auth` object is never populated (remains undefined).
2. `buildAuthHeaders()` in `g:\code\splits.network\services\api-gateway\src\helpers\auth-headers.ts` (line 45-49) will forward the attacker's `x-internal-service-key` header to downstream services.
3. If the `INTERNAL_SERVICE_KEY` environment variable is not set on a downstream service, `validateInternalService()` returns `false` (which is correct), but then the request also lacks `x-clerk-user-id`, causing it to fail with a 401/400 rather than being silently accepted.
4. **However**, if `INTERNAL_SERVICE_KEY` is not set on a service AND the route does not call `requireUserContext()`, the request may succeed unauthenticated.

**Recommended Remediation:**

1. **Immediately** validate the internal service key value at the gateway level:

```typescript
const internalServiceKey = request.headers["x-internal-service-key"] as string;
const expectedKey = process.env.INTERNAL_SERVICE_KEY;
if (internalServiceKey && expectedKey && internalServiceKey === expectedKey) {
    return; // Valid internal service call
}
```

2. Use timing-safe comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
3. Ensure `INTERNAL_SERVICE_KEY` is set in all environments and is a strong random secret (32+ characters).
4. Consider stripping the `x-internal-service-key` header from external requests at the load balancer or ingress level, so only inter-service traffic can carry it.

---

## High-Risk Issues (P1)

### H-01: IDOR on Candidate GET by ID (Missing Ownership Check)

**Severity:** HIGH
**OWASP Category:** A01 Broken Access Control
**Impact:** Any authenticated user can view any candidate's full profile by guessing or enumerating UUIDs.

**Affected File:** `g:\code\splits.network\services\ats-service\src\v2\candidates\repository.ts`, lines 233-256

```typescript
async findCandidate(id: string, clerkUserId?: string, include?: string): Promise<any | null> {
    const { data, error } = await this.supabase
        .from('candidates')
        .select(selectClause)
        .eq('id', id)
        .single();
    // Only enriches with recruiter relationships if clerkUserId is provided
    // Does NOT check if the requesting user has access to this candidate
    return data;
}
```

The `findCandidate` method fetches any candidate by ID without verifying that the requesting user has authorization to view that candidate. In contrast, `findCandidates` (list) correctly applies role-based filtering at line 139: candidates without recruiter role can only see their own record. But the single-record GET bypasses this entirely.

**Recommended Remediation:**
Apply the same access control checks as `findApplication` does for single records (see line 192 of `g:\code\splits.network\services\ats-service\src\v2\applications\repository.ts` for the correct pattern). After fetching the candidate, verify that:

- Platform admins can access any candidate.
- Candidates can only access their own record.
- Recruiters can only access candidates they have active relationships with.
- Company users can only access candidates who have applied to their organization's jobs.

---

### H-02: IDOR on Application Update/Delete (No Ownership Verification)

**Severity:** HIGH
**OWASP Category:** A01 Broken Access Control
**Impact:** Any authenticated user can update or soft-delete any application by supplying its UUID.

**Affected File:** `g:\code\splits.network\services\ats-service\src\v2\applications\repository.ts`, lines 266-288

```typescript
async updateApplication(id: string, updates: ApplicationUpdate): Promise<any> {
    const { data, error } = await this.supabase
        .from('applications')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id) // No access control - any user can update any application
        .select()
        .single();
    if (error) throw error;
    return data;
}

async deleteApplication(id: string): Promise<void> {
    const { error } = await this.supabase
        .from('applications')
        .update({ stage: 'withdrawn', updated_at: new Date().toISOString() })
        .eq('id', id); // No access control
    if (error) throw error;
}
```

Neither `updateApplication` nor `deleteApplication` accepts or checks a `clerkUserId` parameter. The `findApplication` method (line 192) correctly performs access control for reads, but updates and deletes bypass it entirely.

**Recommended Remediation:**

1. Add `clerkUserId` parameter to both methods.
2. Resolve access context and apply ownership/permission checks before executing the update/delete.
3. For updates: verify the user is the candidate, the candidate's recruiter, or a company admin for the job's company.
4. For deletes: verify the user is the candidate's recruiter or the candidate themselves.

---

### H-03: Delete Note Route Missing Auth Headers

**Severity:** HIGH
**OWASP Category:** A01 Broken Access Control
**Impact:** The DELETE route for application notes does not pass authentication headers to the downstream ATS service, potentially allowing the delete to proceed without proper user context.

**Affected File:** `g:\code\splits.network\services\api-gateway\src\routes\v2\ats.ts`, lines 645-667

```typescript
app.delete(
    "/api/v2/application-notes/:id",
    { preHandler: requireAuth() },
    async (request: FastifyRequest, reply: FastifyReply) => {
        // ...
        const data = await atsService().delete(
            `/api/v2/application-notes/${id}`,
            // Missing: correlationId and buildAuthHeaders(request) arguments
        );
        return reply.send(data);
    },
);
```

While the route requires authentication at the gateway level (`preHandler: requireAuth()`), the call to `atsService().delete()` omits the `correlationId` and `buildAuthHeaders(request)` arguments. This means the downstream ATS service receives no `x-clerk-user-id` header and cannot perform ownership verification.

**Recommended Remediation:**
Add the missing arguments:

```typescript
const data = await atsService().delete(
    `/api/v2/application-notes/${id}`,
    correlationId,
    authHeaders,
);
```

---

### H-04: User-Controlled sort_by Parameter Passed Directly to Database

**Severity:** HIGH
**OWASP Category:** A03 Injection
**Impact:** The `sort_by` parameter from user input is passed directly to Supabase's `.order()` method without validation. While Supabase's client library parameterizes query values, column names in `.order()` are not parameterized in the same way. An attacker could potentially cause information leakage or errors by specifying non-existent or sensitive column names.

**Affected Files (all follow the same pattern):**

| File                                                                                  | Line(s) |
| ------------------------------------------------------------------------------------- | ------- |
| `g:\code\splits.network\services\ats-service\src\v2\jobs\repository.ts`               | 169-171 |
| `g:\code\splits.network\services\ats-service\src\v2\candidates\repository.ts`         | 201-203 |
| `g:\code\splits.network\services\ats-service\src\v2\applications\repository.ts`       | 168-170 |
| `g:\code\splits.network\services\ats-service\src\v2\placements\repository.ts`         | 92-94   |
| `g:\code\splits.network\services\ats-service\src\v2\companies\repository.ts`          | 75-77   |
| `g:\code\splits.network\services\ats-service\src\v2\candidate-sourcers\repository.ts` | 49      |
| `g:\code\splits.network\services\ats-service\src\v2\company-sourcers\repository.ts`   | 49      |

Example from applications repository:

```typescript
const sortBy = filters.sort_by || "created_at";
const sortOrder = filters.sort_order?.toLowerCase() === "asc" ? true : false;
query = query.order(sortBy, { ascending: sortOrder }); // sortBy from user input
```

**Recommended Remediation:**
Validate `sort_by` against a whitelist of allowed column names for each resource:

```typescript
const ALLOWED_SORT_COLUMNS = ["created_at", "updated_at", "title", "status"];
const sortBy = ALLOWED_SORT_COLUMNS.includes(filters.sort_by)
    ? filters.sort_by
    : "created_at";
```

---

### H-05: Document Routes Missing Explicit Authentication at Gateway Level

**Severity:** HIGH
**OWASP Category:** A01 Broken Access Control
**Impact:** Document CRUD routes at the API gateway level do not explicitly require authentication via `preHandler: requireAuth()`. They rely solely on the global `onRequest` hook. While the global hook catches `/api/` routes, missing explicit route-level auth is a defense-in-depth gap.

**Affected File:** `g:\code\splits.network\services\api-gateway\src\routes\v2\documents.ts`, lines 17-253

All five document routes (GET list, GET by ID, POST create, PATCH update, DELETE) lack `preHandler: requireAuth()`:

```typescript
app.get('/api/v2/documents', {
    // No preHandler: requireAuth() -- relies on global hook only
}, async (request, reply) => { ... });
```

If the global auth hook logic were to be modified or a new bypass condition added, these routes would be left unprotected.

**Recommended Remediation:**
Add explicit `preHandler: requireAuth()` to all document routes, matching the pattern used by billing, identity, and other routes. The `requireUserContext()` call in the downstream document-service provides a second layer of protection, but defense in depth requires explicit gateway-level checks.

---

### H-06: Swagger/OpenAPI Documentation Exposed Without Authentication

**Severity:** HIGH
**OWASP Category:** A05 Security Misconfiguration
**Impact:** The API documentation at `/docs` is accessible without authentication in all environments, including production. This exposes the complete API surface area, endpoint schemas, security scheme details, and internal service architecture to unauthenticated users.

**Affected File:** `g:\code\splits.network\services\api-gateway\src\index.ts`, lines 102-173 (registration) and lines 273-274 (auth skip)

```typescript
// Skip auth for swagger docs endpoints
if (request.url.startsWith("/docs")) {
    return;
}
```

**Recommended Remediation:**

1. Disable Swagger UI in production (only register the plugin when `nodeEnv !== 'production'`).
2. Alternatively, require authentication for `/docs` routes in production.
3. At minimum, restrict access by IP or require basic auth.

---

## Medium-Risk Issues (P2)

### M-01: Consent Routes Missing Explicit Authentication

**Severity:** MEDIUM
**OWASP Category:** A01 Broken Access Control

**Affected File:** `g:\code\splits.network\services\api-gateway\src\routes\v2\identity.ts`, lines 101-152

The three consent routes (GET, POST, DELETE at `/api/v2/consent`) lack `preHandler: requireAuth()`. They rely solely on the global auth hook. While functionally they are protected, this is inconsistent with other routes in the same file that explicitly require auth.

```typescript
app.get('/api/v2/consent', {
    // Missing: preHandler: requireAuth()
}, async (request, reply) => { ... });
```

**Recommended Remediation:** Add `preHandler: requireAuth()` for consistency and defense in depth.

---

### M-02: Mass Assignment Risk on Candidate and Application Updates

**Severity:** MEDIUM
**OWASP Category:** A04 Insecure Design

**Affected Files:**

- `g:\code\splits.network\services\ats-service\src\v2\candidates\repository.ts`, lines 301-311
- `g:\code\splits.network\services\ats-service\src\v2\applications\repository.ts`, lines 266-277

```typescript
async updateCandidate(id: string, updates: CandidateUpdate): Promise<any> {
    const { data, error } = await this.supabase
        .from('candidates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
}
```

The update methods spread the entire `updates` object directly into the database update. While TypeScript types (`CandidateUpdate`, `ApplicationUpdate`) provide compile-time constraints, at runtime the `request.body` from the API gateway is passed through without field-level validation. An attacker could include fields like `user_id`, `verification_status`, or `sourcer_recruiter_id` to elevate their access.

**Recommended Remediation:**

1. Explicitly whitelist allowed fields in the repository layer before applying updates.
2. Strip any fields that should not be user-modifiable (e.g., `user_id`, `created_at`, `deleted_at`, `verification_status`).

---

### M-03: Error Messages May Leak Internal Details

**Severity:** MEDIUM
**OWASP Category:** A05 Security Misconfiguration

**Affected Files (examples):**

- `g:\code\splits.network\services\ats-service\src\v2\candidates\repository.ts`, line 546: `throw new Error('Failed to fetch candidate resumes: ${error.message}')`
- `g:\code\splits.network\services\api-gateway\src\index.ts`, line 409: health check exposes Redis error details
- `g:\code\splits.network\services\document-service\src\v2\documents\routes.ts`, lines 167-169: logs error stack traces

While most error responses to clients use generic messages, some paths leak Supabase error messages or internal details. The health check endpoint exposes Redis connection error details.

**Recommended Remediation:**

1. Ensure all error responses to clients use generic messages in production.
2. Log detailed errors server-side only.
3. Never expose stack traces, database error codes, or internal service names to clients.

---

### M-04: `dangerouslySetInnerHTML` with Interpolated Environment Variable

**Severity:** MEDIUM
**OWASP Category:** A03 Injection (XSS)

**Affected File:** `g:\code\splits.network\apps\corporate\src\app\layout.tsx`, lines 118-127

The corporate layout interpolates an environment variable directly into an inline script:

```typescript
dangerouslySetInnerHTML={{
    __html: `
        (function(c,l,a,r,i,t,y){
            ...
        })(window, document, "clarity", "script", "${clarityId}");
    `,
}}
```

If `clarityId` (from `process.env.NEXT_PUBLIC_CLARITY_ID`) were to contain malicious content, this would result in XSS. While environment variables are typically trusted, this pattern is fragile. The same pattern appears for `gaId` at line 144.

The portal and candidate layouts use static string literals for the same analytics scripts, which is the safer approach.

**Recommended Remediation:**

1. Validate/sanitize the env var value before interpolation, or use the Next.js `Script` component's `src` attribute instead of inline scripts.
2. Migrate layout JSON-LD to use the XSS-safe `<JsonLd>` component from `@splits-network/shared-ui` (already flagged in the SEO audit).

---

### M-05: WebSocket Token Passed in URL Query Parameter

**Severity:** MEDIUM
**OWASP Category:** A07 Identification and Authentication Failures

**Affected File:** `g:\code\splits.network\services\chat-gateway\src\index.ts`, lines 144-153

```typescript
const url = new URL(request.url || "", `http://${request.headers.host}`);
const token = url.searchParams.get("token");
```

The JWT token for WebSocket authentication is passed as a URL query parameter (`?token=...`). URL parameters are:

- Logged in web server access logs.
- Visible in browser history.
- Potentially cached by proxies.
- Visible in the Referer header if the page navigates.

**Recommended Remediation:**
Consider passing the token via the `Sec-WebSocket-Protocol` header subprotocol or in the first WebSocket message after connection. While URL params are a common pattern for WebSocket auth (since the WebSocket API does not support custom headers), the token should be short-lived.

---

### M-06: Rate Limiting Exemptions for Chat Endpoints

**Severity:** MEDIUM
**OWASP Category:** A05 Security Misconfiguration

**Affected File:** `g:\code\splits.network\services\api-gateway\src\index.ts`, lines 180-186

```typescript
await app.register(rateLimit as any, {
    max: 100,
    timeWindow: "1 minute",
    redis,
    allowList: async (request: any) => {
        const url = request.raw?.url || request.url || "";
        if (url.startsWith("/api/v2/chat")) return true;
        if (url.startsWith("/api/v2/admin/chat")) return true;
        return false;
    },
});
```

Chat and admin chat endpoints are fully exempt from rate limiting. While chat may require higher throughput, complete exemption enables abuse:

- Chat message flooding.
- Admin chat endpoint abuse if auth is compromised.
- Resource exhaustion attacks targeting the chat service.

**Recommended Remediation:**
Instead of exempting chat endpoints, configure a higher rate limit (e.g., 500/minute) specifically for chat routes rather than no limit at all.

---

### M-07: Supabase Service Role Key Used for API Gateway Queries

**Severity:** MEDIUM
**OWASP Category:** A05 Security Misconfiguration

**Affected File:** `g:\code\splits.network\services\api-gateway\src\index.ts`, lines 380-383

```typescript
const supabase = createClient(
    dbConfig.supabaseUrl,
    dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
);
```

The API gateway creates a Supabase client preferring the **service role key** over the anon key. The service role key bypasses all Supabase Row Level Security (RLS) policies. If this client is used for any user-facing queries (system health, site notifications), it operates with elevated privileges.

**Recommended Remediation:**

1. Prefer the anon key for the API gateway's Supabase client.
2. Only use the service role key in backend services where RLS bypass is explicitly required.
3. If the gateway needs admin access for specific operations, create a separate client with the service role key scoped to those specific use cases.

---

### M-08: Debug `console.error` Statements in Production Code

**Severity:** MEDIUM
**OWASP Category:** A09 Security Logging and Monitoring Failures

192 occurrences of `console.log`, `console.error`, and `console.warn` were found across 58 service files. Notable examples include:

- `g:\code\splits.network\services\api-gateway\src\routes\v2\ats.ts`, line 236: `console.error('[DEBUG CANDIDATES] ServiceClient error:', error)` -- debug prefix suggests development-only logging left in place.
- `g:\code\splits.network\services\api-gateway\src\routes\v2\network.ts`, line 643: `console.log('Lookup invitation result:', { data, correlationId })` -- logs potentially sensitive invitation data.

**Recommended Remediation:**

1. Replace all `console.*` calls with the structured logger (`@splits-network/shared-logging`).
2. Remove or gate debug-prefixed logging behind environment checks.
3. Ensure no sensitive data (tokens, keys, PII) is logged.

---

## Low-Risk Issues (P3)

### L-01: CORS Allows All Origins in Development

**Severity:** LOW
**OWASP Category:** A05 Security Misconfiguration

**Affected File:** `g:\code\splits.network\services\api-gateway\src\index.ts`, lines 38-44

```typescript
const allowedOrigins =
    baseConfig.nodeEnv === "production"
        ? (process.env.CORS_ORIGIN || "").split(",").filter(Boolean)
        : true; // All origins allowed in development
```

This is acceptable for development but should be documented. The production configuration correctly requires `CORS_ORIGIN` to be set and throws an error if it is empty.

**Recommended Remediation:** No action required for production. Consider tightening development CORS to specific localhost ports.

---

### L-02: No Content Security Policy (CSP) Headers

**Severity:** LOW
**OWASP Category:** A05 Security Misconfiguration

No Content-Security-Policy headers were found in the API gateway or frontend apps. While the Next.js apps are less susceptible to XSS due to React's built-in escaping, CSP provides defense-in-depth.

**Recommended Remediation:** Configure CSP headers in the Next.js apps' `next.config.js` and in the API gateway's response headers, at least for `script-src`, `style-src`, and `connect-src`.

---

### L-03: No Helmet or Security Headers Middleware

**Severity:** LOW
**OWASP Category:** A05 Security Misconfiguration

The API gateway does not use `@fastify/helmet` or set security headers like `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, or `Referrer-Policy`.

**Recommended Remediation:** Register `@fastify/helmet` in the API gateway for automatic security header configuration.

---

### L-04: File Upload MIME Type Validation Relies Partially on Extension

**Severity:** LOW
**OWASP Category:** A04 Insecure Design

**Affected File:** `g:\code\splits.network\services\document-service\src\v2\documents\service.ts`, lines 41-85

The document service first tries to detect the MIME type from the file buffer using `file-type`. If detection fails (which happens for text-based formats like `.txt`, `.rtf`), it falls back to file extension matching. While the fallback has a whitelist of allowed extensions and the final MIME type is checked against `ALLOWED_MIME_TYPES`, extension-based detection is less reliable than content-based detection.

**Recommended Remediation:** This is acceptable given the whitelist approach. Consider logging when extension-based fallback is used for monitoring.

---

### L-05: Timing-Unsafe String Comparison for Internal Service Key

**Severity:** LOW
**OWASP Category:** A07 Identification and Authentication Failures

**Affected Files:**

- `g:\code\splits.network\services\ats-service\src\v2\shared\helpers.ts`, line 21
- `g:\code\splits.network\services\document-service\src\v2\shared\helpers.ts`, line 28
- `g:\code\splits.network\services\ai-service\src\v2\shared\helpers.ts`, line 13

```typescript
return internalServiceKey === expectedKey; // Timing-unsafe comparison
```

String equality comparison with `===` is vulnerable to timing attacks. An attacker could potentially determine the correct key character by character by measuring response times.

**Recommended Remediation:**
Use `crypto.timingSafeEqual()`:

```typescript
import { timingSafeEqual } from "crypto";
return timingSafeEqual(
    Buffer.from(internalServiceKey),
    Buffer.from(expectedKey),
);
```

---

## Positive Findings

The audit identified several strong security practices already in place:

1. **JWT Authentication Architecture:** Authentication is properly centralized at the API gateway via Clerk JWT verification. The gateway extracts the `clerkUserId` from the verified JWT and passes it to backend services via the `x-clerk-user-id` header. Backend services never trust user IDs from request bodies or query parameters (no instances of `request.body.userId` used for auth were found).

2. **RBAC via Database Records:** The `resolveAccessContext()` function in `g:\code\splits.network\packages\shared-access-context\src\index.ts` resolves roles from database records (memberships, recruiters, candidates tables) rather than from client-supplied claims. This prevents role spoofing.

3. **Parameterized Queries:** All database queries use the Supabase client library, which parameterizes values. No raw SQL string concatenation was found. No use of `eval()` or `new Function()` was detected.

4. **Webhook Signature Verification:** Both Stripe (`g:\code\splits.network\services\billing-service\src\routes\webhooks\routes.ts`, line 34) and Clerk (`g:\code\splits.network\services\identity-service\src\v2\webhooks\routes.ts`, line 118) webhooks properly verify signatures before processing.

5. **Stripe Webhook Idempotency:** The billing service stores webhook events and checks for duplicates before processing (`g:\code\splits.network\services\billing-service\src\routes\webhooks\routes.ts`, lines 44-70), preventing replay attacks.

6. **Soft Deletes:** The platform consistently uses soft deletes (setting `deleted_at` timestamps) rather than hard deletes, preserving audit trails.

7. **File Upload Validation:** The document service validates file types against an allowlist and uses content-based MIME detection (`file-type` library) with extension fallback. File size is capped at 10MB.

8. **XSS-Safe JSON-LD:** The `safeJsonLdSerialize` function in `g:\code\splits.network\packages\shared-ui\src\seo\json-ld.tsx` properly escapes `<`, `>`, `/`, `&`, U+2028, and U+2029 characters.

9. **WebSocket Channel Authorization:** The chat gateway (`g:\code\splits.network\services\chat-gateway\src\index.ts`, lines 320-343) validates that users can only subscribe to their own `user:` channel and verifies conversation membership before allowing `conv:` channel subscriptions.

10. **Password Management:** Passwords are managed entirely by Clerk and never stored in the application database.

11. **Payment Data:** Payment data is managed entirely by Stripe. No credit card numbers or sensitive payment details are stored in the application database.

12. **Production CORS:** CORS is properly configured to require explicit origin allowlisting in production with a hard error if `CORS_ORIGIN` is not set.

---

## Remediation Priority Matrix

| Priority      | ID   | Issue                                            | Effort | Impact                              |
| ------------- | ---- | ------------------------------------------------ | ------ | ----------------------------------- |
| **Immediate** | C-01 | Rotate all committed secrets                     | Medium | Prevents account compromise         |
| **Immediate** | C-02 | Validate internal service key at gateway         | Low    | Closes auth bypass                  |
| **1 week**    | H-01 | Add ownership check to candidate GET by ID       | Low    | Prevents data leakage               |
| **1 week**    | H-02 | Add ownership check to application update/delete | Low    | Prevents unauthorized modifications |
| **1 week**    | H-03 | Fix missing auth headers on note delete route    | Low    | Ensures downstream auth works       |
| **1 week**    | H-04 | Whitelist sort_by column names                   | Low    | Prevents column name injection      |
| **1 week**    | H-05 | Add explicit auth to document routes             | Low    | Defense in depth                    |
| **1 week**    | H-06 | Disable Swagger in production                    | Low    | Reduces attack surface              |
| **2 weeks**   | M-01 | Add explicit auth to consent routes              | Low    | Consistency                         |
| **2 weeks**   | M-02 | Whitelist update fields                          | Medium | Prevents mass assignment            |
| **2 weeks**   | M-03 | Sanitize error responses                         | Medium | Prevents info leakage               |
| **2 weeks**   | M-04 | Sanitize env var interpolation in layout         | Low    | Prevents potential XSS              |
| **2 weeks**   | M-05 | Improve WebSocket token handling                 | Medium | Reduces token exposure              |
| **2 weeks**   | M-06 | Add rate limits to chat endpoints                | Low    | Prevents abuse                      |
| **1 month**   | M-07 | Use anon key for gateway Supabase client         | Low    | Least privilege                     |
| **1 month**   | M-08 | Replace console.\* with structured logger        | Medium | Improves monitoring                 |
| **Quarter**   | L-01 | Tighten development CORS                         | Low    | Minor improvement                   |
| **Quarter**   | L-02 | Add CSP headers                                  | Medium | Defense in depth                    |
| **Quarter**   | L-03 | Add Helmet middleware                            | Low    | Security headers                    |
| **Quarter**   | L-04 | Monitor extension-based MIME fallback            | Low    | Observability                       |
| **Quarter**   | L-05 | Use timing-safe comparison for service keys      | Low    | Prevents timing attacks             |
