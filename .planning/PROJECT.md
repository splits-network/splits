# Global Search

## What This Is

A Google-like global search system for the Splits Network portal. Users type into a persistent search bar in the portal header and get real-time results across all entities (candidates, jobs, companies, recruiters, applications, placements) ranked by relevance. Typeahead shows top 5 results per entity type instantly with keyboard navigation.

## Core Value

Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.

## Requirements

### Validated

- Per-entity full-text search with tsvector columns on 7 tables — existing
- Weighted search fields (A-D) with auto-update triggers — existing
- GIN indexes on all search_vector columns — existing
- pg_trgm extension for trigram matching — existing
- SearchInput component for per-list search — existing
- Unified search.search_index table with trigger-based sync from all entity tables — v2.0
- Search API endpoints (typeahead and full search) in api-gateway — v2.0
- Real-time typeahead search bar in portal header with top 5 results dropdown — v2.0
- Multi-term natural language queries return ranked cross-entity results — v2.0
- Role-based filtering (users only see entities they have access to) — v2.0
- Keyboard navigation (Cmd/Ctrl+K to focus, arrows to navigate, Enter to select) — v2.0

### Active

(No active requirements — next milestone TBD)

### Out of Scope

- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Search analytics/tracking — defer to future milestone
- Fuzzy/typo-tolerant search — pg_trgm handles basic fuzzy, full fuzzy deferred
- Saved searches — future milestone
- Search across chat messages — external service, not in Postgres
- Full search results page — typeahead covers core UX, per-entity list pages handle deep browsing

## Context

**Shipped v2.0 Global Search** (Feb 2026):
- 3 phases, 7 plans, ~2,570 lines of TypeScript + SQL
- Dedicated `search` schema with `search_index` table (CQRS pattern)
- Trigger-based near-real-time sync from 7 entity tables
- search-service microservice at port 3013
- Company-level access control with `orgWideOrganizationIds` on AccessContext
- DaisyUI v5 search bar with grouped dropdown, keyboard navigation, highlighted matches
- Deep link entity URL routing using query parameter pattern

**Architecture:**
- Single Supabase Postgres database (public + analytics + search schemas)
- Global search queries `search.search_index` (isolated from live read/write tables)
- Triggers on source tables sync to search_index in same transaction (near-real-time)
- Per-entity list search stays on live tables (tsvector + GIN, already fast)
- API Gateway (Fastify) proxies to search-service
- Access context resolves user roles/permissions for filtering
- Portal header at `apps/portal/src/components/portal-header.tsx` contains GlobalSearchBar

**Key tables searched:**
- candidates, jobs, companies, recruiters, applications, placements, recruiter_candidates

## Constraints

- **Tech stack**: Postgres FTS (tsvector/ts_rank), Fastify, Next.js 16, React 19, DaisyUI — must use existing patterns
- **Performance**: Typeahead must respond in <200ms
- **Access control**: All results filtered through resolveAccessContext() with marketplace + org-wide + company-scoped visibility
- **API pattern**: Must follow V2 `{ data, pagination }` response envelope
- **No new infra**: No Elasticsearch, no new databases — Postgres only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dedicated search schema vs querying live tables | Isolates search reads from live write tables; single unified table instead of 6-7 parallel queries | search schema with search_index table |
| Trigger-based sync vs materialized view refresh | Triggers give sub-second freshness in same transaction; materialized views have refresh delay | Triggers |
| Search-service as separate microservice | Follows nano-service philosophy; dedicated port, Dockerfile, K8s deployment | search-service at port 3013 |
| Typeahead parallel queries per entity type | Simpler and faster with GIN index than single query with grouping | 7 parallel queries |
| Sort by updated_at instead of ts_rank | Supabase JS doesn't expose ts_rank; newest-first is acceptable heuristic | updated_at desc |
| Marketplace entity visibility pattern | Candidates, jobs, companies, recruiters are public marketplace content | entity_type filter in access control |
| orgWideOrganizationIds on AccessContext | Distinguishes org-wide vs company-scoped memberships for search filtering | New field on AccessContext interface |
| DaisyUI v5 flex input pattern | `<label class="input">` as flex container avoids alignment issues | Replaced absolute positioning |
| Deep link query params for entity URLs | Portal uses slide-out panels on list pages, not dedicated detail routes | `?candidateId=x` pattern |
| 250ms debounce for typeahead | Faster than standard 300ms for snappier perceived performance | 250ms timeout |
| Enter selects top result | No full search page needed; Enter navigates to first result in dropdown | Top result has kbd hint |
| Drop Phase 4 (Full Search Page) | Typeahead covers core UX; per-entity list pages handle deep browsing | PAGE-01 through PAGE-04 deferred |

---
*Last updated: 2026-02-14 after v2.0 milestone*
