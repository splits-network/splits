---
phase: 37-ai-pipeline
plan: "03"
subsystem: portal-frontend
tags: [ai-pipeline, transcript, notes, daisyui]
dependency-graph:
  requires: ["37-01"]
  provides: ["ai-badge-notes", "transcript-panel", "pipeline-status-ui"]
  affects: []
tech-stack:
  added: []
  patterns: ["collapsible-transcript", "pipeline-status-inline"]
key-files:
  created:
    - apps/portal/src/app/portal/applications/[id]/components/ai-pipeline-status.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-transcript-panel.tsx
  modified:
    - packages/shared-ui/src/application-notes/application-note-item.tsx
    - apps/portal/src/app/portal/applications/[id]/components/interview-recording-card.tsx
    - apps/portal/src/app/portal/applications/[id]/components/join-interview-button.tsx
decisions:
  - id: markdown-renderer-reuse
    summary: "Reused existing MarkdownRenderer for AI summary content instead of custom renderFormattedNote"
    rationale: "MarkdownRenderer already handles ## headings and - bullet lists correctly"
metrics:
  duration: "~8 minutes"
  completed: "2026-03-08"
---

# Phase 37 Plan 03: AI Pipeline Frontend Components Summary

**One-liner:** AI badge on summary notes with read-only enforcement, transcript panel with clickable timestamps, and inline pipeline status indicator.

## What Was Done

### Task 1: AI badge on summary notes and read-only enforcement (802df060)
- Added "AI Generated" sparkle badge (`badge-secondary`) on `interview_summary` notes
- Hidden edit/delete action buttons for AI-generated notes (read-only enforcement)
- Leveraged existing `MarkdownRenderer` for summary content formatting (already supports `##` headings and `- ` lists)

### Task 2: Transcript panel and pipeline status (a585f7dc)
- Created `AIPipelineStatus` component: inline status for pending/transcribing/summarizing/posting/failed states with loading spinners
- Created `InterviewTranscriptPanel` component: DaisyUI collapse with segment count badge, speaker labels, `MM:SS` timestamp buttons, scrollable segment list
- Updated `InterviewRecordingCard` to fetch transcript data from `/api/v2/interviews/:id/transcript` when `transcriptStatus === 'complete'`
- Added `transcriptStatus` optional prop threaded through `JoinInterviewButton`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added transcriptStatus prop to JoinInterviewButton**
- **Found during:** Task 2
- **Issue:** JoinInterviewButton renders InterviewRecordingCard but had no way to pass transcript_status
- **Fix:** Added optional `transcriptStatus` prop and threaded it through
- **Files modified:** join-interview-button.tsx

### Design Decisions

**Markdown renderer reuse:** Plan specified creating a custom `renderFormattedNote` helper for summary formatting. The existing `MarkdownRenderer` component (using react-markdown + remark-gfm) already handles `##` headings and `- ` bullet points, so no custom renderer was needed.

## Verification

- `pnpm --filter @splits-network/shared-ui build` passes
- `pnpm --filter @splits-network/portal build` passes

## Commits

| Hash | Message |
|------|---------|
| 802df060 | feat(37-03): add AI badge and read-only enforcement for interview summary notes |
| a585f7dc | feat(37-03): add transcript panel, pipeline status, and recording card integration |
