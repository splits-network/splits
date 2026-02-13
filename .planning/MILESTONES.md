# Project Milestones: Global Search

## v2.0 Global Search (Shipped: 2026-02-13)

**Delivered:** Full-stack global search from Postgres FTS infrastructure through API to real-time typeahead UI with company-level access control across 7 entity types.

**Phases completed:** 1-3 (7 plans total)

**Key accomplishments:**

- Dedicated `search` schema with unified `search_index` table isolating search reads from live CRUD tables (CQRS pattern)
- Trigger-based near-real-time sync from all 7 entity tables to search_index (candidates, jobs, companies, recruiters, applications, placements, recruiter_candidates)
- Search-service microservice with typeahead (top 5 per type) and full (paginated) modes, role-based access control, and input validation
- Real-time typeahead search bar in portal header with grouped results, keyboard navigation (arrows, Enter, Esc, Ctrl+K), highlighted matches, and recent searches
- Company-level access control distinguishing org-wide vs company-scoped memberships via `orgWideOrganizationIds` on AccessContext
- Deep link entity URL routing for all 7 entity types using query parameter pattern

**Stats:**

- 18 files created/modified
- ~2,570 lines of TypeScript + SQL
- 3 phases, 7 plans
- ~3 hours from start to ship (Feb 12-13, 2026)

**Git range:** `f785b43d` → `b0cf9ee3`

**Dropped from scope:** Phase 4 (Full Search Page) — typeahead covers the core search UX; per-entity list pages handle deep browsing. PAGE-01 through PAGE-04 deferred.

**What's next:** TBD — next milestone

---
