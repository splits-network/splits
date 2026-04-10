# Matches Management

## Current State

**Route:** `/secure/matches`
**Data source:** `/matching/admin/matches`

### What Exists
- **Table columns:** Candidate Name, Job Title, Company, Score (progress bar + percentage), Status (pending/accepted/rejected/expired), Created date
- **Sorting:** By score (desc default), candidate, job, company, created date
- **Row click:** Routes to `/secure/matches/{id}` (detail page exists)
- **No filters** - No search, no status filter, no pagination
- **No actions** - Completely read-only

### Detail Page (`/secure/matches/{id}`)
- Match overview with metadata
- Match factors breakdown
- Read-only display

### What's Missing

#### Critical (Phase Priority: High)
- **Filters and search** - Filter by status, score range, date range, candidate, job, company
- **Pagination** - Currently loads all matches without pagination
- **Match detail improvements** - Show full factor breakdown with weights, explain why this score
- **Manual match creation** - Admin ability to create a manual match (bypass AI)
- **Match status management** - Override match status (e.g., force-expire, re-activate)

#### Important (Phase Priority: Medium)
- **Match quality monitoring** - Dashboard showing match quality distribution, acceptance rates, false positive/negative rates
- **Matching engine controls** - View/adjust matching parameters, trigger re-scoring
- **Match feedback loop** - Track outcomes of accepted matches (did they lead to placements?)
- **Bulk operations** - Bulk expire old matches, bulk re-score
- **Match comparison** - Compare multiple matches for same job or same candidate
- **Score threshold management** - Set minimum score thresholds for different match types
- **Match notifications** - View/manage which matches triggered notifications

#### Nice to Have
- **A/B testing for matching** - Compare different matching algorithms
- **Match explanations** - Human-readable explanations of why a match scored high/low
- **Match trends** - Charts showing matching quality over time
- **Feedback collection** - Track recruiter feedback on match quality

## Implementation Notes
- Match factors should show: skill match, experience match, location match, salary match, culture fit, etc.
- Manual matches should be flagged as "admin-created" in audit trail
- Match quality monitoring is critical for validating the AI engine
- Re-scoring should queue via RabbitMQ, not block the UI
