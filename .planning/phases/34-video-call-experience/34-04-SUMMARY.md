---
phase: 34-video-call-experience
plan: "04"
subsystem: video
tags: [livekit, react, state-machine, video-interview, portal, LiveKitRoom]

# Dependency graph
requires:
  - phase: 34-video-call-experience
    provides: "shared-video package with types, hooks, lobby, and room components (34-01, 34-02, 34-03)"
provides:
  - "Portal interview page with lobby -> connecting -> in-call -> post-call lifecycle"
  - "Join Interview button on application detail page opening new tab"
affects: [34-05 (candidate flow), 34-06 (polish), 38 (interviews tab)]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Call lifecycle state machine with conditional LiveKitRoom mount", "Self-fetch interview data in detail header"]

key-files:
  created:
    - "apps/portal/src/app/portal/interview/layout.tsx"
    - "apps/portal/src/app/portal/interview/[id]/page.tsx"
    - "apps/portal/src/app/portal/interview/[id]/interview-client.tsx"
    - "apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx"
  modified:
    - "apps/portal/src/app/portal/applications/components/shared/application-detail-header.tsx"

key-decisions:
  - "LiveKitRoom only mounts during connecting/in-call states, never during lobby"
  - "Interview opens in new tab via window.open() to preserve application context"
  - "Token fetched twice: once on mount for context, once on join for fresh JWT"
  - "Self-fetch interview in ApplicationDetailHeader following existing AI score pattern"

patterns-established:
  - "State machine pattern: CallState drives conditional rendering, LiveKitRoom never premounted"
  - "New-tab interview: window.open with named window prevents duplicate tabs"

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 34 Plan 04: Portal Interview Page & Join Button Summary

**Portal interview page with lobby-to-post-call state machine and Join Interview button on application detail that opens call in new tab**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T01:03:04Z
- **Completed:** 2026-03-08T01:07:04Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Built portal interview page with full call lifecycle state machine (lobby -> connecting -> in-call -> post-call)
- LiveKitRoom only mounts when user clicks Join, preventing premature WebRTC connections
- Created JoinInterviewButton component that opens interview in a new tab
- Integrated interview button into application detail header with self-fetch for scheduled interviews
- Error handling for failed tokens, expired interviews, and connection issues

## Task Commits

Each task was committed atomically:

1. **Task 1: Portal interview page with state machine** - `1ffbf6ad` (feat)
2. **Task 2: Join Interview button on application detail page** - `8e5d4579` (feat)

## Files Created/Modified
- `apps/portal/src/app/portal/interview/layout.tsx` - Full-screen layout with no sidebar/header, imports LiveKit CSS
- `apps/portal/src/app/portal/interview/[id]/page.tsx` - Server component extracting interview ID from params
- `apps/portal/src/app/portal/interview/[id]/interview-client.tsx` - Client component with CallState state machine orchestrating lobby -> in-call -> post-call
- `apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx` - Button opening interview in new tab via window.open()
- `apps/portal/src/app/portal/applications/components/shared/application-detail-header.tsx` - Added interview fetch and JoinInterviewButton rendering

## Decisions Made
- **LiveKitRoom conditional mount:** LiveKitRoom only renders during connecting/in-call states. This avoids the anti-pattern of mounting LiveKitRoom during lobby which would start WebRTC negotiation prematurely.
- **Token fetch strategy:** Token fetched on mount for interview context display, then fetched again fresh on join for the actual LiveKit JWT. This ensures the JWT is as fresh as possible when connecting.
- **New-tab pattern:** Interview opens via `window.open()` with a named window (`interview-{id}`) to prevent duplicate tabs for the same interview.
- **Self-fetch in header:** Follows the existing pattern (AI score self-fetch) to query for scheduled interviews without requiring changes to the application data flow.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- shared-video package needed to be built before portal build would succeed (dist/ not committed). Resolved by running `pnpm --filter @splits-network/shared-video build` first.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Portal interview flow is complete: user can click Join on application detail, lobby opens in new tab, join connects to LiveKit, post-call shows summary
- Ready for candidate flow (34-05) which uses same shared-video components with magic link auth
- Ready for polish pass (34-06) for responsive design, edge cases, and UX refinements

---
*Phase: 34-video-call-experience*
*Completed: 2026-03-08*
