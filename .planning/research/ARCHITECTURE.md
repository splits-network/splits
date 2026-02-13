# Architecture Patterns: Global Cross-Entity Search

**Domain:** Global search across recruiting marketplace entities
**Researched:** 2026-02-12
**Confidence:** HIGH

## Executive Summary

Global cross-entity search for a recruiting marketplace must query 6-7 entity tables (candidates, jobs, companies, recruiters, applications, placements), apply role-based access filtering, rank results by relevance, and serve both typeahead (fast, top results) and full search (paginated) use cases. The architecture must integrate with existing Supabase Postgres full-text search infrastructure (tsvector columns with GIN indexes already exist) and the Fastify API Gateway + V2 service pattern.

**Key architectural decision:** Extend existing ATS service rather than creating a new search service. Search is inherently an ATS concern (finding entities within the applicant tracking system), and consolidating here avoids cross-service coordination overhead.

## Recommended Architecture

### High-Level Data Flow

```
User keystroke (frontend)
  ↓
Debounced API call (250ms for typeahead, immediate for full search)
  ↓
API Gateway: GET /v2/search
  ↓
ATS Service: SearchService
  ↓
SearchRepository.globalSearch(clerkUserId, query, options)
  ↓
resolveAccessContext(clerkUserId) → role filtering rules
  ↓
Parallel Postgres queries (6-7 entities) with ts_rank ordering
  ↓
In-memory merge + re-rank (or UNION ALL query)
  ↓
Return top N results with entity_type discriminator
  ↓
API Gateway wraps in { data: [...] } envelope
  ↓
Frontend renders grouped/unified results
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Frontend SearchInput** | Debouncing, UI state, typeahead dropdown | API Gateway via ApiClient |
| **API Gateway /v2/search** | Auth extraction (Clerk JWT → clerkUserId), rate limiting, proxy to ATS | ATS Service SearchService |
| **ATS SearchService** | Query coordination, access control resolution, result merging | SearchRepository, AccessContextResolver |
| **SearchRepository** | Execute Postgres queries, apply ts_rank, role-based WHERE clauses | Supabase (direct DB queries) |
| **AccessContextResolver** | Resolve user's role, company IDs, recruiter ID | Supabase (memberships, user_roles tables) |
| **Redis Cache** | Cache access context (1 min TTL), cache search results (30s TTL for typeahead) | ATS SearchService |

### Integration Points with Existing Architecture

#### 1. Database Layer (Existing Infrastructure)

**Already exists:**
- `search_vector tsvector` columns on 7 tables (candidates, jobs, companies, recruiters, applications, placements, recruiter_candidates)
- GIN indexes on all search_vector columns (e.g., `CREATE INDEX jobs_search_vector_idx ON jobs USING gin(search_vector)`)
- Postgres functions to build search vectors (e.g., `build_jobs_search_vector()`)
- Triggers to auto-update search_vector on INSERT/UPDATE

**No database changes needed.** Use existing full-text search infrastructure.

#### 2. API Gateway Layer (Modified)

**New route:**
```typescript
// services/api-gateway/src/routes/v2/ats.ts (modify existing file)

app.get('/v2/search', {
    preHandler: requireAuth, // Extract clerkUserId from JWT
    schema: {
        querystring: {
            type: 'object',
            properties: {
                q: { type: 'string', minLength: 1 }, // Query string
                mode: { type: 'string', enum: ['typeahead', 'full'], default: 'typeahead' },
                entity_types: { type: 'string' }, // Comma-separated: "jobs,candidates"
                limit: { type: 'number', default: 5 },
            },
            required: ['q'],
        },
    },
}, async (request, reply) => {
    const clerkUserId = request.headers['x-clerk-user-id'];
    const { q, mode, entity_types, limit } = request.query;

    const response = await services.ats.get(`/v2/search?q=${encodeURIComponent(q)}&mode=${mode}&entity_types=${entity_types || ''}&limit=${limit}`, {
        headers: buildAuthHeaders(clerkUserId, getCorrelationId(request)),
    });

    reply.send(response.data); // Already wrapped in { data: [...] }
});
```

**Integration:** Add to existing `registerAtsRoutes()` function (line ~76 in ats.ts).

#### 3. ATS Service Layer (New Component)

**New files:**
```
services/ats-service/src/v2/search/
├── types.ts          # SearchOptions, SearchResult, EntityType enum
├── repository.ts     # SearchRepository class
├── service.ts        # SearchService class (validation, caching)
└── routes.ts         # Fastify route registration
```

**New route in ATS service:**
```typescript
// services/ats-service/src/v2/search/routes.ts

import { FastifyInstance } from 'fastify';
import { SearchService } from './service';

export function registerSearchRoutes(app: FastifyInstance, searchService: SearchService) {
    app.get('/v2/search', {
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    q: { type: 'string', minLength: 1 },
                    mode: { type: 'string', enum: ['typeahead', 'full'], default: 'typeahead' },
                    entity_types: { type: 'string' },
                    limit: { type: 'number', default: 5, maximum: 100 },
                    page: { type: 'number', default: 1 },
                },
                required: ['q'],
            },
        },
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { q, mode, entity_types, limit, page } = request.query as any;

        const results = await searchService.search(clerkUserId, {
            query: q,
            mode,
            entityTypes: entity_types ? entity_types.split(',') : undefined,
            limit,
            page,
        });

        reply.send({ data: results });
    });
}
```

**Integration:** Register in `services/ats-service/src/v2/routes.ts` (add to existing V2 route registration).

#### 4. Access Control Integration

**Existing pattern (from shared-access-context):**
```typescript
const context = await resolveAccessContext(clerkUserId, this.supabase);
// Returns: { roles, companyIds, organizationIds, recruiterId, candidateId, isPlatformAdmin }
```

**Role-based filtering rules:**

| Role | Candidates | Jobs | Companies | Recruiters | Applications | Placements |
|------|-----------|------|-----------|-----------|--------------|------------|
| **platform_admin** | All | All | All | All | All | All |
| **company_admin** | All active | Own company + active marketplace | Own company | All active | Own company | Own company |
| **hiring_manager** | All active | Own company + active marketplace | Own company | All active | Own company jobs | Own company jobs |
| **recruiter** | Own candidates | Active marketplace jobs | All active | All active | Own applications | Own placements |
| **candidate** | None | Active marketplace jobs | None (via jobs) | None (via applications) | Own applications | None |

**Implementation in SearchRepository:**
```typescript
async globalSearch(clerkUserId: string, options: SearchOptions): Promise<SearchResult[]> {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    const tsQuery = this.buildTsQuery(options.query);

    const queries: Promise<SearchResult[]>[] = [];
    const entityTypes = options.entityTypes || ['jobs', 'candidates', 'companies', 'recruiters', 'applications', 'placements'];

    // Build parallel queries with role-based WHERE clauses
    if (entityTypes.includes('jobs')) {
        queries.push(this.searchJobs(tsQuery, context, options));
    }
    if (entityTypes.includes('candidates') && !context.roles.includes('candidate')) {
        queries.push(this.searchCandidates(tsQuery, context, options));
    }
    // ... repeat for other entity types

    const results = await Promise.all(queries);
    return this.mergeAndRank(results.flat(), options.limit);
}
```

#### 5. Caching Strategy

**Two-tier cache:**

1. **Access Context Cache (Redis, 1 min TTL)**
   - Key: `access_context:{clerkUserId}`
   - Value: Serialized AccessContext object
   - Why: Avoid resolving memberships/roles on every search keystroke
   - Invalidation: On role changes (RabbitMQ event from identity-service)

2. **Search Results Cache (Redis, 30s TTL, typeahead only)**
   - Key: `search:{clerkUserId}:{query}:{entityTypes}:{limit}`
   - Value: Serialized SearchResult[]
   - Why: Identical typeahead queries within 30s (e.g., user backspaces)
   - Skip for full search mode (pagination makes caching less effective)

**Cache-aside pattern:**
```typescript
async search(clerkUserId: string, options: SearchOptions): Promise<SearchResult[]> {
    if (options.mode === 'typeahead') {
        const cacheKey = `search:${clerkUserId}:${options.query}:${options.entityTypes?.join(',') || 'all'}:${options.limit}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    }

    const results = await this.repository.globalSearch(clerkUserId, options);

    if (options.mode === 'typeahead') {
        await this.redis.setex(cacheKey, 30, JSON.stringify(results));
    }

    return results;
}
```

#### 6. Frontend Component Hierarchy

**New components:**
```
apps/portal/src/components/global-search/
├── search-input.tsx           # Input with debounce, dropdown trigger
├── search-dropdown.tsx        # Typeahead results dropdown
├── search-result-item.tsx     # Single result with entity icon/type
├── search-page.tsx            # Full search results page
└── hooks/
    └── use-global-search.ts   # API hook with debouncing
```

**Integration point:**
```typescript
// apps/portal/src/components/portal-header.tsx (line ~86, between PlanBadge and theme toggle)

<div className="flex-none flex items-center gap-1">
    <GlobalSearchInput /> {/* NEW */}
    <PlanBadge />
    {/* Theme toggle... */}
</div>
```

**Frontend data flow:**
```typescript
// use-global-search.ts
export function useGlobalSearch(mode: 'typeahead' | 'full') {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, mode === 'typeahead' ? 250 : 0);

    useEffect(() => {
        if (!debouncedQuery) return;

        setLoading(true);
        apiClient.search({ q: debouncedQuery, mode, limit: mode === 'typeahead' ? 5 : 25 })
            .then(setResults)
            .finally(() => setLoading(false));
    }, [debouncedQuery, mode]);

    return { query, setQuery, results, loading };
}
```

## Patterns to Follow

### Pattern 1: Parallel Query Execution with Result Merging

**What:** Execute separate `SELECT ... FROM <entity> WHERE search_vector @@ to_tsquery(...)` queries in parallel, then merge results in application code.

**When:** When entity tables have different access control rules and you need to apply ts_rank consistently.

**Why:** Avoids complex UNION queries with role-based WHERE clauses. Easier to test, easier to add/remove entity types.

**Example:**
```typescript
async globalSearch(clerkUserId: string, options: SearchOptions): Promise<SearchResult[]> {
    const context = await resolveAccessContext(this.supabase, clerkUserId);
    const tsQuery = this.buildTsQuery(options.query);

    // Execute queries in parallel
    const [jobResults, candidateResults, companyResults] = await Promise.all([
        this.searchJobs(tsQuery, context, options),
        this.searchCandidates(tsQuery, context, options),
        this.searchCompanies(tsQuery, context, options),
    ]);

    // Merge and re-rank
    const allResults = [...jobResults, ...candidateResults, ...companyResults];
    return this.sortByRelevance(allResults).slice(0, options.limit);
}

private sortByRelevance(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
        // ts_rank descending (higher = more relevant)
        if (b.rank !== a.rank) return b.rank - a.rank;
        // Tie-breaker: updated_at descending
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
}
```

### Pattern 2: Access Context Caching with Event-Driven Invalidation

**What:** Cache resolved access context in Redis with 1-minute TTL, invalidate on role/membership changes via RabbitMQ events.

**When:** High-frequency API calls (search typeahead) that need access control but can tolerate 1-minute stale data.

**Why:** Reduces database load for memberships/user_roles queries. 1-minute staleness is acceptable for search (worst case: user granted admin role, sees updated search results in <60s).

**Example:**
```typescript
// ATS SearchService
private async getAccessContext(clerkUserId: string): Promise<AccessContext> {
    const cacheKey = `access_context:${clerkUserId}`;
    const cached = await this.redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    const context = await resolveAccessContext(this.supabase, clerkUserId);
    await this.redis.setex(cacheKey, 60, JSON.stringify(context));

    return context;
}

// Identity Service: on membership/role change
await this.eventPublisher.publish('identity.membership.updated', {
    userId: identityUserId,
    clerkUserId,
});

// ATS Service: consume event
this.eventConsumer.on('identity.membership.updated', async (event) => {
    const cacheKey = `access_context:${event.clerkUserId}`;
    await this.redis.del(cacheKey); // Force re-resolve on next search
});
```

### Pattern 3: Discriminated Union for Multi-Entity Results

**What:** Return array of results with `entity_type` discriminator field, each result having entity-specific fields.

**When:** API returns heterogeneous entities (jobs, candidates, companies) in single response.

**Why:** Type-safe on frontend, easy to render entity-specific icons/metadata.

**Example:**
```typescript
// Backend types.ts
export type SearchResult =
    | { entity_type: 'job'; id: string; title: string; company_name: string; rank: number; updated_at: string; }
    | { entity_type: 'candidate'; id: string; full_name: string; email: string; current_title: string; rank: number; updated_at: string; }
    | { entity_type: 'company'; id: string; name: string; industry: string; rank: number; updated_at: string; }
    | { entity_type: 'recruiter'; id: string; name: string; email: string; rank: number; updated_at: string; }
    | { entity_type: 'application'; id: string; candidate_name: string; job_title: string; stage: string; rank: number; updated_at: string; }
    | { entity_type: 'placement'; id: string; candidate_name: string; job_title: string; state: string; rank: number; updated_at: string; };

// Frontend rendering
{results.map(result => (
    <SearchResultItem key={`${result.entity_type}-${result.id}`} result={result}>
        {result.entity_type === 'job' && <JobIcon />}
        {result.entity_type === 'candidate' && <CandidateIcon />}
        {/* ... */}
    </SearchResultItem>
))}
```

### Pattern 4: Query Normalization for ts_query

**What:** Convert user input "senior software engineer" to Postgres tsquery `'senior' & 'software' & 'engineer'` (AND) or `'senior' | 'software' | 'engineer'` (OR).

**When:** Building full-text search queries from user input.

**Why:** `to_tsquery()` requires specific syntax. AND gives precise results (all terms must match), OR gives broader results (any term matches).

**Example:**
```typescript
private buildTsQuery(userInput: string, operator: 'AND' | 'OR' = 'AND'): string {
    // Normalize: lowercase, remove punctuation, split on whitespace
    const terms = userInput
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 0);

    if (terms.length === 0) return '';

    // Join with Postgres operator
    const joinOp = operator === 'AND' ? ' & ' : ' | ';
    return terms.join(joinOp);
}

// Usage
const tsQuery = this.buildTsQuery('senior software engineer'); // → 'senior & software & engineer'
const query = this.supabase
    .from('candidates')
    .select('*, ts_rank(search_vector, to_tsquery($1)) as rank')
    .filter('search_vector', '@@', `to_tsquery('${tsQuery}')`)
    .order('rank', { ascending: false });
```

### Pattern 5: Weighted ts_rank Boost

**What:** Apply weight multipliers to ts_rank based on entity type or field weights.

**When:** Some entity types should rank higher (e.g., exact name matches > description matches).

**Why:** Improve result relevance without complex scoring algorithms.

**Example:**
```typescript
// Database functions already use setweight() in search_vector construction
// E.g., build_candidates_search_vector sets:
//   - full_name → weight 'A' (highest)
//   - email, current_title → weight 'B'
//   - location, phone → weight 'C'
//   - URLs → weight 'D' (lowest)

// Repository can further boost by entity type
private sortByRelevance(results: SearchResult[]): SearchResult[] {
    return results.sort((a, b) => {
        // Apply entity type boost
        const boostA = this.getEntityBoost(a.entity_type);
        const boostB = this.getEntityBoost(b.entity_type);

        const scoreA = a.rank * boostA;
        const scoreB = b.rank * boostB;

        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
}

private getEntityBoost(entityType: string): number {
    // Jobs and candidates are primary entities, boost them
    if (entityType === 'job' || entityType === 'candidate') return 1.2;
    // Applications and placements are secondary, standard ranking
    if (entityType === 'application' || entityType === 'placement') return 1.0;
    // Companies and recruiters are tertiary, slight de-boost
    return 0.9;
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Filtering After Broad Fetch

**What:** Fetch all entities from database, filter by role in application code.

**Why bad:**
- Database returns all rows (O(n) DB I/O)
- Network transfers all rows
- Application does work that Postgres can do faster

**Instead:** Apply role-based WHERE clauses in SQL queries. Postgres filters before returning results.

```typescript
// ❌ BAD
const allJobs = await this.supabase.from('jobs').select('*');
const filteredJobs = allJobs.filter(job =>
    context.isPlatformAdmin || context.companyIds.includes(job.company_id)
);

// ✅ GOOD
let query = this.supabase.from('jobs').select('*');
if (!context.isPlatformAdmin) {
    query = query.in('company_id', context.companyIds);
}
const jobs = await query;
```

### Anti-Pattern 2: Sequential Entity Queries

**What:** Query each entity type sequentially: jobs → candidates → companies → ...

**Why bad:**
- Total latency = sum of all query latencies (7 entities × 50ms = 350ms)
- User waits for slowest query before seeing any results

**Instead:** Use `Promise.all()` for parallel execution. Total latency = max query latency (~50ms).

```typescript
// ❌ BAD
const jobs = await this.searchJobs(tsQuery, context);
const candidates = await this.searchCandidates(tsQuery, context);
const companies = await this.searchCompanies(tsQuery, context);

// ✅ GOOD
const [jobs, candidates, companies] = await Promise.all([
    this.searchJobs(tsQuery, context),
    this.searchCandidates(tsQuery, context),
    this.searchCompanies(tsQuery, context),
]);
```

### Anti-Pattern 3: LIKE '%term%' Instead of Full-Text Search

**What:** Use SQL `WHERE name LIKE '%john%'` instead of `WHERE search_vector @@ to_tsquery('john')`.

**Why bad:**
- LIKE can't use GIN index, requires full table scan (O(n))
- Case-sensitive unless using ILIKE (still O(n))
- No relevance ranking
- No stemming (searching "running" won't match "run")

**Instead:** Use existing tsvector columns with @@ operator. Already indexed with GIN.

```typescript
// ❌ BAD
const query = this.supabase
    .from('candidates')
    .select('*')
    .ilike('full_name', `%${searchTerm}%`); // Full table scan

// ✅ GOOD
const tsQuery = this.buildTsQuery(searchTerm);
const query = this.supabase
    .from('candidates')
    .select('*, ts_rank(search_vector, to_tsquery($1)) as rank', { tsQuery })
    .filter('search_vector', '@@', `to_tsquery('${tsQuery}')`)
    .order('rank', { ascending: false }); // Uses GIN index
```

### Anti-Pattern 4: Creating a New "Search Service"

**What:** Create `services/search-service/` as a standalone microservice.

**Why bad:**
- Violates "No HTTP calls between services" rule
- Search service would need to call ATS/Network/Identity services to get data
- OR duplicate database access logic (violates DRY)
- Adds latency (API Gateway → Search → ATS/Network)

**Instead:** Extend existing ATS service with search domain. ATS service already has candidates, jobs, companies, applications, placements repositories.

```
✅ GOOD:
services/ats-service/src/v2/search/
├── repository.ts  (reuses existing Supabase client)
├── service.ts
└── routes.ts
```

### Anti-Pattern 5: No Debouncing on Frontend

**What:** Call search API on every keystroke without debouncing.

**Why bad:**
- Typing "software engineer" (17 chars) = 17 API requests
- Database executes 17 full-text searches
- Redis cache thrashing (different queries: "s", "so", "sof", ...)
- Poor UX (results flash on every keystroke)

**Instead:** Debounce typeahead searches by 250-300ms. User pauses → API call fires.

```typescript
// ❌ BAD
<input onChange={(e) => search(e.target.value)} />

// ✅ GOOD
const debouncedQuery = useDebounce(query, 250);
useEffect(() => {
    if (debouncedQuery) search(debouncedQuery);
}, [debouncedQuery]);
```

## Database Approach: Parallel Queries vs UNION vs Materialized View

### Option 1: Parallel Queries with In-Memory Merge (RECOMMENDED)

**How:** Execute 6-7 separate `SELECT` queries in parallel, merge results in application code.

**Pros:**
- Leverages existing GIN indexes on each table's search_vector
- Easy to apply different role-based WHERE clauses per entity
- Easy to add/remove entity types
- Type-safe results (discriminated union)
- No database schema changes

**Cons:**
- Application does merge/sort work (negligible for <100 results)

**Implementation:**
```typescript
const [jobResults, candidateResults, companyResults, recruiterResults, applicationResults, placementResults] =
    await Promise.all([
        this.searchJobs(tsQuery, context, limit),
        this.searchCandidates(tsQuery, context, limit),
        this.searchCompanies(tsQuery, context, limit),
        this.searchRecruiters(tsQuery, context, limit),
        this.searchApplications(tsQuery, context, limit),
        this.searchPlacements(tsQuery, context, limit),
    ]);

return this.mergeAndRank([...jobResults, ...candidateResults, ...companyResults, ...recruiterResults, ...applicationResults, ...placementResults], limit);
```

### Option 2: UNION ALL Query

**How:** Single query with UNION ALL across entity tables.

**Pros:**
- Single database round-trip
- Postgres does sorting (ORDER BY rank DESC LIMIT N)

**Cons:**
- Complex role-based WHERE clauses (different per entity)
- Hard to maintain (adding entity type requires modifying UNION)
- Type coercion required (all SELECTs must have same column types)
- Less flexible for entity-specific filtering

**Not recommended** for this use case. Role-based filtering is too entity-specific.

### Option 3: Materialized View

**How:** Create materialized view that UNIONs all entities, refresh on schedule or trigger.

**Pros:**
- Pre-computed results, fast reads

**Cons:**
- Stale data (refresh lag)
- Complex role-based access control (can't filter by runtime user context)
- Additional storage (duplicates data)
- Refresh overhead (locks table during refresh)

**Not recommended** for real-time search with dynamic access control.

### Verdict: Parallel Queries (Option 1)

Use parallel queries with in-memory merge. Fits existing V2 architecture patterns, leverages existing infrastructure, easy to test and extend.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Search QPS** | ~10 qps (typeahead + full) | ~500 qps | ~50K qps |
| **Database approach** | Parallel queries, no caching | Same + Redis cache (access context, typeahead results) | Same + read replicas for search queries |
| **API Gateway** | Single instance, in-memory rate limiting | Horizontal scaling (2-3 pods), Redis-backed rate limiting | 10+ pods, Redis rate limiting, CDN for static assets |
| **ATS Service** | Single instance | Horizontal scaling (2-3 pods), stateless | 10+ pods, connection pooling (PgBouncer) |
| **Redis** | Single instance | Single instance (sufficient for caching) | Redis Cluster (3 nodes), cache eviction policy |
| **Postgres** | Single instance (Supabase) | Same (GIN indexes handle load) | Read replicas for search, primary for writes |
| **GIN index performance** | <10ms per entity query | <50ms per entity query | <100ms per entity query, consider pg_trgm for fuzzy search |

**Optimization trigger points:**
- **At 1K qps:** Enable Redis caching for access context and typeahead
- **At 10K qps:** Add Postgres read replicas, route search queries to replicas
- **At 50K qps:** Consider Elasticsearch/Typesense for search offloading (requires data sync)

**Current target (100-1K users):** No optimization needed. Parallel queries + GIN indexes sufficient.

## Build Order Recommendation

Based on dependencies and existing architecture:

### Phase 1: Backend Foundation (Search API)
1. **SearchRepository** - Implement parallel queries with access control
   - Dependency: shared-access-context (exists)
   - Output: `globalSearch(clerkUserId, options)` method
2. **SearchService** - Add validation, caching (optional for MVP)
   - Dependency: SearchRepository
   - Output: `search(clerkUserId, options)` with Redis cache
3. **ATS Service Routes** - Register `/v2/search` endpoint
   - Dependency: SearchService
   - Output: Testable API endpoint in ATS service
4. **API Gateway Route** - Proxy `/v2/search` to ATS service
   - Dependency: ATS service route
   - Output: Public API endpoint for frontend

**Testing:** Use Postman/curl to verify search with different clerkUserIds, verify role-based filtering.

### Phase 2: Frontend Integration (UI)
1. **ApiClient.search()** - Add search method to shared-api-client
   - Dependency: API Gateway route
   - Output: Type-safe frontend API client method
2. **useGlobalSearch hook** - Debouncing, state management
   - Dependency: ApiClient.search()
   - Output: Reusable React hook
3. **SearchInput component** - Input field with typeahead dropdown
   - Dependency: useGlobalSearch hook
   - Output: Standalone component (can test in isolation)
4. **Integrate into PortalHeader** - Add SearchInput to header
   - Dependency: SearchInput component
   - Output: Global search visible in portal

**Testing:** Verify debouncing, dropdown rendering, navigation to detail pages.

### Phase 3: Full Search Page (Optional for MVP)
1. **SearchPage component** - Full search results with pagination
   - Dependency: useGlobalSearch hook (mode='full')
   - Output: `/portal/search?q=...` route
2. **Grouped results display** - Group by entity type (Jobs, Candidates, etc.)
   - Dependency: SearchPage
   - Output: Enhanced UX for full search

**Defer to post-MVP if timeline is tight.** Typeahead in header is sufficient for MVP.

## Sources

**HIGH confidence (project codebase):**
- `supabase/migrations/20240101000000_baseline.sql` - Existing tsvector columns, GIN indexes, search functions
- `packages/shared-access-context/src/index.ts` - resolveAccessContext() implementation, role structure
- `services/ats-service/src/v2/*/repository.ts` - V2 repository pattern, access control integration
- `services/api-gateway/src/routes/v2/ats.ts` - API Gateway proxy pattern
- `CLAUDE.md` - V2 architecture rules, no HTTP between services, single Supabase database

**MEDIUM confidence (PostgreSQL best practices):**
- PostgreSQL documentation (ts_rank, GIN indexes, to_tsquery) - industry standard
- Common microservices patterns for search (parallel queries vs UNION) - architectural tradeoffs

**LOW confidence (needs validation):**
- Specific QPS thresholds for scaling triggers - should monitor in production
- Redis cluster sizing for 1M users - depends on actual cache hit rates
