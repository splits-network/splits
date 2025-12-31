# Database JOIN Pattern for Role-Based Data Scoping

**Status**: Required Pattern  
**Created**: December 29, 2025  
**Priority**: CRITICAL for Performance

---

## Overview

All backend services in Splits Network share the **same Supabase database**. This is a key architectural advantage that enables us to use **SQL JOINs for role resolution and data filtering in a single query**, eliminating the need for service-to-service HTTP calls.

---

## Performance Impact

### ❌ Service-to-Service HTTP Calls (OLD - DO NOT USE)

```typescript
// This pattern adds 200-500ms latency!
async getProposalsForUser(clerkUserId: string, userRole: string) {
  // HTTP call #1: identity-service (~100ms)
  const user = await identityClient.getUserByClerkId(clerkUserId);
  
  // HTTP call #2: network-service (~100ms)
  const recruiter = await networkClient.getRecruiterByUserId(user.id);
  
  // HTTP call #3: ats-service (~100ms)
  const proposals = await atsClient.getProposalsByRecruiter(recruiter.id);
  
  return proposals;
}
// Total: 300-500ms for 3 HTTP round-trips
```

**Problems**:
- Multiple network round-trips (100-200ms each)
- N+1 query problems (scales poorly)
- Complex error handling across services
- Increased latency for users
- More infrastructure overhead

### ✅ Database JOINs (NEW - REQUIRED PATTERN)

```typescript
// Single query with JOINs: 10-50ms
async getProposalsForUser(clerkUserId: string) {
  // ONE database query with JOINs resolves role AND filters data
  return this.repository.findForUser(clerkUserId);
}

// Repository implementation
async findForUser(clerkUserId: string): Promise<Proposal[]> {
  const { data } = await this.supabase
    .rpc('get_proposals_for_user', { p_clerk_user_id: clerkUserId });
  return data;
}
```

**Benefits**:
- Single database query (~10-50ms with indexes)
- **10-25x faster** than service calls
- Simpler error handling
- Better for scaling
- Database query optimizer handles performance

---

## Role Determination from Database Tables

**CRITICAL**: Roles are **NOT** in Clerk. They are determined by **presence of records in database tables**.

### Role Lookup Table

| Role | Determined By | Table | Condition |
|------|--------------|-------|-----------|
| `recruiter` | ✅ Record exists | `network.recruiters` | `user_id` matches AND `status = 'active'` |
| `company_admin` | ✅ Record exists | `identity.memberships` | `user_id` matches AND `role = 'company_admin'` |
| `hiring_manager` | ✅ Record exists | `identity.memberships` | `user_id` matches AND `role = 'hiring_manager'` |
| `platform_admin` | ✅ Record exists | `identity.memberships` | `user_id` matches AND `role = 'platform_admin'` |
| `candidate` | ✅ Record exists | `ats.candidates` | `user_id` matches |

**Important**: A user can have **multiple roles** (e.g., both recruiter and company_admin).

### Database Schema Relationships

```
identity.users (clerk_user_id) ← Source of truth for Clerk ID
  ├─→ network.recruiters (user_id)           → Determines recruiter role
  ├─→ identity.memberships (user_id)         → Determines company_admin, hiring_manager, platform_admin
  └─→ ats.candidates (user_id)               → Determines candidate role

identity.memberships
  └─→ identity.organizations (organization_id)
      └─→ ats.companies (identity_organization_id)  → Links users to companies
```

---

## Standard JOIN Pattern

**Every query** that needs role-based filtering should follow this pattern:

### 1. Start with Resource Table

```sql
SELECT 
  p.*,  -- Main resource (proposals, applications, jobs, etc.)
  -- Include related data to avoid N+1
  j.title as job_title,
  c.name as company_name,
  cand.full_name as candidate_name
FROM ats.proposals p
JOIN ats.jobs j ON j.id = p.job_id
JOIN ats.companies c ON c.id = p.company_id
JOIN ats.candidates cand ON cand.id = p.candidate_id
```

### 2. JOIN to User Identity

```sql
-- Resolve Clerk user ID to internal user UUID
LEFT JOIN identity.users u ON u.clerk_user_id = $1  -- From x-clerk-user-id header
```

### 3. JOIN to Role Tables

```sql
-- Check if user is a recruiter
LEFT JOIN network.recruiters r ON r.user_id = u.id AND r.status = 'active'

-- Check if user is company admin/hiring manager/platform admin
LEFT JOIN identity.memberships m ON m.user_id = u.id

-- Link user's organization to company
LEFT JOIN ats.companies user_company ON user_company.identity_organization_id = m.organization_id
```

### 4. Apply Role-Based WHERE Clause

```sql
WHERE 
  -- Recruiter: see proposals they're assigned to
  (r.id IS NOT NULL AND p.recruiter_id = r.id)
  
  OR
  
  -- Company users: see proposals for their company
  (m.role IN ('company_admin', 'hiring_manager') AND p.company_id = user_company.id)
  
  OR
  
  -- Platform admin: see all
  (m.role = 'platform_admin')
```

**Key Points**:
- Role determined by **presence of records** (IS NOT NULL checks)
- Use `OR` to handle users with multiple roles
- LEFT JOINs ensure query doesn't fail if user has no role
- WHERE clause filters based on role conditions

---

## Standard Query Parameters for All List Endpoints

**CRITICAL**: Every list endpoint MUST support these query parameters:

### 1. Pagination (Required)
```typescript
?page=1           // Page number (1-indexed)
&limit=25         // Items per page (default: 25, max: 100)
```

### 2. Search (Optional)
```typescript
?search=query     // Text search across multiple fields
                  // Example: "John Smith" searches name, email, company
```

### 3. Filtering (Optional)
```typescript
?status=active                    // Single field filter
&job_id=uuid                      // Filter by related entity
&created_after=2025-01-01         // Date range filter
&salary_min=100000                // Numeric range filter
```

### 4. Sorting (Optional)
```typescript
?sort_by=created_at              // Field to sort by
&sort_order=DESC                 // ASC or DESC (default: DESC)
```

### Complete Example Request
```
GET /api/proposals?page=2&limit=25&search=engineer&status=pending&sort_by=created_at&sort_order=DESC
```

### Response Format
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

**Performance Rules**:
- ✅ ALL filtering, searching, sorting MUST happen server-side in SQL
- ❌ NEVER filter/search/sort on client-side (does not scale)
- ✅ Use database indexes for search and filter columns
- ✅ Use full-text search for text fields when appropriate

---

## Complete Example: Proposals Query

### Database Function (Recommended Approach)

```sql
CREATE OR REPLACE FUNCTION ats.get_proposals_for_user(
  -- Auth context
  p_clerk_user_id TEXT,
  p_organization_id UUID DEFAULT NULL,
  
  -- Pagination (REQUIRED)
  p_limit INT DEFAULT 25,
  p_offset INT DEFAULT 0,
  
  -- Search (text across multiple fields)
  p_search TEXT DEFAULT NULL,
  
  -- Filtering (specific fields)
  p_status TEXT DEFAULT NULL,
  p_job_id UUID DEFAULT NULL,
  p_company_id UUID DEFAULT NULL,
  p_created_after TIMESTAMPTZ DEFAULT NULL,
  p_created_before TIMESTAMPTZ DEFAULT NULL,
  
  -- Sorting
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
    p.created_at,
    p.updated_at,
    -- Enriched data
    j.title as job_title,
    c.name as company_name,
    cand.full_name as candidate_name,
    u_rec.name as recruiter_name
  FROM network.candidate_role_assignments p
  
  -- JOINs for enriched data (avoid N+1)
  JOIN ats.jobs j ON j.id = p.job_id
  JOIN ats.companies c ON c.id = j.company_id
  JOIN ats.candidates cand ON cand.id = p.candidate_id
  JOIN network.recruiters rec ON rec.id = p.recruiter_id
  JOIN identity.users u_rec ON u_rec.id = rec.user_id
  
  -- JOINs to resolve requesting user's role (NO HTTP calls!)
  LEFT JOIN identity.users u ON u.clerk_user_id = p_clerk_user_id
  LEFT JOIN network.recruiters req_r ON req_r.user_id = u.id AND req_r.status = 'active'
  LEFT JOIN identity.memberships m ON m.user_id = u.id
  LEFT JOIN ats.companies user_company ON user_company.identity_organization_id = m.organization_id
  
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
  
  -- FILTERING: Specific field filters (optional)
  AND (p_status IS NULL OR p.state = p_status)
  AND (p_job_id IS NULL OR p.job_id = p_job_id)
  AND (p_company_id IS NULL OR p.company_id = p_company_id)
  AND (p_created_after IS NULL OR p.created_at >= p_created_after)
  AND (p_created_before IS NULL OR p.created_at <= p_created_before)
  
  -- SEARCH: Text search across multiple fields (optional)
  AND (
    p_search IS NULL 
    OR j.title ILIKE '%' || p_search || '%'
    OR c.name ILIKE '%' || p_search || '%'
    OR cand.full_name ILIKE '%' || p_search || '%'
    OR cand.email ILIKE '%' || p_search || '%'
  )
  
  -- SORTING: Dynamic sort by field and order (optional)
  ORDER BY 
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'ASC' THEN p.created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'DESC' THEN p.created_at END DESC,
    CASE WHEN p_sort_by = 'proposed_at' AND p_sort_order = 'ASC' THEN p.proposed_at END ASC,
    CASE WHEN p_sort_by = 'proposed_at' AND p_sort_order = 'DESC' THEN p.proposed_at END DESC,
    CASE WHEN p_sort_by = 'candidate_name' AND p_sort_order = 'ASC' THEN cand.full_name END ASC,
    CASE WHEN p_sort_by = 'candidate_name' AND p_sort_order = 'DESC' THEN cand.full_name END DESC,
    CASE WHEN p_sort_by = 'job_title' AND p_sort_order = 'ASC' THEN j.title END ASC,
    CASE WHEN p_sort_by = 'job_title' AND p_sort_order = 'DESC' THEN j.title END DESC
  
  -- PAGINATION: Limit and offset (required)
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
```

### Repository Call

```typescript
interface ListFilters {
  // Pagination (required)
  page?: number;          // Default: 1
  limit?: number;         // Default: 25, max: 100
  
  // Search (optional)
  search?: string;        // Text search across multiple fields
  
  // Filtering (optional)
  status?: string;        // Filter by status
  job_id?: string;        // Filter by job
  company_id?: string;    // Filter by company
  created_after?: string; // Filter by date range
  created_before?: string;
  
  // Sorting (optional)
  sort_by?: string;       // Field to sort by (default: 'created_at')
  sort_order?: 'ASC' | 'DESC';  // Sort direction (default: 'DESC')
}

async findForUser(
  clerkUserId: string,
  organizationId: string | null,
  filters: ListFilters
): Promise<{ data: Proposal[]; total: number }> {
  // Calculate offset from page number
  const limit = Math.min(filters.limit || 25, 100);
  const page = filters.page || 1;
  const offset = (page - 1) * limit;
  
  const { data, error } = await this.supabase
    .rpc('get_proposals_for_user', {
      // Auth context
      p_clerk_user_id: clerkUserId,
      p_organization_id: organizationId,
      
      // Pagination
      p_limit: limit,
      p_offset: offset,
      
      // Search
      p_search: filters.search || null,
      
      // Filtering
      p_status: filters.status || null,
      p_job_id: filters.job_id || null,
      p_company_id: filters.company_id || null,
      p_created_after: filters.created_after || null,
      p_created_before: filters.created_before || null,
      
      // Sorting
      p_sort_by: filters.sort_by || 'created_at',
      p_sort_order: filters.sort_order || 'DESC'
    });
  
  if (error) throw error;
  
  // Get total count for pagination (separate query or from function)
  const total = await this.countForUser(clerkUserId, organizationId, filters);
  
  return { data: data || [], total };
}
```

### Service Layer (Thin!)

```typescript
async getProposalsForUser(
  clerkUserId: string,
  filters: ListFilters,
  correlationId: string,
  organizationId?: string
): Promise<{ data: Proposal[]; pagination: PaginationMeta }> {
  // Simple! Repository does all the work via database function
  const { data, total } = await this.repository.findForUser(
    clerkUserId,
    organizationId || null,
    filters
  );
  
  const limit = Math.min(filters.limit || 25, 100);
  const page = filters.page || 1;
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit)
    }
  };
}
```

### Route Handler

```typescript
app.get('/proposals', async (request, reply) => {
  const clerkUserId = request.headers['x-clerk-user-id'] as string;
  const correlationId = request.headers['x-correlation-id'] as string;
  
  // Extract query parameters
  const filters: ListFilters = {
    // Pagination
    page: request.query.page ? parseInt(request.query.page) : 1,
    limit: request.query.limit ? parseInt(request.query.limit) : 25,
    
    // Search
    search: request.query.search as string | undefined,
    
    // Filtering
    status: request.query.status as string | undefined,
    job_id: request.query.job_id as string | undefined,
    company_id: request.query.company_id as string | undefined,
    created_after: request.query.created_after as string | undefined,
    created_before: request.query.created_before as string | undefined,
    
    // Sorting
    sort_by: request.query.sort_by as string | undefined,
    sort_order: request.query.sort_order as 'ASC' | 'DESC' | undefined,
  };
  
  const result = await proposalService.getProposalsForUser(
    clerkUserId,
    filters,
    correlationId,
    request.query.organization_id as string | undefined
  );
  
  return reply.send(result);
});
```

**Benefits of this pattern**:
- **10-50ms query time** (vs 200-500ms with service calls)
- **Single database round-trip**
- **Automatic role resolution** from database records
- **Enriched data** (joins prevent N+1 queries)
- **Simple service layer** (no role branching)
- **Better error handling** (database errors only)
- **Scales well** (query optimizer handles performance)

---

## Required Indexes

For optimal performance, ensure these indexes exist:

```sql
-- User identity resolution
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id 
  ON identity.users(clerk_user_id);

-- Role table lookups
CREATE INDEX IF NOT EXISTS idx_recruiters_user_id 
  ON network.recruiters(user_id);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id 
  ON identity.memberships(user_id);

CREATE INDEX IF NOT EXISTS idx_candidates_user_id 
  ON ats.candidates(user_id);

-- Resource filtering
CREATE INDEX IF NOT EXISTS idx_proposals_recruiter_id 
  ON network.candidate_role_assignments(recruiter_id);

CREATE INDEX IF NOT EXISTS idx_applications_recruiter_id 
  ON ats.applications(recruiter_id);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id 
  ON ats.jobs(company_id);

-- Organization to company mapping
CREATE INDEX IF NOT EXISTS idx_companies_identity_organization_id 
  ON ats.companies(identity_organization_id);
```

**Query performance without indexes**: 500-2000ms  
**Query performance with indexes**: 10-50ms  
**50-200x faster with proper indexes!**

---

## Migration Checklist

When migrating an endpoint to this pattern:

- [ ] Create database function with JOINs for role resolution
- [ ] Add all required indexes (see above)
- [ ] Update repository to call database function
- [ ] Simplify service layer (no role branching, no service clients)
- [ ] Remove service-to-service HTTP calls
- [ ] Test query performance (should be < 50ms)
- [ ] Test with all roles (recruiter, company_admin, hiring_manager, platform_admin)
- [ ] Verify no data leakage between roles

---

## Common Patterns

### Pattern 1: List Resources for User

Use when: User wants to see resources they have access to (proposals, applications, jobs, candidates)

```sql
-- Single query with JOINs
-- Role determined by presence in role tables
-- Filtering applied in WHERE clause
```

### Pattern 2: Get Specific Resource for User

Use when: User wants to view a specific resource (proposal detail, application detail, job detail)

```sql
-- Same JOIN pattern
-- Additional WHERE clause for resource ID
-- Returns null if user doesn't have access
```

### Pattern 3: Multi-Role Users

Use when: User has multiple roles (e.g., both recruiter and company_admin)

```sql
-- Use OR in WHERE clause
-- User sees data from ALL their roles combined
-- Most permissive wins (platform_admin sees everything)
```

### Pattern 4: Public + Authenticated Access

Use when: Endpoint supports both public and authenticated access (e.g., GET /api/jobs)

```sql
-- Check if clerk_user_id is provided
-- If NULL: apply public filters (active jobs only)
-- If provided: apply role-based filters
```

---

## Anti-Patterns (DO NOT USE)

### ❌ Service-to-Service Calls for Role Resolution

```typescript
// BAD: 200-500ms latency
const user = await identityClient.getUserByClerkId(clerkUserId);
const recruiter = await networkClient.getRecruiterByUserId(user.id);
```

### ❌ Multiple Repository Methods per Role

```typescript
// BAD: Code duplication, hard to maintain
async getProposalsForRecruiter(recruiterId: string) { ... }
async getProposalsForCompany(companyId: string) { ... }
async getProposalsForAdmin() { ... }
```

### ❌ Role Branching in Service Layer

```typescript
// BAD: Service layer has business logic
switch (userRole) {
  case 'recruiter': return this.repository.findByRecruiter(...);
  case 'company_admin': return this.repository.findByCompany(...);
}
```

### ❌ N+1 Queries for Related Data

```typescript
// BAD: Multiple queries
const proposals = await this.repository.findForUser(clerkUserId);
for (const proposal of proposals) {
  proposal.job = await this.jobRepository.findById(proposal.job_id);
  proposal.company = await this.companyRepository.findById(proposal.company_id);
}
```

---

## Troubleshooting

### Query is slow (> 100ms)

1. Check if indexes exist (see Required Indexes section)
2. Run `EXPLAIN ANALYZE` on the query
3. Look for sequential scans (should be index scans)
4. Add missing indexes

### User sees no data (empty result)

1. Check if user has role record in database:
   - Recruiter: `SELECT * FROM network.recruiters WHERE user_id = ...`
   - Company: `SELECT * FROM identity.memberships WHERE user_id = ...`
2. Verify `clerk_user_id` matches in `identity.users`
3. Check LEFT JOIN conditions (should allow NULL)
4. Verify WHERE clause uses OR for multi-role users

### User sees too much data (data leakage)

1. Review WHERE clause conditions
2. Ensure role checks use AND with resource filters
3. Test with different user accounts
4. Check if JOIN to wrong table (e.g., wrong company)

---

## Summary

**Required Pattern**:
1. ✅ Use SQL JOINs to resolve roles from database tables
2. ✅ Single query with WHERE clause for role-based filtering
3. ✅ Database function for complex queries (optional but recommended)
4. ✅ Thin service layer (no role branching)
5. ✅ Proper indexes on all JOIN foreign keys

**DO NOT**:
1. ❌ Make HTTP calls between services for role resolution
2. ❌ Use multiple repository methods per role
3. ❌ Put role branching logic in service layer
4. ❌ Query related data separately (use JOINs to prevent N+1)

**Performance Target**:
- Query execution: < 50ms
- Total API response: < 100ms
- **10-25x faster than service calls!**

---

**Questions?** See [api-role-based-scoping-migration.md](./api-role-based-scoping-migration.md) for migration plan.
