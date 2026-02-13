---
phase: 12-oauth2-provider
plan: 04
subsystem: api
tags: [oauth2, jwt, fastify, jose, authentication]

# Dependency graph
requires:
  - phase: 12-02
    provides: OAuthService with JWT signing and token validation
provides:
  - OAuth2 route handlers for authorization code flow
  - JWT validation middleware for Phase 13 GPT API endpoints
  - Dual-auth support for GPT tokens and x-gpt-clerk-user-id header
affects: [12-05, 13-01, 13-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual-auth resolution (GPT Bearer token OR trusted header)"
    - "OAuth2 redirect error handling"
    - "Fastify preHandler middleware pattern"

key-files:
  created:
    - services/gpt-service/src/v2/oauth/routes.ts
    - services/gpt-service/src/v2/oauth/middleware.ts
  modified:
    - services/gpt-service/src/v2/routes.ts
    - services/gpt-service/src/index.ts
    - services/gpt-service/src/v2/oauth/oauth-service.ts

key-decisions:
  - "Dual-auth pattern: GPT tokens for ChatGPT calls, x-gpt-clerk-user-id header for candidate profile page"
  - "Use KeyLike type from jose instead of CryptoKey for cross-platform compatibility"
  - "extractGptAuth distinguishes token_expired from invalid_token for better error reporting"

patterns-established:
  - "resolveClerkUserId helper validates GPT token OR accepts trusted gateway header"
  - "OAuth error responses use redirect with query params per OAuth2 spec"
  - "Middleware returns 403 with { error: 'insufficient_scope', scope: 'required_scope' } format"

# Metrics
duration: 3min 35sec
completed: 2026-02-13
---

# Phase 12 Plan 04: OAuth Routes and Middleware Summary

**OAuth2 authorization endpoints with dual-auth session management and JWT validation middleware ready for Phase 13 GPT API protection**

## Performance

- **Duration:** 3 min 35 sec
- **Started:** 2026-02-13T15:21:35Z
- **Completed:** 2026-02-13T15:25:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- OAuth2 endpoints handle authorization code flow with PKCE verification
- Token endpoint supports both authorization_code and refresh_token grants
- Sessions and revoke endpoints support dual authentication (GPT tokens or trusted headers)
- JWT validation middleware ready for Phase 13 GPT API endpoint protection
- Scope checking middleware returns insufficient_scope errors with required scope name

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OAuth route handlers** - `1df1d904` (feat)
2. **Task 2: Create JWT validation middleware and scope checker** - `5b3b2048` (feat)

**Type fix:** `8662fa66` (fix: KeyLike type from jose)

## Files Created/Modified
- `services/gpt-service/src/v2/oauth/routes.ts` - 5 OAuth endpoints: authorize, token, revoke, sessions, consent-check
- `services/gpt-service/src/v2/oauth/middleware.ts` - extractGptAuth and requireScope middleware
- `services/gpt-service/src/v2/routes.ts` - OAuthService instantiation and route registration
- `services/gpt-service/src/index.ts` - Pass gptConfig to route registration
- `services/gpt-service/src/v2/oauth/oauth-service.ts` - Fixed CryptoKey → KeyLike type, hasExistingConsent return type

## Decisions Made

**Dual-auth pattern:**
- Sessions and revoke endpoints accept BOTH GPT Bearer tokens (from ChatGPT) and x-gpt-clerk-user-id headers (from candidate profile page via api-gateway)
- resolveClerkUserId helper validates GPT token via OAuthService OR accepts trusted header
- Safe because gpt-service sits behind api-gateway which sets header after Clerk auth

**Error format precision:**
- extractGptAuth distinguishes token_expired from invalid_token by checking error message
- OAuth authorize endpoint uses redirect with error query params per OAuth2 spec
- requireScope returns { error: 'insufficient_scope', scope: 'required_scope' } per CONTEXT.md

**Type compatibility:**
- Changed CryptoKey → KeyLike from jose library for ES256 key handling
- Fixes Node.js vs Web Crypto API type compatibility issue
- hasExistingConsent now returns { hasConsent: boolean, sessionCount: number } object

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed TypeScript type errors**
- **Found during:** Task 1 (compilation check)
- **Issue:** reply.redirect signature expects status code via chained .status() call, not as first argument
- **Fix:** Changed `reply.redirect(302, url)` to `reply.status(302).redirect(url)`
- **Files modified:** services/gpt-service/src/v2/oauth/routes.ts
- **Verification:** TypeScript compilation succeeds
- **Committed in:** 1df1d904 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed logger type incompatibility**
- **Found during:** Task 1 (compilation check)
- **Issue:** app.log is FastifyBaseLogger but OAuthService expects pino Logger from shared-logging
- **Fix:** Cast app.log as Logger since Fastify uses pino underneath
- **Files modified:** services/gpt-service/src/v2/routes.ts
- **Verification:** TypeScript compilation succeeds
- **Committed in:** 1df1d904 (Task 1 commit)

**3. [Rule 3 - Blocking] Fixed CryptoKey type error from Plan 02**
- **Found during:** Task 1 (compilation check)
- **Issue:** CryptoKey type not available in Node.js context, should use jose's KeyLike
- **Fix:** Import KeyLike from jose, replace CryptoKey → KeyLike in oauth-service.ts
- **Files modified:** services/gpt-service/src/v2/oauth/oauth-service.ts
- **Verification:** TypeScript compilation succeeds
- **Committed in:** 8662fa66 (separate fix commit)

---

**Total deviations:** 3 auto-fixed (3 blocking compilation issues)
**Impact on plan:** All fixes required for TypeScript compilation. No functional scope changes.

## Issues Encountered

None - all TypeScript compilation errors resolved via auto-fix deviation rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 13 (GPT API endpoints):**
- extractGptAuth middleware validates GPT tokens and populates request.gptAuth
- requireScope middleware enforces scope-based access control
- OAuth endpoints ready for ChatGPT to initiate authorization flow

**Ready for Plan 05 (Consent UI):**
- Authorize endpoint expects x-clerk-user-id header from consent page
- Consent-check endpoint returns hasConsent and sessionCount for UI logic

**Blockers/Concerns:**
- None - OAuth provider infrastructure complete

---
*Phase: 12-oauth2-provider*
*Completed: 2026-02-13*
