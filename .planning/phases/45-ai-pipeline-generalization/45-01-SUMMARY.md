---
phase: 45-ai-pipeline-generalization
plan: 01
subsystem: video-service
tags: [livekit, recording, egress, rabbitmq, call-recordings]

dependency-graph:
  requires: [42-01, 44-01]
  provides: [call-recording-pipeline, call.recording_ready-event]
  affects: [45-02, 45-03]

tech-stack:
  added: []
  patterns: [unified-webhook-fallback, separate-artifact-tables]

key-files:
  created:
    - services/video-service/src/v2/calls/call-repository.ts
    - services/video-service/src/v2/calls/call-recording-service.ts
    - services/video-service/src/v2/calls/call-recording-routes.ts
  modified:
    - services/video-service/src/v2/interviews/recording-webhook.ts
    - services/video-service/src/v2/routes.ts

decisions:
  - id: 45-01-01
    title: Unified webhook with fallback pattern
    choice: Single webhook endpoint tries interview egress lookup first, falls back to call recording
    reason: LiveKit configures webhook URL at server level, not per-egress; avoids needing LiveKit config changes

metrics:
  duration: ~4min
  completed: 2026-03-09
---

# Phase 45 Plan 01: Call Recording Infrastructure Summary

**One-liner:** Call recording pipeline via LiveKit Egress with unified webhook fallback and call.recording_ready event publishing

## What Was Built

### CallRecordingRepository (`call-repository.ts`)
- `findCallById` / `findRecordingByEgressId` / `findActiveRecordingByCallId` for lookups
- `createRecording` / `updateRecordingStatus` for lifecycle management
- `getCallParticipants` / `resolveUserId` for auth verification
- `findReadyRecording` for playback URL resolution (supports specific recording_id or latest)

### CallRecordingService (`call-recording-service.ts`)
- `startRecording(callId)` — verifies call is active, creates pending recording row, starts LiveKit room composite egress to S3 at `recordings/calls/{callId}/{recordingId}.mp4`
- `stopRecording(callId)` — finds active recording, stops egress, transitions to processing
- `handleEgressComplete` — updates recording to ready with blob_url, duration, file_size; returns callId+recordingId
- `handleEgressFailed` — marks recording as failed

### Call Recording Routes (`call-recording-routes.ts`)
- `POST /api/v2/calls/:id/recording/start` — host-only, starts recording
- `POST /api/v2/calls/:id/recording/stop` — host-only, stops recording
- `GET /api/v2/calls/:id/recording/playback-url` — any participant, returns signed URL

### Unified Webhook (modified `recording-webhook.ts`)
- On EGRESS_COMPLETE: tries interview handler first, catches 404, falls back to call handler
- On EGRESS_FAILED: same fallback pattern
- Call handler publishes `call.recording_ready` with `{ call_id, recording_url, duration_seconds, file_size_bytes }`
- Interview handler still publishes `interview.recording_ready` (backward compatible)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added findReadyRecording to repository**
- Plan specified accessing supabase directly from routes for playback URL lookup
- Added proper repository method to avoid leaking database client outside repository layer
- Supports both specific recording_id lookup and "latest ready" default

**2. [Rule 1 - Bug] Unified webhook instead of separate endpoints**
- Plan initially suggested separate webhook endpoints but revised to unified approach
- LiveKit sends all egress webhooks to a single configured URL
- Implemented try/catch fallback: interview lookup first, then call recording

## Next Phase Readiness

- `call.recording_ready` event is now published and ready for ai-service consumption in Phase 45-02
- Call recording rows stored in `call_recordings` table with status lifecycle: pending -> recording -> processing -> ready/failed
