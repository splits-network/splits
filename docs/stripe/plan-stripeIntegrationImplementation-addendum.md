# Stripe Integration Implementation – Clarification Addendum

Date: 2026-01-23

This addendum exists to remove ambiguity between prior Stripe plans, payout refactors, and implementation details.
It must be read alongside `plan-stripeIntegrationImplementation.prompt.md`.

This document does not change strategy — it locks execution rules.

---

## 1. Single Payout Model (Non-Negotiable)

Splits Network uses one payout model only.

Placement (HIRED)
→ placement_snapshot (immutable attribution + rates)
→ placement_splits (one row per payee / role)
→ payout_transactions (execution tracking only)

Explicitly NOT supported:
- Recruiter accounting workflows
- One payout that is later split arbitrarily
- Manual payout adjustments outside the snapshot/split system

Stripe is used only to execute and report money movement.

---

## 2. Payout Table Naming & Ownership

Correct execution table:
- payout_transactions

Definition:
A payout transaction represents one recruiter, one role-based allocation, one placement split, and one Stripe transfer lifecycle.

Invariants:
- payout_transactions is 1:1 with placement_splits
- No split logic exists inside payout execution
- Amounts are copied from placement_splits.split_amount

Any reference to payouts or payout_splits in earlier plans refers to legacy concepts only and must not be implemented.

---

## 3. Recruiter Identity Is the Only Payee Identity

All compensated actors are recruiters.

Implications:
- Stripe Connect accounts are tied to recruiter_id
- No payouts to companies, company employees, platform admins, or non-recruiter users

Sourcers:
- Candidate and company sourcers are always recruiters
- Sourcer identity is stored as sourcer_recruiter_id

---

## 4. Subscription Tier Snapshot Rule

Subscription tier and rate effects are snapshotted at hire time.

Upgrades or downgrades after hire do not retroactively affect payouts.

---

## 5. Recruiter Payout Eligibility & Blocking

Recruiters cannot receive funds until Stripe Connect onboarding and KYC are complete.

If incomplete:
- Placement proceeds
- Placement splits are created
- payout_transactions.status = on_hold
- Funds auto-release once onboarding completes

---

## 6. Company Billing Enforcement

Billing trigger:
- Guarantee completion

Supported modes:
- Immediate
- Net 30 / 60 / 90

Enforcement:
- Invoice unpaid after terms → billing_delinquent
- Submissions blocked, roles frozen
- Continued non-payment may suspend account

---

## 7. Guarantee Failure & Replacement Handling

Failed placement:
- No payout transactions created

Replacement placement:
- New placement ID
- New snapshot
- New splits
- No economic inheritance

---

## 8. Role Promotion Charges

One-time Stripe charges, separate from placement economics.

Promotion activates only after successful payment and expires automatically.

---

## 9. Developer Guardrails

Never:
- Compute money from live subscription state
- Adjust payouts after snapshot
- Pay non-recruiters
- Create payouts before guarantee completion
- Split payouts outside placement_splits

---

## 10. Final Statement

This addendum exists to make implementation boringly correct.
