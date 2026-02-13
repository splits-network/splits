# Global Search

## What This Is

A Google-like global search system for the Splits Network portal. Users type into a persistent search bar and get real-time results across all entities (candidates, jobs, companies, recruiters, applications, placements) ranked by relevance. Typeahead shows top 5 results instantly; pressing Enter opens a full search results page.

## Core Value

Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.

## Current Milestone: v2.0 Global Search

**Goal:** Build full-stack global search from database functions through API to real-time UI

**Target features:**
- Dedicated `search` schema with unified `search_index` table (CQRS pattern — isolate search reads from live tables)
- Trigger-based near-real-time sync from source tables to search index
- Search API endpoints in api-gateway (typeahead + full results)
- Real-time typeahead dropdown in portal header (top 5 results as user types)
- Full search results page with entity type filtering and pagination
- Role-based access control on all search results

## Requirements

### Validated

- ✓ Per-entity full-text search with tsvector columns on 7 tables — existing
- ✓ Weighted search fields (A-D) with auto-update triggers — existing
- ✓ GIN indexes on all search_vector columns — existing
- ✓ pg_trgm extension for trigram matching — existing
- ✓ SearchInput component for per-list search — existing

### Active

- [ ] Unified search.search_index table with trigger-based sync from all entity tables
- [ ] Search API endpoints (typeahead and full search) in api-gateway
- [ ] Real-time typeahead search bar in portal header with top 5 results dropdown
- [ ] Full search results page with entity type filtering and pagination
- [ ] Multi-term natural language queries return ranked cross-entity results
- [ ] Role-based filtering (users only see entities they have access to)
- [ ] Keyboard navigation (Cmd/Ctrl+K to focus, arrows to navigate, Enter to select)

### Out of Scope

- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Search analytics/tracking — defer to future milestone
- Fuzzy/typo-tolerant search — pg_trgm handles basic fuzzy, full fuzzy deferred
- Saved searches — future milestone
- Search across chat messages — external service, not in Postgres

## Context

**Existing search infrastructure:**
- 7 tables with tsvector search_vector columns: candidates (12 fields), jobs (12+ fields), applications (5 fields), placements (7 fields), companies (6 fields), recruiters (8 fields), recruiter_candidates (4 fields)
- Per-entity search works via `textSearch('search_vector', tsquery)` in V2 repositories
- Recruiters still use ILIKE search (needs migration to tsvector)
- Jobs search_vector does NOT include salary — needs update for numeric search
- `docs/search/scalable-search-architecture.md` documents current FTS patterns

**Architecture:**
- Single Supabase Postgres database (public + analytics + search schemas)
- Global search queries `search.search_index` (isolated from live read/write tables)
- Triggers on source tables sync to search_index in same transaction (near-real-time)
- Per-entity list search stays on live tables (tsvector + GIN, already fast)
- API Gateway (Fastify) proxies to domain services
- Access context resolves user roles/permissions for filtering
- Portal header at `apps/portal/src/components/portal-header.tsx` — integration point for search bar
- `use-standard-list.ts` hook has 300ms debounce pattern for per-entity search

**Key tables to search across:**
- candidates: name, email, skills, location, title, company, salary
- jobs: title, description, location, company, salary, requirements
- companies: name, industry, location, description
- recruiters: name, email, bio, specialties, location
- applications: candidate name, job title, company, stage
- placements: candidate name, job title, company, recruiter name, salary

## Constraints

- **Tech stack**: Postgres FTS (tsvector/ts_rank), Fastify, Next.js 16, React 19, DaisyUI — must use existing patterns
- **Performance**: Typeahead must respond in <200ms
- **Access control**: All results must be filtered through resolveAccessContext()
- **API pattern**: Must follow V2 `{ data, pagination }` response envelope
- **No new infra**: No Elasticsearch, no new databases — Postgres only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dedicated search schema vs querying live tables | Isolates search reads from live write tables; scales without impacting CRUD performance; single unified table instead of 6-7 parallel queries | ✓ search schema with search_index table |
| Trigger-based sync vs materialized view refresh | Triggers give sub-second freshness in same transaction; materialized views have refresh delay and lock during rebuild | ✓ Triggers |
| Search routes in api-gateway vs new search service | Read-only aggregation, not a domain service; keeps it simple | — Pending |
| Typeahead + full search as same endpoint with different limits | DRY; same function, different parameters | — Pending |

---
*Last updated: 2026-02-12 after milestone v2.0 initialization*
