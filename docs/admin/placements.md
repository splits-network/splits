**COMPLETED**

# Placements Management

## Current State

**Route:** `/secure/placements`
**Data source:** `/ats/admin/placements`

### What Exists
- **Table columns:** Candidate name (or truncated ID), Job ID (truncated), Company name, Start Date, Status (badge), Fee (formatted currency)
- **Filters:** Status pills (All, Active, Pending, Completed, Cancelled)
- **Search:** Text search
- **Pagination:** Standard prev/next
- **Actions:** None - completely read-only
- **No detail page** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Placement detail page** - Full view: candidate, job, company, recruiter(s), fee breakdown, split details, guarantee period, payout status, timeline
- **Fee management** - View/adjust fee amount, split percentages between recruiters, override calculations
- **Status management** - Transition placement status with reason (e.g., cancel placement, mark completed)
- **Guarantee period tracking** - Show guarantee period dates, days remaining, risk assessment
- **Payout linkage** - Direct link to associated payout(s), escrow holds, billing

#### Important (Phase Priority: Medium)
- **Split details view** - Who gets what percentage, calculated amounts per party
- **Placement editing** - Edit start date, end date, fee, salary details
- **Placement notes** - Internal admin notes (e.g., "Candidate requested delayed start")
- **Falloff tracking** - If candidate leaves during guarantee, track reason and handle refund
- **Placement verification** - Confirm candidate actually started, verify with company
- **Revenue recognition** - Track when revenue is recognized vs when payment is collected
- **Placement timeline** - Full history: created, verified, paid, completed/cancelled
- **Related placements** - Show if this candidate was placed before, or if this job had other placements

#### Nice to Have
- **Placement analytics** - Success rate, average fee, average time-to-placement
- **Guarantee risk scoring** - AI-based prediction of falloff risk
- **Bulk status updates** - Mark multiple placements as completed
- **Export** - Export placement data with financial details

## Implementation Notes
- Placement detail must show the full financial picture: fee, splits, payouts, escrow
- Guarantee tracking is business-critical (escrow release depends on it)
- Falloff workflow: cancel placement -> trigger escrow refund -> notify all parties
- Job ID column should show job title (currently shows truncated UUID - this is a data join issue)
