# Splits Network – Payout Refactor Decision Guidance (Final)

Date: 2026-01-17

This document captures the decisions and implementation guidance for refactoring Splits Network’s payout model to:
- avoid supporting multiple payout “accounting” flows
- keep attribution deterministic and auditable
- keep payouts strictly as **execution tracking** for money movement

---

## 1) Ethics / Optics Rule: Sourcers are Recruiters Only

### Decision
- **Only recruiters can be paid as sourcers.**
- Companies, hiring managers, and company employees must never receive compensation for hiring decisions or hiring activity.

### Rationale
- Prevents “kickback” optics and policy risk.
- Aligns incentives with the marketplace: recruiters bring supply (candidates) and/or demand (companies).

### Guidance
- Replace any user-based sourcer columns with recruiter-based columns:
  - `candidate_sourcers.sourcer_user_id` → `candidate_sourcers.sourcer_recruiter_id`
  - Create `company_sourcers` with `sourcer_recruiter_id`

---

## 2) One Payout Model Only (No Recruiter Accounting)

### Decision
- We will **not** support two payout systems.
- We will **not** support recruiter “accounting firm” workflows (one payout that gets split arbitrarily later).

### Rationale
- Splits Network is a marketplace payout engine, not an accounting platform.
- Eliminates ambiguity, disputes, and implementation overhead.

---

## 3) Canonical Data Flow for Hires → Money

### Source of truth layers
1. **placements**
   - A hire event / placement record (facts)
2. **placement_snapshot**
   - Immutable attribution + rate snapshot at time of hire
   - Includes: candidate recruiter, company recruiter, job owner, candidate sourcer, company sourcer, rates, tier, total fee
3. **placement_splits**
   - Computed allocations (one row per payee/role) (don't group by recruiter, if a recruiter has multiple roles they get multiple rows)
   - Contains split_percentage + split_amount
4. **payout execution tracking**
   - Tracks actual Stripe transfers and status per allocation

### Key rule
- Attribution (who/what/percent) lives in **snapshot/splits**.
- Execution (paid/failed/transfer IDs) lives in **payout tracking**, not in attribution tables.

---

## 4) What Changes

### Keep
- `placements`
- `placement_snapshot` (update sourcer fields to recruiter-based, snapshot sourcer tiers/rates as needed)
- `placement_splits` (ensure it fully represents allocations)

### Create / Replace
- Create `payout_transactions` as the only “payout” table, keyed to `placement_splits`.

### Deprecate / Remove
- `payouts`
- `payout_splits`
- `payout_schedules`
- `payout_audit_log` (or migrate to transaction-level audit if still desired)

---

## 5) placements.recruiter_id

### Decision
- Remove `placements.recruiter_id` (or rename it to a clearly non-economic operational field if needed).
- Attribution and payees must come from `placement_snapshot` + `placement_splits`.

### Rationale
- A placement is not owned by a single recruiter in the multi-role model.
- Leaving a single `recruiter_id` on placements causes confusion and subtle payout bugs.

---

## 6) Payout Execution Table Design

### Decision
- Create `payout_transactions` with one row per allocation (placement split).
- Each payout transaction is idempotent and auditable.

### Suggested columns
- `placement_split_id` (FK to placement_splits)
- `placement_id` (denormalized for indexing)
- `recruiter_id` (denormalized payee)
- `amount`
- `status` (pending/processing/paid/failed/reversed/on_hold)
- Stripe IDs: `stripe_transfer_id`, `stripe_payout_id`, `stripe_connect_account_id`
- timestamps and failure fields
- unique idempotency constraint on `placement_split_id`

---

## 7) Hybrid Sourcer Incentive Reminder

### Rule (agreed)
- Base sourcer rate: **6%**
- Tier bonus: **+2% Pro**, **+4% Partner**
- Snapshot at **hire**
- No retroactive changes

### Guidance
- Ensure placement snapshot includes sourcer rate snapshots (and optional tier snapshots).
- Sourcers are recruiters; rate derived from the sourcer’s subscription at hire.

---

## 8) Implementation Checklist

- [ ] Create `company_sourcers` table
- [ ] Convert `candidate_sourcers` to recruiter-based (`sourcer_recruiter_id`)
- [ ] Ensure `placement_snapshot` uses recruiter IDs for sourcers
- [ ] Ensure `placement_splits` contains split_amount for every allocation
- [ ] Create `payout_transactions` keyed to `placement_splits`
- [ ] (Optional) Backfill `payout_transactions` from existing payouts history
- [ ] Deprecate and drop legacy payout tables
- [ ] Remove (or rename) `placements.recruiter_id`
