# Splits Network Chat — Full Self‑Hosted Implementation Guidance (WebSockets + Redis + RabbitMQ)

**Apps**
- **splits.network**: Recruiter + Business (Company) users
- **applicant.network**: Candidates only

**Goal**
Ship a fully featured, self-hosted chat system suitable for demos and production: real-time messaging, presence, typing, read receipts, message requests, safety controls, attachments, moderation hooks, and team-readiness. This guidance assumes AKS + NGINX Ingress, and that you already run Redis + RabbitMQ in-cluster.

---

## 1) Architecture Overview

### 1.1 High-level components

**Chat API (HTTP)**
- Source of truth for:
  - Conversations, messages, per-user conversation state
  - Permissions/authorization (critical)
  - File metadata + signed URL issuance
  - Moderation/reporting endpoints
- Writes to Postgres (recommended) and emits events to Redis and RabbitMQ.

**Realtime Gateway (WebSockets)**
- Manages WebSocket connections:
  - Auth during handshake
  - Subscriptions (which conversations/user channels)
  - Pushes realtime events to clients
  - Receives client events: typing, read receipts, presence pings
- Minimal business logic; never trusts the client for authorization.

**Redis (Realtime Backplane + Presence)**
- Pub/sub (fanout across gateway pods)
- Presence state (ephemeral)
- Optionally Redis Streams for durable realtime events if you want replay.

**RabbitMQ (Async Work Queue)**
- Email notifications
- Attachment scanning pipeline
- Moderation workflows (async analysis)
- Analytics/event ingestion (optional)
- Search indexing jobs (if you add search)

**Postgres (Primary datastore)**
- Conversations, messages, user state, blocks, reports, attachments metadata
- Strong indexing and row-level constraints for idempotency and dedupe

---

## 2) Real-time Event Model

### 2.1 Event design principles
- **DB is the truth**: realtime events are hints; clients must be able to resync.
- **Idempotent clients**: every message has a stable `messageId` and optional `clientMessageId`.
- **Small payloads**: send pointers (IDs) + minimal metadata, not full history.
- **Explicit versions**: include `eventVersion` so you can evolve schemas without breaking older clients.

### 2.2 Core events (server → client)
- `message.created`
- `message.updated` (edited, moderated, redacted)
- `message.deleted` (rare; prefer redaction flags)
- `conversation.updated` (lastMessageAt, counts, participant changes)
- `conversation.requested` / `conversation.accepted` / `conversation.declined`
- `presence.updated` (online/away/offline)
- `typing.started` / `typing.stopped`
- `read.receipt` (per-user lastReadAt or lastReadMessageId)
- `block.created` / `block.removed` (only to blocker; others get neutral behavior)
- `system.notice` (deliverability issues, policy warnings)

### 2.3 Client events (client → server via WS)
- `typing.started/stopped` (rate-limited)
- `read.receipt` (debounced)
- `presence.ping` (heartbeat)
- (Optional) `message.send` over WS — **not recommended** unless you’re ready to handle retries/acks over WS.
  - Recommended: send messages over HTTP POST; receive realtime via WS.

---

## 3) Subscription Strategy (Two Apps)

### 3.1 Connection auth
- WebSocket handshake includes a short-lived bearer token (Clerk JWT or your API token).
- Gateway validates token and derives:
  - `userId`
  - `role`
  - `tenant/company context` (if applicable)

### 3.2 Subscriptions hookup
Upon connect:
1. Gateway fetches “watch list” from Chat API:
   - current inbox conversation IDs (active + requests)
2. Gateway subscribes user to:
   - `user:{userId}` channel (direct events like requests, blocks)
   - `conv:{conversationId}` channels for active threads
3. Client can request subscription changes:
   - when opening a conversation, add `conv:{id}`
   - when closing, optionally keep subscribed or drop for scale

### 3.3 Multi-tab / multi-device
- Multiple connections per user are allowed.
- Presence reflects “any active connection”
- Read receipts are per-user (not per-device) for simplicity.

---

## 4) Presence, Typing, and Read Receipts

### 4.1 Presence (Redis)
Model:
- `presence:user:{userId} = {status, lastSeenAt}`
- Set on connect; refresh via heartbeat; expire via TTL.

Implementation notes:
- TTL: 60–120 seconds
- Heartbeat: every 20–30 seconds
- Status:
  - `online`: active heartbeat
  - `away`: tab hidden > N seconds (client signals) or no typing for N minutes
  - `offline`: TTL expired

### 4.2 Typing indicators
- Sent as ephemeral events; **never persisted**.
- Rate limit per conversation per user (e.g., max 1 event/2 seconds).
- Auto-timeout: if no `typing` event in 6 seconds, stop.

### 4.3 Read receipts (persisted)
Persist a per-user per-conversation pointer:
- `lastReadAt` and/or `lastReadMessageId`

Rules:
- Update on:
  - conversation open + scroll to bottom
  - debounce every ~2 seconds
- Emit event to other participant(s) (if policy allows).
Privacy knobs:
- Candidates may be allowed to hide read receipts by default if desired.
- For demos, showing read receipts looks “modern”; decide per role.

---

## 5) Message Requests + Safety Controls

### 5.1 Requests
- Default: first message from non-connected party creates conversation in `request` state for recipient.
- Recipient must `accept` before:
  - sender can send more than one message
  - links become clickable
  - attachments allowed

### 5.2 Block / Report
- Block is server-enforced:
  - reject sends before insert
- Block UX is neutral for blocked party:
  - deliver “Message could not be delivered.”

Report captures:
- category + description
- evidence bundle (last N messages)
- metadata: participants, timestamps, job/application context

---

## 6) Attachments (Fully Featured)

### 6.1 Storage
- Store file objects in blob storage (Azure Storage or S3-compatible). Self-hosted blob is possible, but usually not worth it.
- Store metadata in Postgres.

### 6.2 Security
- Upload via signed URL:
  - Chat API issues signed upload URL and returns attachment record ID
- Download via signed URL:
  - Chat API issues short-lived signed download URL after permission check

### 6.3 Scanning pipeline
- Upload completion emits RabbitMQ job:
  - “scan attachment”
- Until scanned:
  - attachment marked `pending_scan`
  - download disabled
If scan fails:
  - mark `blocked`
  - notify uploader
If passes:
  - mark `available`

---

## 7) Moderation & Abuse Detection

### 7.1 Minimum moderation tooling
- Admin UI / internal endpoints to:
  - view reports
  - inspect evidence
  - suspend messaging
  - ban user
- Audit logs for admin actions.

### 7.2 Automated signals (optional but recommended)
- Rate limit violations
- High outbound request volume
- Link-heavy messages in requests
- Report frequency thresholds

---

## 8) Scaling & Reliability

### 8.1 Gateway scaling
- Horizontal pod autoscaling based on:
  - active connections per pod
  - CPU/memory
- Target: benchmark in your stack.

### 8.2 Backplane durability
- Redis pub/sub is fast but not durable.
- Add resync endpoints and client reconnect logic.
- If you want durability/replay, use Redis Streams:
  - append events with IDs; clients can resume from last event ID.

### 8.3 Reconnect storm protection
- Exponential backoff on client reconnect
- Jitter
- Server-side connection caps per user (e.g., max 8 connections)

---

## 9) AKS + NGINX Ingress Notes (WebSockets)
- Ensure websocket upgrades supported (NGINX ingress typically does).
- Tune timeouts:
  - `proxy-read-timeout` and `proxy-send-timeout` > heartbeat interval * 3
- Consider separate ingress path:
  - `/ws/chat` routed to gateway service
- Consider rate limiting at ingress for abusive clients.

---

## 10) Demo Readiness Checklist
To look impressive in demos:
- Messaging feels instant (WS)
- Unread counts update instantly
- Typing indicator
- Presence dot
- Read receipts
- Requests tab (candidate side) with accept/decline
- Block/report in overflow menu
- Context banner (job title/company) pinned
- Attachments upload (at least PDF) with “Scanning…” then “Available”

---

## 11) Recommended Implementation Order (Full Feature Path)
1. Postgres schema + core REST APIs
2. WS gateway + Redis pub/sub fanout
3. Presence + typing indicators
4. Read receipts
5. Requests flow
6. Notifications + RabbitMQ workers
7. Attachments + scanning
8. Moderation + reporting UI endpoints
9. Observability + dashboards

---

## 12) Operational Ownership
- **Chat team**: API + event semantics + correctness
- **Platform/infra**: ingress, autoscaling, Redis reliability, dashboards/runbooks
- If the same people: document it anyway; “Future You” will thank you.
