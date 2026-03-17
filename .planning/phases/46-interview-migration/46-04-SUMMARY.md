---
phase: 46-interview-migration
plan: 04
subsystem: frontend
tags: [portal, calls-tab, entity-scoped, schedule-call, application-detail]
dependency-graph:
  requires: [46-03]
  provides: [application-calls-tab, schedule-call-shortcut]
  affects: []
tech-stack:
  added: []
  patterns: [entity-scoped-call-tab, call-creation-prefill]
key-files:
  created:
    - apps/portal/src/app/portal/applications/components/shared/application-calls-tab.tsx
  modified:
    - apps/portal/src/app/portal/applications/components/shared/application-detail-panel.tsx
    - apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx
decisions:
  - id: 46-04-01
    description: "CallCreationModal used inline (not URL params) for Schedule Call — modal accepts defaultEntityType/defaultEntityId/defaultParticipants props"
  - id: 46-04-02
    description: "Schedule Call added to speed dial actions in actions-toolbar, available to recruiters, company users, and admins"
metrics:
  duration: ~2min
  completed: 2026-03-09
---

# Phase 46 Plan 04: Application Calls Tab Integration Summary

Replace the application "Interviews" tab with a "Calls" tab using entity-scoped call pattern, and add "Schedule Call" shortcut to application detail.

## One-liner

Added entity-scoped Calls tab and Schedule Call speed dial action to application detail, completing the interview-to-call migration UI.

## What Was Done

### Task 1: Replace Interviews tab with Calls tab (ffbc96e1)

- Created `application-calls-tab.tsx` following the same entity-scoped pattern as `job-calls-tab.tsx` and `company-calls-tab.tsx`
- Passes `entity_type="application"` and `entity_id={application.id}` with `syncToUrl: false` and `limit: 10`
- Updated `application-detail-panel.tsx` tab definitions: key changed from "interviews" to "calls", label to "Calls", icon to `fa-phone`

### Task 2: Add Schedule Call shortcut (ffbc96e1)

- Added `CallCreationModal` to actions-toolbar with pre-filled context:
  - `defaultEntityType="application"` and `defaultEntityId={application.id}`
  - `defaultParticipants` pre-filled with candidate (name, email, role)
  - `defaultEntityLabel` showing "Candidate Name — Job Title"
  - `defaultMode="scheduled"`
- Added "Schedule Call" to speed dial actions (available to recruiters, company users, admins)

## Deviations from Plan

None — plan executed as written.

## Verification

- [x] Application detail panel shows "Calls" tab with entity-linked calls
- [x] "Schedule Call" button in speed dial opens call creation modal
- [x] Modal pre-filled with application entity and candidate participant
- [x] Portal builds successfully

## Next Phase Readiness

Phase 46 complete. All interview-specific code removed and replaced with call system equivalents. v10.0 milestone ready for completion.

---
*Phase: 46-interview-migration*
*Completed: 2026-03-09*
