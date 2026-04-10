# Payouts & Billing Management

## Current State

**Route:** `/secure/payouts` (tabbed: Transactions, Audit, Escrow, Schedules)
**Route:** `/secure/billing-profiles`
**Data sources:** `/billing/admin/payouts`, `/billing/admin/escrow`, `/billing/admin/payouts/audit`, `/billing/admin/schedules`, `/billing/admin/billing-profiles`

### Payouts (Transactions Tab)
- **Table columns:** Truncated ID, Recruiter name/email, Amount (currency), Status (badge), Type, Created date
- **Filters:** Search, Status dropdown (Pending, Processing, Paid, Failed, On Hold, Reversed)
- **Stats banner:** Pending Payouts, Active Escrow, Billing Profiles
- **Row click:** Opens detail modal
- **Detail modal:** ID, Recruiter, Email, Amount, Type, Placement ID, Stripe Transfer ID, Failure Reason, Timeline (created/completed/updated)
- **Actions:** None - detail modal is read-only

### Escrow Tab
- **Table columns:** Escrow ID, Placement ID, Amount, Status, Hold Reason, Hold Date, Release Date
- **Filters:** Search, Status dropdown
- **Actions:** "Release" button for active holds (opens modal)

### Audit Tab
- **Table columns:** Action, Payout ID, Actor, Details, Timestamp
- **Read-only** audit trail

### Schedules Tab
- **Table columns:** Schedule Name, Frequency, Next Run, Last Run, Status
- **Read-only** display

### Billing Profiles
- **Table columns:** Profile Name, Entity type, Profile Type, Status, Created date
- **Search:** Text search
- **Read-only** display

### What's Missing

#### Critical (Phase Priority: High)
- **Payout approval workflow** - Approve/reject pending payouts, require dual approval for large amounts
- **Manual payout creation** - Create ad-hoc payouts (adjustments, bonuses, refunds)
- **Payout hold/release** - Place a payout on hold with reason, release held payouts
- **Payout retry** - Retry failed payouts, with ability to update payment method
- **Escrow management** - Create manual escrow holds, adjust hold amounts, extend release dates
- **Financial dashboard** - Total pending payouts, monthly disbursement, escrow balance, revenue, failed payment rate

#### Important (Phase Priority: Medium)
- **Billing profile editing** - Edit billing profile details, payment methods, tax info
- **Billing profile creation** - Create billing profiles for entities
- **Invoice generation** - Generate and send invoices for placements
- **Refund processing** - Process refunds for cancelled placements
- **Payment method management** - View/manage Stripe connected accounts, verify bank details
- **Schedule management** - Create/edit/pause payout schedules
- **Batch processing** - Process multiple payouts in batch
- **Reconciliation tools** - Compare Stripe records vs platform records, flag discrepancies
- **Tax reporting** - Generate 1099 data, tax withholding management
- **Dispute management** - Handle payment disputes, chargebacks

#### Nice to Have
- **Revenue analytics** - Revenue by period, by recruiter, by company, by firm
- **Cash flow forecasting** - Upcoming payouts, expected revenue, escrow release calendar
- **Payment health monitoring** - Track failed payment rates, average processing time
- **Stripe dashboard link** - Direct links to Stripe dashboard for transactions

## Implementation Notes
- Payout approval should enforce: amount validation, recruiter active status, placement verified
- Dual approval threshold should be configurable in settings
- Refunds should create a negative payout record and link to the original
- Reconciliation should run as a scheduled job with admin-visible results
- Financial data is sensitive - all actions should be audit-logged
