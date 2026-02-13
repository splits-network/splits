# Technology Stack for Platform Admin Restructure

**Project:** Splits Network v3.0 Platform Admin Restructure
**Researched:** 2026-02-13
**Confidence:** HIGH

## Overview

This is a **focused database restructure** within an established tech stack. The goal is to safely migrate platform_admin role from the memberships table to user_roles table while making role_entity_id/role_entity_type nullable. No new technologies are needed — this research focuses on migration strategies within the existing Postgres/Fastify/Vitest stack.

## Existing Stack (No Changes Needed)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| Supabase Postgres | Latest | Single database, public schema | Already in use |
| Fastify | ^5.6.2 | Backend services (identity-service) | Already in use |
| Vitest | ^3.0.0 | Unit testing | Already in use |
| @supabase/supabase-js | ^2.86.2 | Database client | Already in use |

**Why no additions:** The restructure is a pure database schema change with service layer updates. All necessary tooling already exists.

## Migration Strategy (Postgres-Specific)

### 1. Schema Changes

**Approach: Multi-step migration with transactional safety**

The migration requires three schema modifications:
1. Make `user_roles.role_entity_id` nullable (currently NOT NULL)
2. Make `user_roles.role_entity_type` nullable (currently has values)
3. Remove NOT NULL constraint on memberships (if any blocking constraints exist)

**Postgres Commands:**
```sql
BEGIN;

-- Step 1: Remove NOT NULL constraint
ALTER TABLE public.user_roles ALTER COLUMN role_entity_id DROP NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN role_entity_type DROP NOT NULL;

-- Step 2: Update comments to reflect new usage
COMMENT ON COLUMN public.user_roles.role_entity_id IS
  'Links to domain entity: recruiters.id when role_name=recruiter, candidates.id when role_name=candidate, NULL for platform_admin';
COMMENT ON COLUMN public.user_roles.role_entity_type IS
  'Type of entity: recruiter, candidate, or NULL for platform_admin';

COMMIT;
```

**Why this works:**
- Postgres allows ALTER TABLE to drop NOT NULL instantly (no table rewrite needed)
- Existing rows (recruiter/candidate) maintain their entity_id values
- New rows (platform_admin) can insert with NULL
- Zero downtime — no data movement at this stage

**Confidence:** HIGH — Standard Postgres DDL operation, observed in existing migrations (20260212000001_split_user_roles_into_memberships.sql drops columns safely)

### 2. Data Migration Pattern

**Approach: Safe row movement with validation**

Based on project's established migration pattern (seen in 20260212000001_split_user_roles_into_memberships.sql and 20260201000004_create_recruiter_companies_table.sql), use this structure:

```sql
BEGIN;

-- Step 1: Migrate platform_admin rows from memberships → user_roles
INSERT INTO public.user_roles (
    id,              -- Preserve original ID for traceability
    user_id,
    role_name,
    role_entity_id,  -- NULL for platform_admin
    role_entity_type, -- NULL for platform_admin
    created_at,
    updated_at,
    deleted_at
)
SELECT
    m.id,
    m.user_id,
    m.role_name,     -- 'platform_admin'
    NULL,            -- No entity link
    NULL,            -- No entity type
    m.created_at,
    m.updated_at,
    m.deleted_at
FROM public.memberships m
WHERE m.role_name = 'platform_admin'
  AND m.organization_id IN (
      SELECT id FROM public.organizations WHERE type = 'platform'
  )
ON CONFLICT DO NOTHING;

-- Step 2: Validate migration counts
DO $$
DECLARE
    source_count INTEGER;
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO source_count
    FROM public.memberships m
    WHERE m.role_name = 'platform_admin';

    SELECT COUNT(*) INTO migrated_count
    FROM public.user_roles
    WHERE role_name = 'platform_admin';

    RAISE NOTICE 'Platform admin migration: % source → % user_roles',
                 source_count, migrated_count;

    IF source_count != migrated_count THEN
        RAISE EXCEPTION 'Migration count mismatch! Expected %, got %',
                        source_count, migrated_count;
    END IF;
END $$;

-- Step 3: Delete migrated platform_admin rows from memberships
DELETE FROM public.memberships
WHERE role_name = 'platform_admin';

-- Step 4: Delete synthetic platform organization
DELETE FROM public.organizations
WHERE type = 'platform';

COMMIT;
```

**Why this pattern:**
- **ID preservation:** Maintains traceability with original membership ID
- **ON CONFLICT DO NOTHING:** Safe for re-running migration if deployment fails mid-flight
- **Validation block:** Postgres DO block verifies count matching before proceeding
- **RAISE EXCEPTION:** Aborts transaction if validation fails — no partial migration
- **Transaction boundary:** All-or-nothing atomicity

**Confidence:** HIGH — Pattern directly observed in project's existing migrations (20260212000001, 20260211000003, 20260201000004)

### 3. Migration Rollback Strategy

**Approach: Single DOWN migration for emergency rollback**

```sql
BEGIN;

-- Rollback Step 1: Recreate platform organization if it doesn't exist
INSERT INTO public.organizations (id, name, type, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Splits Network Platform',
    'platform',
    now()
)
ON CONFLICT (id) DO NOTHING;

-- Rollback Step 2: Move platform_admin back to memberships
INSERT INTO public.memberships (
    id,
    user_id,
    role_name,
    organization_id,
    company_id,
    created_at,
    updated_at,
    deleted_at
)
SELECT
    ur.id,
    ur.user_id,
    ur.role_name,
    '00000000-0000-0000-0000-000000000000'::uuid, -- Platform org
    NULL,
    ur.created_at,
    ur.updated_at,
    ur.deleted_at
FROM public.user_roles ur
WHERE ur.role_name = 'platform_admin'
ON CONFLICT DO NOTHING;

-- Rollback Step 3: Delete platform_admin from user_roles
DELETE FROM public.user_roles
WHERE role_name = 'platform_admin';

-- Rollback Step 4: Restore NOT NULL constraints
ALTER TABLE public.user_roles ALTER COLUMN role_entity_id SET NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN role_entity_type SET NOT NULL;

COMMIT;
```

**When to use:**
- If resolveAccessContext() breaks in production
- If identity-service user-roles endpoints fail
- If platform admin users lose access after migration

**Why this works:**
- Reverses migration steps in opposite order
- Recreates synthetic platform org with known UUID
- Restores original data structure
- Can run safely multiple times (ON CONFLICT DO NOTHING)

**Confidence:** HIGH — Standard rollback pattern, reverses migration operations

### 4. Index and Constraint Management

**Current indexes on user_roles (from baseline):**
```sql
-- From 20260212000001_split_user_roles_into_memberships.sql
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_entity_assignment
    ON public.user_roles (user_id, role_name, role_entity_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id
    ON public.user_roles(user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_role_name
    ON public.user_roles(role_name)
    WHERE deleted_at IS NULL;
```

**Impact of nullable columns:**
- **uq_user_role_entity_assignment:** Will NOT prevent duplicate platform_admin rows (NULL values don't participate in unique index)
- **Solution:** Add separate unique index for platform_admin:

```sql
-- Add to migration after making columns nullable
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_platform_admin
    ON public.user_roles (user_id, role_name)
    WHERE deleted_at IS NULL AND role_name = 'platform_admin';
```

**Why this works:**
- Partial unique index on (user_id, role_name) only applies when role_name='platform_admin'
- Ensures one platform_admin assignment per user
- Doesn't conflict with existing entity-linked role uniqueness
- Postgres partial indexes are highly efficient

**Confidence:** HIGH — Postgres partial index pattern, already used in project (20260212000001 has similar WHERE clauses)

### 5. Foreign Key Considerations

**Current foreign keys on user_roles:**
- `user_id` → `users(id)` — No change needed
- `role_name` → `roles(name)` — Assumes 'platform_admin' already exists in roles table

**Pre-migration check:**
```sql
-- Verify platform_admin role exists
SELECT name FROM public.roles WHERE name = 'platform_admin';
```

**If missing, add to migration:**
```sql
INSERT INTO public.roles (name, description)
VALUES (
    'platform_admin',
    'Platform administrator with system-wide access'
)
ON CONFLICT (name) DO NOTHING;
```

**Confidence:** MEDIUM — Assumes roles table exists and has expected structure (not verified in baseline.sql review)

## Testing Approach

### 1. Unit Testing (Vitest)

**Existing test pattern (from identity-service/tests/unit/invitations.service.test.ts):**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UserRoleServiceV2 (unit)', () => {
    const repository = {
        findUserRoles: vi.fn(),
        createUserRole: vi.fn(),
    };
    const resolver = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('allows creating platform_admin with null entity_id', async () => {
        repository.createUserRole.mockResolvedValue({
            id: 'role-1',
            user_id: 'user-1',
            role_name: 'platform_admin',
            role_entity_id: null,
            role_entity_type: null,
        });

        const service = new UserRoleServiceV2(repository, resolver);
        const result = await service.createUserRole('clerk-1', {
            role_name: 'platform_admin',
        });

        expect(result.role_entity_id).toBeNull();
        expect(result.role_entity_type).toBeNull();
    });
});
```

**What to test:**
- Repository can query user_roles with NULL entity_id
- Service validates platform_admin doesn't require entity_id
- resolveAccessContext() correctly identifies isPlatformAdmin from user_roles table

**Why unit tests only:**
- Project uses mocked repositories (no live DB in tests)
- Fast feedback loop (vitest runs in milliseconds)
- No test database seeding infrastructure observed in codebase

**Confidence:** HIGH — Follows project's established testing pattern

### 2. Manual Verification (Production-like)

**Pre-migration checklist:**
```bash
# 1. Count platform admins in current system
psql $DATABASE_URL -c "
SELECT COUNT(*) as platform_admin_count
FROM memberships m
WHERE m.role_name = 'platform_admin'
  AND m.deleted_at IS NULL;
"

# 2. Identify platform organization ID
psql $DATABASE_URL -c "
SELECT id, name, type
FROM organizations
WHERE type = 'platform';
"

# 3. Verify roles table has platform_admin entry
psql $DATABASE_URL -c "
SELECT name FROM roles WHERE name = 'platform_admin';
"
```

**Post-migration verification:**
```bash
# 1. Verify platform admins moved to user_roles
psql $DATABASE_URL -c "
SELECT COUNT(*) as migrated_count
FROM user_roles
WHERE role_name = 'platform_admin'
  AND deleted_at IS NULL;
"

# 2. Verify no platform admins remain in memberships
psql $DATABASE_URL -c "
SELECT COUNT(*) as remaining_count
FROM memberships
WHERE role_name = 'platform_admin';
"
# Should return 0

# 3. Verify platform organization deleted
psql $DATABASE_URL -c "
SELECT COUNT(*) as platform_orgs
FROM organizations
WHERE type = 'platform';
"
# Should return 0

# 4. Test resolveAccessContext with platform admin user
# (Manual API call to identity-service or portal login)
```

**Why manual verification:**
- No automated integration test suite for database migrations observed
- Supabase migrations run in production environment
- Critical path verification before code deploy
- Matches project's current QA approach

**Confidence:** MEDIUM — Based on observed project patterns, but no explicit migration testing guide found

### 3. Role-Based Access Testing

**Approach: Test resolveAccessContext() behavior change**

The critical change is in `packages/shared-access-context/src/index.ts`:

**Before (reads memberships only):**
```typescript
// Currently platform_admin comes from memberships table
const memberships: MembershipRow[] = ...;
const roles = [...new Set(memberships.map(m => m.role_name))];
```

**After (reads both memberships and user_roles):**
```typescript
// After migration: platform_admin comes from user_roles table
const memberships: MembershipRow[] = ...;
const userRoles: EntityRoleRow[] = ...;
const roles = [...new Set([
    ...memberships.map(m => m.role_name),
    ...userRoles.map(r => r.role_name),  // Includes platform_admin
])];
```

**Test scenarios:**
1. **Platform admin user**: Verify `isPlatformAdmin: true` and `roles: ['platform_admin']`
2. **Recruiter with platform admin**: Verify both roles present
3. **Company admin (no change)**: Verify still works from memberships table
4. **Regular recruiter (no change)**: Verify no regression

**Testing method:**
- Unit tests with mocked Supabase responses
- Manual API testing via Postman/curl to identity-service endpoints
- Frontend verification: Log in as platform admin, check admin UI visibility

**Confidence:** HIGH — resolveAccessContext already handles both tables (existing code in shared-access-context/src/index.ts lines 78-94)

## Migration File Structure

**Recommended filename:** `20260214000002_platform_admin_to_user_roles.sql`

**Why this numbering:**
- Latest migration is `20260214000001_search_index_company_access_control.sql`
- YYYYMMDD format + sequence number (existing project pattern)
- Higher number ensures correct ordering

**File structure:**
```sql
-- Migration: Move platform_admin from memberships to user_roles
--
-- Purpose:
-- 1. Make role_entity_id and role_entity_type nullable in user_roles
-- 2. Migrate platform_admin rows from memberships to user_roles
-- 3. Remove synthetic platform organization (type='platform')
-- 4. Add unique constraint for platform_admin role assignments
--
-- Rationale:
-- Platform admin is a system-level role, not organization-scoped.
-- Storing it in memberships required a synthetic organization that
-- has no business meaning. Moving to user_roles with nullable entity
-- fields makes the data model cleaner and more accurate.

BEGIN;

-- [Steps 1-5 as detailed in sections above]

COMMIT;
```

**Confidence:** HIGH — Matches project's migration file patterns exactly (see 20260201000004, 20260212000001)

## What NOT to Add

### 1. Database Migration Tools (Avoid)

**Tools like Flyway, Liquibase, migrate, node-pg-migrate:**
- Project uses raw SQL migration files in `supabase/migrations/`
- Supabase handles migration application automatically
- Adding migration tooling = introducing unnecessary complexity
- Current pattern works: 15+ migrations already applied successfully

**Verdict:** Do NOT add migration tools

### 2. Integration Test Database

**Pattern like test database seeding, docker-compose with Postgres:**
- No test DB infrastructure observed in project
- Vitest tests use mocked repositories
- Production Supabase instance is source of truth
- Setting up test DB = large scope increase for marginal benefit

**Verdict:** Do NOT add integration test database

### 3. TypeScript Schema Validators

**Tools like Zod, io-ts for database schema validation:**
- Repository layer already handles type safety with TypeScript interfaces
- Supabase client provides typed queries
- Runtime validation overhead without clear benefit
- Would need to add to every repository in every service

**Verdict:** Do NOT add schema validators (beyond existing TypeScript types)

### 4. Database Versioning/Snapshot Tools

**Tools like pg_dump automation, migration snapshots:**
- Supabase provides point-in-time recovery
- Git already versions migration files
- Snapshots useful for large-scale refactors, but this is targeted migration

**Verdict:** Do NOT add database snapshot tooling

## Critical Success Factors

### 1. Order of Operations

**Deployment sequence matters:**

```
1. Run database migration (20260214000002_platform_admin_to_user_roles.sql)
   ↓
2. Deploy updated shared-access-context package (resolveAccessContext reads user_roles)
   ↓
3. Deploy identity-service with updated user-roles repository
   ↓
4. Deploy portal app with any admin UI changes
```

**Why this order:**
- Database migration is backward compatible (doesn't break existing code)
- shared-access-context can read from both tables safely
- Service deploy activates new behavior
- Frontend gets updated last (least critical)

**Rollback order:** Reverse sequence, run DOWN migration

### 2. Zero-Downtime Considerations

**The migration is zero-downtime compatible:**
- ALTER TABLE to drop NOT NULL doesn't lock table
- INSERT...SELECT is atomic (transaction)
- DELETE only affects platform_admin rows (typically <10 users)
- Platform organization deletion has no foreign key dependents (platform_admin memberships already deleted)

**Potential lock concern:** Concurrent INSERT into user_roles during migration
**Mitigation:** Migration runs in transaction, Postgres handles locking

### 3. Validation Gates

**Before marking migration complete:**
- [ ] Platform admin count matches (source = destination)
- [ ] No platform_admin rows remain in memberships
- [ ] Platform organization deleted successfully
- [ ] resolveAccessContext returns isPlatformAdmin: true for test user
- [ ] Platform admin can access admin UI in portal
- [ ] No errors in service logs related to role resolution

## Sources and Confidence Assessment

| Research Area | Confidence | Source |
|---------------|------------|--------|
| Postgres nullable column migration | HIGH | Observed in 20260212000001_split_user_roles_into_memberships.sql (DROP COLUMN pattern) |
| Data migration pattern | HIGH | Project migrations: 20260212000001, 20260211000003, 20260201000004 |
| Transaction safety | HIGH | All project migrations use BEGIN/COMMIT with validation blocks |
| Index management | HIGH | Partial unique index pattern in 20260212000001 (uq_membership_assignment) |
| Vitest testing approach | HIGH | identity-service/tests/unit/invitations.service.test.ts shows mocking pattern |
| Integration testing | MEDIUM | No test DB infrastructure found; manual verification appears to be standard |
| resolveAccessContext implementation | HIGH | Source code review: packages/shared-access-context/src/index.ts |
| V2 service pattern | HIGH | identity-service/src/v2 structure (memberships, user-roles, routes.ts) |

**Overall confidence for migration success:** HIGH

**Risks identified:**
1. MEDIUM: Roles table may not have platform_admin entry (add to migration)
2. LOW: Unique constraint gap for platform_admin (add partial index)
3. LOW: Deployment sequence matters (document in migration comments)

## Summary

**Stack changes required:** None — use existing Postgres, Fastify, Vitest

**Migration approach:**
- Single SQL migration file with transaction safety
- Multi-step: schema change → data migration → validation → cleanup
- Rollback script for emergency reversal

**Testing approach:**
- Unit tests with mocked repositories (Vitest)
- Manual verification queries (psql)
- Role-based access testing via resolveAccessContext

**What to avoid:**
- Migration tools (Flyway, Liquibase)
- Integration test database setup
- Schema validators beyond TypeScript
- Database snapshot tooling

This is a straightforward database restructure using project's established patterns. No technology additions needed.
