# Phase 12: OAuth2 Provider - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Candidates authenticate via Clerk through a GPT-initiated OAuth2 authorization code flow and receive scoped JWT access tokens that gpt-service validates. Includes consent UI, token lifecycle, scope management, gateway routing, and a Connected Apps management page. GPT API endpoints themselves are Phase 13.

</domain>

<decisions>
## Implementation Decisions

### Authorization Experience
- Branded consent page at `https://applicant.network/authorize` (candidate app route)
- Shows Applicant.Network logo + permissions list matching Phase 13 endpoints: "Search jobs", "View job details", "Check your applications", "Submit applications", "Analyze resume fit"
- Displays the GPT name: "AI Job Copilot -- Applicant Network"
- Matches Applicant.Network style (same theme, colors, typography)
- Mobile-responsive design (ChatGPT mobile app opens OAuth in mobile browser)
- Cancel button redirects back to ChatGPT callback URL with OAuth `access_denied` error
- "Learn more" link to a new dedicated page explaining the GPT integration and data sharing
- Sign-in only (no sign-up from consent page) -- existing Applicant.Network accounts required
- Unauthenticated users redirect to `https://applicant.network/sign-in`, then back to consent after auth
- Returning users who previously authorized skip the consent page (go straight through)
- Brief "Connected!" success flash (1-2 seconds) before redirecting to ChatGPT callback
- Consent page dynamically shows only NEW permissions on scope upgrades (not previously granted scopes)

### Token Architecture (UPDATED from Phase 11 decision)
- **JWTs for access tokens** (replacing prior opaque token decision)
- Asymmetric signing with ES256 (ECDSA)
- EC private key stored as base64-encoded PEM in environment variable
- JWT claims: `iss`, `aud` ("gpt"), `exp`, `iat`, `sub` (clerk_user_id), `session_id`, `scopes` array
- **Opaque refresh tokens** (DB-backed, prefixed)
- Token prefixes: `gpt_at_` for access tokens, `gpt_rt_` for refresh tokens
- 15-min revocation lag acceptable (no real-time revocation cache needed)

### Token Lifecycle
- Access token TTL: 15 minutes
- Refresh token TTL: 30 days
- Authorization code TTL: 5 minutes
- Refresh token rotation: yes, rotate on every refresh (old invalidated, new issued)
- Replay detection: if a rotated (invalidated) refresh token is replayed, revoke ALL sessions for that user
- Multiple concurrent sessions allowed (max 5 per user)
- Session limit hit: block with error message on consent page ("You have 5 active sessions. Revoke one from your profile.")
- Expired refresh token: manual re-authorization required (user must re-initiate OAuth from ChatGPT)
- Token cleanup: background cron job (implementation deferred to Phase 15)

### Scope & Permissions Model
- Granular scopes: `jobs:read`, `applications:read`, `applications:write`, `resume:read`
- Read-first authorization: initial consent requests read scopes only (`jobs:read`, `applications:read`, `resume:read`)
- Write-on-demand: `applications:write` scope requested via step-up OAuth flow when candidate tries to submit
- Step-up creates a new session (old read-only session remains)
- JWT validation flow: validate signature + expiry -> check claims (iss, aud, exp, sessionId, userId, scopes) -> scope check against endpoint requirement
- Insufficient scope errors include the required scope in response: `{ error: "insufficient_scope", scope: "applications:write" }`

### Connected Apps Management
- "Connected Apps" section added to existing `/portal/profile` page in candidate app
- Per-session display: authorized date, last used timestamp, refresh token expiry date
- Per-session revoke buttons (individual session revocation)
- Immediate revocation + confirmation message on revoke
- Revoking invalidates all tokens for that session immediately

### Error & Denial Handling
- OAuth flow errors show branded error page on Applicant.Network (not redirect to ChatGPT)
- Specific, user-friendly error messages per error type (no technical jargon):
  - "Link expired, please try again"
  - "Authorization was cancelled"
  - "Session limit reached"
  - etc.
- Error page includes both "Try again" (restarts OAuth flow) and "Return to ChatGPT" link
- API auth errors use standard OAuth Bearer Token error format: HTTP 401/403 with `{ error: "...", error_description: "..." }`
- Distinct error codes for GPT API responses: `token_expired`, `token_revoked`, `session_limit_exceeded`, `insufficient_scope`
- CSRF protection required (OAuth state parameter validation)

### Security
- Rate limiting on auth endpoints (/authorize, /token) -- e.g., max 10 failed attempts per IP per 15 minutes
- Clerk account deletion auto-revokes all GPT sessions (via Clerk webhook)
- All OAuth events audited via RabbitMQ (successful auth, denied consent, token exchanges, revocations, failed attempts)
- No candidate notifications for OAuth events (audit log only)
- Standard gateway logging for GPT routes (no enhanced GPT-specific logging)

### Claude's Discretion
- Exact consent page layout and spacing
- Error page design and copy
- "Learn more" page content
- Rate limit implementation details
- Clerk webhook integration approach
- Gateway routing implementation for /api/v1/gpt/* bypass

</decisions>

<specifics>
## Specific Ideas

- Consent page should match Applicant.Network's existing style -- not a separate design language
- Validation flow described by user: Step 1 (JWT signature + claims) -> Step 2 (session status check, lightweight) -> Step 3 (scope check against endpoint requirement)
- Token prefixes (`gpt_at_`, `gpt_rt_`) for easy identification in logs and debugging
- "AI Job Copilot -- Applicant Network" is the Custom GPT's official name

</specifics>

<deferred>
## Deferred Ideas

- Token cleanup cron job implementation -- Phase 15 (Production Hardening)
- GPT-specific per-user rate limits for expensive endpoints -- Phase 15

</deferred>

---

*Phase: 12-oauth2-provider*
*Context gathered: 2026-02-13*
