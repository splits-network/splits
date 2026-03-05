# Plan: Basel Migration — invite-companies Invitation Detail

## Summary
Migrate `invite-companies/components/shared/invitation-detail.tsx` to Basel design using the **Invitation showcase panel** as reference, and add a **DetailLoader** wrapper so the panel fetches its own data by ID (future-proofing against trimmed list responses).

## Files to Change

### 1. New: `invitation-detail-loader.tsx`
**Path:** `apps/portal/src/app/portal/invite-companies/components/shared/invitation-detail-loader.tsx`

- Follow the `placements/shared/placement-detail.tsx` DetailLoader pattern exactly
- Accept `invitationId: string`, `onClose`, `onRefresh` props
- Fetch `GET /company-invitations/{id}` via `createAuthenticatedClient`
- Show loading spinner while fetching
- Render `InvitationDetail` with the fetched data
- Cancellable signal pattern, `refreshKey` state for re-fetch

### 2. Rewrite: `invitation-detail.tsx`
**Path:** `apps/portal/src/app/portal/invite-companies/components/shared/invitation-detail.tsx`

Rewrite to match the **showcase invitation panel** using `PanelHeader` + `PanelTabs` from `@splits-network/basel-ui`:

**PanelHeader:**
- `kicker` = company_name_hint or "Company Invitation"
- `badges` = status badge (using new `statusBadgeClass`), + "Email Sent" (badge-success badge-outline), + "Expires Soon" (badge-error badge-outline)
- `avatar` = initials from company_name_hint
- `title` = company_name_hint or "Company Invitation"
- `subtitle` = invited_email
- `meta` = email icon + invited_email, calendar icon + created date
- `stats` = Invite Code, Days Left, Status
- `actions` = existing `InvitationActionsToolbar` as JSX (same as invitations/ pattern)
- `onClose` pass-through

**PanelTabs** (Details + History):

**DetailsTab:**
- Invitation Details section (invite code + invite link in gap-[2px] bg-base-300 grid)
- Personal Message (border-l-4 border-l-primary pl-6 pattern)
- Timeline section (grid of date cells: Created, Expires, Accepted, Email Sent — with conditional success/error styling)
- Recruiter "Invited By" section (border-t-2, initials avatar)

**HistoryTab:**
- Build timeline from invitation timestamps (created_at, email_sent_at, accepted_at, expires_at if expired, revoked status)
- Standard Basel timeline: vertical connector line, bg-primary dot, action + datetime

**File split:** Main file stays under 200 lines. If needed, extract DetailsTab/HistoryTab into separate files.

### 3. Update: `status-color.ts`
**Path:** `apps/portal/src/app/portal/invite-companies/components/shared/status-color.ts`

- Add `statusBadgeClass(status)` function returning DaisyUI badge classes (`badge-warning`, `badge-success`, `badge-ghost`, `badge-error badge-outline`)
- Keep existing `statusColor`, `statusBorder`, `statusIcon` (used by grid-card, table-row, split-item)

### 4. Update consumers: `grid-view.tsx`, `table-row.tsx`, `split-view.tsx`
Each consumer currently passes `invitation={selectedInv}` to `InvitationDetail`. Change to:
- Import `InvitationDetailLoader` instead of `InvitationDetail`
- Pass `invitationId={selectedId}` instead of `invitation={selectedInv}`
- Keep `onClose` and `onRefresh` props unchanged

## What stays the same
- `actions-toolbar.tsx` — reused as-is (passed as JSX to PanelHeader actions)
- `helpers.ts` — reused (formatDate, getDaysUntilExpiry, isExpiringSoon, getInviteLink, recruiterName, recruiterInitials)
- `types.ts` — no changes needed
- Grid cards, table rows, split items — only change is the detail import swap

## Design decisions
- **No candidate info section** — unlike the showcase, this is a company invitation, not a candidate invitation. There is no candidate data. The showcase "Candidate Information" card is replaced by invitation-specific details.
- **Showcase Invitation panel** as the reference (not Referral Code) — the data shape (status, email sent, expires, invite code, personal message, recruiter) maps directly.
- **DetailLoader in separate file** — keeps concerns clean, matches the pattern in placements/, recruiters/, etc.
