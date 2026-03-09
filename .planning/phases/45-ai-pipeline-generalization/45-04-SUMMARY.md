---
phase: 45-ai-pipeline-generalization
plan: 04
subsystem: ui
tags: [react, daisyui, pipeline-status, markdown, call-detail]

requires:
  - phase: 45-02
    provides: CallPipelineService with new JSONB summary format (tldr, content, action_items)
  - phase: 45-03
    provides: Call recording playback URLs for portal detail page
provides:
  - PipelineStatus stepper component for call detail page
  - Updated summary tab rendering TL;DR + markdown + action items
  - Auto-refresh polling while pipeline processes
affects: []

tech-stack:
  added: []
  patterns:
    - "Pipeline status stepper using DaisyUI steps component"
    - "Auto-refresh polling via useRef interval in custom hook"
    - "Dual-format summary rendering (new vs legacy) with detection"

key-files:
  created:
    - apps/portal/src/app/portal/calls/[id]/components/pipeline-status.tsx
  modified:
    - apps/portal/src/app/portal/calls/hooks/use-call-detail.ts
    - apps/portal/src/app/portal/calls/[id]/call-detail-client.tsx
    - apps/portal/src/app/portal/calls/[id]/components/summary-tab.tsx

key-decisions:
  - "Detect new vs legacy summary format via presence of tldr or content fields"
  - "Pipeline status hides when complete — summary content is sufficient indicator"
  - "15-second polling interval for auto-refresh during processing"

patterns-established:
  - "Dual-format rendering: detect format shape, branch to appropriate renderer"
  - "useRef-based polling interval cleared on completion or unmount"

duration: 3min
completed: 2026-03-09
---

# Phase 45 Plan 04: Call Detail Pipeline UI Summary

**Pipeline status stepper with auto-refresh and TL;DR + markdown summary rendering for call detail page**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-09T07:25:25Z
- **Completed:** 2026-03-09T07:27:57Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- PipelineStatus component shows Recording -> Transcribing -> Summarizing -> Complete with DaisyUI steps
- Auto-refresh polls every 15s while pipeline is in progress, stops when summary is ready
- Summary tab renders TL;DR prominently with border-l-4 accent, markdown via MarkdownRenderer, and structured action items list
- Backward compatible with legacy structured summary format (key_points, decisions, follow_ups arrays)

## Task Commits

1. **Task 1: Pipeline status component and auto-refresh** - `53497d64` (feat)
2. **Task 2: Summary tab with TL;DR + markdown rendering** - `03a0fb9d` (feat)

## Files Created/Modified
- `apps/portal/src/app/portal/calls/[id]/components/pipeline-status.tsx` - Step-by-step pipeline status stepper
- `apps/portal/src/app/portal/calls/hooks/use-call-detail.ts` - Extended CallSummary interface + isPipelineProcessing + auto-refresh
- `apps/portal/src/app/portal/calls/[id]/call-detail-client.tsx` - Renders PipelineStatus above tabs when processing
- `apps/portal/src/app/portal/calls/[id]/components/summary-tab.tsx` - Rewritten for TL;DR + markdown + action items with legacy fallback

## Decisions Made
- Detect new vs legacy summary format via presence of `tldr` or `content` fields in summary JSONB
- Pipeline status component hides when complete — the summary tab content serves as the completion indicator
- 15-second polling interval balances responsiveness with API load
- Reused existing portal MarkdownRenderer (wraps shared-ui) for summary content rendering

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 45 is complete with all 4 plans done
- Full AI pipeline: webhook -> transcription -> summarization -> UI display
- Both interview and call pipelines supported with unified architecture

---
*Phase: 45-ai-pipeline-generalization*
*Completed: 2026-03-09*
