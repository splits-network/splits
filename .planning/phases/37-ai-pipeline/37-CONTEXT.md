# Phase 37: AI Pipeline - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Completed interview recordings are automatically transcribed and summarized, with summaries posted as application notes. The pipeline is triggered by the `interview.recording_ready` RabbitMQ event from Phase 36. This phase delivers transcription via Whisper, structured summarization, and auto-posting to application notes. Panel interviews, screen share, and in-call notes belong to Phase 38.

</domain>

<decisions>
## Implementation Decisions

### Summary structure
- Recruiter-focused format with sections: Key Discussion Points, Strengths, Concerns, Overall Impression
- Soft impression for the overall section (e.g., "Overall positive impression") — NOT explicit hiring recommendations
- Concise length: 200-300 words with bullet points and short phrases
- Job-aware: AI reads the job description and maps candidate responses to job requirements

### Transcript handling
- Full transcript stored in database and displayed to users
- Speaker-labeled: each segment attributed to interviewer or candidate by name/role
- Clickable timestamps that jump to the corresponding point in the recording playback
- Transcript placement: Claude's Discretion (best fit with existing UI patterns)

### Processing feedback
- Inline status on the application page where summary/transcript will appear
- Granular step display: "Transcribing audio..." → "Generating summary..." → "Posting to notes..."
- Fully automatic trigger — recording completes, pipeline starts immediately with no user action

### Content controls
- One-shot summary generation — no regenerate option; users add their own notes if needed
- AI summary is read-only — cannot be edited, users add separate notes instead
- Distinct AI badge/indicator on AI-generated notes so users know it's machine-generated
- Visible to all company users with application access (follows existing note visibility)

### Claude's Discretion
- Error handling approach (retry strategy, error display)
- Transcript UI placement (below player, separate tab, etc.)
- Whisper model size and configuration
- How to handle recordings over Whisper's 25MB file limit (FFmpeg audio extraction)
- Database schema for transcript and summary storage

</decisions>

<specifics>
## Specific Ideas

- Summary should feel like a recruiter's quick debrief notes — scannable, not academic
- Timestamps in transcript should work like YouTube comments that link to video timestamps
- Job-awareness means the summary highlights whether the candidate addressed key requirements from the job description

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 37-ai-pipeline*
*Context gathered: 2026-03-08*
