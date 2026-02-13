# Project Milestones: Splits Network

## v3.0 Platform Admin Restructure (Shipped: 2026-02-13)

**Delivered:** Platform admin restructured from org-scoped role (memberships + synthetic platform org) to system-level role (user_roles with nullable entity_id), with zero downstream consumer impact and full cleanup of legacy data.

**Phases completed:** 4-7 (6 plans total)

**Key accomplishments:**

- Nullable role_entity_id in user_roles with split partial unique indexes handling NULL correctly
- Atomic data migration from memberships to user_roles with RAISE EXCEPTION validation gate (zero data loss)
- resolveAccessContext reads platform_admin from user_roles via existing deduplicated roles union — zero code logic changes needed
- Identity-service SYSTEM_ROLES conditional validation for system-level vs entity-linked roles
- FK-safe cleanup migration removing synthetic platform organization and legacy memberships
- Full TypeScript type alignment across shared-types, shared-clients, shared-access-context

**Stats:**

- 8 code files created/modified
- 275 lines of TypeScript + SQL
- 4 phases, 6 plans
- ~19 minutes execution time (2026-02-13)

**Git range:** `47f0e22e` → `d4b88fa2`

**What's next:** TBD — next milestone

---

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
