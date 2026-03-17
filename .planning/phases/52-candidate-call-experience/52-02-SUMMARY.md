---
phase: 52-candidate-call-experience
plan: "02"
subsystem: candidate-portal
tags: [calls, notifications, candidate-experience]
dependency_graph:
  requires: [42-call-data-model-service-layer]
  provides: [candidate-application-calls-view, call-notification-icon]
  affects: []
tech_stack:
  added: []
  patterns: [entity-linked-call-fetch, read-only-call-section]
key_files:
  created:
    - apps/candidate/src/app/portal/applications/components/shared/application-calls-section.tsx
  modified:
    - apps/candidate/src/app/portal/applications/components/shared/application-detail.tsx
    - apps/candidate/src/lib/notifications.ts
decisions: []
metrics:
  duration: 5min
  completed: "2026-03-09"
---

# Phase 52 Plan 02: Application Calls Section and Notification Icons Summary

**One-liner:** Read-only calls section on candidate application detail with status badges, join links, and phone icon for call notifications.

## What Was Done

### Task 1: Application Calls Section (b20e9287)
- Created `ApplicationCallsSection` component (175 lines) as a simplified, read-only version of the portal's `ApplicationCallsTab`
- Fetches calls via `GET /calls` with `entity_type=application` and `entity_id` filter
- Each call displays: title (with participant name fallback), formatted date/time, status badge (info/warning/success/error), and Join button for future scheduled calls
- Loading state with spinner, empty state with phone-slash icon
- Integrated into `application-detail.tsx` between Notes and Timeline sections (2 lines added: import + render)

### Task 2: Call Notification Icon (0c97c304)
- Added `case 'calls': return 'fa-phone'` to `getNotificationIcon()` in notifications.ts
- Call-related in-app notifications now show phone icon instead of default bell

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/candidate build` passes
- `application-calls-section.tsx` is 175 lines (under 200 limit)
- `application-detail.tsx` imports and renders `ApplicationCallsSection`
- `notifications.ts` has `case 'calls'` returning `fa-phone`
