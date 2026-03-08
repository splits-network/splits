---
phase: 38-panel-notes-polish
plan: 04
subsystem: video-interviewing
tags: [interviews, tabs, scheduling, round-naming, frontend]
dependency-graph:
  requires: [38-01]
  provides: [interviews-tab, round-name-scheduling]
  affects: []
tech-stack:
  added: []
  patterns: [authenticated-fetch-tab, timeline-card-layout]
key-files:
  created:
    - apps/portal/src/app/portal/applications/components/shared/application-interviews-tab.tsx
  modified:
    - apps/portal/src/app/portal/applications/components/shared/application-detail-panel.tsx
    - apps/portal/src/components/basel/scheduling/schedule-interview-modal.tsx
decisions:
  - id: timeline-card-layout
    description: Card-based vertical timeline with dot connectors for interview history
  - id: highlighted-upcoming
    description: Most recent upcoming/in-progress interview gets primary left border accent
metrics:
  duration: ~4 minutes
  completed: 2026-03-08
---

# Phase 38 Plan 04: Interviews Tab and Round Naming Summary

Card-based interviews timeline tab on application detail panel with optional round naming in schedule modal.

## What Was Done

### Task 1: ApplicationInterviewsTab Component
- Created new tab component fetching `GET /api/v2/interviews?application_id={id}&include_context=true`
- Vertical timeline layout with chronological interview cards
- Each card shows: round number/name, status badge (color-coded), date/time, duration, participants with avatar tooltips, and interview type
- Completed interviews show asset indicators for recording, transcript, and AI summary availability
- Highlighted state (primary left border) on the most recent upcoming interview
- Cancelled interviews rendered at reduced opacity
- Loading spinner, error state, and empty state ("No interviews scheduled") handled

### Task 2: Detail Panel Tab + Schedule Modal Round Name
- Added "Interviews" tab to TabKey union and TABS array (after Notes, before Timeline)
- Renders ApplicationInterviewsTab when active with application ID prop
- Added optional "Round Name" text input to confirm step of schedule interview modal
- Field has 100-char max, placeholder examples ("Technical Screen, Culture Fit")
- `round_name` included in POST body when creating interview (undefined if empty)

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | ebd5ff54 | ApplicationInterviewsTab component with timeline layout |
| 2 | 3d517d19 | Interviews tab in detail panel + round name in schedule modal |

## Verification

- `pnpm --filter @splits-network/portal build` passes for both tasks
- No TypeScript errors
- Component follows existing tab patterns (matches ApplicationNotesTab structure)
- API endpoint matches 38-01 backend implementation

## Next Phase Readiness

This is the final plan of phase 38. All four plans are now complete:
- 38-01: Backend migration and API (interview notes, enriched listing, round naming)
- 38-02: Panel layout and screen sharing
- 38-03: In-call notes panel
- 38-04: Interviews tab and round naming (this plan)
