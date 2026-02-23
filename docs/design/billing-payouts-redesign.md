# Billing & Payouts UX Redesign Plan

**Author:** Basel Design System
**Date:** 2026-02-22
**Status:** Draft
**Scope:** Recruiter profile billing sections (Subscription + Payouts)

---

## Table of Contents

1. [Persona Model](#1-persona-model)
2. [Problem Analysis](#2-problem-analysis)
3. [Information Architecture](#3-information-architecture)
4. [View A: Subscription Tab](#4-view-a-subscription-tab)
5. [View B: Payouts Tab](#5-view-b-payouts-tab)
6. [Setup Wizards](#6-setup-wizards)
7. [Component Architecture](#7-component-architecture)
8. [Bug Fixes & Technical Debt](#8-bug-fixes--technical-debt)
9. [Implementation Phases](#9-implementation-phases)

---

## 1. Persona Model

Two distinct billing personas — **never merged**.

### Company User
- Billing belongs to the **company**, not the individual
- Managed at `/portal/company/settings?tab=billing`
- Covers: billing profile, company payment method, placement invoices
- **Out of scope for this redesign** (stays where it is)

### Recruiter
- Billing is **individual**, even if on a team
- Managed at `/portal/profile` under the Billing sidebar group
- Two financial concerns:
  - **Subscription** (money OUT) — platform plan, payment method, subscription invoices
  - **Payouts** (money IN) — Stripe Connect, bank account, payout schedule/history
- **This redesign consolidates 4 disconnected sidebar items into 2 cohesive tabs**

---

## 2. Problem Analysis

### Current State: 4 Disconnected Panels

The recruiter profile has 4 separate sidebar nav items under "Billing":

| Sidebar Item | Component | Problem |
|---|---|---|
| Subscription | `SubscriptionSection` | Shows plan + price but payment method is elsewhere |
| Payment Methods | `PaymentSection` | Isolated from the subscription it pays for |
| Invoice History | `HistorySection` | No context — just dates and amounts |
| Payouts | `PayoutsSection` | Thin wrapper, no bank details or payout history when ready |

Users click between 4 items with no visual relationship. Payment methods float
alone with no connection to the subscription. Invoice history is a separate
destination rather than contextual information below the plan.

### Technical Issues Found

| #  | Problem | Severity | Location |
|----|---------|----------|----------|
| 1  | Raw bank account numbers transit backend (PCI risk) | Critical | `connect-modal.tsx` → `connect/service.ts` |
| 2  | Stale closure: identity verification may never trigger | Critical | `connect-modal.tsx` line ~675 |
| 3  | Wizard state not reset on re-open (stale form data) | High | Both wizards |
| 4  | "Skip for now" appears twice on billing wizard payment step | Medium | `billing-setup-wizard.tsx` + `payment-form.tsx` |
| 5  | `action_required` forces full 4-step wizard | Medium | `connect-modal.tsx` |
| 6  | Ready state shows no account details (bank name, schedule) | Medium | `connect-status-card.tsx` |
| 7  | Hardcoded `return_url: /onboarding/callback` in PaymentForm | Medium | `payment-form.tsx` |
| 8  | Invoice history has no "description" beyond billing period | Low | `history-section.tsx` |
| 9  | `ConnectPromptBanner` flickers on mount | Low | `connect-prompt-banner.tsx` |
| 10 | `yearOptions` computed twice (dead code) | Low | `connect-modal.tsx` |

---

## 3. Information Architecture

### Current Structure (4 separate items)

```
/portal/profile
  Sidebar → Billing group:
    [Subscription]      → SubscriptionSection (isolated panel)
    [Payment Methods]   → PaymentSection (isolated panel)
    [Invoice History]   → HistorySection (isolated panel)
    [Payouts]           → PayoutsSection (isolated panel)
```

### Proposed Structure (2 cohesive tabs)

```
/portal/profile?tab=subscription
  ┌──────────────────────────────────────────────────┐
  │  [ Subscription ]  [ Payouts ]                   │  ← tab bar
  │                                                  │
  │  Plan details + Payment method + Invoice history │  ← one unified view
  └──────────────────────────────────────────────────┘

/portal/profile?tab=payouts
  ┌──────────────────────────────────────────────────┐
  │  [ Subscription ]  [ Payouts ]                   │  ← tab bar
  │                                                  │
  │  Connect status + Bank details + Payout history  │  ← one unified view
  └──────────────────────────────────────────────────┘
```

### Sidebar Changes

The "Billing" nav group goes from 4 items to 2:

```
Before:                          After:
─ Billing ──────────────         ─ Billing ──────────────
  Subscription                     Subscription
  Payment Methods                  Payouts
  Invoice History
  Payouts
```

**Deep linking:** Update the profile page to support `?tab=subscription` and
`?tab=payouts` query params so these can be linked to directly (e.g., from
email notifications, onboarding flows, or cross-links from company settings).

---

## 4. View A: Subscription Tab

The Subscription tab shows everything about the recruiter's platform subscription
in one editorial layout. Money going **out**.

### Wireframe: Active Subscription

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--60/40 SPLIT LAYOUT----------------------------------------------------+
|  |                                                                         |
|  |  LEFT COLUMN (60%)                    RIGHT COLUMN (40%)                |
|  |                                                                         |
|  |  +--YOUR PLAN----------------------+   +--PAYMENT METHOD-----------+   |
|  |  |                                  |   |                           |   |
|  |  |  KICKER: CURRENT PLAN           |   |  KICKER: PAYMENT METHOD   |   |
|  |  |                                  |   |                           |   |
|  |  |  PROFESSIONAL          [ACTIVE]  |   |  [VISA ICON]             |   |
|  |  |                                  |   |  Visa ●●●● 4242          |   |
|  |  |  $49/month                       |   |  Expires 08/2027         |   |
|  |  |                                  |   |                           |   |
|  |  |  [calendar] Next renewal:        |   |  [Update Card]           |   |
|  |  |  March 22, 2026                  |   |                           |   |
|  |  |                                  |   +---------------------------+   |
|  |  |  ──────────────────────          |                                   |
|  |  |                                  |   +--QUICK LINKS--------------+  |
|  |  |  WHAT'S INCLUDED:               |   |                           |   |
|  |  |                                  |   |  Need to receive fees?    |   |
|  |  |  [check] Access to marketplace   |   |  [Set up payouts -->]    |   |
|  |  |  [check] Candidate management    |   |                           |   |
|  |  |  [check] Application tracking    |   |  Company billing?        |   |
|  |  |  [check] Email notifications     |   |  [Company Settings -->]  |   |
|  |  |  [check] Priority support        |   |                           |   |
|  |  |                                  |   +---------------------------+   |
|  |  |  [Manage Plan]                   |                                   |
|  |  |                                  |                                   |
|  |  +----------------------------------+                                   |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
|  +--INVOICE HISTORY------------------------------------------------------+
|  |                                                                         |
|  |  KICKER: BILLING HISTORY                                                |
|  |                                                                         |
|  |  +--TABLE-----------------------------------------------------------+  |
|  |  | Date       | Description          | Amount  | Status   | Invoice |  |
|  |  +--------------------------------------------------------------+   |  |
|  |  | Feb 22     | Professional Plan    | $49.00  | [PAID]   | PDF   |  |
|  |  |            | Feb 22 – Mar 22      |         |          |       |  |
|  |  +--------------------------------------------------------------+   |  |
|  |  | Jan 22     | Professional Plan    | $49.00  | [PAID]   | PDF   |  |
|  |  |            | Jan 22 – Feb 22      |         |          |       |  |
|  |  +--------------------------------------------------------------+   |  |
|  |  | Dec 22     | Professional Plan    | $49.00  | [PAID]   | PDF   |  |
|  |  |            | Dec 22 – Jan 22      |         |          |       |  |
|  |  +--------------------------------------------------------------+   |  |
|  |                                                                       |
|  |  [Load More]                                                          |
|  +-----------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Wireframe: No Subscription

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--EMPTY STATE-----------------------------------------------------------+
|  |                                                                         |
|  |                    [BOX ICON - large]                                   |
|  |                                                                         |
|  |                 No Active Subscription                                  |
|  |                                                                         |
|  |        Subscribe to a plan to access all recruiter features             |
|  |        and start earning placement fees.                                |
|  |                                                                         |
|  |                   [View Plans]                                          |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Wireframe: Past Due / Canceled

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--ALERT BANNER---------------------------------------------------------+
|  |  [!] Your last payment failed. Update your payment method to avoid     |
|  |      service interruption.  [Update Payment Method]                    |
|  +-----------------------------------------------------------------------+
|                                                                            |
|  (... same 60/40 layout as active, but with [PAST DUE] status pill ...)   |
|                                                                            |
+============================================================================+
```

### Design Details

**Plan Card (left column):**
- `border-l-4` with status color (success=active, warning=past_due, error=canceled)
- Plan name as `text-lg font-black uppercase tracking-tight`
- Status pill next to plan name
- Price as `text-3xl font-black`
- Renewal date with calendar icon
- Features list with check icons
- "Manage Plan" button opens the existing `BaselPlanModal`

**Payment Method Card (right column):**
- `bg-base-200 border border-base-300` card
- Card brand icon (large), last 4, expiry
- "Update Card" button opens the existing Stripe Elements modal
- If no payment method: warning state with "Add Payment Method" CTA

**Invoice History (full width below):**
- Same table structure as current `HistorySection` but integrated into the tab
- Kicker heading "BILLING HISTORY"
- Keeps the "Load More" pagination

**Cross-links (right column):**
- "Need to receive fees? Set up payouts" → switches to Payouts tab
- "Company billing? Company Settings" → links to `/portal/company/settings?tab=billing`
- Only shown contextually (hide payout link if already set up, etc.)

---

## 5. View B: Payouts Tab

The Payouts tab shows everything about the recruiter's Stripe Connect account
and payout configuration. Money coming **in**.

### Wireframe: Ready State

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--60/40 SPLIT LAYOUT----------------------------------------------------+
|  |                                                                         |
|  |  LEFT COLUMN (60%)                    RIGHT COLUMN (40%)                |
|  |                                                                         |
|  |  +--PAYOUT ACCOUNT-----------------+   +--ACCOUNT STATUS-----------+   |
|  |  |                                  |   |                           |   |
|  |  |  KICKER: CONNECTED ACCOUNT      |   |  [SUCCESS] Payouts Ready  |   |
|  |  |                                  |   |  ________________________ |   |
|  |  |  +-----------------------------+ |   |                           |   |
|  |  |  | [BANK ICON]                 | |   |  [check] Identity verified|   |
|  |  |  | Chase Bank ●●●● 8901       | |   |  [check] Bank connected   |   |
|  |  |  | Checking account            | |   |  [check] Payouts enabled  |   |
|  |  |  +-----------------------------+ |   |  ________________________ |   |
|  |  |                                  |   |                           |   |
|  |  |  Payout Schedule   Weekly        |   |  Stripe Account          |   |
|  |  |  Next Payout       Feb 25        |   |  acct_abc123             |   |
|  |  |  Pending Balance   $2,340.00     |   |                           |   |
|  |  |                                  |   |  Need to update your info?|   |
|  |  |  ____________________________    |   |  [Update Account -->]    |   |
|  |  |                                  |   |                           |   |
|  |  |  KICKER: RECENT PAYOUTS         |   +---------------------------+   |
|  |  |                                  |                                   |
|  |  |  Feb 12  $7,350.00  [PAID]      |                                   |
|  |  |  Feb 5   $4,200.00  [PAID]      |                                   |
|  |  |  Jan 29  $5,100.00  [PAID]      |                                   |
|  |  |  Jan 22  $3,800.00  [PAID]      |                                   |
|  |  |                                  |                                   |
|  |  +----------------------------------+                                   |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Wireframe: Not Started

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--EMPTY STATE-----------------------------------------------------------+
|  |                                                                         |
|  |                  [BANK BUILDING ICON - large]                           |
|  |                                                                         |
|  |              Payouts Not Set Up                                         |
|  |                                                                         |
|  |       Connect your bank account to receive commissions                  |
|  |       from successful placements. Takes about 5 minutes.               |
|  |                                                                         |
|  |                  [Set Up Payouts]                                       |
|  |                                                                         |
|  |       +----------------------------------------------+                  |
|  |       |  WHAT YOU'LL NEED                            |                  |
|  |       |                                              |                  |
|  |       |  [ID]    Government-issued photo ID          |                  |
|  |       |  [BANK]  Bank account routing + account #    |                  |
|  |       |  [SSN]   Last 4 digits of your SSN           |                  |
|  |       |  [ADDR]  Your current mailing address        |                  |
|  |       +----------------------------------------------+                  |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Wireframe: Action Required

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--ALERT BANNER---------------------------------------------------------+
|  |  [!] Stripe needs additional information to keep your payouts active.  |
|  +-----------------------------------------------------------------------+
|                                                                            |
|  +--60/40 SPLIT----------------------------------------------------------+
|  |                                                                         |
|  |  LEFT (60%)                           RIGHT (40%)                       |
|  |                                                                         |
|  |  +--REQUIRED ACTIONS--------------+   +--CURRENT STATUS-----------+    |
|  |  |                                |   |                           |    |
|  |  |  KICKER: WHAT STRIPE NEEDS     |   |  [ERROR] Action Required  |    |
|  |  |                                |   |  ________________________ |    |
|  |  |  Stripe has flagged the        |   |                           |    |
|  |  |  following items. Update them  |   |  [check] Identity verified|    |
|  |  |  to keep receiving payouts.    |   |  [warn]  Bank needs update|    |
|  |  |                                |   |  [check] Payouts enabled  |    |
|  |  |  [!] Verify identity document  |   |                           |    |
|  |  |      [Verify Now -->]          |   +---------------------------+    |
|  |  |                                |                                    |
|  |  |  [!] Update address            |                                    |
|  |  |      [Update -->]              |                                    |
|  |  |                                |                                    |
|  |  +--------------------------------+                                    |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Wireframe: Pending Verification

```
+============================================================================+
|  [ Subscription ]  [ Payouts ]                                             |
|  =========================================================================|
|                                                                            |
|  +--60/40 SPLIT----------------------------------------------------------+
|  |                                                                         |
|  |  LEFT (60%)                           RIGHT (40%)                       |
|  |                                                                         |
|  |  +--VERIFICATION STATUS-----------+   +--ACCOUNT STATUS-----------+    |
|  |  |                                |   |                           |    |
|  |  |  KICKER: VERIFICATION          |   |  [INFO] Verifying         |    |
|  |  |                                |   |  ________________________ |    |
|  |  |  [CLOCK ICON]                  |   |                           |    |
|  |  |                                |   |  [check] Details submitted|    |
|  |  |  Stripe is reviewing your      |   |  [clock] Under review     |    |
|  |  |  information. This usually     |   |  [wait]  Payouts pending  |    |
|  |  |  takes 1-2 business days.      |   |                           |    |
|  |  |                                |   +---------------------------+    |
|  |  |  We'll notify you by email     |                                    |
|  |  |  when verification completes.  |                                    |
|  |  |                                |                                    |
|  |  |  [Refresh Status]              |                                    |
|  |  |                                |                                    |
|  |  +--------------------------------+                                    |
|  |                                                                         |
|  +------------------------------------------------------------------------+
|                                                                            |
+============================================================================+
```

### Design Details

**Bank Account Card:**
- Bank icon (`fa-building-columns`) with bank name and last 4
- Account type label (Checking/Savings)
- Data comes from extending `GET /stripe/connect/account` to include
  `external_accounts[0]` summary (bank_name, last4, type)

**Payout Schedule:**
- Read from Stripe account settings
- Show: interval (daily/weekly/monthly), next estimated payout, pending balance

**Recent Payouts:**
- New API endpoint: `GET /stripe/connect/payouts?limit=5`
- Each row: date, amount, status pill (paid/pending/failed)

**Action Required — Smart Flow:**
- Parse `currently_due` from Stripe to show only the fields actually needed
- Each requirement gets its own action card with a targeted CTA
- Clicking a CTA opens a focused wizard with only the relevant steps
  (not the full 4-step wizard)

**Cross-links:**
- "Subscription active? Manage your plan" → switches to Subscription tab

---

## 6. Setup Wizards

### Recruiter Connect Wizard (Redesigned)

**Changes from current:**
1. Use Stripe.js tokenization for bank accounts (fix PCI risk)
2. Fix stale closure on identity verification check
3. Smart `action_required` flow — only show steps Stripe actually needs
4. Reset state on modal re-open

**Standard flow (not_started / incomplete):**

```
Step 1: Personal Information
  - First name, last name, email, phone
  - Date of birth (month/day/year selects)
  - SSN last 4

Step 2: Address
  - Street, city, state (select), ZIP

Step 3: Bank Account  ← NOW USES STRIPE.JS TOKENIZATION
  - Account holder name (pre-filled from step 1)
  - Routing number
  - Account number + confirm
  - Client-side: stripe.createToken('bank_account', { ... })
  - Send ONLY the token ID to backend

Step 4: Review & Submit
  - Summary of all steps with edit links
  - TOS checkbox
  - Submit: updateDetails → addBankAccount(token) → acceptTos
  - On success: check API response for needs_verification flag

Step 5 (conditional): Identity Verification
  - Only shown if API response says verification needed
  - Opens Stripe Identity modal
  - "I'll do this later" option
```

**Wireframe: Step 3 (Bank Account) — Tokenized**

```
+--WIZARD MODAL (max-w-2xl)----------------------------------------------+
|                                                                         |
|  [BANK ICON]  Set Up Payouts                                    [X]    |
|  Step 3 of 4 — Bank Account                                            |
|  [===========================---------]  progress bar                   |
|                                                                         |
|  +--BODY---------------------------------------------------------------+
|  |                                                                      |
|  |  Account Holder Name *                                               |
|  |  [John Smith________________________]                                |
|  |                                                                      |
|  |  Routing Number *                                                    |
|  |  [110000000_]  9-digit number from your check or bank statement      |
|  |                                                                      |
|  |  Account Number *           Confirm Account Number *                 |
|  |  [*******************]      [*******************]                    |
|  |                                                                      |
|  |  +---------------------------------------------------------------+  |
|  |  |  [SHIELD ICON]  Bank-level security                           |  |
|  |  |  Your bank details are tokenized by Stripe before being       |  |
|  |  |  transmitted. Raw account numbers never touch our servers.     |  |
|  |  +---------------------------------------------------------------+  |
|  |                                                                      |
|  +----------------------------------------------------------------------+
|                                                                         |
|  +--FOOTER-------------------------------------------------------------+
|  |  [<-- Back]                                              [Continue]  |
|  +----------------------------------------------------------------------+
|                                                                         |
+-------------------------------------------------------------------------+
```

**action_required Smart Flow:**

Parse `currently_due` from Stripe to determine which steps are needed:

```tsx
function buildActionRequiredSteps(currentlyDue: string[]): WizardStep[] {
  const steps: WizardStep[] = [];

  const needsPersonal = currentlyDue.some(r =>
    r.includes('individual.first_name') ||
    r.includes('individual.last_name') ||
    r.includes('individual.dob') ||
    r.includes('individual.ssn_last_4')
  );
  const needsAddress = currentlyDue.some(r =>
    r.includes('individual.address')
  );
  const needsBank = currentlyDue.some(r =>
    r.includes('external_account')
  );

  if (needsPersonal) steps.push({ key: 'personal', label: 'Personal Info' });
  if (needsAddress)  steps.push({ key: 'address', label: 'Address' });
  if (needsBank)     steps.push({ key: 'bank', label: 'Bank Account' });

  steps.push({ key: 'review', label: 'Review & Submit' });
  return steps;
}
```

If Stripe only needs an updated address, the user sees a 2-step wizard
(Address + Review) instead of the full 4 steps.

**Stale Closure Fix:**

```tsx
// Before (bug): reads stale hook state after async refresh
await connectStatus.refresh();
if (connectStatus.needsIdentityVerification) { // BUG: stale
  setShowVerification(true);
}

// After: use API response directly
const result = await connectStatus.acceptTos();
if (result.needs_identity_verification) { // FRESH: from response
  setShowVerification(true);
}
```

**Stripe.js Bank Tokenization:**

```tsx
// Client-side (wizard step 3)
const { token, error } = await stripe.createToken('bank_account', {
  country: 'US',
  currency: 'usd',
  routing_number: bank.routingNumber,
  account_number: bank.accountNumber,
  account_holder_name: effectiveHolderName,
  account_holder_type: 'individual',
});

// Send ONLY token to backend
await connectStatus.addBankAccount({ token: token.id });
```

Backend change — `addExternalAccount` in `service.ts`:
```typescript
// Before (PCI risk): raw account numbers
external_account: {
  object: 'bank_account',
  routing_number: bankDetails.routing_number,
  account_number: bankDetails.account_number,
  ...
}

// After (tokenized): opaque Stripe token
external_account: bankDetails.token
```

---

## 7. Component Architecture

### New Components

| Component | Path | Purpose |
|-----------|------|---------|
| `BillingSection` | `apps/portal/src/components/basel/profile/billing-section.tsx` | Tab container with Subscription / Payouts tabs |
| `SubscriptionTab` | `apps/portal/src/components/basel/profile/subscription-tab.tsx` | 60/40 layout: plan + payment method + invoices |
| `PayoutsTab` | `apps/portal/src/components/basel/profile/payouts-tab.tsx` | 60/40 layout: bank account + status + payout history |
| `PlanCard` | `apps/portal/src/components/basel/profile/plan-card.tsx` | Plan name, price, renewal, features |
| `PaymentMethodCard` | `apps/portal/src/components/basel/profile/payment-method-card.tsx` | Card brand, last 4, expiry, update button |
| `PayoutAccountCard` | `apps/portal/src/components/basel/profile/payout-account-card.tsx` | Bank details + schedule + balance |
| `PayoutHistoryList` | `apps/portal/src/components/basel/profile/payout-history-list.tsx` | Recent payout transactions |
| `ActionRequiredCard` | `apps/portal/src/components/basel/profile/action-required-card.tsx` | Parsed Stripe requirements with targeted CTAs |

### Refactored Components

| Component | Change |
|-----------|--------|
| `SubscriptionSection` | Replaced by `SubscriptionTab` (with payment method + invoices integrated) |
| `PaymentSection` | Absorbed into `PaymentMethodCard` inside `SubscriptionTab` |
| `HistorySection` | Absorbed into `SubscriptionTab` as inline invoice table |
| `PayoutsSection` | Replaced by `PayoutsTab` with bank details + payout history |
| `ConnectModal` | Fix: Stripe.js tokenization, stale closure, smart action_required, state reset |
| `PaymentForm` | Fix: make `return_url` configurable prop |

### Profile Page Changes

The profile page sidebar "Billing" group changes from 4 items to 2:

```tsx
// Before:
groups.push({
  title: "Billing",
  items: [
    { key: "subscription", label: "Subscription", ... },
    { key: "payment",      label: "Payment Methods", ... },
    { key: "history",       label: "Invoice History", ... },
    { key: "payouts",       label: "Payouts", ... },
  ],
});

// After:
groups.push({
  title: "Billing",
  items: [
    { key: "subscription", label: "Subscription", ... },
    { key: "payouts",      label: "Payouts", ... },
  ],
});
```

And the content panel renders `BillingSection` for both keys, passing the
active sub-tab:

```tsx
{isRecruiter && (active === "subscription" || active === "payouts") && (
  <BillingSection activeTab={active} />
)}
```

### Hooks

| Hook | Change |
|------|--------|
| `useStripeConnectStatus` | Extend: add `bankAccount` (name, last4, type), `payoutSchedule`, `pendingBalance`; change `addBankAccount` to accept token instead of raw details |
| NEW: `usePayoutHistory` | Fetches payout transactions from new API endpoint |

### API Changes Required

| Endpoint | Change |
|----------|--------|
| `GET /stripe/connect/account` | Extend response: include `external_accounts[0]` summary + `settings.payouts.schedule` |
| `POST /stripe/connect/bank-account` | Change body from `{routing_number, account_number, ...}` to `{token}` |
| `POST /stripe/connect/accept-tos` | Extend response: include `needs_identity_verification` boolean |
| NEW: `GET /stripe/connect/payouts` | List recent payouts from Stripe (paginated) |

---

## 8. Bug Fixes & Technical Debt

### Priority 1: Security — Bank Tokenization

**Files:** `connect-modal.tsx`, `connect/service.ts`, `connect/types.ts`

Raw bank account numbers transit from browser → API gateway → billing service.
Fix: Use Stripe.js `createToken('bank_account', ...)` client-side, send only
the opaque token to backend.

### Priority 2: Stale Closure — Identity Verification

**File:** `connect-modal.tsx`

After `handleSubmit` calls `connectStatus.refresh()`, the subsequent check of
`connectStatus.needsIdentityVerification` reads the pre-refresh value. Fix:
return `needs_identity_verification` from the `acceptTos` API response.

### Priority 3: Wizard State Reset

**File:** `connect-modal.tsx`

`useState` initializers persist across modal open/close. Fix: key-based
remount `<ConnectModal key={connectOpenCount} />`.

### Priority 4: Duplicate Skip Button

**Files:** `billing-setup-wizard.tsx`, `payment-form.tsx`

Both the wizard footer AND `BaselPaymentForm` render "Skip for now". Fix: add
`hideSkip` prop to `BaselPaymentForm`, pass `hideSkip={true}` when inside wizard.

### Priority 5: Hardcoded return_url

**File:** `payment-form.tsx`

`return_url` hardcoded to `/onboarding/callback`. Fix: accept `returnUrl` prop,
default to `window.location.href`.

### Priority 6: Dead Code

**File:** `connect-modal.tsx`

`yearOptions` computed twice (once unused). Remove the dead instance.

---

## 9. Implementation Phases

### Phase 1: Bug Fixes (1-2 days)

Fix critical bugs without changing UI structure. Safe to ship independently.

1. **P1: Bank tokenization** — Stripe.js client-side tokenization
2. **P2: Stale closure** — Return `needs_identity_verification` from acceptTos API
3. **P3: Wizard state reset** — Key-based remount
4. **P4: Duplicate skip** — Add `hideSkip` prop to BaselPaymentForm
5. **P5: Hardcoded return_url** — Make it a prop
6. **P6: Dead code** — Remove duplicate `yearOptions`

### Phase 2: API Extensions (1-2 days)

Extend backend APIs to support the new UI.

1. Extend `GET /stripe/connect/account` with bank details + payout schedule
2. Extend `POST /stripe/connect/accept-tos` with verification flag
3. Add `GET /stripe/connect/payouts` endpoint
4. Change `POST /stripe/connect/bank-account` to accept token
   (coordinated with Phase 1 frontend fix)

### Phase 3: Subscription Tab (2-3 days)

Build the unified subscription view.

1. Create `BillingSection` tab container
2. Build `SubscriptionTab` with 60/40 layout
3. Extract `PlanCard` from current `SubscriptionSection`
4. Extract `PaymentMethodCard` from current `PaymentSection`
5. Integrate invoice table from current `HistorySection`
6. Update profile page sidebar (4 items → 2)
7. Add `?tab=` query param support for deep linking

### Phase 4: Payouts Tab (2-3 days)

Build the unified payouts view.

1. Build `PayoutsTab` with 60/40 layout
2. Build `PayoutAccountCard` with bank details
3. Build `PayoutHistoryList`
4. Build `ActionRequiredCard` with smart requirement parsing
5. Redesign connect wizard with smart `action_required` flow

### Phase 5: Polish & Cleanup (1 day)

1. Remove old standalone components (`PaymentSection`, `HistorySection`)
2. Add loading skeletons for new components
3. Test all wizard flows: not_started, incomplete, action_required, ready
4. Test responsive behavior (mobile stack → desktop 60/40)
5. Verify theme support (light + dark)
6. GSAP section-change animation for tab switches

### Total Estimated Effort: 7-11 days

---

## Appendix: Basel Design Tokens Used

All components use these Basel patterns:

- **Cards:** `bg-base-100 border border-base-300 shadow-sm rounded-none`
- **Accent cards:** Add `border-l-4 border-l-{color}` for status indication
- **Kicker text:** `text-sm font-semibold uppercase tracking-widest text-base-content/40`
- **Section headings:** `text-xl font-black tracking-tight`
- **Body text:** `text-sm text-base-content/70` (never `text-xs` for readable content)
- **Data rows:** `flex items-center justify-between py-3 border-b border-base-300`
- **Status pills:** `BaselStatusPill` with semantic colors
- **Alert boxes:** `BaselAlertBox` with variant prop
- **Empty states:** `BaselEmptyState` with icon, title, subtitle, actions
- **Tab navigation:** DaisyUI `tabs tabs-bordered` with `tab-active`

## Appendix: File Inventory

**Created (Phase 3-4):**
```
apps/portal/src/components/basel/profile/billing-section.tsx
apps/portal/src/components/basel/profile/subscription-tab.tsx
apps/portal/src/components/basel/profile/payouts-tab.tsx
apps/portal/src/components/basel/profile/plan-card.tsx
apps/portal/src/components/basel/profile/payment-method-card.tsx
apps/portal/src/components/basel/profile/payout-account-card.tsx
apps/portal/src/components/basel/profile/payout-history-list.tsx
apps/portal/src/components/basel/profile/action-required-card.tsx
apps/portal/src/hooks/use-payout-history.ts
```

**Modified (Phase 1-3):**
```
apps/portal/src/app/portal/profile/page.tsx
apps/portal/src/components/basel/profile/connect-modal.tsx
apps/portal/src/components/stripe/payment-form.tsx
apps/portal/src/hooks/use-stripe-connect-status.ts
services/billing-service/src/v2/connect/service.ts
services/billing-service/src/v2/connect/types.ts
services/billing-service/src/v2/connect/routes.ts
services/api-gateway/src/routes/v2/billing.ts
```

**Removed (Phase 5):**
```
apps/portal/src/components/basel/profile/payment-section.tsx (absorbed into subscription-tab)
apps/portal/src/components/basel/profile/history-section.tsx (absorbed into subscription-tab)
apps/portal/src/components/basel/profile/subscription-section.tsx (replaced by subscription-tab)
apps/portal/src/components/basel/profile/payouts-section.tsx (replaced by payouts-tab)
```
