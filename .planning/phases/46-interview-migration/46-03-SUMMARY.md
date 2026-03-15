---
phase: 46-interview-migration
plan: 03
subsystem: frontend
tags: [cleanup, deletion, rename, portal, candidate, shared-video, shared-types]
dependency-graph:
  requires: [46-01, 46-02]
  provides: [clean-frontend-no-interview-pages, call-terminology-in-shared-video]
  affects: [46-04]
tech-stack:
  added: []
  patterns: [call-context-pattern]
key-files:
  created:
    - packages/shared-video/src/hooks/use-call-token.ts
    - packages/shared-video/src/hooks/use-call-notes.ts
  modified:
    - packages/shared-video/src/index.ts
    - packages/shared-video/src/types.ts
    - packages/shared-video/src/components/video-room.tsx
    - packages/shared-video/src/components/video-lobby.tsx
    - packages/shared-video/src/components/participant-sidebar.tsx
    - packages/shared-video/src/components/notes-panel.tsx
    - packages/shared-types/src/models.ts
    - packages/shared-types/src/index.ts
    - apps/video/src/components/call-experience.tsx
    - apps/video/src/lib/call-adapter.ts
    - apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx
    - apps/portal/src/app/portal/applications/components/shared/application-detail-header.tsx
    - apps/portal/src/app/portal/applications/components/shared/application-detail-panel.tsx
    - apps/portal/src/app/portal/candidates/components/shared/actions-toolbar.tsx
    - apps/portal/src/components/basel/calendar/calendar-event-detail.tsx
    - apps/portal/src/app/portal/notifications/components/browse/detail-panel.tsx
    - apps/portal/src/app/portal/notifications/components/browse/list-item.tsx
  deleted:
    - apps/portal/src/app/portal/interview/ (entire directory)
    - apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-recording-card.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-recording-player.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-transcript-panel.tsx
    - apps/portal/src/app/portal/applications/hooks/use-scheduled-interview.ts
    - apps/portal/src/app/portal/applications/components/shared/application-interviews-tab.tsx
    - apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx
    - apps/portal/src/components/basel/scheduling/reschedule-interview-modal.tsx
    - apps/portal/src/components/basel/scheduling/cancel-interview-dialog.tsx
    - apps/portal/src/components/basel/scheduling/available-slots-list.tsx
    - apps/portal/src/components/basel/notifications/interview-countdown.tsx
    - apps/candidate/src/app/(public)/interview/ (entire directory)
    - packages/shared-video/src/hooks/use-interview-token.ts
    - packages/shared-video/src/hooks/use-interview-notes.ts
decisions:
  - id: 46-03-01
    description: "Kept application-search.tsx and platform-selector.tsx in scheduling dir (used by calendar create-event-modal)"
  - id: 46-03-02
    description: "Deleted available-slots-list.tsx (only used by deleted interview scheduling modals)"
  - id: 46-03-03
    description: "Left API endpoint paths in use-call-notes.ts unchanged (/api/v2/interviews/) since backend migration is separate"
  - id: 46-03-04
    description: "Kept interview_type field name in CallContext since it matches existing API response shape"
metrics:
  duration: 50min
  completed: 2026-03-09
---

# Phase 46 Plan 03: Frontend Interview Cleanup Summary

Delete all interview frontend pages, components, and hooks from portal and candidate apps; rename shared-video exports to call terminology; remove interview types from shared-types.

## One-liner

Deleted 26 interview frontend files across portal/candidate, renamed InterviewContext to CallContext and hooks to useCallToken/useCallNotes.

## What Was Done

### Task 1: Delete interview pages and components (3fbaaf03)

Removed all interview-specific frontend code from portal and candidate apps:

**Portal deletions (20 files):**
- Interview video page (`/portal/interview/[id]/`)
- Application interview components (join button, recording card, recording player, transcript panel)
- `useScheduledInterview` hook and `ApplicationInterviewsTab`
- Scheduling modals (schedule, reschedule, cancel) and `available-slots-list`
- Interview countdown notification component

**Candidate deletions (5 files):**
- Interview join pages (`/interview/[token]/`) including prep page, client, and reschedule form

**Import cleanup in 7 files:**
- `actions-toolbar.tsx` (applications) -- removed all interview scheduling state, actions, modals, speed dial entries, schedule toast
- `actions-toolbar.tsx` (candidates) -- removed schedule interview modal and action
- `application-detail-header.tsx` -- removed JoinInterviewButton and scheduled interview fetch
- `application-detail-panel.tsx` -- removed Interviews tab
- `calendar-event-detail.tsx` -- removed InterviewDetailSection and modal imports
- Notification `list-item.tsx` and `detail-panel.tsx` -- removed InterviewCountdown usage

### Task 2: Rename shared-video hooks and clean shared-types (4f18d205)

**shared-video renames:**
- `use-interview-token.ts` -> `use-call-token.ts` (export: `useCallToken`)
- `use-interview-notes.ts` -> `use-call-notes.ts` (export: `useCallNotes`)
- `InterviewContext` type -> `CallContext` throughout
- `interviewContext` prop -> `callContext` in video-room, video-lobby, participant-sidebar

**Video app updates:**
- `adaptCallToInterviewContext` -> `adaptCallToCallContext`
- All imports updated in call-experience.tsx and call-adapter.ts

**shared-types cleanup:**
- Removed `InterviewTranscript` and `TranscriptSegment` interfaces
- Removed corresponding exports from index.ts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed notification component imports**

- **Found during:** Task 1
- **Issue:** `list-item.tsx` and `detail-panel.tsx` in notifications imported the deleted `InterviewCountdown` component
- **Fix:** Removed imports and countdown rendering; kept interview notification detection logic (badge labels)
- **Files modified:** `apps/portal/src/app/portal/notifications/components/browse/list-item.tsx`, `detail-panel.tsx`
- **Commit:** 3fbaaf03

**2. [Rule 3 - Blocking] Fixed calendar-event-detail interview section**

- **Found during:** Task 1
- **Issue:** `calendar-event-detail.tsx` imported deleted reschedule/cancel modals and `ScheduledInterview` type from deleted hook file
- **Fix:** Removed entire `InterviewDetailSection` component and unused imports (useState, useEffect, useCallback, useRef, useAuth, createAuthenticatedClient)
- **Files modified:** `apps/portal/src/components/basel/calendar/calendar-event-detail.tsx`
- **Commit:** 3fbaaf03

**3. [Rule 3 - Blocking] Cleaned up remaining scheduleToast reference**

- **Found during:** Task 1 build verification
- **Issue:** Descriptive variant return still referenced removed `scheduleToast` variable
- **Fix:** Removed the `{scheduleToast}` JSX reference
- **Files modified:** `apps/portal/src/app/portal/applications/components/shared/actions-toolbar.tsx`
- **Commit:** 3fbaaf03

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| 46-03-01 | Keep application-search.tsx and platform-selector.tsx in scheduling dir | Used by calendar create-event-modal, not interview-only |
| 46-03-02 | Delete available-slots-list.tsx | Only imported by deleted interview scheduling modals |
| 46-03-03 | Keep API paths in use-call-notes.ts as /api/v2/interviews/ | Backend endpoint migration is a separate concern (other plans) |
| 46-03-04 | Keep interview_type field in CallContext | Matches existing API response shape; field rename is cosmetic |

## Verification

- [x] Portal interview directory deleted
- [x] Candidate interview directory deleted
- [x] No broken imports in portal (build succeeds)
- [x] No broken imports in candidate (build succeeds)
- [x] use-interview-token.ts replaced by use-call-token.ts
- [x] use-interview-notes.ts replaced by use-call-notes.ts
- [x] InterviewTranscript removed from shared-types
- [x] shared-types builds
- [x] shared-video builds
- [x] video app builds
- [x] portal app builds

## Next Phase Readiness

Plan 46-04 (backend interview service removal) can proceed. All frontend references to interview-specific pages and scheduling modals are eliminated. The `interview` stage name in application pipelines is preserved as intended (UX terminology, not a system reference).

**Note:** The `interview` category label in notification constants and stage/badge style mappings is intentionally kept -- these are UX-facing labels that users understand.
