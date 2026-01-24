
# Stripe Integration Implementation – Clarification Addendum v1.1

Date: 2026-01-23

This document supersedes and extends `plan-stripeIntegrationImplementation-addendum.md`.
It exists to remove all remaining ambiguity between economic intent, database schema,
and Stripe execution.

This addendum is authoritative.

---

## 1. Canonical Data Flow (Locked)

placements
→ placement_snapshot   (economic truth, immutable)
→ placement_splits     (allocation ledger)
→ placement_payout_transactions (execution tracking only)

Money must never be computed from any other source.

---

## 2. Source of Truth Rules

### placement_snapshot (AUTHORITATIVE)
The following values are only authoritative when read from placement_snapshot:
- Recruiter attribution (all roles)
- Rate percentages
- Subscription tier at hire time
- Total placement fee

These values are immutable once written.

### placements (CONVENIENCE ONLY)
Fields on placements that mirror attribution exist only for:
- search
- reporting
- UI convenience

They must never be used for:
- payout math
- split computation
- billing logic

---

## 3. Platform Remainder Representation

Platform remainder must be explicitly represented.

Required:
- placement_splits row with role = 'platform'
- recruiter_id = NULL
- split_amount equals remainder

Sum of all placement_splits must equal placement fee.

---

## 4. placement_splits Rules

- One row per placement + role + recruiter
- Immutable after creation
- Percentages copied from placement_snapshot

---

## 5. placement_payout_transactions Rules

- Execution tracking only
- 1:1 with placement_splits
- No split logic
- Amount copied from placement_splits

---

## 6. Recruiter Identity Lock

- All paid actors are recruiters
- No payouts to companies, admins, or users

---

## 7. Subscription Tier Naming

Canonical tiers:
- free
- pro
- partner

Legacy names must not be written.

---

## 8. Guarantee Lifecycle

- No payouts before guarantee completion
- Failed placements produce no payouts
- Replacements create fresh economics

---

## 9. Stripe Responsibility

Stripe executes money only.
All business logic lives internally.

---

## 10. Final Invariants

Violations indicate a broken system:
1. Money outside snapshot
2. Payouts before guarantee
3. Paying non-recruiters
4. Retroactive changes
5. Implicit platform remainder
