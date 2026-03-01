# Recruiting Firm Billing & Admin Take Rate

## Overview

This plan introduces five interconnected features for recruiting firms (formerly "teams"):

1. **Terminology Rename** — rename "teams" to "firms" across all layers (DB, services, API, frontend)
2. **Partner Subscription Requirement** — only partner-tier recruiters can create and maintain firms
3. **Admin Take Rate** — firm-wide percentage the firm owner earns from members' placement payouts
4. **Off-Platform Company Jobs** — firm members can create jobs for companies not on the platform
5. **Firm Billing** — full-featured billing infrastructure for firms (mirroring company billing)

---

## 1. Terminology Rename: Teams → Firms

### Concept

The "team" concept has evolved into a recruiting firm — an organization with its own billing, revenue sharing, and job creation authority. The terminology should reflect this across every layer.

### Database Renames

| Old Name | New Name |
|---|---|
| `teams` | `firms` |
| `team_members` | `firm_members` |
| `team_invitations` | `firm_invitations` |
| `split_configurations.team_id` | `split_configurations.firm_id` |
| `placement_splits.team_id` | `placement_splits.firm_id` |
| `placement_splits.split_configuration_id` | (unchanged, but references firm context) |

All foreign key columns referencing `team_id` across all tables are renamed to `firm_id`.

### Migration Strategy

- Use `ALTER TABLE ... RENAME TO` for tables
- Use `ALTER TABLE ... RENAME COLUMN` for columns
- Update all constraints, indexes, and foreign keys
- Single migration file to keep the rename atomic

### Service Renames

| Old | New |
|---|---|
| `network-service/v2/teams/` | `network-service/v2/firms/` |
| `TeamRepository` | `FirmRepository` |
| `TeamServiceV2` | `FirmServiceV2` |
| `registerTeamRoutes()` | `registerFirmRoutes()` |
| All `team`-prefixed types/interfaces | `firm`-prefixed |

### API Route Renames

| Old | New |
|---|---|
| `GET /api/v2/teams` | `GET /api/v2/firms` |
| `GET /api/v2/teams/:id` | `GET /api/v2/firms/:id` |
| `POST /api/v2/teams` | `POST /api/v2/firms` |
| `PATCH /api/v2/teams/:id` | `PATCH /api/v2/firms/:id` |
| `DELETE /api/v2/teams/:id` | `DELETE /api/v2/firms/:id` |
| `GET /api/v2/teams/:id/members` | `GET /api/v2/firms/:id/members` |
| `DELETE /api/v2/teams/:id/members/:memberId` | `DELETE /api/v2/firms/:id/members/:memberId` |
| `POST /api/v2/teams/:id/invitations` | `POST /api/v2/firms/:id/invitations` |

### Frontend Renames

- All UI copy: "Team" → "Firm", "team" → "firm"
- Route paths: `/teams` → `/firms`
- Component names, hooks, stores: `team` → `firm`
- Page titles, breadcrumbs, navigation labels

### Member Role Names (unchanged)

The `firm_members.role` values remain: `owner`, `admin`, `member`, `collaborator`. These describe roles within a firm and don't need renaming.

---

## 2. Partner Subscription Requirement

### Concept

Only recruiters with an active **partner** subscription tier can create and own firms. Firm members do not need partner tier — only the owner.

### Enforcement

- **Firm creation**: Blocked unless the creating recruiter has an active partner subscription
- **Ongoing ownership**: If the owner's subscription lapses (downgrade or cancellation), the firm is **suspended**
  - Suspended firms: members cannot create new jobs, no new payouts process
  - In-flight placements (already snapshotted) still honor their frozen values and complete normally
  - The firm reactivates automatically if the owner re-subscribes to partner tier
- **Ownership transfer**: The owner can transfer ownership to another firm member who has partner tier. This keeps the firm active even if the original owner downgrades.
  - If no firm member has partner tier, the firm suspends until someone upgrades or the owner re-subscribes

### Service Changes

- **Firm service**: Add partner tier validation on firm creation. Add subscription status check (webhook or periodic) to suspend/reactivate firms.
- **Stripe/billing webhook handler**: On subscription change events, check if any firm owners lost partner tier → suspend their firms. On upgrade to partner → reactivate.
- **Firm ownership transfer endpoint**: Validate the new owner has partner tier before allowing transfer.

### Frontend Changes

- **Firm creation**: Gate the "Create Firm" button/flow behind partner tier. Show upgrade prompt for non-partner recruiters.
- **Suspended firm state**: Banner on firm pages explaining the firm is suspended due to subscription lapse. CTA to upgrade or transfer ownership.
- **Ownership transfer UI**: Setting in firm management for the owner to transfer ownership to an eligible (partner-tier) member.

---

## 3. Admin Take Rate

### Concept

A firm owner sets a firm-wide take rate (e.g., 20%). When any firm **member** (not the owner themselves) earns a placement split, the firm receives that percentage of the payout.

- **Example**: Member earns a $1,000 split. Firm take rate is 20%. Member receives $800 via their Stripe Connect account. $200 goes to the firm's Stripe billing account.
- The take rate does **not** apply to the owner's own earnings.
- The rate can be changed at any time, but changes only affect **future** placements (not already-snapshotted ones).

### Multi-Firm Placements

A single placement involves 5 commission roles. Each role's recruiter may belong to a different firm with a different take rate. The snapshot must freeze `firm_id` and `admin_take_rate` independently for each of the 5 roles.

**Example placement**:
| Role | Recruiter | Firm | Take Rate | Gross Split | Firm Take | Net to Member |
|---|---|---|---|---|---|---|
| candidate_recruiter | Alice | Firm Alpha | 20% | $3,000 | $600 | $2,400 |
| company_recruiter | Bob | Firm Beta | 15% | $1,500 | $225 | $1,275 |
| job_owner | Carol | (solo) | — | $1,500 | $0 | $1,500 |
| candidate_sourcer | Dave | Firm Alpha | 20% | $800 | $160 | $640 |
| company_sourcer | Eve | Firm Gamma | 10% | $800 | $80 | $720 |

### Database Changes

**`firms` table** — add column:
```sql
ALTER TABLE firms ADD COLUMN admin_take_rate NUMERIC(5,2) DEFAULT 0
  CHECK (admin_take_rate >= 0 AND admin_take_rate <= 100);
```

**`placement_snapshot` table** — add per-role firm fields:
```sql
-- For each of the 5 roles, freeze the firm context at snapshot time
ALTER TABLE placement_snapshot ADD COLUMN candidate_recruiter_firm_id UUID REFERENCES firms(id);
ALTER TABLE placement_snapshot ADD COLUMN candidate_recruiter_admin_take_rate NUMERIC(5,2);
ALTER TABLE placement_snapshot ADD COLUMN company_recruiter_firm_id UUID REFERENCES firms(id);
ALTER TABLE placement_snapshot ADD COLUMN company_recruiter_admin_take_rate NUMERIC(5,2);
ALTER TABLE placement_snapshot ADD COLUMN job_owner_firm_id UUID REFERENCES firms(id);
ALTER TABLE placement_snapshot ADD COLUMN job_owner_admin_take_rate NUMERIC(5,2);
ALTER TABLE placement_snapshot ADD COLUMN candidate_sourcer_firm_id UUID REFERENCES firms(id);
ALTER TABLE placement_snapshot ADD COLUMN candidate_sourcer_admin_take_rate NUMERIC(5,2);
ALTER TABLE placement_snapshot ADD COLUMN company_sourcer_firm_id UUID REFERENCES firms(id);
ALTER TABLE placement_snapshot ADD COLUMN company_sourcer_admin_take_rate NUMERIC(5,2);
```

**`placement_splits` table** — add firm take tracking:
```sql
ALTER TABLE placement_splits ADD COLUMN firm_admin_take_rate NUMERIC(5,2);
ALTER TABLE placement_splits ADD COLUMN firm_admin_take_amount NUMERIC(12,2);
ALTER TABLE placement_splits ADD COLUMN net_amount NUMERIC(12,2); -- split_amount - firm_admin_take_amount
```

**`placement_payout_transactions` table** — two transactions per split when firm take applies:
- One transaction for the member's net payout (to their Stripe Connect account)
- One transaction for the firm's take (to the firm's Stripe Connect account)

Add columns:
```sql
ALTER TABLE placement_payout_transactions ADD COLUMN transaction_type TEXT DEFAULT 'member_payout'
  CHECK (transaction_type IN ('member_payout', 'firm_admin_take'));
ALTER TABLE placement_payout_transactions ADD COLUMN firm_id UUID REFERENCES firms(id);
```

### Service Changes

- **Snapshot service**: When creating a snapshot, resolve each role's recruiter → firm membership → firm admin take rate. Freeze all values.
- **Payout service**: When creating splits and transactions, calculate `firm_admin_take_amount = split_amount * admin_take_rate / 100` and `net_amount = split_amount - firm_admin_take_amount`. Create two payout transactions when a firm take applies.
- **Firm service**: Add endpoint to get/set `admin_take_rate`. Only owner/admin can set it. All members can view it.

### Frontend Changes

- **Firm settings page**: Admin take rate input (percentage field, 0-100)
- **Firm member view**: Show the current take rate (read-only for members)
- **Payout/earnings views**: Show gross, firm take, and net columns for transparency

### Rules

- Admin take rate of 0% means no firm cut (default)
- Owner's own placements are exempt from the take rate
- Rate changes do not affect already-snapshotted placements
- If a recruiter leaves a firm, in-flight (already snapshotted) placements still honor the frozen take rate

---

## 4. Off-Platform Company Jobs

### Concept

Firm members can create jobs/roles where the hiring company is not on the Splits Network platform. These jobs have special rules:

- **No company_id** — the job is not linked to a platform company
- **Display as "3rd Party"** — anywhere a company name would appear (cards, tables, detail views), show "3rd Party" or similar label
- **No job_owner commission** — the `job_owner` role is always empty on these placements; that share flows to platform remainder
- **Minimum 5% fee** — `fee_percentage` must be >= 5 (normal jobs can go to 0%)
- **Open to all** — any recruiter or direct candidate can apply, not just firm members

### Database Changes

**`jobs` table**:
```sql
-- Make company_id nullable (if not already)
ALTER TABLE jobs ALTER COLUMN company_id DROP NOT NULL;

-- Add source tracking
ALTER TABLE jobs ADD COLUMN source_firm_id UUID REFERENCES firms(id);
-- source_firm_id is set when a firm member creates a job for an off-platform company

-- Add fee minimum constraint for firm-sourced jobs (enforced in service layer, not DB constraint)
```

**Constraint logic** (service layer):
- If `company_id IS NULL` AND `source_firm_id IS NOT NULL` → this is a firm-sourced off-platform job
- `fee_percentage` must be >= 5 for these jobs
- `job_owner_recruiter_id` must be NULL on any placement for these jobs

### Service Changes

- **Job service**: Allow creating jobs without `company_id` when `source_firm_id` is provided. Enforce 5% minimum fee. Validate that any firm member can create.
- **Placement/snapshot service**: When the job has no `company_id`, ensure `job_owner_recruiter_id` is always NULL in the snapshot. The job_owner rate share goes to platform remainder.
- **Gateway routes**: Update job creation endpoints to accept `source_firm_id` and optional `company_id`.

### Frontend Changes

- **Job creation flow**: Option to create a job without selecting a company (firm members only). Show firm selection or auto-detect from user's firm.
- **Job cards/tables**: When `company_id` is null, display "3rd Party" with a visual badge/tag indicating it's a firm-sourced job.
- **Job detail page**: Show "3rd Party" in company section, show source firm name.
- **Placement creation**: Automatically skip the job_owner role assignment for off-platform jobs.

### Rules

- Only firm members can create off-platform jobs (requires `source_firm_id`)
- Any recruiter on the platform can submit candidates to these jobs
- Direct candidates can also apply
- These jobs cannot be "claimed" by a company later (future feature, separate flow)
- The `job_owner` commission role is always empty — that percentage goes to the platform

---

## 5. Firm Billing

### Concept

Firms need full-featured billing infrastructure mirroring what companies have today. This is required because:

1. Firms receive admin take rate payouts (need a destination account)
2. Firms that create off-platform jobs are invoiced by the platform for placement fees (instead of the company)

### Database Changes

**`firm_billing_profiles` table** (mirrors `company_billing_profiles`):
```sql
CREATE TABLE firm_billing_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) UNIQUE,
    stripe_customer_id TEXT,
    billing_email TEXT,
    billing_name TEXT,
    billing_address JSONB,
    payment_terms TEXT DEFAULT 'immediate'
      CHECK (payment_terms IN ('immediate', 'net_30', 'net_60', 'net_90')),
    auto_pay BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`firm_stripe_accounts` table** (for receiving admin take payouts):
```sql
CREATE TABLE firm_stripe_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) UNIQUE,
    stripe_connect_account_id TEXT,
    stripe_connect_onboarded BOOLEAN DEFAULT false,
    onboarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`placement_invoices` table** — extend to support firm billing:
```sql
ALTER TABLE placement_invoices ADD COLUMN firm_id UUID REFERENCES firms(id);
-- When firm_id is set and company_id is null, the invoice is billed to the firm
```

### Service Changes

- **Firm billing service** (new): CRUD for `firm_billing_profiles`, Stripe Customer creation, Stripe Connect onboarding for firm accounts.
- **Placement invoice service**: When creating an invoice for an off-platform company job, bill the firm instead of the company. Use `firm_billing_profiles` for payment terms.
- **Payout service**: Admin take transactions transfer funds to the firm's Stripe Connect account.
- **Stripe webhook handlers**: Handle firm-related payment events.

### Frontend Changes

- **Firm billing setup page**: Mirrors company billing setup — Stripe Customer creation, payment method, billing address, payment terms.
- **Firm Stripe Connect onboarding**: Flow for the firm to set up their Stripe Connect account (for receiving admin take payouts).
- **Billing reminders/indicators**: Banner or alert for firm admins who haven't set up billing yet (similar to company billing reminders). Shown on firm dashboard and relevant pages.
- **Firm invoices view**: List of invoices billed to the firm for off-platform placements.
- **Firm earnings view**: Breakdown of admin take earnings across placements.

### Rules

- Any firm admin can set up billing (not just owner)
- Billing setup is not required to create off-platform jobs
- Billing IS required before any payouts can be processed (admin take or placement invoices)
- Platform shows reminders/indicators to admins until billing is configured
- Full billing terms supported: immediate, net_30, net_60, net_90
- 3% processing fee applies to firm invoices same as company invoices

---

## 6. Implementation Order

These features have dependencies. Recommended build order:

### Phase 0: Terminology Rename (Teams → Firms)
1. Database migration: rename tables, columns, constraints, indexes
2. Service layer: rename repositories, services, routes, types
3. API gateway: rename route paths
4. Frontend: rename components, hooks, routes, UI copy
5. Shared packages: rename types, interfaces
6. This phase must complete before any new firm features are built

### Phase 1: Database Migrations (New Features)
1. `firms.admin_take_rate` column
2. `jobs.company_id` nullable + `jobs.source_firm_id` column
3. `firm_billing_profiles` table
4. `firm_stripe_accounts` table
5. `placement_snapshot` per-role firm fields
6. `placement_splits` firm take fields
7. `placement_payout_transactions` type + firm_id fields
8. `placement_invoices.firm_id` column

### Phase 2: Partner Subscription Gating
1. Firm creation: validate owner has active partner subscription
2. Subscription webhook handler: suspend/reactivate firms on tier changes
3. Ownership transfer endpoint (with partner tier validation)
4. Frontend: creation gate, suspended state banners, transfer UI

### Phase 3: Firm Billing Infrastructure
1. Firm billing service (profiles, Stripe Customer, Connect)
2. Firm billing API routes via gateway
3. Firm billing frontend (setup, management, reminders)

### Phase 4: Admin Take Rate
1. Firm service: get/set take rate endpoints
2. Snapshot service: freeze per-role firm context
3. Payout service: calculate firm take, create dual transactions
4. Frontend: firm settings, earnings views, payout transparency

### Phase 5: Off-Platform Company Jobs
1. Job service: allow null company_id with source_firm_id
2. Job creation frontend: firm job flow
3. Display logic: "3rd Party" labels and badges across all job views
4. Placement flow: enforce no job_owner for off-platform jobs
5. Invoice service: bill firm instead of company

### Phase 6: Integration & Polish
1. End-to-end testing of full flow
2. Billing reminder indicators
3. Earnings/payout dashboard updates
4. Edge cases: member leaves firm, rate changes, etc.

---

## 7. Open Questions / Future Considerations

- **Firm tax reporting**: Firms receiving payouts may need 1099 reporting — out of scope for now but worth noting
- **Multiple admins**: If a firm has multiple admins, do they all share the take equally? Or does only the owner receive it? (Current assumption: goes to firm billing account, firm handles internal distribution)
- **Off-platform job → platform company migration**: Explicitly out of scope, but the schema should not prevent it later
- **Firm dashboard**: A consolidated view of firm earnings, member performance, and billing — could be its own phase
