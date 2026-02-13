# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.
**Current focus:** Phase 4 - Full Search Page

## Current Position

Phase: 4 of 4 (Full Search Page)
Plan: 0 of TBD in current phase
Status: Not started (phase needs planning)
Last activity: 2026-02-13 — Completed Phase 3 (Typeahead Search)

Progress: [████████░░] ~80%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: 4.1 min
- Total execution time: 31 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-search-infrastructure | 3 | 11min | 3.7min |
| 02-search-api | 2 | 5min | 2.5min |
| 03-typeahead-search | 2 | 15min | 7.5min |

**Recent Trend:**
- Last 5 plans: 2min, 3min, 3min, 3min, 12min
- Trend: 03-02 took longer due to post-checkpoint fixes (DaisyUI, deep links, access control)

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
- DaisyUI v5 flex input pattern: Use `<label class="input">` as flex container, not absolute positioning for icons (03-02)
- Deep link query params for entity URLs: Portal uses `?candidateId=x` not `/candidates/:id` path segments (03-02)
- Marketplace entity visibility: Candidates, jobs, companies, recruiters visible to all; applications/placements company-scoped (03-02)
- orgWideOrganizationIds on AccessContext: Distinguishes org-wide from company-scoped memberships for proper search filtering (03-02)

### Pending Todos

None.

### Blockers/Concerns

~~**Phase 1 prerequisite:** Recruiters table needs ILIKE→tsvector migration before trigger sync can be implemented. This is part of INFRA-09 and must be completed early in Phase 1.~~ **RESOLVED** (01-01): Recruiters now using tsvector search.

**Phase 1 Complete:** All 9 INFRA requirements satisfied. All 7 entity types syncing to search.search_index with trigger-based near-real-time updates.

**Phase 2 Complete:** Search API fully wired end-to-end:
- search-service at port 3013 with GET /api/v2/search endpoint
- API gateway proxy with authentication enforcement
- Typeahead mode (top 5 per entity type) and full mode (paginated results)
- Role-based access control via AccessContextResolver
- Structured validation errors (VALIDATION_ERROR code)

**Phase 3 Complete:** Typeahead Search UI fully operational:
- GlobalSearchBar component in portal header with DaisyUI v5 styling
- Grouped dropdown results with icons, highlighted matches, keyboard navigation
- Cmd+K / Ctrl+K shortcut, recent searches, loading/empty states
- Deep link entity URLs (query params, not path segments)
- Company-level access control: marketplace entities visible to all, company-scoped entities filtered by orgWideOrganizationIds + companyIds
- Migration: search_index now has company_id column with correct organization_id values
- Deployment artifacts: Dockerfile, docker-compose, K8s manifests, CI/CD pipelines

**Note:** User must run migration `20260214000001_search_index_company_access_control.sql` in Supabase and rebuild search-service Docker container.

**Next:** Phase 4 - Full Search Page (dedicated /portal/search with filtering and pagination).

## Session Continuity

Last session: 2026-02-14
Stopped at: Phase 3 closed out, ready for Phase 4 planning
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-02-14*
