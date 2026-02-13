# Technology Stack — Global Search

**Project:** Splits Network — Global Search
**Researched:** 2026-02-12
**Confidence:** MEDIUM (based on existing codebase patterns, Postgres FTS documentation from training data, React ecosystem knowledge as of January 2025)

## Executive Summary

This research focuses ONLY on what's needed to ADD global search capability on top of the existing Postgres FTS infrastructure. The platform already has tsvector search_vector columns with GIN indexes on 7 tables (candidates, jobs, companies, applications, placements, recruiters, recruiter_candidates). The new requirement is a UNION ALL cross-table search with real-time typeahead and full results page.

**Recommended approach:** Postgres stored function using UNION ALL with ts_rank scoring, API endpoints in api-gateway (not a new service), custom React typeahead component using existing DaisyUI patterns, client-side caching with simple Map.

**What NOT to add:** Elasticsearch, Redis cache, cmdk/command palette libraries, separate search microservice.

---

## Recommended Stack Additions

### 1. Postgres Global Search Function

| Component | Version | Purpose | Why |
|-----------|---------|---------|-----|
| PL/pgSQL stored function | Postgres 15+ | Cross-table UNION ALL search with ranking | Native Postgres, single DB round-trip, query planner optimizes UNION ALL |
| ts_rank() | Built-in | Relevance scoring per entity | Standard FTS ranking function, works with existing tsvector columns |
| websearch_to_tsquery() | Built-in | Convert natural language query to tsquery | Supports multi-word AND/OR logic, phrase matching with quotes |
| Entity type discriminator | Custom | Return 'candidate', 'job', etc. with each row | Client needs entity type for routing and UI icons |
| Role-based parameters | Custom | Pass recruiter_id/company_id/candidate_id | Leverage existing resolveAccessContext() pattern |

**Why this approach:**
- Existing setup already has `build_*_search_vector` functions returning weighted tsvectors (A-D)
- GIN indexes already exist on all search_vector columns (verified in baseline.sql)
- UNION ALL executes each SELECT independently, then concatenates — Postgres query planner uses existing indexes
- Single function call = single round-trip vs N HTTP calls to different services
- ts_rank() respects weight classes (A-D) from existing search_vector definitions
- websearch_to_tsquery() handles natural language better than plain to_tsquery()

**Implementation pattern:**

```sql
CREATE OR REPLACE FUNCTION search_global(
    p_query TEXT,
    p_recruiter_id UUID DEFAULT NULL,
    p_company_id UUID DEFAULT NULL,
    p_candidate_id UUID DEFAULT NULL,
    p_entity_types TEXT[] DEFAULT NULL, -- Optional filter: ['candidate', 'job']
    p_limit INT DEFAULT 5,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    entity_type TEXT,
    entity_id UUID,
    rank REAL,
    title TEXT,
    subtitle TEXT,
    metadata JSONB, -- Store type-specific fields
    total_count BIGINT
) AS $$
DECLARE
    tsquery_input tsquery;
BEGIN
    -- Convert natural language query to tsquery
    tsquery_input := websearch_to_tsquery('english', p_query);

    RETURN QUERY
    WITH all_results AS (
        -- Candidates
        SELECT
            'candidate'::TEXT as entity_type,
            c.id as entity_id,
            ts_rank(c.search_vector, tsquery_input, 1) as rank,
            c.full_name as title,
            COALESCE(c.current_title || ' at ' || c.current_company, c.email) as subtitle,
            jsonb_build_object(
                'email', c.email,
                'location', c.location,
                'skills', c.skills
            ) as metadata
        FROM candidates c
        LEFT JOIN recruiter_candidates rc ON c.id = rc.candidate_id
        WHERE c.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'candidate' = ANY(p_entity_types))
          -- Access control: Candidates see own, recruiters see their relationships
          AND (
              p_candidate_id IS NULL -- No candidate filter
              OR c.user_id = (SELECT user_id FROM candidates WHERE id = p_candidate_id)
              OR (p_recruiter_id IS NOT NULL AND rc.recruiter_id = p_recruiter_id AND rc.status = 'active')
          )

        UNION ALL

        -- Jobs
        SELECT
            'job'::TEXT,
            j.id,
            ts_rank(j.search_vector, tsquery_input, 1),
            j.title,
            j.company_name || ' • ' || j.location,
            jsonb_build_object(
                'status', j.status,
                'salary_min', j.salary_min,
                'salary_max', j.salary_max,
                'employment_type', j.employment_type
            )
        FROM jobs j
        WHERE j.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'job' = ANY(p_entity_types))
          AND j.status IN ('published', 'open')
          -- Access control: Recruiters see assigned jobs, companies see their own
          AND (
              p_company_id IS NULL
              OR j.company_id = (SELECT co.id FROM companies co WHERE co.identity_organization_id = p_company_id)
          )

        UNION ALL

        -- Companies (if user has access)
        SELECT
            'company'::TEXT,
            co.id,
            ts_rank(co.search_vector, tsquery_input, 1),
            co.name,
            COALESCE(co.industry, '') || ' • ' || COALESCE(co.headquarters_location, ''),
            jsonb_build_object(
                'industry', co.industry,
                'company_size', co.company_size,
                'website', co.website
            )
        FROM companies co
        WHERE co.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'company' = ANY(p_entity_types))

        UNION ALL

        -- Recruiters
        SELECT
            'recruiter'::TEXT,
            r.id,
            ts_rank(r.search_vector, tsquery_input, 1),
            u.name,
            COALESCE(r.tagline, u.email),
            jsonb_build_object(
                'email', u.email,
                'location', r.location,
                'industries', r.industries,
                'specialties', r.specialties
            )
        FROM recruiters r
        JOIN users u ON r.user_id = u.id
        WHERE r.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'recruiter' = ANY(p_entity_types))
          AND r.status = 'active'

        UNION ALL

        -- Applications
        SELECT
            'application'::TEXT,
            a.id,
            ts_rank(a.search_vector, tsquery_input, 1),
            a.candidate_name || ' → ' || a.job_title,
            a.company_name || ' • ' || a.stage,
            jsonb_build_object(
                'stage', a.stage,
                'candidate_id', a.candidate_id,
                'job_id', a.job_id,
                'created_at', a.created_at
            )
        FROM applications a
        WHERE a.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'application' = ANY(p_entity_types))
          -- Access control: Filter by recruiter or company
          AND (
              p_recruiter_id IS NULL OR a.recruiter_id = p_recruiter_id
          )

        UNION ALL

        -- Placements
        SELECT
            'placement'::TEXT,
            p.id,
            ts_rank(p.search_vector, tsquery_input, 1),
            p.candidate_name || ' placed at ' || p.company_name,
            p.job_title || ' • $' || p.salary::TEXT,
            jsonb_build_object(
                'state', p.state,
                'salary', p.salary,
                'candidate_id', p.candidate_id,
                'job_id', p.job_id,
                'created_at', p.created_at
            )
        FROM placements p
        WHERE p.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'placement' = ANY(p_entity_types))
          AND p.state IN ('active', 'completed')
          -- Access control
          AND (
              p_recruiter_id IS NULL OR p.recruiter_id = p_recruiter_id
          )

        UNION ALL

        -- Recruiter Candidates (relationships)
        SELECT
            'recruiter_candidate'::TEXT,
            rc.id,
            ts_rank(rc.search_vector, tsquery_input, 1),
            rc.candidate_name,
            'Status: ' || rc.status,
            jsonb_build_object(
                'status', rc.status,
                'candidate_id', rc.candidate_id,
                'recruiter_id', rc.recruiter_id
            )
        FROM recruiter_candidates rc
        WHERE rc.search_vector @@ tsquery_input
          AND (p_entity_types IS NULL OR 'recruiter_candidate' = ANY(p_entity_types))
          AND rc.status = 'active'
          -- Access control
          AND (
              p_recruiter_id IS NULL OR rc.recruiter_id = p_recruiter_id
          )
    ),
    counted_results AS (
        SELECT *, COUNT(*) OVER() as total_count
        FROM all_results
    )
    SELECT *
    FROM counted_results
    ORDER BY rank DESC, title ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
```

**Why ts_rank not ts_rank_cd:**
- ts_rank: Calculates rank based on term frequency and position weights (A-D) — O(n) complexity
- ts_rank_cd: Cover density ranking (considers proximity of search terms) — O(n^2) complexity
- For typeahead with millisecond latency requirements, ts_rank is sufficient and FASTER
- Existing search_vector columns have weighted fields (A=name/title, B=email/description, C=location, D=misc) — ts_rank respects these weights
- If relevance needs improvement post-MVP, can add ts_rank_cd for full search page only (not typeahead)

**Normalization flag (1):**
- `ts_rank(search_vector, query, 1)` — Flag 1 divides rank by document length
- Prevents long documents (e.g., job descriptions) from dominating results
- Important for fair cross-entity ranking where candidates have short names but jobs have long descriptions

**What NOT to add:**
- **Materialized view for search:** Adds complexity, staleness issues, and existing GIN indexes are sufficient for <200ms response
- **Full-text search configuration tuning:** Existing 'english' config is adequate; custom dictionaries are premature optimization
- **Postgres extensions beyond pg_trgm:** Already have pg_trgm for trigram matching; no need for additional extensions
- **Separate search index table:** Would duplicate data and require sync logic; existing per-table search_vector columns are sufficient

### 2. API Layer (Fastify in api-gateway)

| Component | Version | Purpose | Why |
|-----------|---------|---------|-----|
| Fastify route in api-gateway | Existing | `/api/v2/search/typeahead` and `/api/v2/search/full` | Read-only aggregation, not a domain service; api-gateway is correct layer |
| StandardListResponse envelope | Existing | Wrap results in `{ data, pagination }` | Follows existing V2 pattern from pagination.md |
| resolveAccessContext() | Existing | Extract user roles and pass to search function | Consistent with existing RBAC implementation |
| Supabase RPC call | Existing | Call search_global() function | Standard pattern for Postgres functions |

**Why api-gateway not a new search-service:**
- Search is read-only aggregation across existing domain tables
- No business logic, no state mutation, no event publishing
- Gateway already authenticates requests and resolves access context
- Keeps deployment simple (no new service to deploy/monitor)
- Follows existing pattern: gateway proxies authenticated requests to Supabase

**API design:**

```typescript
// services/api-gateway/src/routes/search/routes.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListResponse } from '@splits-network/shared-types';

app.get<{
    Querystring: {
        q: string;
        entity_types?: string; // Comma-separated: "candidate,job"
        page?: string;
        limit?: string;
    };
}>(
    '/api/v2/search/typeahead',
    {
        schema: {
            description: 'Typeahead search across all entities (top 5 results)',
            tags: ['search'],
            security: [{ clerkAuth: [] }],
        },
    },
    async (request, reply) => {
        const { q, entity_types } = request.query;
        const clerkUserId = request.headers['x-clerk-user-id'] as string;

        if (!q || q.length < 2) {
            return reply.send({ data: [] });
        }

        const context = await resolveAccessContext(supabase, clerkUserId);

        const entityTypesArray = entity_types
            ? entity_types.split(',').map(t => t.trim())
            : null;

        const { data, error } = await supabase.rpc('search_global', {
            p_query: q,
            p_recruiter_id: context.recruiterId || null,
            p_company_id: context.companyId || null,
            p_candidate_id: context.candidateId || null,
            p_entity_types: entityTypesArray,
            p_limit: 5,
            p_offset: 0,
        });

        if (error) {
            console.error('Typeahead search error:', error);
            throw error;
        }

        return reply.send({ data: data || [] });
    }
);

app.get<{
    Querystring: {
        q: string;
        entity_types?: string;
        page?: string;
        limit?: string;
    };
}>(
    '/api/v2/search/full',
    {
        schema: {
            description: 'Full search with pagination',
            tags: ['search'],
            security: [{ clerkAuth: [] }],
        },
    },
    async (request, reply) => {
        const { q, entity_types, page = '1', limit = '25' } = request.query;
        const clerkUserId = request.headers['x-clerk-user-id'] as string;

        if (!q || q.length < 2) {
            return reply.send({
                data: [],
                pagination: { total: 0, page: 1, limit: 25, total_pages: 0 },
            });
        }

        const context = await resolveAccessContext(supabase, clerkUserId);

        const entityTypesArray = entity_types
            ? entity_types.split(',').map(t => t.trim())
            : null;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        const { data, error } = await supabase.rpc('search_global', {
            p_query: q,
            p_recruiter_id: context.recruiterId || null,
            p_company_id: context.companyId || null,
            p_candidate_id: context.candidateId || null,
            p_entity_types: entityTypesArray,
            p_limit: limitNum,
            p_offset: offset,
        });

        if (error) {
            console.error('Full search error:', error);
            throw error;
        }

        const total = data && data.length > 0 ? data[0].total_count : 0;

        return reply.send({
            data: data || [],
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                total_pages: Math.ceil(total / limitNum),
            },
        });
    }
);
```

**Response format:**

```typescript
// Typeahead response
{
  data: [
    {
      entity_type: 'candidate',
      entity_id: 'uuid',
      rank: 0.845,
      title: 'John Doe',
      subtitle: 'Senior Engineer at Google',
      metadata: { email: 'john@example.com', location: 'SF', skills: ['React', 'Node'] }
    },
    // ... up to 5 results
  ]
}

// Full search response
{
  data: [ /* array of search results */ ],
  pagination: {
    total: 127,
    page: 1,
    limit: 25,
    total_pages: 6
  }
}
```

**What NOT to add:**
- **Separate search microservice:** Over-engineering for read-only aggregation; api-gateway is sufficient
- **GraphQL endpoint:** Existing V2 APIs use REST; no need to introduce GraphQL for one feature
- **WebSocket streaming:** Typeahead doesn't need real-time push; HTTP polling with debounce is sufficient

### 3. Frontend Typeahead Pattern (Custom React Component)

| Component | Version | Purpose | Why |
|-----------|---------|---------|-----|
| Custom React component | React 19 | Search bar with dropdown | Existing portal uses React 19; custom gives full control over UX |
| Native keyboard nav | React useRef + onKeyDown | Cmd/Ctrl+K, arrows, Enter, Escape | Lighter than command palette libraries; follows existing patterns |
| Debounced fetch | Custom hook (useDebounce) | 300ms debounce on search input | Existing `use-standard-list.ts` has this pattern already |
| Client-side cache | useState + Map | Cache results by query string | Avoid redundant API calls during backspace/navigation |
| DaisyUI dropdown | Existing | Dropdown UI for results | Consistent with existing portal UI patterns |
| Portal header integration | Existing | Insert in `apps/portal/src/components/portal-header.tsx` | Already has nav components |

**Why NOT cmdk or other command palette libraries:**
- **cmdk (pacocoursey/cmdk):** 15KB library, but existing codebase has ZERO command palette usage
- **Adds dependency** for a pattern not used elsewhere in the app
- **Custom implementation:** ~150 lines of code using existing DaisyUI dropdown patterns
- **Portal already has SearchInput component** (`apps/portal/src/components/standard-lists/search-input.tsx`) — extend this pattern
- **Full control:** Custom implementation gives complete control over styling, keyboard behavior, result rendering

**Command palette libraries evaluated:**

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| cmdk | Popular (30K stars), keyboard-first, accessible | 15KB, new pattern in codebase, designed for commands not search | NO |
| kbar | Extensible, good for complex actions | 20KB, designed for command palette not typeahead | NO |
| react-select | Mature, accessible | 50KB+, designed for form dropdowns not global search | NO |
| Custom with DaisyUI | Matches existing UI, lightweight, full control | Requires custom implementation | YES |

**Custom implementation pattern:**

```tsx
// apps/portal/src/components/global-search/global-search-bar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface SearchResult {
    entity_type: string;
    entity_id: string;
    rank: number;
    title: string;
    subtitle: string;
    metadata: Record<string, any>;
}

export function GlobalSearchBar() {
    const { getToken } = useAuth();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [cache, setCache] = useState(new Map<string, SearchResult[]>());
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Debounced search effect (300ms)
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            // Check cache first
            if (cache.has(query)) {
                setResults(cache.get(query)!);
                setIsOpen(true);
                return;
            }

            // Fetch from API
            setLoading(true);
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/search/typeahead?q=${encodeURIComponent(query)}`
                );

                const data = response.data || [];
                setResults(data);
                setCache(new Map(cache.set(query, data))); // Update cache
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    // Global keyboard shortcut (Cmd/Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Keyboard navigation (arrows, enter, escape)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (results[selectedIndex]) {
                    navigateToResult(results[selectedIndex]);
                } else {
                    // Go to full search results page
                    router.push(`/portal/search?q=${encodeURIComponent(query)}`);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const navigateToResult = (result: SearchResult) => {
        const routes: Record<string, string> = {
            candidate: `/portal/candidates/${result.entity_id}`,
            job: `/portal/jobs/${result.entity_id}`,
            company: `/portal/companies/${result.entity_id}`,
            recruiter: `/portal/recruiters/${result.entity_id}`,
            application: `/portal/applications/${result.entity_id}`,
            placement: `/portal/placements/${result.entity_id}`,
        };

        const route = routes[result.entity_type];
        if (route) {
            router.push(route);
            setIsOpen(false);
            setQuery('');
        }
    };

    const getEntityIcon = (entityType: string): string => {
        const icons: Record<string, string> = {
            candidate: 'fa-user',
            job: 'fa-briefcase',
            company: 'fa-building',
            recruiter: 'fa-user-tie',
            application: 'fa-file-check',
            placement: 'fa-handshake',
        };
        return icons[entityType] || 'fa-search';
    };

    return (
        <div className="relative w-full max-w-xl">
            {/* Search input */}
            <label className="input input-bordered flex items-center gap-2">
                <i className="fa-duotone fa-regular fa-search"></i>
                <input
                    ref={inputRef}
                    type="text"
                    className="grow"
                    placeholder="Search candidates, jobs, companies... (Cmd+K)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
                {loading && (
                    <span className="loading loading-spinner loading-sm"></span>
                )}
                {query && (
                    <button
                        className="btn btn-ghost btn-xs btn-circle"
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                    >
                        <i className="fa-duotone fa-regular fa-times"></i>
                    </button>
                )}
            </label>

            {/* Dropdown results */}
            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-96 overflow-y-auto"
                >
                    {results.map((result, index) => (
                        <button
                            key={`${result.entity_type}-${result.entity_id}`}
                            className={`w-full text-left px-4 py-3 hover:bg-base-200 flex items-center gap-3 ${
                                index === selectedIndex ? 'bg-base-200' : ''
                            }`}
                            onClick={() => navigateToResult(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <i
                                className={`fa-duotone fa-regular ${getEntityIcon(result.entity_type)} text-primary`}
                            ></i>
                            <div className="flex-1">
                                <div className="font-medium">{result.title}</div>
                                <div className="text-sm text-base-content/60">
                                    {result.subtitle}
                                </div>
                            </div>
                            <div className="text-xs badge badge-ghost">
                                {result.entity_type}
                            </div>
                        </button>
                    ))}

                    {/* See all results link */}
                    <div className="border-t border-base-300 px-4 py-2 text-center">
                        <button
                            className="text-sm text-primary hover:underline"
                            onClick={() =>
                                router.push(`/portal/search?q=${encodeURIComponent(query)}`)
                            }
                        >
                            See all results for "{query}"
                        </button>
                    </div>
                </div>
            )}

            {/* No results message */}
            {isOpen && results.length === 0 && !loading && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg p-4 text-center text-base-content/60">
                    No results found for "{query}"
                </div>
            )}
        </div>
    );
}
```

**Component file structure:**

```
apps/portal/src/components/global-search/
├── global-search-bar.tsx       # Main search bar component (above)
├── search-result-item.tsx      # Single result item component
├── use-global-search.ts        # Hook for search logic (optional extraction)
└── index.ts                    # Barrel export
```

**What NOT to add:**
- **Heavy typeahead library:** Custom implementation is 150 lines, libraries are 15-50KB
- **Separate modal component:** DaisyUI dropdown is sufficient; modal adds unnecessary complexity for typeahead
- **react-hotkeys library:** Native addEventListener is sufficient for Cmd+K shortcut

### 4. Caching Strategy

| Layer | Technology | TTL/Strategy | Why |
|-------|----------|--------------|-----|
| Client-side | React useState + Map | Session-scoped, invalidate on logout | Fast, prevents redundant fetches during backspace/retyping |
| No server-side cache | — | — | Search results are user-specific (RBAC), low cache hit rate |
| No Redis cache | — | — | Sub-200ms Postgres response time makes caching premature |

**Why client-side only:**
- **Search queries are unique per user's access context:** recruiterID, companyId, candidateId
- **Query variability is high:** Every user types different things, low cache hit rate
- **Hit rate would be LOW** for server-side cache (estimated <10% based on typical search patterns)
- **Client-side Map cache:** O(1) lookup, no serialization overhead, session-scoped (perfect for typeahead)
- **Simplicity:** No cache invalidation logic needed; cache clears on page refresh

**Cache implementation:**

```typescript
const [cache, setCache] = useState(new Map<string, SearchResult[]>());

// Check cache before API call
if (cache.has(query)) {
    setResults(cache.get(query)!);
    setIsOpen(true);
    return;
}

// After API call, update cache
const data = response.data || [];
setCache(new Map(cache.set(query, data)));
```

**Cache invalidation:**
- **On logout:** React state clears naturally
- **On page refresh:** Map is recreated, cache starts fresh
- **No manual invalidation needed:** Search results don't go stale within a session (entity updates are rare during active browsing)

**What NOT to add:**
- **Redis cache for search results:** Premature optimization; Postgres is fast enough
- **LocalStorage cache:** Cross-session caching introduces staleness issues; not worth complexity
- **Service worker cache:** Over-engineering for a simple Map-based cache

### 5. Performance Optimization Techniques

| Technique | Where Applied | Purpose | Implementation |
|-----------|---------------|---------|----------------|
| Debouncing | Frontend | Reduce API calls during typing | 300ms delay (existing pattern from use-standard-list.ts) |
| LIMIT clause | Postgres function | Return top N results only | Typeahead: LIMIT 5, Full search: LIMIT 25 |
| Index-only scans | Postgres query | Use existing GIN indexes | Verify with EXPLAIN ANALYZE |
| Avoid SELECT * | Postgres function | Return only UI-needed fields | title, subtitle, metadata only |
| ts_rank normalization | Postgres ts_rank | Normalize rank by document length | ts_rank(..., 1) — flag 1 normalizes |
| Entity type filtering | SQL WHERE clause | Let user filter specific entities | WHERE entity_type = ANY($1) |
| Early return on short queries | Frontend + Backend | Don't search queries <2 chars | if (query.length < 2) return; |
| Parallel UNION ALL | Postgres | Execute SELECTs concurrently | Postgres query planner handles this |

**Debouncing pattern (frontend):**

```typescript
useEffect(() => {
    if (query.length < 2) return;

    const timer = setTimeout(async () => {
        // Fetch search results
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
}, [query]);
```

**Why 300ms debounce:**
- Balances responsiveness (feels instant) vs API load
- Existing pattern in `use-standard-list.ts` hook
- Typical typing speed: 200-300ms between characters
- Google uses 100-200ms, but they have more aggressive caching

**Postgres optimization checklist:**

```sql
-- Verify GIN indexes exist (should already be present)
EXPLAIN ANALYZE
SELECT * FROM search_global('senior engineer', NULL, NULL, NULL, NULL, 5, 0);

-- Expected query plan:
-- -> Bitmap Index Scan using candidates_search_vector_idx
-- -> Bitmap Index Scan using jobs_search_vector_idx
-- -> ... (one per entity type)

-- Avoid: Sequential Scan (indicates missing/unused index)
```

**Performance targets:**

| Query Type | Target Latency | Notes |
|------------|----------------|-------|
| Typeahead (5 results) | <200ms p95 | GIN index scan + LIMIT 5, minimal SELECT fields |
| Full search (25 results) | <500ms p95 | GIN index scan + LIMIT 25, pagination |
| With entity_type filter | <150ms p95 | Reduces UNION ALL branches from 7 to 1-2 |

**What NOT to add:**
- **Complex relevance tuning:** Weighted search_vector (A-D) + ts_rank is sufficient for MVP
- **Machine learning ranking:** Over-engineering; no training data, no proven benefit
- **Query rewriting/synonyms:** Adds complexity; defer to post-MVP if users report issues

---

## Alternatives Considered

### Materialized View for Global Search

**Considered:** Pre-join all searchable entities into a single materialized view

```sql
CREATE MATERIALIZED VIEW search_index AS
SELECT 'candidate' as entity_type, id, search_vector, ...
FROM candidates
UNION ALL
SELECT 'job', id, search_vector, ...
FROM jobs
-- ... all entity types
```

**Why rejected:**
- **Staleness:** Results wouldn't be real-time; REFRESH required
- **Refresh overhead:** REFRESH MATERIALIZED VIEW CONCURRENTLY still locks, adds delay
- **Existing GIN indexes are sufficient:** Target <200ms already achievable with per-table indexes
- **Storage duplication:** Duplicate tsvector columns across tables
- **Maintenance complexity:** Requires monitoring, scheduled refresh jobs
- **UNION ALL in function achieves same goal** without staleness

**Verdict:** NO. Use UNION ALL in stored function with existing indexes.

### Redis Cache for Search Results

**Considered:** Cache search results in Redis with 5-minute TTL

**Why rejected:**
- **Cache key complexity:** Must include user's access context (recruiterId, companyId, candidateId) = unique per user
- **Low hit rate:** Search queries are highly variable; estimated <10% hit rate
- **Invalidation complexity:** When entity data changes, which cache keys to invalidate?
- **Postgres performance is sufficient:** <200ms with existing GIN indexes meets target
- **Premature optimization:** Add only if performance degrades in production
- **Client-side cache is simpler:** Map-based cache in React state, no infrastructure

**Verdict:** NO. Use client-side Map cache only. Revisit if Postgres queries exceed 500ms p95.

### Elasticsearch or Typesense

**Considered:** External search engine for advanced features (typo tolerance, faceted search, ML ranking)

**Why rejected:**
- **Out of scope per PROJECT.md:** "Postgres FTS is sufficient for current scale"
- **Infrastructure complexity:** New service to deploy, monitor, keep in sync with Postgres
- **Cost:** Additional infrastructure (Elasticsearch: ~$100/month, Typesense: ~$50/month)
- **Data sync overhead:** Need to index Postgres → Elasticsearch on every entity change
- **Overkill for current scale:** <100K entities fits Postgres FTS sweet spot
- **No proven need:** No performance bottleneck, no user complaints about search quality

**When to reconsider:**
- Postgres queries consistently exceed 500ms p95
- Users report poor relevance (e.g., "can't find candidates by skills")
- Need for advanced features: faceted search, ML-based ranking, analytics

**Verdict:** NO. Defer to future milestone if/when Postgres FTS becomes bottleneck.

### cmdk or kbar Command Palette Libraries

**Considered:** Use popular command palette library for typeahead UI

**cmdk (pacocoursey/cmdk):**
- **Pros:** Popular (30K GitHub stars), keyboard-first, accessible
- **Cons:** 15KB, designed for command palette (actions) not search (navigation), not used elsewhere in codebase
- **API:** Requires wrapping in `<Command>` component, custom item rendering

**kbar:**
- **Pros:** Extensible, good for complex actions (e.g., "Create new job", "Switch workspace")
- **Cons:** 20KB, designed for command palette not typeahead, steeper learning curve

**react-select:**
- **Pros:** Mature, accessible, form dropdown pattern
- **Cons:** 50KB+, designed for form dropdowns not global search, over-engineered for this use case

**Verdict:** NO. Custom implementation using DaisyUI dropdown pattern. Reasons:
- **Lightweight:** ~150 lines vs 15-50KB library
- **Full control:** Custom rendering, styling, keyboard behavior
- **Consistent with existing UI:** Extends existing SearchInput component, uses DaisyUI patterns
- **No new patterns:** Existing codebase has ZERO command palette usage; introducing new pattern for one feature adds complexity

### Separate Search Microservice

**Considered:** New `search-service` instead of api-gateway route

**Why rejected:**
- **Search is read-only aggregation:** No business logic, no state mutation, no event publishing
- **No domain ownership:** Search queries ALL domain tables; not owned by any single service
- **Deployment complexity:** New service to deploy, monitor, scale
- **Service-to-service communication:** Would require HTTP calls from api-gateway → search-service
- **api-gateway already authenticates:** Resolves access context, perfect layer for cross-domain reads
- **YAGNI:** No proven need for separate service; can extract later if needed

**Verdict:** NO. Implement as routes in api-gateway. Follows existing pattern for cross-domain reads.

---

## Integration with Existing Stack

### Database Layer

**Existing infrastructure (already in place):**
- 7 tables with search_vector tsvector columns
- `build_*_search_vector()` functions for each entity (candidates, jobs, companies, applications, placements, recruiters, recruiter_candidates)
- Triggers auto-update search_vector on INSERT/UPDATE
- GIN indexes on all search_vector columns (verified in baseline.sql)
- pg_trgm extension enabled

**New additions (minimal):**
- `search_global()` PL/pgSQL stored function for UNION ALL cross-table search
- No schema changes required
- No new indexes required (leverage existing GIN indexes)
- No new extensions required

**Migration file:**

```sql
-- supabase/migrations/20260213000001_add_global_search_function.sql
CREATE OR REPLACE FUNCTION search_global(...) RETURNS TABLE (...) AS $$
-- Implementation in section 1 above
$$ LANGUAGE plpgsql STABLE;

-- Optional: Add comment for documentation
COMMENT ON FUNCTION search_global IS 'Global search across all entity types with role-based access control';
```

### API Gateway Layer

**Existing infrastructure:**
- Fastify routes for domain services
- `resolveAccessContext()` for RBAC (from @splits-network/shared-access-context)
- `StandardListResponse` envelope pattern (from @splits-network/shared-types)
- Supabase client for RPC calls

**New additions:**
- `GET /api/v2/search/typeahead` — Calls search_global() with LIMIT 5
- `GET /api/v2/search/full` — Calls search_global() with pagination
- Access control: Extract clerkUserId, resolve to recruiterID/companyId/candidateId, pass to function

**File location:**

```
services/api-gateway/src/routes/search/
├── routes.ts          # Typeahead + full search endpoints (implementation in section 2 above)
└── index.ts           # Export routes
```

**Integration in main routes file:**

```typescript
// services/api-gateway/src/routes/index.ts
import searchRoutes from './search/routes';

app.register(searchRoutes, { prefix: '/api/v2/search' });
```

### Frontend Layer

**Existing infrastructure:**
- React 19, Next.js 16 App Router
- DaisyUI components
- SearchInput component for per-list search (`apps/portal/src/components/standard-lists/search-input.tsx`)
- `use-standard-list.ts` with 300ms debounce pattern
- Portal header at `apps/portal/src/components/portal-header.tsx`

**New additions:**
- `GlobalSearchBar` component (extends SearchInput pattern)
- Keyboard shortcut hook (Cmd/Ctrl+K to focus)
- Full search results page at `apps/portal/src/app/portal/search/page.tsx`
- Navigation helper to route entity_type to correct detail page

**Component locations:**

```
apps/portal/src/components/global-search/
├── global-search-bar.tsx       # Typeahead search bar for header (implementation in section 3 above)
├── search-result-item.tsx      # Single result item component
├── use-global-search.ts        # Hook for search logic (optional extraction)
└── index.ts                    # Barrel export

apps/portal/src/app/portal/search/
└── page.tsx                    # Full search results page with pagination
```

**Portal header integration:**

```tsx
// apps/portal/src/components/portal-header.tsx
import { GlobalSearchBar } from '@/components/global-search';

export function PortalHeader() {
    return (
        <header className="navbar bg-base-100 border-b">
            {/* Logo, nav links */}
            <div className="flex-1 px-4">
                <GlobalSearchBar />
            </div>
            {/* User menu, notifications */}
        </header>
    );
}
```

---

## Installation & Setup

### No New Dependencies Required

All necessary technologies are already in the stack:
- Postgres 15+ with pg_trgm extension ✓ (existing)
- Fastify with Supabase client ✓ (existing)
- React 19 + Next.js 16 ✓ (existing)
- DaisyUI for UI components ✓ (existing)
- @splits-network/shared-types ✓ (existing)
- @splits-network/shared-access-context ✓ (existing)

### Database Migration Only

```bash
# Create new migration for global search function
cd supabase
supabase migration new add_global_search_function

# Write search_global() function in the migration file (see section 1)
# Apply migration
supabase db push
```

### Development Workflow

```bash
# No changes to local dev environment needed

# Start services
pnpm --filter @splits-network/portal dev        # Frontend at localhost:3100
pnpm --filter @splits-network/api-gateway dev   # Backend at localhost:3001

# Test global search
# 1. Open portal (localhost:3100)
# 2. Press Cmd+K
# 3. Type "senior engineer"
# 4. See typeahead results
# 5. Press Enter to see full results page
```

---

## Performance Benchmarks (Expected)

| Query Type | Expected Latency | Justification |
|------------|------------------|---------------|
| Typeahead (5 results) | <200ms p95 | GIN index scan + LIMIT 5, minimal SELECT fields, 7 UNION branches |
| Full search (25 results) | <500ms p95 | GIN index scan + LIMIT 25, pagination, 7 UNION branches |
| With entity_type filter | <150ms p95 | Reduces UNION ALL from 7 branches to 1-2, smaller result set |
| Short query (<3 chars) | 0ms | Frontend early return, no API call |

**Scalability projections:**

| Entity Count | Expected Latency | Notes |
|--------------|------------------|-------|
| Current (~20K) | <200ms | Well within Postgres FTS sweet spot |
| 100K entities | <300ms | GIN indexes scale logarithmically |
| 1M entities | <500ms | May need covering indexes or denormalization |
| 10M+ entities | >1s | Consider Elasticsearch migration |

**Postgres FTS scales well to 100K-1M documents** with GIN indexes. If latency exceeds targets:

**Optimization path:**
1. **Add covering indexes** with ts_rank pre-computed (avoid recalculation)
2. **Denormalize frequently-searched fields** (e.g., candidate name snapshot on applications)
3. **Introduce Redis cache** for top 100 queries (cache hit rate improves with volume)
4. **Partition large tables** by date (e.g., applications older than 1 year in archive partition)
5. **Upgrade to Elasticsearch** (major architectural change, last resort)

**Query plan verification:**

```sql
-- Run in psql or Supabase SQL editor
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM search_global('senior engineer', NULL, NULL, NULL, NULL, 5, 0);

-- Expected output (abbreviated):
-- Limit (actual time=45.123..45.125 rows=5)
--   -> Sort (actual time=45.120..45.122 rows=5)
--         -> Append (actual time=2.456..44.890 rows=127)
--               -> Bitmap Heap Scan on candidates (actual time=1.234..5.678 rows=23)
--                     -> Bitmap Index Scan using candidates_search_vector_idx (actual time=0.987..0.987 rows=23)
--               -> Bitmap Heap Scan on jobs (actual time=2.345..6.789 rows=45)
--                     -> Bitmap Index Scan using jobs_search_vector_idx (actual time=1.876..1.876 rows=45)
--               ... (5 more entity types)

-- Red flags:
-- - Seq Scan (sequential scan): Indicates missing/unused index, fix immediately
-- - High actual time (>500ms): Consider optimization strategies above
```

---

## Confidence Assessment

| Component | Confidence | Rationale |
|-----------|------------|-----------|
| Postgres UNION ALL pattern | HIGH | Proven pattern, existing GIN indexes verified in codebase, ts_rank is standard FTS function |
| API Gateway integration | HIGH | Existing resolveAccessContext() pattern well-established, Supabase RPC calls proven |
| Frontend custom typeahead | MEDIUM | Pattern is proven (existing SearchInput component), but implementation untested without external docs |
| Performance targets | MEDIUM | Based on typical Postgres FTS benchmarks (training data), not measured on actual dataset |
| Client-side caching | HIGH | Simple Map-based cache is well-understood pattern, low risk |
| ts_rank relevance | MEDIUM | Assumes existing search_vector weights (A-D) are well-tuned; may need adjustment post-MVP |

**Gaps in research (WebSearch/WebFetch blocked):**
- Could not verify current cmdk API/best practices
- Could not verify latest Postgres 15+ FTS optimization guides
- Could not access Supabase documentation for latest .rpc() API patterns
- No benchmark data for similar UNION ALL queries on this dataset size

**Mitigations:**
- Custom typeahead implementation follows existing SearchInput pattern (lower risk than new library)
- Add EXPLAIN ANALYZE to monitor query plans in staging before production
- Benchmark actual search_global() function performance in staging with production data snapshot
- Start with conservative LIMIT (5 for typeahead) and increase if performance allows
- Use existing patterns from codebase (resolveAccessContext, StandardListResponse) to reduce unknowns

**Validation checklist before production:**
- [ ] Run EXPLAIN ANALYZE on search_global() with sample queries
- [ ] Verify all 7 entity types have GIN indexes (should already exist)
- [ ] Test typeahead latency with 100+ concurrent users in staging
- [ ] Verify access control: recruiters only see their candidates, companies only see their jobs
- [ ] Test keyboard navigation (Cmd+K, arrows, Enter, Escape) across browsers
- [ ] Measure cache hit rate in client-side Map cache (expect 20-30% for backspace/retype scenarios)

---

## Sources

**Primary sources (HIGH confidence):**
- Existing codebase patterns:
  - `supabase/migrations/20240101000000_baseline.sql` — Verified search_vector columns, GIN indexes, build_*_search_vector functions
  - `services/ats-service/src/v2/candidates/repository.ts` — Verified .textSearch() pattern, resolveAccessContext usage
  - `apps/portal/src/components/standard-lists/search-input.tsx` — Verified SearchInput component pattern
  - `docs/guidance/pagination.md` — Verified StandardListResponse pattern
  - `.planning/PROJECT.md` — Project requirements and constraints

**Secondary sources (MEDIUM confidence, from training data as of January 2025):**
- PostgreSQL 15 full-text search documentation:
  - ts_rank() normalization flags
  - websearch_to_tsquery() natural language parsing
  - GIN index performance characteristics
  - UNION ALL query planning
- React 19 patterns:
  - useRef + keyboard event handlers for navigation
  - useState + Map for client-side caching
  - useEffect with cleanup for debouncing
- Fastify + Supabase patterns:
  - .rpc() for stored function calls
  - Error handling for database queries

**Note on WebSearch/WebFetch restrictions:**
- WebSearch and WebFetch were blocked during this research session
- All recommendations based on existing codebase analysis + training data (January 2025)
- For production implementation, recommend verifying:
  1. Latest PostgreSQL FTS best practices for UNION ALL cross-table search
  2. Latest React 19 patterns for accessible typeahead components
  3. Benchmark search_global() on staging with production-like data before rollout

---

**Last Updated:** 2026-02-12
**Researcher:** GSD Project Researcher (Stack dimension)
**For:** Milestone v2.0 — Global Search
**Confidence:** MEDIUM (existing patterns HIGH, performance estimates MEDIUM, external docs unavailable)
