**COMPLETED**

# Candidates Management

## Current State

**Route:** `/secure/candidates`
**Data source:** `/ats/admin/candidates`

### What Exists
- **Table columns:** Name/Email, Phone, Location, Resume Status (badge), Created date
- **Filters:** Resume status dropdown (All, Uploaded, Pending, Processing, Failed, None)
- **Search:** Text search
- **Pagination:** Standard numbered pagination
- **Actions:** "Build Smart Resume" button per row
- **No detail page** - No click-through to individual candidate

### What's Missing

#### Critical (Phase Priority: High)
- **Candidate detail page** - Full profile: resume, skills, work history, applications, matches, placements, activity
- **Application history** - All applications this candidate has, with stages and outcomes
- **Resume management** - View parsed resume, re-trigger parsing, download original, view smart resume
- **Profile editing** - Edit candidate details (contact info, location, skills, etc.)
- **Candidate status management** - Active/inactive/blacklisted status with reason tracking

#### Important (Phase Priority: Medium)
- **Match history** - All AI matches for this candidate, scores, outcomes
- **Interview tracking** - See all interviews scheduled/completed across all applications
- **Candidate notes** - Internal admin notes
- **Communication log** - Emails sent, messages received
- **Duplicate detection** - Flag potential duplicate candidates (same email, similar name+location)
- **GDPR tools** - Data export, anonymization, consent management
- **Bulk resume re-processing** - Select multiple candidates, re-trigger resume parsing
- **Source tracking** - How the candidate entered the system (direct, recruiter upload, API)

#### Nice to Have
- **Candidate journey timeline** - Visual timeline from signup to placement
- **Skills taxonomy management** - Normalize/merge skill tags across candidates
- **Availability status** - Currently looking, not looking, open to offers
- **Salary expectations** - Admin view of candidate salary data for market analysis
- **Placement success rate** - How often this candidate's placements stick through guarantee

## Implementation Notes
- Detail page tabs: Overview, Applications, Matches, Resume, Activity, Notes
- Resume viewer should show both original and parsed/smart versions
- Blacklisting should be soft-delete with reason and should cascade to active applications
- Duplicate detection could leverage the existing matching engine
