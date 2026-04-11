**COMPLETED**

# Recruiters Management

## Current State

**Route:** `/secure/recruiters`
**Data source:** `/network/admin/recruiters`

### What Exists
- **Table columns:** Name/Email, Status (badge), Tagline (truncated), Joined date
- **Filters:** Status pills (All, Pending, Active, Suspended)
- **Search:** Text search
- **Stats banner:** Total Recruiters, Pending Approval, Companies
- **Pagination:** Standard prev/next
- **Actions:** Approve (pending/suspended -> active), Suspend (active -> suspended) with confirmation modal
- **No detail page** - No click-through to individual recruiter

### What's Missing

#### Critical (Phase Priority: High)
- **Recruiter detail page** - Full profile view: bio, specialties, firm, activity, jobs worked, placements, earnings, reputation score
- **Profile editing** - Admin ability to edit recruiter profile fields (tagline, bio, specialties, etc.)
- **Rejection with reason** - When denying pending recruiter, require and store a rejection reason; notify the recruiter
- **Verification status** - Identity/credential verification workflow (license verification, background check status)
- **Performance metrics** - Per-recruiter: placements made, revenue generated, average time-to-fill, active jobs

#### Important (Phase Priority: Medium)
- **Firm association management** - View/change which firm a recruiter belongs to
- **Commission/split override** - Override default split percentages for specific recruiters
- **Recruiter notes** - Internal admin notes (e.g., "Warned about behavior on 3/15")
- **Communication log** - See all admin-to-recruiter communications
- **Bulk approve/reject** - Select multiple pending recruiters and batch process
- **Re-verify** - Trigger re-verification for compliance
- **Earnings history** - Full payout history for this recruiter
- **Compliance flags** - Track compliance issues (expired licenses, incomplete profiles)

#### Nice to Have
- **Recruiter comparison** - Side-by-side comparison of recruiter performance
- **Onboarding progress** - Track what onboarding steps are complete
- **Referral tracking** - Who referred this recruiter, who have they referred
- **Territory/specialty tags** - Admin-managed tags for categorization
- **Leaderboard position** - Where this recruiter ranks overall

## Implementation Notes
- Detail page should show: Overview tab, Jobs tab, Placements tab, Earnings tab, Activity tab, Notes tab
- Status changes should fire RabbitMQ events for notification
- Rejection reason should be emailed to the recruiter
- Compliance flags should appear as alerts on the detail page
