**COMPLETED**

# Jobs Management

## Current State

**Route:** `/secure/jobs`
**Data source:** `/ats/admin/jobs`

### What Exists
- **Table columns:** Title/Company, Status (badge), Commute type, Level, Created date
- **Filters:** Search, Status dropdown, Commute dropdown, Level dropdown
- **Stats banner:** Active, Draft, Paused, Closed counts
- **Pagination:** Standard numbered pagination
- **Row click:** Routes to `/secure/jobs/{id}` (detail page exists)
- **Actions:** Status transitions (Activate, Pause, Close, Reopen) with confirmation modals

### Detail Page (`/secure/jobs/{id}`)
- Job overview with metadata
- Candidate list for this job
- Read-only display

### What's Missing

#### Critical (Phase Priority: High)
- **Job editing** - Edit all job fields (title, description, requirements, salary, location, commute type, level)
- **Application pipeline view** - Visual pipeline of applications by stage for this job (kanban or funnel view)
- **Recruiter assignment management** - Assign/unassign recruiters to this job, set split percentages
- **Job duplication** - Clone a job to create a similar posting
- **Feature/boost management** - Featured job placement, boost visibility

#### Important (Phase Priority: Medium)
- **Application stage management** - Move applications between stages from the job detail
- **Job analytics** - Views, applications, conversion rates, time-in-stage averages
- **Matching controls** - Trigger AI matching manually, view match quality distribution
- **Job notes** - Internal admin notes
- **Company contact for job** - Who at the company is the hiring manager
- **Job expiration management** - Set/extend expiration dates, auto-close rules
- **Salary benchmarking** - Compare salary range to market data
- **Bulk job actions** - Select multiple jobs, bulk pause/close/reopen

#### Nice to Have
- **Job performance comparison** - Compare similar jobs' performance
- **SEO preview** - Preview how job appears in search results
- **Distribution tracking** - Where job is syndicated, performance per channel
- **Application source attribution** - Which recruiters/channels drove applications
- **Job template creation** - Save as template for this company

## Implementation Notes
- Job editing should validate against required fields before allowing activate
- Pipeline view should use stages from application_stages enum
- Recruiter assignment should respect firm-level agreements
- Analytics should show trend over time, not just current numbers
