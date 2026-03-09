# Phase 45 Plan 03: Call Recording Gateway Routing Summary

**One-liner:** Gateway proxies call recording ops to video-service; call-service provides signed playback URLs for portal

## What Was Done

### Task 1: Gateway routing for call recording operations
- Added recording webhook proxy route (`POST /api/v2/calls/recording/webhook`) to video-service with no auth (LiveKit signature verified by video-service)
- Added `/api/v2/calls/:id/recording/*` catch-all route proxied to video-service for start/stop/playback operations
- Added `/api/v2/calls/:id/recording` GET route for recording status
- Added auth skip in gateway middleware for call recording webhook
- All non-recording call routes continue to proxy to call-service
- **Commit:** 994370b5

### Task 2: Call-service recording playback URL endpoint
- Added `GET /api/v2/calls/:id/recordings/:recordingId/playback-url` route in call-service
- Participant verification before generating signed URLs
- Recording validation (belongs to call, status is ready, blob_url exists)
- Added `getRecording()` and `generateRecordingSignedUrl()` methods to ArtifactRepository
- Signed URLs use 1-hour expiry from Supabase storage bucket `interview-recordings`
- **Commit:** 6a0df9e1

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Separate playback URL paths for video-service vs call-service | Video-service uses `/recording/playback-url?recording_id=X` for in-call use; call-service uses `/recordings/:recordingId/playback-url` for portal detail page |
| Recording webhook reuses existing unified webhook path | LiveKit Egress webhook at `/api/v2/interviews/recording/webhook` already handles both interview and call recordings via try/catch fallback |

## Verification

- [x] `services/api-gateway` TypeScript compiles clean
- [x] `services/call-service` TypeScript compiles clean
- [x] Recording routes proxy to video-service via gateway
- [x] Recording webhook accessible without auth headers
- [x] Call detail API returns recording/transcript/summary through include parameter (existing)
- [x] Signed playback URLs can be generated for recordings

## Key Files

### Created
- None

### Modified
- `services/api-gateway/src/routes/v2/calls.ts` - Recording routes to video-service
- `services/api-gateway/src/index.ts` - Auth skip for call recording webhook
- `services/call-service/src/v2/routes.ts` - Playback URL endpoint
- `services/call-service/src/v2/artifact-repository.ts` - Recording query + signed URL generation
