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

## Critical: Database-First Role Resolution

**All services share the same Supabase database**. This is a key architectural advantage for performance.

### Role Resolution Strategy: SQL JOINs, Not HTTP Calls

**❌ WRONG - Service-to-Service Calls** (high latency):
```typescript
// This adds 100-300ms latency per additional service call!
async resolveEntityId(clerkUserId: string, userRole: string) {
  // HTTP call to identity-service
  const user = await identityClient.getUserByClerkId(clerkUserId);
  
  // HTTP call to network-service
  const recruiter = await networkClient.getRecruiterByUserId(user.id);
  
  return recruiter.id;
}
```

**✅ CORRECT - Database JOINs** (single query, ~10-20ms):
```typescript
// Single query with JOINs resolves everything at once
const query = `
  SELECT 
    p.*,
    u.clerk_user_id,
    r.id as recruiter_id,
    c.identity_organization_id as company_id,
    m.role as membership_role
  FROM proposals p
  LEFT JOIN users u ON u.clerk_user_id = $1
  LEFT JOIN recruiters r ON r.user_id = u.id
  LEFT JOIN memberships m ON m.user_id = u.id
  LEFT JOIN companies c ON c.identity_organization_id = m.organization_id
  WHERE 
    (r.id IS NOT NULL AND p.recruiter_id = r.id)  -- Recruiter: see their proposals
    OR (m.role IN ('company_admin', 'hiring_manager') AND p.company_id = c.id)  -- Company: see company proposals
    OR (m.role = 'platform_admin')  -- Platform admin: see all
`;
```

**Performance Impact**:
- Service calls: 200-500ms (multiple HTTP round-trips)
- Database JOINs: 10-50ms (single query with indexes)
- **10-25x faster with JOINs!**

### Role Determination from Database

Roles are **NOT** stored in Clerk. They are determined by database records:

| Role | Database Record | Table | Condition |
|------|----------------|-------|------------|
| `recruiter` | ✅ Exists | `recruiters` | `user_id` matches, `status = 'active'` |
| `company_admin` | ✅ Exists | `memberships` | `user_id` matches, `role = 'company_admin'` |
| `hiring_manager` | ✅ Exists | `memberships` | `user_id` matches, `role = 'hiring_manager'` |
| `platform_admin` | ✅ Exists | `memberships` | `user_id` matches, `role = 'platform_admin'` |
| `candidate` | ✅ Exists | `candidates` | `user_id` matches |

**A user can have multiple roles** (e.g., both recruiter and company_admin).

### Standard JOIN Pattern for All Queries

Every backend query that needs role-based filtering should:

1. **Start with the resource table** (proposals, applications, jobs, candidates)
2. **JOIN to users** using `clerk_user_id` from headers
3. **LEFT JOIN to role tables**:
   - `recruiters` (determines recruiter role)
   - `memberships` (determines company_admin, hiring_manager, platform_admin)
   - `candidates` (determines candidate role)
4. **Apply WHERE clause** with role-based conditions

**Example** (proposals query):
```sql
SELECT 
  p.*,
  -- Include role context for debugging/logging
  r.id as user_recruiter_id,
  c.id as user_company_id,
  m.role as user_membership_role
FROM proposals p
LEFT JOIN users u ON u.clerk_user_id = $1  -- From x-clerk-user-id header
LEFT JOIN recruiters r ON r.user_id = u.id AND r.status = 'active'
LEFT JOIN memberships m ON m.user_id = u.id
LEFT JOIN companies c ON c.identity_organization_id = m.organization_id
WHERE 
  -- Recruiter: see proposals they're assigned to
  (r.id IS NOT NULL AND p.recruiter_id = r.id)
  
  OR
  
  -- Company users: see proposals for their company
  (m.role IN ('company_admin', 'hiring_manager') AND p.company_id = c.id)
  
  OR
  
  -- Platform admin: see all (or filtered by organization if specified)
  (m.role = 'platform_admin' AND ($2::uuid IS NULL OR c.identity_organization_id = $2))
;
```

**Key Points**:
- Single query resolves role AND filters data
- No HTTP calls to other services
- Fast with proper indexes on foreign keys
- Role determined by presence of records in role tables
- Handles multi-role users (WHERE with OR conditions)

---

## Important: Public + Authenticated Endpoints

This migration applies to **ALL endpoints**, but some handle both public and authenticated access.

### Endpoint Access Patterns

#### Pattern 1: Authenticated-Only Endpoints

These endpoints require authentication and apply role-based data scoping:

- `GET /api/proposals` - User's proposals only (no public access)
- `GET /api/applications` - User's applications only (no public access)
- `GET /api/candidates` - Candidates user has access to (no public access)
- `POST /api/jobs` - Create job (company users only)
- `PUT /api/jobs/:id` - Update job (company users only)

#### Pattern 2: Public + Authenticated Endpoints

These endpoints support **both** unauthenticated and authenticated access with different data:

- `GET /api/jobs` - Returns different data based on authentication:
  - **Unauthenticated**: Only active/open jobs (public marketplace)
  - **Recruiter**: Marketplace recruiters (may include additional data)
  - **Company Admin/Hiring Manager**: Their company's jobs (for management)
  - **Platform Admin**: All jobs
  
- `GET /api/jobs/:id` - Returns different data based on authentication:
  - **Unauthenticated**: Public job details only
  - **Authenticated**: May include additional private data if user has access
  
- `GET /api/recruiters` - Returns different data based on authentication:
  - **Unauthenticated**: Public recruiter directory
  - **Authenticated**: May include additional contact info

**Key principle**: Single endpoint with conditional logic based on authentication state and role, NOT separate `/api/public/*` and `/api/private/*` endpoints.

---

## Solution Overview

**Backend-Determined Scoping**: Single endpoint per resource, backend filters based on authenticated user's role.

### Standard Query Parameters for ALL List Endpoints

**CRITICAL**: Every list endpoint (proposals, applications, jobs, candidates, etc.) MUST support:

#### 1. Pagination (Required)
```
?page=1           // Page number (1-indexed, default: 1)
&limit=25         // Items per page (default: 25, max: 100)
```

#### 2. Search (Optional)
```
?search=query     // Text search across multiple fields
                  // Backend determines which fields to search
                  // Example: "John Smith" might search name, email, company
```

#### 3. Filtering (Optional)
```
?status=active                    // Single field filter
&job_id=uuid                      // Filter by related entity
&created_after=2025-01-01         // Date range filter
&salary_min=100000                // Numeric range filter
```

#### 4. Sorting (Optional)
```
?sort_by=created_at              // Field to sort by (default: created_at)
&sort_order=DESC                 // ASC or DESC (default: DESC)
```

#### Complete Example
```
GET /api/proposals?page=2&limit=25&search=engineer&status=pending&sort_by=created_at&sort_order=DESC
```

#### Response Format
```json
{
  "data": [...],
  "pagination": {
    "total": 1000,
    "page": 2,
    "limit": 25,
    "total_pages": 40
  }
}
```

**Performance Requirements**:
- ✅ ALL filtering, searching, sorting MUST happen server-side in SQL
- ❌ NEVER implement client-side filtering/sorting (does not scale)
- ✅ Use database indexes on frequently searched/filtered columns
- ✅ Use full-text search indexes for text search when appropriate
- ✅ Debounce search input on frontend (300ms) to reduce API calls

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

### New Pattern (Simplified with Public Access):
```typescript
// Frontend is role-agnostic AND handles unauthenticated:

// Unauthenticated (candidate portal):
const jobs = await fetch('/api/jobs').then(r => r.json());
// Returns: active/open jobs only

// Authenticated (portal):
const client = await createAuthenticatedClient();
const jobs = await client.get('/api/jobs');
// Returns: role-based scoped jobs
//   - Recruiter: marketplace jobs
//   - Company Admin: company's jobs
//   - Platform Admin: all jobs

// Backend determines scope based on presence and type of authentication
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

**AFTER** (Single route, handles both public and authenticated):
```typescript
// Single route handles both unauthenticated and authenticated access
app.get('/api/jobs', async (request, reply) => {
  // Check if authenticated
  const isAuthenticated = !!request.auth?.clerkUserId;
  
  if (!isAuthenticated) {
    // Public access - return only active jobs
    const response = await atsService.get('/jobs/public', {
      params: request.query
    });
    return reply.send(response.data);
  }
  
  // Authenticated access - role-based scoping
  const headers = buildAuthHeaders(request);
  const response = await atsService.get('/jobs', {
    headers,
    params: request.query
  });
  
  return reply.send(response.data);
});
```

**Key Changes**:
- Gateway checks authentication state first
- Unauthenticated: route to public endpoint (active jobs only)
- Authenticated: pass auth context, backend applies role-based scoping
- Single route handles both cases, no separate `/api/public/jobs`

**Key Changes**:
- Gateway enforces authorization (RBAC), not filtering logic
- All auth context passed via headers (`x-clerk-user-id`, `x-user-role`, `x-organization-id`)
- No role-specific routing logic
- Query parameters only for pagination, searching/filtering, sorting, not scoping

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
      setProposals(res.data);
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
// apps/portal/src/app/portal/proposals/page.tsx
async function loadProposals() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/proposals');  // No role logic!
  return res.data;
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
// apps/portal/src/app/portal/applications/page.tsx
async function loadApplications() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/applications', {
    params: { page: 1, limit: 25 }  // Only pagination, no role params
  });
  return res.data;
}

// apps/portal/src/app/portal/applications/[id]/page.tsx
async function loadApplication(id: string) {
  const client = await createAuthenticatedClient();
  const res = await client.get(`/api/applications/${id}`);  // Backend checks access
  return res.data;
}
```

---

### 3. Jobs

**Access Patterns**:
```
GET /api/jobs                          // Handles BOTH public and authenticated
                                       // - Unauthenticated: active jobs only
                                       // - Recruiter: marketplace jobs
                                       // - Company: their jobs
                                       // - Admin: all jobs

GET /api/jobs/:id                      // Handles BOTH public and authenticated
                                       // - Unauthenticated: public job details
                                       // - Authenticated: may include private data if authorized

POST /api/jobs                         // Authenticated only (company users)
PUT /api/jobs/:id                      // Authenticated only (company users)
DELETE /api/jobs/:id                   // Authenticated only (company users)
```

**Backend Changes**:
```typescript
// services/ats-service/src/services/jobs/service.ts

async getJobs(
  filters: JobFilters,
  clerkUserId?: string,
  userRole?: UserRole,
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

async getJobById(
  jobId: string,
  clerkUserId?: string,
  userRole?: UserRole,
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
    // Omit internal fields like internal_notes, created_by, etc.
  };
}
```

**API Gateway Changes**:
```typescript
// services/api-gateway/src/routes/jobs.ts

app.get('/api/jobs', async (request, reply) => {
  const isAuthenticated = !!request.auth?.clerkUserId;
  
  if (!isAuthenticated) {
    // Public access
    const response = await atsService.get('/jobs/public', {
      params: request.query
    });
    return reply.send(response.data);
  }
  
  // Authenticated access
  const headers = buildAuthHeaders(request);
  const response = await atsService.get('/jobs', {
    headers,
    params: request.query
  });
  return reply.send(response.data);
});

app.get('/api/jobs/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const isAuthenticated = !!request.auth?.clerkUserId;
  
  if (!isAuthenticated) {
    // Public access
    const response = await atsService.get(`/jobs/${id}/public`);
    return reply.send(response.data);
  }
  
  // Authenticated access
  const headers = buildAuthHeaders(request);
  const response = await atsService.get(`/jobs/${id}`, { headers });
  return reply.send(response.data);
});
```

**Frontend Changes**:
```typescript
// apps/candidate/src/app/jobs/page.tsx (Unauthenticated)
async function loadPublicJobs() {
  const res = await fetch('/api/jobs');  // No auth
  const data = await res.json();
  return data;
}

// apps/portal/src/app/portal/roles/page.tsx portal
async function loadJobs() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/jobs');  // Auth applied, role-based data
  return res.data;
}
```

---

### 4. Candidates

**Authenticated Endpoints Only** (No Public Access):
```
GET /api/candidates                    // Returns scoped to user role
GET /api/candidates/:id                // Returns if user has access
POST /api/candidates                   // Create candidate profile
PUT /api/candidates/:id                // Update candidate
```

**Note**: Candidate data is never public - only accessible to authenticated users with proper permissions.

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
// apps/portal/src/app/portal/roles/page.tsx
async function loadJobs() {
  const client = await createAuthenticatedClient();
  const res = await client.get('/api/jobs');  // No role logic!
  return res.data;
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

## Public Endpoint Examples

### Example 1: Public Job Search (No Auth)

**API Gateway**:
```typescript
// No authentication middleware
app.get('/api/jobs', async (request, reply) => {
  // No auth headers needed - public access
  const response = await services.get('/jobs/public', {
    params: request.query,
  });
  return reply.send(response.data);
});

app.get('/api/jobs/:id', async (request, reply) => {
  // Public job detail
  const response = await services.get(`/jobs/public/${request.params.id}`);
  return reply.send(response.data);
});
```

**ATS Service**:
```typescript
// Public route - no auth context needed
app.get('/jobs/public', async (request, reply) => {
  const filters = {
    page: Number(request.query.page) || 1,
    limit: Number(request.query.limit) || 25,
    search: request.query.search as string | undefined,
    location: request.query.location as string | undefined,
  };
  
  const result = await jobService.getPublicJobs(filters);
  return reply.send({ data: result.data, pagination: result.pagination });
});
```

### Example 2: Authenticated Job Management

**API Gateway**:
```typescript
// Requires authentication
app.get('/api/jobs/my-jobs', {
  preHandler: requireRoles(
    ['company_admin', 'hiring_manager', 'platform_admin'],
    services
  ),
}, async (request, reply) => {
  const headers = buildAuthHeaders(request);
  const response = await services.get('/jobs/for-user', {
    headers,
    params: request.query,
  });
  return reply.send(response.data);
});
---

## Public + Authenticated Endpoint Pattern

Some endpoints need to handle **both** unauthenticated public and authenticated (role-scoped) access.

### Pattern: Conditional Data Based on Auth State

```typescript
// services/api-gateway/src/routes/jobs.ts

app.get('/api/jobs', async (request, reply) => {
  const isAuthenticated = !!request.auth?.clerkUserId;
  
  if (!isAuthenticated) {
    // Public: return active jobs only
    const response = await atsService.get('/jobs/public', {
      params: request.query
    });
    return reply.send(response.data);
  }
  
  // Authenticated: apply role-based scoping
  const headers = buildAuthHeaders(request);
  const response = await atsService.get('/jobs', {
    headers,
    params: request.query
  });
  return reply.send(response.data);
});
```

### Backend Implementation

```typescript
// services/ats-service/src/services/jobs/service.ts

async getJobs(
  filters: JobFilters,
  clerkUserId?: string,
  userRole?: UserRole,
  organizationId?: string
): Promise<{ data: Job[]; pagination: PaginationMeta }> {
  // No auth context - public access
  if (!clerkUserId || !userRole) {
    return this.repository.findActiveJobs(filters);
  }
  
  // Authenticated - role-based scoping
  switch (userRole) {
    case 'recruiter':
      return this.repository.findMarketplaceJobs(filters);
    case 'company_admin':
    case 'hiring_manager':
      const company = await this.getCompanyByOrg(organizationId);
      return this.repository.findByCompany(company.id, filters);
    case 'platform_admin':
      return this.repository.findAll(filters);
  }
}
```

### Frontend Usage

```typescript
// Unauthenticated (candidate portal)
const jobs = await fetch('/api/jobs').then(r => r.json());
// Returns: active jobs only

// Authenticated (portal)
const client = await createAuthenticatedClient();
const jobs = await client.get('/api/jobs');
// Returns: role-based scoped jobs
```

---

## Common Pitfalls

### ❌ Pitfall 0: Creating Separate Public/Private Endpoints
```typescript
// WRONG - Don't create separate /api/public/* routes
app.get('/api/public/jobs', ...);  // NO!
app.get('/api/private/jobs', ...); // NO!

// CORRECT - Single endpoint handles both
app.get('/api/jobs', async (request, reply) => {
  const isAuth = !!request.auth?.clerkUserId;
  // Route to different backend logic based on auth
});
```

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
