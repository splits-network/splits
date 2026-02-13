# Platform Admin Restructure

## What This Is

A restructuring of how platform admin roles are modeled in the Splits Network. Currently, platform admins must be assigned via the `memberships` table which requires a synthetic "platform" organization. This milestone moves platform admin to the `user_roles` table (with nullable entity fields), removes the artificial platform organization, and updates all downstream consumers (resolveAccessContext, identity-service, frontend).

## Core Value

Platform admin is a system-level role assigned directly to a user — no organization membership required.

## Requirements

### Validated

<!-- From previous milestones -->

- Per-entity full-text search with tsvector columns on 7 tables — existing
- Unified search.search_index table with trigger-based sync — v2.0
- Real-time typeahead search bar in portal header — v2.0
- Role-based filtering via resolveAccessContext() — v2.0
- Keyboard navigation (Cmd/Ctrl+K) for global search — v2.0
- Org-scoped roles (company_admin, hiring_manager) via memberships table — existing
- Entity-linked roles (recruiter, candidate) via user_roles table — existing

### Active

- [ ] Make role_entity_id and role_entity_type nullable in user_roles
- [ ] Migrate platform_admin rows from memberships to user_roles
- [ ] Remove synthetic "platform" organization (type='platform')
- [ ] Update resolveAccessContext to find platform_admin in user_roles
- [ ] Update identity-service platform admin assignment/lookup
- [ ] Update frontend admin checks if affected

### Out of Scope

- Restructuring company_admin/hiring_manager roles — they're legitimately org-scoped, stay in memberships
- Fine-grained permissions system — future milestone
- Role UI/admin panel redesign — just the data model change
- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Search analytics/tracking — defer to future milestone

## Context

**Current role architecture:**
- `memberships` table: org-scoped roles (platform_admin, company_admin, hiring_manager) — requires organization_id NOT NULL
- `user_roles` table: entity-linked roles (recruiter, candidate) — requires role_entity_id NOT NULL
- A synthetic "platform" organization (type='platform') exists solely so platform admins can have a memberships row
- `resolveAccessContext()` joins both tables to build AccessContext with `isPlatformAdmin` flag

**Problem:** Platform admin is a system-level concept, not an org-level one. The platform organization is artificial scaffolding that shouldn't exist.

**Key files:**
- `packages/shared-access-context/src/index.ts` — resolveAccessContext
- `services/identity-service/src/v2/` — user/role management
- `apps/portal/src/contexts/user-profile-context.tsx` — frontend role checks
- `supabase/migrations/` — schema definitions

## Constraints

- **Backward compatible**: resolveAccessContext must continue returning `isPlatformAdmin: boolean` — downstream consumers unchanged
- **Zero downtime**: Migration must handle existing platform admin data without breaking active sessions
- **Tech stack**: Postgres migrations, Supabase, existing V2 service patterns
- **Scope**: Only platform_admin moves — company_admin and hiring_manager stay in memberships

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nullable role_entity_id in user_roles | Platform admins don't link to an entity (recruiter/candidate). Nullable is simplest change. | — Pending |
| Only platform_admin moves | company_admin and hiring_manager are legitimately org-scoped. No reason to change them. | — Pending |
| Remove platform organization entirely | Clean break. No synthetic data in the system. | — Pending |

---
*Last updated: 2026-02-13 after v3.0 milestone start*
