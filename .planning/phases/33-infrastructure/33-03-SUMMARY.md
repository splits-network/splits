---
phase: 33-infrastructure
plan: "03"
subsystem: video-service, api-gateway
tags: [livekit, jwt, magic-link, gateway-proxy, token-exchange]
dependency-graph:
  requires: ["33-02"]
  provides: ["magic link token exchange", "LiveKit JWT generation", "gateway proxy for video-service"]
  affects: ["34", "35"]
tech-stack:
  added: []
  patterns: ["magic link auth bypass in gateway", "lazy room name assignment"]
key-files:
  created:
    - services/video-service/src/v2/interviews/token-service.ts
    - services/api-gateway/src/routes/v2/video.ts
  modified:
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/video-service/src/v2/routes.ts
    - services/video-service/src/index.ts
    - services/api-gateway/src/routes/v2/routes.ts
    - services/api-gateway/src/index.ts
    - infra/k8s/api-gateway/deployment.yaml
decisions:
  - id: "auth-bypass-join"
    description: "POST /api/v2/interviews/join bypasses Clerk auth in gateway for magic link access"
  - id: "lazy-room-name"
    description: "Room names assigned on first token generation if not already set (interview-{uuid})"
metrics:
  duration: "~4 minutes"
  completed: "2026-03-08"
---

# Phase 33 Plan 03: Token System and Gateway Routing Summary

**One-liner:** Magic link token exchange with LiveKit JWT generation, plus gateway proxy routing for video-service with auth bypass on join endpoint

## What Was Built

### Task 1: Token Service
- **TokenService** class with `exchangeMagicLink()` and `generateAuthenticatedToken()` methods
- Magic link exchange: validates token via repository, checks interview status (410 Gone for terminated interviews), generates LiveKit JWT
- Authenticated token: validates user is a participant (403 if not), generates LiveKit JWT
- Lazy room name assignment: `interview-{uuid}` format, set on first token generation if missing
- LiveKit AccessToken with 4-hour TTL, full publish/subscribe/data grants
- Two new routes: `POST /api/v2/interviews/join` (no auth) and `POST /api/v2/interviews/:id/token` (auth required)
- Repository `updateRoomName()` method added for lazy room creation

### Task 2: Gateway Routing
- `registerVideoRoutes()` in `services/api-gateway/src/routes/v2/video.ts` following chat-service proxy pattern
- Proxies all HTTP methods (GET/POST/PATCH/DELETE) for `/api/v2/interviews` and `/api/v2/interviews/*`
- Video service registered in ServiceRegistry: `video` -> port 3019
- Auth bypass in gateway `onRequest` hook for `POST /api/v2/interviews/join`
- K8s `VIDEO_SERVICE_URL` env var added to api-gateway deployment

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/video-service build` compiles successfully
- `pnpm --filter @splits-network/api-gateway build` compiles successfully
- `token-service.ts` imports from `livekit-server-sdk`
- `/join` route does NOT reference `x-clerk-user-id`
- `registerVideoRoutes` registered in gateway routes
- `VIDEO_SERVICE_URL` present in K8s deployment
- Auth bypass in place for `/api/v2/interviews/join`

## Next Phase Readiness

Phase 33 infrastructure is complete. Downstream phases can build on:
- Token exchange endpoint for candidate magic link flow
- Authenticated token endpoint for logged-in users
- All video endpoints accessible through api-gateway
- LiveKit room JWT generation working
