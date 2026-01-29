# Splits Network Chat — Requirements Document (PRD-Level)

**Platforms**
- **splits.network**: Recruiters + Business (Company) users
- **applicant.network**: Candidates only

This document specifies functional and non-functional requirements to implement a robust, safe, and scalable chat system.

---

## 1. Scope

### In Scope
- 1:1 messaging across user types
- Requests (anti-spam) + acceptance workflow
- Inbox + conversation views (both apps)
- Mute/Archive/Block/Report with preserved history
- Context linking to jobs/applications/companies
- Notifications (in-app + email)
- Moderation tooling (minimum viable)

### Out of Scope (for MVP)
- Group chats with external guests
- Voice/video calling
- End-to-end encryption
- Full ATS workflow replacement

---

## 2. Roles & Permissions

### Roles
- Candidate (applicant.network)
- Recruiter (splits.network)
- Company user (splits.network)
- Admin/Moderator (internal)

### Permission Principles
- Users can only read conversations where they are a participant.
- Admin/moderators may access limited data only when a report exists (least privilege).
- Company users only see company-related context including jobs they are authorized to view (based on existing access policy).
- Recruiters only see candidate/company threads tied to jobs/placements they are authorized to access.

---

## 3. Functional Requirements

### FR-1 Conversation Creation / Retrieval
1. Users can start a conversation from:
   - Job detail page (preferred)
   - Application detail page (preferred)
   - Profile pages (optional)
2. System must de-duplicate conversations:
   - For the same participant pair AND same context key (e.g., applicationId), return existing conversation.
3. System must support conversation “context”:
   - jobId, applicationId, companyId, recruiterId, candidateId (nullable fields)

**Acceptance Criteria**
- Starting chat from job/app always opens a single deterministic thread for that context.
- Users cannot create a thread that bypasses access controls.

---

### FR-2 Messaging (Send/Receive)
1. Users can send text messages.
2. Server must enforce authorization on every send.
3. Message send must be idempotent using a `clientMessageId` to prevent duplicates on retry.
4. Messages are stored with:
   - senderId
   - conversationId
   - body
   - createdAt
   - optional metadata (links present, flagged content, etc.)

**Acceptance Criteria**
- Duplicate sends with same `clientMessageId` produce only one persisted message.
- Ordering is consistent and stable across pagination.

---

### FR-3 Message Requests (Recommended Default)
1. First message from a non-connected party lands in **Requests** for the recipient.
2. Recipient actions:
   - Accept → conversation moves to Inbox and full messaging allowed
   - Decline → conversation hidden (policy-defined), sender gets neutral failure or “not accepted”
   - Block/Report shortcuts available
3. Until accepted:
   - Limit number of messages (e.g., 1 initial message max)
   - Disable attachments
   - Optionally disable clickable links

**Acceptance Criteria**
- Candidate can safely accept/decline without being forced into conversation.
- Recruiter/company cannot spam unlimited messages without acceptance.

---

### FR-4 Inbox & Conversation List
1. Inbox lists conversations with:
   - participant display name + avatar
   - role badge
   - context preview (job title/company)
   - last message snippet
   - last activity timestamp
   - unread count indicator
2. Sorting: newest activity first.
3. Pagination / infinite scroll.

Filters:
- Unread
- Requests
- Archived
- By job/company (when context exists)

**Acceptance Criteria**
- Inbox loads quickly and supports pagination.
- Unread state updates correctly when viewing messages.

---

### FR-5 Conversation View
1. Header shows:
   - participant identity + role badge(s)
   - trust indicators (verified email/company domain, etc. if available)
   - pinned context banner (job title, company, stage)
2. Timeline shows message bubbles with timestamps.
3. Composer supports:
   - multiline input
   - send on Enter (configurable)
   - disabled states (blocked, request not accepted)
4. Pagination for history:
   - load older messages

**Acceptance Criteria**
- Context is always visible when a conversation is context-linked.
- Composer clearly communicates why sending may be disabled.

---

### FR-6 Mute
1. User can mute a conversation.
2. Muted conversation:
   - no email/push notifications for that user
   - still shows unread counts (configurable)

**Acceptance Criteria**
- Muting does not affect the other participant.
- Muting persists across sessions.

---

### FR-7 Archive / Close
1. User can archive (close) a conversation.
2. Archived conversations:
   - removed from primary inbox
   - visible in Archived view
   - history preserved

Policy options (choose one):
- A) Archived still receives new messages (thread reappears)
- B) Archived suppresses new inbound until unarchived (soft lock)

**Acceptance Criteria**
- Archiving never deletes history.
- UI makes archived state discoverable and reversible.

---

### FR-8 Block
1. User can block another user globally (recommended) or per conversation.
2. Blocking prevents new messages from blocked party (server-side).
3. Blocked party receives neutral failure message.

**Acceptance Criteria**
- Block is enforced even if client is manipulated.
- Block does not destroy history for blocker.

---

### FR-9 Report
1. User can report a conversation/user.
2. Report must capture:
   - category (harassment, spam, fraud, etc.)
   - free-form description
   - evidence bundle (last N messages + metadata)
3. Moderation workflow:
   - queue reports
   - track status (new/in review/resolved)
   - allow actions (warn, suspend, ban messaging)

**Acceptance Criteria**
- Reports create an auditable record with evidence.
- Admin actions are logged.

---

### FR-10 Attachments (Optional MVP, Required for V1)
If enabled:
- Types: PDF/DOC/DOCX/PNG/JPG (configurable)
- Size limit (configurable)
- Malware scanning hook or service integration
- Attachment objects stored separately with signed URLs

**Acceptance Criteria**
- Unauthorized users cannot access attachment URLs.
- Upload failures are handled gracefully.

---

### FR-11 Notifications
1. In-app notifications for new messages.
2. Email notifications (rate-limited, batched).
3. Notification preferences:
   - enable/disable email
   - quiet hours (future)

**Acceptance Criteria**
- Muted conversations do not trigger email notifications.
- Notification rate limits prevent spam.

---

### FR-12 Search (V1+)
- Search conversations by participant and context
- Optional: full-text message search (index)

---

### FR-13 Audit & Logs
- Log message sends, failures, blocks, reports
- Maintain audit trail for moderation actions

---

## 4. Non-Functional Requirements

### NFR-1 Security
- Authorization checks on all reads/writes
- Rate limiting and abuse throttles
- Signed URLs for attachments
- Secure storage of message content

### NFR-2 Privacy & Compliance
- Define retention policy
- Handle account deletion requests
- Provide export hooks (premium later, but design now)

### NFR-3 Reliability
- Durable message storage
- Idempotent send
- Graceful degradation if realtime channel fails

### NFR-4 Performance
- Cursor-based pagination
- Fast conversation list queries (indexes)
- Avoid N+1 queries for participant/context rendering

### NFR-5 Observability
- Metrics: send rate, fail rate, report rate
- Tracing for send pipeline
- Alerts for abnormal spikes

---

## 5. Data Model (Recommended)

### Conversation
- id (uuid)
- participantAId
- participantBId
- context:
  - jobId (nullable)
  - applicationId (nullable)
  - companyId (nullable)
- status: active/requested/archived (per-user stored separately)
- createdAt
- lastMessageAt

### ConversationParticipant (per user state)
- conversationId
- userId
- lastReadAt
- mutedAt
- archivedAt
- requestState: pending/accepted/declined
- roleAtTime (optional snapshot)

### Message
- id (uuid)
- conversationId
- senderId
- body
- createdAt
- clientMessageId (idempotency)
- metadata (jsonb): linkCount, moderationFlags, etc.

### UserBlock
- blockerUserId
- blockedUserId
- createdAt
- reason (optional)

### Report
- id
- reporterUserId
- reportedUserId
- conversationId
- category
- description
- evidencePointer
- status
- createdAt

---

## 6. API Contract (Conceptual)

- `POST /chat/conversations` (create or find)
- `GET /chat/conversations?filter=...`
- `GET /chat/conversations/:id/messages?cursor=...`
- `POST /chat/conversations/:id/messages` (idempotent)
- `POST /chat/conversations/:id/mute`
- `POST /chat/conversations/:id/archive`
- `POST /chat/block` / `DELETE /chat/block`
- `POST /chat/reports`
- `POST /chat/conversations/:id/accept` (requests)

---

## 7. Indexing & Query Considerations
- Index `Conversation(lastMessageAt)`
- Index `Conversation(participantAId, participantBId, applicationId)` for de-dupe
- Index `ConversationParticipant(userId, archivedAt, requestState, lastReadAt)`
- Index `Message(conversationId, createdAt)` for pagination

---

## 8. Quality Gates
- Unit tests: policy checks, block enforcement, idempotency
- Integration tests: request acceptance flow, notification triggers
- Load tests: inbox list + message send burst behavior
- Security tests: access bypass attempts, signed URL protection
