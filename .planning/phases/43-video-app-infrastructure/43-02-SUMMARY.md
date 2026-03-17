---
phase: 43-video-app-infrastructure
plan: 02
subsystem: ui
tags: [nextjs, react, livekit, video, magic-link, token-exchange, join-flow]

# Dependency graph
requires:
  - phase: 43-video-app-infrastructure
    provides: Video app scaffold, brand detection, exchange-token gateway route
  - phase: 42-call-data-model-service-layer
    provides: Call service token exchange endpoint, CallDetail type
provides:
  - Magic-link join flow (/join/[token] -> splash -> identity confirm -> call room)
  - Token exchange API client with typed error handling
  - Branded error pages for invalid/expired/not-started tokens
  - SessionStorage-based LiveKit token passing between pages
affects: [43-video-app-infrastructure, video-call-room, video-recording]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SessionStorage for passing LiveKit JWT between pages (avoids URL exposure)"
    - "Typed JoinError with HTTP status code mapping for structured error handling"
    - "State machine pattern in JoinFlow (loading -> confirming -> joining -> error)"

key-files:
  created:
    - apps/video/src/lib/types.ts
    - apps/video/src/lib/call-api.ts
    - apps/video/src/hooks/use-call-token.ts
    - apps/video/src/components/splash-screen.tsx
    - apps/video/src/components/error-page.tsx
    - apps/video/src/components/identity-confirm.tsx
    - apps/video/src/components/join-flow.tsx
    - apps/video/src/app/join/[token]/page.tsx
    - apps/video/src/app/error/page.tsx
  modified: []

key-decisions:
  - "SessionStorage keyed by callId to pass LiveKit token between join and call pages"
  - "First participant in array treated as current user for identity confirmation"
  - "Token length validation (32+ chars) at server component level before client rendering"

patterns-established:
  - "JoinFlow state machine: loading/confirming/joining/error with useCallToken hook"
  - "ErrorPage accepts typed JoinError with per-type headings and descriptions"

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 43 Plan 02: Magic-Link Join Flow Summary

**Token exchange client, identity confirmation UI, and branded error pages for the video call join flow**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T23:49:59Z
- **Completed:** 2026-03-08T23:54:00Z
- **Tasks:** 2
- **Files created:** 9

## Accomplishments
- Token exchange API client with HTTP status-to-error-type mapping (404->invalid, 410->expired, 400->not-started)
- Complete join flow: /join/[token] -> splash screen -> identity confirmation -> sessionStorage + navigate to /call/[id]
- Branded error pages with typed error categories and portal return links
- Identity confirmation showing participant name, call details, scheduled time, and participant list

## Task Commits

Each task was committed atomically:

1. **Task 1: Token exchange client, types, and hook** - `c3ffb30d` (feat)
2. **Task 2: Join flow pages and UI components** - `1c503dbe` (feat)

## Files Created/Modified
- `apps/video/src/lib/types.ts` - Video app types (ExchangeResult, JoinState, JoinError, CallDetail)
- `apps/video/src/lib/call-api.ts` - exchangeToken() API client with error code mapping
- `apps/video/src/hooks/use-call-token.ts` - useCallToken() hook managing exchange lifecycle
- `apps/video/src/components/splash-screen.tsx` - Branded loading screen with pulse animation
- `apps/video/src/components/error-page.tsx` - Typed error display with per-category headings
- `apps/video/src/components/identity-confirm.tsx` - Pre-call identity screen with participant list
- `apps/video/src/components/join-flow.tsx` - State machine orchestrator for the join flow
- `apps/video/src/app/join/[token]/page.tsx` - Server component entry point with token validation
- `apps/video/src/app/error/page.tsx` - Error route with reason query param

## Decisions Made
- **SessionStorage for LiveKit token:** Store `{ livekitToken, call }` in sessionStorage keyed by callId rather than passing JWT in URL search params. Avoids exposing sensitive token in browser history and server logs.
- **First participant as current user:** The token exchange returns participants array; the first entry is treated as the current user for the "Joining as" display. This works because the token is user-specific.
- **Server-side token validation:** The /join/[token] server component validates token length (32+ chars) before rendering the client-side JoinFlow, redirecting invalid tokens immediately.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Join flow complete and ready for the call room page (/call/[id]) in subsequent plans
- SessionStorage pattern established for passing LiveKit credentials to the call room
- Error handling covers all token exchange failure modes

---
*Phase: 43-video-app-infrastructure*
*Completed: 2026-03-08*
