# Application Lifecycle Flow

Complete lifecycle of an application through the Splits Network platform, from creation to recruiter payout.

---

## Table of Contents

1. [Pre-Requisites & Setup](#1-pre-requisites--setup)
2. [Application Creation](#2-application-creation)
3. [Application Stages & Transitions](#3-application-stages--transitions)
4. [AI Review Loop](#4-ai-review-loop)
5. [Recruiter Review & Submission](#5-recruiter-review--submission)
6. [Company Review Pipeline](#6-company-review-pipeline)
7. [Placement Creation](#7-placement-creation)
8. [Invoice Generation](#8-invoice-generation)
9. [Commission Snapshot](#9-commission-snapshot)
10. [Commission Split Calculation](#10-commission-split-calculation)
11. [Escrow & Guarantee Period](#11-escrow--guarantee-period)
12. [Payout Processing](#12-payout-processing)
13. [Notifications](#13-notifications)
14. [Events Reference](#14-events-reference)

---

## 1. Pre-Requisites & Setup

Before an application can flow through the system, several entities must be set up.

### 1.1 Recruiter Onboarding

A recruiter must have an active profile and (for payouts) a Stripe Connect account.

**Stripe Connect Setup** (`services/billing-service/src/v2/connect/service.ts`):

1. Recruiter calls `getOrCreateAccount()` — creates a Stripe Express account if none exists
2. Recruiter completes Stripe onboarding via `createOnboardingLink()` (redirects to Stripe)
3. System verifies: `charges_enabled`, `payouts_enabled`, `details_submitted`
4. Once all three are true, `stripe_connect_onboarded = true` on the recruiter record

**Without Stripe Connect**, a recruiter cannot receive payouts — payout transactions will fail at processing time.

### 1.2 Company Onboarding

A company must have:

- A company profile (via identity-service)
- A **billing profile** with a Stripe customer ID and billing terms

**Billing terms** determine how placement invoices are collected:
| Term | Collection Method | Payment Window |
|------|-------------------|----------------|
| `immediate` | `charge_automatically` | Immediate |
| `net_30` | `send_invoice` | 30 days |
| `net_60` | `send_invoice` | 60 days |
| `net_90` | `send_invoice` | 90 days |

### 1.3 Job Posting

A job must exist with these key fields for the application/payout flow:

| Field                    | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `company_id`             | Which company owns this job                        |
| `fee_percentage`         | Placement fee as % of salary (0-100)               |
| `company_recruiter_id`   | Recruiter representing the company (nullable)      |
| `job_owner_recruiter_id` | Recruiter who created/owns the job spec (nullable) |
| `guarantee_days`         | Guarantee period in days (default: 90)             |
| `status`                 | Must be `active` for new applications              |

### 1.4 Recruiter-Candidate Relationship

Recruiters represent candidates via a formal relationship managed in the network service.

**Invitation Flow** (`services/network-service/src/v2/recruiter-candidates/service.ts`):

1. Recruiter creates relationship → generates invitation token (7-day expiry)
2. `candidate.invited` event published → notification sent to candidate
3. Candidate accepts invitation → relationship becomes `active`, consent recorded with IP/user agent
4. On acceptance, `candidate.sourcer_assignment_requested` event published → candidate sourcer attribution set

**Relationship statuses**: `active`, `inactive`, `blocked`, `declined`, `terminated`

Only `active` relationships are used for auto-assigning recruiter to applications.

### 1.5 Sourcer Attribution

Sourcers are the first recruiters to bring a candidate or company to the platform. Attribution is **permanent** while the sourcer's account remains active.

**Candidate Sourcers** (`services/ats-service/src/v2/candidate-sourcers/`):

- One sourcer per candidate (first recruiter wins)
- Stored in `candidate_sourcers` table with `UNIQUE(candidate_id)`
- Commission earned on every placement involving this candidate

**Company Sourcers** (`services/ats-service/src/v2/company-sourcers/`):

- One sourcer per company (first recruiter wins)
- Stored in `company_sourcers` table with `UNIQUE(company_id)`
- Commission earned on every placement at this company

If a sourcer's account becomes inactive, their commission share goes to the platform instead.

---

## 2. Application Creation

Applications can be created through two paths.

### 2.1 Path A: Candidate-Initiated

**Who**: Candidate applies to a job directly (via candidate portal or through their recruiter's portal).

**Flow** (`ApplicationServiceV2.createApplication()`):

1. `job_id` is required
2. System resolves `candidate_id` from the authenticated user's access context
3. System checks for an active recruiter-candidate relationship:
    - If `candidate_recruiter_id` provided in request → use it
    - Else if user has a `recruiterId` in access context → use it
    - Else query `recruiter_candidates` for an active relationship → use that recruiter
4. **Initial stage determined** (unless explicitly provided in request):
    - **Has recruiter** → `recruiter_proposed` (recruiter is notified, candidate proceeds to fill out application)
    - **No recruiter** → `ai_review` (direct application, goes straight to AI analysis)
5. Application created in database
6. Documents linked (if `document_ids` provided)
7. Pre-screen answers saved (if `pre_screen_answers` provided)
8. Audit log entry created
9. `application.created` event published

**Note**: Even in the candidate-initiated path, if the candidate has an active recruiter relationship, the application starts at `recruiter_proposed`. This ensures the recruiter is aware of all applications from their candidates. The candidate can then proceed to fill out and submit the application through the normal flow.

### 2.2 Path B: Recruiter-Initiated (Job Proposal)

**Who**: Recruiter proposes a job opportunity to one of their candidates.

**Flow** (`ApplicationServiceV2.proposeJobToCandidate()`):

1. Validates recruiter is active, candidate exists, job is active
2. Checks no existing active application for this candidate-job pair
3. Creates application with stage `recruiter_proposed`
4. Includes optional `pitch` and `notes` from recruiter
5. Audit log entry created with `action: 'recruiter_proposed'`
6. `application.recruiter_proposed` event published → notification sent to candidate

**Candidate Response**:

- **Accept** (`acceptProposal()`):
    - Only the candidate who owns the application can accept
    - Stage changes: `recruiter_proposed` → `draft`
    - Candidate can now fill out the application
    - `application.proposal_accepted` event published → recruiter notified

- **Decline** (`declineProposal()`):
    - Only the candidate who owns the application can decline
    - Stage changes: `recruiter_proposed` → `rejected`
    - Optional decline reason recorded
    - `application.proposal_declined` event published → recruiter notified

---

## 3. Application Stages & Transitions

### 3.1 All Application Stages

| Stage                | Category         | Description                                               |
| -------------------- | ---------------- | --------------------------------------------------------- |
| `draft`              | Preparation      | Candidate building/editing application                    |
| `ai_review`          | Preparation      | AI analyzing candidate-job fit (in progress)              |
| `ai_reviewed`        | Preparation      | AI complete, candidate reviewing feedback                 |
| `recruiter_request`  | Preparation      | Recruiter requested changes from candidate                |
| `recruiter_proposed` | Preparation      | Recruiter proposed this job to candidate                  |
| `recruiter_review`   | Review           | Candidate's recruiter reviewing before company submission |
| `screen`             | Review           | Screening stage (recruiter or initial screen)             |
| `submitted`          | Company Pipeline | Submitted to company for review                           |
| `company_review`     | Company Pipeline | Company is actively reviewing                             |
| `company_feedback`   | Company Pipeline | Company has provided feedback                             |
| `interview`          | Company Pipeline | Candidate in interview process                            |
| `offer`              | Company Pipeline | Offer extended to candidate                               |
| `hired`              | Terminal         | Candidate accepted, triggers placement                    |
| `rejected`           | Terminal         | Rejected at any stage                                     |
| `withdrawn`          | Terminal         | Candidate self-withdrew                                   |
| `expired`            | Terminal         | Application timed out                                     |

### 3.2 Stage Transition Rules

**Special transitions** (always or broadly allowed):

- `withdrawn` — allowed from **any** non-terminal stage (candidate self-service)
- `draft` — allowed from any non-terminal stage except `hired`, `withdrawn`, `expired`
- `recruiter_request` — allowed from any non-terminal stage (recruiter asks for changes)

**Forward transitions** (`validateStageTransition()` in `services/ats-service/src/v2/applications/service.ts`):

```
draft           → ai_review, screen, rejected
ai_review       → ai_reviewed, rejected
ai_reviewed     → draft, screen, submitted, rejected
recruiter_request → draft, ai_review, rejected
recruiter_proposed → ai_review, draft, recruiter_review, screen, submitted, rejected
recruiter_review → screen, submitted, draft, rejected
screen          → submitted, company_review, rejected
submitted       → company_review, interview, rejected
company_review  → company_feedback, interview, offer, rejected
company_feedback → interview, offer, recruiter_request, rejected
interview       → offer, rejected
offer           → hired, rejected
```

**Terminal stages** (no outbound transitions): `hired`, `rejected`, `withdrawn`, `expired`

**Validation**: Rejection requires notes/reason (`decline_reason` or `decline_details` or `notes`).

### 3.3 Stage Transition Diagram

```
                    ┌──────────────────────────────────────────────────┐
                    │           RECRUITER-INITIATED PATH               │
                    │                                                   │
                    │  Recruiter proposes job                           │
                    │         │                                         │
                    │         ▼                                         │
                    │  recruiter_proposed ──── decline ──→ rejected     │
                    │         │                                         │
                    │      accept                                       │
                    │         │                                         │
                    └─────────┼────────────────────────────────────────┘
                              ▼
    ┌─────────────────── draft ◄───────────────────────────────────────┐
    │                     │                                             │
    │          trigger AI review                                       │
    │                     ▼                                             │
    │               ai_review                                          │
    │                     │                                             │
    │            AI completes                                          │
    │                     ▼                                             │
    │              ai_reviewed ─── not satisfied ──→ back to draft ────┘
    │                     │
    │            candidate submits
    │                     │
    │          ┌──────────┼──────────────┐
    │          │                          │
    │     has recruiter             no recruiter
    │          │                          │
    │          ▼                          │
    │   recruiter_review                 │
    │     │         │                    │
    │  approve    reject                 │
    │     │         │                    │
    │     ▼         ▼                    │
    │  ┌──────┐  rejected               │
    │  │      │                          │
    │  │      ▼                          ▼
    │  │   submitted ◄───────────────────┘
    │  │      │
    │  │      ▼
    │  │  company_review
    │  │      │
    │  │      ▼
    │  │  company_feedback
    │  │      │
    │  │      ▼
    │  │  interview
    │  │      │
    │  │      ▼
    │  │    offer
    │  │      │
    │  │      ▼
    │  │    hired ──→ PLACEMENT CREATED
    │  │
    │  │  (rejected possible at any company pipeline stage)
    │  │  (withdrawn possible at any non-terminal stage)
    └──┘
```

---

## 4. AI Review Loop

The AI review loop ensures application quality before submission.

### 4.1 Trigger AI Review

**Method**: `triggerAIReview()` in `ApplicationServiceV2`

1. Only allowed from `draft` stage
2. Application moves to `ai_review`
3. `application.ai_review.triggered` event published
4. AI service (separate microservice) picks up event and analyzes candidate-job fit

### 4.2 AI Review Completion

**Method**: `handleAIReviewCompleted()` in `ApplicationServiceV2`

When the AI service completes analysis:

1. Application moves to `ai_reviewed` (NOT directly to submitted)
2. `ai_reviewed` flag set to `true` on application
3. `application.ai_reviewed` event published
4. If recommendation is `poor_fit` or `fair_fit` with concerns:
    - `application.needs_improvement` event published
    - Candidate notified about suggested improvements

**AI Review Results** include:

- `recommendation`: `strong_fit`, `good_fit`, `fair_fit`, `poor_fit`
- `concerns`: array of identified issues
- Fit score, matched skills, missing skills, experience analysis

### 4.3 Candidate Reviews Feedback

After AI review completes, candidate is in `ai_reviewed` stage and can:

**Option A — Return to Draft** (`returnToDraft()`):

- Allowed from `ai_reviewed`, `recruiter_request`, `screen`
- Moves back to `draft`, resets `ai_reviewed = false`
- Candidate can edit and trigger AI review again (unlimited retries)
- `application.returned_to_draft` event published

**Option B — Submit Application** (`submitApplication()`):

- Allowed from `ai_reviewed` or `screen`
- Next stage depends on recruiter presence:
    - **Has recruiter** → `recruiter_review`
    - **No recruiter** → `submitted` (straight to company)
- `application.submitted` event published

---

## 5. Recruiter Review & Submission

When a candidate has an active recruiter relationship, the recruiter reviews before company submission.

### 5.1 Recruiter Review Stage

After candidate submits from `ai_reviewed`:

- If `candidate_recruiter_id` exists → stage becomes `recruiter_review`
- Recruiter is notified that an application is pending their review

### 5.2 Recruiter Actions

From `recruiter_review`, the recruiter can:

| Action            | Transition                                                                | Description                         |
| ----------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| Approve           | `recruiter_review` → `submitted`                                          | Application forwarded to company    |
| Request changes   | `recruiter_review` → `recruiter_request` → (candidate returns to `draft`) | Recruiter asks candidate to improve |
| Send to screening | `recruiter_review` → `screen`                                             | Additional screening before company |
| Reject            | `recruiter_review` → `rejected`                                           | Recruiter rejects application       |

### 5.3 Recruiter Request Loop

When recruiter requests changes:

1. Application moves to `recruiter_request`
2. Candidate notified of requested changes
3. Candidate returns application to `draft`
4. Candidate makes edits and re-triggers AI review
5. Cycle continues until recruiter approves

### 5.4 Direct Candidate Submission (No Recruiter)

If candidate has no active recruiter relationship:

- Application goes directly from `ai_reviewed` → `submitted`
- Company is notified of the new application
- Candidate notified their application was submitted directly

---

## 6. Company Review Pipeline

Once an application reaches `submitted`, it enters the company's review pipeline.

### 6.1 Pipeline Stages

```
submitted → company_review → company_feedback → interview → offer → hired
                                                                      ↓
                                                             (rejected possible
                                                              at any stage)
```

| Stage              | Who Acts                  | Description                                       |
| ------------------ | ------------------------- | ------------------------------------------------- |
| `submitted`        | Company admins notified   | Application in company's queue                    |
| `company_review`   | Company reviews           | Active review of candidate                        |
| `company_feedback` | Company provides feedback | Feedback shared (can loop to `recruiter_request`) |
| `interview`        | Company schedules         | Candidate in interview process                    |
| `offer`            | Company extends           | Offer presented to candidate                      |
| `hired`            | Candidate accepts         | Terminal — triggers placement creation            |

### 6.2 Company Feedback Loop

From `company_feedback`, the flow can:

- Move forward to `interview` or `offer`
- Loop back to `recruiter_request` (company asks recruiter to address something)
- Result in `rejected`

### 6.3 Hired — Trigger Point

When application reaches `hired`:

- `application.stage_changed` event published with `new_stage: 'hired'`
- This is the trigger point for **placement creation**
- Application becomes a reference record; the placement takes over

---

## 7. Placement Creation

When an application reaches `hired`, a placement is created to track the deal and trigger billing.

### 7.1 Creating Placement from Application

**Method**: `PlacementServiceV2.createPlacementFromApplication()` (`services/ats-service/src/v2/placements/service.ts`)

**Steps**:

1. **Validate**: Application must be in `hired` stage
2. **Gather job data**: `company_id`, `company_recruiter_id`, `job_owner_recruiter_id`, `fee_percentage`, `guarantee_days`
3. **Gather 5 attribution roles**:

| #   | Role                             | Source                                | Description                                                      |
| --- | -------------------------------- | ------------------------------------- | ---------------------------------------------------------------- |
| 1   | `candidate_recruiter_id`         | `applications.candidate_recruiter_id` | Recruiter representing the candidate ("Closer")                  |
| 2   | `company_recruiter_id`           | `jobs.company_recruiter_id`           | Recruiter representing the company ("Client/Hiring Facilitator") |
| 3   | `job_owner_recruiter_id`         | `jobs.job_owner_recruiter_id`         | Recruiter who created the job posting ("Specs Owner")            |
| 4   | `candidate_sourcer_recruiter_id` | `candidate_sourcers` table            | First recruiter to bring candidate to platform ("Discovery")     |
| 5   | `company_sourcer_recruiter_id`   | `company_sourcers` table              | First recruiter to bring company to platform ("BD")              |

All five roles are **nullable**. Sourcer roles are only included if the sourcer's account is currently active.

4. **Calculate placement fee**:

    ```
    placement_fee = salary * fee_percentage / 100
    ```

5. **Set guarantee period**:

    ```
    guarantee_days = job.guarantee_days ?? 90
    guarantee_expires_at = start_date + guarantee_days
    ```

6. **Create placement record** with state `active`
7. **Link application**: Update `applications.placement_id` and `applications.hired_at`
8. **Publish event**: `placement.created` with all 5 role IDs, salary, fee_percentage, placement_fee

### 7.2 Placement Statuses

| Status      | Description                                             |
| ----------- | ------------------------------------------------------- |
| `pending`   | Placement just created, awaiting confirmation           |
| `confirmed` | Placement confirmed by admin                            |
| `active`    | Candidate has started working, guarantee period running |
| `completed` | Guarantee period passed, placement successful           |
| `cancelled` | Placement cancelled (candidate left, deal fell through) |

**Transitions**:

```
pending → confirmed, cancelled
confirmed → active, cancelled
active → completed, cancelled
completed → (terminal)
cancelled → (terminal)
```

Note: Company users (`company_admin` and `hiring_manager`) can mark placements as `completed`.

### 7.3 Direct Placement Creation

Placements can also be created directly (not from an application) via `createPlacement()`, which requires:

- `job_id`, `candidate_id`, `application_id`, `start_date`, `salary`, `fee_percentage`
- Uses the same `gatherAttribution()` method to collect all 5 role IDs

---

## 8. Invoice Generation

After placement creation, the hiring company is invoiced for the placement fee.

### 8.1 Invoice Creation Flow

**Method**: `PlacementInvoiceService.createForPlacement()` (`services/billing-service/src/v2/placement-invoices/service.ts`)

1. **Idempotency**: Check if invoice already exists for this placement
2. **Get placement snapshot**: Source of truth for total placement fee
3. **Get company billing profile**: Stripe customer ID and billing terms
4. **Ensure Stripe customer**: Create Stripe customer if not exists
5. **Map billing terms** to Stripe collection method:

| Billing Terms | Stripe Collection Method | Days Until Due |
| ------------- | ------------------------ | -------------- |
| `immediate`   | `charge_automatically`   | —              |
| `net_30`      | `send_invoice`           | 30             |
| `net_60`      | `send_invoice`           | 60             |
| `net_90`      | `send_invoice`           | 90             |

6. **Create Stripe invoice item**: Amount = `total_placement_fee * 100` (cents)
7. **Create Stripe invoice**: With collection method and metadata
8. **Finalize invoice**: Draft → Open
9. **Send invoice**: For `send_invoice` method, email sent to company
10. **Record locally**: Store in `placement_invoices` table with URLs, status, dates

### 8.2 Invoice Statuses

| Status          | Description                        |
| --------------- | ---------------------------------- |
| `draft`         | Invoice created but not finalized  |
| `open`          | Invoice finalized and sent/charged |
| `paid`          | Company has paid the invoice       |
| `void`          | Invoice voided                     |
| `uncollectible` | Invoice marked uncollectible       |

---

## 9. Commission Snapshot

An immutable snapshot captures all attribution and rates at placement time.

### 9.1 Snapshot Creation

**Method**: `PlacementSnapshotService.createSnapshot()` (`services/billing-service/src/v2/placement-snapshot/service.ts`)

The snapshot records:

- All 5 role IDs (from placement attribution)
- Each role's subscription tier (`free`, `paid`, `premium`)
- Calculated commission rate for each role (based on tier)
- Total placement fee

### 9.2 Commission Rate Structure

**Source**: `COMMISSION_RATES` in `packages/shared-types/src/commission.ts`

| Role                                            | Premium ($249/mo)        | Paid ($99/mo)           | Free ($0/mo)   |
| ----------------------------------------------- | ------------------------ | ----------------------- | -------------- |
| Candidate Recruiter ("Closer")                  | 40%                      | 30%                     | 20%            |
| Job Owner ("Specs Owner")                       | 20%                      | 15%                     | 10%            |
| Company Recruiter ("Client/Hiring Facilitator") | 20%                      | 15%                     | 10%            |
| Candidate Sourcer ("Discovery")                 | 10% (6% base + 4% bonus) | 8% (6% base + 2% bonus) | 6% (base only) |
| Company Sourcer ("BD")                          | 10% (6% base + 4% bonus) | 8% (6% base + 2% bonus) | 6% (base only) |
| **Platform Remainder**                          | **0%**                   | **24%**                 | **48%**        |

**Key rules**:

- All roles are nullable — when a role is `null`, that percentage goes to platform
- Each role's rate is determined by that individual recruiter's subscription tier
- Sourcer rates are based on 6% base + tier bonus
- Snapshot is immutable once created (rates locked at hire time)

### 9.3 Example Calculation

For a $100,000 salary, 20% fee ($20,000 placement fee), where:

- Candidate recruiter on Paid plan, Company recruiter on Free plan
- No job owner, No sourcers

| Role                       | Rate            | Amount      |
| -------------------------- | --------------- | ----------- |
| Candidate Recruiter (paid) | 30%             | $6,000      |
| Company Recruiter (free)   | 10%             | $2,000      |
| Job Owner                  | null → platform | $0          |
| Candidate Sourcer          | null → platform | $0          |
| Company Sourcer            | null → platform | $0          |
| Platform remainder         | 60%             | $12,000     |
| **Total**                  | **100%**        | **$20,000** |

---

## 10. Commission Split Calculation

After the snapshot is created, splits and transactions are generated.

### 10.1 Creating Splits and Transactions

**Method**: `PayoutServiceV2.createSplitsAndTransactionsForPlacement()` (`services/billing-service/src/v2/payouts/service.ts`)

**Data flow**: `placement → placement_snapshot → placement_splits → placement_payout_transactions`

**Step 1 — Create Placement Splits** (attribution layer):

- One `placement_split` record per active role
- Each records: `placement_id`, `recruiter_id`, `role`, `split_percentage`, `split_amount`
- `split_amount = total_placement_fee * split_percentage / 100`

**Step 2 — Create Payout Transactions** (execution layer):

- One `placement_payout_transaction` per split (1-to-1)
- Each records: `placement_split_id`, `recruiter_id`, `amount`, `status: 'pending'`
- These are the actual Stripe transfer records

**Idempotency**: If splits already exist for a placement, returns existing records.

### 10.2 Internal vs Admin-Triggered

- **Admin-triggered**: `createSplitsAndTransactionsForPlacement()` — requires billing admin access
- **System-triggered**: `createSplitsAndTransactionsForPlacementInternal()` — bypasses permissions, used by event consumers

Both methods produce identical results.

---

## 11. Escrow & Guarantee Period

Payouts are held in escrow during the placement guarantee period.

### 11.1 Escrow Hold Creation

**Service**: `EscrowHoldServiceV2` (`services/billing-service/src/v2/escrow-holds/service.ts`)

Escrow holds are created with:

- `placement_id` — which placement this hold is for
- `hold_amount` — amount held
- `hold_reason` — why the hold exists
- `release_scheduled_date` — when the hold should auto-release (must be in the future)

**Hold statuses**: `active`, `released`, `cancelled`

### 11.2 Automatic Release

**Method**: `processDueReleases()` — runs as a cron job

1. Finds all holds where `release_scheduled_date <= now()` and `status = 'active'`
2. Releases each hold:
    - Updates status to `released`
    - Logs to audit trail
    - Publishes `escrow_hold.auto_released` event
3. Reports results: processed count, failed count, errors

### 11.3 Manual Actions

Admins can:

- **Release** an active hold manually (`release()`)
- **Cancel** an active hold (`cancel()`)

Both actions log to audit trail and publish events.

---

## 12. Payout Processing

Once escrow holds are released and invoices are collectible, payouts are processed.

### 12.1 Payout Schedule

**Service**: `PayoutScheduleServiceV2` (`services/billing-service/src/v2/payout-schedules/service.ts`)

Payout schedules automate when transactions are processed:

- `placement_id` — which placement
- `scheduled_date` — when to process
- `trigger_event` — what event triggered this schedule

**Schedule statuses**: `scheduled`, `processing`, `processed`, `failed`, `cancelled`

### 12.2 Schedule Processing

**Method**: `processDueSchedules()` — runs as a cron job

For each due schedule:

1. **Mark as processing**
2. **Check invoice collectibility**:
    - Invoice status `paid` → collectible
    - Invoice status `open` AND `collectible_at <= now()` → collectible
    - Otherwise → **fail** (invoice not collectible yet)
3. **Execute Stripe transfers**: Calls `processPlacementTransactions()` for the placement
4. **Mark as processed** with payout reference

**Retry logic**: Failed schedules are retried up to 3 times. After max retries, `payout_schedule.failed` event published.

### 12.3 Transaction Processing

**Method**: `processPayoutTransaction()` (`services/billing-service/src/v2/payouts/service.ts`)

For each pending transaction:

1. **Validate**: Status must be `pending` or `failed`, amount must be positive
2. **Check recruiter Stripe Connect**:
    - Recruiter must have `stripe_connect_account_id`
    - Recruiter must have `stripe_connect_onboarded = true`
3. **Mark as processing**
4. **Create Stripe transfer**:
    ```
    stripe.transfers.create({
      amount: amountCents,
      currency: 'usd',
      destination: stripe_connect_account_id,
      idempotencyKey: `placement_payout_transaction_${transaction.id}`
    })
    ```
5. **On success**: Update status to `paid`, record `stripe_transfer_id`
6. **On failure**: Update status to `failed`, record `failure_reason`, increment `retry_count`

### 12.4 Transaction Statuses

```
pending → processing → paid (success)
                     → failed (can be retried)
```

Also: `reversed` (transfer reversed), `on_hold` (manually held)

---

## 13. Notifications

Email notifications are sent via the notification service (Resend) at each major stage transition.

### 13.1 Application Stage Notifications

**Consumer**: `ApplicationsEventConsumer` (`services/notification-service/src/consumers/applications/consumer.ts`)

| Stage Transition       | Candidate Email                         | Recruiter Email           | Company Email                           |
| ---------------------- | --------------------------------------- | ------------------------- | --------------------------------------- |
| → `recruiter_proposed` | Job proposal from recruiter             | Stage change notification | —                                       |
| → `ai_review`          | AI review started                       | Application pending       | —                                       |
| → `ai_reviewed`        | AI review complete + feedback           | Stage change notification | —                                       |
| → `recruiter_request`  | Recruiter requests changes              | —                         | —                                       |
| → `recruiter_review`   | Sent to recruiter for review            | Stage change notification | —                                       |
| → `screen`             | Application with recruiter              | Stage change notification | —                                       |
| → `submitted`          | Confirmation (direct or with recruiter) | Stage change notification | New application received                |
| → `company_review`     | Company is reviewing                    | Stage change notification | —                                       |
| → `company_feedback`   | Company feedback received               | Stage change notification | —                                       |
| → `interview`          | Interview invitation                    | Stage change notification | —                                       |
| → `offer`              | Offer received                          | Stage change notification | —                                       |
| → `hired`              | Congratulations, hired!                 | Stage change notification | Stage change notification               |
| → `rejected`           | Application rejected                    | Stage change notification | —                                       |
| → `withdrawn`          | —                                       | Stage change notification | Stage change (if previously submitted+) |
| → `expired`            | Application expired                     | Stage change notification | —                                       |

### 13.2 Recruiter Proposal Notifications

**Consumer**: `RecruiterSubmissionEventConsumer` (`services/notification-service/src/consumers/recruiter-submission/consumer.ts`)

| Event                  | Recipient | Description                                                     |
| ---------------------- | --------- | --------------------------------------------------------------- |
| Recruiter proposes job | Candidate | New opportunity with job details, recruiter pitch, 7-day expiry |
| Candidate accepts      | Recruiter | Candidate approved, with application URL                        |
| Candidate declines     | Recruiter | Candidate declined, with reason if provided                     |
| Opportunity expired    | Candidate | Reminder that opportunity has expired                           |

### 13.3 Submission Notifications

| Scenario                         | Candidate Email                         | Recruiter Email            | Company Email            |
| -------------------------------- | --------------------------------------- | -------------------------- | ------------------------ |
| Direct candidate submission      | Direct application confirmation         | —                          | New application received |
| Candidate submits with recruiter | Application with recruiter confirmation | Application pending review | —                        |
| Recruiter submits to company     | Submitted by recruiter notification     | Submission confirmation    | New application received |
| AI review stage                  | AI review in progress                   | Application pending        | —                        |

### 13.4 Placement Notifications

**Consumer**: `PlacementsEventConsumer` (`services/notification-service/src/consumers/placements/consumer.ts`)

| Event               | Recipients        | Description                               |
| ------------------- | ----------------- | ----------------------------------------- |
| Placement created   | Recruiter(s)      | Salary, commission details                |
| Placement activated | All collaborators | Start date, guarantee days, role, split % |
| Placement completed | All collaborators | Final payout amount                       |
| Placement failed    | All collaborators | Failure reason                            |
| Guarantee expiring  | All collaborators | Days remaining, guarantee end date        |

---

## 14. Events Reference

All domain events published during the application lifecycle.

### 14.1 Application Events

| Event                             | Published When              | Key Payload                                               |
| --------------------------------- | --------------------------- | --------------------------------------------------------- |
| `application.created`             | New application created     | application_id, job_id, candidate_id, recruiter_id, stage |
| `application.updated`             | Any application update      | application_id, updated_fields                            |
| `application.stage_changed`       | Stage transition            | application_id, old_stage, new_stage, changed_by          |
| `application.submitted`           | Candidate submits           | application_id, candidate_id, job_id, has_assignment      |
| `application.deleted`             | Application deleted         | applicationId, deletedBy                                  |
| `application.ai_review.triggered` | AI review started           | application_id, candidate_id, job_id                      |
| `application.ai_reviewed`         | AI review complete          | application_id, review_id, recommendation                 |
| `application.needs_improvement`   | AI found concerns           | application_id, concerns                                  |
| `application.returned_to_draft`   | Back to draft               | applicationId, from_stage                                 |
| `application.recruiter_proposed`  | Recruiter proposes job      | application_id, candidate_id, job_id, pitch               |
| `application.proposal_accepted`   | Candidate accepts proposal  | application_id, candidate_recruiter_id                    |
| `application.proposal_declined`   | Candidate declines proposal | application_id, reason                                    |

### 14.2 Placement Events

| Event                      | Published When    | Key Payload                                          |
| -------------------------- | ----------------- | ---------------------------------------------------- |
| `placement.created`        | Placement created | placement_id, all 5 role IDs, salary, fee_percentage |
| `placement.updated`        | Placement updated | placement_id, updated_fields                         |
| `placement.status_changed` | Status transition | placement_id, previous_status, new_status            |
| `placement.deleted`        | Placement deleted | placement_id, deleted_by                             |

### 14.3 Billing Events

| Event                       | Published When                 | Key Payload                                              |
| --------------------------- | ------------------------------ | -------------------------------------------------------- |
| `placement.splits_created`  | Splits calculated              | placementId, splitCount, totalPaidOut, platformRemainder |
| `payout.created`            | Payout record created          | payout data                                              |
| `payout.updated`            | Payout updated                 | id, changes                                              |
| `payout_schedule.created`   | Schedule created               | scheduleId, scheduledDate, triggerEvent                  |
| `payout_schedule.processed` | Schedule processed             | scheduleId, payoutId                                     |
| `payout_schedule.failed`    | Max retries exhausted          | scheduleId, reason, retryCount                           |
| `payout_schedule.cancelled` | Schedule cancelled             | scheduleId, reason                                       |
| `escrow_hold.created`       | Hold created                   | holdId, placementId, holdAmount                          |
| `escrow_hold.released`      | Hold manually released         | holdId, holdAmount                                       |
| `escrow_hold.auto_released` | Hold auto-released on schedule | holdId, holdAmount                                       |
| `escrow_hold.cancelled`     | Hold cancelled                 | holdId                                                   |

### 14.4 Network Events

| Event                                    | Published When           | Key Payload                                 |
| ---------------------------------------- | ------------------------ | ------------------------------------------- |
| `recruiter_candidate.created`            | Relationship created     | relationship_id, recruiter_id, candidate_id |
| `candidate.invited`                      | Invitation sent          | relationship_id, invitation_token           |
| `candidate.consent_given`                | Invitation accepted      | relationship_id, consent_given_at           |
| `candidate.consent_declined`             | Invitation declined      | relationship_id, declined_reason            |
| `candidate.sourcer_assignment_requested` | Sourcer attribution      | candidate_id, recruiter_id                  |
| `proposal.created`                       | Network proposal created | proposal_id, job_id, candidate_id           |
| `assignment.created`                     | Assignment created       | assignmentId, recruiterId, jobId            |

---

## Appendix A: Complete Flow Summary (Happy Path)

```
1.  Recruiter invites candidate → candidate accepts → relationship active
2.  Job posted with fee_percentage, company_recruiter_id, job_owner_recruiter_id
3.  Candidate creates application for job (recruiter auto-linked)
4.  Candidate fills out application (draft)
5.  Candidate triggers AI review (draft → ai_review)
6.  AI service analyzes and returns results (ai_review → ai_reviewed)
7.  Candidate reviews AI feedback, satisfied
8.  Candidate submits (ai_reviewed → recruiter_review, because has recruiter)
9.  Recruiter reviews and approves (recruiter_review → submitted)
10. Company receives application
11. Company reviews (submitted → company_review → interview → offer)
12. Candidate accepts offer (offer → hired)
13. Placement created from application with all 5 attribution roles
14. Placement snapshot created (immutable commission rates)
15. Company invoiced via Stripe (net_30/net_60/net_90 or immediate)
16. Commission splits calculated (one per active role)
17. Payout transactions created (one per split, status: pending)
18. Escrow holds active during guarantee period
19. Guarantee period expires → escrow holds auto-released
20. Invoice becomes collectible (paid or past due date)
21. Payout schedule triggers processing
22. Stripe transfers executed to each recruiter's connected account
23. Transactions marked as paid → recruiters receive funds
```

## Appendix B: Data Model Relationships

```
candidates ──┐
              ├──→ applications ──→ placements ──→ placement_snapshots
jobs ─────────┘         │                │              │
  │                     │                │              ├──→ placement_splits
  ├─ company_recruiter_id               │              │        │
  ├─ job_owner_recruiter_id             │              │        ▼
  └─ fee_percentage                     │              │  placement_payout_transactions
                                        │              │        │
recruiter_candidates                    │              │     Stripe Transfers
  (recruiter ↔ candidate)              │              │
                                        │              └──→ placement_invoices
candidate_sourcers                      │                       │
  (first recruiter → candidate)         │                    Stripe Invoices
                                        │
company_sourcers                        │
  (first recruiter → company)           │
                                        │
application_audit_log ◄─────────────────┘
```
