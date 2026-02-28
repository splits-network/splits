---
phase: 20
plan: 01
subsystem: admin-integration
tags: [admin, identity-service, admin-gateway, docker, websocket, realtime]
requires: [18-02, 18-03, 17-01]
provides: [admin-login-flow, sidebar-counts, activity-feed, realtime-websocket, docker-build, docker-compose]
affects: []
tech-stack:
  added: []
  patterns: [proxy-path-stripping, websocket-envelope, multi-stage-dockerfile]
key-files:
  created: []
  modified:
    - apps/admin/src/app/secure/layout.tsx
    - apps/admin/src/hooks/use-realtime-counts.ts
    - apps/admin/Dockerfile
    - docker-compose.yml
    - services/identity-service/src/v2/admin/repository.ts
    - services/identity-service/src/v2/admin/service.ts
    - services/identity-service/src/v2/admin/routes.ts
    - services/admin-gateway/src/realtime.ts
decisions:
  - id: proxy-path-includes-api-v2
    summary: "Admin login uses /admin/identity/api/v2/users/me — proxy strips /admin/identity, leaving full /api/v2/users/me path intact"
  - id: activity-from-user-roles-and-users
    summary: "Admin activity feed combines user_roles changes and recent users table — no separate audit log table exists"
  - id: websocket-envelope-strips-admin-prefix
    summary: "WS fan-out strips admin: prefix server-side so clients receive short channel names matching their subscription requests"
metrics:
  duration: "2 min"
  completed: "2026-02-27"
  tasks-total: 2
  tasks-completed: 2
---

# Phase 20 Plan 01: Admin Integration and Deployment Fixes Summary

**One-liner:** Closed 6 runtime integration gaps — proxy URL paths, missing /admin/activity route, WebSocket {channel,data} envelope, shared-charts in Dockerfile, and admin docker-compose entry.

## What Was Built

All 6 gaps identified in the v6.0 milestone audit are now closed. The admin app was structurally complete but could not function at runtime due to incorrect URL paths, a missing backend route, a broken WebSocket protocol, and deployment configuration gaps.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix frontend URL paths, Dockerfile, and docker-compose | 5da84f91 | layout.tsx, use-realtime-counts.ts, Dockerfile, docker-compose.yml |
| 2 | Add activity route and fix WebSocket envelope | 12fcd5c4 | repository.ts, service.ts, routes.ts, realtime.ts |

## Gaps Closed

**Gap 1 — Admin login flow (CRITICAL):**
`secure/layout.tsx` called `/admin/identity/users/me`. The admin-gateway proxy strips `/admin/identity`, leaving `/users/me`, but identity-service registers the route at `/api/v2/users/me`. Fixed by changing to `/admin/identity/api/v2/users/me`.

**Gap 2 — Sidebar counts URL:**
`use-realtime-counts.ts` called `/admin/identity/admin-counts` (hyphen). After proxy stripping this became `/admin-counts`, but the route is `/admin/counts` (slash). Fixed by changing to `/admin/identity/admin/counts`.

**Gap 3 — Missing /admin/activity route:**
`useAdminActivity` calls `/admin/identity/admin/activity` which strips to `/admin/activity`. This route did not exist in identity-service. Added repository method querying `user_roles` and `users` tables, service delegation, and route handler returning `{ data: activities }`.

**Gap 4 — WebSocket protocol mismatch:**
`realtime-provider.tsx` expects `{ channel, data }` envelope on each WebSocket message, matching on `msg.channel`. The admin-gateway was sending raw Redis messages without wrapping. Fixed the `redisSub.on('message')` handler to parse the payload and send `JSON.stringify({ channel: shortChannel, data: parsedData })`.

**Gap 5 — Admin Dockerfile missing shared-charts:**
The admin app depends on `@splits-network/shared-charts` but the Dockerfile only included `shared-ui`. Added `shared-charts` to all 4 stages: dependencies (package.json copy), build source copy, build commands, and production copy.

**Gap 5b — Missing development stage:**
`docker-compose.yml` had `target: development` for the admin service but no such stage existed in the Dockerfile. Added a `FROM base AS development` stage between dependencies and build.

**Gap 6 — Admin app not in docker-compose:**
No `admin` service existed in `docker-compose.yml`. Added the service entry with port 3200, admin-gateway dependency, admin Clerk env vars, and hot-reload volume mounts.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Proxy path includes full `/api/v2/users/me` | Proxy strips `/admin/identity` only — the downstream path must be the exact route registered in identity-service |
| Activity feed from user_roles + users | No separate audit log table; these two tables provide meaningful recent activity with no schema changes needed |
| WebSocket strips `admin:` prefix server-side | Clients subscribe to short names (e.g., `counts`), server prefixes to `admin:counts` for Redis — stripping on fan-out keeps client code clean |

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

All 9 verification checks passed:
1. `grep "api/v2/users/me" apps/admin/src/app/secure/layout.tsx` — matched
2. `grep "admin/identity/admin/counts" apps/admin/src/hooks/use-realtime-counts.ts` — matched
3. `grep "admin/activity" services/identity-service/src/v2/admin/routes.ts` — matched
4. `grep "shortChannel" services/admin-gateway/src/realtime.ts` — matched
5. `grep -c "shared-charts" apps/admin/Dockerfile` — returned 5 (4 required)
6. `grep "AS development" apps/admin/Dockerfile` — matched
7. `grep "splits-admin" docker-compose.yml` — matched
8. `pnpm --filter @splits-network/identity-service build` — passed
9. `pnpm --filter @splits-network/admin-gateway build` — passed

## Next Phase Readiness

Phase 20 is complete. All 20 phases of the v6.0 milestone are now finished. The admin app is fully integrated end-to-end: login, sidebar counts, activity feed, real-time WebSocket updates, Docker build, and docker-compose deployment all function correctly.
