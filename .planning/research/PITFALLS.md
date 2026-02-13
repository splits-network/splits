# Domain Pitfalls: Global Search with Postgres Full-Text Search

**Domain:** Cross-entity global search in recruiting marketplace
**Researched:** 2026-02-12
**Context:** Adding global search via UNION ALL to existing system with per-entity FTS

---

## CRITICAL PITFALLS

Mistakes that cause rewrites, performance collapse, or security issues.

### Pitfall 1: UNION ALL Without Normalized Result Schemas

**What goes wrong:** Each entity table returns different columns (candidates has `full_name`, jobs has `title`, companies has `name`). UNION ALL requires matching columns or query fails with "each UNION query must have the same number of columns" error.

**Why it happens:** Developers write per-entity SELECT statements with native columns instead of normalizing to a common result schema.

**Consequences:**
- Query compilation fails
- Or worse: results have mismatched types (putting job.title in result.name when second SELECT matches first SELECT's column count but wrong semantics)
- Frontend cannot render mixed-type results consistently

**Prevention:**
```sql
-- WRONG: Different columns per entity
SELECT id, full_name, email FROM candidates
UNION ALL
SELECT id, title, company_name FROM jobs;  -- Error: column names don't match

-- RIGHT: Normalized result schema
SELECT
    id,
    full_name AS result_title,
    email AS result_subtitle,
    'candidate' AS entity_type,
    ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS relevance
FROM candidates
WHERE search_vector @@ websearch_to_tsquery('english', $1)
UNION ALL
SELECT
    id,
    title AS result_title,
    company_name AS result_subtitle,
    'job' AS entity_type,
    ts_rank(search_vector, websearch_to_tsquery('english', $1)) AS relevance
FROM jobs
WHERE search_vector @@ websearch_to_tsquery('english', $1)
ORDER BY relevance DESC, entity_type, result_title
LIMIT 20;
```

**Detection:** Query fails immediately in development with column mismatch error.

**Phase impact:** Phase 1 (Database Function) — fix before creating function.

---

### Pitfall 2: ts_rank Scores Not Comparable Across Entity Types

**What goes wrong:** `ts_rank()` scores are NOT normalized across tables. A candidate with rank 0.8 is not necessarily more relevant than a job with rank 0.6 — they use different search vectors with different field counts and weights.

**Why it happens:** Developers assume ts_rank produces absolute scores like TF-IDF. It doesn't. Scores depend on:
- Document length (longer documents = lower scores due to normalization)
- Number of weighted fields (candidates have 12 fields, companies have 6)
- Weight distribution (all A-weight fields vs mixed weights)

**Consequences:**
- Jobs always rank higher than candidates (fewer fields, higher density)
- Or candidates always rank higher (more fields, more matches)
- Users get nonsensical result ordering: "senior" query returns companies before senior engineer jobs
- Loss of trust in search relevance

**Prevention:**

**Option A: Separate scoring per entity, sort by entity type priority**
```sql
-- Group results by entity_type, show top N per type
SELECT * FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY entity_type ORDER BY relevance DESC) as rank_in_type
    FROM global_search_results
) ranked
WHERE rank_in_type <= 5  -- Top 5 per entity type
ORDER BY
    CASE entity_type
        WHEN 'candidate' THEN 1
        WHEN 'job' THEN 2
        WHEN 'company' THEN 3
        ELSE 4
    END,
    relevance DESC;
```

**Option B: Normalize scores per entity type before merging**
```sql
-- Calculate min/max per entity, normalize to 0-1 range
WITH scored AS (
    SELECT ..., ts_rank(...) as raw_score FROM candidates
    UNION ALL
    SELECT ..., ts_rank(...) as raw_score FROM jobs
),
normalized AS (
    SELECT *,
        (raw_score - MIN(raw_score) OVER (PARTITION BY entity_type)) /
        NULLIF(MAX(raw_score) OVER (PARTITION BY entity_type) - MIN(raw_score) OVER (PARTITION BY entity_type), 0)
        AS normalized_score
    FROM scored
)
SELECT * FROM normalized ORDER BY normalized_score DESC;
```

**Option C: Apply entity-specific boost factors**
```sql
-- Manually boost certain entity types based on business logic
SELECT *,
    CASE entity_type
        WHEN 'candidate' THEN relevance * 1.2  -- Boost candidates
        WHEN 'job' THEN relevance * 1.0
        WHEN 'company' THEN relevance * 0.8   -- Demote companies
    END AS boosted_score
FROM global_search_results
ORDER BY boosted_score DESC;
```

**Recommendation:** Use Option A (entity type grouping) for typeahead, Option C (boost factors) for full search.

**Detection:** User testing reveals weird ordering. "Engineering" returns random companies before engineer jobs.

**Phase impact:** Phase 1 (Database Function) — decide ranking strategy before implementing function.

---

### Pitfall 3: Access Control Applied After Query Instead of During

**What goes wrong:** Global search function returns all matching results, then application code filters by user permissions. This causes:
- Information leakage (user sees "50 results" but only 3 after filtering)
- Performance collapse (query scans 10K rows, returns 1K, app filters to 10)
- Pagination breaks (page 2 might have zero results after filtering)

**Why it happens:** Easier to write one query for all users, then filter in application layer. Postgres row-level security feels complex.

**Consequences:**
- **Security risk:** Candidate searches for jobs, sees "15 matches" but only 2 visible — reveals existence of 13 private jobs
- **Performance:** Query fetches 1000 rows, app filters to 50, wasted 95% of work
- **UX bug:** Pagination shows "Page 1 of 10" but pages 2-10 are empty after filtering

**Prevention:**

**Pass role filters directly to Postgres function:**
```sql
CREATE OR REPLACE FUNCTION global_search(
    p_query TEXT,
    p_user_role TEXT,
    p_organization_ids UUID[],
    p_recruiter_id UUID,
    p_limit INT DEFAULT 20
) RETURNS TABLE(...) AS $$
BEGIN
    RETURN QUERY
    SELECT id, result_title, result_subtitle, entity_type, relevance FROM (
        -- Candidates: platform admin sees all, recruiters see marketplace, company users see applicants
        SELECT c.id, c.full_name, c.email, 'candidate', ts_rank(...)
        FROM candidates c
        WHERE c.search_vector @@ websearch_to_tsquery('english', p_query)
          AND (
              p_user_role = 'platform_admin'
              OR (p_user_role = 'recruiter' AND c.marketplace_enabled = TRUE)
              OR (p_user_role IN ('company_admin', 'hiring_manager')
                  AND EXISTS (
                      SELECT 1 FROM applications a
                      JOIN jobs j ON a.job_id = j.id
                      WHERE a.candidate_id = c.id
                        AND j.company_id = ANY(p_organization_ids)
                  ))
          )

        UNION ALL

        -- Jobs: company users see own jobs, recruiters/candidates see active public jobs
        SELECT j.id, j.title, j.company_name, 'job', ts_rank(...)
        FROM jobs j
        WHERE j.search_vector @@ websearch_to_tsquery('english', p_query)
          AND (
              p_user_role = 'platform_admin'
              OR (p_user_role IN ('company_admin', 'hiring_manager')
                  AND j.company_id = ANY(p_organization_ids))
              OR (p_user_role IN ('recruiter', 'candidate') AND j.status = 'active')
          )
    ) results
    ORDER BY relevance DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Call from API with resolved access context:**
```typescript
const context = await resolveAccessContext(supabase, clerkUserId);
const results = await supabase.rpc('global_search', {
    p_query: query,
    p_user_role: context.roles[0],  // Primary role
    p_organization_ids: context.organizationIds,
    p_recruiter_id: context.recruiterId,
    p_limit: 20
});
```

**Detection:** Security review catches "SELECT * FROM candidates" without WHERE filters. Load testing shows query returns 10x more rows than displayed.

**Phase impact:** Phase 1 (Database Function) — design function signature with role parameters from the start.

---

### Pitfall 4: Missing Search Vector on Recruiters Table

**What goes wrong:** According to project context, "Recruiters table still uses ILIKE (not migrated to tsvector yet)." Global search queries all tables via UNION ALL, but recruiters query uses:
```sql
SELECT * FROM recruiters WHERE name ILIKE '%query%' OR email ILIKE '%query%'
```

This causes:
- Performance: ILIKE can't use GIN index, requires sequential scan
- Inconsistency: Other entities use ts_rank for relevance, recruiters have no score
- Ranking failure: UNION ALL expects ts_rank column, recruiters query must fake it

**Why it happens:** Legacy code not yet migrated. Developers forget to complete migration before adding global search.

**Consequences:**
- Recruiters search is 10-100x slower than other entities
- UNION ALL query blocked on slow ILIKE scan
- Relevance ranking impossible for recruiters (no ts_rank)

**Prevention:**
1. **Complete recruiters tsvector migration BEFORE building global search**
2. Create migration matching existing pattern:

```sql
-- Add search_vector column
ALTER TABLE recruiters ADD COLUMN search_vector tsvector;

-- Create search vector builder function
-- (According to baseline.sql, this function already exists and queries users table inline)
-- Function signature: build_recruiters_search_vector(p_recruiter_id UUID)
-- No denormalization needed - queries users.name, users.email inline

-- Create trigger to update search_vector on recruiters changes
CREATE OR REPLACE FUNCTION update_recruiters_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := build_recruiters_search_vector(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recruiters_search_vector_trigger
BEFORE INSERT OR UPDATE ON recruiters
FOR EACH ROW
EXECUTE FUNCTION update_recruiters_search_vector();

-- Create trigger to update search_vector when users table changes
CREATE OR REPLACE FUNCTION sync_recruiters_search_from_users() RETURNS trigger AS $$
BEGIN
    UPDATE recruiters r
    SET search_vector = build_recruiters_search_vector(r.id)
    WHERE r.user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_recruiters_search_from_users_trigger
AFTER INSERT OR UPDATE OF name, email ON users
FOR EACH ROW
EXECUTE FUNCTION sync_recruiters_search_from_users();

-- Populate existing rows
UPDATE recruiters SET search_vector = build_recruiters_search_vector(id);

-- Create GIN index
CREATE INDEX recruiters_search_vector_idx ON recruiters USING GIN(search_vector);
```

3. **Update recruiters repository to use textSearch()** like other V2 repositories
4. **Verify recruiters search works in isolation** before integrating into global search

**Detection:** Query plan shows "Seq Scan on recruiters" while other tables show "Bitmap Index Scan on <table>_search_vector_idx". Global search is slow.

**Phase impact:** Phase 0 (Pre-requisite) — Must complete BEFORE Phase 1. Do not proceed with global search until recruiters migration is done.

---

### Pitfall 5: Salary and Numeric Fields Not Searchable

**What goes wrong:** According to project context, "Jobs search_vector does NOT include salary field." User searches "120000" or "$120k" and gets zero results even though jobs exist with that salary.

**Why it happens:**
- Developers assume tsvector only works for text
- Salary stored as NUMERIC, not TEXT
- Salary has separate columns (salary_min, salary_max, salary_currency)
- No clear pattern for indexing numeric ranges

**Consequences:**
- Users cannot search by salary range ("120k-150k")
- Cannot search by numeric values in job requirements ("5 years experience")
- Common recruiting searches fail: "100k remote" returns only "remote" matches

**Prevention:**

**Option A: Include salary as text in search_vector**
```sql
-- In build_jobs_search_vector function, add salary formatting
CREATE OR REPLACE FUNCTION build_jobs_search_vector(...) RETURNS tsvector AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(p_title, '')), 'A') ||
        ... other fields ...
        -- Format salary as searchable text
        setweight(to_tsvector('simple',
            COALESCE(p_salary_min::TEXT, '') || ' ' ||
            COALESCE(p_salary_max::TEXT, '') || ' ' ||
            CASE
                WHEN p_salary_min IS NOT NULL THEN
                    -- Add formatted versions: "120000" -> "120k" for searchability
                    (p_salary_min / 1000)::TEXT || 'k'
                ELSE ''
            END
        ), 'C');
END;
$$;
```

**Option B: Separate numeric filters, not part of FTS**
```sql
-- Global search function accepts separate numeric range parameters
CREATE FUNCTION global_search(
    p_query TEXT,
    p_salary_min NUMERIC DEFAULT NULL,
    p_salary_max NUMERIC DEFAULT NULL,
    ...
) AS $$
    -- In jobs query, add:
    AND (p_salary_min IS NULL OR j.salary_max >= p_salary_min)
    AND (p_salary_max IS NULL OR j.salary_min <= p_salary_max)
$$;
```

**Recommendation:** Use Option A for simple numeric terms ("120k"), Option B for range filters (UI sliders).

**Detection:** User searches "120000", gets zero results despite matching jobs. User feedback: "Search doesn't work for salary."

**Phase impact:** Phase 0 (Pre-requisite) — Update jobs search_vector to include salary before building global search.

---

### Pitfall 6: Query Parameter Injection in websearch_to_tsquery

**What goes wrong:** User input passed directly to `websearch_to_tsquery()` without sanitization. Malicious queries crash Postgres or cause unexpected results:
- `search=")))) OR 1=1 --"`
- `search="<script>alert(1)</script>"`
- Special characters break tsquery syntax: `&`, `|`, `!`, `(`, `)`

**Why it happens:** Developers assume Postgres functions auto-sanitize input. They don't. `websearch_to_tsquery` handles SOME special chars, but not all edge cases.

**Consequences:**
- Postgres error: "syntax error in tsquery"
- Query returns zero results for valid searches containing special chars
- Potential SQL injection if query construction is flawed

**Prevention:**

**Use parameterized queries (prepared statements):**
```typescript
// WRONG: String concatenation
const { data } = await supabase.rpc('global_search', {
    p_query: `SELECT * FROM jobs WHERE search_vector @@ '${userInput}'`  // NEVER DO THIS
});

// RIGHT: Parameterized query
const { data } = await supabase.rpc('global_search', {
    p_query: userInput  // Supabase client parameterizes this
});
```

**In Postgres function, use STABLE function with parameters:**
```sql
CREATE FUNCTION global_search(p_query TEXT, ...) RETURNS TABLE(...) AS $$
BEGIN
    -- websearch_to_tsquery handles most sanitization, but validate input first
    IF p_query IS NULL OR LENGTH(TRIM(p_query)) = 0 THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT ...
    WHERE search_vector @@ websearch_to_tsquery('english', p_query);
    -- p_query is a parameter, not concatenated - safe from SQL injection
END;
$$ LANGUAGE plpgsql STABLE;
```

**Additional sanitization in API layer:**
```typescript
// Remove dangerous characters before calling DB
const sanitizedQuery = query
    .replace(/[^\w\s@.-]/g, ' ')  // Keep alphanumeric, spaces, @, ., -
    .trim()
    .substring(0, 200);  // Limit length

if (sanitizedQuery.length < 2) {
    return reply.send({ data: { results: [], total: 0 } });
}

const { data } = await supabase.rpc('global_search', {
    p_query: sanitizedQuery,
    ...
});
```

**Detection:** Security audit catches string concatenation. Penetration testing with special characters crashes query.

**Phase impact:** Phase 2 (API Endpoint) — Add sanitization when building API route.

---

## MODERATE PITFALLS

Mistakes that cause delays, performance degradation, or technical debt.

### Pitfall 7: Typeahead Without Request Debouncing

**What goes wrong:** User types "software engineer san diego 120k" — 36 characters = 36 API requests in rapid succession. Each request:
- Hits database with UNION ALL query across 7 tables
- Acquires connection from pool
- Computes ts_rank for hundreds of matches
- Returns results that are immediately discarded when next keystroke arrives

**Why it happens:** Developers implement `onChange={search(e.target.value)}` without debouncing.

**Consequences:**
- Database connection pool exhaustion (36 concurrent queries)
- API response time spikes (queries queue behind each other)
- User sees flickering results as stale responses arrive out of order
- Wasted compute: 35 of 36 queries are thrown away

**Prevention:**

**Frontend debouncing (300ms as per project standard):**
```typescript
// Use existing useDebounce hook from project
import { useDebounce } from '@/hooks/use-debounce';

const [query, setQuery] = useState('');
const debouncedQuery = useDebounce(query, 300);  // 300ms per project standard

useEffect(() => {
    if (debouncedQuery.length >= 2) {
        performSearch(debouncedQuery);
    }
}, [debouncedQuery]);

return (
    <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}  // Updates immediately
        placeholder="Search..."
    />
);
```

**Backend request deduplication (optional, for high traffic):**
```typescript
// In api-gateway search route, deduplicate identical concurrent requests
const searchCache = new Map<string, Promise<any>>();

async function searchHandler(request, reply) {
    const cacheKey = `${request.headers['x-clerk-user-id']}:${request.query.q}`;

    if (searchCache.has(cacheKey)) {
        // Return existing in-flight request
        return searchCache.get(cacheKey);
    }

    const searchPromise = performActualSearch(request);
    searchCache.set(cacheKey, searchPromise);

    try {
        const result = await searchPromise;
        return reply.send(result);
    } finally {
        // Clear cache after 500ms
        setTimeout(() => searchCache.delete(cacheKey), 500);
    }
}
```

**Detection:** Load testing shows 36 requests for single typeahead interaction. Database connection pool fills up. API latency spikes during fast typing.

**Phase impact:** Phase 3 (Frontend Typeahead) — Implement debouncing from the start. Do not deploy typeahead without it.

---

### Pitfall 8: No Minimum Query Length Validation

**What goes wrong:** User types "a" in search box → triggers query across 7 tables matching thousands of rows with "a" → database scans millions of tsvector entries → 5-second response time → user types second character "ab" → repeat.

**Why it happens:** No validation on minimum query length. Every keystroke triggers search.

**Consequences:**
- Single-character searches are uselessly broad ("a" matches everything)
- Massive performance cost for zero value
- User frustration: "Search is slow"

**Prevention:**

**Minimum 2-3 characters:**
```typescript
// Frontend validation
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
    if (debouncedQuery.length >= 2) {  // Minimum 2 characters
        performSearch(debouncedQuery);
    } else {
        setResults([]);  // Clear results for short queries
    }
}, [debouncedQuery]);
```

**Backend validation:**
```typescript
// In API route
if (!query || query.trim().length < 2) {
    return reply.send({
        data: { results: [], total: 0 },
        message: 'Query must be at least 2 characters'
    });
}
```

**Detection:** Performance monitoring shows high query volume for 1-character searches. Database CPU spikes when search input gains focus.

**Phase impact:** Phase 3 (Frontend Typeahead) — Add validation before deploying typeahead.

---

### Pitfall 9: UNION ALL Query Without LIMIT Causes Full Table Scans

**What goes wrong:** Global search function returns ALL matching rows across 7 tables, then LIMIT is applied after UNION ALL:
```sql
-- WRONG: LIMIT after UNION ALL
(SELECT * FROM candidates WHERE ...)
UNION ALL
(SELECT * FROM jobs WHERE ...)
UNION ALL
... 5 more tables ...
ORDER BY relevance DESC
LIMIT 20;  -- Applied AFTER scanning all 7 tables
```

This causes Postgres to:
1. Scan all 7 tables completely
2. Compute ts_rank for every match (potentially thousands)
3. Sort ALL results
4. Return top 20

For typeahead with 5 results, this scans 10,000 rows to return 5.

**Why it happens:** Developers assume Postgres optimizes LIMIT through UNION ALL. It doesn't always.

**Consequences:**
- Typeahead takes 500-2000ms instead of <200ms
- Database CPU spikes on every search
- Does not scale beyond 100K rows per table

**Prevention:**

**Option A: Apply LIMIT per entity before UNION ALL**
```sql
SELECT * FROM (
    (
        SELECT id, title, company_name, 'job', ts_rank(...) AS relevance
        FROM jobs
        WHERE search_vector @@ websearch_to_tsquery('english', p_query)
        ORDER BY ts_rank(...) DESC
        LIMIT 10  -- Top 10 jobs
    )
    UNION ALL
    (
        SELECT id, full_name, email, 'candidate', ts_rank(...) AS relevance
        FROM candidates
        WHERE search_vector @@ websearch_to_tsquery('english', p_query)
        ORDER BY ts_rank(...) DESC
        LIMIT 10  -- Top 10 candidates
    )
    UNION ALL
    ... 5 more entities, each with LIMIT 10 ...
) all_results
ORDER BY relevance DESC
LIMIT 20;  -- Top 20 across all entities
```

This limits each entity to 10 results (70 total), then takes top 20 across entities.

**Option B: Use CTE with materialized results**
```sql
WITH search_matches AS MATERIALIZED (
    SELECT * FROM candidates WHERE search_vector @@ ...
    UNION ALL
    SELECT * FROM jobs WHERE search_vector @@ ...
    ...
)
SELECT * FROM search_matches
ORDER BY relevance DESC
LIMIT 20;
```

**Recommendation:** Use Option A for typeahead (5-10 results), Option B for full search (50-100 results).

**Detection:** Query plan shows "Sort" node with rows=10000 input, rows=20 output. Query takes >500ms.

**Phase impact:** Phase 1 (Database Function) — Design function with per-entity LIMIT from the start.

---

### Pitfall 10: GIN Index Bloat from Frequent Updates

**What goes wrong:** Search vectors auto-update on every INSERT/UPDATE via triggers. For high-write tables (applications, placements), this causes:
- GIN index bloat: index grows to 2-3x data size
- Insert/update performance degradation: triggers recompute entire search_vector
- Vacuum can't reclaim space fast enough

**Why it happens:** BEFORE INSERT/UPDATE triggers fire on every write. GIN indexes are append-only structures that bloat under heavy updates.

**Consequences:**
- Applications table with 100K rows, 500MB data, 1.5GB search_vector index
- INSERT time grows from 2ms to 50ms due to trigger overhead
- Query performance degrades as index bloat increases

**Prevention:**

**Monitor index bloat:**
```sql
-- Check index sizes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public' AND indexname LIKE '%search_vector%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Reindex if bloat > 2x data size:**
```sql
-- Rebuild GIN index without locking table
REINDEX INDEX CONCURRENTLY jobs_search_vector_idx;
REINDEX INDEX CONCURRENTLY candidates_search_vector_idx;
-- etc for all search_vector indexes
```

**Tune autovacuum for high-write tables:**
```sql
-- Make autovacuum more aggressive on applications table
ALTER TABLE applications SET (
    autovacuum_vacuum_scale_factor = 0.05,  -- Vacuum at 5% dead rows (default 20%)
    autovacuum_analyze_scale_factor = 0.02  -- Analyze at 2% changed rows
);
```

**Alternative: Async search vector updates for high-write tables**
```sql
-- Remove BEFORE trigger, add AFTER trigger that sets flag
ALTER TABLE applications DROP TRIGGER update_applications_search_vector_trigger;

ALTER TABLE applications ADD COLUMN search_vector_dirty BOOLEAN DEFAULT FALSE;

CREATE TRIGGER mark_search_vector_dirty
AFTER INSERT OR UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION mark_search_dirty();

-- Background job rebuilds dirty search vectors every 5 minutes
-- (Run via cron or background worker)
UPDATE applications
SET search_vector = build_applications_search_vector(...),
    search_vector_dirty = FALSE
WHERE search_vector_dirty = TRUE;
```

**Recommendation:** Start with synchronous triggers. Monitor bloat. Switch to async if write volume > 10K/day per table.

**Detection:** `pg_stat_user_indexes` shows index size > 2x table size. Insert performance degrades over time.

**Phase impact:** Phase 4 (Monitoring) — Set up index bloat monitoring after deploying global search.

---

### Pitfall 11: Inconsistent Entity Type Values Across Result Sources

**What goes wrong:** Different parts of the system use different entity type strings:
- Database function returns: `'job'`, `'candidate'`, `'company'`
- TypeScript types define: `'jobs'`, `'candidates'`, `'companies'` (plural)
- Frontend expects: `'role'`, `'person'`, `'organization'` (display names)
- URLs use: `/portal/roles/`, `/portal/candidates/`, `/portal/companies/`

Result: Frontend receives entity_type='job', tries to navigate to `/portal/job/123`, gets 404.

**Why it happens:** No single source of truth for entity type naming. Each layer uses its own convention.

**Consequences:**
- Navigation breaks (wrong URLs)
- Type errors in TypeScript (expecting 'jobs', receives 'job')
- Display logic fails (switch/case doesn't match entity type)

**Prevention:**

**Define entity type enum in shared-types:**
```typescript
// packages/shared-types/src/search/types.ts
export enum EntityType {
    CANDIDATE = 'candidate',
    JOB = 'job',
    COMPANY = 'company',
    RECRUITER = 'recruiter',
    APPLICATION = 'application',
    PLACEMENT = 'placement',
}

export const ENTITY_TYPE_ROUTES: Record<EntityType, string> = {
    [EntityType.CANDIDATE]: '/portal/candidates',
    [EntityType.JOB]: '/portal/roles',
    [EntityType.COMPANY]: '/portal/companies',
    [EntityType.RECRUITER]: '/portal/recruiters',
    [EntityType.APPLICATION]: '/portal/applications',
    [EntityType.PLACEMENT]: '/portal/placements',
};

export const ENTITY_TYPE_DISPLAY: Record<EntityType, string> = {
    [EntityType.CANDIDATE]: 'Candidate',
    [EntityType.JOB]: 'Job',
    [EntityType.COMPANY]: 'Company',
    [EntityType.RECRUITER]: 'Recruiter',
    [EntityType.APPLICATION]: 'Application',
    [EntityType.PLACEMENT]: 'Placement',
};
```

**Use in database function:**
```sql
-- Return entity_type matching TypeScript enum EXACTLY
SELECT ..., 'candidate' AS entity_type FROM candidates
UNION ALL
SELECT ..., 'job' AS entity_type FROM jobs
```

**Use in frontend:**
```typescript
import { EntityType, ENTITY_TYPE_ROUTES } from '@splits-network/shared-types/search';

// Navigate to detail page
const url = `${ENTITY_TYPE_ROUTES[result.entity_type]}/${result.id}`;
router.push(url);
```

**Detection:** TypeScript compilation errors or runtime navigation 404s when clicking search results.

**Phase impact:** Phase 2 (API Endpoint) — Define entity types before building API response format.

---

### Pitfall 12: Pagination Token/Offset Mismatch with Dynamic Results

**What goes wrong:** Global search results change between page requests (new jobs posted, candidates updated). User on page 2 sees duplicates from page 1 or missing results.

Example:
1. User searches "engineer", gets 100 results, views page 1 (results 1-20)
2. New job "Senior Engineer" posted while user is viewing page 1
3. User clicks page 2 → OFFSET 20 → now gets results 21-40, but result #20 was bumped to #21, so user sees it again

**Why it happens:** OFFSET-based pagination assumes stable result set. Search results are not stable.

**Consequences:**
- User sees duplicate results across pages
- Or missing results (gaps in pagination)
- Frustrating UX: "I already saw this result"

**Prevention:**

**Option A: Accept the limitation (simplest)**
- Document that search results may shift
- Most users don't paginate deeply in search (90% stay on page 1)
- Trade-off: simplicity vs perfect consistency

**Option B: Cursor-based pagination with result snapshot**
```sql
-- Add created_at + id as cursor
SELECT * FROM global_search_results
WHERE (created_at, id) < (p_cursor_created_at, p_cursor_id)  -- Before cursor
ORDER BY relevance DESC, created_at DESC, id
LIMIT 20;
```

**Option C: Cache result IDs for pagination session**
```typescript
// API stores result IDs in Redis for 5 minutes
const cacheKey = `search:${userId}:${queryHash}`;
const resultIds = await redis.get(cacheKey);

if (!resultIds) {
    // First page: execute query, cache result IDs
    const allResults = await supabase.rpc('global_search', { p_limit: 1000 });
    await redis.setex(cacheKey, 300, JSON.stringify(allResults.map(r => r.id)));
    return allResults.slice(0, 20);
} else {
    // Subsequent pages: use cached IDs
    const ids = JSON.parse(resultIds);
    const pageIds = ids.slice((page - 1) * 20, page * 20);
    return await supabase.from(...).in('id', pageIds);
}
```

**Recommendation:** Use Option A for MVP (global search), Option C if deep pagination becomes a complaint.

**Detection:** User reports seeing same result on pages 1 and 2. QA testing with concurrent data changes reveals duplicate results.

**Phase impact:** Phase 5 (Full Search Page) — Decide pagination strategy when building full results page. Not critical for typeahead (no pagination).

---

## MINOR PITFALLS

Mistakes that cause annoyance or UX friction but are fixable.

### Pitfall 13: Empty State Shows "No results" Before Debounce Completes

**What goes wrong:** User types "eng" → sees "No results found" for 300ms → debounce completes → results appear. Flicker creates perception of broken search.

**Why it happens:** Developer clears results immediately when query changes, before debounced search completes.

**Consequences:**
- Flickering UI (empty → loading → results)
- User thinks search is broken
- Unnecessary re-renders

**Prevention:**

**Show loading state during debounce:**
```typescript
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);
const debouncedQuery = useDebounce(query, 300);

useEffect(() => {
    if (query.length >= 2) {
        setIsSearching(true);  // Show loading immediately
    } else {
        setIsSearching(false);
        setResults([]);
    }
}, [query]);

useEffect(() => {
    if (debouncedQuery.length >= 2) {
        performSearch(debouncedQuery).finally(() => setIsSearching(false));
    }
}, [debouncedQuery]);

// Render:
{isSearching && <LoadingSpinner />}
{!isSearching && results.length === 0 && query.length >= 2 && (
    <div>No results found</div>
)}
```

**Detection:** User testing reveals flickering "No results" message during typing.

**Phase impact:** Phase 3 (Frontend Typeahead) — Implement correct loading states from the start.

---

### Pitfall 14: Typeahead Dropdown Loses Keyboard Focus

**What goes wrong:** User types query → dropdown appears → user presses arrow keys → nothing happens (focus is still in input, not on dropdown items).

**Why it happens:** Developers forget to implement keyboard navigation for dropdown results.

**Consequences:**
- Poor accessibility (keyboard-only users can't navigate)
- Frustrating UX (must use mouse to select results)
- Fails WCAG accessibility standards

**Prevention:**

**Implement arrow key navigation:**
```typescript
const [selectedIndex, setSelectedIndex] = useState(-1);

const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        navigateToResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
        setResults([]);
        setSelectedIndex(-1);
    }
};

// Render with highlighted selection
{results.map((result, index) => (
    <div
        key={result.id}
        className={index === selectedIndex ? 'bg-base-200' : ''}
        onMouseEnter={() => setSelectedIndex(index)}
    >
        {result.title}
    </div>
))}
```

**Detection:** QA testing with keyboard-only navigation reveals inability to select dropdown results.

**Phase impact:** Phase 3 (Frontend Typeahead) — Implement keyboard navigation before deploying typeahead.

---

### Pitfall 15: Search Results Don't Highlight Matching Terms

**What goes wrong:** User searches "software engineer" → results show job titles but matching terms not highlighted → hard to see why result matched.

**Why it happens:** Developers return plain text, don't compute or return match positions.

**Consequences:**
- User can't see relevance (why did this match?)
- Results look like random list, not search results
- Reduced trust in search quality

**Prevention:**

**Option A: Use ts_headline for highlighted snippets**
```sql
-- In global search function, add headline field
SELECT
    id,
    title AS result_title,
    ts_headline('english', title, websearch_to_tsquery('english', p_query),
        'MaxWords=20, MinWords=10, MaxFragments=1') AS highlighted_title,
    ...
FROM jobs
WHERE search_vector @@ websearch_to_tsquery('english', p_query);
```

**Option B: Client-side highlighting (simpler)**
```typescript
// In frontend, highlight matching terms
function highlightMatches(text: string, query: string): React.ReactNode {
    const terms = query.split(/\s+/).filter(t => t.length >= 2);
    let highlighted = text;

    terms.forEach(term => {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

// Render result
<div className="result-title">
    {highlightMatches(result.title, query)}
</div>
```

**Recommendation:** Use Option B for MVP (simpler), Option A if performance becomes issue (highlighting 100 results client-side is slow).

**Detection:** User feedback: "How do I know why this result matched?" Design review notes lack of visual indication of relevance.

**Phase impact:** Phase 3 (Frontend Typeahead) — Add highlighting before shipping typeahead to users.

---

## PHASE MAPPING

Mapping pitfalls to roadmap phases to prevent at the right time.

| Phase | Pitfall | Prevention Action |
|-------|---------|-------------------|
| **Phase 0: Pre-requisites** | #4 Missing recruiters search_vector | Complete recruiters FTS migration BEFORE starting global search |
| | #5 Salary fields not searchable | Update jobs search_vector to include salary |
| **Phase 1: Database Function** | #1 UNION ALL schema mismatch | Design normalized result schema (id, result_title, result_subtitle, entity_type, relevance) |
| | #2 ts_rank not comparable | Choose ranking strategy: entity type grouping OR boost factors OR normalization |
| | #3 Access control after query | Design function signature with role parameters (user_role, organization_ids, recruiter_id) |
| | #9 UNION ALL without LIMIT | Apply per-entity LIMIT before UNION ALL |
| **Phase 2: API Endpoint** | #6 Query injection | Sanitize user input, use parameterized queries |
| | #11 Inconsistent entity types | Define EntityType enum in shared-types, use everywhere |
| **Phase 3: Frontend Typeahead** | #7 No debouncing | Use useDebounce hook (300ms per project standard) |
| | #8 No min query length | Validate query length >= 2 before searching |
| | #13 Empty state flicker | Show loading state during debounce |
| | #14 Keyboard navigation | Implement arrow keys + Enter + Escape |
| | #15 No match highlighting | Highlight matching terms in results |
| **Phase 4: Monitoring** | #10 GIN index bloat | Monitor index sizes, schedule REINDEX CONCURRENTLY if > 2x data size |
| **Phase 5: Full Search Page** | #12 Pagination consistency | Choose pagination strategy (offset-based acceptable for MVP, cursor if issues arise) |

---

## RESEARCH CONFIDENCE ASSESSMENT

| Pitfall Category | Confidence | Source |
|------------------|------------|--------|
| Postgres FTS UNION ALL queries | HIGH | Direct project codebase examination + training data on Postgres FTS |
| ts_rank scoring across entities | HIGH | Training data on Postgres ts_rank behavior + project's existing FTS patterns |
| Access control integration | HIGH | Project's resolveAccessContext() pattern + repository implementations |
| Performance (GIN indexes, LIMIT) | HIGH | Project's existing index patterns + training data on Postgres performance |
| UX patterns (debouncing, keyboard nav) | MEDIUM | Project's existing useDebounce hook + standard React patterns |
| Specific performance thresholds | MEDIUM | Training data on typical Postgres FTS latency (no project-specific benchmarks available) |

**Overall confidence:** HIGH — Pitfalls grounded in project's actual codebase patterns and Postgres FTS domain knowledge.

---

## WHAT TO VALIDATE

While confidence is high, validate these before finalizing roadmap:

1. **Recruiters search_vector status** — Confirm migration is pending (baseline.sql has function, but is trigger/index created?)
2. **Jobs salary searchability** — Verify jobs.search_vector does NOT include salary fields currently
3. **Performance baseline** — Run EXPLAIN ANALYZE on per-entity search queries to establish current latency
4. **Target latency for typeahead** — Confirm <200ms requirement with product/UX team
5. **Entity type route mapping** — Verify `/portal/roles/` vs `/portal/jobs/` URL convention

---

## SOURCES

- **Project codebase:** `.planning/PROJECT.md`, `docs/search/scalable-search-architecture.md`
- **Database schema:** `supabase/migrations/20240101000000_baseline.sql`
- **Search implementations:** `services/ats-service/src/v2/jobs/repository.ts`, `services/network-service/src/v2/recruiters/repository.ts`
- **Search migrations:** `supabase/migrations/20260210000002_fix_applications_search_vector.sql`
- **Training data:** Postgres full-text search behavior, ts_rank normalization, GIN index characteristics, UNION ALL query planning

**Note:** WebSearch was unavailable, so pitfalls are based on training data (January 2025 knowledge cutoff) combined with project-specific codebase examination. All Postgres FTS patterns and pitfalls are well-established and unlikely to have changed significantly.
