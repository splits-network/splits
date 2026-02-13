# Architecture Integration: Platform Admin Restructure

**Domain:** Platform Admin Role Management
**Researched:** 2026-02-13
**Milestone:** Platform Admin Restructure (Subsequent milestone)

## Executive Summary

This restructure moves `platform_admin` from the `memberships` table to the `user_roles` table, eliminating the need for a synthetic "platform" organization. The change is architecturally sound because it aligns with the existing dual-table pattern established in migration `20260212000001_split_user_roles_into_memberships.sql`:

- **memberships**: Org-scoped roles (company_admin, hiring_manager) — requires organization_id NOT NULL
- **user_roles**: Entity-linked roles (recruiter, candidate) — requires role_entity_id NOT NULL

Platform_admin is a **system-level role** with no inherent organization or entity scope. By making `user_roles.role_entity_id` nullable, we create a third category: **system-level roles** (platform_admin) that exist in `user_roles` without entity linkage.

## Current Architecture State

### Table Structure (Post-Migration 20260212000001)

**memberships table:**
```sql
CREATE TABLE memberships (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    role_name TEXT NOT NULL REFERENCES roles(name),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    company_id UUID REFERENCES companies(id),
    ...
);
COMMENT: 'Org-scoped role assignments: company_admin, hiring_manager, platform_admin. Always has organization_id.'
```

**user_roles table:**
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    role_name TEXT NOT NULL REFERENCES roles(name),
    role_entity_id UUID NOT NULL,  -- Links to recruiters.id or candidates.id
    role_entity_type TEXT NOT NULL,  -- 'recruiter' or 'candidate'
    ...
);
COMMENT: 'Entity-linked role assignments: recruiter, candidate. Always has role_entity_id.'
```

**organizations table:**
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'company' or 'platform'
    ...
    CONSTRAINT organizations_type_check CHECK (type = ANY (ARRAY['company', 'platform']))
);
```

### Access Resolution Pattern (shared-access-context)

**Current implementation** (`packages/shared-access-context/src/index.ts`):

```typescript
export async function resolveAccessContext(
    supabase: SupabaseClient,
    clerkUserId?: string
): Promise<AccessContext> {
    const userResult = await supabase
        .from('users')
        .select(`
            id,
            memberships!memberships_user_id_fkey1 (
                role_name,
                organization_id,
                company_id
            ),
            user_roles!user_roles_user_id_fkey (
                role_name,
                role_entity_id
            )
        `)
        .eq('clerk_user_id', clerkUserId)
        .is('memberships.deleted_at', null)
        .is('user_roles.deleted_at', null)
        .maybeSingle();

    // Extract roles from BOTH tables
    const roles = [...new Set([
        ...memberships.map(m => m.role_name),
        ...userRoles.map(r => r.role_name),
    ].filter(Boolean))];

    // Extract entity IDs from user_roles
    const recruiterRole = userRoles.find(r => r.role_name === 'recruiter');
    const candidateRole = userRoles.find(r => r.role_name === 'candidate');

    return {
        identityUserId,
        candidateId: candidateRole?.role_entity_id || null,
        recruiterId: recruiterRole?.role_entity_id || null,
        organizationIds: [...memberships.map(m => m.organization_id)],
        companyIds: [...memberships.map(m => m.company_id)],
        roles,
        isPlatformAdmin: roles.includes('platform_admin'),  // Derived from roles array
        error: '',
    };
}
```

**Pattern:** Single query joining both tables, union role names, determine `isPlatformAdmin` from combined roles array.

### Identity Service (Role Management)

**Services:**
- `UserRoleServiceV2` (`services/identity-service/src/v2/user-roles/service.ts`): Manages entity-linked roles (recruiter, candidate) — requires platform_admin to modify
- `MembershipServiceV2` (`services/identity-service/src/v2/memberships/service.ts`): Manages org-scoped roles (company_admin, hiring_manager, platform_admin) — requires platform_admin or company_admin for org

**Repositories:**
- `UserRoleRepository`: CRUD for user_roles table
- `MembershipRepository`: CRUD for memberships table

**Routes:** All registered in `services/identity-service/src/v2/routes.ts`:
- `POST /v2/user-roles` - Create entity role assignment
- `GET /v2/memberships` - List org memberships
- `POST /v2/memberships` - Create org membership (including platform_admin)

### Frontend (Role Display)

**User Profile Context** (`apps/portal/src/contexts/user-profile-context.tsx`):

```typescript
export interface UserProfile {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string | null;
    roles: string[];  // From /api/v2/users/me
    is_platform_admin: boolean;
    recruiter_id: string | null;
    candidate_id: string | null;
    organization_ids: string[];
}
```

**Data source:** `GET /api/v2/users/me` → `identity-service` → `UserServiceV2.findUserByClerkId()`:

```typescript
async findUserByClerkId(clerkUserId: string) {
    const user = await this.repository.findUserByClerkId(clerkUserId);
    const accessContext = await this.resolveAccessContext(clerkUserId);

    return {
        ...user,
        roles: accessContext.roles,
        is_platform_admin: accessContext.isPlatformAdmin,
        recruiter_id: accessContext.recruiterId,
        candidate_id: accessContext.candidateId,
        organization_ids: accessContext.organizationIds,
        company_ids: accessContext.companyIds,
    };
}
```

**Pattern:** Backend enriches user record with access context data. Frontend consumes as read-only props.

### API Gateway (Authorization)

**Authentication only** (`services/api-gateway/src/middleware/auth.ts`):

```typescript
export const requireAuth = (): preHandlerHookHandler => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.auth?.clerkUserId) {
            return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
        }
    };
};
```

**Authorization delegated to services:** Each V2 service calls `resolveAccessContext(clerkUserId)` internally for role-based filtering and permissions.

## Proposed Architecture Changes

### 1. Database Schema Changes

**Migration: Make user_roles.role_entity_id nullable**

```sql
-- Step 1: Allow platform_admin in user_roles without entity linkage
ALTER TABLE public.user_roles ALTER COLUMN role_entity_id DROP NOT NULL;
ALTER TABLE public.user_roles ALTER COLUMN role_entity_type DROP NOT NULL;

-- Step 2: Migrate platform_admin rows from memberships → user_roles
INSERT INTO public.user_roles (user_id, role_name, created_at, updated_at)
SELECT DISTINCT
    m.user_id,
    'platform_admin',
    m.created_at,
    m.updated_at
FROM public.memberships m
WHERE m.role_name = 'platform_admin'
  AND m.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Step 3: Delete platform_admin rows from memberships
DELETE FROM public.memberships WHERE role_name = 'platform_admin';

-- Step 4: Remove platform_admin from memberships allowed roles
-- Update constraint to only allow company_admin, hiring_manager
ALTER TABLE public.memberships DROP CONSTRAINT IF EXISTS memberships_role_name_fkey;
ALTER TABLE public.memberships ADD CONSTRAINT memberships_role_name_check
    CHECK (role_name IN ('company_admin', 'hiring_manager'));

-- Step 5: Delete platform organization
DELETE FROM public.organizations WHERE type = 'platform';

-- Step 6: Update constraints and comments
COMMENT ON TABLE public.memberships IS 'Org-scoped role assignments: company_admin, hiring_manager. Always has organization_id.';
COMMENT ON TABLE public.user_roles IS 'Entity-linked and system-level role assignments. Entity-linked (recruiter, candidate) have role_entity_id. System-level (platform_admin) have NULL role_entity_id.';
```

**Impact:**
- `memberships` table: No longer contains platform_admin rows
- `user_roles` table: Now contains platform_admin rows with `role_entity_id = NULL`
- `organizations` table: No rows with `type = 'platform'`

### 2. Access Context Resolution Changes

**File:** `packages/shared-access-context/src/index.ts`

**Change:** Query logic remains identical (still joins both tables), interpretation remains identical (platform_admin still comes from combined roles array).

**Why no code change needed:** The current implementation already unions roles from both tables and checks for `'platform_admin'` in the combined array. Moving platform_admin rows from memberships to user_roles doesn't change the query structure or the role derivation logic.

**Verification test:**
```typescript
// Before: platform_admin in memberships
// memberships: [{ role_name: 'platform_admin', organization_id: '<platform-org-id>' }]
// user_roles: []
// → roles = ['platform_admin'], isPlatformAdmin = true

// After: platform_admin in user_roles
// memberships: []
// user_roles: [{ role_name: 'platform_admin', role_entity_id: null }]
// → roles = ['platform_admin'], isPlatformAdmin = true
```

### 3. Identity Service Changes

#### UserRoleServiceV2

**File:** `services/identity-service/src/v2/user-roles/service.ts`

**Current behavior:**
- `createUserRole()` requires `role_entity_id` (validation throws if missing)
- Only platform_admin can create user_roles

**Changes needed:**

```typescript
async createUserRole(clerkUserId: string, roleData: any) {
    this.logger.info({ user_id: roleData.user_id, role_name: roleData.role_name }, 'UserRoleService.createUserRole');

    if (!roleData.user_id) throw new Error('User ID is required');
    if (!roleData.role_name) throw new Error('Role name is required');

    // NEW: Allow platform_admin without role_entity_id
    if (roleData.role_name === 'platform_admin') {
        // Platform admin is system-level, no entity linkage
        if (roleData.role_entity_id) {
            throw new Error('platform_admin role should not have role_entity_id');
        }
    } else {
        // Entity-linked roles (recruiter, candidate) require role_entity_id
        if (!roleData.role_entity_id) {
            throw new Error('Role entity ID is required for entity-linked roles');
        }
    }

    const userRole = await this.repository.createUserRole({
        id: uuidv4(),
        user_id: roleData.user_id,
        role_name: roleData.role_name,
        role_entity_id: roleData.role_entity_id || null,  // NULL for platform_admin
        role_entity_type: roleData.role_entity_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    await this.eventPublisher.publish('user_role.created', {
        user_role_id: userRole.id,
        user_id: userRole.user_id,
        role_name: userRole.role_name,
        role_entity_id: userRole.role_entity_id,
    });

    return userRole;
}
```

**Impact:** UserRoleServiceV2 now handles both entity-linked roles AND system-level platform_admin.

#### MembershipServiceV2

**File:** `services/identity-service/src/v2/memberships/service.ts`

**Current behavior:**
- Can create memberships with `role_name = 'platform_admin'`
- Requires platform_admin OR company_admin (for org-level) authorization

**Changes needed:**

```typescript
async createMembership(clerkUserId: string, membershipData: any) {
    // NEW: Reject platform_admin assignments in memberships
    if (membershipData.role_name === 'platform_admin') {
        throw new Error('platform_admin role must be assigned via user_roles, not memberships');
    }

    // Existing validation...
    if (!membershipData.organization_id) throw new Error('Organization ID is required');
    if (!['company_admin', 'hiring_manager'].includes(membershipData.role_name)) {
        throw new Error('Invalid role for membership. Use company_admin or hiring_manager.');
    }

    // Rest remains unchanged...
}
```

**Impact:** MembershipServiceV2 rejects platform_admin assignments, enforces only company_admin/hiring_manager allowed.

### 4. Frontend Changes

**No changes required** to user-profile-context.tsx or role display logic.

**Why:** Frontend consumes `GET /api/v2/users/me` which returns enriched user with `roles` and `is_platform_admin` derived from `resolveAccessContext()`. Since access context resolution logic doesn't change, frontend receives same data structure.

**Verification:**
- Before: `{ roles: ['platform_admin'], is_platform_admin: true }`
- After: `{ roles: ['platform_admin'], is_platform_admin: true }`

### 5. API Gateway Changes

**No changes required.**

**Why:** API gateway only performs authentication (verify JWT exists). Authorization happens in services via `resolveAccessContext()`, which already works correctly after the migration.

## Component Dependency Graph

```
DATABASE SCHEMA
    ↓
resolveAccessContext (shared-access-context)
    ↓
┌───────────────────────────────────────┐
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Identity Service (Backend)     │ │
│  │  - UserRoleServiceV2 (modified) │ │
│  │  - MembershipServiceV2 (modified)│ │
│  │  - UserServiceV2 (no change)    │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  ATS Service (Backend)          │ │
│  │  - Uses resolveAccessContext()  │ │
│  │  - No code change needed        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Network Service (Backend)      │ │
│  │  - Uses resolveAccessContext()  │ │
│  │  - No code change needed        │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │  Billing Service (Backend)      │ │
│  │  - Uses resolveAccessContext()  │ │
│  │  - No code change needed        │ │
│  └─────────────────────────────────┘ │
│                                       │
└───────────────────────────────────────┘
    ↓
API Gateway (no change)
    ↓
Portal Frontend (no change)
    ↓
UserProfileContext (no change)
```

## Integration Points

### Critical Integration Point 1: resolveAccessContext

**Component:** `packages/shared-access-context/src/index.ts`

**Current behavior:** Joins users → memberships + user_roles, unions role names

**Required change:** NONE (query structure unchanged, interpretation unchanged)

**Verification strategy:**
1. Write integration test with platform_admin in user_roles (role_entity_id=NULL)
2. Verify `isPlatformAdmin = true` returned
3. Verify roles array includes `'platform_admin'`

**Risk:** LOW (no code change, only data location change)

### Critical Integration Point 2: UserRoleServiceV2

**Component:** `services/identity-service/src/v2/user-roles/service.ts`

**Current behavior:** Requires role_entity_id for all role assignments

**Required change:** Conditional validation — platform_admin skips entity_id requirement

**Downstream consumers:**
- `POST /v2/user-roles` route (identity-service)
- Platform admin UI for assigning roles (if exists)

**Verification strategy:**
1. Create platform_admin assignment via API: `POST /v2/user-roles { user_id, role_name: 'platform_admin' }`
2. Verify row created with role_entity_id=NULL
3. Verify user can access platform-admin-only endpoints

**Risk:** MEDIUM (logic change in validation, needs thorough testing)

### Critical Integration Point 3: MembershipServiceV2

**Component:** `services/identity-service/src/v2/memberships/service.ts`

**Current behavior:** Allows platform_admin assignments via memberships

**Required change:** Reject platform_admin assignments with clear error message

**Downstream consumers:**
- `POST /v2/memberships` route (identity-service)
- Organization management UI (if users can assign roles there)

**Verification strategy:**
1. Attempt to create platform_admin membership via API
2. Verify 400 error with message: "platform_admin role must be assigned via user_roles"

**Risk:** LOW (simple validation guard, clear error handling)

### Non-Critical Integration Point: Organization Type Constraint

**Component:** `organizations` table type check constraint

**Current behavior:** Allows `type IN ('company', 'platform')`

**Required change:** Remove 'platform' from allowed values (optional cleanup)

**Why non-critical:** After deleting platform organization, constraint violation can't occur. Cleanup is for schema hygiene only.

## Suggested Build Order

### Phase 1: Database Migration (Foundational)

**Why first:** All code changes depend on schema changes being in place.

**Tasks:**
1. Write migration script (make role_entity_id nullable, move platform_admin rows, delete platform org)
2. Test migration on staging database
3. Verify data migration counts (platform_admin rows moved = platform_admin rows deleted from memberships)
4. Apply migration

**Dependencies:** None (foundational)

**Deliverable:** Migration file `20260XXX_move_platform_admin_to_user_roles.sql`

### Phase 2: Backend Service Logic (Core)

**Why second:** Services consume the new schema structure.

**Tasks:**
1. Update `UserRoleServiceV2.createUserRole()` validation (allow platform_admin without entity_id)
2. Update `MembershipServiceV2.createMembership()` validation (reject platform_admin)
3. Write unit tests for new validation logic
4. Write integration tests for platform_admin assignment flow

**Dependencies:** Phase 1 (requires schema changes)

**Deliverable:** Modified service files + tests

### Phase 3: Verification & Testing (Quality Gate)

**Why third:** Ensures existing functionality unaffected.

**Tasks:**
1. Test `resolveAccessContext()` with platform_admin in user_roles
2. Test existing platform admin users can still access admin endpoints
3. Test role assignment API endpoints (user_roles, memberships)
4. Test frontend role display (UserProfileContext)

**Dependencies:** Phase 1, Phase 2

**Deliverable:** Test suite passing, manual QA checklist completed

### Phase 4: Documentation & Cleanup (Polish)

**Why last:** System is functional, documentation reflects new reality.

**Tasks:**
1. Update `docs/guidance/user-roles-and-permissions.md` (remove platform org references)
2. Update table comments in migrations (already part of Phase 1 migration)
3. Update API documentation for role assignment endpoints
4. Update `.planning/STATE.md` to mark milestone complete

**Dependencies:** Phase 3 (requires verified working system)

**Deliverable:** Documentation updated

## Data Flow Changes

### Before: Platform Admin Assignment Flow

```
1. Admin UI → POST /v2/memberships
2. MembershipServiceV2.createMembership()
   ↓ validates role_name = 'platform_admin'
   ↓ requires organization_id = '<platform-org-id>'
3. MembershipRepository.createMembership()
   ↓ INSERT INTO memberships (user_id, role_name='platform_admin', organization_id='<platform-org>')
4. Event: membership.created
```

### After: Platform Admin Assignment Flow

```
1. Admin UI → POST /v2/user-roles
2. UserRoleServiceV2.createUserRole()
   ↓ validates role_name = 'platform_admin'
   ↓ skips role_entity_id requirement (allows NULL)
3. UserRoleRepository.createUserRole()
   ↓ INSERT INTO user_roles (user_id, role_name='platform_admin', role_entity_id=NULL, role_entity_type=NULL)
4. Event: user_role.created
```

### Access Context Resolution Flow (Unchanged)

```
1. Service calls resolveAccessContext(supabase, clerkUserId)
2. Query: SELECT users + memberships + user_roles WHERE clerk_user_id = ?
3. Parse results:
   - memberships: [{ role_name: 'company_admin', org_id: '...' }]
   - user_roles: [{ role_name: 'platform_admin', entity_id: NULL }]  ← NEW location
4. Union role names: ['company_admin', 'platform_admin']
5. Return AccessContext { isPlatformAdmin: true, roles: ['company_admin', 'platform_admin'], ... }
```

**Key insight:** Step 2 query is the same. Step 3 parsing is the same (both tables read, roles unioned). Step 5 result is the same.

## Risk Assessment

| Component | Change Type | Risk Level | Mitigation |
|-----------|-------------|------------|------------|
| Database schema | Data migration | MEDIUM | Test migration on staging first, verify counts, rollback plan ready |
| resolveAccessContext | No change | LOW | Integration tests verify platform_admin still detected |
| UserRoleServiceV2 | Logic change (validation) | MEDIUM | Unit tests for validation paths, integration tests for API |
| MembershipServiceV2 | Logic change (reject platform_admin) | LOW | Simple guard clause, clear error message |
| Frontend UserProfileContext | No change | LOW | Existing tests should pass unchanged |
| API Gateway | No change | NONE | No code modified |
| Other V2 Services (ATS, Network, etc.) | No change | LOW | Use resolveAccessContext (unchanged), should work transparently |

## Rollback Strategy

### If Issues Discovered Post-Migration

**Scenario:** Platform admins can't access admin endpoints after migration.

**Rollback steps:**
1. Restore database from backup (pre-migration)
2. Revert backend service changes (git revert)
3. Redeploy services
4. Verify platform admin access restored

**Prevention:**
- Test thoroughly on staging before production migration
- Keep migration reversible (add DOWN migration script)
- Maintain database backups before schema changes

### Partial Rollback (If Only Service Logic Broken)

**Scenario:** Migration succeeded, but service validation logic has bugs.

**Rollback steps:**
1. Revert service code changes (keep database as-is)
2. Temporarily allow platform_admin in memberships again (emergency patch)
3. Fix service logic bugs
4. Re-deploy corrected services

**Why possible:** Database migration is idempotent. Services can be re-deployed without re-running migration.

## Testing Strategy

### Unit Tests

**UserRoleServiceV2:**
- Test: `createUserRole({ role_name: 'platform_admin', user_id: '...' })` succeeds with NULL entity_id
- Test: `createUserRole({ role_name: 'recruiter', user_id: '...' })` fails without entity_id
- Test: `createUserRole({ role_name: 'platform_admin', role_entity_id: 'xyz' })` fails (platform_admin shouldn't have entity)

**MembershipServiceV2:**
- Test: `createMembership({ role_name: 'platform_admin', ... })` throws error
- Test: `createMembership({ role_name: 'company_admin', ... })` succeeds

### Integration Tests

**Access Context Resolution:**
- Test: User with platform_admin in user_roles (entity_id=NULL) → `isPlatformAdmin = true`
- Test: User with company_admin in memberships + recruiter in user_roles → roles = ['company_admin', 'recruiter']

**API Endpoints:**
- Test: `POST /v2/user-roles { user_id, role_name: 'platform_admin' }` → 201 Created, row in user_roles
- Test: `POST /v2/memberships { user_id, role_name: 'platform_admin', org_id }` → 400 Bad Request
- Test: Platform admin user can access `GET /v2/users` (admin-only endpoint)

### Manual QA Checklist

- [ ] Platform admin user can log in to portal
- [ ] Platform admin user sees admin navigation menu
- [ ] Platform admin user can view all organizations
- [ ] Platform admin user can assign roles to other users
- [ ] Non-admin user cannot access admin endpoints (authorization unchanged)
- [ ] Role display in user profile shows "Platform Admin" badge

## Success Criteria

- [ ] Migration completes without errors
- [ ] All platform_admin rows moved from memberships to user_roles
- [ ] Platform organization (type='platform') deleted
- [ ] `resolveAccessContext()` returns `isPlatformAdmin=true` for migrated users
- [ ] Platform admin users can access admin-only endpoints
- [ ] Role assignment APIs reject invalid requests with clear errors
- [ ] All integration tests pass
- [ ] Frontend role display shows platform_admin correctly
- [ ] No regression in existing role-based access control

## Open Questions & Considerations

### 1. Frontend Admin UI for Role Assignment

**Question:** Does the portal have a UI for assigning platform_admin role?

**Investigation needed:** Search for role assignment forms in `apps/portal/src/app/portal/admin/`

**Impact:** If UI exists, it needs to be updated to call `POST /v2/user-roles` instead of `POST /v2/memberships` for platform_admin.

**Mitigation:** Backend validation will reject incorrect API calls, preventing silent failures.

### 2. Platform Organization References

**Question:** Are there other services or features that reference the platform organization by ID?

**Investigation needed:**
```sql
SELECT * FROM organizations WHERE type = 'platform';
-- Get platform_org_id
SELECT * FROM <other_tables> WHERE organization_id = '<platform_org_id>';
```

**Impact:** If other tables have foreign keys to platform organization, migration will fail on DELETE.

**Mitigation:** Identify all references before migration. Either cascade delete or migrate references.

### 3. Event Schema Changes

**Question:** Do any event consumers expect `membership.created` events for platform_admin?

**Investigation needed:** Search for event subscribers handling `membership.created` where `role_name = 'platform_admin'`

**Impact:** Switching to `user_role.created` event might break downstream processors.

**Mitigation:** Document event schema change. Ensure consumers handle both event types during transition period.

## Architectural Patterns Validated

### Pattern 1: Dual-Table Role Storage

**Validation:** This restructure PROVES the dual-table pattern works correctly.

- memberships: Org-scoped roles → organization_id NOT NULL
- user_roles: Entity-linked roles → role_entity_id NOT NULL (previously)
- user_roles: System-level roles → role_entity_id NULL (new)

**Why it works:** `resolveAccessContext()` unions both tables. Moving a role between tables doesn't break the union logic.

### Pattern 2: Service-Level Authorization

**Validation:** Gateway only authenticates. Services authorize via `resolveAccessContext()`.

**Why it works:** This restructure changes WHERE platform_admin lives in the database, but not HOW services determine authorization. Services still call `resolveAccessContext()`, get `isPlatformAdmin=true`, and enforce permissions accordingly.

### Pattern 3: Backend-Enriched User Profile

**Validation:** Frontend receives user profile with roles from backend, doesn't query tables directly.

**Why it works:** UserServiceV2 calls `resolveAccessContext()` to enrich user record. Frontend receives same `{ roles: ['platform_admin'], is_platform_admin: true }` structure regardless of which table stores the role.

## Conclusion

This restructure is **architecturally sound** because it:

1. **Aligns with existing patterns:** Dual-table role storage (memberships for org-scoped, user_roles for entity/system-level)
2. **Minimizes code changes:** Core access resolution logic unchanged, only service validation logic modified
3. **Maintains backward compatibility:** Frontend and other services unaffected due to backend abstraction
4. **Improves semantic clarity:** Platform admin is system-level, not org-level — now modeled correctly

**Recommended build order:**
1. Database migration (foundational)
2. Backend service logic (core changes)
3. Verification & testing (quality gate)
4. Documentation & cleanup (polish)

**Critical dependencies:**
- Phase 2 depends on Phase 1 (services need migrated schema)
- Phase 3 depends on Phase 1+2 (tests verify migrated data + new logic)
- Phase 4 depends on Phase 3 (document working system)

**No circular dependencies detected.** Build order is clear and incremental.
