---
phase: 53-per-call-recording-ai-controls
plan: "01"
subsystem: call-service
tags: [database, migration, call-service, recording, ai, subscription-gating]

dependency-graph:
  requires:
    - "52-candidate-call-experience"
  provides:
    - "recording_enabled and ai_analysis_enabled columns on calls table"
    - "Tier-gated call creation endpoint rejecting ai_analysis_enabled for non-Partner users"
    - "Updated Call, CallType, CreateCallInput, CallDetail TypeScript types"
  affects:
    - "53-02: call creation modal UI reads recording_enabled from API response"
    - "53-03: ai-service pipeline reads recording_enabled and ai_analysis_enabled flags"
    - "53-04: post-call detail tab gating reads recording_enabled from call object"

tech-stack:
  added: []
  patterns:
    - "Subscription tier lookup via subscriptions + plans join (getCreatorTier in repository)"
    - "Per-call boolean flags replacing call_type-level behavior columns"

key-files:
  created:
    - supabase/migrations/20260310000002_add_call_recording_flags.sql
  modified:
    - services/call-service/src/v2/types.ts
    - services/call-service/src/v2/repository.ts
    - services/call-service/src/v2/service.ts
    - services/call-service/src/v2/routes.ts

decisions:
  - id: "53-01-a"
    decision: "recording_enabled drives consent banner instead of call_types.requires_recording_consent"
    rationale: "Decouples call categorization from consent logic; per-call flag is cleaner"
  - id: "53-01-b"
    decision: "ai_analysis_enabled gated at creation time with 400 for non-Partner users (not silent strip)"
    rationale: "Explicit error prevents user confusion about why AI analysis never ran"
  - id: "53-01-c"
    decision: "getCreatorTier queries subscriptions + plans directly in call-service repository (no HTTP to billing-service)"
    rationale: "Architecture rule: no HTTP between services; same Supabase DB, service-role key has access"

metrics:
  duration: "2 minutes"
  completed: "2026-03-10"
---

# Phase 53 Plan 01: Backend Recording Flags & Tier Gating Summary

**One-liner:** Database migration and call-service updates adding per-call `recording_enabled`/`ai_analysis_enabled` flags with Partner-tier enforcement at creation time.

## What Was Built

Two tasks completed this plan:

1. **Database migration** (`20260310000002_add_call_recording_flags.sql`) — adds `recording_enabled BOOLEAN NOT NULL DEFAULT false` and `ai_analysis_enabled BOOLEAN NOT NULL DEFAULT false` to the `calls` table, and drops `requires_recording_consent` and `supports_ai_summary` from `call_types`.

2. **call-service type/backend updates** — `Call` interface gets both new flags, `CreateCallInput` accepts them as optional, `CallType` loses the two deprecated fields, `CallDetail` loses `recording_consent_required`. Repository persists both flags on insert, drops the `call_types` recording-consent lookup from `getCallDetail`, and gains `getCreatorTier()`. Service validates tier before allowing `ai_analysis_enabled=true`. Routes forward both fields from request body.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `recording_enabled` replaces `call_types.requires_recording_consent` | Per-call flag decouples consent from type categorization |
| 400 error (not silent strip) for non-Partner `ai_analysis_enabled` | Explicit feedback prevents user confusion |
| `getCreatorTier` in repository using same Supabase client | Architecture rule prohibits inter-service HTTP; single DB |

## API Contract Changes

**POST /api/v2/calls** — now accepts:
```json
{ "recording_enabled": true, "ai_analysis_enabled": false }
```
Returns 400 if `ai_analysis_enabled=true` and creator is not on Partner plan.

**GET /api/v2/calls/:id** — response now includes `recording_enabled` and `ai_analysis_enabled` on the call object. `recording_consent_required` field removed.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- Migration file: valid SQL with all 4 schema changes (2 adds, 2 drops)
- `pnpm --filter @splits-network/call-service build`: compiled successfully (zero errors)
- No references to removed fields remain in call-service source
- `getCreatorTier` returns `'starter' | 'pro' | 'partner'`
- `createCall` throws 400 when `ai_analysis_enabled=true` and tier is not `'partner'`

## Next Phase Readiness

- Plan 02 (call creation modal UI) can now read `recording_enabled` from API responses
- Plan 03 (ai-service pipeline) can now read both flags from the `calls` table
- Plan 04 (post-call detail tab gating) can read `recording_enabled` from the call detail endpoint
