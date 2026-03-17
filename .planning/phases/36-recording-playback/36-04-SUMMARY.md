---
phase: 36-recording-playback
plan: 04
subsystem: ui
tags: [react, livekit, recording, consent, video, daisyui]

requires:
  - phase: 36-01
    provides: recording_enabled field on interviews table and CreateInterviewInput type
  - phase: 34-02
    provides: VideoLobby component with device preview
  - phase: 34-03
    provides: VideoControls component with media toggles

provides:
  - RecordingConsent component for lobby consent gate
  - RecordingIndicator component for in-call recording status
  - useRecordingState hook for recording lifecycle management
  - Schedule modal recording toggle

affects: [36-05, 36-06]

tech-stack:
  added: []
  patterns:
    - "Recording consent gate pattern: checkbox consent before join"
    - "Recording indicator: pulsing dot + stop button in controls bar"
    - "Recording status polling: 5-second interval GET"

key-files:
  created:
    - packages/shared-video/src/components/recording-consent.tsx
    - packages/shared-video/src/components/recording-indicator.tsx
    - packages/shared-video/src/hooks/use-recording-state.ts
  modified:
    - packages/shared-video/src/components/video-lobby.tsx
    - packages/shared-video/src/components/video-controls.tsx
    - packages/shared-video/src/index.ts
    - packages/shared-video/src/types.ts
    - apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx

key-decisions:
  - "Warning-themed consent card (bg-warning/5) with checkbox gate"
  - "Recording opt-in per interview, not default-on"

patterns-established:
  - "Consent gate: disable join button until checkbox toggled"
  - "Recording indicator: positioned left-side of controls bar"

duration: 3min
completed: 2026-03-08
---

# Phase 36 Plan 04: Recording Consent UX Summary

**Recording consent gate in lobby, pulsing indicator in controls bar, and opt-in toggle on schedule modal**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T07:07:34Z
- **Completed:** 2026-03-08T07:10:34Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- RecordingConsent component with warning-themed card, consent checkbox, and clear disclosure text
- RecordingIndicator with red pulsing dot, "Recording" label, and stop button for interviewers
- useRecordingState hook with start/stop/consent API calls and 5-second status polling
- Lobby gates join button behind recording consent when recording is enabled
- Schedule modal includes "Record this interview" checkbox (splits_video only, default unchecked)

## Task Commits

Each task was committed atomically:

1. **Task 1: Recording consent and indicator components** - `e56cc3f3` (feat)
2. **Task 2: Integrate consent into lobby, indicator into controls, checkbox into schedule modal** - `971772f9` (feat)

## Files Created/Modified
- `packages/shared-video/src/components/recording-consent.tsx` - Consent gate with disclosure text and checkbox
- `packages/shared-video/src/components/recording-indicator.tsx` - Pulsing red dot indicator with stop button
- `packages/shared-video/src/hooks/use-recording-state.ts` - Recording lifecycle hook with API calls and polling
- `packages/shared-video/src/index.ts` - Added exports for new components and hook
- `packages/shared-video/src/types.ts` - Added recording_enabled to InterviewContext
- `packages/shared-video/src/components/video-lobby.tsx` - Consent gate before join button
- `packages/shared-video/src/components/video-controls.tsx` - Recording indicator in controls bar
- `apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx` - Recording toggle checkbox

## Decisions Made
- Warning-themed consent card (bg-warning/5 border-warning/20) -- draws attention without being alarming
- Recording is opt-in per interview (checkbox defaults to unchecked) -- "auto-record" means recording starts automatically IF enabled at scheduling, not default-on
- Consent checkbox uses checkbox-warning variant to match consent card theme

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added recording_enabled to InterviewContext type**
- **Found during:** Task 1
- **Issue:** InterviewContext in shared-video/types.ts lacked recording_enabled field needed for lobby consent gate
- **Fix:** Added `recording_enabled: boolean` to InterviewContext interface
- **Files modified:** packages/shared-video/src/types.ts
- **Verification:** Build passes, type is available in lobby component
- **Committed in:** e56cc3f3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential type addition for consent gate to function. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Recording consent UX complete, ready for playback viewer (Plan 05)
- Recording API endpoints (start/stop/consent) referenced by hook -- backend implementation in Plan 06
- InterviewContext.recording_enabled must be populated by token endpoint response

---
*Phase: 36-recording-playback*
*Completed: 2026-03-08*
