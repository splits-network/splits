# Splits Network Chat — Feature Document

**Platforms**
- **splits.network**: Recruiters + Business (Company) users
- **applicant.network**: Candidates only

**Doc purpose**
Describe the product feature set, tiering strategy, and phased rollout plan for an in-platform chat system that supports hiring and split-fee recruiting workflows while keeping users on-platform and safe.

---

## 1. Summary

Add in-platform chat to enable secure, contextual, and auditable communication between:

- **Candidate ↔ Recruiter**
- **Candidate ↔ Company (direct hires / unrepresented candidates)**
- **Recruiter ↔ Company**

Chat exists across two web apps (candidate app vs recruiter/company app) but must behave as **one unified messaging system** with consistent identity, permissions, and message history.

Chat includes:

- 1:1 conversations (MVP)
- Conversation context (job/application/company)
- Inbox + requests (anti-spam)
- Conversation actions: **Mute**, **Archive/Close**, **Block**, **Report**
- Robust notification system
- Trust + abuse prevention controls
- Auditability and retention policy aligned to marketplace expectations

---

## 2. Problem Statement

Hiring conversations routinely jump off-platform (email/text/LinkedIn), causing:

- Loss of user engagement and retention
- Reduced visibility into funnel performance
- Fragmented context and errors (wrong version of job requirements, schedule confusion)
- Increased risk: scams, phishing, harassment, and data leakage
- Limited ability to enforce marketplace rules

---

## 3. Goals

### 3.1 Business Goals
- Increase retention by keeping communication on-platform
- Improve conversion (candidate ↔ recruiter ↔ company coordination)
- Reduce off-platform leakage until an explicit stage
- Create upgrade path via workflow tooling around chat (not paywalling safety)

### 3.2 Product Goals
- Make chat fast, clear, and context-rich
- Reduce spam without killing outreach
- Make boundaries easy (mute/archive/block/report)
- Ensure messages are durable and recoverable
- Support “represented vs direct” hiring paths

### 3.3 Safety Goals
- Prevent abuse and scams with guardrails
- Provide reporting/moderation tooling and audit trails
- Minimize user-to-user hostility (neutral UX copy and block semantics)

---

## 4. Non-Goals (Initial Release)

- Voice/video calling
- Public group chats / broadcast channels
- End-to-end encryption (complicates moderation/compliance and is atypical in hiring tools)
- External guests in threads (e.g., panel interview guests without accounts)

---

## 5. Target Users & Roles

- **Candidate** (applicant.network)
- **Recruiter** (splits.network)
- **Business user / Company user** (splits.network)
- **Admin / Moderator** (internal tools)

---

## 6. Core Use Cases

### 6.1 Candidate ↔ Recruiter
- Ask clarifying questions about role
- Share availability, interview prep materials
- Receive updates on application status
- Request schedule link / confirm interview details

### 6.2 Candidate ↔ Company (direct hire)
- Discuss requirements and salary range
- Schedule interviews
- Coordinate next steps when no recruiter is involved

### 6.3 Recruiter ↔ Company
- Intake: confirm requirements, logistics, and timeline
- Feedback loop: candidate evaluation, interview outcomes
- Offer and placement coordination (with proper permissions and audit trail)

---

## 7. Feature Set

### 7.1 MVP (Baseline)
- **1:1 conversations**
- **Inbox UI** (unread counts, sorting, pagination)
- **Conversation view** (timeline + composer)
- **Context linking** (job/application/company)
- **Message requests** (configurable; strongly recommended)
- **Conversation actions**
  - Mute
  - Archive/Close
  - Block
  - Report
- **Notifications**
  - In-app
  - Email
- **Rate limits + abuse throttling**
- **Moderation workflow** (view reports, action users)

### 7.2 V1+ (Soon After MVP)
- Attachments (with scanning, type/size limits)
- Message search
- Read receipts (optional)
- Typing indicators (optional)
- Scheduling link helper / calendar integration (premium candidate)

### 7.3 Premium Workflow Features (Monetize Here)
**Do not paywall**: basic messaging and safety controls.

Monetize “operational excellence”:
- Shared team inbox for recruiting agencies and companies
- Assignment/ownership of conversations
- Internal notes (not visible to candidates)
- Templates/snippets with personalization tokens
- Automations (nudge if no reply, SLA timers)
- Analytics (response time, conversion)
- Compliance: export, retention policies, audit log access
- Integrations: ATS/CRM hooks, Slack/Teams routing, webhooks

---

## 8. Key Product Decisions

### 8.1 “Disable chat but keep history”
Implement as two separate controls:

- **Archive/Close (soft):** Hide thread from primary inbox; history retained; messages may still arrive (depends on policy).
- **Mute (soft):** Stop notifications; history retained.
- **Block (hard):** Stop new messages; history retained for blocker.

**Recommendation:** Keep these controls available for all users. They are usability + safety features.

### 8.2 What does the blocked user see?
Neutral delivery failure to reduce escalation:
- “Message could not be delivered.”

Avoid:
- “You have been blocked.”

### 8.3 Cross-app considerations (two frontends)
- A candidate experiences chat only via applicant.network.
- Recruiters/companies experience chat only via splits.network.
- The messaging system must support:
  - Unified identity and permissions
  - Same conversation IDs accessed from either app (where permitted)
  - Consistent rendering and status semantics

---

## 9. Anti-Spam & Trust Guardrails

### 9.1 Message Requests (recommended default)
First inbound message from a non-connected user lands in **Requests** until accepted.

Controls:
- Candidates can Accept / Decline / Block / Report
- Links/attachments disabled until accepted
- Rate limits on outbound requests

### 9.2 Trust Tiers
Use trust scoring to relax or tighten controls:
- Verified email/phone
- Company domain verification
- Recruiter verification (future)
- Historical behavior (report rate, response patterns)

### 9.3 Rate Limits
- Per-user per-hour outbound caps
- Per-target caps (avoid “spray and pray”)
- Burst control + exponential backoff on violations

---

## 10. Success Metrics

- % of applications that generate at least 1 message
- Time to first response (median/p90)
- Conversion: conversation → interview scheduled
- 7/30-day retention uplift by role
- Off-platform leakage proxy: early request for email/phone decreases
- Abuse rate: reports per 1,000 conversations and resolution time

---

## 11. Risks & Mitigations

- **Spam / scams** → requests + rate limits + trust tiers
- **Harassment** → block/report + moderation + audit trails
- **Support load** → build moderation tools early
- **Legal / retention** → clear policies and export hooks
- **Complex representation** → model conversations with context entity IDs

---

## 12. Phased Rollout

### Phase A — Internal / Alpha
- Enable chat for admin/test users
- Instrument logs, rate limits, reporting pipeline
- Validate basic inbox + conversation UX

### Phase B — Limited Beta
- Enable for verified recruiters/companies first
- Candidates receive requests (accept/decline)
- Monitor abuse signals and refine throttles

### Phase C — General Release
- Expand to all eligible users
- Turn on analytics and premium upsell surfaces

---

## 13. Open Questions (to resolve during implementation)
- Retention policy: default duration and handling for deleted users
- Attachment support MVP vs V1+
- Whether “archive” blocks new inbound messages or simply hides
- Read receipt policy and privacy defaults
- Whether recruiter/company accounts can have multiple “acting as” identities
