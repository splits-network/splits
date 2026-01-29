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
  - `message_retention_days`: **730** (24 months)
  - `attachment_retention_days`: **365**
  - `audit_retention_days`: **1095** (36 months)

---

## Implementation Phases

### Phase 0 — Alignment & Specs (Planning)

- [x] Confirm retention policy and deletion handling
- [x] Confirm archive policy (A vs B)
- [x] Confirm request rules for recruiter/company inbound
- [x] Confirm link/attachment handling pre-acceptance
- [x] Confirm realtime delivery approach + infra owner

### Phase 1 — Data Model & API (Backend Core)

- [x] Apply chat schema from `docs/originals/splits_chat_full_guidance/chat_schema_reference_ddl.md`
- [x] Add retention config defaults (message 730 days, attachment 365, audit 1095)
- [x] Optional: job runner bookkeeping for retention visibility
- [x] Implement service layer: create/find conversation (de-dupe), list, send, accept/decline
- [x] Enforce idempotent send via `clientMessageId`
- [x] Implement block/report workflows with audit logging
- [x] Implement moderation endpoints + admin actions
- [x] Add rate limits and abuse throttles
- [x] Add notification triggers (in-app + email)

### Phase 2 — Realtime & Notifications

- [x] Redis pub/sub event wiring (message/conversation/attachment events)
- [x] Resync strategy via REST on reconnect/visibility changes
- [x] WebSocket gateway service (auth, subscribe, fanout)
- [x] Presence + typing (rate limited)
- [x] Read state sync (lastReadAt updates)
- [x] Notification batching/limits
- [x] Instrumentation: send rate, fail rate, report rate

### Phase 3 — Frontend (splits.network)

- [x] Messages nav entry
- [x] Inbox list with filters + search input
- [x] Requests tab (if enabled for role)
- [x] Conversation view with context banner
- [x] Composer disabled states (requests, block)
- [x] Actions: mute, archive, block, report
- [x] Empty states + error handling
- [x] Chat entry points: candidates list (grid + table), candidate detail, browse detail
- [x] Chat entry points: applications list (grid + table) + application detail header
- [x] Invitations intentionally excluded from chat entry points
- [x] Disabled chat buttons include tooltip when user identity missing

### Phase 6 — QA, Rollout, Metrics

### Phase 4 — Frontend (applicant.network)

- [x] Inbox list with filters + search input
- [x] Requests tab with trust indicators
- [x] Conversation view with context banner
- [x] Composer disabled states (requests, block)
- [x] Actions: mute, archive, block, report
- [x] Empty states + error handling
- [x] Chat entry points: applications list (card + table) + application detail actions
- [x] Dashboard recent applications include chat button (candidate app)

### Phase 5 — Moderation Tooling

- [x] Reports queue view
- [x] Evidence bundle viewer (last N messages)
- [x] Admin actions (warn, suspend, ban messaging)
- [x] Audit log for moderation actions

### Phase 6 — QA, Rollout, Metrics

- [x] Unit tests: idempotent send, block enforcement
- [ ] Integration tests: request flow, notification flow
- [ ] Load test: inbox list + burst send
- [ ] Feature flags for staged rollout
- [x] Metrics dashboards + alerts

---

## Detailed Task Breakdown

## Section 1: Database & Schema

### 1.1 Conversations

- [x] `conversations` table with context fields (jobId, applicationId, companyId)
- [x] De-dupe constraint for participant pair + context key
- [x] `last_message_at` + `created_at`

### 1.2 Participants

- [x] `conversation_participants` with per-user state:
    - [x] `last_read_at`
    - [x] `muted_at`
    - [x] `archived_at`
    - [x] `request_state`
    - [x] `role_snapshot`

### 1.3 Messages

- [x] `messages` table with `client_message_id` for idempotency
- [x] Metadata jsonb for moderation flags and link detection
- [x] Index on `(conversation_id, created_at)`

### 1.4 Blocks & Reports

- [x] `user_blocks` table (global)
- [x] `chat_reports` table with evidence pointer
- [x] `moderation_actions` table for audit trail

### 1.5 Retention Config

- [x] `message_retention_days` default 730 (configurable)
- [x] `attachment_retention_days` default 365 (configurable)
- [x] `audit_retention_days` default 1095 (configurable)
- [x] Optional job runner bookkeeping table for retention runs

---

## Section 2: Backend Services & APIs

### 2.1 Conversation APIs

- [x] POST `/chat/conversations` (create/find with deterministic pair ordering + context de-dupe)
- [x] GET `/chat/conversations` (filters: inbox/requests/archived/unread, pagination)
- [x] GET `/chat/conversations/:id/messages` (cursor pagination)

### 2.2 Messaging APIs

- [x] POST `/chat/conversations/:id/messages` (idempotent send)
- [x] GET `/chat/conversations/:id/messages?after=messageId&limit=50` (cursor)
- [x] Message edit + redaction flags (system/admin only)
- [x] Enforce access checks per message send
- [x] Prevent sends when blocked or request pending

### 2.3 Requests & Actions

- [x] POST `/chat/conversations/:id/accept`
- [x] POST `/chat/conversations/:id/decline`
- [x] POST `/chat/conversations/:id/mute` / DELETE `/chat/conversations/:id/mute`
- [x] POST `/chat/conversations/:id/archive` / DELETE `/chat/conversations/:id/archive`
- [x] POST `/chat/blocks` / DELETE `/chat/blocks/:blockedUserId`
- [x] POST `/chat/reports` (bundle last N messages + metadata)
- [x] Update read receipt + maintain unread_count transactionally

### 2.4 Moderation APIs

- [x] GET `/admin/chat/reports`
- [x] POST `/admin/chat/reports/:id/action` (warn/suspend/ban)
- [x] GET `/admin/chat/audit`

### 2.5 Attachments (Flagged Off)

- [x] `POST /chat/attachments/init` (signed upload URL)
- [x] `POST /chat/attachments/:id/complete` (mark uploaded + enqueue scan)
- [x] `GET /chat/attachments/:id/download-url` (signed download URL)
- [x] RabbitMQ scan job worker (mark `pending_scan` → `available`/`blocked`)

---

## Section 3: Realtime & Notifications

### 3.1 Realtime

- [x] Publish events on: message created/updated, conversation updated, attachment updated
- [x] Redis channels: `user:{userId}` and `conv:{conversationId}`
- [x] Subscribe and update inbox counts
- [x] Presence tracking via Redis keys with TTL
- [x] Typing events (ephemeral)
- [x] Read receipts (persisted + event)
- [x] Resync on reconnect/tab focus/heartbeat miss

### 3.2 Resync Strategy (Mandatory)

- [x] Client stores `lastSeenMessageId` per conversation
- [x] On reconnect/tab-visible/gateway reconnect/heartbeat miss:
  - [x] `GET /chat/conversations/:id/messages?after=<lastSeenMessageId>`
  - [x] Refresh inbox list

### 3.2 Notifications

- [x] In-app notifications on new message
- [x] Email notifications with rate limits
- [x] Respect mute + user preferences

---

## Section 4: Frontend UX (Shared Requirements)

- [x] Consistent conversation IDs across apps
- [x] Context banner with job/application/company
- [x] Requests UX with accept/decline/block/report
- [x] Neutral block copy (“Message could not be delivered.”)
- [x] Empty states and error states per UX doc

---

## Section 5: Security, Compliance, Observability

- [x] Authorization checks for every read/write
- [x] Rate limiting + abuse throttles
- [x] Retention policy enforcement (configurable duration; no deletion in MVP)
- [x] Metrics: send rate, fail rate, report rate
- [x] Logging for moderation actions
- [x] WS + Redis operational metrics (connections, pubsub throughput, auth failures)
  - [x] Realtime health endpoint (lightweight)

---

## Section 6: WebSocket Gateway (AKS)

- [x] Auth handshake (Clerk JWT validation)
- [x] Always subscribe to `user:{userId}`
- [x] Subscribe to `conv:{id}` for open conversation (optional inbox preload)
- [x] Fanout Redis pub/sub → sockets
- [x] Client inbound events:
  - [x] typing started/stopped (rate limited)
  - [x] presence ping (update Redis TTL)
  - [x] read receipts (forward to Chat API)

---

## Section 7: RabbitMQ Workers

- [x] Email notifications worker (respect mute + request state, batch sends)
- [x] Attachment scanning worker (update DB status + publish `attachment.updated`)
- [x] Optional moderation automation worker (spam wave heuristics)

---

## Environment & Local Dev

- [x] `docker-compose.yml` includes `chat-service`, `chat-gateway`, and chat workers
- [x] Dockerfiles added for `chat-service` and `chat-gateway`
- [x] Portal + Candidate env include `NEXT_PUBLIC_CHAT_GATEWAY_URL`

---

## Section 8: Retention Jobs

- [x] Nightly message retention: redact content older than retention
- [x] Attachment retention: delete blob + mark deleted
- [x] Audit retention: archive/delete per policy
- [x] Publish updates (message.updated / attachment.updated)

---

## Section 9: Test Suite (Demo-Proofing)

- [x] Idempotent send
- [x] Conversation de-dupe by pair + context
- [x] Request gating (1 message max until accepted; links/attachments blocked)
- [x] Block enforcement (server-side)
- [x] Unread count + read receipt correctness
- [x] Resync path works (unit-level)

---

## Section 10: API + Events Spec (Source of Truth)

### 10.1 REST API

- [x] `POST /chat/conversations` (create/find)
  - [x] Deterministic participant ordering + context de-dupe
- [x] `GET /chat/conversations?filter=inbox|requests|archived&cursor=...`
- [x] `GET /chat/conversations/:id/messages?after=messageId&limit=50`
- [x] `POST /chat/conversations/:id/messages` (idempotent)
- [x] `POST /chat/conversations/:id/accept`
- [x] `POST /chat/conversations/:id/decline`
- [x] `POST /chat/conversations/:id/mute` / `DELETE /chat/conversations/:id/mute`
- [x] `POST /chat/conversations/:id/archive` / `DELETE /chat/conversations/:id/archive`
- [x] `POST /chat/blocks` / `DELETE /chat/blocks/:blockedUserId`
- [x] `POST /chat/reports`
- [x] `POST /chat/attachments/init`
- [x] `POST /chat/attachments/:id/complete`
- [x] `GET /chat/attachments/:id/download-url`

### 10.2 WebSocket Gateway

- [x] Connect: `wss://<host>/ws/chat?token=<jwt>`
- [x] Server hello: `{ type: "hello", eventVersion: 1, serverTime: "iso" }`
- [x] Subscribe: `{ type: "subscribe", channels: ["user:uuid", "conv:uuid"] }`

Server → Client events:
- [x] `message.created`
- [x] `message.updated`
- [x] `conversation.updated`
- [x] `conversation.requested` / `conversation.accepted` / `conversation.declined`
- [x] `typing.started` / `typing.stopped`
- [x] `presence.updated`
- [x] `read.receipt`

Client → Server events:
- [x] `typing.started` / `typing.stopped`
- [x] `presence.ping`
- [x] `read.receipt`

### 10.3 Redis Channels

- [x] `user:{userId}`
- [x] `conv:{conversationId}`
- [x] Presence key: `presence:user:{userId}` (TTL)

## Acceptance Criteria (MVP)

- [ ] Users can start or find a 1:1 conversation tied to job/application
- [ ] Requests flow prevents unsolicited multi-message spam
- [ ] Block/report works and is enforced server-side
- [ ] Inbox and conversation views match UX spec
- [ ] Notifications delivered with mute respected
- [ ] Audit trail exists for reports and moderation actions

---

## Open Questions

- Whether future deletion allowance will be added (admin-only vs user-request)
