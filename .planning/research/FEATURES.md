# Feature Landscape: Role Model Restructure

**Domain:** SaaS multi-tenant RBAC with system-level, org-scoped, and entity-linked roles
**Researched:** 2026-02-13
**Confidence:** HIGH (based on codebase analysis)

## Executive Summary

This research documents features required to successfully move `platform_admin` from the org-scoped `memberships` table to the entity-linked `user_roles` table with nullable entity fields. The restructure affects database schema, access resolution logic, identity service APIs, and frontend authorization checks.

**Current state:**
- `memberships`: org-scoped roles (platform_admin, company_admin, hiring_manager) — organization_id NOT NULL
- `user_roles`: entity-linked roles (recruiter, candidate) — role_entity_id NOT NULL
- Synthetic "platform" organization exists solely for platform admin membership rows

**Target state:**
- `memberships`: org-scoped roles (company_admin, hiring_manager) — organization_id NOT NULL
- `user_roles`: all non-org roles (platform_admin, recruiter, candidate) — role_entity_id nullable
- No synthetic platform organization

---

## Table Stakes

Features that MUST work correctly after the restructure. Missing any of these means the system is broken.

### TS-1: Schema Migration Safety
**What:** Database migration that makes role_entity_id nullable, moves platform_admin rows, removes platform org
**Why Expected:** Zero-downtime requirement. Cannot break existing platform admin sessions or access checks.
**Complexity:** Medium
**Dependencies:** None
**Notes:**
- Migration must be idempotent and reversible
- Preserve all platform_admin assignments during migration
- Validate counts before and after (source rows = migrated rows)
- Handle edge cases: null fields, duplicate assignments, soft-deleted rows

**Acceptance Criteria:**
- Migration runs without errors on existing data
- All platform admin users retain their role
- No orphaned rows in either table
- All NOT NULL constraints valid after migration

---

### TS-2: Access Context Resolution Correctness
**What:** `resolveAccessContext()` finds platform_admin in user_roles instead of memberships
**Why Expected:** Core authorization primitive. Every service uses this 119+ times.
**Complexity:** Low
**Dependencies:** TS-1 (schema migration must complete first)
**Notes:**
- `resolveAccessContext()` currently queries both memberships + user_roles
- Must continue returning `isPlatformAdmin: boolean` (backward compatible)
- Query performance must not degrade (single round-trip maintained)
- Other context fields (organizationIds, roles[], etc.) unchanged

**Acceptance Criteria:**
- `isPlatformAdmin` correctly true for users with platform_admin in user_roles
- Query still uses single Supabase round-trip (nested select)
- All 119 downstream consumers work without changes
- No performance regression (measure with EXPLAIN ANALYZE)

---

### TS-3: Platform Admin Assignment via API
**What:** identity-service can create/delete platform_admin role assignments via user_roles table
**Why Expected:** Must be able to grant/revoke platform admin access programmatically.
**Complexity:** Low
**Dependencies:** TS-1, TS-2
**Notes:**
- Currently uses MembershipServiceV2.createMembership() with synthetic platform org
- Must migrate to UserRoleServiceV2.createUserRole() with nullable entity fields
- Only platform_admin users can assign platform_admin (self-check before assignment)
- Events: `user_role.created` and `user_role.deleted` for audit trail

**Acceptance Criteria:**
- POST /v2/user-roles creates platform_admin with role_entity_id=null
- DELETE /v2/user-roles/:id soft-deletes platform_admin assignment
- Authorization check: caller must be platform_admin
- Events published for audit trail

---

### TS-4: Frontend Authorization Guards
**What:** Portal admin routes and components check `is_platform_admin` from user profile
**Why Expected:** 13 frontend files depend on isPlatformAdmin checks. All must work correctly.
**Complexity:** Low
**Dependencies:** TS-2 (access context must resolve correctly)
**Notes:**
- `/apps/portal/src/app/portal/admin/layout.tsx` blocks non-admins
- UserProfileContext exposes `isAdmin` computed from `profile.is_platform_admin`
- No frontend changes needed if backend returns correct data structure
- Test: admin routes accessible to admins, blocked for non-admins

**Acceptance Criteria:**
- Admin layout redirects non-admins to /portal/dashboard
- UserProfileContext.isAdmin reflects platform_admin status
- No console errors or broken UI in admin pages
- Dev debug panel shows correct role information

---

### TS-5: Unique Constraint Validation
**What:** Prevent duplicate platform_admin assignments to same user
**Why Expected:** Data integrity. Each user can only have platform_admin once.
**Complexity:** Low
**Dependencies:** TS-1
**Notes:**
- Current memberships table: unique index on (user_id, role_name, org_id, company_id)
- user_roles must enforce: unique (user_id, role_name, role_entity_id) where deleted_at IS NULL
- Platform admin: role_entity_id=null, so index covers (user_id, 'platform_admin', null)
- Postgres treats NULL as distinct, so COALESCE may be needed in unique index

**Acceptance Criteria:**
- Attempting to create duplicate platform_admin for same user fails with unique constraint error
- Index name: `uq_user_role_entity_assignment`
- Query plan shows index usage for insert validation

---

### TS-6: Soft Delete Consistency
**What:** Soft-deleted platform_admin rows excluded from access resolution
**Why Expected:** Revoking platform admin must immediately block access.
**Complexity:** Low
**Dependencies:** TS-1, TS-2
**Notes:**
- user_roles has deleted_at TIMESTAMPTZ column
- resolveAccessContext filters: `.is('user_roles.deleted_at', null)`
- Soft delete sets deleted_at = now(), leaving row in table
- Unique index excludes deleted rows: `WHERE deleted_at IS NULL`

**Acceptance Criteria:**
- Soft-deleted platform_admin no longer appears in resolveAccessContext
- User immediately loses admin access after soft delete
- Unique constraint allows re-granting same role after soft delete

---

### TS-7: Event Audit Trail
**What:** user_role.created and user_role.deleted events logged for platform_admin changes
**Why Expected:** Compliance and security. Granting/revoking platform admin must be auditable.
**Complexity:** Low
**Dependencies:** TS-3
**Notes:**
- EventPublisherV2 publishes to RabbitMQ
- notification-service may send email alerts on platform admin changes
- Events include: user_role_id, user_id, role_name, role_entity_id, timestamp

**Acceptance Criteria:**
- Creating platform_admin publishes `user_role.created` event
- Soft-deleting platform_admin publishes `user_role.deleted` event
- Events visible in RabbitMQ management UI
- Event payload includes all required fields

---

### TS-8: Remove Synthetic Platform Organization
**What:** Delete the organization row where type='platform' after migration
**Why Expected:** Cleanup artificial scaffolding. No business logic should depend on platform org.
**Complexity:** Low
**Dependencies:** TS-1 (migration must move all memberships first)
**Notes:**
- Verify no foreign key references remain before deletion
- Check: no jobs, applications, invitations, or other entities linked to platform org
- Deletion should be final migration step after all memberships moved

**Acceptance Criteria:**
- Platform organization row deleted from organizations table
- No foreign key constraint violations
- No business logic breaks (search for "platform" org references in code)

---

## Differentiators

Features that improve the role model beyond the minimum required for platform_admin migration. Nice-to-have, not blocking.

### DIFF-1: Role Definition Validation
**What:** Enforce allowed role_name values via foreign key to roles table
**Why Valuable:** Type safety at database level. Prevents typos and invalid role assignments.
**Complexity:** Low
**Notes:**
- user_roles.role_name references roles.name (already exists)
- roles table defines: platform_admin, company_admin, hiring_manager, recruiter, candidate
- Foreign key constraint prevents inserting invalid role names
- Already implemented in current schema

**Implementation:** Already exists — no additional work needed.

---

### DIFF-2: Role-Entity Type Validation
**What:** Database check constraint: if role_entity_id is NOT NULL, role_name must be recruiter or candidate
**Why Valuable:** Prevents invalid combinations like platform_admin with entity_id.
**Complexity:** Medium
**Notes:**
- Check constraint: `(role_entity_id IS NULL AND role_name IN ('platform_admin')) OR (role_entity_id IS NOT NULL AND role_name IN ('recruiter', 'candidate'))`
- Org-scoped roles (company_admin, hiring_manager) stay in memberships, so not included in user_roles constraint
- Provides compile-time-like guarantees at database level

**Recommendation:** Implement during migration — adds robustness with minimal complexity.

---

### DIFF-3: Migration Rollback Plan
**What:** Documented rollback procedure if migration causes production issues
**Why Valuable:** Risk mitigation. Enables quick recovery if unforeseen issues arise.
**Complexity:** Low
**Notes:**
- Save pre-migration snapshot of memberships and user_roles tables
- Documented SQL to reverse migration: move platform_admin back to memberships, restore platform org
- Test rollback procedure in staging before production deployment

**Recommendation:** Document in migration comments — standard best practice.

---

### DIFF-4: Service-Level Role Assignment Abstraction
**What:** Shared helper function: `assignSystemRole(userId, roleName)` for platform_admin grants
**Why Valuable:** Simplifies service code. Single place to enforce assignment rules.
**Complexity:** Low
**Notes:**
- Centralizes validation: caller must be platform_admin, target user exists, no duplicate assignment
- Used by identity-service, potentially by automation-service for automated role grants
- Returns standardized error codes for common failure cases

**Recommendation:** Defer to post-migration cleanup — not required for initial migration.

---

### DIFF-5: Admin Activity Dashboard
**What:** Frontend view showing recent platform_admin role grants/revokes with audit trail
**Why Valuable:** Transparency and governance. Admins can see who granted admin access and when.
**Complexity:** Medium
**Notes:**
- Queries user_roles with role_name='platform_admin', joins to users table for names
- Shows: granted_to, granted_by, granted_at, revoked_at
- Requires tracking "granted_by" user_id in user_roles table (new column)

**Recommendation:** Defer to future milestone — nice governance feature but not essential for migration.

---

## Anti-Features

Features to explicitly NOT build during this restructure. Common mistakes to avoid.

### ANTI-1: Migrating Company Admin to user_roles
**What:** Moving company_admin and hiring_manager to user_roles alongside platform_admin
**Why Avoid:** company_admin and hiring_manager are legitimately org-scoped. They require organization_id context.
**What to Do Instead:** Leave them in memberships table. Only platform_admin moves to user_roles.
**Consequences if Built:** Breaks org-scoped access control. Would need to add organization_id back to user_roles, defeating the purpose.

---

### ANTI-2: Making role_entity_id NOT NULL
**What:** Keeping role_entity_id as NOT NULL and requiring platform_admin to reference a fake entity
**Why Avoid:** Creates artificial data (fake "system" entity). Nullable is semantically correct for system roles.
**What to Do Instead:** Make role_entity_id nullable. platform_admin has role_entity_id=null.
**Consequences if Built:** Technical debt. Another synthetic entity to maintain (like platform org currently).

---

### ANTI-3: Separate System Roles Table
**What:** Creating a third table (system_roles) for platform_admin only
**Why Avoid:** Adds complexity. Now three tables for roles instead of two. Access context query becomes more complex.
**What to Do Instead:** Use existing user_roles table with nullable entity fields. Simple and fits existing patterns.
**Consequences if Built:** More code to maintain, slower queries (three-way join), harder to reason about.

---

### ANTI-4: Removing isPlatformAdmin Flag from AccessContext
**What:** Forcing consumers to check `roles.includes('platform_admin')` instead of `isPlatformAdmin` boolean
**Why Avoid:** Breaks 119 downstream consumers. Violates backward compatibility requirement.
**What to Do Instead:** Keep `isPlatformAdmin` computed field in AccessContext. Internal implementation changes, interface stable.
**Consequences if Built:** Massive refactor across all services. High risk of introducing authorization bugs.

---

### ANTI-5: Runtime Role Hierarchy System
**What:** Implementing role inheritance or permission composition (e.g., platform_admin inherits company_admin permissions)
**Why Avoid:** Out of scope. Current system uses explicit role checks, not computed permissions.
**What to Do Instead:** Maintain existing explicit role checks. Permissions JSONB in roles table is unused (future feature).
**Consequences if Built:** Scope creep. Would require rewriting all authorization checks across all services.

---

### ANTI-6: Eager Loading All Role Details
**What:** Joining to roles table in resolveAccessContext to include display_name, description, permissions
**Why Avoid:** Performance. resolveAccessContext is called on every API request. Must stay fast.
**What to Do Instead:** Return only role_name strings as array. Services can fetch role details separately if needed.
**Consequences if Built:** Slower access context resolution. Increased database load. No clear benefit.

---

## Feature Dependencies

```
Migration Flow:

TS-1 (Schema Migration)
  ↓
TS-2 (Access Context Resolution)
  ↓
TS-3 (API Assignment) + TS-4 (Frontend Guards) + TS-5 (Unique Constraint)
  ↓
TS-6 (Soft Delete) + TS-7 (Event Audit) + TS-8 (Remove Platform Org)

Optional Enhancements (post-migration):

DIFF-2 (Role-Entity Validation) — during TS-1
DIFF-3 (Rollback Plan) — before production deployment
DIFF-4 (Role Assignment Helper) — after TS-3
DIFF-5 (Admin Dashboard) — future milestone
```

**Critical Path:** TS-1 → TS-2 → TS-3/TS-4 must complete in order. Others can be done in parallel once dependencies met.

**Validation Checkpoints:**
1. After TS-1: Run data validation query to confirm all platform_admin rows migrated
2. After TS-2: Run test suite against resolveAccessContext with platform_admin users
3. After TS-3: Manually test creating/deleting platform_admin via API
4. After TS-4: Manually test admin portal access with admin and non-admin users

---

## MVP Recommendation

For MVP (minimum viable migration), prioritize:

1. **TS-1: Schema Migration Safety** — Foundation. Must be bulletproof.
2. **TS-2: Access Context Resolution** — Core authorization. Everything depends on this.
3. **TS-3: Platform Admin Assignment** — Must be able to manage admins programmatically.
4. **TS-4: Frontend Authorization Guards** — User-facing. Must work correctly.
5. **TS-5: Unique Constraint Validation** — Data integrity. Prevents bad states.
6. **TS-6: Soft Delete Consistency** — Security. Revoked access must be immediate.
7. **DIFF-2: Role-Entity Type Validation** — Low complexity, high value. Do during migration.
8. **DIFF-3: Migration Rollback Plan** — Risk mitigation. Document before production.

**Defer to post-MVP:**
- TS-7: Event Audit Trail (nice-to-have, not blocking)
- TS-8: Remove Platform Org (cleanup, can wait)
- DIFF-4: Service-Level Abstraction (code quality, not functional)
- DIFF-5: Admin Dashboard (governance feature, future milestone)

**Estimated complexity:**
- Total table stakes: 6 low + 2 medium = ~3-5 days implementation + testing
- Recommended differentiators: 1 low + 1 medium = +1 day
- **MVP timeline: ~1 week** (includes migration testing, staging validation, production deployment)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration fails mid-execution | Low | Critical | Idempotent migration, transaction boundaries, rollback plan |
| Access context query performance degrades | Low | High | Profile queries, EXPLAIN ANALYZE, index validation |
| Downstream service breaks due to schema change | Medium | High | Backward compatible interface (isPlatformAdmin stays), comprehensive testing |
| Platform org deletion cascades unexpectedly | Low | Medium | Check foreign keys before deletion, dry-run in staging |
| Duplicate platform_admin assignments created | Low | Low | Unique constraint at database level |
| Soft delete not respected in some code paths | Medium | High | Grep for user_roles queries, ensure deleted_at filters everywhere |

**Highest risk items:**
1. **Access context resolution correctness** — 119 consumers depend on this working correctly
2. **Migration data integrity** — Cannot lose or corrupt platform_admin assignments
3. **Soft delete consistency** — Security vulnerability if forgotten in any query

**Recommended pre-production testing:**
- Run migration on staging database with production-like data volume
- Load test access context resolution with 1000+ concurrent requests
- Manual QA: admin user can access admin pages, non-admin redirected
- Negative test: soft-deleted platform_admin immediately loses access

---

## Sources

**PRIMARY SOURCES (codebase analysis):**

- `packages/shared-access-context/src/index.ts` — resolveAccessContext implementation (HIGH confidence)
- `supabase/migrations/20260212000001_split_user_roles_into_memberships.sql` — current schema (HIGH confidence)
- `supabase/migrations/20260211000003_create_user_roles_table.sql` — user_roles table definition (HIGH confidence)
- `supabase/migrations/20260211000002_create_roles_table.sql` — roles table with permissions (HIGH confidence)
- `services/identity-service/src/v2/memberships/service.ts` — membership management (HIGH confidence)
- `services/identity-service/src/v2/user-roles/service.ts` — user role management (HIGH confidence)
- `apps/portal/src/contexts/user-profile-context.tsx` — frontend authorization (HIGH confidence)
- `apps/portal/src/app/portal/admin/layout.tsx` — admin route guards (HIGH confidence)
- `.planning/PROJECT.md` — migration requirements and context (HIGH confidence)

**ARCHITECTURAL PATTERNS:**

- Multi-tenant RBAC with three role scopes: system (platform_admin), org (company_admin/hiring_manager), entity (recruiter/candidate)
- Single database with two role tables: memberships (org-scoped), user_roles (entity-linked)
- Access resolution via nested Supabase query joining users → memberships + user_roles
- Soft delete pattern with deleted_at column and WHERE filters
- Event-driven audit trail via RabbitMQ (EventPublisherV2)

**CONFIDENCE ASSESSMENT:**

All features derived from direct codebase analysis. No external sources required. Architectural patterns validated by examining actual implementation files and database schemas. **Overall confidence: HIGH**.
