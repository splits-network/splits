# Phase 33: Infrastructure - Context

**Gathered:** 2026-03-07
**Status:** Ready for planning

<domain>
## Phase Boundary

LiveKit K8s deployment, video-service scaffold, database schema for interviews, token system (magic links + room JWTs), and gateway routing. This phase delivers the foundation — no UI, no scheduling, no recording.

</domain>

<decisions>
## Implementation Decisions

### Magic Link Design
- Links never expire until the interview is cancelled or completed
- Reusable — same link works for reconnects, browser refreshes, device switches
- Opaque token only (no PII in URL) — server looks up all context from the token
- Expired/invalid links show a friendly branded error page explaining the interview has ended or was cancelled

### Interview Lifecycle
- 6 statuses: `scheduled`, `in_progress`, `completed`, `cancelled`, `no_show`, `expired`
- Interview record always linked to an application (required FK, not nullable)
- Metadata tracked per interview:
  - Actual start time, end time, computed duration
  - Cancellation reason (optional text when cancelled)
  - Interview type as fixed enum (screening, technical, cultural, final)
  - Claude adds additional fields needed by downstream phases

### Room Behavior
- 4-hour maximum call duration with warning before auto-end
- 5-minute grace period when all participants leave before room auto-closes
- Auto-transition statuses: first join → `in_progress`, room closes → `completed`
- Lazy room creation — LiveKit room created on first participant join, not at scheduling

### Token & Access Rules
- Interview creation: `company_admin`, `hiring_manager`, and `recruiter` roles can schedule
- Participant model: separate `interview_participants` table using `users.id` (not clerk_user_id) — supports multi-interviewer from day one
- Participant capabilities (interviewer vs candidate permissions): Claude's discretion based on LiveKit capabilities and downstream phase needs
- Concurrent interview limits: Claude's discretion based on infrastructure constraints

### Claude's Discretion
- Room token duration and refresh strategy
- Interviewer vs candidate permission differentiation in LiveKit tokens
- Concurrent interview limits (if any)
- Additional interview metadata fields needed for Phases 34-38
- Interview type enum values beyond the four discussed

</decisions>

<specifics>
## Specific Ideas

- Participants table uses `users.id` FK, not `clerk_user_id` — aligns with user identification standard
- Magic link tokens should be cryptographically random, URL-safe
- Interview status transitions driven by LiveKit room events (webhook-based)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 33-infrastructure*
*Context gathered: 2026-03-07*
