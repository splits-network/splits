# Project Milestones: Splits Network

## v5.0 Custom GPT / Applicant Network (Shipped: 2026-02-13)

**Delivered:** Full Custom GPT backend enabling candidates to interact with Applicant.Network via natural language in ChatGPT — OAuth2 authentication, job search, resume analysis, application submission with confirmation safety, and production-ready deployment.

**Phases completed:** 11-15 (18 plans total)

**Key accomplishments:**

- New gpt-service microservice with Fastify scaffold, RabbitMQ audit event pipeline, and 4 GPT OAuth database tables
- Full OAuth2 authorization code flow with ES256 JWT signing (jose), PKCE verification, refresh token rotation, and replay detection
- OAuth consent UI in candidate app with auto-approve for returning users, Connected Apps profile management, and Clerk webhook integration for user deletion
- Five GPT action endpoints: job search with multi-filter support, job details, application status, application submission with two-step confirmation safety, and resume analysis via ai-service
- OpenAPI 3.0.1 schema (727 lines) with behavioral descriptions and GPT Instructions document (456 lines) for Career Copilot configuration
- Production-ready deployment: 2-replica K8s manifests, per-user tiered rate limiting (30/10 req/min), 6-hour token cleanup CronJob, svix webhook signature verification

**Stats:**

- 118 files created/modified
- ~17,255 lines of TypeScript + SQL + YAML
- 5 phases, 18 plans
- ~55 minutes execution time (2026-02-13)

**Git range:** `165b8d4d` → `aefb4014`

**What's next:** TBD — next milestone

---

## v4.0 Commute Types & Job Levels (Shipped: 2026-02-13)

**Delivered:** Full-stack commute type (multi-select) and job level (single-select) fields added to the jobs system — from database schema through API filtering to portal UI and search index.

**Phases completed:** 8-10 (5 plans total)

**Key accomplishments:**

- commute_types TEXT[] and job_level TEXT columns with CHECK constraints on jobs table
- CommuteType and JobLevel TypeScript union types with DTO integration across shared-types
- Supabase .overlaps() array filtering for commute_types and .eq() for job_level in ATS service
- Multi-select checkbox group for commute types and dropdown for job level in role wizard
- Human-readable label maps for detail views with conditional card rendering
- Search index enriched with commute_types (JSONB array) and job_level for full-text matching

**Stats:**

- 28 files created/modified
- ~2,131 lines of TypeScript + SQL
- 3 phases, 5 plans
- ~13.5 minutes execution time (2026-02-13)

**Git range:** `e0937205` → `087b3045`

**What's next:** v5.0 Custom GPT (Applicant Network)

---

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
