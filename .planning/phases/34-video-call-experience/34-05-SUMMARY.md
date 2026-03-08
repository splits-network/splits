---
phase: 34-video-call-experience
plan: "05"
subsystem: ui
tags: [livekit, react, candidate-flow, magic-link, state-machine, countdown-timer]

# Dependency graph
requires:
  - phase: 34-video-call-experience
    provides: "shared-video package with hooks, lobby, room components, and types (34-01, 34-02, 34-03)"
provides:
  - "Candidate interview flow: prep page -> lobby -> call -> post-call"
  - "Magic link token exchange for no-account interview join"
  - "Prep page with interview details, countdown timer, and tips"
affects: [34-06 (portal integration uses same shared-video components)]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Candidate state machine starts at prep (not lobby)", "Magic link token != LiveKit JWT separation"]

key-files:
  created:
    - "apps/candidate/src/app/(public)/interview/[token]/prep-page.tsx"
    - "apps/candidate/src/app/(public)/interview/[token]/page.tsx"
    - "apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx"
    - "apps/candidate/src/app/(public)/interview/layout.tsx"
  modified: []

key-decisions:
  - "Prep page uses Splits Network branding (not company-branded) per CONTEXT.md"
  - "Lobby opens 10 minutes before scheduled time via countdown gate"
  - "Post-call for candidates: no auto-redirect, stay on thank-you screen"
  - "Magic token exchange on mount stores both LiveKit JWT and interview context"

patterns-established:
  - "Candidate flow: prep -> lobby -> connecting -> in-call -> post-call (5 states)"
  - "Public route under (public)/interview/[token] requires no authentication"

# Metrics
duration: 5min
completed: 2026-03-08
---

# Phase 34 Plan 05: Candidate Interview Flow Summary

**Candidate interview experience via magic link: prep page with job details/countdown/tips, then lobby, then in-call, then thank-you screen -- no account required**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T01:03:44Z
- **Completed:** 2026-03-08T01:09:00Z
- **Tasks:** 2
- **Files created:** 4

## Accomplishments
- Candidate prep page with job title, company, interviewer info, tips checklist, and live countdown timer
- Full state machine flow from magic link URL to post-call thank-you screen
- Magic link token exchange validates candidate and returns LiveKit JWT + interview context in one call
- Lobby gated to 10 minutes before scheduled time with disabled button + tooltip

## Task Commits

Each task was committed atomically:

1. **Task 1: Candidate prep page** - `bf5baf16` (feat)
2. **Task 2: Candidate interview page with magic link flow** - `adc2151a` (feat)

## Files Created/Modified
- `apps/candidate/src/app/(public)/interview/[token]/prep-page.tsx` - Prep page with job details, interviewer info, tips, countdown
- `apps/candidate/src/app/(public)/interview/[token]/page.tsx` - Server component extracting magic token from URL
- `apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx` - State machine: prep -> lobby -> call -> post-call
- `apps/candidate/src/app/(public)/interview/layout.tsx` - Minimal full-screen layout with LiveKit CSS import

## Decisions Made
- Prep page uses Splits Network branding (wordmark text), not company branding -- per CONTEXT.md deferred items
- Lobby opens 10 minutes before scheduled time; button disabled with DaisyUI tooltip before that
- Post-call screen for candidates does not auto-redirect (they can close the tab themselves)
- Candidate participant identified by role === 'candidate' from interviewContext.participants

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Candidate flow complete; portal integration (34-06) can follow the same pattern using shared-video components
- Both apps share the same VideoLobby, VideoRoom, and PostCallSummary from shared-video package

---
*Phase: 34-video-call-experience*
*Completed: 2026-03-08*
