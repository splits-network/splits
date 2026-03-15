# Phase 38: Panel, Notes & Polish - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Extend the interview experience to support multi-party panel calls (3-6+ participants), screen sharing, in-call note-taking with auto-post to application notes, and a dedicated interviews tab on the application detail page showing full interview history with recordings, transcripts, and summaries. Does NOT include new interview types, new scheduling flows, or changes to the AI pipeline.

</domain>

<decisions>
## Implementation Decisions

### Panel call layout
- Layout approach is Claude's discretion (grid vs active speaker — pick what LiveKit supports best for interview context)
- Always-visible participant sidebar showing names, roles (interviewer/candidate), and mute status
- Join/leave notifications: both toast notification AND sidebar highlight animation
- Candidate tile visually distinguished from interviewers (accent color border or "Candidate" badge)

### In-call notes experience
- Notes panel opens as a right side panel, video area shrinks to accommodate
- Reuse the existing markdown editor component (already supports write/preview modes)
- All participants (interviewers and candidates) can take notes
- Notes auto-post as application notes when the call ends — each participant's notes become a separate note

### Interviews tab
- Added as a new tab on the application detail page (not the default — just another tab alongside existing tabs)
- Layout and information density are Claude's discretion
- AI summary display (inline preview vs link-only) is Claude's discretion
- Multi-round tracking: interviews are auto-numbered (Round 1, Round 2, etc.) by chronological order, but users can optionally add a round name/label when scheduling (e.g., "Technical Screen", "Culture Fit")

### Screen sharing
- Screen share button added to the existing always-visible controls bar
- When sharing, shared screen dominates the main area; participant videos shrink to a strip
- Any participant (interviewer or candidate) can share their screen
- Multiple simultaneous screen shares allowed — additional shares appear as tiles

### Claude's Discretion
- Panel layout algorithm (grid vs active speaker vs hybrid)
- Interviews tab layout style (cards vs table vs timeline)
- AI summary preview behavior on interviews tab
- Notes panel width and resize behavior
- Screen share tile arrangement when multiple shares active

</decisions>

<specifics>
## Specific Ideas

- Existing markdown editor component should be reused for in-call notes (already in codebase with write/preview modes)
- Round naming examples: "Technical Screen", "Culture Fit", "Final Panel"
- Screen share layout: shared screen large, participants in small strip (similar to Google Meet pattern)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 38-panel-notes-polish*
*Context gathered: 2026-03-08*
