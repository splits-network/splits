---
phase: 42-call-data-model-service-layer
plan: 03
subsystem: api
tags: [fastify, livekit, rabbitmq, supabase, call-lifecycle]

# Dependency graph
requires:
  - phase: 42-02
    provides: "Repository layer (CallRepository, ParticipantRepository, ArtifactRepository) and TypeScript types"
provides:
  - "CallService with full call lifecycle (create, list, get, update, delete, start, end, cancel)"
  - "Participant and entity link sub-resource management"
  - "TokenService for access token creation and LiveKit JWT exchange"
  - "13 Fastify routes covering all call API endpoints"
  - "RabbitMQ event publishing for call.created, call.started, call.ended, call.cancelled"
affects: [42-04, 43-api-gateway-routing, 44-video-app-frontend]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CallService class following InterviewService pattern with event publishing"
    - "State machine validation for call status transitions"
    - "requireUserContext helper for Clerk auth header extraction"

key-files:
  created:
    - "services/call-service/src/v2/service.ts"
    - "services/call-service/src/v2/token-service.ts"
    - "services/call-service/src/v2/shared/helpers.ts"
  modified:
    - "services/call-service/src/v2/routes.ts"

key-decisions:
  - "Auto-add creator as host participant when not explicitly in participants list"
  - "State transition validation uses 409 Conflict for invalid transitions"
  - "Token service stores access tokens with 24h expiry, LiveKit JWTs with 4h TTL"

patterns-established:
  - "Call status state machine: scheduled->active->completed, scheduled/active->cancelled"
  - "Sub-resource routes under /api/v2/calls/:id/ for participants, entities, token"

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 42 Plan 03: Service Layer & Routes Summary

**CallService with 12 business logic methods, TokenService for LiveKit JWT exchange, and 13 Fastify routes covering full call CRUD, status transitions, sub-resources, and token generation**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T22:13:33Z
- **Completed:** 2026-03-08T22:16:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- CallService implementing full call lifecycle with state transition validation and RabbitMQ event publishing
- TokenService generating access tokens and LiveKit JWTs following video-service pattern
- 13 Fastify routes with { data } envelope, StandardListParams pagination, and Clerk auth

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement service layer with business logic** - `65abbd58` (feat)
2. **Task 2: Implement Fastify routes** - `cb2da93d` (feat)

## Files Created/Modified
- `services/call-service/src/v2/service.ts` - CallService class with 12 methods for call lifecycle, participant, and entity link management
- `services/call-service/src/v2/token-service.ts` - TokenService with createToken and exchangeToken for access tokens and LiveKit JWTs
- `services/call-service/src/v2/shared/helpers.ts` - requireUserContext helper extracting Clerk user ID from headers
- `services/call-service/src/v2/routes.ts` - 13 Fastify route registrations (CRUD + transitions + sub-resources + token)

## Decisions Made
- Auto-add call creator as host participant when not explicitly included in participants array
- Use 409 Conflict status for invalid state transitions (e.g., starting an active call)
- Access tokens expire in 24h, LiveKit JWTs in 4h matching video-service pattern
- requireUserContext throws 401 (not generic Error) for missing auth header

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added requireUserContext helper with proper 401 status code**
- **Found during:** Task 1 (service layer implementation)
- **Issue:** Call-service shared directory had no helpers.ts; video-service pattern uses requireUserContext for Clerk auth
- **Fix:** Created shared/helpers.ts with requireUserContext that returns 401 for missing x-clerk-user-id header
- **Files modified:** services/call-service/src/v2/shared/helpers.ts
- **Verification:** Build passes, all routes use the helper
- **Committed in:** 65abbd58 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential helper for auth. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Call-service has a complete functional API ready for gateway routing
- All 13 routes registered and building successfully
- Ready for Plan 42-04 (testing) or Phase 43 (gateway integration)

---
*Phase: 42-call-data-model-service-layer*
*Completed: 2026-03-08*
