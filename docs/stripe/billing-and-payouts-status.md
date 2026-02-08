# Billing & Stripe Payouts Implementation Status

Date: 2026-01-31
Owner: Billing Service / Platform

## Summary

The repo has a strong V2 billing foundation: subscription plans, Stripe SetupIntent + subscription activation, discount code validation, placement snapshots, split attribution, payout schedule/escrow hold automation scaffolding, and admin UIs. The critical missing pieces are Stripe Connect onboarding and money movement (transfers/payout execution), webhook synchronization, and a few schema/route mismatches that currently block end-to-end payouts.

## Current State (What Exists)

### Data Model (Supabase baseline)

- Core tables exist: `plans`, `subscriptions`, `payouts`, `placement_snapshot`, `placement_splits`, `placement_payout_transactions`, `payout_schedules`, `escrow_holds`, `payout_audit_log`, `payout_splits`.
- Stripe fields exist on plans/subscriptions/payouts and recruiter/user records (connect account + onboarding flags).
- Reference: `supabase/migrations/20240101000000_baseline.sql`.

### Billing Service V2

- Plans CRUD and list endpoints wired: `services/billing-service/src/v2/plans/*`.
- Subscriptions:
    - SetupIntent + activation flow (Stripe customer + subscription create) implemented.
    - Payment method fetch/update and invoice fetch implemented via Stripe APIs.
    - Plan changes update Stripe subscription with proration.
    - Reference: `services/billing-service/src/v2/subscriptions/service.ts`.
- Discounts:
    - Stripe promotion code validation with caching implemented.
    - Subscription discount CRUD in DB partially implemented.
    - Reference: `services/billing-service/src/v2/discounts/*`.
- Payouts (V2):
    - Snapshot-driven split attribution and placement payout transaction records created from placement events.
    - CRUD for `payouts` table exists.
    - Reference: `services/billing-service/src/v2/payouts/*`.
- Placement snapshots:
    - Snapshot creation on `placement.created` event with commission rate logic.
    - Reference: `services/billing-service/src/v2/placement-snapshot/*` and `services/billing-service/src/events/placement-consumer.ts`.
- Automation scaffolding:
    - Payout schedules + escrow holds services + routes.
    - Daily jobs to process schedules and escrow releases.
    - Audit logging for payout schedule/hold actions.
    - Reference: `services/billing-service/src/v2/payout-schedules/*`, `services/billing-service/src/v2/escrow-holds/*`, `services/billing-service/src/jobs/*`.

### API Gateway

- V2 billing routes registered for plans/subscriptions/payouts/payout-schedules/escrow-holds/discounts.
- Reference: `services/api-gateway/src/routes/v2/billing.ts`.

### Frontend

- Portal onboarding includes plan selection, Stripe payment collection, and activation flow.
- Billing pages exist for plan changes, payment method management, and invoice history.
- Admin UI pages for payouts, schedules, escrow holds, audit log exist.
- References:
    - `apps/portal/src/components/onboarding/steps/subscription-plan-step.tsx`
    - `apps/portal/src/components/stripe/payment-form.tsx`
    - `apps/portal/src/app/portal/admin/payouts/*`

### Stripe Webhooks (V1)

- Webhook route and signature verification exist, but handler is a stub and not V2-integrated.
- Reference: `services/billing-service/src/services/webhooks/service.ts`.

## Known Gaps / Blocking Issues

### Schema Alignment Bugs

- `placement_snapshot` schema expects rates as 0–100 percentages and `total_placement_fee` field, but V2 code uses:
    - `total_fee` naming in types and inserts.
    - Rate values are stored as dollar amounts, not percentages.
- `placement_snapshot.subscription_tier` enum in schema (`free|paid|premium`) does not match V2 code (`FREE|STANDARD|PRO|ENTERPRISE`).
- This breaks split calculations because `createSplitsAndTransactionsForPlacement` treats snapshot rates as percentages.
- References:
    - Schema: `supabase/migrations/20240101000000_baseline.sql`
    - Code: `services/billing-service/src/v2/placement-snapshot/*`, `services/billing-service/src/v2/payouts/service.ts`.

### API Path Mismatch (Payout Schedules, Escrow Holds, Discounts)

- Billing service routes are mounted at `/payout-schedules`, `/escrow-holds`, and `/api/v2/discounts/*` (no `/api/v2` prefix), but API Gateway expects `/api/v2/...`.
- This blocks portal admin pages (schedules/escrow) and discount validation from the frontend gateway client.
- References: `services/billing-service/src/v2/payout-schedules/routes.ts`, `services/billing-service/src/v2/escrow-holds/routes.ts`, `services/billing-service/src/v2/discounts/routes.ts`, `services/api-gateway/src/routes/v2/common.ts`.

### Payout Execution Missing (Stripe Connect)

- No Stripe Connect onboarding, no account creation/linking, no transfer logic.
- `placement_payout_transactions` are created but never processed to Stripe transfers.
- Admin UI calls `POST /payouts/:id/process` but no endpoint exists.
- References: `services/billing-service/src/v2/payouts/routes.ts`, `apps/portal/src/app/portal/admin/payouts/page.tsx`.

### Payout Model Drift

- `payouts` table exists but automated flow uses `placement_splits` + `placement_payout_transactions` only.
- `payout_splits` table exists in schema but has no V2 domain.
- Needs a decision: unify on `placement_*` tables or move to `payouts/payout_splits` for money movement.

### Discounts Not Fully Wired

- Promotion validation exists, but applied discount is not passed into subscription activation.
- `DiscountServiceV2.applyDiscount` stores a record but does not update Stripe subscription.
- No webhook handling to record Stripe redemption or invalidate cache.
- References: `services/billing-service/src/v2/discounts/service.ts`, `apps/portal/src/components/stripe/payment-form.tsx`.

### Webhook Sync Not Implemented

- V2 services do not consume Stripe events for:
    - subscription lifecycle updates
    - invoice paid/failed
    - transfer/payout status
    - connect account onboarding status
- V1 webhook handler is stub-only.
- Reference: `services/billing-service/src/services/webhooks/service.ts`.

### Plan Creation Validation

- `PlanServiceV2.createPlan` requires `price_cents`, but plan model uses `price_monthly`/`price_annual`.
- Check plan creation flows and schema expectations.

### Discount Migration Not Applied to Supabase

- `services/billing-service/migrations/add_subscription_discounts.sql` exists but is not part of `supabase/migrations`.
- Need a migration strategy to keep DB in sync.

## What to Implement Next (Recommended Sequence)

### 1) Fix Data Model Alignment (Blocking)

- Decide whether snapshot rates are percentages (0–100) or dollar amounts.
- Update `PlacementSnapshotService` and `PlacementSnapshot` types to match schema.
- Align field names (`total_fee` vs `total_placement_fee`).
- Update `createSplitsAndTransactionsForPlacement` calculations accordingly.

### 2) Fix API Route Prefixes (Blocking)

- Either:
    - Change billing-service payout schedule and escrow hold routes to `/api/v2/...`, or
    - Update API gateway `serviceBasePath` for those resources.

### 3) Stripe Connect Onboarding (Blocking for payouts)

- Add endpoints to create/retrieve Connect account and onboarding links.
- Persist `stripe_connect_account_id` + onboarding status on recruiter/user.
- Add webhook handling for `account.updated` to mark onboarding complete.

### 4) Implement Money Movement (Transfers + Payouts)

- Add `/api/v2/payouts/:id/process` endpoint (or equivalent) to:
    - Lock rows, create Stripe transfer to Connect account.
    - Update `placement_payout_transactions` and/or `payouts` with Stripe IDs.
    - Use idempotency keys and retry logic.
    - Log audit events.
- Decide whether to use `payouts` + `payout_splits` or only `placement_*` tables.

### 5) Wire Payout Schedules + Escrow Holds to Real Payouts

- Replace placeholder logic in `PayoutScheduleServiceV2.processSchedule`.
- Add escrow checks before payout processing.
- Create schedule entries automatically on placement events or guarantee date triggers.

### 6) Webhooks + State Sync

- Implement V2 webhook handlers for:
    - `invoice.payment_succeeded`, `invoice.payment_failed`
    - `customer.subscription.updated/deleted`
    - `transfer.created/paid/failed`
    - `payout.paid/failed`
    - `account.updated`
- Update subscription status, payout statuses, audit logs, and discount cache accordingly.

### 7) Discounts End-to-End

- Pass validated promotion code into subscription activation.
- Persist the discount usage record on success.
- Implement removal flow that updates Stripe subscription and DB.

### 8) Tests + Observability

- Add integration tests for:
    - subscription activation
    - split generation
    - payout processing
    - webhook handling
- Add structured logging for payout failures and Stripe errors.

## File Pointers

- Stripe subscription flow: `services/billing-service/src/v2/subscriptions/service.ts`
- Discount validation + apply: `services/billing-service/src/v2/discounts/service.ts`
- Payout split creation: `services/billing-service/src/v2/payouts/service.ts`
- Payout schedule automation: `services/billing-service/src/v2/payout-schedules/service.ts`
- Escrow hold automation: `services/billing-service/src/v2/escrow-holds/service.ts`
- Placement event consumer: `services/billing-service/src/events/placement-consumer.ts`
- V1 webhook stub: `services/billing-service/src/services/webhooks/service.ts`
- API Gateway billing routes: `services/api-gateway/src/routes/v2/billing.ts`
- Supabase baseline schema: `supabase/migrations/20240101000000_baseline.sql`
- Discount migration draft: `services/billing-service/migrations/add_subscription_discounts.sql`
