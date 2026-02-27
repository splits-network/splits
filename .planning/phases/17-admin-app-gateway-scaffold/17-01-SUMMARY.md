---
phase: 17-admin-app-gateway-scaffold
plan: 01
subsystem: api
tags: [fastify, clerk, jwt, http-proxy, rate-limit, redis, supabase, admin-gateway]

# Dependency graph
requires:
  - phase: 16-shared-packages
    provides: shared-access-context (resolveAccessContext), shared-fastify (buildServer, errorHandler, UnauthorizedError, ForbiddenError), shared-config (loadBaseConfig, loadDatabaseConfig, loadRedisConfig, getEnvOrThrow), shared-logging (createLogger)
provides:
  - services/admin-gateway Fastify service with JWT auth + isPlatformAdmin enforcement
  - Proxy routes for all 13 domain services under /admin/{service}/* with prefix stripping
  - Rate limiting (100 req/min) with Redis key bucketing per auth token tail
  - Health endpoint at /health (no auth required)
  - AdminAuthMiddleware class (reusable Clerk JWT + resolveAccessContext pattern)
affects:
  - 17-02 (admin app scaffold — uses ADMIN_GATEWAY_URL pointing to this service)
  - 17-03 (Dockerfile + K8s — deploys this service on port 3020)

# Tech tracking
tech-stack:
  added:
    - "@fastify/http-proxy ^11.4.1 — HTTP proxy with header rewriting and prefix stripping"
    - "@fastify/rate-limit ^10.1.1 — Redis-backed rate limiting for admin gateway"
    - "ioredis ^5.8.2 — Redis client for rate limit store"
  patterns:
    - "AdminAuthMiddleware: Clerk verifyToken + resolveAccessContext → isPlatformAdmin guard"
    - "@fastify/http-proxy with rewritePrefix: '' strips /admin/{service} prefix before forwarding"
    - "ADMIN_CLERK_SECRET_KEY read directly via getEnvOrThrow (not loadClerkConfig) for separate Clerk instance"
    - "Supabase initialized with service role key (not anon key) in auth middleware to bypass RLS"
    - "PORT default set before loadBaseConfig via process.env.PORT = '3020' fallback"

key-files:
  created:
    - services/admin-gateway/package.json
    - services/admin-gateway/tsconfig.json
    - services/admin-gateway/src/auth.ts
    - services/admin-gateway/src/routes.ts
    - services/admin-gateway/src/index.ts

key-decisions:
  - "Uses verifyToken from @clerk/backend directly (no createClerkClient needed for token-only verification)"
  - "ADMIN_CLERK_SECRET_KEY read via getEnvOrThrow (not loadClerkConfig which reads CLERK_SECRET_KEY)"
  - "Supabase service role key required at startup — throws if missing (not soft-fail)"
  - "Port 3020: avoids conflicts with api-gateway (3000) and all domain services (3001-3017)"
  - "Rate limit key uses last 16 chars of auth header (same pattern as api-gateway)"

patterns-established:
  - "AdminAuthMiddleware pattern: constructor(secretKey, supabaseUrl, supabaseServiceRoleKey), createMiddleware() returns Fastify preHandler"
  - "registerAdminRoutes(app, services): iterates serviceMap, registers httpProxy per service with header injection"
  - "onRequest hook for auth: skip /health, call authMiddleware.createMiddleware() for everything else"

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 17 Plan 01: Admin Gateway Service Summary

**Fastify admin-gateway service with Clerk JWT auth, isPlatformAdmin enforcement via resolveAccessContext, and @fastify/http-proxy routing to all 13 domain services on port 3020**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-27T23:14:06Z
- **Completed:** 2026-02-27T23:17:16Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- AdminAuthMiddleware class verifies Clerk JWTs, calls resolveAccessContext, and rejects non-platform-admins with 403
- Proxy routes for all 13 domain services under /admin/{service}/* with correct prefix stripping (rewritePrefix: '')
- main() entry point wiring buildServer, rate-limit (Redis-backed), auth hook, health endpoint, graceful shutdown

## Task Commits

Each task was committed atomically:

1. **Task 1: Create admin-gateway package and auth middleware** - `12dcf12f` (feat)
2. **Task 2: Create proxy routes and main entry point** - `4134a43d` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `services/admin-gateway/package.json` - Package manifest: @splits-network/admin-gateway, dev/build/start scripts, all required deps
- `services/admin-gateway/tsconfig.json` - Extends tsconfig.base.json, project references to all shared packages
- `services/admin-gateway/src/auth.ts` - AdminAuthMiddleware: verifyToken + resolveAccessContext + isPlatformAdmin guard
- `services/admin-gateway/src/routes.ts` - registerAdminRoutes: @fastify/http-proxy for 13 domain services with header injection
- `services/admin-gateway/src/index.ts` - main(): buildServer, rateLimit, auth hook, service URL map, health endpoint, port 3020

## Decisions Made

- **verifyToken only (no createClerkClient):** Admin gateway only needs JWT verification, not Clerk API calls. `verifyToken` from `@clerk/backend` is sufficient and avoids an unnecessary API client.
- **ADMIN_CLERK_SECRET_KEY read directly:** `loadClerkConfig` reads `CLERK_SECRET_KEY`. Admin gateway's separate Clerk instance uses `ADMIN_CLERK_SECRET_KEY`. Used `getEnvOrThrow` directly rather than adding a single-use `loadAdminClerkConfig` to shared-config (Open Question 3 from RESEARCH.md resolved).
- **Supabase service role key throws at startup:** Fail-fast is better than serving 403s to all admin users at runtime.
- **Port default via process.env before loadBaseConfig:** `loadBaseConfig` uses `getEnvOrDefault('PORT', '3000')`. Setting `process.env.PORT = '3020'` before calling it ensures the admin-gateway gets its correct default without needing a new config pattern.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required for this plan. ADMIN_CLERK_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY are needed at runtime but were already documented in RESEARCH.md.

## Next Phase Readiness

- Admin gateway service compiles and passes all verification checks
- Ready for Plan 17-02: Admin app scaffold (Next.js app that calls this gateway)
- Ready for Plan 17-03: Dockerfile and K8s deployment manifests

---
*Phase: 17-admin-app-gateway-scaffold*
*Completed: 2026-02-27*
