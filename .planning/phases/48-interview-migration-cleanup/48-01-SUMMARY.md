# Phase 48 Plan 01: Gateway & LiveKit Cleanup Summary

**One-liner:** Removed 6 dead interview auth-skip rules from api-gateway and fixed broken LiveKit webhook URL

## Plan Details

- **Phase:** 48-interview-migration-cleanup
- **Plan:** 01
- **Type:** execute
- **Started:** 2026-03-09T23:24:22Z
- **Completed:** 2026-03-09
- **Duration:** ~2min

## What Was Done

### Task 1: Remove dead interview auth-skip rules from gateway
Removed 6 dead auth-skip rule blocks from `services/api-gateway/src/index.ts` that referenced deleted interview routes (Phase 46 removed all interview handlers). Preserved the two live call auth-skip rules (`calls/exchange-token` and `calls/recording/webhook`).

**Removed rules:**
1. `POST /api/v2/interviews/join`
2. `POST /api/v2/interviews/:id/reschedule-request`
3. `GET /api/v2/interviews/:id/available-slots`
4. `POST /api/v2/interviews/:id/recording/consent`
5. `POST /api/v2/interviews/recording/webhook`
6. `PUT/GET /api/v2/interviews/:id/notes`

Also removed the associated comment block explaining interview magic-link routes.

**Commit:** 169b32e3

### Task 2: Fix LiveKit webhook URL to point to call recording handler
Changed LiveKit config webhook URL from `/api/v2/interviews/recording/webhook` to `/api/v2/calls/recording/webhook`. This fixes a broken webhook -- LiveKit egress completion events were hitting a 404 because the old interview route handler was deleted in Phase 46.

**Commit:** 91adef68

## Key Files

### Modified
- `services/api-gateway/src/index.ts` -- Removed 6 dead interview auth-skip rules (45 lines deleted)
- `infra/k8s/livekit/livekit-config.yaml` -- Fixed webhook URL to calls recording handler

## Verification

- `grep "interviews" services/api-gateway/src/index.ts` -- zero matches
- `grep "calls/exchange-token\|calls/recording/webhook" services/api-gateway/src/index.ts` -- two live rules confirmed
- `grep "interview" infra/k8s/livekit/livekit-config.yaml` -- zero matches
- `pnpm --filter @splits-network/api-gateway build` -- passes

## Deviations from Plan

**1. Skipped video-service description update**
- Plan referenced changing "Internal video interview service for Splits Network" to "Internal video call service for Splits Network" on line 76
- This string does not exist in the gateway index.ts file (likely already changed or never existed there)
- No action needed

## Decisions Made

None -- straightforward cleanup with no architectural decisions.

## Success Criteria Met

1. Zero interview-specific auth-skip rules in api-gateway/src/index.ts -- PASS
2. LiveKit webhook URL correctly points to /api/v2/calls/recording/webhook -- PASS
3. Gateway build passes -- PASS
