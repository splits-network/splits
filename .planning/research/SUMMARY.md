# Project Research Summary

**Project:** Splits Network v3.0 Platform Admin Restructure
**Domain:** Database schema refactoring - Role-based access control (RBAC)
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

Platform admin is currently stored in the `memberships` table with a synthetic "platform" organization that has no business meaning. This restructure moves `platform_admin` to the `user_roles` table with nullable entity fields, accurately modeling it as a system-level role rather than an org-scoped role. The migration is straightforward: make `role_entity_id` and `role_entity_type` nullable, migrate platform_admin rows atomically, remove the synthetic platform organization, and update the existing `resolveAccessContext()` function to read from the correct table.

This is a low-risk, high-value cleanup using the project's existing stack (Postgres, Fastify, Vitest) and established migration patterns. The migration requires atomic transaction safety with count validation to prevent losing admin access, careful deployment sequencing (schema → code → data), and coordination with 119+ downstream consumers of `resolveAccessContext()`. No new technologies needed—all tooling already exists.

The primary risk is losing all platform admin access during migration if transaction boundaries aren't properly enforced. Mitigation: single BEGIN/COMMIT block with validation before deletion, dual-read deployment strategy, and documented rollback procedure. With proper validation gates and rollback readiness, this is a one-day migration with zero production downtime.

## Key Findings

### Recommended Stack

**No stack changes required.** This is a database restructure within the existing Postgres/Fastify/Vitest ecosystem. All necessary tooling already exists in the project.

**Core technologies:**
- **Supabase Postgres**: Single database, already supports nullable columns and transactional migrations — no version changes needed
- **Fastify**: Backend services (identity-service handles user-roles APIs) — existing V2 pattern applies
- **Vitest**: Unit testing with mocked repositories — existing test patterns sufficient
- **@supabase/supabase-js**: Database client already used by all services — no changes

**Migration approach:**
- Single SQL migration file with transaction safety (existing pattern from 20260212000001_split_user_roles_into_memberships.sql)
- Multi-step: schema change (DROP NOT NULL) → data migration (INSERT/DELETE) → validation (count check) → cleanup (remove platform org)
- Rollback script prepared before production deploy (reverse all steps)

### Expected Features

**Must have (table stakes):**
- **TS-1: Schema Migration Safety** — Zero-downtime migration with idempotency and reversibility
- **TS-2: Access Context Resolution** — `resolveAccessContext()` finds platform_admin in user_roles with single query
- **TS-3: Platform Admin Assignment API** — identity-service can create/delete platform_admin via POST /v2/user-roles
- **TS-4: Frontend Authorization Guards** — 13 frontend files checking `isPlatformAdmin` continue working
- **TS-5: Unique Constraint Validation** — Prevent duplicate platform_admin per user (partial unique index)
- **TS-6: Soft Delete Consistency** — Revoking admin immediately blocks access (deleted_at filtering)

**Should have (competitive):**
- **DIFF-2: Role-Entity Type Validation** — Database check constraint preventing invalid combinations (platform_admin with entity_id)
- **DIFF-3: Migration Rollback Plan** — Documented procedure for emergency reversal with tested SQL
- **TS-7: Event Audit Trail** — user_role.created/deleted events for platform_admin changes (RabbitMQ)
- **TS-8: Remove Platform Organization** — Delete synthetic org row after migration (cleanup)

**Defer (v2+):**
- **DIFF-4: Service-Level Abstraction** — Shared helper `assignSystemRole()` for centralized validation
- **DIFF-5: Admin Activity Dashboard** — Frontend view showing grant/revoke audit trail with granted_by tracking

### Architecture Approach

The restructure affects three layers: database schema (user_roles table), backend services (identity-service and shared-access-context), and frontend authorization checks (admin layout guards). The migration follows the project's established V2 service pattern with repository-based data access, event-driven audit trail, and role-based access filtering. No new components needed—extend existing identity-service with updated user-roles repository logic.

**Major components:**
1. **Database Migration** — Single SQL file: ALTER TABLE (nullable columns) → INSERT (migrate rows) → DELETE (cleanup memberships) → validation block
2. **shared-access-context Package** — Update `resolveAccessContext()` to query user_roles for platform_admin instead of memberships (119+ downstream consumers depend on this)
3. **identity-service UserRoleServiceV2** — Handle platform_admin creation/deletion with nullable entity_id fields (POST/DELETE /v2/user-roles)
4. **Frontend Authorization Guards** — No changes needed if backend returns correct `is_platform_admin` in user profile

**Integration pattern:**
- Migration runs first (backward compatible—doesn't break existing code)
- Deploy updated shared-access-context (can read from either table during transition)
- Deploy identity-service with updated user-roles logic
- Frontend requires no changes (authorization data structure unchanged)

### Critical Pitfalls

1. **Losing All Platform Admin Access** — Migration fails after deleting from memberships but before inserting into user_roles → complete admin lockout. **Prevention:** Atomic transaction with validation before deletion, verify count match, hard fail if mismatch, keep at least one admin.

2. **Foreign Key Constraint Violations** — Deleting platform organization fails because FK constraints prevent deletion when memberships/companies/invitations reference it. **Prevention:** Check FK references first, delete memberships before org, use conditional DELETE with NOT IN subquery.

3. **Race Condition During Deployment** — Migration completes but some service instances read old schema (memberships) while data already moved → intermittent 403 errors. **Prevention:** Dual-read deployment (union of both tables), then data migration, then remove dual-read.

4. **NOT NULL Constraint Blocks INSERT** — Migration attempts INSERT with role_entity_id=NULL but column has NOT NULL constraint → immediate failure. **Prevention:** ALTER TABLE to DROP NOT NULL before data migration in same transaction.

5. **Unique Constraint Handling** — Postgres treats NULL as distinct in unique indexes, allowing duplicate platform_admin rows. **Prevention:** Add partial unique index `(user_id, role_name) WHERE role_name='platform_admin'`.

## Implications for Roadmap

Based on research, this restructure decomposes into 4 sequential phases with clear dependencies:

### Phase 1: Schema & Repository Updates
**Rationale:** Database schema changes must happen before data migration. Repository code can deploy alongside schema (backward compatible).

**Delivers:**
- Migration file: make role_entity_id/role_entity_type nullable
- Add partial unique index for platform_admin uniqueness
- Update identity-service UserRoleRepositoryV2 to handle nullable fields
- Unit tests for nullable entity_id scenarios

**Addresses:** TS-5 (Unique Constraint), avoids Pitfall #4 (NOT NULL constraint), avoids Pitfall #5 (duplicate detection)

**Research needed:** No—straightforward ALTER TABLE and repository method updates

---

### Phase 2: Data Migration with Validation
**Rationale:** After schema supports nullable columns, migrate data atomically with validation gates.

**Delivers:**
- Transactional migration: INSERT platform_admin → validate counts → DELETE from memberships
- Validation block: verify user_id matching, not just counts
- Idempotent INSERT with ON CONFLICT DO NOTHING
- Verification queries for post-migration smoke test

**Addresses:** TS-1 (Migration Safety), TS-6 (Soft Delete), avoids Pitfall #1 (admin lockout), Pitfall #3 (race condition), Pitfall #9 (content validation)

**Research needed:** No—follows existing migration patterns from 20260212000001

---

### Phase 3: Access Context & Service Integration
**Rationale:** After data migrated, update resolveAccessContext and identity-service APIs to read from user_roles.

**Delivers:**
- Update shared-access-context to query user_roles for platform_admin
- Update identity-service POST/DELETE /v2/user-roles for platform_admin assignment
- Event publishing: user_role.created/deleted for audit trail
- API tests for platform_admin creation via identity-service

**Addresses:** TS-2 (Access Context), TS-3 (API Assignment), TS-7 (Event Audit), avoids Pitfall #3 (race condition)

**Research needed:** No—extends existing V2 service pattern

---

### Phase 4: Cleanup & Validation
**Rationale:** After code deployed and validated, remove synthetic platform organization and verify all downstream consumers.

**Delivers:**
- Delete platform organization after FK reference check
- Frontend smoke test: admin user can access admin routes
- Backend smoke test: resolveAccessContext returns isPlatformAdmin=true
- Rollback documentation and tested rollback script

**Addresses:** TS-4 (Frontend Guards), TS-8 (Remove Platform Org), DIFF-3 (Rollback Plan), avoids Pitfall #2 (FK violations), Pitfall #11 (no rollback plan)

**Research needed:** No—validation and cleanup

---

### Phase Ordering Rationale

- **Schema before data:** Cannot INSERT NULL into NOT NULL column—must ALTER TABLE first
- **Validation gates between phases:** Each phase verifies correctness before proceeding (prevents cascading failures)
- **Dual-read deployment:** Code can read from both tables during transition (avoids race conditions)
- **Cleanup last:** Removing platform org only after all services updated (prevents FK violations)

**Deployment sequence:**
1. Phase 1 (schema + repository) → backward compatible, doesn't break existing code
2. Phase 2 (data migration) → can run against updated schema, validates before committing
3. Phase 3 (access context + service) → activates new behavior, dual-read prevents 403s
4. Phase 4 (cleanup + validation) → removes scaffolding, confirms system health

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard ALTER TABLE and repository updates—well-documented Postgres DDL
- **Phase 2:** Follows existing migration patterns (20260212000001)—no novel techniques
- **Phase 3:** Extends existing V2 service pattern—no new architecture
- **Phase 4:** Cleanup and validation—straightforward verification queries

**All phases can proceed directly to planning.** No deeper research needed—all patterns established in codebase.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | No new technologies—uses existing Postgres, Fastify, Vitest. Migration pattern proven in 15+ existing migrations. |
| Features | HIGH | All features derived from codebase analysis. Table stakes identified via grep of isPlatformAdmin usage (119 occurrences). |
| Architecture | HIGH | Direct inspection of shared-access-context and identity-service. Integration points documented in CLAUDE.md. |
| Pitfalls | HIGH | Critical pitfalls grounded in existing migrations (20260212000001) and Postgres transaction semantics. FK constraints verified in baseline.sql. |

**Overall confidence:** HIGH

### Gaps to Address

- **Platform organization UUID:** Must query production to confirm platform org ID before migration (likely `SELECT id FROM organizations WHERE type='platform'`)
- **Current admin count:** Verify how many platform admins exist in production (affects validation thresholds)
- **FK references to platform org:** Check if companies.identity_organization_id or invitations.organization_id reference platform org (determines if org deletion is safe)
- **Deployment coordination:** Confirm Kubernetes rolling restart timing to avoid stale service instances reading wrong table

**Resolution during planning:**
- Phase 1 planning: Query staging database for platform org details
- Phase 2 planning: Document current admin count for validation
- Phase 4 planning: Script FK reference check before org deletion

## Sources

### Primary (HIGH confidence)
- `packages/shared-access-context/src/index.ts` — resolveAccessContext implementation (lines 66-162, 119-122, 152)
- `services/identity-service/src/v2/memberships/service.ts` — platform admin authorization checks
- `services/identity-service/src/v2/user-roles/service.ts` — entity role management patterns
- `supabase/migrations/20260211000003_create_user_roles_table.sql` — user_roles schema with NOT NULL constraints
- `supabase/migrations/20260212000001_split_user_roles_into_memberships.sql` — reference migration showing validation patterns, transaction safety
- `supabase/migrations/20240101000000_baseline.sql` — organizations table, FK constraints
- `.planning/PROJECT.md` — milestone context and requirements
- `CLAUDE.md` — V2 architecture rules, no HTTP between services, single database

### Secondary (MEDIUM confidence)
- PostgreSQL documentation (ALTER TABLE, NULL handling in unique indexes, transaction semantics)
- Kubernetes rolling deployment patterns (service restart coordination)
- Vitest mocking patterns (identity-service/tests/unit/invitations.service.test.ts as template)

### Tertiary (LOW confidence - needs validation)
- Platform organization ID (assumed to exist, must verify in production)
- Current count of platform admins (unknown, must query before migration)
- FK references to platform org (baseline.sql shows structure, but runtime data unknown)

---

**Research completed:** 2026-02-13
**Ready for roadmap:** Yes
**Recommended timeline:** 1 week (4 phases, ~1-2 days each with testing/validation)
