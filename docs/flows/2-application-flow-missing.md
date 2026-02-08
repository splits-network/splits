# Application Lifecycle Flow: Gap Analysis

Everything missing from the application flow defined in [1-application-flow-defined.md](./1-application-flow-defined.md).

Organized by flow section, covering backend services, frontend portal (recruiter/company), candidate portal, and infrastructure.

---

## Table of Contents

1. [Section 1: Pre-Requisites & Setup](#section-1-pre-requisites--setup)
2. [Section 2: Application Creation](#section-2-application-creation)
3. [Section 3: Application Stages & Transitions](#section-3-application-stages--transitions)
4. [Section 4: AI Review Loop](#section-4-ai-review-loop)
5. [Section 5: Recruiter Review & Submission](#section-5-recruiter-review--submission)
6. [Section 6: Company Review Pipeline](#section-6-company-review-pipeline)
7. [Section 7: Placement Creation](#section-7-placement-creation)
8. [Section 8: Invoice Generation](#section-8-invoice-generation)
9. [Section 9: Commission Snapshot](#section-9-commission-snapshot)
10. [Section 10: Commission Split Calculation](#section-10-commission-split-calculation)
11. [Section 11: Escrow & Guarantee Period](#section-11-escrow--guarantee-period)
12. [Section 12: Payout Processing](#section-12-payout-processing)
13. [Section 13: Notifications](#section-13-notifications)
14. [Section 14: Events Reference](#section-14-events-reference)
15. [Cross-Cutting Gaps](#cross-cutting-gaps)
16. [Summary](#summary)

---

## Section 1: Pre-Requisites & Setup

### 1.1 Recruiter Onboarding / Stripe Connect

| Layer            | Status   | Gap                                                                                                                                                                                                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend          | Complete | —                                                                                                                                                                                                                                                    |
| Portal UI        | Partial  | No Stripe Connect onboarding status indicator on recruiter profile. Recruiter has no visibility into whether their Stripe account is fully onboarded (`charges_enabled`, `payouts_enabled`, `details_submitted`) without navigating to billing page. |
| Candidate Portal | N/A      | —                                                                                                                                                                                                                                                    |

### 1.2 Company Onboarding / Billing Profile

| Layer     | Status   | Gap                                                                                                                                                                           |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete | —                                                                                                                                                                             |
| Portal UI | Partial  | Company billing profile setup exists but there is no guided onboarding flow that ensures billing terms are configured before a company can post jobs or receive applications. |

### 1.3 Job Posting - THIS IS COMPLETE

| Layer                    | Status                      | Gap                                                                                                         |
| ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                  | Complete                    | —                                                                                                           |
| Portal UI — Job Creation | Complete                    | 5-step wizard exists with fee_percentage, guarantee_days, compensation, requirements, pre-screen questions. |
| FALSE                    | Portal UI — Job Detail Page | **Missing**                                                                                                 | No `/portal/roles/[id]` detail page. Jobs only viewable via sidebar panel or modals. Cannot share a direct URL to a job. | // **This is not true. The job details page is in the applicants app public apps. the share button links to the applicant facing job details page. The portal does not have a recruiter facing job details page, but the public apps do have a job details page that is shared between recruiters and candidates. There is no reason for a role/app page in the portal app.** |
| FALSE                    | Portal UI — Job Editing     | **Missing**                                                                                                 | No ability for users to edit an existing job posting after creation.                                                     |
| FALSE                    | Portal UI — Job Analytics   | **Missing**                                                                                                 | No view/click tracking, application rate analytics, or time-to-hire metrics per job.                                     |

### 1.4 Recruiter-Candidate Relationship

| Layer            | Status   | Gap                                                                    |
| ---------------- | -------- | ---------------------------------------------------------------------- |
| Backend          | Complete | —                                                                      |
| Portal UI        | Complete | Invitation flow, recruiter marketplace, candidate directory all exist. |
| Candidate Portal | Complete | Token-based invitation acceptance/decline pages exist.                 |

### 1.5 Sourcer Attribution

| Layer     | Status   | Gap                                                                                                                                                                                                                                                                                                                                                    |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend   | Complete | Auto-creation via event consumer, conflict detection, CRUD operations all exist.                                                                                                                                                                                                                                                                       |
| Portal UI | Partial  | Admin ownership attribution page exists but there is no recruiter-facing view showing "I am the sourcer for these candidates/companies" with projected sourcer commissions. This is partially correct, if a recruiter is the sourcer, it does display when the candidate it being viewed by the sourcer. But it does not show the sourcer commmission. |

---

## Section 2: Application Creation

### 2.1 Path A: Candidate-Initiated

| Layer     | Status                                                                 | Gap                                                                                                                                                                                                                                                                                                                     |
| --------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend   | Complete                                                               | `createApplication()` handles candidate path, auto-resolves recruiter.                                                                                                                                                                                                                                                  |
| Portal UI | **a recruiter should not be able to spam assign a candidate to a job** | No recruiter-initiated "create application on behalf of candidate" form. The portal has "Submit Candidate to Job" and "Submit Candidate" wizards but these use a different flow path from the documented `createApplication()`. No way for a recruiter to initiate Path A on behalf of their candidate from the portal. |
| FALSE     | Candidate Portal                                                       | Partial                                                                                                                                                                                                                                                                                                                 | Candidates can view and respond to applications, but there is no standalone "Apply to Job" button on the job detail page (yes there is). The candidate portal job listing page (`/public/jobs/[id]`) shows job details but does not have a direct application creation form. Applications are created indirectly through recruiter proposals or the application wizard modal for existing applications only. |

### 2.2 Path B: Recruiter-Initiated (Job Proposal)

| Layer            | Status                                                                                                | Gap                                                                                                                                                                                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend          | Complete                                                                                              | `proposeJobToCandidate()`, `acceptProposal()`, `declineProposal()` all implemented. Routes exposed and proxied through API gateway.                                                                                                                                                         |
| Portal UI        | **FALSE, but may not actually be calling the endpoints specified because those are not V2 endpoints** | No job proposal flow in the recruiter portal. Recruiters cannot propose a job to a candidate from the portal UI. There is no "Propose Job to Candidate" button, modal, or wizard. The backend endpoint `POST /api/v2/applications/propose` exists but has no frontend caller in the portal. |
| Candidate Portal | Complete                                                                                              | Proposal response wizard exists (4-step: documents → questions → notes → review). Accept/decline modals functional. `proposal-actions.tsx`, `proposal-response-wizard.tsx`, `proposal-alert.tsx` all implemented.                                                                           |

---

## Section 3: Application Stages & Transitions

### 3.1 Stage Visualization

| Layer                               | Status      | Gap                                                                                                                                                                       |
| ----------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI — Pipeline/Kanban View    | **Missing** | No kanban board view showing applications organized by stage columns. No drag-and-drop stage transitions. Only browse/table/grid views exist with action buttons per row. | The flow of the applications in this product is managed through automation, not manual drag and drop, so a kanban board would not be appropriate. The current table view with action buttons is more suitable for the intended workflow. |
| Portal UI — Stage Flow Diagram      | **Missing** | No visual stage flow diagram showing where an application is in its lifecycle and what transitions are possible from the current stage.                                   |
| Portal UI — Application Detail Page | **Missing** | No `/portal/applications/[id]` route. Applications are only viewable in sidebar detail panels. Cannot share direct URLs to specific applications.                         |

### 3.2 Stage Transition Controls

The portal's `actions-toolbar.tsx` + `permission-utils.ts` handle approve/reject/add-note for most stages. However, several stage-specific flows are missing:

| Stage Transition                               | Portal UI Status | Gap                                                                                                                                                                                                      |
| ---------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `draft` → `ai_review`                          | **Missing**      | No "Trigger AI Review" button in portal. Backend endpoint exists (`POST /trigger-ai-review`) but portal has no caller.                                                                                   |
| `ai_reviewed` → `draft`                        | **Missing**      | No "Return to Draft" button in portal. Backend endpoint exists (`POST /return-to-draft`) but portal has no caller.                                                                                       |
| `ai_reviewed` → `submitted`/`recruiter_review` | **Missing**      | No "Submit Application" button in portal. Backend endpoint exists (`POST /submit`) but portal has no caller.                                                                                             |
| Any → `withdrawn`                              | **Missing**      | No "Withdraw Application" button for candidates in the portal. Backend supports it but no UI exists.                                                                                                     |
| `recruiter_review` → `recruiter_request`       | Partial          | Recruiter can reject but there is no dedicated "Request Changes" action that moves to `recruiter_request` stage specifically (distinct from rejection).                                                  |
| `company_feedback` → `recruiter_request`       | **Missing**      | No UI for company to loop back feedback to recruiter. The flow doc says company can request recruiter to address something via `recruiter_request`, but there is no specific button for this transition. |

**Note**: The candidate portal DOES have `ai-reviewed-actions.tsx` with working "Submit Application" and "Edit Application" (return to draft) buttons. These gaps are portal-side (recruiter/company view) only.

---

## Section 4: AI Review Loop

### 4.1 Trigger AI Review

| Layer            | Status      | Gap                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend          | Complete    | `triggerAIReview()` fully implemented. Event-driven integration with AI service works.                                                                                                                                                                                                                                                                                                     |
| Portal UI        | **Missing** | No "Trigger AI Review" button anywhere in the recruiter/company portal. The AI review results display panel exists (showing scores, strengths, concerns, skills), but there is no way to initiate a review from the portal.                                                                                                                                                                |
| Candidate Portal | Partial     | The AI review page (`/portal/applications/[id]/ai-review/page.tsx`) is **fully coded** with return-to-draft and submit buttons, BUT it is **gated** — the component returns `null` at line 33. The TODO comment states it's blocked pending V2 application-feedback endpoint alignment. The individual `ai-reviewed-actions.tsx` component (return to draft + submit) works independently. |

### 4.2 AI Review Results Display

| Layer            | Status  | Gap                                                                                                                                                                                                                                                                                                           |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI        | Partial | AI review tab exists in application detail sidebar showing score, recommendation, and basic feedback. Missing: detailed view with strengths list, concerns list, matched/missing skills, confidence level. The full rich display exists in the candidate portal's gated page but not in the recruiter portal. |
| Candidate Portal | Partial | `ai-review-panel.tsx` component exists with full display. The dedicated page is gated.                                                                                                                                                                                                                        |

### 4.3 AI Review Re-run

| Layer            | Status      | Gap                                                                                                                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI        | **Missing** | No ability to re-trigger AI review after returning to draft and editing.                                                                                            |
| Candidate Portal | **Missing** | Same — no explicit "Re-run AI Review" button after editing. The candidate must rely on the stage transition (draft → ai_review) but there is no UI to trigger this. |

---

## Section 5: Recruiter Review & Submission

### 5.1 Recruiter Review Stage UI

| Layer     | Status   | Gap                                                                                                                                                                                                                                                                                                                                     |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete | Stage transitions validated.                                                                                                                                                                                                                                                                                                            |
| Portal UI | Partial  | `recruiter_review` stage shows approve/reject buttons via permission-utils. **Missing**: A dedicated review interface showing the full application package the recruiter is evaluating — AI review results, candidate documents, pre-screen answers — presented as a review workflow rather than just approve/reject buttons on a card. |

### 5.2 Recruiter Request Changes Flow

| Layer            | Status      | Gap                                                                                                                                                                                                              |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend          | Complete    | `recruiter_request` stage exists in transition map.                                                                                                                                                              |
| Portal UI        | **Missing** | No "Request Changes" action that moves application to `recruiter_request` and allows the recruiter to specify what changes they want. The current approve/reject model doesn't include this intermediate action. |
| Candidate Portal | Partial     | Stage label displays for `recruiter_request` but there is no specific UI showing _what_ the recruiter requested the candidate to change.                                                                         |

---

## Section 6: Company Review Pipeline

### 6.1 Company Review Interface

| Layer                                | Status      | Gap                                                                                                                                                                                                                                                        |
| ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                              | Complete    | All stages and transitions implemented.                                                                                                                                                                                                                    |
| Portal UI — `submitted` stage        | Partial     | Company can accept (→ `company_review`) or reject. No structured intake form for the company to review against criteria.                                                                                                                                   |
| Portal UI — `company_review` stage   | Partial     | Two buttons exist: "Move to Interview" and "Move to Offer". **Missing**: Structured evaluation form, rating/scoring interface, comparison with other candidates for same job.                                                                              |
| Portal UI — `company_feedback` stage | **Missing** | No interface for companies to provide structured feedback. The stage exists in permission-utils but there is no feedback submission form — just approve/reject buttons. No way to send specific feedback text that becomes visible to recruiter/candidate. |
| Portal UI — `interview` stage        | Partial     | "Extend Offer" button exists. **Missing**: Interview scheduling integration, interview notes/feedback capture, interview panel management.                                                                                                                 |
| Portal UI — `offer` stage            | Partial     | "Mark as Hired" button exists. **Missing**: Offer details form (salary, start date, terms), offer letter attachment, offer acceptance tracking from candidate side.                                                                                        |

### 6.2 Hire Modal

| Layer     | Status  | Gap                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI | Partial | `hire-modal.tsx` exists in roles components for marking a candidate as hired with salary input. However, it is in the roles (jobs) section, not in the applications section. The application actions toolbar uses `ApproveGateModal` for the hire transition which captures salary. **Missing**: Start date field, which is required for placement guarantee period calculation. |

---

## Section 7: Placement Creation

### 7.1 Automatic Placement from Hired Application

| Layer     | Status      | Gap                                                                                                                                                              |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete    | Event consumer auto-creates placement when application reaches `hired`. All 5 attribution roles gathered.                                                        |
| Portal UI | **Missing** | No feedback to the user that a placement was auto-created when they mark an application as hired. No link from the hired application to its resulting placement. |

### 7.2 Manual Placement Creation

| Layer     | Status      | Gap                                                                                                         |
| --------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Backend   | Complete    | `createPlacement()` method exists for direct creation.                                                      |
| Portal UI | **Missing** | No manual placement creation form. Admin can view placements but cannot create one manually through the UI. |

### 7.3 Placement Detail View

| Layer                           | Status      | Gap                                                                                                                                                                                                                                    |
| ------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portal UI — Detail Page         | **Missing** | No `/portal/placements/[id]` route. Placements only viewable in sidebar panels. Cannot share direct URLs.                                                                                                                              |
| Portal UI — Attribution Display | **Missing** | No display showing the 5 attribution roles (candidate recruiter, company recruiter, job owner, candidate sourcer, company sourcer) and their commission rates on the placement detail view. Component may exist but is not integrated. |
| Portal UI — Status Transitions  | **Missing** | No buttons for transitioning placement status (pending → confirmed → active → completed). Admin placements page exists but lacks explicit status management controls.                                                                  |

### 7.4 Placement Edit

| Layer     | Status      | Gap                                                                                                  |
| --------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| Portal UI | **Missing** | No placement edit form. Cannot modify salary, start date, or other placement details after creation. |

---

## Section 8: Invoice Generation

| Layer                                | Status      | Gap                                                                                                                                 |
| ------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Backend                              | Complete    | `PlacementInvoiceService.createForPlacement()` fully implemented. Stripe integration works.                                         |
| Portal UI — Admin View               | Partial     | Admin can view invoice tracking in placements.                                                                                      |
| Portal UI — User-Facing Invoice List | **Missing** | No dedicated invoice list page for company users to see all their invoices with status, amounts, and Stripe payment links.          |
| Portal UI — Invoice Detail           | **Missing** | No invoice detail page showing line items, payment status, due dates, Stripe hosted invoice URL.                                    |
| Portal UI — Recruiter Invoice View   | **Missing** | Recruiters have no view showing invoices related to their placements and whether the company has paid (which affects their payout). |

---

## Section 9: Commission Snapshot

| Layer     | Status      | Gap                                                                                                                                                                                                   |
| --------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete    | Snapshot creation, rate lookup, immutable storage all working. Auto-created by billing event consumer on `placement.created`.                                                                         |
| Portal UI | **Missing** | No UI showing the commission snapshot for a placement — the locked-in rates at hire time for each of the 5 roles, their tiers, and calculated amounts. This is critical information for transparency. |

---

## Section 10: Commission Split Calculation

| Layer                                    | Status      | Gap                                                                                                                                                                                                                                 |
| ---------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                                  | Complete    | Split creation, transaction creation, platform remainder calculation all working.                                                                                                                                                   |
| Portal UI — Admin View                   | Partial     | Admin payouts page exists (`/portal/admin/payouts`).                                                                                                                                                                                |
| Portal UI — Recruiter Earnings Dashboard | **Missing** | No recruiter-facing earnings dashboard showing: total earned, pending payouts, completed payouts, earnings by placement, projected earnings from pipeline. The recruiter dashboard exists but does not include a financial summary. |
| Portal UI — Split Breakdown              | **Missing** | No view showing how a placement fee was split among the 5 roles with percentages and dollar amounts.                                                                                                                                |

---

## Section 11: Escrow & Guarantee Period

| Layer                            | Status      | Gap                                                                                                                                                                                     |
| -------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend                          | Complete    | Hold creation, manual release, auto-release method all implemented.                                                                                                                     |
| Portal UI — Admin                | Partial     | `/portal/admin/payouts/escrow` exists for admin escrow management.                                                                                                                      |
| Portal UI — Recruiter View       | **Missing** | Recruiters cannot see their escrow holds — when holds will be released, how much is being held, and why.                                                                                |
| Infrastructure — Cron Scheduling | Partial     | `autoReleaseScheduled()` method exists and K8s CronJob YAML exists (`infra/k8s/billing-service/cronjobs/escrow-releases.yaml`), but need to verify it is actually deployed and running. |

---

## Section 12: Payout Processing

| Layer                                   | Status      | Gap                                                                                                                                                          |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Backend                                 | Complete    | `processDueSchedules()`, `processPayoutTransaction()`, Stripe transfer creation all implemented.                                                             |
| Portal UI — Admin                       | Partial     | Admin payout pages exist: schedules, audit trail.                                                                                                            |
| Portal UI — Recruiter Payout Status     | **Missing** | Recruiters have no way to track the status of their payouts — pending, processing, paid, failed. No payout history page showing individual Stripe transfers. |
| Portal UI — Payout Failure Notification | **Missing** | When a payout fails (e.g., recruiter's Stripe Connect not configured), there is no UI showing the failure reason and how to resolve it.                      |
| Infrastructure — Cron Scheduling        | Complete    | K8s CronJob YAMLs exist for payout schedules and eligible payouts processing.                                                                                |

---

## Section 13: Notifications

### 13.1 Application Stage Notifications

| Notification                    | Backend  | Portal UI |
| ------------------------------- | -------- | --------- |
| All 14 stage transitions        | Complete | —         |
| AI review completed (candidate) | Complete | —         |
| AI review completed (recruiter) | Complete | —         |
| AI review failed                | Complete | —         |

### 13.2 Missing Notification Handlers

Three events are **bound to the RabbitMQ queue** but have **no handler implementation** in the notification service:

| Event                         | Bound In                      | Handler     | Impact                                               |
| ----------------------------- | ----------------------------- | ----------- | ---------------------------------------------------- |
| `replacement.requested`       | `domain-consumer.ts` line 177 | **Missing** | Replacement request notifications never sent         |
| `reputation.updated`          | `domain-consumer.ts` line 182 | **Missing** | Recruiter reputation change notifications never sent |
| `candidate.outreach_recorded` | `domain-consumer.ts` line 151 | **Missing** | Candidate outreach tracking notifications never sent |

### 13.3 Missing Notification Source Files

Two notification consumer/template families exist only as **compiled JavaScript in `/dist/`** — source TypeScript files are missing:

| Component            | Expected Location                       | Status             |
| -------------------- | --------------------------------------- | ------------------ |
| Feedback consumer    | `src/consumers/feedback/consumer.ts`    | **Source missing** |
| Feedback service     | `src/services/feedback/service.ts`      | **Source missing** |
| Feedback templates   | `src/templates/feedback/index.ts`       | **Source missing** |
| Gate event consumer  | `src/consumers/gate-events/consumer.ts` | **Source missing** |
| Gate event templates | `src/templates/gate-events/`            | **Source missing** |

These may have been deleted during CRA gate system removal but the compiled versions remain in `/dist/`.

### 13.4 Notification Preferences

| Layer            | Status      | Gap                                                                                                                                |
| ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Backend          | **Missing** | No notification preferences API. Users cannot configure which notifications they receive, frequency, or channel (email vs in-app). |
| Portal UI        | **Missing** | No notification settings page. Only notification viewing/filtering exists at `/portal/notifications`.                              |
| Candidate Portal | **Missing** | Same — no notification preference controls.                                                                                        |

---

## Section 14: Events Reference

| Layer                       | Status      | Gap                                                                                                     |
| --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| Backend — Event Publishing  | Complete    | All documented events are published by their respective services.                                       |
| Backend — Event Consumption | Partial     | 37/40 bound events are consumed. 3 events are bound but unhandled (see Section 13.2).                   |
| Observability               | **Missing** | No event flow dashboard or dead letter queue monitoring UI. No way to see failed events or replay them. |

---

## Cross-Cutting Gaps

These gaps span multiple sections of the application flow and affect the overall experience.

### C.1 Detail Page Routes

No individual detail page routes exist in the portal for the three core entities:

| Route                       | Status      | Impact                                         |
| --------------------------- | ----------- | ---------------------------------------------- |
| `/portal/applications/[id]` | **Missing** | Cannot share application URLs, no deep linking |
| `/portal/placements/[id]`   | **Missing** | Cannot share placement URLs, no deep linking   |
| `/portal/roles/[id]`        | **Missing** | Cannot share job URLs, no deep linking         |

All three are only viewable via sidebar panels or modals within their respective list pages.

### C.2 Recruiter Earnings & Financial Dashboard

No recruiter-facing financial overview exists. A recruiter cannot see:

- Total lifetime earnings
- Pending payout amounts
- Active escrow holds
- Commission projections from pipeline
- Payout history with Stripe transfer details
- Earnings breakdown by role (closer, sourcer, etc.)

The admin has payout management pages, but recruiters have no self-service financial view.

### C.3 Application Lifecycle Visibility

No single view shows the complete journey of an application from creation to payout:

- Application stage history with timestamps
- Associated placement (if hired)
- Invoice status (if placement exists)
- Commission snapshot (if snapshot exists)
- Payout transaction status (if splits created)

Each of these is tracked in separate backend tables but there is no unified timeline or journey view in either portal.

### C.4 Bulk Operations

No bulk actions exist anywhere in the portal:

- Cannot bulk-reject applications
- Cannot bulk-move applications through stages
- Cannot bulk-invite candidates
- Cannot bulk-export data (applications, placements, payouts)

### C.5 Subscription Plan Management

| Layer     | Status      | Gap                                                                                                                                                                                                |
| --------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete    | Plans, subscriptions, and discount services exist in billing service with full CRUD.                                                                                                               |
| Portal UI | **Missing** | No subscription plan selection/upgrade/downgrade UI for recruiters. Subscription tier determines commission rates (the core revenue model) but recruiters cannot manage their subscription in-app. |
| Portal UI | **Missing** | No payment method management for recurring subscription billing.                                                                                                                                   |

### C.6 Job Editing

| Layer     | Status      | Gap                                                                                                                                                                   |
| --------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend   | Complete    | PATCH endpoint exists for updating jobs.                                                                                                                              |
| Portal UI | **Missing** | No job editing form. After creating a job with the 5-step wizard, there is no way to modify it (change fee percentage, update requirements, edit descriptions, etc.). |

---

## Summary

### Backend Completeness: ~98%

The backend services are nearly complete. All core flows — application creation, stage transitions, AI review, placement creation, invoicing, commission calculation, escrow, and payout processing — are fully implemented with event-driven integration between services.

**Backend gaps (3 items):**

1. 3 unhandled notification events (replacement.requested, reputation.updated, candidate.outreach_recorded)
2. Missing notification source files (feedback + gate events — compiled JS exists, TS source missing)
3. No notification preferences API

### Portal UI (Recruiter/Company) Completeness: ~55%

The portal has strong list/browse/search infrastructure and basic stage advance/reject controls, but is missing many workflow-specific features.

**Critical portal gaps:**

1. No job proposal flow (recruiter → candidate)
2. No AI review trigger, return-to-draft, or submit buttons
3. No application/placement/job detail page routes (only sidebar panels)
4. No recruiter earnings/payout dashboard
5. No company feedback submission interface
6. No placement attribution/commission display
7. No subscription management
8. No job editing
9. No "Request Changes" (recruiter_request) workflow
10. No pipeline/kanban visualization

### Candidate Portal Completeness: ~85%

The candidate portal covers most of the candidate-facing flow well.

**Candidate portal gaps:**

1. AI review page gated/disabled (returns null) — pending V2 application-feedback endpoint
2. No standalone "Apply to Job" button on job detail page
3. No explicit "Trigger AI Review" button (relies on stage transitions)
4. No notification preferences

### Infrastructure Completeness: ~95%

K8s CronJob YAMLs exist for all critical automated processes.

**Infrastructure gaps:**

1. Verify cron jobs are actually deployed and running in staging/production
2. No dead letter queue monitoring or event replay capability
