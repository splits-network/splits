---
milestone: v10.0
audited: 2026-03-09
status: gaps_found
scores:
  requirements: 17/20
  phases: 5/5
  integration: 14/16
  flows: 2/3
gaps:
  requirements:
    - "MIG-01: SessionStorage key mismatch blocks video join flow — interview redirects to video app cannot complete"
    - "MIG-02: Magic link join broken by same sessionStorage key mismatch"
    - "CALL-04: 24h/1h reminder emails never sent (missing call.reminder event binding)"
  integration:
    - "SessionStorage key mismatch: join-flow.tsx writes call:${id}, call page reads call-${id}"
    - "Event name mismatch: video-service publishes call.recording_ready, notification-service binds call.recording.ready"
    - "Missing event binding: call.reminder not subscribed in notification-service"
  flows:
    - "Recruiter call flow: breaks at video join (sessionStorage) and recording notification (event name)"
tech_debt:
  - phase: 46-interview-migration
    items:
      - "Dead interview auth-skip rules in gateway index.ts (~50 lines of regex checks for removed routes)"
      - "Dead interview hooks in shared-video (useCallNotes, useRecordingState) pointing to deleted API routes"
      - "Legacy S3 bucket name 'interview-recordings' in video-service and ai-service (cosmetic, requires storage migration to rename)"
---

# v10.0 Milestone Audit — Video Platform & Recruiting Calls

## Scores

| Category | Score | Status |
|----------|-------|--------|
| Requirements | 17/20 | Gaps found |
| Phases complete | 5/5 | All plans executed |
| Cross-phase wiring | 14/16 | 2 broken connections |
| E2E flows | 2/3 | 1 flow broken |

## Requirements Coverage

| Requirement | Phase | Status | Notes |
|-------------|-------|--------|-------|
| DATA-01 | 42 | Satisfied | calls table with call_type enum, polymorphic entity linking |
| DATA-02 | 42 | Satisfied | interviews.call_id FK existed, tables dropped in Phase 46 |
| DATA-03 | 42 | Satisfied | All artifacts on call record |
| APP-01 | 43 | Satisfied | apps/video/ Next.js app |
| APP-02 | 43 | Satisfied | Host header brand detection |
| APP-03 | 43 | **Blocked** | Magic-link auth broken by sessionStorage key mismatch |
| APP-04 | 43 | Satisfied | K8s deployment with dual-subdomain ingress + TLS |
| CALL-01 | 44 | Satisfied | CallCreationModal with participant picker and entity linker |
| CALL-02 | 44 | Satisfied | Equal peer-to-peer roles |
| CALL-03 | 44 | Satisfied | Google Calendar integration |
| CALL-04 | 44 | **Partial** | Email confirmation works, 5-min reminder works, 24h/1h reminders broken |
| HIST-01 | 44 | Satisfied | Portal Calls section with filtering |
| HIST-02 | 44 | Satisfied | Call detail with recording, transcript, AI summary, notes |
| EXP-01 | 44 | Satisfied | In-call context panel with entity data |
| AI-04 | 45 | Satisfied | AI summaries on call record |
| AI-05 | 45 | Satisfied | Per-call-type summarizer prompts |
| AI-06 | 45 | Satisfied | Entity context in AI prompts |
| MIG-01 | 46 | **Blocked** | Video join flow broken by sessionStorage key mismatch |
| MIG-02 | 46 | **Blocked** | Same root cause as MIG-01 |
| MIG-03 | 46 | Satisfied | Interview tables dropped, call system owns all data |

## Critical Bugs (P0)

### 1. SessionStorage Key Mismatch — Blocks All Video Calls

**Files:**
- `apps/video/src/components/join-flow.tsx` line 23: writes key `call:${result.call.id}`
- `apps/video/src/app/call/[callId]/page.tsx` line 24: reads key `call-${callId}`

**Impact:** After token exchange and identity confirmation, session data is stored with colon separator but read with hyphen separator. Users cannot join any video call — they always get redirected to error page.

**Fix:** Change `join-flow.tsx` to write `call-${id}` (match the reader).

### 2. Event Name Mismatch — Recording Notifications Never Sent

**Files:**
- `services/video-service/src/v2/calls/call-recording-webhook.ts` publishes `call.recording_ready`
- `services/notification-service/src/domain-consumer.ts` binds `call.recording.ready` (dot instead of underscore)

**Impact:** "Recording ready" email and in-app notifications never fire. AI pipeline works correctly (uses matching underscore name).

**Fix:** Change notification-service binding from `call.recording.ready` to `call.recording_ready`.

## Integration Gaps (P1)

### 3. Missing call.reminder Event Binding

**Publisher:** `services/call-service/src/v2/scheduler.ts` publishes `call.reminder` for 24h/1h reminders
**Subscriber:** notification-service does NOT bind to `call.reminder` — only binds `call.starting_soon` (5-min)

**Impact:** 24h and 1h reminder emails silently lost. Template and handler code exists but never triggers.

**Fix:** Add `call.reminder` binding and handler in notification-service domain consumer.

## Tech Debt (P2-P3)

### Phase 46: Interview Migration Cleanup

| Priority | Item | Files |
|----------|------|-------|
| P2 | Dead interview auth-skip rules (~50 lines) | `services/api-gateway/src/index.ts` lines 476-531 |
| P2 | Dead interview hooks (useCallNotes, useRecordingState) | `packages/shared-video/src/hooks/` |
| P3 | Legacy bucket name `interview-recordings` | `services/video-service/`, `services/ai-service/` |

## E2E Flow Analysis

### Flow 1: Recruiter Call → Schedule → Join → Record → AI Summary
**Status: BROKEN** at video join (sessionStorage key mismatch) and recording notification (event name mismatch)

| Step | Status |
|------|--------|
| Create call via modal | Connected |
| Notification emails sent | Connected |
| Calendar integration | Connected |
| 5-min reminder | Connected |
| 24h/1h reminders | **Broken** (missing binding) |
| Join via magic link | **Broken** (sessionStorage mismatch) |
| LiveKit recording | Connected |
| AI transcription + summary | Connected |
| Recording-ready notification | **Broken** (event name mismatch) |
| Portal call detail view | Connected |

### Flow 2: Application Detail → Calls Tab
**Status: COMPLETE** — entity-linked calls, Schedule Call shortcut, stats all working

### Flow 3: Post-Migration Data Accessibility
**Status: COMPLETE** — interview tables dropped cleanly, call system owns all data

---
*Audited: 2026-03-09*
