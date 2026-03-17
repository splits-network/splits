---
phase: 51-recording-consent-calendar-auto-creation
plan: 02
subsystem: portal-calls
tags: [calendar, google-calendar, calls, fire-and-forget]
depends_on:
  requires: [44-05]
  provides: [calendar-auto-creation-wiring]
  affects: []
tech-stack:
  added: []
  patterns: [fire-and-forget-api-call]
key-files:
  created: []
  modified:
    - apps/portal/src/hooks/use-create-call.ts
    - apps/portal/src/components/calls/call-creation-modal.tsx
decisions: []
metrics:
  duration: 2min
  completed: 2026-03-10
---

# Phase 51 Plan 02: Calendar Auto-Creation Wiring Summary

**One-liner:** Fire-and-forget Google Calendar event creation after scheduled call creation via existing calendar API

## What Was Done

### Task 1: Add createCalendarEvents to useCreateCall hook
Added a `createCalendarEvents` function to the `useCreateCall` hook that POSTs to `/integrations/calendar/calls` with call metadata and participant data. Email-only participants are filtered out since they have no calendar connections. All errors are caught and logged via `console.warn` -- calendar failure never propagates.

### Task 2: Wire calendar creation in call-creation-modal
After a scheduled call is successfully created, the modal fires a background (non-awaited) call to `createCalendarEvents`. The call is guarded by `mode === 'scheduled' && schedule` so instant calls never trigger calendar creation. The `.catch()` ensures any unhandled rejection is silently swallowed.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

1. `pnpm --filter @splits-network/portal build` -- passed, no errors
2. `createCalendarEvents` called after scheduled call creation -- confirmed
3. Calendar call is NOT awaited (fire-and-forget) -- confirmed
4. Calendar NOT triggered for instant calls -- confirmed
5. POST to `/integrations/calendar/calls` -- confirmed
6. Calendar errors caught and logged, never thrown -- confirmed
