---
phase: 45-ai-pipeline-generalization
plan: 02
subsystem: ai-service
tags: [openai, whisper, transcription, summarization, call-pipeline, rabbitmq]

dependency-graph:
  requires: [45-01]
  provides: [call-ai-pipeline, call-transcription, call-summarization, call.summary_ready-event]
  affects: [45-03, 45-04]

tech-stack:
  added: []
  patterns: [per-call-type-prompts, structured-jsonb-summary, entity-context-injection]

key-files:
  created:
    - services/ai-service/src/v2/call-pipeline/repository.ts
    - services/ai-service/src/v2/call-pipeline/prompt-templates.ts
    - services/ai-service/src/v2/call-pipeline/service.ts
  modified:
    - services/ai-service/src/domain-consumer.ts
    - services/ai-service/src/index.ts

decisions:
  - id: 45-02-01
    title: Separate OpenAI call in CallPipelineService
    choice: CallPipelineService has its own OpenAI chat completion method rather than reusing SummaryService
    reason: SummaryService is interview-specific with hardcoded prompt; call pipeline uses structured per-type prompts with different output parsing

metrics:
  duration: ~4min
  completed: 2026-03-09
---

# Phase 45 Plan 02: Generalized AI Pipeline Summary

**One-liner:** Per-call-type AI pipeline with Whisper transcription, entity-context-aware summarization, and JSONB storage in call-owned artifact tables

## What Was Built

### CallPipelineRepository (`repository.ts`)
- `getCallWithContext(callId)` — fetches call, participants with names, entity links with resolved context (application, job, company, candidate, firm)
- `getRecordingSignedUrl(callId)` — signed URL from first ready recording in call_recordings
- `updatePipelineStatus(callId, step, error?)` — tracks pipeline via call_transcripts/call_summaries status columns
- `saveTranscript(input)` — uploads JSON to storage at `transcripts/calls/{callId}.json`, upserts call_transcripts
- `saveSummary(callId, summaryData, model)` — upserts call_summaries with structured JSONB

### Prompt Templates (`prompt-templates.ts`)
- `INTERVIEW_PROMPT` (interview-v2): recruiter-focused candidate assessment with TL;DR, Key Discussion Points, Strengths, Concerns, Overall Impression
- `CLIENT_MEETING_PROMPT` (client_meeting-v1): business meeting summary with TL;DR, Action Items (with owners), Key Decisions, Discussion Summary, Follow-ups
- `getPromptForCallType(callType, context, transcript)` — selects template and injects entity context
- Both respect existing truncation limits: 12000 chars transcript, 2000 chars job description

### CallPipelineService (`service.ts`)
- Full pipeline: download -> FFmpeg extract (if >25MB) -> Whisper transcribe -> prompt select -> OpenAI summarize -> store
- `extractTldr(markdown)` — parses TL;DR line from summary output
- `extractActionItems(markdown)` — parses bullet points from Action Items section
- Speaker mapping using participant names (alternates on >1s gaps)
- Publishes `call.summary_ready` event with `{ call_id, call_type, has_action_items }`
- Same retry strategy as interview pipeline: 2 retries with exponential backoff

### Domain Consumer Wiring
- New binding: `call.recording_ready` alongside existing `interview.recording_ready`
- New handler: `handleCallRecordingReady` dispatches to CallPipelineService.processRecording
- Interview pipeline completely unchanged (backward compatible)

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

- `call.summary_ready` event ready for downstream consumers (Phase 45-03 frontend display)
- Summary JSONB structure defined: `{ tldr, content, call_type, prompt_version, model, action_items?, entity_context? }`
- Transcript stored at `transcripts/calls/{callId}.json` in storage, URL tracked in call_transcripts
