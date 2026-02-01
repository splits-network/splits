# Plan - Snapshot-Driven Billing and Stripe Payouts

Date: 2026-01-31
Owner: Billing Service / Platform
Status: Draft

## Goal
Implement a strictly snapshot-driven financial pipeline where placement_snapshot + placement_splits are the single source of truth for all billing and payouts. Company invoicing follows guarantee terms and configured billing terms. Stripe Connect transfers execute based solely on snapshot data, with no recalculation or dependency on live subscription state after snapshot creation.

## Non-Negotiables
- All financial outcomes are derived from immutable snapshot records created at hire.
- No retroactive recalculation or adjustment based on later subscription changes.
- Payouts are executed only after guarantee completion and payment is received/collectible per company terms.
- Stripe Connect transfers must map 1:1 to snapshot splits.

## Current Gaps (Abbreviated)
- Schema mismatch: placement_snapshot fields + rate semantics; subscription_tier enum mismatch.
- API route prefix mismatch for payouts schedules/escrow/discounts.
- Stripe Connect onboarding and transfer execution missing.
- Webhook handling is stub-only (V1) and not wired to V2 state changes.
- Payout schedules/escrow holds have placeholder processing logic.

## Phased Implementation Plan

### Phase 0 - Alignment and Decisions (Blocking)
1) Confirm canonical money model
   - Source of truth tables: `placement_snapshot`, `placement_splits`, `placement_payout_transactions`.
   - Decide whether to deprecate `payouts`/`payout_splits` or use them as admin/reporting views.
2) Define company billing profile fields
   - Minimal required: billing_terms (immediate/net30/net60/net90), billing_email, invoice_delivery_method.
   - Storage location: company/organization profile table.

### Phase 1 - Fix Schema + Code Alignment (Blocking)
1) Normalize `placement_snapshot` schema vs code
   - Align field names (`total_fee` vs `total_placement_fee`).
   - Align rate semantics (percentages vs dollars) and enforcement checks.
   - Align `subscription_tier` enum values between schema and code.
2) Update snapshot creation logic
   - Ensure snapshot stores explicit split percentages and total fee.
   - Store derived split amounts optionally for reporting only (not source of truth).
3) Update split creation logic
   - `createSplitsAndTransactionsForPlacement` must use snapshot percentages.
4) Add migration(s) to Supabase
   - Introduce corrected columns/enum, backfill if needed.

### Phase 2 - API + Route Fixes (Blocking)
1) Standardize billing-service V2 routes to `/api/v2/...` prefix
   - payout-schedules, escrow-holds, discounts.
2) Ensure API Gateway resource mappings match service routes.
3) Validate portal admin pages work end-to-end (schedules/escrow/discounts).

### Phase 3 - Stripe Connect Onboarding (Blocking for payouts)
1) Create Stripe Connect account endpoints
   - Create/retrieve connect account for recruiter.
   - Generate onboarding link and return_url flows.
2) Persist connect IDs + onboarding status
   - Store on recruiter/user record (stripe_connect_account_id, onboarded flags).
3) Webhook handling for `account.updated`
   - Update onboarded state and readiness.

### Phase 4 - Company Billing + Invoicing
1) Company billing profile CRUD
   - Admin UI and API to manage billing terms and invoice recipients.
2) Invoice creation on guarantee completion
   - Create Stripe invoice (or payment intent) using company’s billing terms.
   - Track invoice status in billing service.
3) Gate payout processing on payment status
   - Only mark placement as payable once invoice paid/collectible per terms.

### Phase 5 - Payout Execution (Stripe Transfers)
1) Add payout processing endpoint
   - `POST /api/v2/payouts/:id/process` or `POST /api/v2/placements/:id/payouts/process`.
2) Process `placement_payout_transactions`
   - Use Stripe Transfer with idempotency keys.
   - Update transaction status + stripe IDs.
3) Audit logging
   - Record all status transitions in `payout_audit_log`.
4) Failure handling and retries
   - Retry failed transfers; support manual overrides.

### Phase 6 - Schedule + Escrow Integration
1) Replace placeholder logic in payout schedule processing
   - Use eligibility checks: guarantee complete + invoice collectible.
2) Tie escrow holds to payout schedules
   - Automatically schedule release and process when hold clears.
3) Auto-create schedules on placement events
   - Use guarantee end date + billing terms.

### Phase 7 - Webhooks + State Sync
1) Implement V2 webhook handlers for:
   - `invoice.payment_succeeded`, `invoice.payment_failed`
   - `customer.subscription.updated/deleted`
   - `transfer.created/paid/failed`
   - `payout.paid/failed`
   - `account.updated`
2) Keep DB state in sync and clear caches (discounts, status).

### Phase 8 - Tests + Observability
1) Integration tests for:
   - Snapshot creation + split creation
   - Invoice creation + payout gating
   - Transfer execution + webhook reconciliation
2) Add structured logging for all payout decisions.

## Deliverables Checklist
- [ ] Schema alignment migration(s) applied
- [ ] Snapshot and split logic corrected
- [ ] API routes aligned with gateway
- [ ] Stripe Connect onboarding live
- [ ] Company billing profile CRUD
- [ ] Invoice creation + payment gating
- [ ] Transfer execution implemented
- [ ] Webhook handling complete
- [ ] Automation jobs use real payout logic
- [ ] Tests + logging coverage

## Notes
- This plan assumes all payout amounts are derived from immutable snapshots.
- Any UI or admin tooling should reference snapshot-derived data only.
