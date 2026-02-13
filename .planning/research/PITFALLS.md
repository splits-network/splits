# Domain Pitfalls: Custom GPT with Actions Backend

**Domain:** Custom GPT Actions integration for recruiting marketplace (Applicant.Network)
**Researched:** 2026-02-13
**Confidence:** MEDIUM (training data for OpenAI GPT Actions specifics; HIGH for Clerk/Fastify integration concerns based on codebase analysis)

**Important note on sources:** WebSearch and WebFetch were unavailable during this research. OpenAI GPT Actions specifics are based on training data (cutoff ~May 2025) and should be verified against current OpenAI documentation before implementation. Codebase-specific pitfalls are HIGH confidence based on direct code analysis.

---

## CRITICAL PITFALLS

Mistakes that cause the GPT to fail entirely, expose user data, or get rejected from the GPT Store.

### Pitfall 1: OpenAPI Schema Rejected by GPT Actions Parser

**What goes wrong:** The OpenAPI schema is valid per the OpenAPI 3.0 spec but GPT Actions rejects it or silently ignores endpoints. The GPT never calls the API or calls it incorrectly.

**Why it happens:**
- GPT Actions has a stricter, narrower OpenAPI parser than standard validators
- Uses OpenAPI 3.0 only (3.1 features like `const`, `examples` as array, nullable shorthand are rejected)
- `operationId` is missing, duplicated, or contains characters the GPT cannot reference
- Response schemas are missing or too vague (GPT cannot interpret untyped responses)
- `$ref` chains are too deep or circular
- Schema uses `allOf`/`oneOf`/`anyOf` in ways the parser cannot resolve
- Array parameters in query strings use unsupported serialization styles
- `description` fields are missing on operations and parameters (GPT relies on descriptions to decide when/how to call actions)

**Consequences:**
- GPT never calls the action (silently ignored)
- GPT calls the wrong endpoint or sends malformed parameters
- Schema upload fails in GPT Builder with unhelpful error messages
- Weeks of debugging with no clear error trail

**Prevention:**
1. Use OpenAPI 3.0.x only (not 3.1). The existing starter (`04_OpenAPI_Starter.yaml`) correctly uses `3.0.1` -- maintain this
2. Every operation MUST have a unique `operationId` (alphanumeric + underscores, no hyphens or dots)
3. Every operation MUST have a `summary` AND `description` -- the description tells the GPT WHEN to use the action
4. Every parameter MUST have a `description` explaining what it does in plain English
5. Every response MUST have a schema with `properties` defined -- do not use empty `{}` schemas
6. Avoid `$ref` nesting beyond 2 levels -- inline schemas when possible
7. Use `type: string` with `enum` for constrained values (GPT handles enums well)
8. Test the schema in GPT Builder preview BEFORE writing any backend code
9. Keep total schema under ~30 operations (GPT performance degrades with too many actions)

**Warning signs:**
- GPT Builder shows "Unable to parse schema" or similar error
- GPT says "I don't have an action for that" when it clearly should
- GPT sends requests with wrong parameter types or missing fields
- Schema validates at editor.swagger.io but fails in GPT Builder

**Detection:**
- Validate schema with GPT Builder preview as a CI step
- Log all incoming requests to gpt-service and compare against expected schema
- Test each operationId individually in GPT Builder conversation

**Existing project risk:** The starter schema (`04_OpenAPI_Starter.yaml`) is incomplete -- response schemas have no `properties` defined (just `description: Job results returned`). This WILL cause the GPT to misinterpret responses. Must add full response schemas.

**Phase impact:** Phase 1 (OpenAPI Schema) -- validate with GPT Builder before proceeding

**Confidence:** MEDIUM -- Based on training data knowledge of GPT Actions parser behavior. Verify against current OpenAI documentation.

---

### Pitfall 2: OAuth2 Token Exchange Failure Between GPT and Backend

**What goes wrong:** The OAuth2 flow initiated by the GPT never completes. User clicks "Sign in" in ChatGPT, gets redirected, but the token exchange fails silently. The GPT shows "Authentication failed" with no details.

**Why it happens:**
- GPT Actions OAuth2 requires the Authorization Code Grant flow with PKCE -- other grant types are not supported
- The `token_exchange_method` must be explicitly set (GPT supports `basic` or `post` for client credentials in the token request)
- The backend's `/authorize` endpoint must redirect to the exact `redirect_uri` provided by OpenAI (it is NOT a URI you control -- OpenAI provides it during GPT configuration)
- The token endpoint must return `access_token`, `token_type`, and optionally `refresh_token` and `expires_in` in the response body (not in headers, not in a custom envelope)
- CORS headers are missing or wrong on the token endpoint (ChatGPT makes browser-based requests)
- The `client_id` and `client_secret` configured in GPT Builder must match exactly what the backend expects
- Token endpoint returns `{ data: { access_token: ... } }` (project's standard envelope) instead of bare `{ access_token: ... }` (OAuth2 standard)

**Consequences:**
- Users cannot link their accounts -- GPT is completely unusable
- No error details visible (OpenAI's OAuth error reporting is minimal)
- Hours of debugging blind (cannot see OpenAI's side of the exchange)

**Prevention:**
1. Implement Authorization Code Grant with PKCE support (code_verifier/code_challenge)
2. The `/authorize` endpoint must accept `redirect_uri`, `state`, `code_challenge`, `code_challenge_method` params from OpenAI
3. The `/token` endpoint must return BARE OAuth2 response -- NOT wrapped in the project's `{ data: ... }` envelope:
   ```json
   {
     "access_token": "gpt_abc123...",
     "token_type": "Bearer",
     "expires_in": 3600,
     "refresh_token": "gpt_refresh_abc123..."
   }
   ```
4. The redirect after user auth MUST go to OpenAI's `redirect_uri` with `?code=AUTH_CODE&state=ORIGINAL_STATE`
5. Set CORS headers to allow `https://chat.openai.com` and `https://chatgpt.com` origins on token endpoints
6. Log EVERY step of the OAuth flow with correlation IDs for debugging
7. Build a test page that mimics the GPT OAuth flow (authorize -> redirect -> token exchange) before connecting to the real GPT
8. Store `client_id` and `client_secret` for the GPT in Supabase Vault (not hardcoded)

**Warning signs:**
- User clicks "Sign in" and nothing happens
- Browser network tab shows CORS errors on token endpoint
- Token endpoint returns 200 but GPT still shows "Authentication failed"
- Redirect loop between OpenAI and your authorize endpoint

**Detection:**
- Structured logging on `/oauth/authorize`, `/oauth/token`, and `/oauth/revoke` endpoints
- Monitor for HTTP 4xx responses on token endpoints
- Test the full flow in GPT Builder preview mode (it shows more error details than production)

**Existing project risk:** The API gateway wraps ALL responses in `{ data: ... }` envelope. OAuth token endpoints MUST be excluded from this pattern. The gpt-service OAuth endpoints need raw response format.

**Phase impact:** Phase 2 (OAuth2 Implementation) -- this is the highest-risk phase

**Confidence:** MEDIUM -- OAuth2 flow specifics based on training data. The envelope conflict is HIGH confidence based on codebase analysis of API gateway response patterns.

---

### Pitfall 3: Cross-User Data Leakage Through GPT Token Scoping

**What goes wrong:** User A authenticates with the GPT, but the GPT token grants access to User B's data. Or the GPT returns data that should be scoped to a specific tenant/organization.

**Why it happens:**
- GPT access token is not properly bound to the authenticated user's identity
- Token contains `clerkUserId` but resolveAccessContext is not called (or is called with wrong user)
- gpt-service queries ats-service data without passing access context
- GPT token inherits broader permissions than intended (e.g., recruiter-level access when user is a candidate)
- Token does not encode the user's role scope -- backend trusts the token without verifying role
- Database queries in gpt-service lack WHERE clauses filtering by candidate ID

**Consequences:**
- Privacy violation -- users see other users' applications, resumes, personal data
- Legal liability (GDPR, CCPA) for exposing PII
- GPT Store rejection for privacy violations
- Complete loss of user trust

**Prevention:**
1. GPT access tokens MUST encode the `clerkUserId` (or internal `identityUserId`) -- never use a generic service token
2. Every gpt-service endpoint MUST call `resolveAccessContext(clerkUserId)` and scope queries to the authenticated user
3. For candidate-facing GPT: tokens MUST be scoped to `candidate` role only -- never grant `recruiter`, `company_admin`, or `platform_admin` access through GPT tokens
4. Application status lookup: filter by `candidate_id = context.candidateId` -- never return applications for other candidates
5. Job search: only return active/published jobs (respect existing job visibility rules)
6. Resume analysis: only access documents owned by the authenticated candidate
7. Add explicit tenant isolation tests: create two test users, verify User A cannot access User B's data through any GPT endpoint
8. Log every data access with `userId` and `candidateId` for audit trail

**Warning signs:**
- GPT returns data the user shouldn't see (other users' applications)
- Application status endpoint returns all applications instead of the current user's
- Resume analysis processes a document the user doesn't own
- No `WHERE candidate_id = ?` clauses in gpt-service repository queries

**Detection:**
- Automated test: authenticate as User A, request User B's application ID -- must return 403 or empty result
- Review every SQL/Supabase query in gpt-service for proper access context filtering
- Penetration test: try to access resources by guessing IDs
- Code review checklist: every repository method must use `context.candidateId` filter

**Existing project risk:** The existing `resolveAccessContext` returns `candidateId` from user_roles (line 142 in shared-access-context). gpt-service MUST use this to scope all queries. If a user has both `recruiter` and `candidate` roles, the GPT token must only grant candidate-level access.

**Phase impact:** Every phase with data endpoints -- must be verified per-endpoint

**Confidence:** HIGH -- Based on codebase analysis of AccessContext and existing role-based filtering patterns.

---

### Pitfall 4: Write-Action Safety Pattern Bypassed or Incomplete

**What goes wrong:** The GPT submits a job application without the user actually confirming, or the confirmation pattern has gaps that allow unintended writes.

**Why it happens:**
- The `confirmed: true` flag is a request body parameter, but the GPT may auto-populate it without showing the user a summary first
- GPT Instructions tell it to "ask for confirmation" but the model may skip this under certain prompting conditions (jailbreaking, ambiguous instructions)
- Backend trusts the `confirmed` flag without verifying the GPT actually showed a summary
- Missing validation: endpoint accepts `confirmed: true` on first call (no prior "preview" call required)
- Rate limiting doesn't account for rapid repeated submissions
- Error responses from `CONFIRMATION_REQUIRED` don't include enough context for the GPT to show a meaningful summary

**Consequences:**
- Candidates unknowingly submit applications to wrong jobs
- Duplicate applications submitted
- Legal issues if application terms weren't acknowledged
- Loss of user trust -- "I didn't mean to apply for that"

**Prevention:**
1. Two-call pattern (strongly recommended over single-call with flag):
   - Call 1: `POST /applications` without `confirmed` -> Returns `CONFIRMATION_REQUIRED` with full application summary (job title, company, candidate name, resume used)
   - Call 2: `POST /applications` with `confirmed: true` -> Actually submits
2. The `CONFIRMATION_REQUIRED` response must return rich summary data for the GPT to display:
   ```json
   {
     "error": "CONFIRMATION_REQUIRED",
     "summary": {
       "job_title": "Senior Engineer at Acme Corp",
       "candidate_name": "John Doe",
       "resume_used": "john_doe_resume_2026.pdf",
       "action": "Submit application"
     },
     "message": "Please confirm: Apply to 'Senior Engineer at Acme Corp' with resume 'john_doe_resume_2026.pdf'?"
   }
   ```
3. Add server-side deduplication: reject if identical application exists within last 5 minutes
4. GPT Instructions must explicitly say: "NEVER set confirmed=true on the first call. ALWAYS make the first call without confirmed, show the summary to the user, and only set confirmed=true after the user explicitly says yes."
5. Log every write action with `confirmed` flag value and timestamp for audit
6. Consider a nonce/token pattern: CONFIRMATION_REQUIRED returns a `confirmation_token` that must be included in the confirmed request (prevents replay)

**Warning signs:**
- Applications appearing without user awareness
- GPT logs show `confirmed: true` on first call (bypassing preview)
- No `CONFIRMATION_REQUIRED` responses in logs (GPT always sends confirmed)
- Duplicate applications for same job/candidate

**Detection:**
- Monitor ratio of CONFIRMATION_REQUIRED to actual submissions (should be ~1:1 or higher)
- Audit log review: every submission should have a preceding CONFIRMATION_REQUIRED
- Automated test: send `confirmed: true` directly -- verify it still works but log a warning

**Existing project risk:** The current error contract in `03_Technical_Specification.md` returns only `errorCode` and `message` -- no summary data. The GPT cannot show a meaningful confirmation without summary fields in the CONFIRMATION_REQUIRED response.

**Phase impact:** Phase 4 (Write Endpoints) -- implement two-call pattern from the start

**Confidence:** HIGH for the pattern design; MEDIUM for GPT behavior specifics (training data on how GPTs handle confirmation flows).

---

## MODERATE PITFALLS

Mistakes that cause degraded experience, failed requests, or development delays.

### Pitfall 5: GPT Actions Timeout Causing Silent Failures

**What goes wrong:** The GPT calls an action, but the backend takes too long to respond. The GPT shows a vague error or silently fails, with no indication of what went wrong.

**Why it happens:**
- OpenAI enforces a timeout on GPT Action HTTP calls (approximately 45 seconds based on training data -- verify current limit)
- Resume analysis involves calling ai-service (OpenAI API) which has its own latency
- Resume parsing requires fetching from document-service (Supabase Storage), then sending to OpenAI for analysis
- Chain: GPT -> gpt-service -> document-service -> ai-service -> OpenAI API. Each hop adds latency
- Cold starts on Kubernetes pods add initial request latency
- Database queries with complex access context resolution add overhead

**Consequences:**
- User sees "Something went wrong" with no actionable information
- Resume analysis feature appears broken
- Users retry, causing duplicate processing
- Poor user experience erodes trust in the GPT

**Prevention:**
1. Set a hard response time budget: gpt-service must respond within 30 seconds (leaving 15s buffer for OpenAI's timeout)
2. For resume analysis (likely to exceed 30s):
   - Return an immediate acknowledgment with a `status: processing` response
   - Provide a `GET /resume/analysis/:id` polling endpoint
   - GPT Instructions should say: "If resume analysis returns 'processing', wait 10 seconds and check the status endpoint"
3. Alternatively, use the async pattern:
   - `POST /resume/analyze` returns `{ analysis_id: "xyz", status: "processing" }`
   - `GET /resume/analysis/xyz` returns results when ready
4. Set individual timeouts on downstream service calls:
   - document-service file fetch: 5s timeout
   - ai-service analysis: 20s timeout
   - Database queries: 3s timeout
5. Return meaningful error messages when timeouts occur:
   ```json
   {
     "error": "TIMEOUT",
     "message": "Resume analysis is taking longer than expected. Please try again in a moment.",
     "retry_after": 30
   }
   ```
6. Add circuit breaker pattern for ai-service calls (if OpenAI API is down, fail fast)

**Warning signs:**
- GPT frequently shows generic errors for resume analysis
- gpt-service logs show 504 Gateway Timeout from downstream services
- High latency metrics on gpt-service endpoints (P95 > 20s)
- Users report "it works sometimes" (timeout is non-deterministic)

**Detection:**
- Track P50/P95/P99 response times per endpoint
- Alert on any gpt-service response > 25 seconds
- Monitor ai-service error rates (OpenAI API availability)
- Log downstream service call durations separately

**Phase impact:** Phase 3 (Resume Analysis endpoint) -- design async pattern before implementation

**Confidence:** MEDIUM for timeout limits (training data); HIGH for the downstream latency chain analysis (based on codebase architecture).

---

### Pitfall 6: Natural Language to Structured Query Mapping Failures

**What goes wrong:** User says "find me remote Python jobs in Austin" but the GPT sends `{"keywords": "remote Python jobs in Austin"}` as a single string instead of structured filters like `{"skills": ["Python"], "location": "Austin", "commute_types": ["remote"]}`.

**Why it happens:**
- The OpenAPI schema defines only a simple `keywords` string parameter (as in the starter schema)
- The GPT has no way to know about structured filter fields like `commute_types`, `job_level`, `location`, `skills`
- Even with structured parameters, the GPT may map natural language incorrectly (e.g., "senior" as a keyword vs. `job_level: "senior"`)
- Schema parameter descriptions are too vague for the GPT to make correct mapping decisions
- Enum values in schema don't match natural language (e.g., `hybrid_3` vs "3 days in office")

**Consequences:**
- Search results are irrelevant or empty
- Users blame the GPT for being "dumb" when it's a schema/instructions problem
- Structured filters (commute_types, job_level) added in v4.0 go unused
- Frustrating UX: user must learn the "right" way to ask

**Prevention:**
1. Design the OpenAPI schema with granular, well-described parameters:
   ```yaml
   parameters:
     - name: keywords
       in: query
       description: "Free-text search terms for job title, skills, or company name. Example: 'Python developer', 'data engineer'"
       schema:
         type: string
     - name: location
       in: query
       description: "City, state, or region to filter jobs by location. Example: 'Austin, TX', 'Remote'"
       schema:
         type: string
     - name: commute_types
       in: query
       description: "Work arrangement filter. Comma-separated values from: remote, hybrid_1 (1 day in office), hybrid_2 (2 days), hybrid_3 (3 days), hybrid_4 (4 days), in_office"
       schema:
         type: string
     - name: job_level
       in: query
       description: "Seniority level filter. One of: entry, mid, senior, lead, manager, director, vp, c_suite"
       schema:
         type: string
         enum: [entry, mid, senior, lead, manager, director, vp, c_suite]
   ```
2. GPT Instructions must include mapping guidance:
   ```
   When users search for jobs:
   - Extract location mentions and use the 'location' parameter
   - Map work arrangement terms: "remote" -> commute_types=remote, "hybrid" -> commute_types=hybrid_2, "in-office"/"on-site" -> commute_types=in_office
   - Map seniority terms: "junior" -> job_level=entry, "mid-level" -> job_level=mid, "senior" -> job_level=senior, "manager" -> job_level=manager, "VP" -> job_level=vp, "executive"/"C-level" -> job_level=c_suite
   - Put everything else in the 'keywords' parameter
   ```
3. Backend should support BOTH approaches: structured filters AND full-text search on keywords. Even if the GPT sends everything as keywords, the Postgres FTS should still find relevant results.
4. Add a `search_mode` parameter: `natural` (backend does the parsing) vs `structured` (GPT does the parsing). Start with `natural` where backend handles it, since it's more reliable.

**Warning signs:**
- All GPT search requests use only the `keywords` parameter
- Search results are frequently irrelevant
- Users rephrase queries multiple times to get results
- commute_types and job_level filters are never populated in request logs

**Detection:**
- Log parameter usage: track which parameters the GPT actually sends
- Monitor search relevance: empty results rate, bounce rate (user searches again immediately)
- A/B test structured vs natural mode to see which produces better results

**Existing project risk:** The starter schema (`04_OpenAPI_Starter.yaml`) only has a single `keywords` parameter. The v4.0 commute_types and job_level filters are already in ats-service but not exposed in the GPT schema.

**Phase impact:** Phase 1 (OpenAPI Schema) and Phase 3 (Job Search endpoint) -- schema design determines search quality

**Confidence:** HIGH for the technical schema design; MEDIUM for GPT parameter mapping behavior (training data).

---

### Pitfall 7: Clerk Session and GPT Token Lifecycle Mismatch

**What goes wrong:** User authenticates via OAuth, gets a GPT token, but the underlying Clerk session expires. The GPT token is still valid, but calls fail because the Clerk identity cannot be resolved.

**Why it happens:**
- GPT tokens and Clerk sessions have independent lifecycles
- Backend issues a GPT access token (e.g., 1-hour expiry) during OAuth flow
- User's Clerk session may expire or be revoked independently
- GPT sends valid access token, but `resolveAccessContext` fails because the user's Clerk account was deactivated, deleted, or session was revoked
- Refresh token flow creates a new GPT token without re-validating Clerk session
- User changes password or logs out of Clerk -- GPT token should be invalidated but isn't

**Consequences:**
- GPT appears to work (valid token) but all API calls fail with confusing errors
- User data access continues after account deactivation (security issue)
- Stale GPT tokens survive Clerk session revocation
- Inconsistent behavior: some calls work (cached context), others fail (fresh resolution)

**Prevention:**
1. GPT access tokens should be SHORT-lived (15-30 minutes, not hours). Use refresh tokens for longer sessions.
2. On every gpt-service request, verify the user still exists and is active:
   ```typescript
   async verifyGptToken(token: string): Promise<GptTokenPayload> {
     const payload = jwt.verify(token, GPT_TOKEN_SECRET);

     // Check user still exists and is active
     const { data: user } = await supabase
       .from('users')
       .select('id, clerk_user_id')
       .eq('clerk_user_id', payload.clerkUserId)
       .is('deleted_at', null)
       .single();

     if (!user) throw new UnauthorizedError('User account not found or deactivated');

     return payload;
   }
   ```
3. When issuing refresh tokens, re-validate with Clerk that the user session is still active (call Clerk's `/users/{userId}` API to check user status)
4. Implement token revocation endpoint (`/oauth/revoke`) and call it when:
   - User changes password (listen for Clerk webhook `user.updated`)
   - User is deactivated (listen for Clerk webhook `user.deleted`)
   - Admin revokes access
5. Store issued GPT tokens in a database table (`gpt_tokens`) with `user_id`, `expires_at`, `revoked_at` columns. Check revocation on every request.
6. Subscribe to Clerk webhooks for user lifecycle events (identity-service already handles these -- extend to revoke GPT tokens):
   ```typescript
   // In identity-service webhook handler (existing)
   case 'user.deleted':
     await gptTokenRepository.revokeAllForUser(event.data.id);
     break;
   ```

**Warning signs:**
- GPT tokens work after user account deactivation
- No Clerk validation on token refresh
- GPT token table has no revocation mechanism
- Clerk webhook events don't trigger GPT token invalidation

**Detection:**
- Test: deactivate a Clerk user, verify GPT token is immediately invalid
- Test: revoke Clerk session, verify GPT refresh token fails
- Monitor for GPT requests where `resolveAccessContext` returns errors
- Audit: check for GPT tokens with `expires_at` far in the future

**Existing project risk:** The identity-service already handles Clerk webhooks (`POST /v2/webhooks/clerk`). The GPT token revocation MUST be added to this existing webhook handler, not built as a separate system.

**Phase impact:** Phase 2 (OAuth2) and ongoing maintenance

**Confidence:** HIGH -- Based on direct analysis of Clerk webhook handling in identity-service and auth middleware in api-gateway.

---

### Pitfall 8: GPT-Specific Rate Limiting Conflicts with Existing Rate Limiter

**What goes wrong:** The GPT hits the existing API gateway rate limit (500 req/min for authenticated users), or conversely, the GPT-specific rate limits are too lax and allow abuse.

**Why it happens:**
- The existing rate limiter in api-gateway uses the last 16 characters of the Bearer token as the rate limit key (line 191 in index.ts)
- GPT tokens are different from Clerk JWTs -- the key extraction may not work correctly
- GPT Actions makes multiple rapid API calls in a single conversation turn (e.g., search + status check + resume analysis in parallel)
- The 500 req/min authenticated user limit is designed for browser SPA usage, not GPT automation
- OpenAI may retry failed requests, amplifying load
- No per-endpoint rate limiting -- a resume analysis call (expensive) counts the same as a job search (cheap)

**Consequences:**
- Legitimate GPT usage hits rate limits, causing failures
- Or: GPT users can make far more API calls than web users, creating unfair resource consumption
- Rate limit errors (429) confuse the GPT -- it may not handle them gracefully
- Expensive endpoints (resume analysis) can be called rapidly, running up OpenAI API costs

**Prevention:**
1. Route GPT traffic through a SEPARATE rate limiting tier in api-gateway:
   ```typescript
   // Detect GPT tokens vs Clerk JWTs
   const isGptToken = token.startsWith('gpt_');

   if (isGptToken) {
     // GPT-specific limits
     return {
       max: 60,          // 60 requests per minute per user
       timeWindow: '1 minute',
       keyGenerator: (req) => `gpt:${extractUserId(token)}`,
     };
   }
   ```
2. Implement per-endpoint rate limits for expensive operations:
   - Job search: 30 req/min
   - Application status: 20 req/min
   - Resume analysis: 5 req/min (expensive -- involves OpenAI API call)
   - Application submission: 3 req/min (write action, should be rare)
3. Return standard rate limit headers so the GPT can handle them:
   ```
   X-RateLimit-Limit: 60
   X-RateLimit-Remaining: 45
   X-RateLimit-Reset: 1708300000
   Retry-After: 30
   ```
4. Return informative 429 responses (not just "Too Many Requests"):
   ```json
   {
     "error": "RATE_LIMITED",
     "message": "You've made too many requests. Please wait 30 seconds before trying again.",
     "retry_after": 30
   }
   ```
5. GPT Instructions should include: "If you receive a rate limit error (429), inform the user and wait the specified time before retrying."

**Warning signs:**
- GPT users frequently see rate limit errors
- or: GPT users consume disproportionate API resources vs web users
- ai-service costs spike from rapid resume analysis calls
- Rate limit key collision: different GPT users sharing a rate limit bucket

**Detection:**
- Monitor 429 response rate by token type (GPT vs Clerk)
- Track per-user request volume segmented by GPT vs web
- Alert on ai-service cost spikes correlated with GPT usage
- Verify rate limit key uniqueness: each GPT user must have their own bucket

**Existing project risk:** The api-gateway rate limiter uses `auth.slice(-16)` as key. If GPT tokens are JWTs with similar suffixes across users, different users could share rate limit buckets. Use the embedded userId as the rate limit key instead.

**Phase impact:** Phase 2 (OAuth2/Infrastructure) and Phase 5 (Hardening)

**Confidence:** HIGH for the rate limiter analysis (direct code inspection of api-gateway/src/index.ts lines 178-200); MEDIUM for OpenAI retry behavior (training data).

---

### Pitfall 9: OAuth2 Redirect URI Mismatch

**What goes wrong:** The OAuth2 authorize flow starts but OpenAI rejects the callback because the redirect_uri doesn't match exactly.

**Why it happens:**
- OpenAI provides a specific `redirect_uri` during GPT configuration that your authorize endpoint must redirect to
- The redirect URI is NOT configurable by you -- it is assigned by OpenAI
- Backend hardcodes a redirect_uri or validates against a whitelist that doesn't include OpenAI's URI
- Trailing slashes, http vs https, port differences cause mismatch
- Development vs production URIs differ and the backend doesn't handle both
- The authorize endpoint builds the redirect URL incorrectly (missing `code` or `state` params)

**Consequences:**
- OAuth flow fails completely -- users cannot authenticate
- Difficult to debug because the redirect happens in an iframe/popup within ChatGPT
- Different behavior between GPT Builder (testing) and published GPT (production) due to different redirect URIs

**Prevention:**
1. Store the allowed redirect_uri(s) from OpenAI in configuration (not hardcoded)
2. The authorize endpoint must accept and validate the `redirect_uri` parameter from the request
3. After Clerk authentication, redirect to EXACTLY the redirect_uri provided, with:
   ```
   {redirect_uri}?code={auth_code}&state={state}
   ```
4. Support both development and production OpenAI redirect URIs
5. Never modify the redirect_uri (no adding/removing trailing slashes, no URL encoding changes)
6. Test with BOTH GPT Builder preview AND published GPT (they may use different redirect URIs)

**Warning signs:**
- OAuth works in GPT Builder but fails in published GPT (or vice versa)
- Browser shows "redirect_uri mismatch" error
- The authorize endpoint redirects to your own domain instead of OpenAI's

**Detection:**
- Log the incoming redirect_uri on every authorize request
- Compare logged redirect_uri against configured allowed URIs
- Test OAuth flow end-to-end in both environments

**Phase impact:** Phase 2 (OAuth2 Implementation)

**Confidence:** MEDIUM -- Based on training data knowledge of OAuth2 redirect URI handling in GPT Actions.

---

### Pitfall 10: API Response Format Incompatible with GPT Interpretation

**What goes wrong:** The API returns valid data but the GPT cannot interpret it, shows garbage to the user, or ignores important fields.

**Why it happens:**
- Response bodies are too large (GPT has context window limits for action responses)
- Nested objects are too deep (GPT struggles with deeply nested JSON)
- Field names are cryptic or inconsistent (e.g., `commute_types: ["hybrid_3"]` instead of human-readable labels)
- Pagination metadata confuses the GPT (it doesn't know to request page 2)
- Dates in ISO format without timezone context
- IDs (UUIDs) are returned but the GPT has no use for them and they waste context
- Error responses use a different format than success responses

**Consequences:**
- GPT shows raw UUIDs or enum values to the user ("Job commute type: hybrid_3")
- GPT truncates responses, losing important data
- User sees confusing or incomplete information
- GPT doesn't paginate -- only shows first page of results

**Prevention:**
1. Design GPT-specific response DTOs that are human-readable:
   ```json
   {
     "jobs": [
       {
         "title": "Senior Software Engineer",
         "company": "Acme Corp",
         "location": "Austin, TX",
         "work_arrangement": "3 days in office",
         "level": "Senior",
         "posted": "2 days ago",
         "match_score": 85
       }
     ],
     "total_results": 47,
     "showing": "1-10 of 47",
     "has_more": true
   }
   ```
2. Do NOT return UUIDs, internal IDs, or system fields in GPT responses unless they are needed for follow-up actions (e.g., `job_id` for applying)
3. Translate enum values to human-readable strings:
   - `hybrid_3` -> "Hybrid (3 days in office)"
   - `senior` -> "Senior"
   - `c_suite` -> "C-Suite / Executive"
4. Keep response payloads compact -- aim for < 4KB per response
5. Use flat or max-1-level-nested structures
6. Include a `summary` field in complex responses that the GPT can read directly:
   ```json
   {
     "summary": "Found 47 senior Python jobs in Austin. Showing top 10.",
     "jobs": [...]
   }
   ```
7. Pagination: include `has_more: true` and instructions in the schema description:
   "If has_more is true, ask the user if they want to see more results before calling with page=2"

**Warning signs:**
- GPT displays UUID strings to users
- GPT says "I found some results" but doesn't list them
- GPT shows enum values instead of readable labels
- GPT never requests page 2 of results

**Detection:**
- Test each endpoint in GPT Builder and check how the GPT presents the response
- Monitor GPT conversation quality (if you have access to logs)
- Track whether page > 1 is ever requested

**Existing project risk:** The standard API response format includes pagination with `total`, `page`, `limit`, `total_pages`. For GPT responses, simplify to `has_more: true/false` and `showing: "1-10 of 47"`.

**Phase impact:** Phase 3 (All data endpoints) -- design GPT-friendly DTOs from the start

**Confidence:** MEDIUM -- Based on training data about GPT response interpretation behavior.

---

## MINOR PITFALLS

Mistakes that cause annoyance or delays but are fixable.

### Pitfall 11: GPT Instructions Too Vague or Too Restrictive

**What goes wrong:** The GPT behaves unpredictably -- sometimes it calls actions when it shouldn't, or refuses to call actions when it should.

**Why it happens:**
- GPT Instructions (system prompt) are too short/vague (the current template is only 5 lines)
- Instructions don't specify when to use which action
- Instructions don't handle edge cases (what to do when not authenticated, what to do with empty results)
- Instructions are too restrictive ("only do X") causing the GPT to refuse reasonable requests
- Instructions conflict with action descriptions in the OpenAPI schema

**Prevention:**
1. Expand GPT Instructions to cover all action scenarios:
   ```
   ## Authentication
   - If the user is not authenticated, immediately prompt them to sign in
   - Do not attempt any actions that require authentication without first checking

   ## Job Search
   - When users describe job preferences, extract structured parameters
   - Always show the top results with key details (title, company, location, work arrangement)
   - If results are empty, suggest broadening the search

   ## Applications
   - NEVER set confirmed=true on the first call
   - Always show the full application summary and ask for explicit confirmation
   - After submission, show the confirmation and application ID

   ## Error Handling
   - If rate limited, tell the user to wait and specify how long
   - If authentication fails, prompt re-authentication
   - If data is not found, explain clearly and suggest alternatives
   ```
2. Test the GPT with 20+ diverse conversation scenarios before publishing
3. Version the instructions (store in `docs/gpt/05_GPT_Instructions_Template.md` and track changes)

**Phase impact:** Phase 6 (GPT Configuration) -- iterative testing required

**Confidence:** MEDIUM -- Based on training data about GPT instruction engineering.

---

### Pitfall 12: Missing Privacy Policy and Terms URLs

**What goes wrong:** GPT Store submission is rejected because required legal URLs are missing or point to placeholder pages.

**Why it happens:**
- GPT Actions with OAuth REQUIRE privacy policy and terms of service URLs
- URLs point to the corporate marketing site but the pages don't exist yet
- Privacy policy doesn't mention AI/GPT data processing
- Terms don't cover the GPT-specific usage scenarios

**Prevention:**
1. Create privacy policy and terms pages BEFORE GPT configuration
2. Privacy policy must specifically address:
   - What data the GPT accesses (job listings, user profile, applications)
   - How conversation data is handled (OpenAI retains conversations)
   - How authentication data is stored (GPT tokens, refresh tokens)
   - Data retention and deletion rights
3. Terms of service must address:
   - AI-assisted actions (applications submitted via GPT)
   - Confirmation requirement for write actions
   - Rate limits and usage restrictions
   - Disclaimer about AI interpretation accuracy
4. Host on `apps/corporate` (marketing site) at stable URLs:
   - `https://applicant.network/privacy`
   - `https://applicant.network/terms`

**Phase impact:** Phase 6 (GPT Configuration) -- must be ready before GPT Store submission

**Confidence:** MEDIUM -- Based on training data about GPT Store requirements.

---

### Pitfall 13: CORS Configuration Missing for ChatGPT Origins

**What goes wrong:** OAuth token exchange fails because the browser-based request from ChatGPT is blocked by CORS policy.

**Why it happens:**
- The api-gateway CORS configuration allows portal/candidate app origins but not ChatGPT origins
- Production CORS uses `CORS_ORIGIN` env var (line 39 in api-gateway/src/index.ts) -- ChatGPT origins must be added
- ChatGPT uses multiple origins: `https://chat.openai.com`, `https://chatgpt.com`, potentially others
- Preflight OPTIONS requests for the token endpoint are rejected
- The OAuth endpoints are not in the api-gateway (they're in gpt-service) -- CORS must be configured there too

**Prevention:**
1. Add ChatGPT origins to CORS configuration:
   - `https://chat.openai.com`
   - `https://chatgpt.com`
   - Verify current OpenAI documentation for any additional origins
2. If gpt-service has its own Fastify instance (nano-service pattern), configure CORS there too
3. Ensure preflight OPTIONS requests are handled for OAuth endpoints
4. In development, allow all origins for testing but restrict in production

**Warning signs:**
- Browser console shows "CORS policy: No 'Access-Control-Allow-Origin' header"
- OAuth flow works in Postman but fails in actual ChatGPT
- OPTIONS requests return 404 or 403

**Detection:**
- Test OAuth flow from actual ChatGPT (not just Postman/curl)
- Monitor for CORS-related errors in browser console
- Check api-gateway/gpt-service logs for blocked OPTIONS requests

**Existing project risk:** The api-gateway CORS config (line 38-43 in index.ts) only allows configured origins in production. ChatGPT origins MUST be added to the `CORS_ORIGIN` environment variable.

**Phase impact:** Phase 2 (OAuth2 Implementation)

**Confidence:** HIGH -- Based on direct analysis of api-gateway CORS configuration.

---

### Pitfall 14: GPT Token Format Conflicts with Existing Auth Middleware

**What goes wrong:** GPT tokens arrive at the api-gateway, but the existing Clerk JWT verification middleware rejects them because they're not Clerk-issued JWTs.

**Why it happens:**
- The api-gateway auth middleware (`auth.ts`) tries to verify ALL Bearer tokens against Clerk secret keys
- GPT tokens are NOT Clerk JWTs -- they're custom tokens issued by gpt-service
- The middleware loops through all Clerk clients, fails on each, and returns "Token verification failed"
- No path exists in the middleware to handle non-Clerk tokens

**Consequences:**
- All GPT API calls return 401 Unauthorized
- GPT appears broken even though tokens are valid
- Confusing error: "Token verification failed" when the GPT token IS valid

**Prevention:**
1. Add GPT token recognition in the auth middleware BEFORE Clerk verification:
   ```typescript
   // In api-gateway auth hook
   if (request.url.startsWith('/api/v1/gpt/')) {
     // GPT routes use custom token verification, skip Clerk auth
     // gpt-service handles its own token verification
     return;
   }
   ```
2. Alternatively, use a token prefix convention: GPT tokens start with `gpt_` and Clerk JWTs start with `eyJ`. Route based on prefix.
3. The api-gateway should pass GPT requests to gpt-service WITHOUT Clerk verification. gpt-service handles its own auth.
4. Add gpt-service to the service registry in api-gateway:
   ```typescript
   services.register('gpt', process.env.GPT_SERVICE_URL || 'http://localhost:3014');
   ```

**Warning signs:**
- All GPT Action requests return 401
- api-gateway logs show "Token verification failed with all Clerk clients" for GPT requests
- GPT tokens are valid JWTs but not Clerk-issued

**Detection:**
- Test: send a GPT token to `/api/v1/gpt/jobs` -- should NOT go through Clerk verification
- Check api-gateway auth hook for GPT route exclusion
- Monitor 401 error rate on GPT endpoints

**Existing project risk:** The auth middleware already has several bypass paths (webhooks, public endpoints, internal service keys -- see lines 283-377 in index.ts). Adding a GPT bypass follows this established pattern.

**Phase impact:** Phase 2 (OAuth2/Infrastructure) -- must be addressed when routing GPT traffic through api-gateway

**Confidence:** HIGH -- Based on direct analysis of api-gateway auth middleware.

---

### Pitfall 15: OpenAPI Schema Drift from Actual API Implementation

**What goes wrong:** The OpenAPI schema uploaded to GPT Builder diverges from the actual gpt-service implementation. The GPT sends requests that the backend doesn't expect, or the backend returns responses the GPT doesn't understand.

**Why it happens:**
- Schema is maintained as a separate YAML file (`04_OpenAPI_Starter.yaml`)
- Backend endpoints are modified but schema is not updated (or vice versa)
- Schema uses placeholder types during development and is never corrected
- No automated validation that schema matches implementation
- Copy-paste errors between schema and route definitions

**Prevention:**
1. Generate the OpenAPI schema FROM the Fastify route definitions (Fastify has built-in schema support with `@fastify/swagger`):
   ```typescript
   // gpt-service route with inline schema
   app.get('/v1/gpt/jobs', {
     schema: {
       querystring: { /* ... */ },
       response: { 200: { /* ... */ } }
     }
   }, handler);
   ```
2. Export the generated schema as a build artifact: `GET /v1/gpt/openapi.json`
3. Use the generated schema for GPT Builder configuration (not a hand-maintained YAML)
4. Add a CI check: compare generated schema against last-known-good schema, fail on unexpected differences
5. If hand-maintaining the schema: add a test that imports the YAML and validates each operation against the actual route handlers

**Warning signs:**
- GPT sends parameters the backend doesn't accept
- Backend returns fields the GPT doesn't display
- Schema defines endpoints that don't exist yet (or no longer exist)
- Swagger UI shows different endpoints than GPT Builder

**Detection:**
- Automated test: parse OpenAPI YAML, for each operationId verify a matching route exists in gpt-service
- Compare `@fastify/swagger` output against the uploaded GPT schema
- Version the schema file and require review for changes

**Phase impact:** Ongoing -- establish schema generation in Phase 1 to prevent drift

**Confidence:** HIGH -- Based on existing Fastify swagger usage in the project (api-gateway already uses `@fastify/swagger`).

---

## PHASE-SPECIFIC WARNINGS

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: OpenAPI Schema** | #1 Schema rejected by GPT parser | Use 3.0.x, add descriptions on everything, test in GPT Builder immediately |
| | #6 NL-to-query mapping failures | Design granular parameters with enum values and mapping guidance |
| | #15 Schema drift | Generate schema from Fastify routes, not hand-maintained YAML |
| **Phase 2: OAuth2 Implementation** | #2 Token exchange failure | Raw OAuth2 response format (no data envelope), log every step |
| | #9 Redirect URI mismatch | Accept and validate OpenAI's redirect_uri, don't hardcode |
| | #7 Clerk/GPT token lifecycle mismatch | Short-lived tokens, Clerk webhook integration for revocation |
| | #14 Auth middleware rejects GPT tokens | Add GPT route bypass in api-gateway auth hook |
| | #13 CORS blocks ChatGPT origins | Add OpenAI origins to CORS configuration |
| | #8 Rate limiting conflicts | Separate GPT rate limit tier with per-endpoint limits |
| **Phase 3: Read Endpoints** | #3 Cross-user data leakage | resolveAccessContext on every request, candidate-scoped queries |
| | #5 Timeout on resume analysis | Async processing pattern with polling endpoint |
| | #10 Response format issues | GPT-friendly DTOs with human-readable values |
| **Phase 4: Write Endpoints** | #4 Confirmation pattern bypass | Two-call pattern with rich summary data and server-side dedup |
| | #3 Data leakage on writes | Verify candidate owns the application/resume being acted upon |
| **Phase 5: Hardening** | #8 Rate limiting tuning | Monitor and adjust per-endpoint limits based on real usage |
| | #7 Token revocation | Verify Clerk webhook -> GPT token invalidation works |
| **Phase 6: GPT Configuration** | #11 Instructions too vague | Comprehensive instructions covering all scenarios |
| | #12 Missing legal URLs | Privacy policy and terms must exist before store submission |

---

## GPT STORE REVIEW CONSIDERATIONS

If this GPT is eventually submitted to the GPT Store (noted as out of scope for v5.0 but relevant for future), these are common rejection reasons to design against now:

| Rejection Reason | Prevention | Phase to Address |
|-----------------|------------|-----------------|
| Missing or broken OAuth | Full E2E testing of auth flow | Phase 2 |
| Privacy policy missing or inadequate | Create GPT-specific privacy policy | Phase 6 |
| Actions that don't work | Test every operationId individually | All phases |
| Misleading GPT description | Accurate, honest description of capabilities | Phase 6 |
| Unsafe write actions | Confirmation pattern, rate limiting | Phase 4 |
| Data privacy concerns | Tenant isolation, scoped tokens, audit logging | Phase 3-4 |
| Poor error handling | Informative error messages GPT can relay | All phases |

**Confidence:** LOW -- GPT Store review criteria may have changed since training data. Verify against current OpenAI guidelines before submission.

---

## RESEARCH CONFIDENCE ASSESSMENT

| Category | Confidence | Source |
|----------|------------|--------|
| OpenAPI schema requirements | MEDIUM | Training data (May 2025). OpenAI may have updated GPT Actions parser. Verify with official docs. |
| OAuth2 flow specifics | MEDIUM | Training data. Verify supported grant types and token_exchange_method with current docs. |
| GPT Actions timeout limits | LOW | Training data (~45s). This may have changed. Must verify. |
| Clerk integration pitfalls | HIGH | Direct codebase analysis of auth middleware, webhook handlers, and resolveAccessContext |
| API gateway routing/CORS | HIGH | Direct code inspection of api-gateway/src/index.ts, auth.ts |
| Rate limiting conflicts | HIGH | Direct code inspection of api-gateway rate limiter (lines 178-200) |
| Response format issues | MEDIUM | Training data for GPT interpretation behavior; HIGH for project envelope pattern analysis |
| Write-action safety | HIGH | Architecture decisions documented in PROJECT.md; standard pattern design |
| Data leakage risks | HIGH | Direct analysis of AccessContext and role-based filtering patterns |
| GPT Store review criteria | LOW | Training data. May be outdated. |

**Overall confidence:** MEDIUM -- Codebase-specific integration pitfalls are HIGH confidence. OpenAI-specific GPT Actions behavior is MEDIUM-LOW confidence due to reliance on training data without web verification.

---

## WHAT TO VALIDATE BEFORE IMPLEMENTATION

Before starting Phase 1, verify these items against current OpenAI documentation:

1. **OpenAPI spec version support:** Confirm GPT Actions still requires 3.0.x (not 3.1)
2. **OAuth2 grant type:** Confirm Authorization Code with PKCE is the required/supported flow
3. **Action timeout limit:** Confirm the HTTP request timeout (was ~45s in training data)
4. **Maximum operations per GPT:** Confirm the limit on number of actions
5. **Token exchange method:** Confirm `basic` vs `post` for client credentials
6. **Redirect URI format:** Get the exact OpenAI redirect URI during GPT creation
7. **CORS origins:** Confirm current ChatGPT domain origins for CORS configuration
8. **GPT Store submission requirements:** Review current guidelines if store listing is planned

**Recommended approach:** Before writing any code, create the GPT in GPT Builder with a minimal schema (1 endpoint) and test the full OAuth flow. This validates items 1-7 with real data.

---

## SOURCES

**Codebase Analysis (HIGH confidence):**
- `services/api-gateway/src/index.ts` -- Rate limiter config (lines 178-200), CORS config (lines 38-43), auth hook (lines 283-377), service registry (lines 384-395)
- `services/api-gateway/src/auth.ts` -- Clerk JWT verification, multi-client loop (lines 86-134), user caching (lines 145-163)
- `services/api-gateway/src/middleware/auth.ts` -- requireAuth/optionalAuth middleware
- `packages/shared-access-context/src/index.ts` -- resolveAccessContext, role extraction, candidateId (line 142)
- `docs/gpt/01_PRD_Custom_GPT.md` -- Product requirements and rollout plan
- `docs/gpt/02_Architecture_Custom_GPT.md` -- Auth flow, write safety pattern
- `docs/gpt/03_Technical_Specification.md` -- Error contract, rate limiting, versioning
- `docs/gpt/04_OpenAPI_Starter.yaml` -- Existing schema (incomplete response schemas identified)
- `docs/gpt/05_GPT_Instructions_Template.md` -- Current instructions template (too minimal)
- `.planning/PROJECT.md` -- v5.0 milestone context, constraints, key decisions

**Training Data (MEDIUM confidence):**
- OpenAI GPT Actions documentation (as of May 2025 training cutoff)
- OAuth2 Authorization Code Grant with PKCE (RFC 7636)
- OpenAPI 3.0 specification requirements
- GPT parameter mapping and response interpretation behavior
- GPT Store submission requirements

**Assumptions (LOW confidence -- require validation):**
- GPT Actions HTTP timeout is ~45 seconds
- GPT Actions requires OpenAPI 3.0.x specifically (not 3.1)
- Maximum ~30 operations per GPT for reasonable performance
- ChatGPT CORS origins are `https://chat.openai.com` and `https://chatgpt.com`
- GPT Store review criteria have not significantly changed since May 2025
