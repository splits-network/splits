---
phase: 34-video-call-experience
plan: "03"
subsystem: video
tags: [livekit, react-hooks, video-room, pip, connection-quality, controls-bar]

# Dependency graph
requires:
  - phase: 34-video-call-experience
    provides: "shared-video package with types, hooks, and lobby components (34-01, 34-02)"
provides:
  - "In-call room layout with active speaker + self-view PiP"
  - "Always-visible controls bar with mic/camera/settings/leave"
  - "Connection quality signal bars indicator"
  - "Post-call summary screen with duration and auto-redirect"
affects: [34-04 (candidate flow), 34-05 (portal integration)]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Active speaker layout with PiP self-view", "isTrackReference guard for VideoTrack type safety"]

key-files:
  created:
    - "packages/shared-video/src/components/video-room.tsx"
    - "packages/shared-video/src/components/video-controls.tsx"
    - "packages/shared-video/src/components/participant-tile.tsx"
    - "packages/shared-video/src/components/self-view-pip.tsx"
    - "packages/shared-video/src/components/connection-quality.tsx"
    - "packages/shared-video/src/components/post-call-summary.tsx"
  modified:
    - "packages/shared-video/src/index.ts"

key-decisions:
  - "Used isTrackReference type guard for VideoTrack props instead of type casting"
  - "Controls bar always visible (fixed bottom) for professional interview context"
  - "DaisyUI dropdown for device settings instead of custom modal"

patterns-established:
  - "isTrackReference guard: useTracks returns TrackReferenceOrPlaceholder; narrow with isTrackReference before passing to VideoTrack"
  - "Controls bar: fixed bottom with backdrop-blur for always-visible controls"

# Metrics
duration: 2min
completed: 2026-03-08
---

# Phase 34 Plan 03: In-Call Room Components Summary

**Active speaker room layout with PiP self-view, always-visible controls bar (mic/camera/settings/leave), connection quality signal bars, and post-call summary with auto-redirect**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-08T00:57:43Z
- **Completed:** 2026-03-08T00:59:43Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Built 6 in-call room components for the video interview experience
- ConnectionQualityBars shows 3-level signal strength (excellent/good/poor) using LiveKit hooks
- VideoRoom renders large remote participant + small self-view PiP with RoomAudioRenderer and StartAudio
- VideoControls provides always-visible bar with TrackToggle for mic/camera, DaisyUI dropdown for device settings, and DisconnectButton
- PostCallSummary shows formatted duration with auto-redirect countdown for portal users

## Task Commits

Each task was committed atomically:

1. **Task 1: Participant tile, self-view PiP, and connection quality** - `e7dd2a02` (feat)
2. **Task 2: Video room, controls bar, and post-call summary** - `4e1dd66b` (feat)

## Files Created/Modified
- `packages/shared-video/src/components/connection-quality.tsx` - Signal bars indicator (3 bars, color-coded by quality)
- `packages/shared-video/src/components/participant-tile.tsx` - Full-screen remote participant with camera-off fallback
- `packages/shared-video/src/components/self-view-pip.tsx` - Corner PiP with responsive sizing (w-24 mobile, w-48 desktop)
- `packages/shared-video/src/components/video-room.tsx` - Main room layout with RoomAudioRenderer + StartAudio
- `packages/shared-video/src/components/video-controls.tsx` - Always-visible controls bar with TrackToggle and device settings
- `packages/shared-video/src/components/post-call-summary.tsx` - Post-call duration display with auto-redirect
- `packages/shared-video/src/index.ts` - Added exports for all 6 room components

## Decisions Made
- Used `isTrackReference` type guard from `@livekit/components-react` to narrow `TrackReferenceOrPlaceholder` to `TrackReference` before passing to `VideoTrack`. This is the correct TypeScript pattern rather than type casting.
- Controls bar is always visible (fixed bottom) rather than auto-hide. Professional interview context requires instant access to mute/unmute.
- Device settings use DaisyUI `dropdown dropdown-top` with `MediaDeviceSelect` components for camera, mic, and speaker selection.
- Post-call auto-redirect only for portal users (10s countdown). Candidates get a static "Thank you" with manual close button.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TrackReferenceOrPlaceholder type mismatch**
- **Found during:** Task 1 (participant-tile and self-view-pip)
- **Issue:** `useTracks` returns `TrackReferenceOrPlaceholder[]` but `VideoTrack` requires `TrackReference`. TypeScript compilation failed.
- **Fix:** Used `isTrackReference` type guard from `@livekit/components-react` to narrow the type before passing to VideoTrack
- **Files modified:** participant-tile.tsx, self-view-pip.tsx
- **Verification:** `tsc --noEmit` passes
- **Committed in:** e7dd2a02 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type guard necessary for correct TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the type fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 6 room components ready for consumption by portal and candidate interview pages
- Components render inside LiveKitRoom context (provided by parent orchestrator page)
- Post-call summary handles both candidate and portal user flows
- Next plans can build the full interview page orchestrating lobby -> in-call -> post-call transitions

---
*Phase: 34-video-call-experience*
*Completed: 2026-03-08*
