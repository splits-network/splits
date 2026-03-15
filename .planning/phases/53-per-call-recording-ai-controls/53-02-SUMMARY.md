---
phase: 53-per-call-recording-ai-controls
plan: "02"
subsystem: api
tags: [ai-pipeline, subscriptions, tier-gating, whisper, openai, call-recording]

requires:
  - phase: 53-01
    provides: recording_enabled, transcription_enabled, ai_analysis_enabled columns on calls table and call-service tier validation

provides:
  - getCallFlags method on CallPipelineRepository querying per-call recording/AI flags
  - getCreatorTier method on CallPipelineRepository querying subscriptions+plans for active tier
  - Tier-gated processRecording pipeline that checks flags and tier before each step

affects:
  - 53-03 (call creation UI — pipeline now fully enforces tier model end-to-end)
  - 53-04 (post-call tab gating — pipeline skips are consistent with UI gating)

tech-stack:
  added: []
  patterns:
    - "Tier gate pattern: check flags -> check tier -> gate each step separately"
    - "Graceful billing skip: billing DB failure returns early without crashing or losing recording"
    - "Direct DB subscription query in ai-service — no HTTP between services"

key-files:
  created: []
  modified:
    - services/ai-service/src/v2/call-pipeline/repository.ts
    - services/ai-service/src/v2/call-pipeline/service.ts

key-decisions:
  - "Tier lookup throws on DB error (not returns starter) so caller can distinguish 'no subscription' from 'DB down' for graceful retry"
  - "Transcription skip also skips summarization — AI analysis always requires transcript as input"
  - "updatePipelineStatus(complete) fires for both transcription-only and full pipeline completions"
  - "Event publish fires for transcription-only completions with has_action_items=false"

patterns-established:
  - "Pipeline gate pattern: check each gate at the top with early return before setting status"
  - "Billing DB graceful skip: try/catch around tier lookup, return early (not throw) to allow RabbitMQ retry"

duration: 2min
completed: 2026-03-11
---

# Phase 53 Plan 02: AI Pipeline Tier Enforcement Summary

**Tier-gated call AI pipeline that checks recording_enabled, creator subscription tier, transcription_enabled, and ai_analysis_enabled flags before each processing step — starter tier and disabled flags produce graceful skips, not errors**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-11T04:34:52Z
- **Completed:** 2026-03-11T04:36:26Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `getCallFlags` and `getCreatorTier` to `CallPipelineRepository` — direct Supabase queries, no HTTP between services
- Wired full tier-gated decision tree into `processRecording` — flags checked before any DB writes or API calls
- Billing DB failure handled gracefully: logs error, returns early, allows RabbitMQ retry without losing the recording

## Task Commits

Each task was committed atomically:

1. **Task 1: Add call flag and tier lookup methods to pipeline repository** - `2758a8fe` (feat)
2. **Task 2: Add tier-gated decision tree to pipeline service** - `576dfb93` (feat)

**Plan metadata:** (committed with SUMMARY)

## Files Created/Modified

- `services/ai-service/src/v2/call-pipeline/repository.ts` - Added `getCallFlags` (calls table query) and `getCreatorTier` (subscriptions+plans join, defaults to starter)
- `services/ai-service/src/v2/call-pipeline/service.ts` - Full tier-gated `processRecording` with early returns for each gate

## Decisions Made

- `getCreatorTier` throws on DB error rather than silently returning starter — the service catches this specifically and returns early for retry. This distinguishes "no active subscription = starter" from "DB unavailable = unknown, retry later".
- Skipping transcription also skips summarization unconditionally — AI analysis requires a transcript as input, so gating on `transcription_enabled` is the right single gate.
- `updatePipelineStatus('complete')` fires regardless of whether summarization ran — the transcript being saved is a meaningful completion state.
- Event publish (`call.summary_ready`) fires for transcription-only completions with `has_action_items: false` — downstream consumers can handle both cases.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AI pipeline now fully enforces the tier model end-to-end
- Ready for 53-03: Call creation UI (recording/AI toggle controls)
- Ready for 53-04: Post-call tab gating (consistent with pipeline behavior)

---
*Phase: 53-per-call-recording-ai-controls*
*Completed: 2026-03-11*
