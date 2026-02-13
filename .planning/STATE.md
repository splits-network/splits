# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-12)

**Core value:** Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.
**Current focus:** Phase 1 - Search Infrastructure

## Current Position

Phase: 1 of 4 (Search Infrastructure)
Plan: 3 of 3 in current phase
Status: Phase complete
Last activity: 2026-02-13 — Completed 01-03-PLAN.md (Relational Entity Search Triggers)

Progress: [███░░░░░░░] ~30%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 4 min
- Total execution time: 11 minutes

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-search-infrastructure | 3 | 11min | 3.7min |

**Recent Trend:**
- Last 5 plans: 2min, 1min, 8min
- Trend: Consistent (relational entities required more complex cross-table JOINs)

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

### Pending Todos

None yet.

### Blockers/Concerns

~~**Phase 1 prerequisite:** Recruiters table needs ILIKE→tsvector migration before trigger sync can be implemented. This is part of INFRA-09 and must be completed early in Phase 1.~~ **RESOLVED** (01-01): Recruiters now using tsvector search.

**Phase 1 Complete:** All 9 INFRA requirements satisfied. All 7 entity types (candidates, jobs, companies, recruiters, applications, placements, recruiter_candidates) now syncing to search.search_index with trigger-based near-real-time updates.

**Next:** Ready for Phase 2 (Search API) - search infrastructure complete, ready to build typeahead and full search endpoints.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 01-03-PLAN.md (Relational Entity Search Triggers) - **PHASE 1 COMPLETE**
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
