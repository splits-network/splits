---
phase: 53-per-call-recording-ai-controls
plan: "04"
subsystem: portal-ui, notification-service
tags: [portal, call-detail, subscription-gating, recording-cleanup, cronjob, notification-service]

dependency-graph:
  requires:
    - "53-01: recording_enabled/transcription_enabled/ai_analysis_enabled columns on calls table"
  provides:
    - "LockedTabUpgrade component gating call detail tabs by subscription tier"
    - "RecordingTab empty state when recording_enabled is false"
    - "Daily recording expiry cleanup job (Free 7d, Pro 90d)"
    - "K8s CronJob for cleanup at 3 AM UTC"
  affects: []

tech-stack:
  added: []
  patterns:
    - "Tab gating via planTier from useUserProfile() context"
    - "Lock icon on restricted tabs for upsell visibility"
    - "Supabase storage blob deletion before DB row removal"
    - "Duplicate email prevention via notification_log payload contains query"

key-files:
  created:
    - apps/portal/src/app/portal/calls/[id]/components/locked-tab-upgrade.tsx
    - services/notification-service/src/jobs/expire-recording-cleanup.ts
    - infra/k8s/notification-service/cronjobs/expire-recording-cleanup.yaml
  modified:
    - apps/portal/src/app/portal/calls/[id]/call-detail-client.tsx
    - apps/portal/src/app/portal/calls/[id]/components/recording-tab.tsx
    - apps/portal/src/app/portal/calls/types.ts

decisions:
  - id: "53-04-a"
    decision: "Show all tabs with lock icon rather than hiding locked tabs"
    rationale: "Locked tabs visible in tab bar maximizes upsell exposure; users see what they're missing"
  - id: "53-04-b"
    decision: "Storage blob deletion attempted before DB row deletion; skip DB delete on blob failure"
    rationale: "Avoids orphaned DB records pointing to deleted blobs; safer to retry on next job run"
  - id: "53-04-c"
    decision: "Use any type for supabase parameter in deleteExpiredRecordings helper"
    rationale: "Complex nested join return type inference causes TS errors; runtime behavior is correct"

metrics:
  duration: "12 minutes"
  completed: "2026-03-11"
---

# Phase 53 Plan 04: Tab Gating & Recording Cleanup Summary

**One-liner:** Portal call detail tabs gated by subscription tier with upgrade prompts, plus daily cleanup job deleting expired Free (7d) and Pro (90d) tier recordings.

## What Was Built

Two tasks completed this plan:

1. **Call detail tab gating** — `LockedTabUpgrade` component renders centered upgrade prompt with icon, title, description, and `btn btn-primary` link to `/portal/profile?section=subscription`. `call-detail-client.tsx` reads `planTier` from `useUserProfile()` and `recording_enabled`/`transcription_enabled`/`ai_analysis_enabled` from the call object to conditionally render locked states. Transcript tab locked for `starter` tier; summary tab locked for `starter` and `pro` tiers. Both locked tabs show a `fa-lock` icon in the tab bar. `RecordingTab` gained a `recordingEnabled` prop that renders an empty state when explicitly `false`. `CallListItem` type in `types.ts` now includes all three boolean flags.

2. **Recording expiry cleanup job** — `expire-recording-cleanup.ts` follows the exact `send-weekly-digest.ts` pattern. Step 1 queries recordings created 5–5.5 days ago where the call creator is on `starter` tier, checks `notification_log` for duplicate warnings, sends Resend email, and logs to `notification_log`. Step 2 deletes Free tier recordings older than 7 days (blob then row). Step 3 deletes Pro tier recordings older than 90 days. K8s CronJob runs at `0 3 * * *` daily with `concurrencyPolicy: Forbid` and `backoffLimit: 3`.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Show locked tabs with lock icon (not hidden) | Upsell visibility — users see what's behind the lock |
| Blob deletion before DB row; skip DB on blob failure | Prevents orphaned DB records; job retries cleanly next day |
| `any` type for supabase in deleteExpiredRecordings | Nested join return type inference too strict; runtime correct |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added missing boolean fields to portal CallListItem type**

- **Found during:** Task 1 — `call.recording_enabled` was undefined because `CallListItem` lacked the fields
- **Fix:** Added `recording_enabled`, `transcription_enabled`, `ai_analysis_enabled` to `CallListItem` in `apps/portal/src/app/portal/calls/types.ts`
- **Files modified:** `apps/portal/src/app/portal/calls/types.ts`
- **Commit:** f3cd23d1

**2. [Rule 1 - Bug] Fixed TypeScript type errors in deleteExpiredRecordings helper**

- **Found during:** Task 2 build — `ReturnType<typeof createClient>` caused TS2345 errors on complex join query
- **Fix:** Changed parameter type to `any` with inline `as any[]` cast on loop variable
- **Files modified:** `services/notification-service/src/jobs/expire-recording-cleanup.ts`
- **Commit:** b866eea2

## Verification Results

- `pnpm --filter @splits-network/portal build`: compiled successfully (zero TypeScript errors)
- `pnpm --filter @splits-network/notification-service build`: compiled successfully (zero TypeScript errors)
- `LockedTabUpgrade` component exists with correct upgrade link structure
- Lock icons appear on transcript and summary tabs for restricted tiers
- K8s YAML has `schedule: "0 3 * * *"`, `concurrencyPolicy: Forbid`, `backoffLimit: 3`, `restartPolicy: OnFailure`

## Next Phase Readiness

Phase 53 is now complete. All four plans delivered:
- 53-01: Backend recording flags and tier gating in call-service
- 53-02: Call creation modal UI with recording/AI toggles
- 53-03: AI pipeline enforcement reading per-call flags
- 53-04: Post-call detail tab gating and recording retention cleanup
