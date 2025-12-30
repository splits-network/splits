# API Role-Based Scoping Migration - Implementation Plan

**Status**: Ready for Implementation  
**Created**: December 29, 2025  
**Related**: [api-role-based-scoping-migration.md](./api-role-based-scoping-migration.md)  
**Estimated Duration**: 2-3 weeks

---

## Overview

This plan provides detailed, step-by-step instructions for migrating from frontend role-based API calls to backend-determined data scoping. The migration will be done incrementally, one resource at a time, to minimize risk and allow for testing at each stage.

**Important**: Some endpoints (like `/api/jobs`, `/api/recruiters`) must handle **both** unauthenticated (public) and authenticated (role-scoped) access. These endpoints use conditional logic based on authentication state, **NOT** separate `/api/public/*` routes.

---

## Pre-Migration Setup

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

### Step 0.2: Add resolveEntityId() to Services
**Duration**: 3 hours  
**Priority**: HIGH - Core business logic

#### Task: Implement Entity Resolution in ATS Service

1. Add to service class (e.g., `ProposalService`):
   ```typescript
   private async resolveEntityId(
     clerkUserId: string,
     userRole: string,
     organizationId?: string
   ): Promise<{ type: 'recruiter' | 'company'; id: string }> {
     switch (userRole) {
       case 'recruiter': {
         // Call identity service to get internal user UUID
         const identityResponse = await this.identityClient.get(
           `/users?clerk_user_id=${clerkUserId}`
         );
         const userData = identityResponse.data.data[0];
         if (!userData) {
           throw new Error(`User not found for Clerk ID: ${clerkUserId}`);
         }
         
         // Query recruiter by internal user UUID
         const recruiterResponse = await this.networkClient.get(
           `/recruiters/by-user/${userData.id}`
         );
         const recruiter = recruiterResponse.data.data;
         
         if (!recruiter) {
           throw new Error(`Recruiter profile not found for user: ${userData.id}`);
         }
         
         return { type: 'recruiter', id: recruiter.id };
       }
       
       case 'company_admin':
       case 'hiring_manager': {
         if (!organizationId) {
           throw new Error('Organization ID is required for company users');
         }
         
         // Find company by organization ID
         const companyResponse = await this.atsClient.get(
           `/companies?organization_id=${organizationId}`
         );
         const company = companyResponse.data.data[0];
         
         if (!company) {
           throw new Error(`Company not found for organization: ${organizationId}`);
         }
         
         return { type: 'company', id: company.id };
       }
       
       case 'platform_admin': {
         // Platform admin can see all data
         // Return null to indicate no filtering needed
         return { type: 'company', id: '*' };
       }
       
       default:
         throw new Error(`Unsupported user role: ${userRole}`);
     }
   }
   ```

2. Inject required clients in constructor:
   ```typescript
   constructor(
     private repository: ProposalRepository,
     private identityClient: IdentityServiceClient,
     private networkClient: NetworkServiceClient,
     private atsClient: ATSServiceClient,
     private logger: Logger
   ) {}
   ```

**Verification**:
- [ ] Method added to service class
- [ ] All role cases handled
- [ ] Error handling in place
- [ ] Clients injected properly

---

## Phase 1: Backend Services Migration

### Step 1.1: Migrate Proposals (ATS Service)
**Duration**: 1 day  
**Status**: ~90% complete (fix remaining issues)

#### Task 1.1.1: Update ProposalService Methods

1. Update `getProposalsForUser()`:
   ```typescript
   async getProposalsForUser(
     clerkUserId: string,
     userRole: string,
     filters: PaginationFilters,
     correlationId: string,
     organizationId?: string
   ): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
     // Resolve entity ID based on role
     const entity = await this.resolveEntityId(clerkUserId, userRole, organizationId);
     
     // Apply role-based filtering
     switch (entity.type) {
       case 'recruiter':
         return this.repository.findByRecruiter(entity.id, filters);
       
       case 'company':
         if (entity.id === '*') {
           // Platform admin - return all
           return this.repository.findAll(filters);
         }
         return this.repository.findByCompany(entity.id, filters);
       
       default:
         throw new Error(`Unsupported entity type: ${entity.type}`);
     }
   }
   ```

2. Add similar methods for:
   - `getActionableProposalsForUser()`
   - `getPendingProposalsForUser()`
   - `getProposalSummaryForUser()`
   - `getProposalByIdForUser()` (with access verification)

**Verification**:
- [ ] All methods accept auth context parameters
- [ ] Methods call `resolveEntityId()`
- [ ] Role-based filtering implemented
- [ ] Existing tests updated

---

#### Task 1.1.2: Update Proposal Routes

1. Modify route handlers to extract auth context:
   ```typescript
   app.get('/proposals', async (request, reply) => {
     const userContext = getUserContext(request);
     
     if (!userContext) {
       return reply.code(401).send({ error: 'Unauthorized' });
     }
     
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

2. Update all proposal routes:
   - `GET /proposals`
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
     const response = await services.ats.get('/proposals', {
       headers,
       params: request.query,
     });
     
     return reply.send(response.data);
   });
   ```

2. Update all proposal gateway routes:
   - `/api/proposals`
   - `/api/proposals/actionable`
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
     const response = await services.ats.get('/applications', {
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
     const response = await services.ats.get(`/applications/${request.params.id}`, {
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
  
  return reply.send({ data: result });
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

2. File to update: `apps/portal/src/app/(authenticated)/proposals/page.tsx`

**Verification**:
- [ ] No role checks in component
- [ ] Single API call
- [ ] Page loads correctly for all roles

---

#### Task 2.1.2: Update Proposal Detail Page

1. File: `apps/portal/src/app/(authenticated)/proposals/[id]/page.tsx`
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

File: `apps/portal/src/app/(authenticated)/applications/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.2.2: Update Application Detail Page

File: `apps/portal/src/app/(authenticated)/applications/[id]/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

### Step 2.3: Update Jobs Pages
**Duration**: 0.5 day  
**Dependencies**: Step 2.2 complete

#### Task 2.3.1: Update Jobs List Page

File: `apps/portal/src/app/(authenticated)/roles/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.3.2: Update Job Detail Page

File: `apps/portal/src/app/(authenticated)/roles/[id]/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

### Step 2.4: Update Candidates Pages
**Duration**: 0.5 day  
**Dependencies**: Step 2.3 complete

#### Task 2.4.1: Update Candidates List Page

File: `apps/portal/src/app/(authenticated)/candidates/page.tsx`

**Verification**:
- [ ] Simplified code
- [ ] Works for all roles

---

#### Task 2.4.2: Update Candidate Detail Page

File: `apps/portal/src/app/(authenticated)/candidates/[id]/page.tsx`

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
