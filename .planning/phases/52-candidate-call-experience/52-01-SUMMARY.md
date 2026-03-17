---
phase: 52-candidate-call-experience
plan: 01
subsystem: candidate-frontend
tags: [calls, dashboard, video, candidate-portal]
dependency-graph:
  requires: [42-call-data-model-service-layer, 43-video-app-infrastructure]
  provides: [candidate-call-widget, candidate-join-flow]
  affects: [52-02, 52-03]
tech-stack:
  added: []
  patterns: [useUpcomingCalls-hook, useCallToken-hook, dashboard-widget-pattern]
key-files:
  created:
    - apps/candidate/src/app/portal/dashboard/hooks/use-upcoming-calls.ts
    - apps/candidate/src/app/portal/dashboard/components/upcoming-calls-widget.tsx
    - apps/candidate/src/hooks/use-call-token.ts
    - apps/candidate/src/app/portal/calls/[id]/join/page.tsx
  modified:
    - apps/candidate/src/app/portal/dashboard/components/candidate-dashboard.tsx
decisions: []
metrics:
  duration: 4min
  completed: 2026-03-09
---

# Phase 52 Plan 01: Candidate Call Widget & Join Flow Summary

**Upcoming calls dashboard widget with join-call redirect to video.applicant.network**

## What Was Done

### Task 1: Upcoming Calls Hook and Dashboard Widget
- Created `useUpcomingCalls` hook fetching `GET /calls?status=scheduled` with ascending sort by scheduled_at, limit 5
- Created `UpcomingCallsWidget` with call cards showing title (or participant names fallback), formatted date/time, participant count, and Join Call button
- Widget conditionally renders only when calls exist or loading, placed between match preview and pipeline sections
- Follows existing dashboard patterns: kicker header, bg-base-100 section, border-l-4 accent cards
- **Commit:** `10375a15`

### Task 2: Join Call Page with Token Generation
- Created `useCallToken` hook with `generateToken(callId)` calling `POST /calls/{callId}/token`
- Created join page at `/portal/calls/[id]/join` that generates token and redirects to `video.applicant.network/join/{token}`
- Default video URL is `video.applicant.network` (not splits.network) matching the candidate/applicant branding
- Error state links back to `/portal/dashboard` since candidate app has no calls list page
- Uses cancelled flag pattern to prevent state updates after unmount
- **Commit:** `f79d4cb8`

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/candidate build` passes
- Dashboard imports and renders UpcomingCallsWidget
- Join page route `/portal/calls/[id]/join` appears in build output
- Default video URL is `video.applicant.network` (no hardcoded splits.network in candidate call files)
- All files under 200 lines

## Next Phase Readiness

Plan 52-02 can proceed. The widget and join flow are in place. Plan 02 likely covers additional call features (call detail view, notifications) building on this foundation.
