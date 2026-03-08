---
phase: 37-ai-pipeline
plan: "02"
subsystem: ai-pipeline
tags: [whisper, gpt, transcription, summarization, rabbitmq]
depends_on: ["37-01"]
provides: ["transcription-pipeline", "transcript-api", "summary-note-posting"]
affects: ["37-03"]
tech-stack:
  added: []
  patterns: ["event-driven-pipeline", "ffmpeg-audio-extraction", "whisper-transcription"]
key-files:
  created:
    - services/ai-service/src/v2/transcription/repository.ts
    - services/ai-service/src/v2/transcription/summarizer.ts
    - services/ai-service/src/v2/transcription/service.ts
  modified:
    - services/ai-service/src/domain-consumer.ts
    - services/ai-service/src/index.ts
    - services/video-service/src/v2/interviews/routes.ts
    - services/video-service/src/v2/interviews/repository.ts
decisions:
  - decision: "Simple alternating speaker heuristic for segment labeling"
    rationale: "Whisper-1 does not provide speaker diarization; gap-based alternation is a reasonable baseline"
  - decision: "Interview creator as note author for AI summaries"
    rationale: "application_notes requires valid user FK; platform_admin created_by_type + interview_summary note_type distinguishes AI-generated content"
  - decision: "FFmpeg to mp3 at 64kbps/16kHz for large files"
    rationale: "Keeps audio under Whisper 25MB limit while preserving speech quality"
metrics:
  duration: "4 minutes"
  completed: "2026-03-08"
---

# Phase 37 Plan 02: AI Transcription Pipeline Summary

**One-liner:** Event-driven Whisper transcription + GPT summarization pipeline with auto-posted interview summaries and transcript REST API

## What Was Built

### TranscriptionRepository (repository.ts)
- `getInterviewWithContext()` — fetches interview, participants with names, job title/description
- `updatePipelineStatus()` — granular status tracking (pending/transcribing/summarizing/posting/complete/failed)
- `saveTranscript()` — persists full text + speaker-labeled segments to interview_transcripts
- `postSummaryNote()` — inserts AI summary as interview_summary note on the application
- `getRecordingSignedUrl()` — generates time-limited Supabase Storage download URL

### SummaryService (summarizer.ts)
- GPT-powered structured summary: Key Discussion Points, Strengths, Concerns, Overall Impression
- Job-aware: maps candidate responses to job requirements
- Recruiter-focused: 200-300 words, bullet points, no hiring recommendations
- Retry with exponential backoff for 429/5xx errors

### TranscriptionPipelineService (service.ts)
- Full pipeline orchestration: download -> transcribe -> summarize -> post note
- Whisper API integration with verbose_json format and segment timestamps
- FFmpeg audio extraction fallback for recordings > 25MB
- Speaker labeling via gap-based alternation heuristic
- Non-throwing error handling: sets status to 'failed' without crashing consumer
- Publishes `interview.transcript_ready` event on completion

### Domain Consumer Wiring
- New `interview.recording_ready` binding in RabbitMQ consumer
- handleRecordingReady handler delegates to pipeline service
- Pipeline instantiated in index.ts with shared Supabase client

### Transcript API Endpoint
- GET /api/v2/interviews/:id/transcript in video-service
- Returns full transcript with segments for frontend rendering
- Proxied through existing gateway wildcard route

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Plan 37-03 (frontend) can now:
- Fetch transcript via GET /api/v2/interviews/:id/transcript
- Display pipeline status from interview's transcript_status field
- Render speaker-labeled segments with clickable timestamps
- Show AI-generated summary in application notes with interview_summary badge
