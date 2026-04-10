# Assignments Management

## Current State

**Route:** `/secure/assignments`
**Data source:** `/ats/admin/assignments`

### What Exists
- **Table columns:** Recruiter ID (truncated UUID!), Job Title (or "Unknown Job"), Status (badge), Created date
- **Filters:** Status pills (All, Active, Pending, Completed, Cancelled)
- **Search:** Text search
- **Pagination:** Standard prev/next
- **Actions:** None - completely read-only
- **No detail page** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Show recruiter name** - Currently shows truncated UUID instead of recruiter name (data join issue)
- **Assignment detail page** - Full view: recruiter info, job info, fee terms, activity on this assignment, applications submitted
- **Assignment management** - Create, reassign, cancel assignments
- **Fee terms view** - What split percentage was agreed for this assignment
- **Performance tracking** - How many candidates has this recruiter submitted for this job

#### Important (Phase Priority: Medium)
- **Assignment creation** - Admin can assign a recruiter to a job (with fee terms)
- **Reassignment** - Transfer an assignment from one recruiter to another
- **Assignment notes** - Internal notes on the assignment
- **Activity tracking** - What actions has the recruiter taken on this assignment
- **Bulk management** - Bulk cancel inactive assignments, bulk reassign
- **Duplicate detection** - Flag if a recruiter is assigned to overlapping/competing jobs

#### Nice to Have
- **Assignment analytics** - Fill rates by recruiter, average time-to-fill
- **Recruiter workload view** - How many active assignments does each recruiter have
- **Auto-assignment rules** - Configure rules for automatic recruiter-job matching

## Implementation Notes
- PRIORITY FIX: Replace recruiter_id UUID display with recruiter name (needs a data join in the admin view)
- Assignment creation should validate: recruiter is active, job is active, no duplicate assignment
- Fee terms should be stored on the assignment, not just inherited from defaults
