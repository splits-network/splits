# Roadmap: v3.0 Platform Admin Restructure

## Overview

This milestone restructures platform admin from an organization-scoped role (stored in memberships table with synthetic platform org) to a system-level role (stored in user_roles table with nullable entity fields). The journey: migrate database schema to support nullable columns, atomically migrate existing platform_admin data with validation gates, update shared-access-context and identity-service to read/write from the correct table, and finally clean up the synthetic platform organization. Zero downtime, backward compatible, 119+ downstream consumers unchanged.

## Phases

**Phase Numbering:**
- Integer phases (4, 5, 6): Planned milestone work (continues from v2.0 Global Search)
- Decimal phases (5.1, 5.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 4: Schema & Data Migration** - Make user_roles support platform_admin, migrate data atomically
- [x] **Phase 5: Access Integration** - Update resolveAccessContext and identity-service APIs
- [ ] **Phase 6: Cleanup & Validation** - Remove platform org, validate all consumers

## Phase Details

### Phase 4: Schema & Data Migration
**Goal**: Platform admin data migrated from memberships to user_roles with zero downtime and full validation
**Depends on**: Nothing (starts v3.0 milestone)
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03
**Success Criteria** (what must be TRUE):
  1. role_entity_id is nullable in user_roles table (role_entity_type was already dropped)
  2. Partial unique index prevents duplicate platform_admin rows per user
  3. All existing platform admins have matching rows in user_roles (count validation passed)
  4. Revoking platform_admin via deleted_at immediately blocks access in queries
  5. Migration is reversible with documented rollback SQL
**Plans**: 1 plan

Plans:
- [x] 04-01-PLAN.md — Schema change (nullable role_entity_id), index restructuring, platform_admin data migration with atomic validation

### Phase 5: Access Integration
**Goal**: All backend services and frontend checks use user_roles for platform_admin authorization
**Depends on**: Phase 4
**Requirements**: ACCESS-01, ACCESS-02, ACCESS-03, AUDIT-01
**Success Criteria** (what must be TRUE):
  1. resolveAccessContext() queries user_roles for platform_admin and returns isPlatformAdmin: true
  2. identity-service POST/DELETE /v2/user-roles accepts platform_admin with nullable entity fields
  3. Platform admin grant/revoke publishes user_role.created/deleted events to RabbitMQ
  4. All 13 frontend files checking isPlatformAdmin continue working without code changes
  5. 119+ downstream consumers of resolveAccessContext receive correct authorization context
**Plans**: 2 plans

Plans:
- [x] 05-01-PLAN.md — Update resolveAccessContext to handle platform_admin from user_roles with nullable role_entity_id
- [x] 05-02-PLAN.md — Update identity-service user-roles API to accept platform_admin with null entity fields, enrich audit events

### Phase 6: Cleanup & Validation
**Goal**: Synthetic platform organization removed, system health validated
**Depends on**: Phase 5
**Requirements**: AUDIT-02
**Success Criteria** (what must be TRUE):
  1. Platform organization (type='platform') deleted from organizations table
  2. All memberships referencing platform organization deleted
  3. Platform admin user can access admin routes in frontend (smoke test passed)
  4. resolveAccessContext returns isPlatformAdmin=true for test admin (backend smoke test passed)
  5. No foreign key violations during platform org deletion
**Plans**: 2 plans

Plans:
- [ ] 06-01-PLAN.md — Create cleanup migration (delete platform org + legacy memberships), update TypeScript types and JSDoc
- [ ] 06-02-PLAN.md — Apply migration and smoke test platform admin access (frontend + backend verification)

## Progress

**Execution Order:**
Phases execute in numeric order: 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 4. Schema & Data Migration | 1/1 | Complete | 2026-02-13 |
| 5. Access Integration | 2/2 | Complete | 2026-02-13 |
| 6. Cleanup & Validation | 0/2 | Not started | - |
