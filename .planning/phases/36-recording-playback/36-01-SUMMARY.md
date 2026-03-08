---
phase: 36-recording-playback
plan: 01
subsystem: api
tags: [livekit, egress, recording, azure-blob, video, postgres]

requires:
  - phase: 33-video-infrastructure
    provides: LiveKit deployment, video-service, interviews table
provides:
  - Recording columns on interviews table
  - RecordingService wrapping LiveKit Egress API
  - Repository methods for recording state management
affects: [36-02, 36-03, 36-04, 36-05]

tech-stack:
  added: []
  patterns:
    - "EgressClient for Room Composite Egress with EncodingOptionsPreset"
    - "Azure Blob Storage upload via EncodedFileOutput"
    - "Per-participant recording consent tracking table"

key-files:
  created:
    - supabase/migrations/20260309000001_add_recording_columns.sql
    - services/video-service/src/v2/interviews/recording-service.ts
  modified:
    - services/video-service/src/v2/interviews/types.ts
    - services/video-service/src/v2/interviews/repository.ts

key-decisions:
  - "H264_720P_30 preset for egress encoding (1280x720, 30fps, H264/OPUS)"
  - "Protobuf constructors for EncodedFileOutput and AzureBlobUpload"

patterns-established:
  - "RecordingService: focused Egress lifecycle class, no route handling"
  - "Recording filepath convention: recordings/{interview_id}/{interview_id}.mp4"

duration: 2min
completed: 2026-03-08
---

# Phase 36 Plan 01: Recording Schema & Service Summary

**Recording columns on interviews table with RecordingService wrapping LiveKit Room Composite Egress to Azure Blob Storage**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T07:02:24Z
- **Completed:** 2026-03-08T07:04:39Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Migration adding recording_enabled, recording_status (with CHECK), egress tracking, blob URL, duration, file size, and timestamp columns
- Per-participant recording consent table with unique constraint
- RecordingService with start/stop/handleComplete/handleFailed lifecycle methods using LiveKit EgressClient
- Repository methods for recording state updates, egress lookup, and consent management

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration for recording columns** - `f82e0219` (feat)
2. **Task 2: Update types and repository, create RecordingService** - `e52b38d9` (feat)

## Files Created/Modified
- `supabase/migrations/20260309000001_add_recording_columns.sql` - Recording columns and consent table
- `services/video-service/src/v2/interviews/recording-service.ts` - LiveKit Egress lifecycle service
- `services/video-service/src/v2/interviews/types.ts` - RecordingStatus type, recording fields on Interview
- `services/video-service/src/v2/interviews/repository.ts` - Recording state and consent repository methods

## Decisions Made
- Used `EncodingOptionsPreset.H264_720P_30` preset instead of manual encoding options (matches plan's 1280x720, 30fps, H264/OPUS exactly)
- Used protobuf constructor pattern (`new EncodedFileOutput(...)`) matching livekit-server-sdk v2.9.1 API

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Recording schema and service ready for route integration (36-02)
- RecordingService constructor requires Azure config and LiveKit credentials at instantiation time
- Egress webhook handler methods ready for webhook route wiring

---
*Phase: 36-recording-playback*
*Completed: 2026-03-08*
