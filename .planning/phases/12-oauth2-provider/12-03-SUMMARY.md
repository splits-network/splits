---
phase: 12-oauth2-provider
plan: 03
subsystem: api
tags: [api-gateway, oauth2, proxy, cors, fastify]

# Dependency graph
requires:
  - phase: 11-service-foundation
    provides: gpt-service microservice infrastructure
provides:
  - api-gateway routes for GPT OAuth2 and API endpoints
  - Clerk auth bypass for GPT routes
  - ChatGPT origin CORS configuration
affects: [13-gpt-api, 14-openapi-spec]

# Tech tracking
tech-stack:
  added: []
  patterns: [auth-bypass-pattern, wildcard-proxy-routes]

key-files:
  created:
    - services/api-gateway/src/routes/v2/gpt.ts
  modified:
    - services/api-gateway/src/index.ts
    - services/api-gateway/src/routes/v2/routes.ts
    - services/api-gateway/src/routes/v2/common.ts

key-decisions:
  - "Use /api/v1/gpt/* prefix to distinguish OAuth routes from standard V2 routes"
  - "Forward Authorization and x-gpt-clerk-user-id headers for token validation and Connected Apps"
  - "Merge ChatGPT origins with CORS_ORIGIN env var for production flexibility"

patterns-established:
  - "Auth bypass pattern: check request.url.startsWith() before other auth hooks"
  - "Wildcard proxy pattern: extract path after prefix, forward to service with different base"

# Metrics
duration: 2min
completed: 2026-02-13
---

# Phase 12 Plan 03: API Gateway GPT Routing Summary

**api-gateway proxies /api/v1/gpt/* to gpt-service with Clerk bypass and ChatGPT CORS origins**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-13T15:08:59Z
- **Completed:** 2026-02-13T15:11:16Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- gpt-service registered in ServiceRegistry at port 3014
- OAuth and API proxy routes created with wildcard support
- Clerk authentication bypassed for /api/v1/gpt/* routes
- ChatGPT origins (chat.openai.com, chatgpt.com) added to production CORS

## Task Commits

Each task was committed atomically:

1. **Task 1: Register gpt-service and create GPT proxy routes** - `2194ad60` (feat)
2. **Task 2: Add ChatGPT origins to CORS allowed origins** - `c1bdffd4` (feat)

## Files Created/Modified
- `services/api-gateway/src/routes/v2/gpt.ts` - GPT OAuth and API proxy route handlers
- `services/api-gateway/src/routes/v2/common.ts` - Added 'gpt' to ServiceName union type
- `services/api-gateway/src/routes/v2/routes.ts` - Registered registerGptRoutes function
- `services/api-gateway/src/index.ts` - Registered gpt-service, added auth bypass, added GPT CORS origins

## Decisions Made

**1. Use /api/v1/gpt/* prefix instead of /api/v2/gpt/***
- Rationale: GPT routes use OAuth2 tokens, not Clerk JWTs. Using v1 prefix distinguishes this auth paradigm from v2 routes that expect Clerk authentication.
- Impact: Clear separation between OAuth-authenticated and Clerk-authenticated routes in gateway routing logic.

**2. Forward both Authorization and x-gpt-clerk-user-id headers**
- Rationale: Authorization header contains GPT OAuth token for validation. x-gpt-clerk-user-id header is used by Connected Apps page to impersonate candidate context when testing GPT APIs from portal.
- Impact: Enables both ChatGPT OAuth flow and admin testing from candidate profile page.

**3. Merge ChatGPT origins with CORS_ORIGIN env var**
- Rationale: Production deployments may have custom domains in CORS_ORIGIN. Merging ensures both app domains and ChatGPT domains are allowed.
- Impact: Production CORS configuration remains flexible while always including required ChatGPT origins.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Environment variables:**
- `GPT_SERVICE_URL` - Optional, defaults to http://localhost:3014 in development

**Production CORS:**
- ChatGPT origins are now automatically included in production CORS alongside CORS_ORIGIN env var origins
- No additional configuration required

## Next Phase Readiness

**Ready for Phase 12 Plan 04 (OAuth endpoints):**
- api-gateway routing layer complete
- /api/v1/gpt/oauth/* routes ready to receive traffic
- Clerk authentication correctly bypassed
- ChatGPT can make cross-origin requests to OAuth endpoints

**No blockers.**

---
*Phase: 12-oauth2-provider*
*Completed: 2026-02-13*
