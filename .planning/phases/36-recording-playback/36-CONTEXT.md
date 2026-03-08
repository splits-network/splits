# Phase 36: Recording & Playback - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side interview recording via LiveKit Egress, stored in Azure Blob Storage with lifecycle rules, and playback from the application page. Includes consent UX, recording controls, and a `interview.recording_ready` RabbitMQ event for downstream processing (Phase 37). Transcription, AI summarization, and panel interviews are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Recording consent UX
- Consent presented in the lobby before joining the call — participant must acknowledge before entering
- If a participant joins after recording has already started, they see consent in their lobby (same gate)
- In-call indicator: persistent red dot + "Recording" text in the controls area
- Consent text mentions recording, transcription, AND AI summarization upfront ("This interview will be recorded, transcribed, and summarized") — covers Phase 37 disclosure now

### Recording controls
- Auto-record: recording starts automatically when the interview begins (if recording was enabled at scheduling)
- Recording enablement: per-interview toggle — checkbox on the schedule interview modal ("Record this interview")
- Interviewer can stop recording mid-call (stop button, no restart) — runs until call ends otherwise
- Only the authenticated interviewer can stop recording, not the candidate

### Playback experience
- Standard HTML5 video controls: play/pause, scrub bar, volume, fullscreen
- Generic placeholder card before playing (branded "Interview Recording" with date, duration, participants) — no video thumbnail extraction
- Candidates cannot view recordings — recruiters and company users only

### Storage & retention
- Composite recording format: single video file with all participants in grid layout
- Authorized users (interview participants + company admins) can download recordings
- Azure Blob lifecycle: Hot to Cool at 30 days, delete at 90 days
- Warn users before deletion (e.g., 7 days before expiry), then auto-delete
- Access restricted to interview participants and company admins

### Claude's Discretion
- Playback location on the application page (interviews tab, activity feed, or modal — whatever fits best)
- Egress configuration details (resolution, codec, container format)
- SAS token / signed URL approach for secure blob access
- Recording status tracking in the database
- Error handling for failed recordings

</decisions>

<specifics>
## Specific Ideas

- Consent should be future-proof: mention transcription and AI summarization now so it doesn't need updating when Phase 37 ships
- Recording indicator should be visible at all times during the call — not dismissible
- Stop button available to interviewer only, giving them control over what gets recorded

</specifics>

<deferred>
## Deferred Ideas

- Company-wide "record all interviews" default setting — could be added later as an org preference
- Pause/resume recording during a call — only stop (no restart) for now
- Candidate access to their own recordings — recruiters/company only for now
- Video thumbnail extraction from recordings — using generic placeholder instead

</deferred>

---

*Phase: 36-recording-playback*
*Context gathered: 2026-03-07*
