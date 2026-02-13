# Domain Pitfalls: Platform Admin Role Storage Migration

**Domain:** Moving platform_admin from memberships to user_roles table
**Researched:** 2026-02-13
**Confidence:** HIGH (based on codebase analysis and migration domain knowledge)

---

## CRITICAL PITFALLS

Mistakes that cause outages, data loss, or complete loss of admin access.

### Pitfall 1: Losing All Platform Admin Access During Migration

**What goes wrong:** If the migration transaction fails partway through (after deleting from memberships but before inserting into user_roles), all platform admins lose their access. The system becomes unmaintainable.

**Why it happens:**
- Migration steps run in separate transactions
- Migration script deletes from memberships before verifying user_roles insert succeeded
- Network interruption or constraint violation during migration
- No validation that at least one platform admin exists after migration

**Consequences:**
- Complete lockout from admin functions
- Cannot create new admins (requires admin permissions)
- Cannot rollback without direct database access
- Production system requires emergency database intervention

**Prevention:**
1. **Atomic transaction wrapping**: Entire migration in single BEGIN/COMMIT block
2. **Verification before deletion**: Query user_roles to confirm platform_admin rows exist before deleting from memberships
3. **Hard fail on validation**: If migrated count != source count, ROLLBACK entire transaction
4. **Pre-migration snapshot**: Document existing platform_admin user IDs for manual recovery
5. **Dual-read period**: Update resolveAccessContext to read from BOTH tables during migration window (union of memberships + user_roles platform_admin)

**Migration template:**
```sql
BEGIN;

-- Step 1: Migrate platform_admin from memberships → user_roles
INSERT INTO user_roles (user_id, role_name, role_entity_id, role_entity_type, created_at, updated_at)
SELECT DISTINCT
    user_id,
    'platform_admin',
    NULL,
    NULL,
    created_at,
    updated_at
FROM memberships
WHERE role_name = 'platform_admin' AND deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Step 2: Validate migration succeeded
DO $$
DECLARE
    source_count INTEGER;
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(DISTINCT user_id) INTO source_count
    FROM memberships
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    SELECT COUNT(*) INTO migrated_count
    FROM user_roles
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    IF source_count != migrated_count THEN
        RAISE EXCEPTION 'Migration validation failed: % source admins, % migrated', source_count, migrated_count;
    END IF;

    IF migrated_count = 0 THEN
        RAISE EXCEPTION 'CRITICAL: Zero platform admins after migration!';
    END IF;

    RAISE NOTICE 'Validation passed: % platform admins migrated', migrated_count;
END $$;

-- Step 3: Only delete from memberships after validation passes
DELETE FROM memberships WHERE role_name = 'platform_admin';

COMMIT;
```

**Detection:**
- Migration validation block shows count mismatch
- Post-migration smoke test: Can specific test user (known platform admin) access admin endpoints?
- Monitor error logs for "Platform admin permissions required" immediately after deployment

**Code location affected:**
- `packages/shared-access-context/src/index.ts` line 119-122 (role extraction)
- `services/identity-service/src/v2/memberships/service.ts` requirePlatformAdmin checks
- All 7+ services using isPlatformAdmin checks

**Phase impact:** Phase 2 (Data Migration) — Must implement atomic transaction and validation

---

### Pitfall 2: Foreign Key Constraint Violations on DELETE

**What goes wrong:** Deleting the platform organization fails because foreign key constraints prevent deletion when memberships still reference it.

**Why it happens:**
- Migration order: Attempts to DELETE organization before deleting platform_admin memberships
- Foreign keys without ON DELETE CASCADE (memberships.organization_id has no cascade behavior by default)
- companies.identity_organization_id may reference platform org
- invitations.organization_id may reference platform org

**Consequences:**
- Migration fails with FK constraint violation
- Partial state: platform_admin rows moved to user_roles but platform org still exists
- Rollback complexity: must manually restore memberships from user_roles

**Prevention:**

**Correct deletion order:**
```sql
BEGIN;

-- Step 1: Migrate platform_admin from memberships → user_roles
-- (INSERT statement here)

-- Step 2: Verify migration succeeded
-- (Validation block here)

-- Step 3: Delete platform_admin memberships (not all memberships)
DELETE FROM memberships WHERE role_name = 'platform_admin';

-- Step 4: Verify no FK references to platform org
DO $$
DECLARE
    platform_org_id UUID;
    company_refs INTEGER;
    invitation_refs INTEGER;
BEGIN
    SELECT id INTO platform_org_id FROM organizations WHERE type = 'platform';

    SELECT COUNT(*) INTO company_refs
    FROM companies WHERE identity_organization_id = platform_org_id;

    SELECT COUNT(*) INTO invitation_refs
    FROM invitations WHERE organization_id = platform_org_id;

    IF company_refs > 0 OR invitation_refs > 0 THEN
        RAISE WARNING 'Cannot delete platform org: % company refs, % invitation refs',
            company_refs, invitation_refs;
        RAISE WARNING 'Manual cleanup required for companies/invitations';
    END IF;
END $$;

-- Step 5: Delete platform organization ONLY if no references
DELETE FROM organizations
WHERE type = 'platform'
  AND id NOT IN (
      SELECT DISTINCT identity_organization_id FROM companies WHERE identity_organization_id IS NOT NULL
      UNION
      SELECT DISTINCT organization_id FROM invitations WHERE organization_id IS NOT NULL
  );

COMMIT;
```

**Detection:**
- Migration fails with error: `ERROR: update or delete on table "organizations" violates foreign key constraint`
- Validation query shows non-zero count of FK references

**Code location affected:**
- `supabase/migrations/20240101000000_baseline.sql` FK constraint definitions
- Any migration attempting `DELETE FROM organizations WHERE type = 'platform'`

**Phase impact:** Phase 4 (Cleanup) — Must verify FK references before deleting platform org

---

### Pitfall 3: Race Condition Between Migration and Live Traffic

**What goes wrong:** During migration, a user with platform_admin in memberships attempts to access the system. resolveAccessContext reads the new schema (user_roles only) but their platform_admin hasn't migrated yet. Access denied.

**Why it happens:**
- Zero-downtime deployment: migration runs while services are live
- resolveAccessContext code deploys BEFORE data migration completes
- Service restart happens mid-migration
- Microservices restart independently, creating inconsistent view of role data

**Consequences:**
- Intermittent authorization failures during deployment window
- Active platform admins lose access mid-session
- User confusion: "I was just logged in, now I can't access admin pages"
- Audit trail shows denied admin actions that should have succeeded

**Prevention:**

**Two-phase deployment:**

**Phase 1 (Code)**: Deploy resolveAccessContext that reads BOTH tables (union) — backward compatible
```typescript
// packages/shared-access-context/src/index.ts
const roles = [...new Set([
    ...memberships.map(m => m.role_name),
    ...userRoles.map(r => r.role_name),
].filter(Boolean))];

// isPlatformAdmin reads from BOTH sources during transition
const isPlatformAdmin = roles.includes('platform_admin');
```

**Phase 2 (Data)**: Run migration to move platform_admin rows

**Phase 3 (Code)**: Deploy resolveAccessContext that reads user_roles only — forward compatible

**Detection:**
- Spike in "Platform admin permissions required" errors during deployment
- resolveAccessContext returns `isPlatformAdmin: false` for known admin user
- Service logs show query results with zero memberships but user_roles not yet populated

**Code location affected:**
- All services calling `resolveAccessContext()` (7+ services across codebase)
- `packages/shared-access-context/src/index.ts` lines 80-94 (query), 119-122 (role extraction), 152 (isPlatformAdmin)

**Phase impact:** Phase 1 (Schema Changes) and Phase 3 (Code Deployment) — Must coordinate timing

---

### Pitfall 4: Orphaned Platform Admin Memberships After Migration

**What goes wrong:** Migration copies platform_admin from memberships to user_roles but fails to delete the source rows. Now platform_admin exists in BOTH tables, causing data inconsistency.

**Why it happens:**
- Migration script separates INSERT and DELETE into different transactions
- DELETE step commented out or skipped for "safety"
- Validation checks only confirm INSERT succeeded, not that DELETE happened
- Fear of data loss leads to keeping "backup" in memberships

**Consequences:**
- Dual source of truth: admin role assignment ambiguous
- Future updates to platform_admin may only update one table
- Query performance degrades (resolveAccessContext joins both tables unnecessarily)
- Data audit shows inconsistent role counts
- Rollback complexity: unclear which table is authoritative

**Prevention:**

**Single atomic transaction:** INSERT and DELETE in same BEGIN/COMMIT block

**Post-migration validation:**
```sql
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM memberships
    WHERE role_name = 'platform_admin' AND deleted_at IS NULL;

    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Migration incomplete: % platform_admin rows remain in memberships', orphaned_count;
    END IF;
END $$;
```

**Detection:**
- Post-migration query: `SELECT COUNT(*) FROM memberships WHERE role_name = 'platform_admin'` returns non-zero
- Performance monitoring shows resolveAccessContext query time hasn't improved
- Duplicate role assignments visible in identity-service API responses

**Code location affected:**
- Migration script (wherever it's written)
- `services/identity-service/src/v2/memberships/repository.ts` (if querying memberships for platform_admin after migration)

**Phase impact:** Phase 2 (Data Migration) — Must include deletion in atomic transaction

---

## MODERATE PITFALLS

Mistakes that cause temporary issues or data inconsistencies requiring manual cleanup.

### Pitfall 5: NOT NULL Constraint on role_entity_id Prevents INSERT

**What goes wrong:** Migration attempts to INSERT platform_admin rows into user_roles with role_entity_id = NULL, but the column has a NOT NULL constraint. INSERT fails.

**Why it happens:**
- Current schema: `user_roles.role_entity_id` is NOT NULL (per migration 20260211000003)
- Platform admin doesn't link to an entity (no recruiter/candidate association)
- Migration forgets to ALTER TABLE before INSERT
- Schema change and data migration run out of order

**Consequences:**
- Migration fails immediately on INSERT
- Error: `ERROR: null value in column "role_entity_id" violates not-null constraint`
- Zero data migrated, system state unchanged (safe failure)
- Deployment blocked until schema corrected

**Prevention:**

**Correct migration order:**
```sql
-- Step 1: ALTER TABLE to allow NULL
ALTER TABLE user_roles ALTER COLUMN role_entity_id DROP NOT NULL;
ALTER TABLE user_roles ALTER COLUMN role_entity_type DROP NOT NULL;

-- Step 2: Migrate platform_admin data
INSERT INTO user_roles (user_id, role_name, role_entity_id, role_entity_type, ...)
SELECT user_id, role_name, NULL, NULL, ...
FROM memberships WHERE role_name = 'platform_admin';

-- Step 3: Update unique index to handle NULL values
DROP INDEX IF EXISTS uq_user_role_entity_assignment;

CREATE UNIQUE INDEX uq_user_role_assignment
ON user_roles (
    user_id,
    role_name,
    COALESCE(role_entity_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
WHERE deleted_at IS NULL;
```

**Detection:**
- Migration fails with explicit NOT NULL constraint error
- Zero rows inserted into user_roles (count validation catches this)

**Code location affected:**
- `supabase/migrations/20260211000003_create_user_roles_table.sql` line 9 (role_entity_id UUID)
- New migration (not yet written) must ALTER this column first

**Phase impact:** Phase 1 (Schema Changes) — Must ALTER TABLE before data migration

---

### Pitfall 6: Unique Constraint Violations on Duplicate Platform Admin Assignments

**What goes wrong:** Migration attempts to INSERT multiple platform_admin rows for the same user (one per company they're admin of), but user_roles has a unique constraint that prevents duplicates.

**Why it happens:**
- memberships allows multiple rows: same user, same role, different organization_id
- user_roles unique index after NULL handling may reject duplicates
- Migration uses INSERT without ON CONFLICT handling

**Consequences:**
- INSERT fails for second platform_admin row for same user
- Error: `ERROR: duplicate key value violates unique constraint`
- Partial migration: some platform admins migrated, others not
- Inconsistent admin access (some users have it, others don't)

**Prevention:**

**Design migration for single row per user:**
```sql
-- Migrate only DISTINCT user_id for platform_admin
INSERT INTO user_roles (user_id, role_name, role_entity_id, role_entity_type, created_at, updated_at)
SELECT DISTINCT ON (user_id)
    user_id,
    'platform_admin',
    NULL,
    NULL,
    MIN(created_at),
    MAX(updated_at)
FROM memberships
WHERE role_name = 'platform_admin' AND deleted_at IS NULL
GROUP BY user_id
ON CONFLICT DO NOTHING;
```

**Detection:**
- Migration fails with unique constraint violation
- Count mismatch: source memberships count > migrated user_roles count
- Validation query identifies missing users

**Code location affected:**
- `supabase/migrations/20260211000003_create_user_roles_table.sql` line 129 (unique index)
- New migration script (INSERT statement)

**Phase impact:** Phase 2 (Data Migration) — Must handle duplicates with DISTINCT or ON CONFLICT

---

### Pitfall 7: Stale Service Instances Reading Old Schema

**What goes wrong:** After migration completes and new code deploys, some service instances (not yet restarted) continue reading from memberships for platform_admin. Returns empty results because data deleted.

**Why it happens:**
- Kubernetes rolling deployment: pods restart gradually
- Old pod instances still running old code (reads memberships)
- Migration deleted platform_admin from memberships
- Load balancer routes requests to mix of old/new pods

**Consequences:**
- Intermittent authorization failures: same user denied on retry
- Hard to debug: works in some requests, fails in others
- User reports: "logging out and back in fixed it" (new session hits new pod)
- Authorization logs show isPlatformAdmin flipping between true/false

**Prevention:**

**Dual-read period (recommended):**
- Deploy code that reads union of both tables
- Run migration (data exists in both places)
- Next deployment: remove memberships read, delete old data

**Alternative: Force all pods to restart after migration:**
```bash
# After migration completes, force rolling restart
kubectl rollout restart deployment/ats-service
kubectl rollout restart deployment/network-service
# ... all services using resolveAccessContext
```

**Detection:**
- Intermittent authorization failures during deployment window
- Some pods log "platform_admin found in memberships", others "found in user_roles"
- Service version metrics show mixed deployment

**Code location affected:**
- All 7+ microservices using resolveAccessContext
- Kubernetes deployment manifests (health check probes)

**Phase impact:** Phase 3 (Code Deployment) — Must coordinate service restarts or use dual-read

---

### Pitfall 8: Frontend Caching of is_platform_admin Flag

**What goes wrong:** Frontend caches user profile with `is_platform_admin: true` from session before migration. After migration, backend returns updated profile but frontend doesn't refetch. User sees admin UI but API calls fail.

**Why it happens:**
- User profile fetched on login, stored in React context/state
- Migration happens while user session active
- Frontend doesn't poll for profile updates
- Backend JWT remains valid (no forced re-authentication)

**Consequences:**
- UI shows admin navigation/buttons
- Clicking admin features returns 403 Forbidden
- Confusing UX: "I see the button but can't use it"
- User must hard refresh or logout/login to clear cache

**Prevention:**

**Backend-driven authorization:** Never trust frontend role checks for access control (already done)

**Profile refresh on 403:**
```typescript
// In API client error interceptor
if (error.response?.status === 403) {
    // Refetch user profile
    await userProfileContext.refresh();
    // Retry the request
    return api.request(originalRequest);
}
```

**Detection:**
- Frontend shows admin UI elements
- Network tab shows 403 errors on admin API calls
- User profile in frontend differs from backend /v2/users/:id response

**Code location affected:**
- `apps/portal/src/contexts/user-profile-context.tsx` (frontend profile state)
- `apps/portal/src/components/sidebar.tsx` (platform admin UI checks)
- API error handling in frontend (403 response interceptor)

**Phase impact:** Phase 5 (Validation) — Test with active user sessions during migration

---

## MINOR PITFALLS

Mistakes that cause annoyance but are easily fixable.

### Pitfall 9: Migration Validation Only Checks Insert Count, Not Content

**What goes wrong:** Migration counts source rows and inserted rows, reports success if counts match. But doesn't verify WHICH users migrated. Might insert wrong user IDs or duplicate wrong data.

**Why it happens:**
- Validation uses COUNT(*) without content verification
- Migration script has logic bug (wrong WHERE clause, JOIN condition)
- Counts match accidentally (wrong data but same quantity)
- No spot-check of actual user IDs migrated

**Consequences:**
- Wrong users granted platform admin
- Correct platform admins lose access
- Discovered days later when someone reports authorization issue
- Manual data correction required (identify correct admins, fix roles)

**Prevention:**

**Content validation in migration:**
```sql
DO $$
DECLARE
    missing_users TEXT;
BEGIN
    -- Find users in memberships but NOT in user_roles
    SELECT STRING_AGG(user_id::text, ', ') INTO missing_users
    FROM (
        SELECT DISTINCT user_id
        FROM memberships
        WHERE role_name = 'platform_admin' AND deleted_at IS NULL
        EXCEPT
        SELECT user_id
        FROM user_roles
        WHERE role_name = 'platform_admin' AND deleted_at IS NULL
    ) missing;

    IF missing_users IS NOT NULL THEN
        RAISE EXCEPTION 'Missing platform admins in user_roles: %', missing_users;
    END IF;
END $$;
```

**Detection:**
- Post-migration query comparing user IDs between tables shows mismatches
- Known admin user reports access denied
- Manual audit of user_roles shows unexpected user IDs

**Code location affected:**
- Migration script validation block

**Phase impact:** Phase 2 (Data Migration) — Add content validation to migration script

---

### Pitfall 10: Migration Runs Twice Accidentally (Non-Idempotent)

**What goes wrong:** Migration script runs twice (deployment retry, manual rerun), causing duplicate data or constraint violations.

**Why it happens:**
- Deployment pipeline retries failed migrations
- DBA manually reruns migration to debug
- No idempotency guards (IF NOT EXISTS, ON CONFLICT)
- Migration framework doesn't track completed migrations

**Consequences:**
- Duplicate platform_admin rows in user_roles (if no unique constraint)
- Migration fails on second run (if unique constraint exists — safe failure)
- Confusion about whether migration completed successfully
- Must manually clean up duplicate data

**Prevention:**

**Idempotent INSERTs:** Use `ON CONFLICT DO NOTHING` or `WHERE NOT EXISTS`
```sql
INSERT INTO user_roles (user_id, role_name, role_entity_id, role_entity_type, ...)
SELECT DISTINCT user_id, 'platform_admin', NULL, NULL, ...
FROM memberships
WHERE role_name = 'platform_admin'
ON CONFLICT (user_id, role_name, COALESCE(role_entity_id, '00000000-0000-0000-0000-000000000000'::uuid))
DO NOTHING;
```

**Detection:**
- Second migration run completes with "0 rows inserted" (ON CONFLICT caught it)
- Unique constraint violation on second run
- Migration tracking table shows migration already completed

**Code location affected:**
- Migration script
- Supabase migrations framework (tracks completed migrations via migrations table)

**Phase impact:** Phase 2 (Data Migration) — Use idempotent patterns from the start

---

### Pitfall 11: Rollback Strategy Undefined Before Migration

**What goes wrong:** Migration fails partway through. Team scrambles to figure out how to rollback. Manual SQL scripts written under pressure introduce new bugs.

**Why it happens:**
- "We'll handle rollback if needed" (no plan documented)
- Migration reversibility not tested
- Complex multi-step migration with no clear inverse
- Time pressure during incident response

**Consequences:**
- Extended downtime while rollback strategy debated
- Manual rollback introduces new data corruption
- Restored from backup (lose recent production data)
- Loss of confidence in migration safety

**Prevention:**

**Write rollback script BEFORE migration:**
```sql
-- ROLLBACK: If migration needs reverting
BEGIN;

-- Find platform org ID (needed for restoration)
DO $$
DECLARE
    platform_org_id UUID;
BEGIN
    SELECT id INTO platform_org_id FROM organizations WHERE type = 'platform';

    -- Restore platform_admin to memberships
    INSERT INTO memberships (user_id, role_name, organization_id, company_id, created_at, updated_at)
    SELECT
        user_id,
        'platform_admin',
        platform_org_id,
        NULL,
        created_at,
        updated_at
    FROM user_roles
    WHERE role_name = 'platform_admin';

    -- Remove from user_roles
    DELETE FROM user_roles WHERE role_name = 'platform_admin';

    -- Restore role_entity_id NOT NULL constraint
    ALTER TABLE user_roles ALTER COLUMN role_entity_id SET NOT NULL;
    ALTER TABLE user_roles ALTER COLUMN role_entity_type SET NOT NULL;

    RAISE NOTICE 'Rollback complete';
END $$;

COMMIT;
```

**Detection:**
- Rollback needed but no documented procedure
- Team debates rollback approach during incident
- Rollback script fails with errors

**Code location affected:**
- Migration documentation (should be in same file as migration)
- Incident response runbook

**Phase impact:** Phase 0 (Planning) — Write rollback script before starting migration

---

## PHASE-SPECIFIC WARNINGS

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| **Phase 1: Schema Changes** | #5 NOT NULL constraint blocks INSERT | ALTER TABLE role_entity_id to nullable FIRST |
| **Phase 2: Data Migration** | #1 Losing admin access | Atomic transaction, validation before DELETE |
| | #4 Orphaned memberships | DELETE in same transaction as INSERT |
| | #6 Duplicate user handling | Use DISTINCT ON or ON CONFLICT DO NOTHING |
| | #9 Wrong users migrated | Validate user IDs not just counts |
| | #10 Non-idempotent migration | Use ON CONFLICT for idempotency |
| **Phase 3: Code Deployment** | #3 Race condition | Deploy dual-read code before data migration |
| | #7 Stale service instances | Rolling restart or dual-read period |
| **Phase 4: Cleanup** | #2 FK violations deleting platform org | Check FK references before DELETE |
| **Phase 5: Validation** | #8 Frontend cache | Test with active sessions, add 403 refresh |
| **Phase 6: Rollback Readiness** | #11 No rollback plan | Write and test rollback script in Phase 0 |

---

## ROLLBACK STRATEGY

### Automated Rollback (Within Migration Transaction)

If migration fails during execution:
```sql
-- Entire migration wrapped in transaction
BEGIN;

-- Migration steps here...

-- Validation fails → automatic ROLLBACK
DO $$
BEGIN
    IF [validation condition fails] THEN
        RAISE EXCEPTION 'Migration validation failed, rolling back';
    END IF;
END $$;

COMMIT;
```

### Manual Rollback (After Migration Completes)

If issues discovered post-deployment:

1. **Stop new traffic**: Route to maintenance page (prevent new admin actions)
2. **Restore platform_admin to memberships**: (See Pitfall 11 for script)
3. **Deploy old resolveAccessContext code**: Reads memberships for platform_admin
4. **Verify admin access restored**: Smoke test known admin user
5. **Clean up user_roles**: DELETE platform_admin rows (leave recruiter/candidate intact)
6. **Restore NOT NULL constraints**: ALTER TABLE user_roles (if needed)

### Rollback Triggers

Execute rollback if:
- Zero platform admins after migration (validation shows count = 0)
- Known test admin cannot access admin endpoints
- More than 5 authorization failures logged in first 5 minutes post-deployment
- Migration transaction fails (automatic rollback)

### No-Rollback Zone

After 24 hours and validation passes, rollback becomes impractical:
- New platform_admin assignments in user_roles (would lose recent data)
- Memberships table may have new data (forward progress)
- Forward-fix only: manually correct role assignments in user_roles

---

## RESEARCH CONFIDENCE ASSESSMENT

| Category | Confidence | Source |
|----------|------------|--------|
| Current role architecture | HIGH | Direct codebase analysis (`packages/shared-access-context`, `services/identity-service`) |
| Foreign key constraints | HIGH | `supabase/migrations/20240101000000_baseline.sql` examination |
| Service dependencies | HIGH | Grep results showing 50+ isPlatformAdmin checks across 7+ services |
| Migration patterns | HIGH | Reference migration `20260212000001_split_user_roles_into_memberships.sql` |
| Postgres transaction semantics | HIGH | Training data on Postgres ACID properties, NULL handling |
| Microservice deployment | MEDIUM | Training data on K8s rolling deployments, general patterns |
| Frontend caching behavior | MEDIUM | Code inspection of `user-profile-context.tsx`, assumed caching patterns |

**Overall confidence:** HIGH — Pitfalls grounded in actual codebase inspection and proven migration patterns.

---

## WHAT TO VALIDATE

Before executing migration, verify:

1. **Platform organization exists**: Query `SELECT id, name FROM organizations WHERE type = 'platform'`
2. **Current platform admin count**: Query `SELECT COUNT(DISTINCT user_id) FROM memberships WHERE role_name = 'platform_admin'`
3. **FK references to platform org**: Check companies.identity_organization_id and invitations.organization_id
4. **Test user for smoke testing**: Identify known platform_admin user_id for post-migration validation
5. **Service restart windows**: Confirm deployment schedule allows rolling restarts without downtime

---

## SOURCES

**Codebase Analysis (HIGH Confidence):**
- `packages/shared-access-context/src/index.ts` — resolveAccessContext implementation, lines 66-162
- `services/identity-service/src/v2/memberships/service.ts` — platform admin authorization checks
- `services/identity-service/src/v2/user-roles/service.ts` — entity role management
- `supabase/migrations/20260211000003_create_user_roles_table.sql` — user_roles schema with NOT NULL constraint
- `supabase/migrations/20260212000001_split_user_roles_into_memberships.sql` — reference migration showing validation patterns
- `supabase/migrations/20240101000000_baseline.sql` — organizations table with FK constraints
- `.planning/PROJECT.md` — milestone context and requirements
- 20+ service files with isPlatformAdmin checks across microservices

**Domain Knowledge (MEDIUM Confidence):**
- Postgres transaction semantics and NULL handling in unique indexes
- Kubernetes rolling deployment patterns and health checks
- Microservice authorization caching and race conditions
- Database migration best practices (idempotency, validation, rollback)

**Assumptions (LOW Confidence — require validation):**
- Platform organization ID is consistent/known (need to query production)
- No external systems cache platform_admin status (assumed internal only)
- Frontend profile refresh behavior (need to test actual caching strategy)
