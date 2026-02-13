---
phase: 15-production-hardening
plan: 02
subsystem: api
tags: [rate-limiting, fastify, redis, gpt, security]

# Dependency graph
requires:
  - phase: 12-gpt-oauth-gateway
    provides: GPT route registrations in api-gateway
  - phase: 15-production-hardening plan 01
    provides: Webhook signature verification (parallel wave)
provides:
  - Per-user tiered rate limiting on all GPT endpoints
  - Read tier (30 req/min) and write tier (10 req/min)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route-level @fastify/rate-limit config overrides for tiered rate limiting"
    - "Bearer token suffix keying for per-user rate limit buckets"

key-files:
  created: []
  modified:
    - services/api-gateway/src/routes/v2/gpt.ts

key-decisions:
  - "Route-level config overrides instead of separate plugin registrations (cleaner, uses existing global @fastify/rate-limit)"
  - "Bearer token last-16-chars as rate limit key (unique per session, avoids storing full token)"
  - "Separate key prefixes gpt-read: and gpt-write: to isolate read/write buckets"
  - "OAuth endpoints (authorize, token, revoke) use read tier since they are not expensive operations"
  - "No redis parameter needed in registerGptRoutes -- route-level config inherits global plugin's Redis store"

patterns-established:
  - "Tiered rate limiting: define config objects, apply via { config: rateLimitConfig } on route options"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 15 Plan 02: GPT Rate Limiting Summary

**Per-user tiered rate limiting on GPT endpoints: 30 req/min reads, 10 req/min writes, keyed by Bearer token suffix via @fastify/rate-limit route-level overrides**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T18:51:33Z
- **Completed:** 2026-02-13T18:54:33Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- All 5 GPT route registrations have per-user tiered rate limit config overrides
- Read endpoints (GET wildcard, OAuth authorize/token/revoke): 30 requests/min per user
- Write/expensive endpoints (POST wildcard for application submission, resume analysis): 10 requests/min per user
- Rate limit keys isolated by prefix (`gpt-read:` / `gpt-write:`) so read and write budgets are independent
- 429 Too Many Requests responses automatically include `Retry-After` header via @fastify/rate-limit

## Task Commits

Each task was committed atomically:

1. **Task 1: Add GPT-specific per-user tiered rate limiting** - `16784926` (feat)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `services/api-gateway/src/routes/v2/gpt.ts` - Added gptReadRateLimit and gptWriteRateLimit config objects with route-level overrides on all 5 GPT routes

## Decisions Made
- Used route-level `{ config: { rateLimit: {...} } }` overrides rather than registering separate rate-limit plugin instances -- cleaner and leverages existing global plugin's Redis store
- Skipped passing redis parameter to `registerGptRoutes` since route-level config overrides inherit the store from the globally registered @fastify/rate-limit plugin (minor deviation from plan, avoids dead code)
- OAuth endpoints classified as "read" tier (30/min) since token exchange and revocation are not computationally expensive

## Deviations from Plan

None - plan executed as written. One minor simplification: skipped the planned redis parameter pass-through to `registerGptRoutes` since `@fastify/rate-limit` route-level config overrides automatically use the store configured at global plugin registration. This avoided adding an unused parameter.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required. Rate limiting uses the existing Redis instance already configured in api-gateway.

## Next Phase Readiness
- GPT endpoints are now protected against excessive usage
- Global rate limit (500 req/min authenticated) still applies as a ceiling
- Ready for additional production hardening tasks

---
*Phase: 15-production-hardening*
*Completed: 2026-02-13*
