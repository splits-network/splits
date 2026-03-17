---
phase: 44-recruiter-company-calls-portal-integration
plan: 08
subsystem: portal-calls
tags: [call-detail, recording, transcript, ai-summary, notes, participants]
depends_on: ["44-06"]
provides: ["call-detail-page", "call-artifact-tabs", "call-notes", "call-participants-view"]
affects: ["44-09", "44-10", "44-11"]
tech-stack:
  patterns: ["two-column-detail-layout", "tabbed-artifact-view", "synced-playback-timestamp"]
key-files:
  created:
    - apps/portal/src/app/portal/calls/[id]/page.tsx
    - apps/portal/src/app/portal/calls/[id]/call-detail-client.tsx
    - apps/portal/src/app/portal/calls/[id]/components/call-detail-header.tsx
    - apps/portal/src/app/portal/calls/[id]/components/recording-tab.tsx
    - apps/portal/src/app/portal/calls/[id]/components/transcript-tab.tsx
    - apps/portal/src/app/portal/calls/[id]/components/summary-tab.tsx
    - apps/portal/src/app/portal/calls/[id]/components/call-context-panel.tsx
    - apps/portal/src/app/portal/calls/[id]/components/call-notes-section.tsx
    - apps/portal/src/app/portal/calls/[id]/components/call-participants-section.tsx
    - apps/portal/src/app/portal/calls/[id]/components/related-calls-section.tsx
    - apps/portal/src/app/portal/calls/hooks/use-call-detail.ts
  modified: []
decisions:
  - "Shared currentTimestamp state in useCallDetail for recording-transcript sync"
  - "Two-column layout: 60% main (tabs+sections) / 40% context panel, collapses on mobile"
  - "Pre-call notes shown to all participants (not creator-only gated) for transparency"
metrics:
  duration: "19min"
  completed: "2026-03-09"
---

# Phase 44 Plan 08: Call Detail Page Summary

**One-liner:** Call detail page with tabbed recording/transcript/summary views, synced playback, entity context panel, notes, participants, and related calls.

## What Was Built

### Task 1: Call Detail Page with Header, Tabs, and Data Hook
- **useCallDetail hook** fetches call with `?include=recordings,transcript,summary,notes,participants,entity_links` and related calls by entity
- **page.tsx** server component passes `id` param to client component (Next.js 16 pattern)
- **CallDetailClient** orchestrates two-column layout with DaisyUI tabs (Recording | Transcript | AI Summary)
- **CallDetailHeader** shows title, status/type badges, tags, follow-up toggle (PUT), join action for scheduled/active calls, meta row with date/duration/participants count

### Task 2: Recording, Transcript, Summary Tabs and Supporting Sections
- **RecordingTab:** HTML5 video/audio player with external timestamp sync, playback speed controls (0.5x-2x), processing/failed/empty states, file size display
- **TranscriptTab:** Timestamped lines with click-to-seek, active line highlight with auto-scroll, search filter, processing/failed states
- **SummaryTab:** Structured AI summary with 4 sections (Key Points, Action Items, Decisions, Follow-ups), numbered items, model attribution, processing/failed states
- **CallContextPanel:** Entity links with type icons, agenda with border-l-4 accent, pre-call notes, call info (ID, created date, room name, cancel reason)
- **CallNotesSection:** Notes list with user/date display, add-note textarea with POST to `/calls/:id/notes`
- **CallParticipantsSection:** Table with avatar, name, email, role badge, joined/left times, computed duration
- **RelatedCallsSection:** Up to 5 compact cards with "View all" link filtered by entity

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Shared `currentTimestamp` state in hook | Enables recording-transcript sync without prop drilling through parent |
| Two-column 60/40 layout | Matches data-dense detail patterns; context panel always visible on desktop |
| Pre-call notes visible to all | Transparency over creator-only restriction; can be gated later if needed |
| Server component page.tsx + client wrapper | Follows Next.js 16 pattern from interview detail page |

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- TypeScript compilation passes with zero errors in call detail files
- All 11 new files created following existing portal patterns
- Components use DaisyUI classes (tabs, badges, buttons, avatars) consistently
- No `text-xs` on readable content; no rounded corners on structural elements
