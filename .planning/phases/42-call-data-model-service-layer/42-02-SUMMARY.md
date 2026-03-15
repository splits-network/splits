---
phase: 42-call-data-model-service-layer
plan: 02
subsystem: api
tags: [fastify, supabase, typescript, call-service, repository, livekit]

# Dependency graph
requires:
  - phase: 42-call-data-model-service-layer (plan 01)
    provides: All call tables (calls, call_participants, call_entity_links, call_access_tokens, call_recordings, call_transcripts, call_summaries, call_notes, call_types)
provides:
  - call-service Fastify microservice on port 3020
  - Complete TypeScript types for all 9 call domain tables
  - CallRepository with paginated list, CRUD, and detail queries
  - ParticipantRepository for join/leave/consent tracking
  - ArtifactRepository for entity links, access tokens, and notes
affects: [42-03 call-service routes, 42-04 gateway integration, 43 video-app]

# Tech tracking
tech-stack:
  added: []
  patterns: [split repository pattern (main + participant + artifact sub-repos), entity-filtered list via junction table pre-query]

key-files:
  created:
    - services/call-service/package.json
    - services/call-service/tsconfig.json
    - services/call-service/src/index.ts
    - services/call-service/src/v2/types.ts
    - services/call-service/src/v2/routes.ts
    - services/call-service/src/v2/shared/events.ts
    - services/call-service/src/v2/repository.ts
    - services/call-service/src/v2/participant-repository.ts
    - services/call-service/src/v2/artifact-repository.ts
  modified: []

key-decisions:
  - "Split repository into 3 files (repository, participant-repository, artifact-repository) to stay under ~200 line limit"
  - "Entity-based list filtering uses pre-query on call_entity_links then IN clause, avoiding complex join in main query"
  - "CallRepository exposes sub-repos via .participants and .artifacts properties for clean API"

patterns-established:
  - "Split repository pattern: main class delegates to domain-focused sub-repositories sharing same Supabase client"
  - "Entity filter pre-query: resolve entity links to call IDs first, then filter calls with IN clause"

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 42 Plan 02: Call Service Scaffold & Repository Summary

**Fastify call-service on port 3020 with complete TypeScript types for 9 tables and split repository layer supporting paginated entity-filtered queries**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T22:06:24Z
- **Completed:** 2026-03-08T22:10:45Z
- **Tasks:** 2
- **Files created:** 9

## Accomplishments
- Scaffolded call-service microservice following video-service pattern (Fastify, Swagger, Sentry, RabbitMQ outbox, LiveKit config)
- Complete TypeScript types for all 9 call tables matching migration schema exactly, plus composite response types and input types
- Repository layer with 20+ methods: paginated list with entity/status/date filtering, CRUD, detail with optional includes, participant lifecycle, entity links, access tokens, notes

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold call-service with types** - `e82c5e6c` (feat)
2. **Task 2: Implement repository layer** - `66efe735` (feat)

## Files Created/Modified
- `services/call-service/package.json` - Service manifest with Fastify, Supabase, livekit-server-sdk deps
- `services/call-service/tsconfig.json` - TypeScript config with shared package references
- `services/call-service/src/index.ts` - Fastify bootstrap with Supabase, RabbitMQ, LiveKit, health endpoint
- `services/call-service/src/v2/types.ts` - All TypeScript interfaces for call domain (9 tables + composites + inputs)
- `services/call-service/src/v2/routes.ts` - Stub for Plan 42-03 route registration
- `services/call-service/src/v2/shared/events.ts` - Re-exports from shared-job-queue
- `services/call-service/src/v2/repository.ts` - Main repository: calls CRUD, listCalls with filters, getCallDetail with includes
- `services/call-service/src/v2/participant-repository.ts` - Participant add/remove/get/join/leave/consent
- `services/call-service/src/v2/artifact-repository.ts` - Entity links, access tokens, notes queries

## Decisions Made
- Split repository into 3 focused files to honor ~200 line architecture rule while maintaining single Supabase client via composition
- Entity-based filtering uses pre-query strategy (resolve call_entity_links to IDs, then IN clause) for clean separation
- Participant user enrichment uses batch user lookup with Map for O(1) per-participant resolution

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed PromiseLike type error in getCallDetail**
- **Found during:** Task 2 (Repository implementation)
- **Issue:** Supabase `.then()` returns PromiseLike, not Promise, causing TypeScript compilation error
- **Fix:** Replaced `.then()` chains with async IIFEs in Promise.all array
- **Files modified:** services/call-service/src/v2/repository.ts
- **Verification:** `pnpm --filter @splits-network/call-service build` succeeds
- **Committed in:** 66efe735 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for TypeScript compilation. No scope creep.

## Issues Encountered

None beyond the PromiseLike type issue documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Repository layer complete, ready for route registration in Plan 42-03
- All types exported and available for route handlers
- CallRepository.participants and CallRepository.artifacts provide clean API for route logic

---
*Phase: 42-call-data-model-service-layer*
*Completed: 2026-03-08*
