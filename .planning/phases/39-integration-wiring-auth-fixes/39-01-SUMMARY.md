# Phase 39 Plan 01: Gateway Auth Bypasses & LiveKit Webhook Summary

**One-liner:** Auth bypass rules for 4 candidate/webhook routes plus LiveKit Egress webhook URL configuration

## What Was Done

### Task 1: Add gateway auth bypasses for 4 interview routes
- Added auth bypass rules in `services/api-gateway/src/index.ts` for:
  - `POST /api/v2/interviews/:id/reschedule-request` (magic link token in body)
  - `GET /api/v2/interviews/:id/available-slots` (magic link token as query param)
  - `POST /api/v2/interviews/:id/recording/consent` (dual-auth: magic link OR Clerk)
  - `POST /api/v2/interviews/recording/webhook` (LiveKit signature verification)
- Placed after existing `/join` bypass, before catch-all auth block
- Gateway builds without errors
- **Commit:** `ea2b2d16`

### Task 2: Configure LiveKit webhook URL in K8s config
- Added `webhook` section to `infra/k8s/livekit/livekit-config.yaml`
- URL: `http://video-service:3019/api/v2/interviews/recording/webhook`
- Uses `$(LIVEKIT_API_KEY)` for webhook payload signing
- **Commit:** `90fb14a8`

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Group comment block for 4 bypasses | Clear documentation of self-authenticating routes |

## Key Files

### Modified
- `services/api-gateway/src/index.ts` - 4 auth bypass rules added
- `infra/k8s/livekit/livekit-config.yaml` - webhook URL configuration

## Verification

- All 4 route patterns confirmed present in gateway auth hook
- Gateway TypeScript build passes cleanly
- YAML indentation verified correct (webhook at same level as other top-level config keys)
- Webhook URL matches `recording-webhook.ts` route exactly

## Metrics

- **Duration:** ~1 minute
- **Tasks:** 2/2
- **Completed:** 2026-03-08
