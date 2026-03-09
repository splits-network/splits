---
phase: 48-interview-migration-cleanup
plan: 02
subsystem: shared-video
tags: [refactor, naming, cleanup, shared-video, video]
dependency-graph:
  requires: [46-interview-migration]
  provides: [clean-shared-video-exports, call-based-naming]
  affects: [48-03]
tech-stack:
  added: []
  patterns: [barrel-export-cleanup, end-to-end-rename]
key-files:
  created: []
  modified:
    - packages/shared-video/src/index.ts
    - packages/shared-video/src/types.ts
    - packages/shared-video/src/components/video-lobby.tsx
    - packages/shared-video/src/components/participant-sidebar.tsx
    - packages/shared-video/src/components/post-call-summary.tsx
    - apps/video/src/lib/call-adapter.ts
  deleted:
    - packages/shared-video/src/hooks/use-recording-state.ts
    - packages/shared-video/src/hooks/use-call-token.ts
    - packages/shared-video/src/hooks/use-call-notes.ts
    - packages/shared-video/src/components/notes-panel.tsx
decisions: []
metrics:
  duration: 3min
  completed: 2026-03-09
---

# Phase 48 Plan 02: Shared-Video Dead Export Removal and Call-Based Renaming Summary

Clean shared-video barrel exports by removing 5 dead hooks/components and renaming all interview-era naming to call-based naming across types, adapter, and UI components.

## What Was Done

### Task 1: Delete dead exports and their source files (74e3c617)

Removed 5 dead exports from the shared-video barrel (index.ts) and deleted 4 source files that had zero imports across the codebase:

- `use-recording-state.ts` -- used old `/api/v2/interviews/` URLs, never imported
- `use-call-token.ts` -- video app has its own local `use-call-token.ts`
- `use-call-notes.ts` -- used old `/api/v2/interviews/` URLs, never imported
- `notes-panel.tsx` -- portal uses `ApplicationNotesPanel`, not this
- `recording-consent.tsx` -- removed from barrel export but kept as internal dependency of VideoLobby

After cleanup, hooks directory contains only `use-call-duration.ts`.

### Task 2: Rename interview_type to call_type end-to-end (79d2898d)

Renamed all interview-era naming across the type definition, adapter, and consuming components:

- `CallContext.interview_type` renamed to `call_type` in types.ts
- `call-adapter.ts` now maps `call_type: call.call_type` (was `interview_type: call.call_type`)
- `formatInterviewType()` renamed to `formatCallType()` in video-lobby.tsx
- "Join Interview" button text changed to "Join Call"
- "Interview Ended" heading changed to "Call Ended"
- "Interviewer" badge label changed to "Host"
- Default role fallbacks changed from `'interviewer'` to `'host'`

Both `@splits-network/shared-video` and `@splits-network/video` build successfully.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

- Zero matches for `interview_type`, `formatInterviewType`, `Join Interview`, `Interview Ended`, or `Interviewer` in shared-video or call-adapter
- Zero dead hooks remain in shared-video barrel exports
- `pnpm --filter @splits-network/shared-video build` passes
- `pnpm --filter @splits-network/video build` passes

## Next Phase Readiness

Plan 48-03 can proceed. The shared-video package now has clean exports and consistent call-based naming throughout.
