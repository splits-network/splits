# Research Summary: Global Search Features

**Domain:** Global/Universal Search in Recruiting Marketplace SaaS
**Researched:** 2026-02-12
**Overall confidence:** MEDIUM (Features) / HIGH (Stack & Architecture)

## Executive Summary

Global search in a recruiting marketplace must query across 6-7 entity types (candidates, jobs, companies, recruiters, applications, placements) with role-based access control, delivering both real-time typeahead results (<200ms) and full paginated search results. The feature landscape divides into **table stakes** (typeahead dropdown, multi-entity results, keyboard navigation, ranked results) and **differentiators** (natural language parsing, fuzzy matching, relationship context boosting). The existing codebase already has the necessary infrastructure: PostgreSQL full-text search with tsvector columns and GIN indexes on 7 tables, V2 API pattern with resolveAccessContext, and SearchInput component with debouncing.

The critical architectural decision is to extend the existing ATS service (not create a new search service) and use parallel Postgres queries with in-memory merging (not UNION ALL) to leverage existing GIN indexes and simplify role-based filtering. The main pitfalls to avoid are: (1) access control leakage (filtering after query vs during query), (2) using LIKE instead of full-text search, (3) no debouncing on typeahead, (4) incomparable ts_rank scores across entity types, and (5) missing prerequisites (recruiters table still uses ILIKE, jobs search_vector excludes salary).

**Strategic recommendation:** Build v1 with table stakes features only. Defer differentiators (natural language parsing, fuzzy matching, synonym expansion) to v2 after gathering usage data. Focus on correctness (access control, input sanitization) and performance (debouncing, parallel queries, per-entity LIMIT) over advanced features.

## Key Findings

**Stack:** PostgreSQL Full-Text Search (existing infrastructure, no new services needed)
- Existing: search_vector tsvector columns on 7 tables, GIN indexes, ts_rank scoring
- Add: API Gateway route, ATS SearchRepository, frontend GlobalSearchInput component
- No new infrastructure: No Elasticsearch, no Algolia, no separate search service

**Architecture:** Extend ATS service with parallel queries + in-memory merge
- Pattern: Execute 6-7 separate SELECT queries via Promise.all(), merge in application code
- Access control: Apply resolveAccessContext filters in SQL WHERE clauses (not post-query)
- Caching: Redis for access context (1 min TTL) and typeahead results (30s TTL, optional)
- Integration: Reuse existing V2 API pattern, shared-access-context, shared-ui components

**Features:** Typeahead dropdown + full search page are table stakes
- Must have: Real-time typeahead (<200ms), multi-entity results, ranked by ts_rank, keyboard navigation
- Should have: Highlighted matches, context snippets (ts_headline), entity type grouping
- Defer: Natural language parsing, fuzzy/typo tolerance, synonym expansion, saved searches

**Critical pitfall:** Access control applied after query instead of during query
- Leaks information (result counts reveal private entities)
- Performance collapse (fetch 10K rows, filter to 50)
- Must pass role parameters to Postgres function, apply WHERE clauses in SQL

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 0: Prerequisites (CRITICAL - must complete first)
**Rationale:** Global search requires all entities to have tsvector columns. Two tables incomplete.

**Addresses:**
- Recruiters table migration to search_vector (currently uses ILIKE)
- Jobs table enhancement (add salary to search_vector for "120k" searches)

**Avoids:**
- Pitfall #4: Missing search_vector causing performance collapse (ILIKE = full table scan)
- Pitfall #5: Salary not searchable (user searches "120000", gets zero results)

**Phase ordering rationale:** Cannot build global search until all entity tables have FTS infrastructure. Attempting to proceed without prerequisites creates performance bottleneck (ILIKE blocks entire UNION ALL query) and feature gaps (salary searches don't work).

---

### Phase 1: Database Function (Core Foundation)
**Rationale:** Establish normalized result schema, access control, and ranking strategy before building API.

**Addresses:**
- Normalized result schema across 7 entity types (id, result_title, result_subtitle, entity_type, relevance)
- Role-based WHERE clauses in Postgres function (not application layer)
- Ranking strategy (entity type grouping OR boost factors)
- Per-entity LIMIT before UNION ALL (prevent full table scans)

**Avoids:**
- Pitfall #1: UNION ALL schema mismatch (column count/type errors)
- Pitfall #2: ts_rank not comparable across entities (jobs always rank higher than candidates)
- Pitfall #3: Access control after query (information leakage, performance collapse)
- Pitfall #9: UNION ALL without LIMIT (scan 10K rows to return 20)

**Deliverable:** `global_search(p_query, p_user_role, p_organization_ids, p_recruiter_id, p_limit)` function returning normalized results.

---

### Phase 2: API Endpoint (Backend Integration)
**Rationale:** Bridge database function to frontend, add validation and sanitization.

**Addresses:**
- Input sanitization (prevent query injection)
- Entity type enum consistency (shared-types)
- API response format ({ data: { results, total } })
- Error handling (to_tsquery errors, database timeouts)

**Avoids:**
- Pitfall #6: Query injection via unsanitized input
- Pitfall #11: Inconsistent entity type values (database returns 'job', frontend expects 'jobs')

**Deliverable:** `GET /v2/search?q=query&mode=typeahead&limit=5` endpoint in api-gateway, proxied to ATS service.

---

### Phase 3: Frontend Typeahead (MVP User-Facing Feature)
**Rationale:** Deliver minimum viable search experience (typeahead in header).

**Addresses:**
- Debounced search input (300ms per project standard)
- Keyboard navigation (arrow keys, Enter, Esc)
- Loading states (spinner during search)
- Match highlighting (bold matching terms)
- Entity type icons (visual distinction)

**Avoids:**
- Pitfall #7: No debouncing (36 API calls for typing "software engineer")
- Pitfall #8: No min query length (searching "a" scans entire database)
- Pitfall #13: Empty state flicker (show loading during debounce)
- Pitfall #14: Keyboard navigation missing (accessibility failure)
- Pitfall #15: No match highlighting (user doesn't see relevance)

**Deliverable:** GlobalSearchInput component in PortalHeader, navigates to entity detail pages on selection.

**MVP recommendation:** Stop here for v1. Typeahead in header is sufficient for initial launch.

---

### Phase 4: Full Search Page (Optional for v1, Recommended for v1.1)
**Rationale:** Support exploratory search when typeahead shows "50+ results".

**Addresses:**
- Dedicated /search?q=query page
- Pagination (25 results per page)
- Entity type filtering (Jobs only, Candidates only)
- Sort options (relevance, date)

**Avoids:**
- Pitfall #12: Pagination consistency (offset-based acceptable for MVP)

**Deliverable:** /portal/search route with filters, pagination, full result list.

**Defer if tight timeline:** Typeahead is table stakes, full search page is "nice to have" for v1.

---

### Phase 5: Monitoring & Optimization (Post-Launch)
**Rationale:** Detect performance issues, index bloat, access control violations in production.

**Addresses:**
- Index bloat monitoring (GIN index size > 2x data size)
- Query latency alerts (p95 > 500ms)
- Error rate alerts (>1% to_tsquery errors)
- Cache hit rate monitoring (<80% indicates TTL too short)

**Avoids:**
- Pitfall #10: GIN index bloat from frequent updates (applications, placements)

**Deliverable:** Datadog/Grafana dashboards, alerts for performance degradation.

**Defer to post-MVP:** Not required for launch, but critical for scaling beyond 1K users.

---

## Research Flags for Phases

**Phase 0 (Prerequisites):** Standard migration, unlikely to need research
- Recruiters search_vector follows existing pattern (candidates, jobs migrations)
- Jobs salary formatting is implementation detail (include as TEXT in tsvector)

**Phase 1 (Database Function):** May need research on ranking strategy
- Choosing between entity type grouping vs boost factors vs normalization
- Requires user testing to validate relevance quality
- Flag for **deeper research**: ts_rank normalization across heterogeneous entities

**Phase 2 (API Endpoint):** Standard patterns, unlikely to need research
- Input sanitization is well-established (regex, length limits)
- API response format follows existing V2 envelope pattern

**Phase 3 (Frontend Typeahead):** Standard React patterns, unlikely to need research
- Debouncing, keyboard navigation, loading states are established UX patterns
- Existing SearchInput component provides starting point

**Phase 4 (Full Search Page):** May need UX research on filters/sort options
- What filters are most valuable? (Entity type, date range, status, location?)
- What sort options? (Relevance only? Date? Alphabetical?)
- Flag for **user research**: Survey recruiting platform users on preferred filters

**Phase 5 (Monitoring):** Standard observability, unlikely to need research
- Database metrics (index size, query latency) are well-understood
- Alert thresholds may need tuning based on production traffic

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Existing codebase has all necessary infrastructure (FTS, GIN indexes, API Gateway, V2 pattern) |
| **Features** | MEDIUM | Table stakes features based on established SaaS patterns (training data), not 2026-verified with WebSearch |
| **Architecture** | HIGH | Parallel queries + in-memory merge is proven pattern, fits existing V2 architecture perfectly |
| **Pitfalls** | HIGH | Grounded in project's actual codebase patterns (access control, FTS usage) + Postgres FTS domain knowledge |

**Confidence boosters:**
- Codebase already has 7 tables with search_vector columns (verified via grep)
- V2 repositories already use resolveAccessContext for role-based filtering (verified via code analysis)
- ARCHITECTURE.md file already exists with comprehensive parallel query pattern
- PITFALLS.md file already exists with project-specific anti-patterns

**Confidence gaps:**
- Unable to verify 2026 current best practices (WebSearch denied)
- No user research data on what features recruiters/hiring managers value most
- No performance benchmarks from existing per-entity search (baseline latency unknown)
- Assumption that <200ms typeahead latency is target (should validate with product team)

---

## Gaps to Address

### Research gaps (couldn't resolve during this session):
1. **Current 2026 best practices for global search UX** - WebSearch unavailable, relying on training data (Jan 2025)
2. **Competitor analysis** - Unable to verify what Greenhouse, Lever, Ashby actually do in 2026
3. **Latest Postgres FTS optimizations** - Training data current through Jan 2025, may be newer techniques
4. **Browser support for keyboard shortcuts** - Assumed Cmd+K works in all modern browsers (should verify)

### Project-specific validation needed:
1. **Recruiters search_vector status** - Baseline.sql has `build_recruiters_search_vector()` function, but need to verify:
   - Does trigger exist to auto-update search_vector?
   - Does GIN index exist on recruiters.search_vector?
   - Or is migration truly incomplete?

2. **Jobs salary searchability** - Verify jobs.search_vector does NOT include salary fields currently
   - Check `build_jobs_search_vector()` function source
   - Confirm salary_min, salary_max are excluded from tsvector

3. **Performance baseline** - Run EXPLAIN ANALYZE on existing per-entity searches to establish current latency
   - Candidates search with 10K rows
   - Jobs search with 5K rows
   - Applications search with 50K rows
   - Use as baseline for global search (should be similar if parallel queries work)

4. **Target latency** - Confirm <200ms for typeahead, <500ms for full search with product/UX team
   - Is this acceptable for business use case?
   - What's the priority: fast results vs comprehensive results?

5. **Entity type URL mapping** - Verify routing conventions:
   - Jobs: `/portal/roles/` or `/portal/jobs/`?
   - Recruiters: `/portal/recruiters/` or `/portal/users/recruiters/`?
   - Affects EntityType → route mapping in shared-types

### Topics needing phase-specific research later:
1. **Ranking strategy validation (Phase 1)** - After implementing database function, need user testing:
   - Do entity type boosts (candidates 1.2x, jobs 1.0x, companies 0.9x) produce sensible ordering?
   - Or should we use entity type grouping (top 5 candidates, top 5 jobs)?
   - Requires real user feedback on search result quality

2. **Filters/sort options (Phase 4)** - If building full search page, research what filters users want:
   - Survey recruiting platform users: "What filters would you use in global search?"
   - Options: Entity type, date range, status (active/archived), location, salary range, remote/onsite
   - Prioritize based on survey results

3. **Caching strategy tuning (Phase 5)** - After launch, monitor cache hit rates:
   - Is 1-minute TTL for access context too short? (invalidated too often)
   - Is 30-second TTL for typeahead results too long? (stale results shown)
   - Tune based on actual usage patterns

---

## Recommended Next Steps

1. **Validate prerequisites:**
   - Check recruiters table: Does search_vector column exist? Is it populated? Is GIN index created?
   - Check jobs search_vector: Does it include salary fields? (run `SELECT build_jobs_search_vector(id) FROM jobs LIMIT 1;` and inspect)

2. **Establish performance baseline:**
   - Run EXPLAIN ANALYZE on existing per-entity searches (candidates, jobs, companies)
   - Record p50, p95, p99 latency for 10K row tables
   - Set target: global search should be <2x slowest per-entity search

3. **Define entity type enum:**
   - Create `packages/shared-types/src/search/types.ts`
   - Define EntityType enum with EXACT values database will return ('candidate', 'job', not 'candidates', 'jobs')
   - Define ENTITY_TYPE_ROUTES mapping to URL paths
   - Share with all phases (database function, API, frontend)

4. **Design database function signature:**
   - Decide ranking strategy: Entity type grouping? Boost factors? Normalization?
   - Prototype with SQL query, test with sample data
   - Validate with stakeholders: "Does this ordering make sense for recruiters/hiring managers?"

5. **Create Phase 0 roadmap:**
   - If recruiters migration incomplete: Create detailed migration plan (function, trigger, index, backfill)
   - If jobs salary exclusion confirmed: Create migration to add salary to search_vector
   - Estimate effort: 2-3 days for each migration
   - Block Phase 1 until Phase 0 complete

---

## Sources

**HIGH confidence sources:**
- **Project codebase:** `.planning/PROJECT.md`, `.planning/ARCHITECTURE.md`, `.planning/PITFALLS.md`
- **Database schema:** `supabase/migrations/20240101000000_baseline.sql`, search-related migrations
- **Service implementations:** `services/ats-service/src/v2/*/repository.ts`, existing search patterns
- **Frontend components:** `apps/portal/src/components/standard-lists/search-input.tsx`
- **PostgreSQL documentation:** ts_rank, ts_headline, GIN indexes, full-text search (training data current through Jan 2025)

**MEDIUM confidence sources (training data, not 2026-verified):**
- SaaS global search patterns (Slack, Notion, Linear, GitHub command palette)
- Recruiting ATS patterns (Greenhouse, Lever, Ashby search features)
- React UX patterns (debouncing, keyboard navigation, loading states)

**Unable to verify (WebSearch denied):**
- 2026 current best practices for global search UX
- Latest Postgres FTS optimizations (post-Jan 2025)
- Current browser support for keyboard shortcuts
- Recent accessibility standards (WCAG 2.2+ for search typeahead)

**Recommendation:** Treat MEDIUM confidence items as hypotheses. Validate with:
- User testing (do recruiters actually want these features?)
- Performance testing (are latency targets achievable?)
- Browser testing (do keyboard shortcuts work across all targets?)
