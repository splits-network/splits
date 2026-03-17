---
phase: 33-infrastructure
plan: "02"
subsystem: video-service
tags: [fastify, supabase, interviews, microservice, kubernetes]
dependency-graph:
  requires: ["33-01"]
  provides: ["video-service scaffold", "interview CRUD endpoints", "K8s deployment manifest"]
  affects: ["33-03", "33-04", "33-05"]
tech-stack:
  added: ["livekit-server-sdk"]
  patterns: ["V2 resource pattern (types/repo/service/routes)", "outbox event publishing"]
key-files:
  created:
    - services/video-service/package.json
    - services/video-service/tsconfig.json
    - services/video-service/Dockerfile
    - services/video-service/src/index.ts
    - services/video-service/src/v2/routes.ts
    - services/video-service/src/v2/shared/events.ts
    - services/video-service/src/v2/shared/helpers.ts
    - services/video-service/src/v2/interviews/types.ts
    - services/video-service/src/v2/interviews/repository.ts
    - services/video-service/src/v2/interviews/service.ts
    - services/video-service/src/v2/interviews/routes.ts
    - infra/k8s/video-service/deployment.yaml
  modified:
    - pnpm-lock.yaml
decisions:
  - id: "port-3019"
    description: "video-service uses port 3019 (next after gamification-service 3018)"
  - id: "room-name-uuid"
    description: "Room names use crypto.randomUUID() prefixed with 'interview-'"
  - id: "default-limits"
    description: "max_duration_seconds=14400 (4h), grace_period_seconds=300 (5m), scheduled_duration_minutes=60"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-08"
---

# Phase 33 Plan 02: Video Service Scaffold Summary

**One-liner:** Fastify video-service with interview CRUD (create/get/list/cancel) following V2 resource pattern, K8s deployment with LiveKit secrets

## What Was Built

### Task 1: Service Scaffold
- Full Fastify service entrypoint following chat-service pattern exactly
- Sentry error tracking, Swagger docs, health endpoint
- EventPublisher + OutboxPublisher + OutboxWorker for durable RabbitMQ events
- Dockerfile with multi-stage build (dev/build/prod)
- K8s deployment manifest with Supabase and LiveKit secrets, ClusterIP service
- Port 3019, 2 replicas, standard resource limits

### Task 2: Interview CRUD
- **types.ts**: InterviewStatus (6 values), InterviewType (6 values), ParticipantRole (3 values), Interview, InterviewParticipant, InterviewAccessToken, InterviewWithParticipants, CreateInterviewInput
- **repository.ts**: Full Supabase CRUD - createInterview, addParticipants, createAccessToken, findById, findByIdWithParticipants, findByApplicationId (paginated), findAccessTokenByToken, updateStatus, updateParticipantJoined/Left
- **service.ts**: Business logic - validates application exists, validates future scheduling, generates room names, creates access tokens (crypto.randomBytes), publishes interview.created/cancelled events
- **routes.ts**: POST /api/v2/interviews (201), GET /api/v2/interviews/:id, GET /api/v2/interviews?application_id=X (paginated), PATCH /api/v2/interviews/:id/cancel

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/video-service build` compiles successfully
- `services/video-service/dist/index.js` exists
- All routes export `registerInterviewRoutes`
- All responses use `{ data }` envelope pattern
- List endpoint includes pagination object

## Next Phase Readiness

Plan 03 (token system) can build on:
- `InterviewRepository.findAccessTokenByToken()` for magic link lookup
- `InterviewRepository.createAccessToken()` for token generation
- `livekit-server-sdk` dependency already installed
- LiveKit secrets configured in K8s manifest
