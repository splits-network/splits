---
phase: 39-integration-wiring-auth-fixes
plan: 02
subsystem: video-interviews
tags: [dual-auth, magic-link, interview-notes, gateway-bypass]
dependency-graph:
  requires: [38-01, 36-03]
  provides: [candidate-notes-dual-auth]
  affects: []
tech-stack:
  added: []
  patterns: [dual-auth-magic-link-or-clerk]
key-files:
  created: []
  modified:
    - services/video-service/src/v2/interviews/routes.ts
    - services/api-gateway/src/index.ts
decisions: []
metrics:
  duration: "~5 minutes"
  completed: 2026-03-08
---

# Phase 39 Plan 02: Candidate Notes Dual-Auth Summary

Dual-auth (magic link token OR Clerk) on interview notes PUT and GET endpoints so candidates using magic links can take and retrieve notes during calls.

## What Was Done

### Task 1: Add dual-auth to PUT /interviews/:id/notes
- **Commit:** fe2d1646
- Modified PUT handler to accept optional `token` field in request body
- Magic link path: validates token via `tokenService.validateMagicLinkToken`, extracts `user_id` and participant `id` directly from token result
- Clerk path: falls back to existing `requireUserContext` flow (unchanged behavior)
- `saveInterviewNote` call unchanged, uses resolved `userId`/`participantId` from whichever auth path

### Task 2: Add dual-auth to GET /interviews/:id/notes and gateway bypass
- **Commit:** 63cf0912
- Modified GET handler to accept optional `token` query parameter
- Magic link path: validates token, verifies interview match
- Clerk path: falls back to `requireUserContext`
- Added gateway auth bypass for PUT/GET on `/api/v2/interviews/:id/notes`
- Regex `(\?|$)` anchor ensures POST `/notes/post-to-application` is NOT bypassed
- Verified regex correctness: rejects sub-paths, accepts bare path and query string

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] `pnpm --filter @splits-network/video-service build` passes
- [x] `pnpm --filter @splits-network/api-gateway build` passes
- [x] Regex rejects `/notes/post-to-application` (false)
- [x] Regex matches `/notes` (true)
- [x] Regex matches `/notes?token=xyz` (true)

## Decisions Made

No new decisions -- followed established dual-auth pattern from recording consent (Phase 36-03).
