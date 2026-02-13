# Platform Admin Restructure

## What This Is

A restructuring of how platform admin roles are modeled in the Splits Network. Platform admin is now a system-level role stored in the `user_roles` table (with nullable `role_entity_id`), no longer requiring a synthetic "platform" organization in `memberships`. All downstream consumers (resolveAccessContext, identity-service, frontend) work seamlessly with the new model.

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

<!-- v3.0 -->

- Nullable role_entity_id in user_roles for system-level roles — v3.0
- Platform_admin migrated from memberships to user_roles with atomic validation — v3.0
- Synthetic platform organization removed from database — v3.0
- resolveAccessContext reads platform_admin from user_roles (119+ consumers unchanged) — v3.0
- Identity-service accepts platform_admin with nullable entity fields via SYSTEM_ROLES — v3.0
- All 13 frontend isPlatformAdmin checks work without modification — v3.0
- Platform admin grant/revoke publishes enriched audit events via RabbitMQ — v3.0

### Active

(None — next milestone TBD)

### Out of Scope

- Restructuring company_admin/hiring_manager roles — they're legitimately org-scoped, stay in memberships
- Fine-grained permissions system — future milestone
- Role UI/admin panel redesign — just the data model change
- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Search analytics/tracking — defer to future milestone
- Role-entity type validation DB constraint (platform_admin with entity_id) — v3.1
- Shared assignSystemRole() helper — v4+

## Context

**Current role architecture (post-v3.0):**
- `memberships` table: org-scoped roles (company_admin, hiring_manager) — requires organization_id NOT NULL
- `user_roles` table: entity-linked roles (recruiter, candidate) with role_entity_id, and system-level roles (platform_admin) with role_entity_id = NULL
- `resolveAccessContext()` reads from both tables, deduplicates, builds AccessContext with `isPlatformAdmin` flag
- Platform organization no longer exists — removed in v3.0 cleanup

**Key files:**
- `packages/shared-access-context/src/index.ts` — resolveAccessContext
- `services/identity-service/src/v2/` — user/role management (SYSTEM_ROLES constant for conditional validation)
- `apps/portal/src/contexts/user-profile-context.tsx` — frontend role checks
- `supabase/migrations/` — schema definitions

## Constraints

- **Backward compatible**: resolveAccessContext returns `isPlatformAdmin: boolean` — 119+ downstream consumers unchanged
- **Zero downtime**: Migration handled existing platform admin data without breaking active sessions
- **Tech stack**: Postgres migrations, Supabase, existing V2 service patterns
- **Scope**: Only platform_admin moved — company_admin and hiring_manager stay in memberships

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nullable role_entity_id in user_roles | Platform admins don't link to an entity (recruiter/candidate). Nullable is simplest change. | ✓ Good |
| Only platform_admin moves | company_admin and hiring_manager are legitimately org-scoped. No reason to change them. | ✓ Good |
| Remove platform organization entirely | Clean break. No synthetic data in the system. | ✓ Good |
| Split partial unique indexes | Two indexes (entity-linked + platform_admin) to handle NULL values correctly in uniqueness constraints. | ✓ Good |
| Atomic migration validation | RAISE EXCEPTION in DO block aborts transaction on count mismatch. | ✓ Good |
| Minimal code change (EntityRoleRow nullable) | Existing deduplicated roles union already supports dual-read. One type change. | ✓ Good |
| SYSTEM_ROLES constant | Explicit array defining system-level roles. Extensible for future system roles. | ✓ Good |
| Event enrichment for audit | user_role.deleted event includes full context (user_id, role_name, role_entity_id). | ✓ Good |

---
*Last updated: 2026-02-13 after v3.0 milestone complete*
