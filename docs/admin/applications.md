# Applications Management

## Current State

**Route:** `/secure/applications`
**Data source:** `/ats/admin/applications`

### What Exists
- **Table columns:** Candidate (name/email), Job title, Stage (badge), Applied date
- **Filters:** Stage pills (16 stages from AI Review through Withdrawn)
- **Stats banner:** Applications, Jobs, Candidates, Placements counts
- **Pagination:** Standard prev/next
- **Actions:** "Generate Tailored Resume" button per row
- **No detail page** - No click-through to individual application

### What's Missing

#### Critical (Phase Priority: High)
- **Application detail page** - Full view: candidate info, job info, stage history, notes, timeline, resume, match score
- **Stage management** - Move application between stages with reason/notes (admin override)
- **Application rejection** - Reject with categorized reason, optional feedback to candidate
- **Application notes** - Admin notes on specific applications
- **Stage history/timeline** - Visual timeline showing stage transitions with timestamps and who made the change
- **Resume view** - View candidate's resume and tailored resume for this specific application

#### Important (Phase Priority: Medium)
- **Bulk stage transitions** - Select multiple applications, move to a stage
- **AI review results** - View AI screening results, scores, flags
- **Interview scheduling** - View/manage interview schedules for this application
- **Offer management** - View/edit offer details (salary, start date, benefits)
- **Communication thread** - All messages related to this application
- **Application scoring** - View match score, screening score, interview scores
- **Duplicate application detection** - Flag when same candidate applies to same/similar job
- **Application search by candidate** - Find all applications for a specific candidate
- **Export** - Export application data (CSV/Excel) with filters

#### Nice to Have
- **Application funnel analytics** - Conversion rates between stages, drop-off analysis
- **Stage duration analytics** - Average time in each stage, bottleneck identification
- **Comparison view** - Compare multiple candidates for the same job side-by-side
- **Application scoring override** - Admin ability to adjust AI scores with justification

## Implementation Notes
- Stage transitions should be logged to create an audit trail
- AI review results should show the specific criteria and scores
- Stage management should respect the stage flow rules (see application-stages pattern)
- Bulk operations should validate each transition is valid before executing
