# Firms Management (Recruiting Firms)

## Current State

**Route:** `/secure/firms`
**Data source:** `/network/admin/firms`

### What Exists
- **Table columns:** Firm Name / Owner Email, Status (active/suspended), Marketplace status (Approved/Pending/Not Listed), Slug, Created date
- **Filters:** Marketplace status pills (All, Pending Approval, Approved, Not Listed)
- **Search:** Text search
- **Stats banner:** Total Firms, Pending Approval, Marketplace Active
- **Pagination:** Standard prev/next
- **Actions:** Marketplace Approve (for pending), Marketplace Revoke (for approved) - with confirmation modals
- **No detail page** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Firm detail page** - Full profile: members, jobs worked, placements, revenue, marketplace listing, reputation
- **Firm suspension** - Suspend entire firm (cascade to all members) with reason
- **Member management** - View all firm members, their roles within the firm, add/remove members
- **Firm profile editing** - Edit firm details (name, description, specialties, logo, website)
- **Marketplace listing management** - Edit the firm's public marketplace profile, preview public listing

#### Important (Phase Priority: Medium)
- **Revenue tracking** - Total revenue, revenue by recruiter, revenue trend
- **Compliance management** - Track firm-level compliance (business license, insurance, bond)
- **Firm notes** - Internal admin notes
- **Billing management** - Firm-level billing profile, invoice history
- **Firm-level fee overrides** - Override platform default split for this firm
- **Activity log** - Firm-wide activity (all member actions)
- **Invitation management** - See pending firm invitations, revoke invitations

#### Nice to Have
- **Firm analytics dashboard** - Mini-dashboard per firm with key metrics
- **Firm comparison** - Compare firms side-by-side
- **Firm directory management** - Manage how firm appears in directory/search
- **Onboarding progress** - Track firm onboarding completion

## Implementation Notes
- Firm suspension should cascade: suspend all member recruiters, pause all active jobs
- Marketplace approval should trigger email notification
- Member management needs role context (owner, admin, member)
- Revenue tracking should pull from placement/payout data
