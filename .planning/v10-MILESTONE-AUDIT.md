---
milestone: v10.0
audited: 2026-03-09
status: passed
scores:
  requirements: 20/20
  phases: 10/10
  integration: 18/18
  flows: 8/8
gaps:
  requirements: []
  integration: []
  flows: []
tech_debt:
  - phase: call-service
    items:
      - "Orphaned events published but never consumed: call.started, call.ended, call.missed, call.no_show (forward-looking, P4)"
---

# v10.0 Milestone Audit — Video Platform & Recruiting Calls

**Audit Date:** 2026-03-09 (final — post Phase 51, all gaps resolved)
**Previous Audits:**
- 2026-03-09 (pre-fix: 3 P0/P1 bugs → Phases 47-48 created)
- 2026-03-09 (manual re-check: missed integration gaps → Phases 49-50 created)
- 2026-03-09 (with integration checker: 4 critical gaps found)
- 2026-03-09 (post Phase 49-50: 3 tech debt items, 2 P3 gaps)
- 2026-03-09 (post Phase 51: all gaps resolved, 1 P4 tech debt remains)

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Requirements | 20/20 | All satisfied |
| Phases complete | 10/10 | All plans executed (38 plans across 10 phases) |
| Cross-phase wiring | 18/18 | All connected |
| E2E flows | 8/8 | All complete |

## Requirements Coverage

| Requirement | Phase | Status | Notes |
|-------------|-------|--------|-------|
| DATA-01 | 42 | Satisfied | calls table with call_type enum, polymorphic entity linking |
| DATA-02 | 42 | Satisfied | interviews.call_id FK created then tables dropped in Phase 46 |
| DATA-03 | 42 | Satisfied | All artifacts on call record |
| APP-01 | 43 | Satisfied | apps/video/ Next.js app |
| APP-02 | 43 | Satisfied | Host header brand detection |
| APP-03 | 43+49 | Satisfied | Magic-link join + instant call join (token field fixed in Phase 49) |
| APP-04 | 43 | Satisfied | K8s dual-subdomain ingress + TLS |
| CALL-01 | 44 | Satisfied | CallCreationModal with participant picker and entity linker |
| CALL-02 | 44 | Satisfied | Equal peer-to-peer roles |
| CALL-03 | 44+51 | Satisfied | Google Calendar integration + auto-creation on scheduled calls (Phase 51) |
| CALL-04 | 44+49 | Satisfied | Reminders (24h/1h/5min) + call.created/cancelled/rescheduled emails (participants added in Phase 49) |
| HIST-01 | 44 | Satisfied | Portal Calls section with table/grid views |
| HIST-02 | 44+49 | Satisfied | Call detail with recording playback (signed URL fixed in Phase 49) |
| EXP-01 | 44 | Satisfied | In-call context panel |
| AI-04 | 45 | Satisfied | AI summaries on call record |
| AI-05 | 45 | Satisfied | Per-call-type summarizer prompts |
| AI-06 | 45 | Satisfied | Entity context in AI prompts |
| MIG-01 | 46 | Satisfied | Interview video flows replaced by call system |
| MIG-02 | 46 | Satisfied | Magic link URLs work through new video app domain |
| MIG-03 | 46 | Satisfied | Interview tables dropped, call system owns all data |

## All Bugs Resolved

### Phases 47-48 Fixes

| Issue | Phase | Status |
|-------|-------|--------|
| SessionStorage key mismatch | 47 | Fixed — both use `call-${id}` |
| Recording event name mismatch | 47 | Fixed — `call.recording_ready` matches |
| Missing `call.reminder` binding | 47 | Fixed — bound in notification-service |
| Dead gateway auth-skip rules | 48 | Fixed — zero interview references |
| Dead shared-video hooks | 48 | Fixed — deleted + renamed |
| Legacy bucket name | 48 | Fixed — all code uses `call-recordings` |

### Phases 49-50 Fixes

| Issue | Phase | Status |
|-------|-------|--------|
| Missing `participants` in 4 event payloads | 49 | Fixed — all 4 events include participants array |
| Token field name mismatch (`token` vs `access_token`) | 49 | Fixed — backend returns `access_token` |
| Missing `/portal/calls/:id/join` page | 49 | Fixed — join page created with token redirect |
| Recording playback raw blob_url | 49 | Fixed — fetches signed URL from playback-url endpoint |
| recording-consent.tsx "Interview" text | 50 | Fixed — says "This Call Will Be Recorded" |
| video-service Swagger "interview" description | 50 | Fixed — says "video call service" |
| Notification metadata `call.recording.ready` (dots) | 50 | Fixed — uses `call.recording_ready` (underscore) |
| Calendar preferences "scheduling interviews" | 50 | Fixed — says "scheduling calls" |

### Phase 51 Fixes

| Issue | Phase | Status |
|-------|-------|--------|
| Recording consent not passed to VideoLobby | 51 | Fixed — `call-experience.tsx` passes `recordingEnabled={callContext.recording_enabled}` to both VideoLobby renders |
| Calendar auto-creation not wired | 51 | Fixed — `createCalendarEvents` fires after scheduled call creation in `call-creation-modal.tsx` |

## E2E Flow Analysis — All 8 Complete

### Flow 1: Recruiter Schedules Call — COMPLETE

| Step | Status | Detail |
|------|--------|--------|
| Create call via modal | OK | POST /api/v2/calls |
| call.created event | OK | Includes `participants` array (Phase 49 fix) |
| Notification emails | OK | notification-service resolves contacts from participants |
| Calendar auto-creation | OK | Fire-and-forget POST to integration-service (Phase 51 fix) |
| 24h/1h reminders | OK | Scheduler includes participants correctly |
| 5-min reminder | OK | call.starting_soon works |
| Join Call button | OK | /portal/calls/:id/join page (Phase 49 fix) |

### Flow 2: Instant Call via Application — COMPLETE

| Step | Status | Detail |
|------|--------|--------|
| Schedule Call shortcut | OK | CallCreationModal opens with prefilled entity |
| Create call | OK | POST /api/v2/calls |
| Generate token | OK | POST /api/v2/calls/:id/token |
| Redirect to video app | OK | Reads `access_token` — aligned (Phase 49 fix) |
| Calendar skip | OK | Instant calls correctly skip calendar creation (Phase 51) |

### Flow 3: Recording Pipeline — COMPLETE

| Step | Status | Detail |
|------|--------|--------|
| LiveKit egress webhook | OK | video-service receives |
| Recording stored | OK | call_recordings table updated |
| call.recording_ready | OK | Event published with participants (Phase 49 fix) |
| AI pipeline | OK | ai-service transcribes + summarizes |
| Recording notification | OK | Participants in payload, emails sent |
| Recording playback | OK | Signed URL from playback-url endpoint (Phase 49 fix) |

### Flow 4: Magic Link Join — COMPLETE

sessionStorage key fixed, token exchange works, brand detection works

### Flow 5: Brand Detection — COMPLETE

Host header detection, dual themes, K8s ingress configured

### Flow 6: Call Cancel/Reschedule — COMPLETE

Events include participants, notification-service sends emails

### Flow 7: AI Summary Generation — COMPLETE

Per-call-type prompts (interview vs client_meeting), entity context included, summaries stored on call record

### Flow 8: Recording Consent — COMPLETE (Phase 51 fix)

| Step | Status | Detail |
|------|--------|--------|
| call_types.requires_recording_consent | OK | Queried in call-service repository |
| recording_consent_required on CallDetail | OK | Propagated through service types |
| call-adapter.ts mapping | OK | `recording_enabled: call.recording_consent_required ?? true` |
| call-experience.tsx passes prop | OK | `recordingEnabled={callContext.recording_enabled}` on both VideoLobby renders (Phase 51 fix) |
| VideoLobby renders consent | OK | Conditional render + join gate |
| RecordingConsent component | OK | "This Call Will Be Recorded" banner with checkbox |

## Remaining Tech Debt (Non-Blocking)

| Priority | Item | Location |
|----------|------|----------|
| P4 | Orphaned events published but never consumed: call.started, call.ended, call.missed, call.no_show | call-service (forward-looking for analytics/activity feeds) |

## Interview Migration — Clean

No residual `interview_type`, `interview_id`, `InterviewTab`, or interview-specific patterns found in:
- `services/call-service/src/` — zero matches
- `services/video-service/src/` — zero matches
- `apps/portal/src/` — zero matches for interview-specific patterns
- `apps/video/src/` — zero matches

## API Coverage

12 call routes consumed by portal/video app. All sensitive routes require auth. Exchange-token and recording webhook correctly public.

## RabbitMQ Event Binding — Complete

All call events bound in notification-service: `call.created`, `call.cancelled`, `call.rescheduled`, `call.recording_ready`, `call.starting_soon`, `call.reminder`, `call.declined`, `call.participant.joined`.

AI-service binds `call.recording_ready` with per-call-type prompt templates for `interview` and `client_meeting`.

---
*First audit: 2026-03-09 (pre-fix, 3 P0/P1 bugs → Phases 47-48 created)*
*Second audit: 2026-03-09 (manual re-check, missed integration gaps)*
*Third audit: 2026-03-09 (with integration checker, 4 critical gaps found → Phases 49-50 created)*
*Fourth audit: 2026-03-09 (post Phase 49-50 — all requirements satisfied, 3 tech debt items remain)*
*Final audit: 2026-03-09 (post Phase 51 — all gaps resolved, milestone PASSED)*
