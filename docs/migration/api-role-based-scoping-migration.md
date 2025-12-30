# API Role-Based Scoping Migration

**Status**: Planning  
**Created**: December 29, 2025  
**Goal**: Migrate from frontend role-based API calls to backend-determined data scoping

---

## Problem Statement

Current architecture has **mixed responsibility** for authorization logic:
- Frontend components contain role checks and call different endpoints per role
- Multiple API routes for the same resource (e.g., `?recruiter_id=X`, `?company_id=Y`)
- Role logic duplicated across UI, API Gateway, and backend services
- Easy to forget role checks in new pages (source of recent bugs)
- Client-side role logic can be bypassed

**Result**: Complexity, bugs, maintenance burden.

---

## Solution Overview

**Backend-Determined Scoping**: Single endpoint per resource, backend filters based on authenticated user's role.

### Current Pattern (Problematic):
```typescript
// Frontend has role logic:
const { userRole, memberships } = useUser();

if (userRole === 'recruiter') {
  const profile = await client.get(`/api/recruiters/by-user/${userId}`);
  const proposals = await client.get(`/api/proposals?recruiter_id=${profile.id}`);
} else if (userRole === 'company_admin' || userRole === 'hiring_manager') {
  const orgId = memberships[0].organization_id;
  const proposals = await client.get(`/api/proposals?organization_id=${orgId}`);
}
```

### New Pattern (Simplified):
```typescript
// Frontend is role-agnostic:
const proposals = await client.get('/api/proposals');

// Backend determines scope based on auth context:
// - Recruiter: return proposals assigned to recruiter
// - Company Admin/Hiring Manager: return proposals for company
// - Platform Admin: return all proposals (or org-scoped)
```

---

## Architecture Changes

### 1. API Gateway Changes

**BEFORE** (Role-specific routing):
```typescript
// Multiple routes for same resource based on query params
app.get('/api/proposals', async (request, reply) => {
  const role = determineUserRole(request.auth);
  
  if (role === 'recruiter') {
    // Route to ATS with recruiter filter
  } else if (role === 'company_admin') {
    // Route to ATS with company filter
  }
});
```

**AFTER** (Single route, pass auth context):
```typescript
// Single route, backend determines scope
app.get('/api/proposals', {
  preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'], services),
}, async (request, reply) => {
  // Gateway only enforces RBAC and passes context
  const headers = buildAuthHeaders(request);
  
  const response = await atsService.get('/proposals', {
    headers,
    params: request.query // pagination, filters, etc.
  });
  
  return reply.send(response.data);
});
```

**Key Changes**:
- Gateway enforces authorization (RBAC), not filtering logic
- All auth context passed via headers (`x-clerk-user-id`, `x-user-role`, `x-organization-id`)
- No role-specific routing logic
- Query parameters only for pagination/filtering, not scoping

---

### 2. Backend Service Changes

**BEFORE** (Expects explicit filters):
```typescript
// Service expects caller to specify filters
async getProposals(filters: { recruiter_id?: string; company_id?: string }) {
  if (filters.recruiter_id) {
    return this.repository.findByRecruiter(filters.recruiter_id);
  } else if (filters.company_id) {
    return this.repository.findByCompany(filters.company_id);
  }
}
```

**AFTER** (Determines scope from auth context):
```typescript
// Service determines scope based on auth context
async getProposalsForUser(
  clerkUserId: string,
  userRole: UserRole,
  filters: PaginationFilters,
  correlationId: string,
  organizationId?: string
): Promise<Proposal[]> {
  // Resolve user's entity ID (recruiter_id or company_id)
  const entityId = await this.resolveEntityId(clerkUserId, userRole, organizationId);
  
  switch (userRole) {
    case 'recruiter':
      return this.repository.findByRecruiter(entityId, filters);
    
    case 'company_admin':
    case 'hiring_manager':
      return this.repository.findByCompany(entityId, filters);
    
    case 'platform_admin':
      // Return all or org-scoped based on organizationId
      return organizationId 
        ? this.repository.findByOrganization(organizationId, filters)
        : this.repository.findAll(filters);
    
    default:
      throw new ForbiddenError('Invalid role');
  }
}

private async resolveEntityId(
  clerkUserId: string,
  userRole: UserRole,
  organizationId?: string
): Promise<string> {
  switch (userRole) {
    case 'recruiter':
      const recruiter = await this.networkClient.getRecruiterByUser(clerkUserId);
      return recruiter.id;
    
    case 'company_admin':
    case 'hiring_manager':
      if (!organizationId) {
        throw new Error('Organization ID is required for company users');
      }
      const company = await this.repository.findCompanyByOrgId(organizationId);
      if (!company) {
        throw new NotFoundError('Company not found');
      }
      return company.id;
    
    case 'platform_admin':
      return 'admin'; // Special case
    
    default:
      throw new ForbiddenError('Invalid role');
  }
}
```

**Key Changes**:
- Service methods accept auth context (`clerkUserId`, `userRole`, `organizationId`)
- `resolveEntityId()` converts auth context → entity ID (recruiter_id or company_id)
- Single method with role-based branching instead of multiple methods
- Filters are for pagination/search, not scoping

---

### 3. Frontend Changes

**BEFORE** (Role conditionals):
```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function ProposalsPage() {
  const { user } = useUser();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProposals() {
      const role = user?.publicMetadata?.role;
      const memberships = user?.publicMetadata?.memberships || [];
      
      let data;
      
      // Role-based logic in frontend
      if (role === 'recruiter') {
        const profileRes = await client.get(`/api/recruiters/by-user/${user.id}`);
        const proposalsRes = await client.get(`/api/proposals?recruiter_id=${profileRes.data.id}`);
        data = proposalsRes.data;
      } else if (role === 'company_admin' || role === 'hiring_manager') {
        const orgId = memberships[0]?.organization_id;
        const proposalsRes = await client.get(`/api/proposals?organization_id=${orgId}`);
        data = proposalsRes.data;
      }
      
      setProposals(data);
      setLoading(false);
    }
    
    loadProposals();
  }, [user]);
  
  if (loading) return <div>Loading...</div>;
  
  return <ProposalsList proposals={proposals} />;
}
```

**AFTER** (Role-agnostic):
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createAuthenticatedClient } from '@/lib/api-client';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProposals() {
      const client = await createAuthenticatedClient();
      // Single endpoint, backend determines scope
      const res = await client.get('/api/proposals');
      setProposals(res.data.data);
      setLoading(false);
    }
    
    loadProposals();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return <ProposalsList proposals={proposals} />;
}
```

**Key Changes**:
- No role checks in frontend
- No user metadata reading for routing decisions
- Single API call regardless of role
- Much simpler, less code
- Backend handles scoping transparently

---

## Migration Checklist

### Phase 1: Backend Services (ATS, Network, Billing)

For each resource type (proposals, applications, jobs, candidates, etc.):

- [ ] **Update service methods**:
  - Add `clerkUserId`, `userRole`, `organizationId` parameters
  - Implement `resolveEntityId()` helper for role → entity mapping
  - Add role-based branching logic
  - Keep existing pagination/filter parameters

- [ ] **Update route handlers**:
  - Extract auth context from headers (`getUserContext()` helper)
  - Pass auth context to service methods
  - Remove role-specific query parameter handling
  - Keep generic filters (pagination, search, sorting)

- [ ] **Update repository methods** (if needed):
  - Add `findByCompany()`, `findByRecruiter()` methods if missing
  - Ensure queries use proper entity IDs

- [ ] **Test with different roles**:
  - Recruiter sees only assigned items
  - Company admin sees company-scoped items
  - Hiring manager sees company-scoped items
  - Platform admin sees all (or org-scoped)

### Phase 2: API Gateway

- [ ] **Simplify route handlers**:
  - Remove role detection logic (keep only RBAC enforcement)
  - Use `buildAuthHeaders()` helper to pass context
  - Remove role-specific routing branches
  - Proxy all requests uniformly

- [ ] **Update `buildAuthHeaders()` helper**:
  - Always include `x-clerk-user-id`, `x-user-role`, `x-organization-id`
  - Extract from `request.auth` (populated by Clerk middleware)

- [ ] **Keep RBAC enforcement**:
  - `requireRoles()` middleware still needed
  - Determines WHO can access endpoint, not WHAT they see
  - Pass `services` parameter for recruiter/candidate checks

### Phase 3: Frontend

- [ ] **Remove role conditionals**:
  - Delete `if (userRole === 'recruiter')` logic
  - Delete `useUser()` for routing decisions
  - Use single API call per resource

- [ ] **Simplify data loading**:
  - Remove profile fetching for ID lookups
  - Remove multi-step API calls
  - Use `createAuthenticatedClient()` only

- [ ] **Update loading states**:
  - Single loading state instead of multi-step
  - Faster page loads (fewer API calls)

- [ ] **Remove unused components**:
  - Delete role-specific wrappers if any
  - Consolidate duplicate pages/components

### Phase 4: Testing & Cleanup

- [ ] **Test each role**:
  - Login as recruiter → verify correct data scope
  - Login as company_admin → verify company scope
  - Login as hiring_manager → verify company scope
  - Login as platform_admin → verify admin scope

- [ ] **Remove deprecated endpoints**:
  - Delete role-specific query parameter handling
  - Remove `/api/recruiters/by-user/:id` calls from frontend

- [ ] **Update documentation**:
  - API response format docs
  - Frontend data fetching patterns
  - Backend service patterns

---

## Resource-Specific Migration Guide

### 1. Proposals

**Current Endpoints**:
```
GET /api/proposals?recruiter_id=X     // Recruiter view
GET /api/proposals?organization_id=Y  // Company view
GET /api/proposals/actionable         // Role-specific
GET /api/proposals/pending            // Role-specific
GET /api/proposals/summary            // Role-specific (just fixed!)
```

**New Endpoint**:
```
GET /api/proposals                     // Returns scoped to user role
GET /api/proposals/actionable          // Returns scoped to user role
GET /api/proposals/pending             // Returns scoped to user role
GET /api/proposals/summary             // Returns scoped to user role
```

**Backend Changes**:
```typescript
// services/ats-service/src/services/proposals/service.ts
async getProposalsForUser(
  clerkUserId: string,
  userRole: UserRole,
  filters: { page?: number; limit?: number; status?: string },
  correlationId: string,
  organizationId?: string
): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
  const entityId = await this.resolveEntityId(clerkUserId, userRole, organizationId);
  
  switch (userRole) {
    case 'recruiter':
      return this.repository.findByRecruiter(entityId, filters);
    case 'company_admin':
    case 'hiring_manager':
      return this.repository.findByCompany(entityId, filters);
    case 'platform_admin':
      return this.repository.findAll(filters);
    default:
      throw new ForbiddenError('Invalid role');
  }
}
```

**Frontend Changes**:
```typescript
// apps/portal/src/app/(authenticated)/proposals/page.tsx
async function loadProposals() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/proposals');  // No role logic!
  return res.data.data;
}
```

---

### 2. Applications

**Current Endpoints**:
```
GET /api/applications?recruiter_id=X   // Recruiter view
GET /api/applications?company_id=Y     // Company view
GET /api/applications/:id              // Individual (fixed earlier)
```

**New Endpoint**:
```
GET /api/applications                  // Returns scoped to user role
GET /api/applications/:id              // Returns if user has access
```

**Backend Changes**:
```typescript
// services/ats-service/src/services/applications/service.ts
async getApplicationsForUser(
  clerkUserId: string,
  userRole: UserRole,
  filters: ApplicationFilters,
  correlationId: string,
  organizationId?: string
): Promise<{ data: Application[]; pagination: PaginationMeta }> {
  const entityId = await this.resolveEntityId(clerkUserId, userRole, organizationId);
  
  switch (userRole) {
    case 'recruiter':
      return this.repository.findByRecruiter(entityId, filters);
    case 'company_admin':
    case 'hiring_manager':
      return this.repository.findByCompany(entityId, filters);
    case 'platform_admin':
      return this.repository.findAll(filters);
    default:
      throw new ForbiddenError('Invalid role');
  }
}

async getApplicationById(
  applicationId: string,
  clerkUserId: string,
  userRole: UserRole,
  organizationId?: string
): Promise<Application> {
  const application = await this.repository.findById(applicationId);
  
  if (!application) {
    throw new NotFoundError('Application not found');
  }
  
  // Verify user has access to this application
  await this.verifyAccess(application, clerkUserId, userRole, organizationId);
  
  return application;
}

private async verifyAccess(
  application: Application,
  clerkUserId: string,
  userRole: UserRole,
  organizationId?: string
): Promise<void> {
  switch (userRole) {
    case 'recruiter':
      const recruiter = await this.networkClient.getRecruiterByUser(clerkUserId);
      const hasAccess = await this.repository.checkRecruiterAccess(application.id, recruiter.id);
      if (!hasAccess) {
        throw new ForbiddenError('Access denied to this application');
      }
      break;
    
    case 'company_admin':
    case 'hiring_manager':
      const company = await this.repository.findCompanyByOrgId(organizationId);
      if (application.job.company_id !== company.id) {
        throw new ForbiddenError('Access denied to this application');
      }
      break;
    
    case 'platform_admin':
      // Admin has access to all
      break;
    
    default:
      throw new ForbiddenError('Invalid role');
  }
}
```

**Frontend Changes**:
```typescript
// apps/portal/src/app/(authenticated)/applications/page.tsx
async function loadApplications() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/applications', {
    params: { page: 1, limit: 25 }  // Only pagination, no role params
  });
  return res.data.data;
}

// apps/portal/src/app/(authenticated)/applications/[id]/page.tsx
async function loadApplication(id: string) {
  const client = await createAuthenticatedClient();
  const res = await client.get(`/api/applications/${id}`);  // Backend checks access
  return res.data.data;
}
```

---

### 3. Jobs

**Current Endpoints**:
```
GET /api/jobs?company_id=X             // Company view
GET /api/jobs (recruiter access all)   // Recruiter view
```

**New Endpoint**:
```
GET /api/jobs                          // Returns scoped to user role
GET /api/jobs/:id                      // Returns if user has access
```

**Backend Changes**:
```typescript
// services/ats-service/src/services/jobs/service.ts
async getJobsForUser(
  clerkUserId: string,
  userRole: UserRole,
  filters: JobFilters,
  correlationId: string,
  organizationId?: string
): Promise<{ data: Job[]; pagination: PaginationMeta }> {
  switch (userRole) {
    case 'recruiter':
      // Recruiters see all marketplace jobs
      return this.repository.findMarketplaceJobs(filters);
    
    case 'company_admin':
    case 'hiring_manager':
      // Company users see only their company's jobs
      const company = await this.repository.findCompanyByOrgId(organizationId);
      return this.repository.findByCompany(company.id, filters);
    
    case 'platform_admin':
      // Admin sees all jobs
      return this.repository.findAll(filters);
    
    default:
      throw new ForbiddenError('Invalid role');
  }
}
```

**Frontend Changes**:
```typescript
// apps/portal/src/app/(authenticated)/roles/page.tsx
async function loadJobs() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/jobs');  // No role logic!
  return res.data.data;
}
```

---

### 4. Candidates

**Current Endpoints**:
```
GET /api/candidates?recruiter_id=X     // Recruiter view
GET /api/candidates?company_id=Y       // Company view
```

**New Endpoint**:
```
GET /api/candidates                    // Returns scoped to user role
GET /api/candidates/:id                // Returns if user has access
```

**Backend Changes**:
```typescript
// services/ats-service/src/services/candidates/service.ts
async getCandidatesForUser(
  clerkUserId: string,
  userRole: UserRole,
  filters: CandidateFilters,
  correlationId: string,
  organizationId?: string
): Promise<{ data: Candidate[]; pagination: PaginationMeta }> {
  switch (userRole) {
    case 'recruiter':
      const recruiter = await this.networkClient.getRecruiterByUser(clerkUserId);
      // Recruiter sees candidates they have relationships with
      return this.repository.findByRecruiterRelationship(recruiter.id, filters);
    
    case 'company_admin':
    case 'hiring_manager':
      const company = await this.repository.findCompanyByOrgId(organizationId);
      // Company sees candidates who applied to their jobs
      return this.repository.findByCompanyApplications(company.id, filters);
    
    case 'platform_admin':
      return this.repository.findAll(filters);
    
    default:
      throw new ForbiddenError('Invalid role');
  }
}
```

---

## API Gateway Helper Functions

### buildAuthHeaders() - Standard Helper

```typescript
// services/api-gateway/src/routes/helpers.ts

/**
 * Build authentication headers to pass to backend services
 * Extracts user context from API Gateway request and formats for backend
 */
export function buildAuthHeaders(request: FastifyRequest): Record<string, string> {
  const auth = (request as any).auth;
  
  if (!auth) {
    throw new Error('Authentication context missing');
  }
  
  const headers: Record<string, string> = {
    'x-clerk-user-id': auth.clerkUserId,
    'x-user-role': auth.role || 'unknown',
  };
  
  // Add organization ID for company users
  const memberships = auth.memberships || [];
  if (memberships.length > 0) {
    headers['x-organization-id'] = memberships[0].organization_id;
  }
  
  // Pass correlation ID for request tracing
  const correlationId = (request as any).correlationId;
  if (correlationId) {
    headers['x-correlation-id'] = correlationId;
  }
  
  return headers;
}
```

### getUserContext() - Standard Helper (Backend Services)

```typescript
// services/*/src/routes/helpers.ts

/**
 * Extract authentication context from API Gateway headers
 * Used in backend service route handlers
 */
export interface UserContext {
  clerkUserId: string;
  userRole: UserRole;
  organizationId?: string;
  correlationId?: string;
}

export function getUserContext(request: FastifyRequest): UserContext | null {
  const clerkUserId = request.headers['x-clerk-user-id'] as string;
  const userRole = request.headers['x-user-role'] as UserRole;
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

---

## Migration Order (Recommended)

### Week 1: Backend Foundation
1. **Day 1-2**: ATS Service - Proposals (already 90% done)
2. **Day 3-4**: ATS Service - Applications
3. **Day 5**: ATS Service - Jobs

### Week 2: Backend Completion
4. **Day 1-2**: ATS Service - Candidates
5. **Day 3**: Network Service - Recruiters (if needed)
6. **Day 4-5**: API Gateway - Simplify routes

### Week 3: Frontend Migration
7. **Day 1**: Portal - Proposals page
8. **Day 2**: Portal - Applications pages
9. **Day 3**: Portal - Jobs pages
10. **Day 4**: Portal - Candidates pages
11. **Day 5**: Testing & cleanup

---

## Testing Strategy

### Unit Tests (Backend Services)

```typescript
describe('ProposalService.getProposalsForUser', () => {
  it('should return recruiter proposals for recruiter role', async () => {
    const proposals = await service.getProposalsForUser(
      'clerk_123',
      'recruiter',
      { page: 1, limit: 25 },
      'corr-id'
    );
    
    expect(proposals).toHaveLength(5);
    expect(proposals[0].recruiter_id).toBe('recruiter-uuid');
  });
  
  it('should return company proposals for company_admin role', async () => {
    const proposals = await service.getProposalsForUser(
      'clerk_456',
      'company_admin',
      { page: 1, limit: 25 },
      'corr-id',
      'org-uuid'
    );
    
    expect(proposals).toHaveLength(10);
    expect(proposals[0].job.company_id).toBe('company-uuid');
  });
  
  it('should throw error if company user missing organization_id', async () => {
    await expect(
      service.getProposalsForUser(
        'clerk_456',
        'company_admin',
        { page: 1, limit: 25 },
        'corr-id'
        // Missing organizationId
      )
    ).rejects.toThrow('Organization ID is required');
  });
});
```

### Integration Tests (API Gateway → Services)

```typescript
describe('GET /api/proposals', () => {
  it('should return proposals for authenticated recruiter', async () => {
    const response = await request(app)
      .get('/api/proposals')
      .set('Authorization', `Bearer ${recruiterToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
  });
  
  it('should return proposals for authenticated company admin', async () => {
    const response = await request(app)
      .get('/api/proposals')
      .set('Authorization', `Bearer ${companyAdminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });
  
  it('should return 401 for unauthenticated request', async () => {
    const response = await request(app)
      .get('/api/proposals');
    
    expect(response.status).toBe(401);
  });
});
```

### E2E Tests (Frontend)

```typescript
describe('Proposals Page', () => {
  it('should load proposals as recruiter', async () => {
    await loginAs('recruiter');
    await page.goto('/proposals');
    
    await expect(page.locator('.proposal-card')).toHaveCount(5);
  });
  
  it('should load proposals as company admin', async () => {
    await loginAs('company_admin');
    await page.goto('/proposals');
    
    await expect(page.locator('.proposal-card')).toHaveCount(10);
  });
  
  it('should not show recruiter-only UI for company users', async () => {
    await loginAs('company_admin');
    await page.goto('/proposals');
    
    await expect(page.locator('#recruiter-profile')).toHaveCount(0);
  });
});
```

---

## Common Pitfalls

### ❌ Pitfall 1: Forgetting organizationId for Company Users
```typescript
// WRONG - Will throw "Organization ID is required"
const proposals = await service.getProposalsForUser(
  clerkUserId,
  'company_admin',
  filters,
  correlationId
  // Missing organizationId!
);

// CORRECT
const proposals = await service.getProposalsForUser(
  clerkUserId,
  'company_admin',
  filters,
  correlationId,
  organizationId  // ← Required for company users
);
```

### ❌ Pitfall 2: Frontend Still Checking Role
```typescript
// WRONG - Frontend shouldn't determine access
if (userRole === 'recruiter') {
  await client.get('/api/proposals');
} else {
  // Show error?
}

// CORRECT - Backend determines access
await client.get('/api/proposals');  // Works for all authorized roles
```

### ❌ Pitfall 3: Gateway Not Passing Auth Headers
```typescript
// WRONG - Missing auth context
const response = await atsService.get('/proposals');

// CORRECT - Pass auth headers
const headers = buildAuthHeaders(request);
const response = await atsService.get('/proposals', { headers });
```

### ❌ Pitfall 4: Mixing Old and New Patterns
```typescript
// WRONG - Don't support both patterns simultaneously
if (request.query.recruiter_id) {
  // Old pattern
} else {
  // New pattern
}

// CORRECT - Only new pattern
const userContext = getUserContext(request);
const proposals = await service.getProposalsForUser(userContext.clerkUserId, ...);
```

---

## Success Criteria

✅ **Backend Services**:
- [ ] All resource endpoints accept auth context parameters
- [ ] Service methods contain role-based scoping logic
- [ ] No role-specific query parameters in route handlers
- [ ] All tests pass for each role type

✅ **API Gateway**:
- [ ] All routes use `buildAuthHeaders()` helper
- [ ] No role-based routing logic (only RBAC enforcement)
- [ ] All auth context passed to backend services

✅ **Frontend**:
- [ ] No role conditionals in data fetching code
- [ ] Single API call per resource
- [ ] No user metadata reading for routing decisions
- [ ] Simpler, less code

✅ **Testing**:
- [ ] Each role tested for each resource type
- [ ] Correct data scoping verified
- [ ] No access control bypasses
- [ ] Performance improved (fewer API calls)

---

## Rollback Plan

If issues arise during migration:

1. **Backend services**: Keep old query parameter handling temporarily
   ```typescript
   // Support both patterns during migration
   if (request.query.recruiter_id || request.query.company_id) {
     // Old pattern (deprecated)
   } else {
     // New pattern
   }
   ```

2. **Frontend**: Use feature flags to toggle new/old behavior
   ```typescript
   const USE_NEW_API = process.env.NEXT_PUBLIC_USE_NEW_API === 'true';
   
   if (USE_NEW_API) {
     await client.get('/api/proposals');
   } else {
     // Old pattern
   }
   ```

3. **Gradual rollout**: Migrate one resource type at a time
   - Start with proposals (already 90% done)
   - Then applications
   - Then jobs, candidates, etc.

---

## Questions & Decisions

### Q: Should we support query parameters for additional filtering?

**A**: Yes! Query params for **filtering** (not scoping):
- ✅ `?status=active` - filter by status
- ✅ `?search=engineer` - search term
- ✅ `?sort_by=created_at&sort_order=desc` - sorting
- ✅ `?page=2&limit=50` - pagination
- ❌ `?recruiter_id=X` - NO, use auth context
- ❌ `?company_id=Y` - NO, use auth context

### Q: What about admin users viewing specific organizations?

**A**: Admin-specific endpoints if needed:
```
GET /api/proposals                    // Admin sees all
GET /api/organizations/:id/proposals  // Admin views specific org
```

Or use query param for admin only:
```
GET /api/proposals?organization_id=X  // Only works for platform_admin
```

### Q: Should we version the API during migration?

**A**: Not necessary. Breaking changes are backend-only (frontend calls same URLs). If needed:
```
GET /api/v2/proposals  // New pattern
GET /api/proposals     // Old pattern (deprecated)
```

---

## Summary

This migration will:
- **Reduce complexity**: Single endpoint per resource, no role conditionals in frontend
- **Improve security**: Authorization logic centralized in backend
- **Simplify maintenance**: Role changes don't require frontend updates
- **Enhance performance**: Fewer API calls (no profile lookups)
- **Prevent bugs**: Type of bug we just fixed won't happen again

**Estimated effort**: 2-3 weeks for complete migration across all resources.

**Next step**: Start with proposals (already 90% done) and establish pattern for other resources.
