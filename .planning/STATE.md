# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.
**Current focus:** Phase 1 - Search Infrastructure

## Current Position

Phase: 2 of 4 (Search API)
Plan: 2 of 2 in current phase
Status: Phase complete
Last activity: 2026-02-13 — Completed 02-02-PLAN.md (API Gateway Integration)

Progress: [█████░░░░░] ~50%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 3.2 min
- Total execution time: 16 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-search-infrastructure | 3 | 11min | 3.7min |
| 02-search-api | 2 | 5min | 2.5min |

**Recent Trend:**
- Last 5 plans: 1min, 8min, 3min, 2min
- Trend: Fast (API gateway integration follows well-established proxy pattern)

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

**Next:** Phase 3 - Search UI (typeahead dropdown, full search results page, keyboard shortcuts, global search modal).

## Session Continuity

Last session: 2026-02-13T06:26:22Z
Stopped at: Completed 02-02-PLAN.md (API Gateway Integration)
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
