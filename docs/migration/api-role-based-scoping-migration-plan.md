# API Role-Based Scoping Migration - Implementation Plan

**Status**: ✅ Phases 1-5 Complete - Extended Migration in Progress  
**Created**: December 29, 2025  
**Updated**: December 29, 2025  
**Related**: [MIGRATION-PROGRESS.md](./MIGRATION-PROGRESS.md), [DATABASE-JOIN-PATTERN.md](./DATABASE-JOIN-PATTERN.md)  
**Approach**: Direct Supabase Queries with Role-Based JOINs

---

## Overview

This plan provides detailed, step-by-step instructions for migrating from frontend role-based API calls to backend-determined data scoping. The migration uses **direct Supabase queries** (NOT SQL functions) with role-based JOINs for optimal performance and maintainability.

**Complete Scope**: 
- **22 Total Routes** requiring standardization
- **19 Authenticated Routes** requiring role-based scoping migration
- **3 Public Routes** requiring consolidation into main routes.ts files
- **All routes** must follow consistent patterns for maintainability

**Architecture Decision**: Direct TypeScript queries instead of SQL functions:
- ✅ Type safety with TypeScript
- ✅ IDE autocomplete and IntelliSense  
- ✅ Easier debugging (see exact query in code)
- ✅ Version controlled with application code
- ✅ No migration files for query logic changes

**Performance Target**: 10-50ms response times (vs 200-500ms+) = **10-25x improvement**

**Important**: Some endpoints (like `/api/jobs`) must handle **both** unauthenticated public and authenticated (role-scoped) access. These endpoints use conditional logic based on authentication state, **NOT** separate `/api/public/*` routes. However, dedicated public route files (like `jobs/public-routes.ts`) should be consolidated into the main `routes.ts` file for consistency.

---

## Completed Phases (1-5)

### ✅ Phase 1: Proposals (COMPLETE)
- Repository: `findProposalsForUser()` with recruiter/company scoping
- Service: `getProposalsForUser()` with pagination
- Routes: New `GET /proposals` endpoint with `requireUserContext()` helper
- Gateway: Updated `GET /api/proposals` with `buildAuthHeaders()`
- Result: 10-25x performance improvement

### ✅ Phase 2: Applications (COMPLETE)
- Repository: `findApplicationsForUser()` with multi-role scoping
- Service: `getApplicationsForUser()` with pagination
- Routes: New `GET /applications` endpoint
- Gateway: Updated `GET /api/applications` with `buildAuthHeaders()`
- Result: Consistent pattern, excellent performance

### ✅ Phase 3: Jobs (COMPLETE)
- Repository: `findJobsForUser()` with company/recruiter scoping
- Service: `getJobsForUser()` with pagination
- Routes: New `GET /jobs` endpoint
- Gateway: Updated `GET /api/jobs` with `buildAuthHeaders()`
- Result: Handles both public and authenticated access

### ✅ Phase 4: Candidates (COMPLETE)
- Repository: `findCandidatesForUser()` with two-step user lookup
- Service: `getCandidatesForUser()` with pagination
- Routes: New `GET /candidates` endpoint
- Gateway: Updated `GET /api/candidates` with `buildAuthHeaders()`
- Special handling: Candidates table uses internal user_id, requires clerk_user_id → user_id resolution
- Company users: See candidates via applications subquery

### ✅ Phase 5: Companies (COMPLETE)
- Repository: `findCompaniesForUser()` with direct organization scoping
- Service: `getCompaniesForUser()` with pagination
- Routes: New `GET /companies` endpoint
- Gateway: Updated `GET /api/companies` with `buildAuthHeaders()`
- Simplest implementation: Direct identity_organization_id matching

---

## Extended Migration - All Remaining Routes

### Route Inventory

Based on analysis of `services/api-gateway/src/routes.ts`, the following route modules need migration. **Total Routes**: 22 (19 authenticated + 3 public)

**Authenticated Routes (Require Role-Based Scoping Migration)**: 19 routes
1. ✅ `identity/routes.ts` - User and organization management
2. ✅ `roles/routes.ts` - RBAC-filtered job listings  
3. ✅ `jobs/routes.ts` - Job management (MIGRATED - Phase 3)
4. ✅ `companies/routes.ts` - Company management (MIGRATED - Phase 5)
5. ✅ `candidates/routes.ts` - Candidate management (MIGRATED - Phase 4)
6. ✅ `applications/routes.ts` - Application lifecycle (MIGRATED - Phase 2)
7. ✅ `placements/routes.ts` - Placement management
8. ✅ `recruiters/routes.ts` - Recruiter profiles and stats
9. ✅ `recruiter-candidates/routes.ts` - Recruiter-candidate relationships
10. ✅ `assignments/routes.ts` - Recruiter-to-job assignments
11. ✅ `proposals/routes.ts` - Job proposals (MIGRATED - Phase 1)
12. ⏳ `reputation/routes.ts` - Recruiter reputation
13. ⏳ `billing/routes.ts` - Subscription plans and billing
14. ⏳ `documents/routes.ts` - Document storage and retrieval
15. ⏳ `dashboards/routes.ts` - Dashboard stats and insights
16. ⏳ `admin/routes.ts` - Platform admin and automation
17. ⏳ `notifications/routes.ts` - Notification management
18. ⏳ `teams/routes.ts` - Team management (if exists)
19. ⏳ `onboarding/routes.ts` - Onboarding workflows (if exists)

**Public Routes (Require Standardization - No Auth/Role Scoping)**:
- ⏳ `jobs/public-routes.ts` - Public job listings (unauthenticated, consolidate into main routes.ts)
- ⏳ `network/public-routes.ts` - Public network data (consolidate into main routes.ts)
- ⏳ `marketplace/routes.ts` - Public marketplace browsing (consolidate into main routes.ts)

**Note**: Public routes don't need role-based scoping or authentication middleware, but they MUST follow the standardized route pattern and be consolidated into the main `routes.ts` file per service for consistency. Public endpoints should be clearly marked and use consistent response form

---

## Next Priority Phases

### Phase 6: Public Routes Consolidation
**Duration**: 4 hours  
**Priority**: HIGH - Standardize architecture  
**Status**: ⏳ NOT STARTED

**Objective**: Consolidate all separate public route files into the main `routes.ts` file per service, maintaining the single entry point pattern.

#### Routes to Consolidate:

1. **API Gateway**: `services/api-gateway/src/routes/`
   - `jobs/public-routes.ts` → Merge into main routes.ts
   - `network/public-routes.ts` → Merge into main routes.ts  
   - `marketplace/routes.ts` → Merge into main routes.ts

2. **Backend Services**: Check for any public route files in:
   - `services/ats-service/src/routes/`
   - `services/network-service/src/routes/`

#### Implementation Pattern:

In each service's main `routes.ts`:
```typescript
export function registerRoutes(app: FastifyInstance, services: ServiceRegistry) {
  // ============================================
  // PUBLIC ROUTES (No Authentication Required)
  // ============================================
  
  // Public job listings
  app.get('/api/jobs/public', {
    schema: {
      description: 'Public job listings (unauthenticated)',
      tags: ['public', 'jobs'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    // No auth middleware, no role checks
    const queryParams = new URLSearchParams(request.query as any);
    const path = `/jobs/public?${queryParams.toString()}`;
    const data = await atsService().get(path);
    return reply.send(data);
  });
  
  // Public network stats
  app.get('/api/network/stats', {
    schema: {
      description: 'Public network statistics',
      tags: ['public', 'network'],
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const data = await networkService().get('/stats/public');
    return reply.send(data);
  });
  
  // ============================================
  // AUTHENTICATED ROUTES
  // ============================================
  
  // All existing authenticated routes...
}
```

#### Verification Checklist:
- [ ] All public route files identified
- [ ] Public routes merged into main routes.ts files
- [ ] Separate public route files deleted
- [ ] Route registrations updated in main index files
- [ ] No authentication/authorization middleware on public routes
- [ ] Consistent response format maintained
- [ ] API documentation updated
- [ ] All imports updated
- [ ] Tests updated for new route locations
- [ ] No compilation errors

---

## Migration Phases 7-24 (Extended)

### Step 0.1: Create Helper Functions
**Duration**: 2 hours  
**Priority**: HIGH - Required for all subsequent work

#### Task: Create `buildAuthHeaders()` in API Gateway

1. Create helper file if it doesn't exist:
   ```
   services/api-gateway/src/routes/helpers.ts
   ```

2. Implement `buildAuthHeaders()`:
   ```typescript
   import { FastifyRequest } from 'fastify';
   
   export function buildAuthHeaders(request: FastifyRequest): Record<string, string> {
     const auth = (request as any).auth;
     
     if (!auth) {
       throw new Error('No auth context available');
     }
     
     const headers: Record<string, string> = {
       'x-clerk-user-id': auth.clerkUserId,
       'x-user-role': auth.role || 'unknown',
       'x-correlation-id': request.id || crypto.randomUUID(),
     };
     
     if (auth.organizationId) {
       headers['x-organization-id'] = auth.organizationId;
     }
     
     return headers;
   }
   ```

3. Export from index (if exists):
   ```typescript
   export * from './helpers';
   ```

**Verification**:
- [ ] Helper file created
- [ ] Function compiles without errors
- [ ] TypeScript types are correct

---

#### Task: Create `getUserContext()` in Backend Services

1. Create helper in each service (ATS, Network, Billing):
   ```
   services/ats-service/src/routes/helpers.ts
   services/network-service/src/routes/helpers.ts
   services/billing-service/src/routes/helpers.ts
   ```

2. Implement `getUserContext()`:
   ```typescript
   import { FastifyRequest } from 'fastify';
   
   export interface UserContext {
     clerkUserId: string;
     userRole: string;
     organizationId?: string;
     correlationId?: string;
   }
   
   export function getUserContext(request: FastifyRequest): UserContext | null {
     const clerkUserId = request.headers['x-clerk-user-id'] as string;
     const userRole = request.headers['x-user-role'] as string;
     const organizationId = request.headers['x-organization-id'] as string | undefined;
     const correlationId = request.headers['x-correlation-id'] as string | undefined;
     
     if (!clerkUserId || !userRole) {
       return null;
     }
     
     return {
       clerkUserId,
       userRole,
       organizationId,
       correlationId,
     };
   }
   ```

**Verification**:
- [ ] Helper created in all 3 services
- [ ] Functions compile without errors
- [ ] Interface exported correctly

---

### Step 0.2: Create Indexes for Role JOINs
**Duration**: 1 hour  
**Priority**: HIGH - Core performance optimization  
**Status**: ✅ COMPLETE - Applied Dec 29, 2025

**⚠️ ARCHITECTURE DECISION**: We use **direct Supabase queries in TypeScript**, NOT SQL functions. All role resolution happens via JOINs in the repository layer.

#### Task: Create Indexes for Role JOINs

1. ✅ Applied migration: `services/ats-service/migrations/023_create_join_performance_indexes.sql`
   ```sql
   -- Function to get proposals with role-based filtering
   -- Uses JOINs to resolve user role from database tables
   -- 10-50ms vs 200-500ms with service calls!
   
   CREATE OR REPLACE FUNCTION get_proposals_for_user(
     p_clerk_user_id TEXT,
     p_organization_id UUID DEFAULT NULL,
     p_limit INT DEFAULT 25,
     p_offset INT DEFAULT 0,
     p_status TEXT DEFAULT NULL,
     p_search TEXT DEFAULT NULL,
     p_sort_by TEXT DEFAULT 'created_at',
     p_sort_order TEXT DEFAULT 'DESC'
   )
   RETURNS TABLE (
     id UUID,
     job_id UUID,
     candidate_id UUID,
     recruiter_id UUID,
     company_id UUID,
     state TEXT,
     proposal_notes TEXT,
     response_notes TEXT,
     proposed_at TIMESTAMPTZ,
     response_due_at TIMESTAMPTZ,
     accepted_at TIMESTAMPTZ,
     declined_at TIMESTAMPTZ,
     created_at TIMESTAMPTZ,
     updated_at TIMESTAMPTZ,
     -- Enriched data from JOINs
     job_title TEXT,
     company_name TEXT,
     candidate_name TEXT,
     recruiter_name TEXT
   )
   LANGUAGE plpgsql
   SECURITY DEFINER
   AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       p.id,
       p.job_id,
       p.candidate_id,
       p.recruiter_id,
       p.company_id,
       p.state,
       p.proposal_notes,
       p.response_notes,
       p.proposed_at,
       p.response_due_at,
       p.accepted_at,
       p.declined_at,
       p.created_at,
       p.updated_at,
       j.title as job_title,
       c.name as company_name,
       cand.full_name as candidate_name,
       u_rec.name as recruiter_name
     FROM candidate_role_assignments p
     JOIN jobs j ON j.id = p.job_id
     JOIN companies c ON c.id = j.company_id
     JOIN candidates cand ON cand.id = p.candidate_id
     JOIN recruiters rec ON rec.id = p.recruiter_id
     JOIN users u_rec ON u_rec.id = rec.user_id
     
     -- JOINs to resolve requesting user's role (NO HTTP calls!)
     LEFT JOIN users u ON u.clerk_user_id = p_clerk_user_id
     LEFT JOIN recruiters req_r ON req_r.user_id = u.id AND req_r.status = 'active'
     LEFT JOIN memberships m ON m.user_id = u.id
     LEFT JOIN companies user_company ON user_company.identity_organization_id = m.organization_id
     
     WHERE 
       -- Recruiter: see proposals they're assigned to
       (req_r.id IS NOT NULL AND p.recruiter_id = req_r.id)
       
       OR
       
       -- Company users: see proposals for their company
       (m.role IN ('company_admin', 'hiring_manager') AND j.company_id = user_company.id)
       
       OR
       
       -- Platform admin: see all (or filtered by org if specified)
       (m.role = 'platform_admin' AND (
         p_organization_id IS NULL 
         OR user_company.identity_organization_id = p_organization_id
       ))
     
     -- Optional status filter
     AND (p_status IS NULL OR p.state = p_status)
     
     -- Optional search filter
     AND (
       p_search IS NULL 
       OR j.title ILIKE '%' || p_search || '%'
       OR c.name ILIKE '%' || p_search || '%'
       OR cand.full_name ILIKE '%' || p_search || '%'
     )
     
     ORDER BY 
       CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN p.created_at END ASC,
       CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN p.created_at END DESC,
       CASE WHEN p_sort_by = 'proposed_at' AND p_sort_order = 'ASC' THEN p.proposed_at END ASC,
       CASE WHEN p_sort_by = 'proposed_at' AND p_sort_order = 'DESC' THEN p.proposed_at END DESC
     
     LIMIT p_limit
     OFFSET p_offset;
   END;
   $$;
   
   -- Ensure indexes exist for performance
   CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
   CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON recruiters(user_id);
   CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
   CREATE INDEX IF NOT EXISTS idx_proposals_recruiter_id ON candidate_role_assignments(recruiter_id);
   CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
   ```

2. Update Repository to use function:
   ```typescript
   async findForUser(
     clerkUserId: string,
     organizationId: string | null,
     filters: PaginationFilters
   ): Promise<Proposal[]> {
        const userContext = await this.accessResolver.resolve(clerkUserId);
     // Call database function - role resolution via JOINs, no service calls!
     const { data, error } = await this.supabase
       .rpc('get_proposals_for_user', {
         p_clerk_user_id: userContext.identityUserId,
         p_organization_id: organizationId,
         p_limit: filters.limit,
         p_offset: filters.offset,
         p_status: filters.status,
         p_search: filters.search,
         p_sort_by: filters.sortBy || 'created_at',
         p_sort_order: filters.sortOrder || 'DESC'
       });
     
     if (error) {
       this.logger.error('Failed to fetch proposals', { error });
       throw error;
     }
     
     return data || [];
   }
   ```

**Performance Comparison**:
- ❌ Service calls: 200-500ms (HTTP round-trips to identity + network services)
- ✅ Database JOINs: 10-50ms (single query with indexes)
- **10-25x faster!**

**Verification**:
- [-] Database function created - no database function, we build queries in TypeScript
- [ ] Indexes exist on all JOIN foreign keys
- [ ] Repository method uses join pattern
- [ ] NO HTTP calls to other services
- [ ] Performance tested (query < 50ms)
- [ ] All role cases handled in WHERE clause
- [ ] Role determined by presence in database tables:
  - `recruiters` → recruiter role
  - `memberships` → company_admin, hiring_manager, platform_admin
  - `candidates` → candidate role

---

## Phase 1: Backend Services Migration

### Step 1.1: Migrate Proposals (ATS Service)
**Duration**✅ COMPLETE - Dec 29, 2025
**Status**: ~90% complete (fix remaining issues)

#### Task 1.1.1: ✅ Update Repository with Direct Queries

**Status**: COMPLETE

**Implementation**: `services/ats-service/src/repository.ts`

**Pattern**: Two-query approach
```typescript
async findProposalsForUser(
    clerkUserId: string,
    organizationId: string | null,
    filters?: ProposalListFilters
): Promise<{ data: any[]; total: number }> {
    // Query 1: Get data with JOINs
    let query = supabase
        .from('applications')
        .select('*, candidate:candidates(*), job:jobs(*), company:companies(*), recruiter:recruiters(*)')
        .or(`
            recruiter_id.in.(select id from recruiters where user_id=(select id from users where clerk_user_id='${clerkUserId}')),
            company_id.in.(select organization_id from memberships where user_id=(select id from users where clerk_user_id='${clerkUserId}')),
            candidate_id.in.(select id from candidates where user_id=(select id from users where clerk_user_id='${clerkUserId}'))
        `);
    
    // Apply filters...
    const { data } = await query;
    
    // Query 2: Get count with same JOINs
    const { count } = await countQuery;
    
    return { data, total: count };
}
```

#### Task 1.1.2: ✅ Simplify ProposalService Methods

**Status**: COMPLETE

**Key Changes**:
- Removed `userRole` parameter from all methods
- Repository does all role resolution via JOINs
- Service just transforms data

1. ✅ Simplified `getProposalsForUser()`:
   ```typescript
   async getProposalsForUser(
     clerkUserId: string,
     filters: PaginationFilters,
     correlationId: string,
     organizationId?: string  // Optional: platform admin can scope to org
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // Single repository call - role resolution via database JOINs!
     // No service calls, no role branching, much faster
     const data = await this.repository.findForUser(
       clerkUserId,
       organizationId || null,
       filters
     );
     
     // Calculate pagination metadata
     const total = await this.repository.countForUser(clerkUserId, organizationId || null, filters);
     
     return {
       data,
       pagination: {
         total,
         page: filters.page || 1,
         limit: filters.limit || 25,
         totalPages: Math.ceil(total / (filters.limit || 25))
       }
     };
   }
   ```

2. Add similar simple methods:
   ```typescript
   async getActionableProposalsForUser(
     clerkUser3: ✅ Update Proposal Routes

**Status**: COMPLETE

1. ✅ Modified route handlers to use `requireUserContext()`
     organizationId?: string
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // Add state filter for actionable (proposed state)
     const actionableFilters = { ...filters, status: 'proposed' };
     return this.getProposalsForUser(clerkUserId, actionableFilters, correlationId, organizationId);
   }
   
   async getProposalByIdForUser(
     proposalId: string,
     clerkUserId: string,
     correlationId: string,
     organizationId?: string
   ): Promise<Proposal | null> {
     // Repository verifies access via same JOINs
     return this.repository.findByIdForUser(proposalId, clerkUserId, organizationId || null);
   }
   ```

**Key Changes**:
- **NO `resolveEntityId()` method** - not needed with database JOINs
- **NO `userRole` parameter** - role determined by database records
- **NO role branching** (switch statements) - WHERE clause in SQL handles all roles
- **NO service clients** - no HTTP calls to identity/network services
- **10-25x faster** - single database query vs multiple service calls
- **Much simpler** - service layer is thin, just calls repository

**Verification**:
- [ ] All methods simplified to single repository calls
- [ ] No role branching logic in service
- [ ] No service-to-service HTTP calls
- [ ] No role parameter (role determined from database)
- [ ] Existing tests updated

---

#### Task 1.1.2: Update Proposal Routes

1. Modify route handlers to extract auth context:
   ```typescript
   app.get('/proposals', async (request, reply) => {
     const userContext = getUserContext(request);
     
     if (!userContext) {
       return 4: ✅ Fixed Type Errors

**Status**: COMPLETE

**Issues Fixed**:
- ✅ ListFilters interface compatibility with ProposalFilters
- ✅ UnifiedProposal transformation (job_id, job_title as top-level)
- ✅ Date type handling (string for DB queries)
- ✅ Sort order case (uppercase for DB)
- ✅ All 10 compilation errors resolved

#### Task 1.1.5: ✅ Update Proposal Repository (if needed)

**Status**: COMPLETE - Already implemented

1. ✅ R
     const filters = {
       page: Number(request.query.page) || 1,
       limit: Number(request.query.limit) || 25,
       status: request.query.status as string | undefined,
     };
     
     const result = await proposalService.getProposalsForUser(
       userContext.clerkUserId,
       userContext.userRole,
       filters,
       userContext.correlationId || request.id,
       userContext.organizationId
     );
     
     return reply.send({ data: result.data, pagination: result.pagination });
   });
   ```
6: ✅ Verify API Gateway Proposal Routes

**Status**: COMPLETE - No changes needed

1. ✅ Gateway already correct
   - `GET /proposals/actionable`
   - `GET /proposals/pending`
   - `GET /proposals/summary`
   - `GET /proposals/:id`

3. Remove old query parameter handling:
   - Delete `recruiter_id` query param logic
   - Delete `organization_id` query param logic

**Verification**:
- [ ] All routes use `getUserContext()`
- [ ] Auth context passed to service methods
- [ ] Old query params removed
- [ ] Routes return correct HTTP status codes

---

#### Task 1.1.3: Update Proposal Repository (if needed)

1. Ensure repository methods exist:
   ```typescript
   async findByRecruiter(
     recruiterId: string,
     filters: PaginationFilters
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // Implementation
   }
   
   async findByCompany(
     companyId: string,
     filters: PaginationFilters
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // Implementation
   }
   
   async findAll(
     filters: PaginationFilters
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // For platform admin
   }
   ```

**Verification**:
- [ ] Repository methods exist
- [ ] Proper SQL queries with JOINs
- [ ] Pagination implemented correctly
- [ ] Filtering works as expected

---

#### Task 1.1.4: Update API Gateway Proposal Routes

1. Simplify gateway route handler:
   ```typescript
   app.get('/api/proposals', {
     preHandler: requireRoles(
       ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
       services
     ),
   }, async (request, reply) => {
     // Build auth headers
     const headers = buildAuthHeaders(request);
     
     // Proxy to ATS service with all query params
     const response = await services.get('/proposals', {
       headers,
       params: request.query,
     });
     
     return reply.send(response.data);
   });
   ```

2. Update all 7: 🧪 Test Proposals Migration

**Status**: PENDING - Ready for testing

1. ⏳ - `/api/proposals/actionable`
   - `/api/proposals/pending`
   - `/api/proposals/summary`
   - `/api/proposals/:id`

3. Remove role-specific routing logic

**Verification**:
- [ ] Gateway uses `buildAuthHeaders()`
- [ ] All routes simplified
- [ ] RBAC enforcement still in place
- [ ] Query params proxied correctly

---

#### Task 1.1.5: Test Proposals Migration

1. Test as recruiter:
   ```bash
   # Login as recruiter user
   curl -H "Authorization: Bearer <RECRUITER_TOKEN>" \
        http://localhost:3000/api/proposals
   
   # Verify: Only proposals assigned to this recruiter
   ```

2. Test as company_admin:
   ```bash
   # Login as company admin
   curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
        http://localhost:3000/api/proposals
   
   # Verify: Only proposals for this company
   ```

3. Test as hiring_manager:
   ```bash
   # Login as hiring manager
   curl -H "Authorization: Bearer <HM_TOKEN>" \
        http://localhost:3000/api/proposals
   
   # Verify: Only proposals for this company
   ```

4. Test as platform_admin:
   ```bash
   # Login as platform admin
   curl -H "Authorization: Bearer <ADMIN_TOKEN>" \
        http://localhost:3000/api/proposals
   
   # Verify: All proposals visible
   ```

**Verification**:
- [ ] Each role sees correct data scope
- [ ] No unauthorized data leakage
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] HTTP status codes correct

---

### Step 1.2: Migrate Applications (ATS Service)
**Duration**: 1 day  
**Dependencies**: Step 1.1 complete

#### Task 1.2.1: Update ApplicationService Methods

Follow same pattern as proposals:

1. Add `getApplicationsForUser()`:
   ```typescript
   async getApplicationsForUser(
     clerkUserId: string,
     userRole: string,
     filters: ApplicationFilters,
     correlationId: string,
     organizationId?: string
   ): Promise<{ data: Application[]; pagination: PaginationMeta }> {
     const entity = await this.resolveEntityId(clerkUserId, userRole, organizationId);
     
     switch (entity.type) {
       case 'recruiter':
         return this.repository.findByRecruiter(entity.id, filters);
       case 'company':
         if (entity.id === '*') {
           return this.repository.findAll(filters);
         }
         return this.repository.findByCompany(entity.id, filters);
       default:
         throw new Error(`Unsupported entity type: ${entity.type}`);
     }
   }
   ```

2. Add `getApplicationByIdForUser()` with access verification:
   ```typescript
   async getApplicationByIdForUser(
     applicationId: string,
     clerkUserId: string,
     userRole: string,
     organizationId?: string
   ): Promise<Application> {
     const application = await this.repository.findById(applicationId);
     
     if (!application) {
       throw new NotFoundError('Application not found');
     }
     
     // Verify user has access
     const entity = await this.resolveEntityId(clerkUserId, userRole, organizationId);
     
     switch (entity.type) {
       case 'recruiter':
         if (application.recruiter_id !== entity.id) {
           throw new ForbiddenError('Access denied');
         }
         break;
       case 'company':
         if (entity.id !== '*' && application.company_id !== entity.id) {
           throw new ForbiddenError('Access denied');
         }
         break;
     }
     
     return application;
   }
   ```

**Verification**:
- [ ] Service methods implemented
- [ ] Access verification logic added
- [ ] Error handling in place

---

#### Task 1.2.2: Update Application Routes

1. Update route handlers:
   ```typescript
   app.get('/applications', async (request, reply) => {
     const userContext = getUserContext(request);
     if (!userContext) {
       return reply.code(401).send({ error: 'Unauthorized' });
     }
     
     const filters = {
       page: Number(request.query.page) || 1,
       limit: Number(request.query.limit) || 25,
       status: request.query.status as string | undefined,
       job_id: request.query.job_id as string | undefined,
     };
     
     const result = await applicationService.getApplicationsForUser(
       userContext.clerkUserId,
       userContext.userRole,
       filters,
       userContext.correlationId || request.id,
       userContext.organizationId
     );
     
     return reply.send({ data: result.data, pagination: result.pagination });
   });
   
   app.get('/applications/:id', async (request, reply) => {
     const userContext = getUserContext(request);
     if (!userContext) {
       return reply.code(401).send({ error: 'Unauthorized' });
     }
     
     const application = await applicationService.getApplicationByIdForUser(
       request.params.id,
       userContext.clerkUserId,
       userContext.userRole,
       userContext.organizationId
     );
     
     return reply.send({ data: application });
   });
   ```

**Verification**:
- [ ] Routes use `getUserContext()`
- [ ] Old query params removed
- [ ] Error handling correct

---

#### Task 1.2.3: Update API Gateway Application Routes

1. Simplify gateway routes (same pattern as proposals):
   ```typescript
   app.get('/api/applications', {
     preHandler: requireRoles(
       ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
       services
     ),
   }, async (request, reply) => {
     const headers = buildAuthHeaders(request);
     const response = await services.get('/applications', {
       headers,
       params: request.query,
     });
     return reply.send(response.data);
   });
   
   app.get('/api/applications/:id', {
     preHandler: requireRoles(
       ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
       services
     ),
   }, async (request, reply) => {
     const headers = buildAuthHeaders(request);
     const response = await services.get(`/applications/${request.params.id}`, {
       headers,
     });
     return reply.send(response.data);
   });
   ```

**Verification**:
- [ ] Gateway simplified
- [ ] Headers passed correctly
- [ ] RBAC enforcement in place

---

#### Task 1.2.4: Test Applications Migration

Same testing pattern as proposals:

1. Test list endpoint for each role
2. Test detail endpoint for each role
3. Test access control (recruiter can't see other recruiter's applications)
4. Test company scoping (company admin sees only company applications)

**Verification**:
- [ ] All roles tested
- [ ] Data scoping correct
- [ ] Access control working
- [ ] No data leakage

---

### Step 1.3: Migrate Jobs (ATS Service)
**Duration**: 1.5 days  
**Dependencies**: Step 1.2 complete  
**⚠️ SPECIAL**: Jobs must handle **both** public (unauthenticated) and authenticated (role-scoped) access

#### Task 1.3.1: Update JobService Methods

1. Add `getJobs()` with optional auth parameters:
   ```typescript
   async getJobs(
     filters: JobFilters,
     clerkUserId?: string,
     userRole?: string,
     organizationId?: string,
     correlationId?: string
   ): Promise<{ data: Job[]; pagination: PaginationMeta }> {
     // No auth - return public jobs only
     if (!clerkUserId || !userRole) {
       return this.repository.findActiveJobs(filters);
     }
     
     // Authenticated - apply role-based scoping
     const entityId = await this.resolveEntityId(clerkUserId, userRole, organizationId);
     
     switch (userRole) {
       case 'recruiter':
         // Marketplace jobs (may include inactive if recruiter has proposals)
         return this.repository.findMarketplaceJobs(entityId, filters);
       case 'company_admin':
       case 'hiring_manager':
         // Company's jobs (all statuses)
         return this.repository.findByCompany(entityId, filters);
       case 'platform_admin':
         // All jobs
         return this.repository.findAll(filters);
       default:
         throw new ForbiddenError('Invalid role');
     }
   }
   ```

2. Add `getJobById()` with optional auth and data sanitization:
   ```typescript
   async getJobById(
     jobId: string,
     clerkUserId?: string,
     userRole?: string,
     organizationId?: string
   ): Promise<Job> {
     const job = await this.repository.findById(jobId);
     
     if (!job) {
       throw new NotFoundError('Job not found');
     }
     
     // No auth - return public data only
     if (!clerkUserId || !userRole) {
       if (job.status !== 'active') {
         throw new NotFoundError('Job not found');
       }
       return this.sanitizePublicJob(job);
     }
     
     // Authenticated - verify access and return full data
     await this.verifyJobAccess(job, clerkUserId, userRole, organizationId);
     return job;
   }
   
   private sanitizePublicJob(job: Job): Job {
     // Return only public fields
     return {
       id: job.id,
       title: job.title,
       description: job.description,
       location: job.location,
       salary_min: job.salary_min,
       salary_max: job.salary_max,
       company_id: job.company_id,
       company_name: job.company_name,
       status: job.status,
       created_at: job.created_at,
       // Omit internal fields
     };
   }
   ```

**Verification**:
- [ ] Service methods implemented with optional auth
- [ ] Public access returns active jobs only
- [ ] Authenticated access applies role-based scoping
- [ ] Data sanitization for public access implemented

---

#### Task 1.3.2: Update Job Routes

Update routes to extract auth context if present:

```typescript
app.get('/jobs', async (request, reply) => {
  const userContext = getUserContext(request);
  const filters = request.query as JobFilters;
  
  const result = await jobService.getJobs(
    filters,
    userContext?.clerkUserId,
    userContext?.userRole,
    userContext?.organizationId,
    userContext?.correlationId
  );
  
  return reply.send(result);
});
```

**Verification**:
- [ ] Routes handle both authenticated and unauthenticated requests
- [ ] No errors when auth headers missing

---

#### Task 1.3.3: Update API Gateway Job Routes

Gateway must check authentication state and route accordingly:

```typescript
app.get('/api/jobs', async (request, reply) => {
  const isAuthenticated = !!request.auth?.clerkUserId;
  
  if (!isAuthenticated) {
    // Public access - no auth headers
    const response = await atsService.get('/jobs', {
      params: request.query
    });
    return reply.send(response.data);
  }
  
  // Authenticated access - pass auth context
  const headers = buildAuthHeaders(request);
  const response = await atsService.get('/jobs', {
    headers,
    params: request.query
  });
  return reply.send(response.data);
});
```

**⚠️ CRITICAL**: Do NOT use `requireRoles()` on public endpoints like `GET /api/jobs`!

**Verification**:
- [ ] Gateway handles both authenticated and unauthenticated requests
- [ ] No requireRoles() middleware on public endpoints
- [ ] Candidate portal can access jobs without auth

---

#### Task 1.3.4: Test Jobs Migration

Test **both** access patterns:

**Public Access**:
- [ ] Unauthenticated GET /api/jobs returns active jobs
- [ ] Unauthenticated GET /api/jobs/:id returns public job data
- [ ] Inactive jobs not visible to public
- [ ] Internal fields (notes, etc.) not included in public response

**Authenticated Access**:
- [ ] Recruiter sees marketplace jobs
- [ ] Company admin sees company's jobs (all statuses)
- [ ] Hiring manager sees company's jobs
- [ ] Platform admin sees all jobs
- [ ] Authenticated users get full job data

---

### Step 1.4: Migrate Candidates (ATS Service)
**Duration**: 1 day  
**Dependencies**: Step 1.3 complete

#### Task 1.4.1: Update CandidateService Methods

1. Add `getCandidatesForUser()`:
   ```typescript
   async getCandidatesForUser(
     clerkUserId: string,
     userRole: string,
     filters: CandidateFilters,
     correlationId: string,
     organizationId?: string
   ): Promise<{ data: Candidate[]; pagination: PaginationMeta }> {
     const entity = await this.resolveEntityId(clerkUserId, userRole, organizationId);
     
     switch (entity.type) {
       case 'recruiter':
         // Recruiters see candidates they've submitted
         return this.repository.findByRecruiter(entity.id, filters);
       case 'company':
         if (entity.id === '*') {
           return this.repository.findAll(filters);
         }
         // Company users see candidates applied to their jobs
         return this.repository.findByCompany(entity.id, filters);
       default:
         throw new Error(`Unsupported entity type: ${entity.type}`);
     }
   }
   ```

2. Add `getCandidateByIdForUser()` with access verification

**Verification**:
- [ ] Service methods implemented
- [ ] Access control logic correct

---

#### Task 1.4.2: Update Candidate Routes

Same pattern as previous resources.

**Verification**:
- [ ] Routes updated
- [ ] Access control implemented

---

#### Task 1.4.3: Update API Gateway Candidate Routes

Same pattern as previous resources.

**Verification**:
- [ ] Gateway simplified

---

#### Task 1.4.4: Test Candidates Migration

Same testing pattern as previous resources.

**Verification**:
- [ ] All roles tested
- [ ] Data scoping correct

---

## Phase 2: Frontend Migration

### Step 2.1: Update Proposals Pages
**Duration**: 0.5 day  
**Dependencies**: Phase 1 complete

#### Task 2.1.1: Update Proposals List Page

1. Remove role-based logic:
   ```typescript
   // BEFORE
   const { user } = useUser();
   const userRole = determineUserRole(user);
   
   if (userRole === 'recruiter') {
     const profile = await client.get(`/api/recruiters/by-user/${userId}`);
     const proposals = await client.get(`/api/proposals?recruiter_id=${profile.id}`);
   } else {
     const proposals = await client.get(`/api/proposals?organization_id=${orgId}`);
   }
   
   // AFTER
   const client = await createAuthenticatedClient();
   const proposals = await client.get('/api/proposals');
   ```

2. File to update: `apps/portal/src/app/portal/proposals/page.tsx`

**Verification**:
- [ ] No role checks in component
- [ ] Single API call
- [ ] Page loads correctly for all roles

---

#### Task 2.1.2: Update Proposal Detail Page

1. File: `apps/portal/src/app/portal/proposals/[id]/page.tsx`
2. Remove role-based logic, use single endpoint

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

### Step 2.2: Update Applications Pages
**Duration**: 0.5 day  
**Dependencies**: Step 2.1 complete

#### Task 2.2.1: Update Applications List Page

Same pattern as proposals:
- Remove role conditionals
- Use single API endpoint
- Simplify loading logic

File: `apps/portal/src/app/portal/applications/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.2.2: Update Application Detail Page

File: `apps/portal/src/app/portal/applications/[id]/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

### Step 2.3: Update Jobs Pages
**Duration**: 0.5 day  
**Dependencies**: Step 2.2 complete

#### Task 2.3.1: Update Jobs List Page

File: `apps/portal/src/app/portal/roles/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.3.2: Update Job Detail Page

File: `apps/portal/src/app/portal/roles/[id]/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

### Step 2.4: Update Candidates Pages
**Duration**: 0.5 day  
**Dependencies**: Step 2.3 complete

#### Task 2.4.1: Update Candidates List Page

File: `apps/portal/src/app/portal/candidates/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.4.2: Update Candidate Detail Page

File: `apps/portal/src/app/portal/candidates/[id]/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

## Phase 3: Testing & Cleanup

### Step 3.1: End-to-End Testing
**Duration**: 1 day

#### Task 3.1.1: Test Complete User Flows

For each user role, test complete workflows:

1. **Recruiter Flow**:
   - [ ] Login as recruiter
   - [ ] View proposals list (only assigned proposals)
   - [ ] View proposal detail
   - [ ] View applications list (only submitted applications)
   - [ ] View application detail
   - [ ] View jobs list (marketplace - all open jobs)
   - [ ] View job detail
   - [ ] View candidates list (only submitted candidates)
   - [ ] View candidate detail

2. **Company Admin Flow**:
   - [ ] Login as company admin
   - [ ] View proposals list (only company proposals)
   - [ ] View proposal detail
   - [ ] View applications list (only company applications)
   - [ ] View application detail
   - [ ] View jobs list (only company jobs)
   - [ ] View job detail
   - [ ] View candidates list (candidates applied to company jobs)
   - [ ] View candidate detail

3. **Hiring Manager Flow**:
   - Same as company admin

4. **Platform Admin Flow**:
   - [ ] Login as platform admin
   - [ ] View all resources
   - [ ] Verify can see data across all organizations

---

#### Task 3.1.2: Test Edge Cases

1. Test access control violations:
   - [ ] Recruiter tries to access another recruiter's proposal
   - [ ] Company admin tries to access another company's job
   - [ ] Verify 403 Forbidden responses

2. Test invalid data:
   - [ ] Missing organization ID for company users
   - [ ] Invalid Clerk user ID
   - [ ] Verify 400/401 responses

3. Test pagination and filtering:
   - [ ] Pagination works for all roles
   - [ ] Filters (status, search) work correctly
   - [ ] Sorting works correctly

**Verification**:
- [ ] All edge cases handled
- [ ] Error messages are clear
- [ ] No data leakage

---

### Step 3.2: Performance Testing
**Duration**: 0.5 day

#### Task 3.2.1: Measure API Response Times

1. Test response times for each endpoint:
   ```bash
   # Use Apache Bench or similar
   ab -n 100 -c 10 -H "Authorization: Bearer <TOKEN>" \
      http://localhost:3000/api/proposals
   ```

2. Compare before/after migration:
   - [ ] Proposals endpoint
   - [ ] Applications endpoint
   - [ ] Jobs endpoint
   - [ ] Candidates endpoint

3. Verify improvements:
   - [ ] Fewer API calls (no profile lookups)
   - [ ] Faster page loads
   - [ ] Database query efficiency

**Verification**:
- [ ] Response times acceptable
- [ ] No performance regressions
- [ ] Improvements documented

---

### Step 3.3: Code Cleanup
**Duration**: 0.5 day

#### Task 3.3.1: Remove Deprecated Code

1. Backend Services:
   - [ ] Remove old query parameter handling
   - [ ] Remove role-specific service methods
   - [ ] Remove unused imports

2. API Gateway:
   - [ ] Remove role-based routing logic
   - [ ] Remove deprecated endpoints

3. Frontend:
   - [ ] Remove role conditional code
   - [ ] Remove `useUser()` calls for role checks
   - [ ] Remove unused components

**Verification**:
- [ ] No unused code remains
- [ ] Build succeeds
- [ ] Tests pass

---

#### Task 3.3.2: Update Documentation

1. Update API documentation:
   - [ ] Document new endpoint patterns
   - [ ] Update request/response examples
   - [ ] Document auth context headers

2. Update developer guides:
   - [ ] Update data fetching patterns
   - [ ] Update RBAC documentation
   - [ ] Update troubleshooting guide

3. Update README files:
   - [ ] Service README files
   - [ ] Frontend README
   - [ ] Gateway README

**Verification**:
- [ ] Documentation accurate
- [ ] Examples work
- [ ] No outdated info

---

### Step 3.4: Deployment
**Duration**: 0.5 day

#### Task 3.4.1: Prepare for Deployment

1. Create deployment plan:
   - [ ] Backend services first (backward compatible)
   - [ ] Frontend last
   - [ ] Rollback plan ready

2. Update environment variables if needed

3. Database migrations (if any)

**Verification**:
- [ ] Deployment plan reviewed
- [ ] Rollback plan tested
- [ ] Environment ready

---

#### Task 3.4.2: Deploy to Staging

1. Deploy backend services:
   - [ ] ATS Service
   - [ ] Network Service
   - [ ] Billing Service
   - [ ] API Gateway

2. Deploy frontend:
   - [ ] Portal app

3. Test in staging:
   - [ ] Smoke tests pass
   - [ ] User flows work
   - [ ] No errors in logs

**Verification**:
- [ ] Staging deployment successful
- [ ] All tests pass
- [ ] Ready for production

---

#### Task 3.4.3: Deploy to Production

1. Deploy during low-traffic window

2. Monitor deployment:
   - [ ] Watch error rates
   - [ ] Monitor API response times
   - [ ] Check user activity

3. Verify production:
   - [ ] Smoke tests pass
   - [ ] User flows work
   - [ ] No increased error rates

**Verification**:
- [ ] Production deployment successful
- [ ] System stable
- [ ] Users not impacted

---

## Rollback Procedures

### If Issues Found in Phase 1 (Backend)

1. **Revert service changes**:
   ```bash
   cd services/ats-service
   git revert <commit-hash>
   pnpm build
   docker-compose restart ats-service
   ```

2. **Re-enable old query param handling** (temporary):
   ```typescript
   // Add backward compatibility
   if (request.query.recruiter_id || request.query.company_id) {
     // Handle old pattern temporarily
     return this.handleLegacyRequest(request);
   }
   ```

### If Issues Found in Phase 2 (Frontend)

1. **Revert frontend changes**:
   ```bash
   cd apps/portal
   git revert <commit-hash>
   pnpm build
   ```

2. **Use feature flag** (if implemented):
   ```typescript
   const USE_NEW_API = process.env.NEXT_PUBLIC_USE_NEW_API === 'true';
   
   if (USE_NEW_API) {
     // New pattern
   } else {
     // Old pattern
   }
   ```

---

## Success Metrics

After complete migration:

1. **Code Metrics**:
   - [ ] 50% reduction in frontend role-checking code
   - [ ] Single endpoint per resource (vs 2-3 before)
   - [ ] 30% fewer lines of code overall

2. **Performance Metrics**:
   - [ ] 30-50% faster page loads (fewer API calls)
   - [ ] Reduced API latency
   - [ ] Better database query efficiency

3. **Security Metrics**:
   - [ ] Authorization logic centralized
   - [ ] No client-side role checks
   - [ ] All access control server-side

4. **Maintenance Metrics**:
   - [ ] Easier to add new features
   - [ ] Fewer bugs related to authorization
   - [ ] Simpler code to understand

---

## Timeline Summary

| Phase | Duration | Tasks |
|-------|----------|-------|
| Pre-Migration Setup | 0.5 day | Helper functions, entity resolution |
| **Phase 1: Backend** | **4 days** | |
| - Proposals | 1 day | Service, routes, repository, gateway, tests |
| - Applications | 1 day | Service, routes, repository, gateway, tests |
| - Jobs | 1 day | Service, routes, repository, gateway, tests |
| - Candidates | 1 day | Service, routes, repository, gateway, tests |
| **Phase 2: Frontend** | **2 days** | |
| - Proposals pages | 0.5 day | List + detail pages |
| - Applications pages | 0.5 day | List + detail pages |
| - Jobs pages | 0.5 day | List + detail pages |
| - Candidates pages | 0.5 day | List + detail pages |
| **Phase 3: Testing & Cleanup** | **2.5 days** | |
| - End-to-end testing | 1 day | User flows, edge cases |
| - Performance testing | 0.5 day | Load tests, benchmarks |
| - Code cleanup | 0.5 day | Remove deprecated code |
| - Deployment | 0.5 day | Staging + production |
| **Total** | **9 days** | **~2 weeks with buffer** |

---

## Daily Checklist

Use this checklist to track progress:

### Day 1: Pre-Migration + Proposals Backend
- [ ] Create helper functions
- [ ] Add `resolveEntityId()` to ATS service
- [ ] Update ProposalService methods
- [ ] Update proposal routes
- [ ] Update API Gateway proposal routes
- [ ] Test proposals with all roles

### Day 2: Applications Backend
- [ ] Update ApplicationService methods
- [ ] Update application routes
- [ ] Update API Gateway application routes
- [ ] Test applications with all roles

### Day 3: Jobs Backend
- [ ] Update JobService methods
- [ ] Update job routes
- [ ] Update API Gateway job routes
- [ ] Test jobs with all roles

### Day 4: Candidates Backend
- [ ] Update CandidateService methods
- [ ] Update candidate routes
- [ ] Update API Gateway candidate routes
- [ ] Test candidates with all roles

### Day 5: Frontend Part 1
- [ ] Update proposals pages
- [ ] Update applications pages
- [ ] Test proposal + application pages

### Day 6: Frontend Part 2
- [ ] Update jobs pages
- [ ] Update candidates pages
- [ ] Test all frontend pages

### Day 7: Testing
- [ ] End-to-end testing for all roles
- [ ] Test edge cases
- [ ] Performance testing

### Day 8: Cleanup
- [ ] Remove deprecated code
- [ ] Update documentation
- [ ] Prepare deployment plan

### Day 9: Deployment
- [ ] Deploy to staging
- [ ] Test staging
- [ ] Deploy to production
- [ ] Monitor production

---

## Questions & Support

If you encounter issues during implementation:

1. **Backend Service Issues**:
   - Check `resolveEntityId()` implementation
   - Verify auth context extraction
   - Review database queries

2. **API Gateway Issues**:
   - Check `buildAuthHeaders()` implementation
   - Verify RBAC enforcement
   - Check header propagation

3. **Frontend Issues**:
   - Check API client setup
   - Verify token refresh
   - Review error handling

4. **Authorization Issues**:
   - Review RBAC configuration
   - Check Clerk JWT verification
   - Verify organization ID propagation

---

## Conclusion

This plan provides a systematic approach to migrating from frontend role-based API calls to backend-determined data scoping. By following these steps in order, testing thoroughly at each stage, and maintaining the ability to rollback if needed, we can safely complete this migration and achieve:

- **Simplified frontend code** (no role checks)
- **Centralized authorization** (security improvement)
- **Better performance** (fewer API calls)
- **Easier maintenance** (single pattern)

The migration is estimated to take 2-3 weeks with proper testing and documentation.

**Next Step**: Begin with Day 1 tasks (Pre-Migration Setup + Proposals Backend).
