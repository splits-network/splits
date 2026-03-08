---
phase: 34-video-call-experience
plan: "02"
subsystem: ui
tags: [livekit, react, video-lobby, web-audio-api, device-enumeration, preview-tracks]

# Dependency graph
requires:
  - phase: 34-video-call-experience
    provides: "shared-video package with hooks, types, and LiveKit config"
provides:
  - "Pre-join lobby component set with split layout, device selection, audio meter"
  - "Camera-off fallback and participant waiting indicator components"
affects: [34-03 (in-call UI), 34-04 (candidate flow)]

# Tech tracking
tech-stack:
  added: []
  patterns: ["usePreviewTracks for lobby preview without LiveKitRoom", "Web Audio API for mic level visualization"]

key-files:
  created:
    - "packages/shared-video/src/components/video-lobby.tsx"
    - "packages/shared-video/src/components/audio-level-meter.tsx"
    - "packages/shared-video/src/components/device-selector.tsx"
    - "packages/shared-video/src/components/camera-off-fallback.tsx"
    - "packages/shared-video/src/components/waiting-indicator.tsx"
  modified:
    - "packages/shared-video/src/index.ts"

key-decisions:
  - "Manual device enumeration via navigator.mediaDevices instead of LiveKit MediaDeviceSelect (requires room context)"
  - "Web Audio API with AnalyserNode for audio level meter in lobby (BarVisualizer requires room context)"
  - "VideoLobby accepts localUser prop for camera-off fallback display"

patterns-established:
  - "Lobby components use usePreviewTracks independently of LiveKitRoom"
  - "Device selector listens for devicechange events for hot-plug support"

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 34 Plan 02: Pre-Join Lobby Components Summary

**Split-layout video lobby with camera preview via usePreviewTracks, Web Audio API mic level meter, device enumeration, and participant waiting indicator**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T00:56:54Z
- **Completed:** 2026-03-08T01:02:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Built audio level meter with Web Audio API frequency band visualization (5 bands, 75ms transitions)
- Built device selector with navigator.mediaDevices enumeration and hot-plug detection
- Built camera-off fallback with DaisyUI avatar or initial letter circle
- Built participant waiting indicator with pulse animation
- Built split-layout VideoLobby composing all components with usePreviewTracks for local media preview

## Task Commits

Each task was committed atomically:

1. **Task 1: Audio level meter, device selector, camera-off fallback, waiting indicator** - `53720e61` (feat)
2. **Task 2: Video lobby component with split layout** - `d478d7bb` (feat)

## Files Created/Modified
- `packages/shared-video/src/components/audio-level-meter.tsx` - Real-time mic level visualization with Web Audio API
- `packages/shared-video/src/components/device-selector.tsx` - Camera/mic/speaker device enumeration and selection
- `packages/shared-video/src/components/camera-off-fallback.tsx` - Avatar display when camera is off
- `packages/shared-video/src/components/waiting-indicator.tsx` - Participant presence status with pulse animation
- `packages/shared-video/src/components/video-lobby.tsx` - Split-layout pre-join lobby composing all components
- `packages/shared-video/src/index.ts` - Added exports for all 5 new components

## Decisions Made
- Used manual `navigator.mediaDevices.enumerateDevices()` instead of LiveKit's `MediaDeviceSelect` component, which requires LiveKitRoom context that doesn't exist in the lobby.
- Used Web Audio API (AudioContext + AnalyserNode) for the audio level meter instead of LiveKit's `BarVisualizer`, which also requires room context.
- Added `localUser` prop to VideoLobby for camera-off fallback display (name and avatar needed for the local participant).

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 lobby components exported from shared-video and ready for consumption by portal and candidate apps
- VideoLobby accepts InterviewContext from the enriched token endpoint (34-01)
- Next plan (34-03) can build VideoRoom for the in-call experience
- Lobby works independently of LiveKitRoom -- the state machine pattern transitions from lobby to LiveKitRoom on join

---
*Phase: 34-video-call-experience*
*Completed: 2026-03-08*
