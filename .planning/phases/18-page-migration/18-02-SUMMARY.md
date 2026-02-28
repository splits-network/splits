---
phase: 18-page-migration
plan: 02
subsystem: api
tags: [websocket, realtime, redis, pubsub, react-context, hooks, admin]

# Dependency graph
requires:
  - phase: 17-admin-app-gateway-scaffold
    provides: admin-gateway service with AdminAuthMiddleware + Redis setup
provides:
  - WebSocket server in admin-gateway at /ws with Clerk admin auth gate and Redis pub/sub relay
  - RealtimeProvider React context with auto-reconnect and exponential backoff
  - useAdminRealtime hook for channel subscriptions
  - useRealtimeCounts hook for live sidebar badge counts with fallback polling
affects: [18-page-migration, admin sidebar badges, admin dashboard live data]

# Tech tracking
tech-stack:
  added: [ws@8.18.3, @types/ws@8.18.1]
  patterns:
    - WebSocket server attached to Fastify HTTP server via app.server
    - Separate Redis client for pub/sub (duplicated from main Redis connection)
    - Admin channel prefix enforcement (admin: prefix applied server-side)
    - Stable callback ref pattern in hooks to avoid re-subscription on parent re-renders
    - Exponential backoff reconnect (1s → 2s → 4s → ... → 30s max)

key-files:
  created:
    - services/admin-gateway/src/realtime.ts
    - apps/admin/src/providers/realtime-provider.tsx
    - apps/admin/src/hooks/use-admin-realtime.ts
    - apps/admin/src/hooks/use-realtime-counts.ts
  modified:
    - services/admin-gateway/src/index.ts
    - services/admin-gateway/package.json

key-decisions:
  - "setupRealtimeServer receives AdminRealtimeConfig struct (not AdminAuthMiddleware) — simpler interface, no Fastify coupling"
  - "Separate redisSub client duplicated from main Redis — pub/sub requires dedicated connection"
  - "Channel prefix admin: applied server-side — clients subscribe to counts, server stores as admin:counts"
  - "useRealtimeCounts fetches initial counts via REST, real-time via WebSocket, polling every 60s when WS disconnected"

patterns-established:
  - "Admin realtime: RealtimeProvider wraps admin layout, hooks consume via useRealtimeContext"
  - "Stable callback ref in useAdminRealtime: callbackRef.current = callback prevents unnecessary resubscriptions"
  - "WS reconnect via onclose handler + exponential backoff, not onopen retry"

# Metrics
duration: 3min
completed: 2026-02-27
---

# Phase 18 Plan 02: Admin Real-Time Infrastructure Summary

**WebSocket server in admin-gateway with Clerk admin auth gate, Redis pub/sub relay, and React hooks for live sidebar badge counts with exponential backoff reconnection**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-27T00:59:44Z
- **Completed:** 2026-02-27T01:02:44Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- WebSocket server at `/ws` in admin-gateway: verifies Clerk token + isPlatformAdmin before accepting connection
- Redis pub/sub relay with per-channel fan-out; `admin:` prefix enforced server-side; max 10 channels/socket
- Heartbeat ping every 30s, stale connections (no pong in 60s) terminated automatically
- `RealtimeProvider` context with WebSocket lifecycle management, auto-reconnect with exponential backoff (1s → 30s max)
- `useAdminRealtime(channel, callback)` hook for channel subscriptions with stable callback ref
- `useRealtimeCounts()` hook providing live `AdminCounts` type with REST initial load and 60s polling fallback

## Task Commits

1. **Task 1: Add WebSocket server to admin-gateway** - `e82f4441` (feat)
2. **Task 2: Create admin app real-time provider and hooks** - `ce3efb71` (feat)

## Files Created/Modified
- `services/admin-gateway/src/realtime.ts` - WebSocket server: auth, channel subscriptions, heartbeat, Redis pub/sub
- `services/admin-gateway/src/index.ts` - Added setupRealtimeServer call after app.listen()
- `services/admin-gateway/package.json` - Added ws + @types/ws dependencies
- `apps/admin/src/providers/realtime-provider.tsx` - React context with WebSocket connection management
- `apps/admin/src/hooks/use-admin-realtime.ts` - Hook to subscribe to admin real-time channels
- `apps/admin/src/hooks/use-realtime-counts.ts` - Hook for live sidebar badge counts

## Decisions Made
- `setupRealtimeServer` receives a plain config object rather than the full `AdminAuthMiddleware` instance — avoids Fastify coupling and keeps the WebSocket module independent
- Dedicated `redisSub` client created via `redis.duplicate()` — Redis pub/sub mode requires a separate connection that can't run regular commands
- Channel prefix `admin:` is applied server-side — clients subscribe to `counts`, server subscribes to `admin:counts`; prevents clients from crafting arbitrary Redis keys
- `useRealtimeCounts` does initial REST load + WebSocket updates + polling fallback — ensures counts are visible even before WebSocket connects

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Real-time infrastructure is complete and ready for admin sidebar to consume `useRealtimeCounts`
- Dashboard live data can subscribe to additional channels (activity, health) via `useAdminRealtime`
- Admin-gateway must publish to `admin:counts` channel in Redis when counts change for badge updates to work

---
*Phase: 18-page-migration*
*Completed: 2026-02-27*
