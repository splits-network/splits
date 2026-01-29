# Internal Chat System — Implementation Tracker

**Feature**: Internal Chat (Recruiter ↔ Company ↔ Candidate)  
**Priority**: 🔥 HIGH  
**Status**: 🧭 Planning  
**Created**: January 29, 2026  
**Last Updated**: January 29, 2026

---

## Overview

Implement a unified, safe, and auditable chat system across **splits.network** (recruiter/company) and **applicant.network** (candidate). The system supports 1:1 conversations, context-aware threads, requests (anti-spam), notifications, and moderation workflows.

**Source Docs**:

- `docs/originals/chat_feature.md`
- `docs/originals/chat_ux.md`
- `docs/originals/chat_requirements.md`
- `docs/originals/splits_chat_full_guidance/chat_full_architecture.md`
- `docs/originals/splits_chat_full_guidance/chat_demo_script.md`
- `docs/originals/splits_chat_full_guidance/chat_api_and_events.md`
- `docs/originals/splits_chat_full_guidance/chat_gateway_implementation.md`
- `docs/originals/splits_chat_full_guidance/chat_ops_runbook.md`
- `docs/originals/splits_chat_full_guidance/chat_schema_reference_ddl.md`
- `docs/implementation-plans/chat-system-implementation-tracker.md`

---

## Assumptions (Confirmed)

- Initial launch is **1:1 only** with Requests enabled by default for everyone.
- Archive policy uses **Option B** (archived suppresses inbound until unarchived).
- Block is **global** (user-to-user), not per-thread.
- Realtime delivery uses **WebSocket Gateway + Redis Pub/Sub** with REST source-of-truth.
- Notifications: **in-app + email** only (no push in MVP).
- Attachments: **implemented but disabled** behind a feature flag.
- Read receipts: optional (user setting or per-user default off).
- No “acting as” identities; users have a **single role** only.
- Retention is **configurable** system-wide; **no deletions** allowed in initial release.

---

## Implementation Phases

### Phase 0 — Alignment & Specs (Planning)

- [x] Confirm retention policy and deletion handling
- [x] Confirm archive policy (A vs B)
- [x] Confirm request rules for recruiter/company inbound
- [x] Confirm link/attachment handling pre-acceptance
- [x] Confirm realtime delivery approach + infra owner

### Phase 1 — Data Model & API (Backend Core)

- [ ] Create chat tables: conversations, participants, messages, blocks, reports
- [ ] Add indexes for conversation lists + message pagination
- [ ] Implement service layer: create/find conversation (de-dupe), list, send, accept/decline
- [ ] Enforce idempotent send via `clientMessageId`
- [ ] Implement block/report workflows with audit logging
- [ ] Implement moderation endpoints + admin actions
- [ ] Add rate limits and abuse throttles
- [ ] Add notification triggers (in-app + email)

### Phase 2 — Realtime & Notifications

- [ ] WebSocket gateway service (auth, subscribe, fanout)
- [ ] Redis pub/sub backplane + presence keys (TTL heartbeat)
- [ ] REST resync contract on reconnect/visibility change
- [ ] Read state sync (lastReadAt updates)
- [ ] Typing + presence events (rate limited)
- [ ] Notification batching/limits
- [ ] Instrumentation: send rate, fail rate, report rate

### Phase 3 — Frontend (splits.network)

- [ ] Messages nav entry
- [ ] Inbox list with filters + search input
- [ ] Requests tab (if enabled for role)
- [ ] Conversation view with context banner
- [ ] Composer disabled states (requests, block)
- [ ] Actions: mute, archive, block, report
- [ ] Empty states + error handling

### Phase 4 — Frontend (applicant.network)

- [ ] Inbox list with filters + search input
- [ ] Requests tab with trust indicators
- [ ] Conversation view with context banner
- [ ] Composer disabled states (requests, block)
- [ ] Actions: mute, archive, block, report
- [ ] Empty states + error handling

### Phase 5 — Moderation Tooling

- [ ] Reports queue view
- [ ] Evidence bundle viewer (last N messages)
- [ ] Admin actions (warn, suspend, ban messaging)
- [ ] Audit log for moderation actions

### Phase 6 — QA, Rollout, Metrics

- [ ] Unit tests: idempotent send, block enforcement
- [ ] Integration tests: request flow, notification flow
- [ ] Load test: inbox list + burst send
- [ ] Feature flags for staged rollout
- [ ] Metrics dashboards + alerts

---

## Detailed Task Breakdown

## Section 1: Database & Schema

### 1.1 Conversations

- [ ] `conversations` table with context fields (jobId, applicationId, companyId)
- [ ] De-dupe constraint for participant pair + context key
- [ ] `last_message_at` + `created_at`

### 1.2 Participants

- [ ] `conversation_participants` with per-user state:
    - [ ] `last_read_at`
    - [ ] `muted_at`
    - [ ] `archived_at`
    - [ ] `request_state`
    - [ ] `role_snapshot`

### 1.3 Messages

- [ ] `messages` table with `client_message_id` for idempotency
- [ ] Metadata jsonb for moderation flags and link detection
- [ ] Index on `(conversation_id, created_at)`

### 1.4 Blocks & Reports

- [ ] `user_blocks` table (global)
- [ ] `chat_reports` table with evidence pointer
- [ ] `moderation_actions` table for audit trail

---

## Section 2: Backend Services & APIs

### 2.1 Conversation APIs

- [ ] POST `/chat/conversations` (create/find with de-dupe)
- [ ] GET `/chat/conversations` (filters: inbox/requests/archived/unread)
- [ ] GET `/chat/conversations/:id/messages` (cursor pagination)

### 2.2 Messaging APIs

- [ ] POST `/chat/conversations/:id/messages` (idempotent send)
- [ ] Enforce access checks per message send
- [ ] Prevent sends when blocked or request pending

### 2.3 Requests & Actions

- [ ] POST `/chat/conversations/:id/accept`
- [ ] POST `/chat/conversations/:id/decline`
- [ ] POST `/chat/conversations/:id/mute`
- [ ] POST `/chat/conversations/:id/archive`
- [ ] POST `/chat/block` / DELETE `/chat/block`
- [ ] POST `/chat/reports`

### 2.4 Moderation APIs

- [ ] GET `/admin/chat/reports`
- [ ] POST `/admin/chat/reports/:id/action` (warn/suspend/ban)
- [ ] GET `/admin/chat/audit`

### 2.5 Attachments (Flagged Off)

- [ ] `POST /chat/attachments/init` (signed upload URL)
- [ ] `POST /chat/attachments/:id/complete` (mark uploaded + enqueue scan)
- [ ] `GET /chat/attachments/:id/download-url` (signed download URL)
- [ ] RabbitMQ scan job worker (mark `pending_scan` → `available`/`blocked`)

---

## Section 3: Realtime & Notifications

### 3.1 Realtime

- [ ] Publish message events on send (Redis channels: `user:{id}`, `conv:{id}`)
- [ ] Subscribe and update inbox counts
- [ ] Presence tracking via Redis keys with TTL
- [ ] Typing events (ephemeral)
- [ ] Read receipts (persisted + event)
- [ ] Resync on reconnect/tab focus

### 3.2 Notifications

- [ ] In-app notifications on new message
- [ ] Email notifications with rate limits
- [ ] Respect mute + user preferences

---

## Section 4: Frontend UX (Shared Requirements)

- [ ] Consistent conversation IDs across apps
- [ ] Context banner with job/application/company
- [ ] Requests UX with accept/decline/block/report
- [ ] Neutral block copy (“Message could not be delivered.”)
- [ ] Empty states and error states per UX doc

---

## Section 5: Security, Compliance, Observability

- [ ] Authorization checks for every read/write
- [ ] Rate limiting + abuse throttles
- [ ] Retention policy enforcement (configurable duration; no deletion in MVP)
- [ ] Metrics: send rate, fail rate, report rate
- [ ] Logging for moderation actions
- [ ] WS + Redis operational metrics (connections, pubsub throughput, auth failures)

---

## Acceptance Criteria (MVP)

- [ ] Users can start or find a 1:1 conversation tied to job/application
- [ ] Requests flow prevents unsolicited multi-message spam
- [ ] Block/report works and is enforced server-side
- [ ] Inbox and conversation views match UX spec
- [ ] Notifications delivered with mute respected
- [ ] Audit trail exists for reports and moderation actions

---

## Open Questions

- Retention policy details: default duration (config value) and future deletion allowance
