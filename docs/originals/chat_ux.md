# Splits Network Chat — User Experience (UX) Document

**Platforms**
- **splits.network**: Recruiters + Business (Company) users
- **applicant.network**: Candidates only

This document defines the UX behaviors, screen states, and interaction patterns needed to implement a robust chat interface across two apps.

---

## 1. UX Goals

- Keep users in-platform by making chat the easiest path
- Make conversations feel professional and safe
- Preserve context: who/what job/what stage
- Reduce spam and scams with message requests
- Provide clear boundaries: mute/archive/block/report
- Make inbox manageable (filters, sorting, clarity)

---

## 2. UX Principles

- **Context-first:** Every conversation should clearly show the related job/application when available.
- **Safety-first:** Reporting and blocking should be easy, neutral, and non-inflammatory.
- **Low friction:** Starting a chat from a job/application should be one click.
- **Inbox sanity:** Users need fast scanning, sorting, and simple controls.
- **Cross-app consistency:** The same conversation must “feel” the same on both apps.

---

## 3. Navigation & IA (Information Architecture)

### applicant.network (Candidate)
Primary entry:
- Top nav: **Inbox**
- Pages:
  - Inbox (Active)
  - Requests
  - Archived
  - Conversation detail

### splits.network (Recruiter/Company)
Primary entry:
- Left nav: **Messages**
- Pages:
  - Inbox (Active)
  - Requests (if applicable to this role)
  - Archived
  - Conversation detail
  - (Future premium) Team inbox / assignments

---

## 4. Inbox Screen (Both Apps)

### Conversation Row Content
- Avatar
- Display name
- Role badge (Recruiter / Company / Candidate)
- Context line (Job title • Company) when available
- Last message snippet
- Timestamp
- Unread indicator (dot or count)

### Controls
- Search input
- Filters:
  - Unread
  - Requests
  - Archived
  - Job / Company (if context exists)
- Quick actions:
  - Archive
  - Mute
  - (Optional) Block via overflow menu

### Empty States
- Inbox empty:
  - “No messages yet. When you connect with someone, your conversations will show up here.”
- Requests empty:
  - “No message requests right now.”

---

## 5. Requests UX (Anti-Spam)

### Candidate (applicant.network)
Requests should be prominent. Each request card shows:
- Sender name + role badge
- Trust indicators (verified email/company domain) when available
- Context preview (job title) if linked
- First message preview

Actions:
- Accept
- Decline
- Block
- Report

**Policy UX**
- Until accepted, the sender cannot send additional messages (or is heavily limited).
- Links/attachments are disabled until acceptance (recommended).

### Recruiter/Company (splits.network)
If you allow inbound cold outreach to recruiters/companies, replicate Requests tab.
Otherwise, Requests can be candidate-only.

---

## 6. Conversation Screen

### Header
- Participant(s) name, avatar, role badge
- Trust indicators
- Overflow menu:
  - Mute
  - Archive
  - Block
  - Report

### Context Banner (Pinned)
When context exists, show:
- Job title
- Company name
- Stage (if your platform tracks it)
- Quick link: View job / View application

### Message Timeline
- Bubbles aligned by sender
- Timestamps
- Optional read receipts (consider privacy defaults)

### Composer
- Multiline input
- Attach button (if enabled)
- Send button
- Keyboard shortcuts:
  - Enter to send
  - Shift+Enter new line

#### Composer Disabled States
- **Request pending**: “Accept this request to reply.”
- **Blocked**: “You blocked this user. Unblock to message.”
- **You are blocked** (if detectable): “Message could not be delivered.” (avoid explicit blame)

---

## 7. Conversation Actions UX

### 7.1 Mute
- Toggle in menu
- Confirmation toast:
  - “Muted. You won’t receive notifications for this conversation.”

### 7.2 Archive / Close
- Archive button in row swipe/actions or menu
- Confirmation toast:
  - “Archived. You can find it in Archived.”

Archived behavior options:
- Option A: If new message arrives, thread reappears in Inbox.
- Option B: Archived suppresses inbound until unarchived (less common; reduces noise).
**Recommendation:** Option A for most users; it matches expectation.

### 7.3 Block
- Confirmation modal:
  - Title: “Block this user?”
  - Body: “They won’t be able to message you. You can still view conversation history.”
  - Buttons: Cancel / Block
  - Optional checkbox: “Also report this conversation”

Blocked state in UI:
- Timeline remains readable
- Composer disabled for blocker (or allow unblock)
- For blocked user: neutral failure on send

### 7.4 Report
- Report modal with:
  - Category dropdown (Spam, Harassment, Fraud, Other)
  - Description textarea
  - Checkbox: “Include last 20 messages” (default on)
- Confirmation:
  - “Thanks—your report has been submitted.”

---

## 8. Safety + Trust UI

### Trust Signals
- Verified email
- Verified company domain
- Recruiter verification badge (future)
- Mutual context (“Applied to X”, “Regarding Y role”)

### Link Handling (Recommended)
- In Requests: links rendered as plain text until accepted
- After acceptance: normal link behavior
- External link warning interstitial (optional later)

---

## 9. Cross-App Consistency Rules

- Conversation IDs and message ordering must be identical in both apps.
- Participant labels must match:
  - Candidate sees recruiter/company identity clearly
  - Recruiter/company sees candidate identity clearly
- Shared context banner must display the same job/application reference.
- Block/mute/archive actions must behave identically and persist across apps.

---

## 10. UX Edge Cases

- **User deleted/deactivated**
  - Show: “User unavailable”
  - Keep history visible (subject to retention policy)
- **Job expired/deleted**
  - Keep context banner but mark as “No longer active”
- **Multiple roles**
  - If a user can act as recruiter and company user, show “Acting as:” identity in header
- **Network failures**
  - Show send retry UI (failed bubble with retry)
  - Maintain drafts locally

---

## 11. Accessibility
- Full keyboard navigation for inbox and conversation view
- Screen reader labels for:
  - unread counts
  - action menus
  - timestamps
- Don’t rely only on color for unread indicators

---

## 12. Premium UX Hooks (Future)
- Shared inbox tab with assignment
- Internal notes panel (recruiter/company only)
- Templates/snippets drawer
- Automations configuration (nudge timers)
- Analytics view: response time, conversion funnel
