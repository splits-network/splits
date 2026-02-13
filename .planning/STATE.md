# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.
**Current focus:** Phase 3 - Typeahead Search UI

## Current Position

Phase: 3 of 4 (Typeahead Search)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-13 — Completed 03-01-PLAN.md (Search Hook & Types)

Progress: [██████░░░░] ~60%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 3.2 min
- Total execution time: 19 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-search-infrastructure | 3 | 11min | 3.7min |
| 02-search-api | 2 | 5min | 2.5min |
| 03-typeahead-search | 1 | 3min | 3.0min |

**Recent Trend:**
- Last 5 plans: 8min, 3min, 2min, 3min, 3min
- Trend: Consistent (React hooks follow established patterns)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dedicated search schema vs querying live tables: Isolates search reads from live write tables; single unified table instead of 6-7 parallel queries (✓ search schema with search_index table)
- Trigger-based sync vs materialized view refresh: Triggers give sub-second freshness in same transaction (✓ Triggers)
- Use textSearch() with websearch type: Allows natural language queries, handles quoted phrases and operators automatically (01-01)
- UNIQUE constraint on (entity_type, entity_id): Enables ON CONFLICT DO UPDATE pattern for trigger-based sync (01-01)
- Keep specialization ILIKE filter separate: Discrete filter for specific field, not part of full-text search (01-01)
- Reuse search_vector from jobs/companies tables: Avoids duplicating complex requirements-aware logic; AFTER triggers read NEW.search_vector already populated by BEFORE triggers (01-02)
- Company cascade trigger: Updates job search_index entries when company name/industry/location changes to maintain denormalized data consistency (01-02)
- Recruiters trigger looks up user name/email: Consistent with existing build_recruiters_search_vector pattern; recruiters don't denormalize user data (01-03)
- User cascade trigger for recruiters: When user changes name/email, recruiter search entries update immediately to stay fresh (01-03)
- Shared delete_from_search_index() function: DRY principle - single function handles cleanup for all entity types via TG_ARGV[0] parameter (01-03)
- Typeahead parallel queries: Query each entity type separately (max 7 parallel) instead of single query with grouping - simpler and faster with GIN index (02-01)
- Sort by updated_at: Use updated_at desc instead of ts_rank (Supabase JS doesn't expose ts_rank) - newest results first is acceptable heuristic (02-01)
- Access control filters: Platform admins see all, company users see org-scoped + public, recruiters/candidates see public + null-org entities (02-01)
- Follow analytics.ts pattern for custom proxy routes: Non-standard endpoints use custom proxy pattern instead of generic registerResourceRoutes (02-02)
- Structured error forwarding from backend: Check error.jsonBody before falling back to error.message to preserve validation error details (02-02)
- 250ms debounce for typeahead: Faster than standard 300ms for snappier typeahead UX - users expect instant feedback (03-01)
- AbortController for request cancellation: Prevents stale results when user types quickly - only latest query results displayed (03-01)
- 5 max recent searches in localStorage: Balance between utility and clutter - 5 is typical for search UIs (03-01)

### Pending Todos

None yet.

### Blockers/Concerns

~~**Phase 1 prerequisite:** Recruiters table needs ILIKE→tsvector migration before trigger sync can be implemented. This is part of INFRA-09 and must be completed early in Phase 1.~~ **RESOLVED** (01-01): Recruiters now using tsvector search.

**Phase 1 Complete:** All 9 INFRA requirements satisfied. All 7 entity types syncing to search.search_index with trigger-based near-real-time updates.

**Phase 2 Complete:** Search API fully wired end-to-end:
- search-service at port 3012 with GET /api/v2/search endpoint
- API gateway proxy with authentication enforcement
- Typeahead mode (top 5 per entity type) and full mode (paginated results)
- Role-based access control via AccessContextResolver
- Structured validation errors (VALIDATION_ERROR code)

**Phase 3 In Progress:** Typeahead Search UI (1/2 plans complete)
- useGlobalSearch hook with debounced API calls (250ms)
- Search types mirroring search-service API contract
- Entity-to-URL routing for 7 entity types
- Recent searches in localStorage (max 5)
- AbortController for request cancellation

**Next:** Plan 03-02 - GlobalSearchBar component (typeahead dropdown UI).

## Session Continuity

Last session: 2026-02-13T06:59:41Z
Stopped at: Completed 03-01-PLAN.md (Search Hook & Types)
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
