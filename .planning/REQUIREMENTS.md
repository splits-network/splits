# Requirements: Splits Network v8.0 — Company Experience Enhancement

**Defined:** 2026-03-04
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v8.0 Requirements

Requirements for company experience enhancement. Each maps to roadmap phases.

### Invite to Apply (Backend)

- [ ] **INVITE-01**: `invited` match status added to candidate_role_matches CHECK constraint (migration)
- [ ] **INVITE-02**: `invited_by` (user_id) and `invited_at` (timestamp) columns on candidate_role_matches
- [ ] **INVITE-03**: `PATCH /api/v2/matches/:id/invite` endpoint — company users only, must own the job's company
- [ ] **INVITE-04**: `match.invited` RabbitMQ event published on invite with match, job, candidate, and inviter context

### Notifications

- [ ] **NOTIF-01**: Notification-service consumer for `match.invited` creates in-app notification for candidate
- [ ] **NOTIF-02**: Notification-service consumer for `match.invited` creates in-app notification for recruiter (job_owner_recruiter_id)
- [ ] **NOTIF-03**: Email sent to candidate on invite via Resend (role details + CTA to view match)
- [ ] **NOTIF-04**: Email sent to recruiter on invite via Resend (match details + candidate info)

### Portal UI (Company)

- [ ] **CUI-01**: "Invite to Apply" button on match rows in role detail Matches tab (company users only)
- [ ] **CUI-02**: Invited matches show "Invited" badge with timestamp in Matches tab
- [ ] **CUI-03**: Role detail tabs adapted for company users (hide Recruiter Brief tab, hide fee percentages in Financials)
- [ ] **CUI-04**: Company dashboard "Top Matches" widget showing highest-scored matches across company roles

### Candidate UI

- [ ] **CAND-01**: Candidate match cards show "Invited" badge when match status is `invited`
- [ ] **CAND-02**: Candidate matches page sorts invited matches to the top

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Match Actions v2

- **MATCH-01**: Shortlist/save matches for later review
- **MATCH-02**: Match notes — company users can leave internal notes on matches
- **MATCH-03**: Bulk invite — invite multiple matched candidates at once

### Company Experience v2

- **CEXP-01**: Company activity feed (who applied, who was invited, stage changes)
- **CEXP-02**: Company-specific analytics dashboard (time-to-fill, match conversion rates)
- **CEXP-03**: Company notification preferences (email frequency, notification types)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New recruiter invite action | Recruiters already propose candidates through the existing application flow |
| Application pipeline changes | Company users can already advance stages in their portion of the flow |
| Real-time match notifications (WebSocket) | Email + in-app polling is sufficient for v1; real-time is future enhancement |
| Candidate auto-apply on invite | Candidate must actively choose to apply — keeps recruiters in the loop |
| Match messaging/chat | Too complex for v1; invite is a signal, not a conversation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INVITE-01 | Phase 28 | Pending |
| INVITE-02 | Phase 28 | Pending |
| INVITE-03 | Phase 29 | Pending |
| INVITE-04 | Phase 29 | Pending |
| NOTIF-01 | Phase 30 | Pending |
| NOTIF-02 | Phase 30 | Pending |
| NOTIF-03 | Phase 30 | Pending |
| NOTIF-04 | Phase 30 | Pending |
| CUI-01 | Phase 31 | Pending |
| CUI-02 | Phase 31 | Pending |
| CUI-03 | Phase 31 | Pending |
| CUI-04 | Phase 31 | Pending |
| CAND-01 | Phase 32 | Pending |
| CAND-02 | Phase 32 | Pending |

**Coverage:**
- v8.0 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-04 after roadmap creation*
