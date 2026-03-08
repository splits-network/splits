---
phase: 38-panel-notes-polish
plan: 03
subsystem: video-interviewing
tags: [notes, markdown, auto-save, interview, panel]
dependency-graph:
  requires: [38-01, 38-02]
  provides: [in-call-notes-panel, auto-save-hook, notes-auto-post]
  affects: [38-04]
tech-stack:
  added: []
  patterns: [debounced-auto-save, magic-link-dual-auth, render-prop-panel]
key-files:
  created:
    - packages/shared-video/src/components/notes-panel.tsx
    - packages/shared-video/src/hooks/use-interview-notes.ts
  modified:
    - packages/shared-video/src/components/video-room.tsx
    - packages/shared-video/src/components/video-controls.tsx
    - packages/shared-video/src/index.ts
    - packages/shared-video/package.json
    - apps/portal/src/app/portal/interview/[id]/interview-client.tsx
    - apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx
decisions:
  - id: notes-panel-render-prop
    description: NotesPanel passed as render prop to VideoRoom for flexible composition
  - id: all-participants-notes
    description: Both interviewers and candidates can take notes during calls
metrics:
  duration: ~4 minutes
  completed: 2026-03-08
---

# Phase 38 Plan 03: In-Call Notes Panel Summary

**NotesPanel component with MarkdownEditor, debounced auto-save hook, and auto-post to application notes on disconnect for both portal and candidate apps**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-08T09:12:45Z
- **Completed:** 2026-03-08T09:17:00Z
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 6

## Accomplishments

- Created `useInterviewNotes` hook with 2-second debounced auto-save via PUT to backend
- Created `NotesPanel` component using MarkdownEditor from shared-ui with save status indicator
- Added notes toggle button to VideoControls (highlights when active)
- Updated VideoRoom to accept notesPanel as render prop alongside video area
- Portal InterviewClient: notes auto-save during call, auto-post on disconnect for interviewers
- Candidate InterviewClient: notes with magic link token auth, auto-post on disconnect
- Video area shrinks when notes panel opens via flex layout
- Added shared-ui as peerDependency of shared-video

## Task Commits

Each task was committed atomically:

1. **Task 1: NotesPanel component + useInterviewNotes auto-save hook** - `c6f39e2f` (feat)
2. **Task 2: Integrate notes panel into portal and candidate interview clients** - `494b6231` (feat)

## Files Created/Modified

- `packages/shared-video/src/hooks/use-interview-notes.ts` - Auto-save hook with 2s debounce, GET on mount, PUT on change, POST for post-to-application
- `packages/shared-video/src/components/notes-panel.tsx` - Side panel with MarkdownEditor, save status, slide-in animation
- `packages/shared-video/src/components/video-controls.tsx` - Added notes toggle button with active state highlighting
- `packages/shared-video/src/components/video-room.tsx` - Added notesPanel, onNotesToggle, notesOpen props
- `packages/shared-video/src/index.ts` - Export NotesPanel and useInterviewNotes
- `packages/shared-video/package.json` - Added shared-ui as peerDependency
- `apps/portal/src/app/portal/interview/[id]/interview-client.tsx` - Notes integration with auto-post for interviewers
- `apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx` - Notes integration with magic link token

## Decisions Made

- NotesPanel passed as render prop to VideoRoom rather than being internal to VideoRoom, allowing each client to configure auth differently
- All participants (interviewers and candidates) can take notes, per CONTEXT.md decision
- Auto-post on disconnect is best-effort (wrapped in try/catch) to avoid blocking post-call flow
- Notes panel width is w-96 on desktop, full width on mobile

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - uses existing backend API endpoints from plan 38-01.

## Next Phase Readiness

- In-call notes fully integrated for both portal and candidate apps
- Ready for plan 38-04 (interviews tab and final polish)

---
*Phase: 38-panel-notes-polish*
*Completed: 2026-03-08*
