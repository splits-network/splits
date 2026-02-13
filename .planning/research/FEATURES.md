# Feature Landscape: Global Search in Recruiting Marketplace

**Domain:** Global/Universal Search in B2B SaaS (Recruiting/CRM/Marketplace)
**Researched:** 2026-02-12
**Confidence:** MEDIUM (based on established patterns in SaaS platforms, not verified with 2026 sources)

## Table Stakes

Features users expect from global search. Missing = search feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Real-time typeahead dropdown** | Users expect instant feedback as they type (Google, Slack pattern) | Medium | Debounce ~200-300ms, show top 3-5 results per entity type |
| **Multi-entity results** | Must search across all entity types (candidates, jobs, companies, etc.) | Medium | Users don't want to pre-select what they're searching for |
| **Ranked/scored results** | Most relevant results first, not random order | Medium | PostgreSQL ts_rank or custom scoring (recency + relevance) |
| **Highlighted matches** | Show WHERE the match occurred in the result | Low | Bold/highlight matching text in name/title/snippet |
| **Context snippets** | Show excerpt of matching content, not just entity name | Medium | Display 1-2 lines of context (job description, candidate bio, etc.) |
| **Keyboard navigation** | Arrow keys to navigate results, Enter to select | Medium | Standard typeahead UX (like Google, VS Code command palette) |
| **Entity type grouping** | Group results by type (Candidates, Jobs, Companies) | Low | Users need to distinguish between entity types quickly |
| **Full results page** | Enter without selection → dedicated search results page | Medium | Required when >5 results or user wants to explore all matches |
| **Click-to-navigate** | Each result is clickable link to entity detail page | Low | Core navigation expectation |
| **Recent searches** | Show recent search history (optional: popular searches) | Low | Saves re-typing common queries |
| **Empty state messaging** | Clear "No results" with suggestions | Low | "Try different keywords" or "Browse [entities]" |
| **Loading states** | Spinner/skeleton while searching | Low | Users need feedback that search is working |
| **Search clear button** | X button to clear input and close dropdown | Low | Standard input pattern |

## Differentiators

Features that would make this search exceptional vs competitors. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Natural language parsing** | "brandon development manager san diego 120k" → extract role, location, salary | High | Parse query tokens, classify as name/role/location/salary/skills |
| **Smart query understanding** | Detect entity type hints ("job: engineer" vs "candidate: engineer") | Medium | Prefix detection (job:, candidate:, company:) |
| **Fuzzy/typo tolerance** | "engeneer" matches "engineer", "san deigo" matches "san diego" | Medium | PostgreSQL trigram similarity or pg_trgm extension |
| **Synonym expansion** | "developer" also searches "engineer", "programmer" | Medium | Requires synonym dictionary for recruiting domain |
| **Recent items boost** | Recently updated/created items rank higher | Low | Weight by updated_at or created_at in scoring |
| **User activity boost** | Items user recently viewed rank higher | Medium | Requires user activity tracking |
| **Saved searches** | Save complex queries for re-use | Medium | Valuable for recruiters with repeated searches |
| **Search filters in dropdown** | Quick filters (Active/Archived, Date range) in typeahead UI | Medium | Advanced UX, prevents full page navigation |
| **Relationship context** | Show "Your candidate" vs "Unassigned" in results | Medium | Leverage existing recruiter_candidates relationships |
| **Multi-field match indicators** | Show "Matched in: Title, Skills, Location" | Low | Helps user understand WHY result matched |
| **Keyboard shortcuts** | Cmd+K / Ctrl+K to open search from anywhere | Low | Modern SaaS pattern (Notion, Linear, GitHub) |
| **Search scoping** | Scope search to "My Candidates" vs "All Candidates" | Medium | Role-based filtering already exists in codebase |
| **Quick actions in results** | "Message", "Add to job" buttons inline in dropdown | High | Reduces clicks but complex UX |
| **Export search results** | CSV/PDF export of search results | Medium | Common in recruiting platforms for reporting |

## Anti-Features

Features to explicitly NOT build for v1. Common mistakes or premature optimization.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Advanced search builder UI** | Over-engineered for v1, users prefer natural language | Use simple text input, add filters later if needed |
| **Search history analytics** | Premature - need baseline usage data first | Track searches in logs, analyze post-launch |
| **AI-powered search suggestions** | Complex infrastructure, unclear ROI for v1 | Basic synonym expansion is sufficient |
| **Search across all user orgs** | Security/access control nightmare, violates data boundaries | Scope to current user's organization only |
| **Full-text document search** | Searching inside PDF resumes/docs is expensive and slow | Search metadata only (filename, upload date), not content |
| **Saved search sharing** | Collaboration feature, adds permissions complexity | Personal saved searches only, share later if needed |
| **Search result thumbnails** | Bandwidth/performance cost, marginal UX benefit | Use icons for entity types instead |
| **Real-time collaborative search** | "See what others are searching" - privacy concerns, distraction | N/A - avoid entirely |
| **Voice search** | Gimmick for desktop B2B app, not mobile-first | Text input only |
| **Search field autocorrect** | Intrusive, users prefer to type what they mean | Typo tolerance in results, not forced correction |

## Feature Dependencies

```
Core Search Infrastructure (PostgreSQL full-text)
  └─> Basic Typeahead Dropdown
       ├─> Ranked Results (ts_rank)
       ├─> Multi-entity Results (union queries)
       ├─> Context Snippets (ts_headline)
       └─> Full Results Page
            ├─> Pagination
            ├─> Filters (entity type, date range)
            └─> Sort options (relevance, date)

Natural Language Parsing (optional)
  └─> Requires: Token classification logic
       └─> Enables: Smart filters from query text

Keyboard Shortcuts (Cmd+K)
  └─> Requires: Global keyboard event listener
       └─> Enables: Search from anywhere in app

Recent/Saved Searches
  └─> Requires: Search history table
       └─> Enables: Quick re-search, pattern analysis
```

## MVP Recommendation

For MVP (v1 global search), prioritize:

### Must Have (Table Stakes)
1. **Real-time typeahead dropdown** - Core UX expectation
2. **Multi-entity results** - Search candidates, jobs, companies, recruiters, applications, placements
3. **Ranked results** - PostgreSQL ts_rank for relevance scoring
4. **Context snippets** - ts_headline to show match context
5. **Keyboard navigation** - Arrow keys + Enter
6. **Entity type grouping** - Visually separate "Candidates (3)" from "Jobs (2)"
7. **Full results page** - Dedicated /search page with pagination
8. **Click-to-navigate** - Link each result to detail page

### Should Have (Quick Wins)
1. **Highlighted matches** - Bold matching text
2. **Recent searches** - LocalStorage or DB, show last 5
3. **Keyboard shortcut** - Cmd+K to open search
4. **Search scoping** - "My items" vs "All items" toggle

### Defer to Post-MVP
- Natural language parsing (complex, uncertain ROI)
- Fuzzy/typo tolerance (can add pg_trgm later)
- Synonym expansion (requires domain dictionary)
- Saved searches (collaboration feature)
- Quick actions in dropdown (complex UX)
- Export (reporting feature, not search core)

## Domain-Specific Considerations

### Recruiting Platform Patterns

Based on established patterns in recruiting/ATS platforms:

1. **Candidate search must handle:**
   - Name (first, last, full)
   - Current/desired role title
   - Skills/technologies
   - Location (city, state, remote)
   - Salary/rate expectations
   - Current company
   - Education (degree, university)

2. **Job search must handle:**
   - Job title
   - Company name
   - Location
   - Salary range
   - Required skills
   - Employment type (full-time, contract, etc.)

3. **Relationship context matters:**
   - "My candidates" (assigned to recruiter)
   - "My jobs" (recruiter has proposals)
   - "Available candidates" (unassigned, consented)
   - Show relationship status in results

4. **Privacy/consent awareness:**
   - Only show candidates who have consented to platform
   - Respect soft-delete/archive status
   - Filter by user's access permissions (already handled by resolveAccessContext)

### CRM/Marketplace Patterns

Based on established B2B SaaS patterns:

1. **Command palette pattern** (Cmd+K)
   - Popularized by Slack, Notion, Linear, GitHub
   - Users expect this in modern SaaS apps
   - Opens modal overlay with search input
   - Dismissed with Esc key

2. **Grouped results display:**
   ```
   Candidates (3)
     - Brandon Smith - Senior Engineer - San Diego
     - Sarah Johnson - Product Manager - Remote
     - ...

   Jobs (2)
     - Senior Software Engineer - Acme Corp - $150k
     - Product Designer - TechCo - Remote

   Companies (1)
     - Acme Corporation - San Francisco
   ```

3. **Result metadata:**
   - Entity type icon (user, briefcase, building)
   - Primary text (name/title)
   - Secondary text (role, location, company)
   - Tertiary text (context snippet with match)
   - Timestamp (last updated, created)

4. **Pagination/limits:**
   - Typeahead: Max 3-5 per entity type (total ~15-20 items)
   - Full page: Standard 25-50 per page
   - "Show all [N] results for [entity type]" link

## Performance Considerations

### Response Time Expectations

| Context | Target | Maximum | Notes |
|---------|--------|---------|-------|
| Typeahead query | <200ms | 500ms | Users typing in real-time |
| Full results page load | <500ms | 1s | Initial page load |
| Full results pagination | <200ms | 500ms | Subsequent pages |

### Optimization Strategies

1. **Database:**
   - GIN indexes on search_vector columns (already exists)
   - Limit typeahead to top 5 per entity type
   - Use ts_rank_cd for faster scoring
   - Separate queries per entity type, run in parallel

2. **Frontend:**
   - Debounce input (300ms recommended)
   - Cache recent search results (1-2 minutes)
   - Progressive loading (show quick entities first)
   - Skeleton/loading states for slow queries

3. **Backend:**
   - Set statement timeout (1s max)
   - Connection pooling
   - Consider Redis cache for popular queries (post-MVP)

## User Stories

### US-1: Quick Find Candidate
**As a** recruiter
**I want to** type "brandon engineer san diego" in global search
**So that** I can quickly find Brandon's candidate profile

**Acceptance:**
- Typeahead shows results as I type
- Results include candidates matching name, role, location
- I can click result to navigate to candidate detail page
- I can use arrow keys to navigate results

### US-2: Cross-Entity Discovery
**As a** hiring manager
**I want to** search "acme" and see candidates, jobs, and company profile
**So that** I can see all platform entities related to a company

**Acceptance:**
- Results grouped by entity type (Candidates at Acme, Jobs at Acme, Acme company profile)
- Each group labeled clearly
- Results ranked by relevance within each group

### US-3: Explore All Results
**As a** recruiter
**I want to** press Enter on a search query without selecting a dropdown result
**So that** I can see a full page of all matching entities with filters

**Acceptance:**
- Pressing Enter navigates to /search?q=[query]
- Full results page shows all entity types
- I can filter by entity type (Candidates only, Jobs only, etc.)
- I can sort by relevance or date
- Results are paginated (25 per page)

### US-4: Keyboard Power User
**As a** frequent platform user
**I want to** press Cmd+K to open search from any page
**So that** I can quickly navigate without using the mouse

**Acceptance:**
- Cmd+K (Mac) or Ctrl+K (Windows) opens search modal
- Modal overlays current page
- Input auto-focused
- Esc closes modal
- Works from any page in the app

## Sources

**Note:** Research based on established patterns in SaaS/recruiting platforms (MEDIUM confidence).
Unable to verify with current 2026 sources due to WebSearch restrictions.

**Pattern references (from training data):**
- Global search patterns: Slack, Notion, Linear, GitHub, Intercom
- Recruiting ATS patterns: Greenhouse, Lever, Ashby, Workable
- CRM search patterns: Salesforce, HubSpot, Pipedrive
- Marketplace patterns: Upwork, Toptal

**Verification needed:**
- 2026 current best practices for global search UX
- Latest PostgreSQL full-text search optimizations
- Current browser support for keyboard shortcuts
- Accessibility standards for search typeahead (WCAG 2.2+)

**Existing implementation analysis:**
- Codebase already has search_vector columns on 7 tables (candidates, jobs, companies, etc.)
- Uses PostgreSQL full-text search with ts_rank
- SearchInput component with debounce exists
- V2 API pattern supports filtering and pagination
