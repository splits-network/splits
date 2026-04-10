# Companies Management (Recruiter Companies / Employers)

## Current State

**Route:** `/secure/companies`
**Data source:** `/network/admin/recruiter-companies`

### What Exists
- **Table columns:** Logo + Company Name, Recruiter (who added it), Industry, Location (city/state), Jobs count, Placements count, Created date
- **Search:** Text search
- **Stats banner:** Companies count, Recruiters count, Pending count (reuses network counts)
- **Pagination:** Standard prev/next
- **Actions:** None - completely read-only
- **No detail page** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Company detail page** - Full profile: jobs posted, placements, recruiters working with this company, billing info, contacts
- **Company editing** - Edit company name, industry, location, logo, description, website
- **Company verification** - Verify company legitimacy (domain verification, business registration)
- **Active jobs view** - All current open jobs for this company with status
- **Recruiter assignments** - Which recruiters are assigned to this company's jobs
- **Fee structure** - Default fee percentages, payment terms for this company

#### Important (Phase Priority: Medium)
- **Contact management** - Multiple contacts per company (hiring managers, HR, billing)
- **Company notes** - Internal admin notes
- **Company status management** - Active/suspended/archived with reason
- **Billing relationship** - Link to billing profile, invoice history, payment status
- **Communication log** - All admin communications with this company
- **Job template management** - Saved job templates for this company
- **Company merge** - Merge duplicate company records (common with recruiter-created companies)

#### Nice to Have
- **Company health score** - Derived from: payment speed, job fill rate, candidate satisfaction
- **Hiring trends** - Charts showing hiring patterns over time
- **Industry benchmarks** - How this company compares to others in same industry
- **Integration status** - ATS integration health, webhook status

## Implementation Notes
- Companies come from recruiter_companies, which is a junction of recruiters and companies
- Need to distinguish between the company entity and the recruiter-company relationship
- Company detail should link to all related recruiters, not just the one who created it
- Fee structure should be configurable per company and override defaults
