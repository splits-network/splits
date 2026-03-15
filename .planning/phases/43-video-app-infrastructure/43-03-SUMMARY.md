---
phase: 43-video-app-infrastructure
plan: 03
subsystem: ui
tags: [livekit, react, video, shared-video, adapter-pattern]

requires:
  - phase: 43-01
    provides: Video app scaffold with brand detection, BrandProvider, BrandedHeader
  - phase: 43-02
    provides: CallDetail/ExchangeResult types, join flow, token exchange

provides:
  - Active call page at /call/[callId] with full 5-state video experience
  - CallDetail to InterviewContext type adapter for shared-video components
  - Reconnecting overlay, call-ended screen, and collapsible side panel

affects: [45-recording, 44-call-features]

tech-stack:
  added: []
  patterns:
    - "Adapter pattern: CallDetail -> InterviewContext bridging call-service to shared-video"
    - "5-state call flow: prep(auto-skip) -> lobby -> connecting -> in-call -> post-call"
    - "sessionStorage handoff: join flow stores data, call page reads and cleans up"

key-files:
  created:
    - apps/video/src/lib/call-adapter.ts
    - apps/video/src/components/call-experience.tsx
    - apps/video/src/components/reconnecting-overlay.tsx
    - apps/video/src/components/call-ended.tsx
    - apps/video/src/components/call-side-panel.tsx
    - apps/video/src/app/call/[callId]/page.tsx
  modified: []

key-decisions:
  - "LiveKitRoom wraps entire CallExperience; connect gated on state (connecting|in-call)"
  - "Prep state auto-skips to lobby since identity confirmation happens in join flow"
  - "Inner CallStateRouter component enables LiveKit hooks inside LiveKitRoom provider"
  - "getLiveKitUrl() with fallback to hardcoded WSS URL for resilience"

patterns-established:
  - "Adapter pattern for bridging domain types to shared component types"
  - "CallStateRouter inner component pattern for hooks requiring LiveKit context"

duration: 3min
completed: 2026-03-08
---

# Phase 43 Plan 03: Active Call Experience Summary

**Full-screen video call page with 5-state flow using shared-video VideoRoom/VideoLobby, type adapter bridging CallDetail to InterviewContext, reconnection overlay, side panel, and branded post-call screen**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T23:51:08Z
- **Completed:** 2026-03-08T23:53:55Z
- **Tasks:** 2
- **Files created:** 6

## Accomplishments
- Type adapter maps call-service CallDetail to shared-video InterviewContext
- Active call page at /call/[callId] with full prep->lobby->connecting->in-call->post-call flow
- Reconnecting overlay using LiveKit useConnectionState hook
- Call-ended screen with formatted duration, participant list, and portal return link
- Collapsible side panel showing entity context (call details, related entities, participants)

## Task Commits

1. **Task 1: Type adapter and support components** - `0d737bd1` (feat)
2. **Task 2: Call experience page with LiveKit integration** - `dab141e5` (feat)

## Files Created/Modified
- `apps/video/src/lib/call-adapter.ts` - Maps CallDetail to InterviewContext for shared-video
- `apps/video/src/components/call-experience.tsx` - Main call orchestrator with 5-state flow
- `apps/video/src/components/reconnecting-overlay.tsx` - LiveKit reconnection overlay
- `apps/video/src/components/call-ended.tsx` - Post-call summary screen
- `apps/video/src/components/call-side-panel.tsx` - Collapsible entity context panel
- `apps/video/src/app/call/[callId]/page.tsx` - Call route reading sessionStorage data

## Decisions Made
- LiveKitRoom wraps entire experience at CallExperience level; connect prop gated on state
- Inner CallStateRouter component needed so LiveKit hooks (useConnectionState) work inside provider
- Prep state auto-skips since video app handles identity in join flow (not in-app prep)
- getLiveKitUrl() from shared-video with fallback for when env var is missing

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Call page complete with all 5 states handled
- Ready for Phase 44 call features (notes, recording indicators)
- Ready for Phase 45 recording integration

---
*Phase: 43-video-app-infrastructure*
*Completed: 2026-03-08*
