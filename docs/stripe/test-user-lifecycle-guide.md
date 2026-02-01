# Test User Lifecycle Guide (Candidate → Recruiter Payout)

This guide walks a test user through the full lifecycle: candidate applies → hire → guarantee → invoice → payout.  
It assumes the snapshot‑driven billing and payout system is deployed.

## Roles You’ll Use

You can run this flow with a minimal set of users:

- **Company Admin** (creates job + sets billing terms)
- **Candidate** (applies)
- **Recruiter** (assigned to the role; earns payout)

Optional additional roles for split testing:
- Candidate Recruiter (Closer)
- Company Recruiter (Client/Hiring Facilitator)
- Job Owner (Specs Owner)
- Candidate Sourcer (Discovery)
- Company Sourcer (BD)

## Pre‑Flight Checklist

- Company billing profile exists with **billing email** + **terms**.
- Recruiter has an **active subscription tier** (starter/pro/partner).
- Recruiter has **Stripe Connect** completed (payouts require onboarded account).
- CronJobs are running (hourly defaults):
  - create placement invoices
  - finalize invoices
  - process eligible payouts
  - complete expired guarantees

## Step‑By‑Step Lifecycle

### 1) Company Admin Creates Job

- Create a role with:
  - salary
  - fee percentage
  - required recruiter roles
  - company billing terms (immediate/net_30/net_60/net_90)
- Confirm company billing email exists on the company settings page.

**Expected system behavior**
- Job is created and visible in marketplace/portal.

### 2) Recruiter Is Assigned to Role

- Assign recruiter to the job (and optional sourcer roles if testing splits).
- Ensure recruiter subscription tier is correct.

**Expected system behavior**
- Recruiter appears on the role as the assigned collaborator.

### 3) Candidate Applies

- Candidate applies to the role.
- Recruiter advances candidate through stages.

**Expected system behavior**
- Application exists and is visible in the recruiter’s pipeline.

### 4) Candidate Hired → Placement Created

- Move application stage to **hired**.

**Expected system behavior**
- A **placement** is created.
- **placement.created** event fires.
- **placement_snapshot** is created:
  - role attributions
  - subscription tiers per role
  - locked fee totals
- **placement_splits** and **placement_payout_transactions** are created.

### 5) Guarantee Period Starts

- Placement enters **active** state with `guarantee_days`.
- `guarantee_expires_at` is set (start_date + guarantee_days).

**Expected system behavior**
- Guarantee timer is now authoritative for billing + payout readiness.

### 6) Guarantee Period Completes

After guarantee period expires:

- Cron job **completes placements** automatically.
- `placement.status_changed` event fires.

### 7) Invoice Creation

Once the guarantee is complete:

- **create placement invoices** job creates a Stripe invoice.
- **finalize invoices** job finalizes if draft/open.

**Expected system behavior**
- `placement_invoices` row exists with Stripe invoice IDs.
- `collectible_at` is set based on billing terms.

### 8) Invoice Collectibility Window

Depending on billing terms:

- **immediate** → collectible at finalize time
- **net_30/60/90** → collectible at due date

### 9) Payout Eligibility

Once invoice is collectible:

- **process eligible payouts** job finds collectible invoices
- payout schedules are processed for the placement
- Stripe transfers are created

**Expected system behavior**
- placement_payout_transactions move to **processing → paid**
- Stripe transfers exist and are linked to transactions

### 10) Recruiter Receives Payout

When Stripe confirms payout/transfer:

- Transfer/payout webhooks update transaction state.
- Recruiter sees payout completed.

## Validation Checklist

Use these checks to confirm each stage:

- Placement snapshot exists for placement
  - `placement_snapshot` has role tiers + total fee
- Splits and transactions exist
  - `placement_splits`, `placement_payout_transactions`
- Invoice exists + finalized
  - `placement_invoices` with `stripe_invoice_id`
- Collectibility met
  - `collectible_at <= now` or status paid
- Transfer created and paid
  - `stripe_transfer_id`, `stripe_payout_id`

## Common Failure Points

- Missing billing email on company profile
- Recruiter not onboarded to Stripe Connect
- Guarantee expiry missing (backfill job not run)
- Invoice exists but not finalized
- Invoice collectible date not reached

## Notes for Testing Splits

- Ensure all 5 commission roles are filled.
- Set different subscription tiers for each recruiter.
- Confirm each split respects tier‑based percentages.

---

If you want a narrower checklist per environment (staging vs prod) or an actual “test script” with example IDs, I can add that next.
