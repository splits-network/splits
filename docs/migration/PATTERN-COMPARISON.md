# Migration Pattern Comparison

This document shows side-by-side comparisons of old vs new code patterns for the API role-based scoping migration.

---

## API Gateway Route: GET /api/proposals

### ❌ Old Pattern (Current)

```typescript
// Inline role determination logic (40+ lines)
async function determineUserRole(auth: any, correlationId?: string): Promise<'candidate' | 'recruiter' | 'company' | 'admin'> {
    const memberships = auth.memberships || [];
    
    if (memberships.some((m: any) => m.role === 'platform_admin')) {
        return 'admin';
    }
    if (memberships.some((m: any) => m.role === 'company_admin' || m.role === 'hiring_manager')) {
        return 'company';
    }
    
    // Check if user is a recruiter by querying network service
    try {
        const recruiterResponse: any = await networkService().get(
            `/recruiters/by-user/${auth.userId}`,
            undefined,
            correlationId
        );
        
        if (recruiterResponse?.data) {
            return 'recruiter';
        }
    } catch (error) {
        // Not a recruiter - continue to candidate fallback
    }
    
    return 'candidate';
}

// Inline header building logic (15+ lines)
function buildHeaders(auth: any, userRole: string): Record<string, string> {
    const headers: Record<string, string> = {
        'x-clerk-user-id': auth.clerkUserId,
        'x-user-role': userRole,
    };

    if (userRole === 'company' && auth.memberships && auth.memberships.length > 0) {
        headers['x-organization-id'] = auth.memberships[0].organization_id;
    }

    return headers;
}

// Endpoint handler (20 lines)
app.get('/api/proposals', {
    schema: {
        description: 'Get all proposals for current user',
        tags: ['proposals'],
        security: [{ clerkAuth: [] }],
    },
}, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    const correlationId = getCorrelationId(request);

    // Determine user role (no entity resolution in gateway)
    const userRole = await determineUserRole(req.auth, correlationId);

    // Forward query params directly to ATS service
    const queryString = new URLSearchParams(request.query as any).toString();
    const path = `/api/proposals?${queryString}`;

    // Build headers including organization_id for company users
    const headers = buildHeaders(req.auth, userRole);

    const data = await atsService().get(path, undefined, correlationId, headers);
    return reply.send(data);
});
```

**Total**: ~75 lines per file with inline helpers

---

### ✅ New Pattern (Migration)

```typescript
// Import shared helper (1 line)
import { buildAuthHeaders } from '../../helpers/auth-headers';

// Endpoint handler (7 lines)
app.get('/api/proposals', {
    preHandler: requireRoles(['recruiter', 'company_admin', 'hiring_manager', 'platform_admin', 'candidate'], services),
    schema: {
        description: 'Get all proposals for current user',
        tags: ['proposals'],
        security: [{ clerkAuth: [] }],
    },
}, async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = getCorrelationId(request);
    const authHeaders = buildAuthHeaders(request);

    const queryString = new URLSearchParams(request.query as any).toString();
    const path = `/api/proposals${queryString ? `?${queryString}` : ''}`;

    const data = await atsService().get(path, undefined, correlationId, authHeaders);
    return reply.send(data);
});
```

**Total**: ~8 lines per endpoint

**Savings**: ~67% code reduction per endpoint, 100% DRY (helper reusable)

---

## Backend Service Route: GET /api/proposals

### ❌ Old Pattern (Current)

```typescript
// Inline context extraction (15 lines per file)
function getUserContext(request: any): { clerkUserId: string; userRole: UserRole; organizationId?: string } | null {
    const clerkUserId = request.headers['x-clerk-user-id'];
    const userRole = request.headers['x-user-role'] as UserRole;
    const organizationId = request.headers['x-organization-id'];
    
    if (!clerkUserId || !userRole) {
        return null;
    }
    
    return { clerkUserId, userRole, organizationId };
}

// Endpoint handler (20 lines)
fastify.get('/api/proposals', async (request, reply) => {
    const userContext = getUserContext(request);
    if (!userContext) {
        return reply.code(401).send({
            error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
        });
    }

    const { clerkUserId, userRole, organizationId } = userContext;
    const correlationId = (request as any).correlationId;
    const query = request.query as any;

    const filters: ProposalFilters = {
        type: query.type,
        state: query.state,
        search: query.search as string,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 25,
        urgent_only: query.urgent_only === 'true'
    };

    const result = await proposalService.getProposalsForUser(clerkUserId, userRole, filters, correlationId, organizationId);
    return reply.send({ data: result });
});
```

**Total**: ~35 lines per file with inline helper

---

### ✅ New Pattern (Migration)

```typescript
// Import shared helper (1 line)
import { requireUserContext } from '../../helpers/auth-context';

// Endpoint handler (10 lines)
fastify.get('/api/proposals', async (request, reply) => {
    const userContext = requireUserContext(request);
    const correlationId = (request as any).correlationId;
    const query = request.query as any;

    const filters: ProposalFilters = {
        type: query.type,
        state: query.state,
        search: query.search as string,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 25,
        urgent_only: query.urgent_only === 'true'
    };

    const result = await proposalService.getProposalsForUser(
        userContext.clerkUserId, 
        userContext.userRole as UserRole, 
        filters, 
        correlationId, 
        userContext.organizationId
    );
    
    return reply.send({ data: result });
});
```

**Total**: ~11 lines per endpoint

**Savings**: ~69% code reduction per endpoint, consistent error handling

---

## Frontend Component: Proposals Page

### ❌ Old Pattern (Current)

```typescript
'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { createAuthenticatedClient } from '@/lib/api-client';

export default function ProposalsPage() {
  const { user } = useUser();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProposals() {
      if (!user) return;
      
      const client = await createAuthenticatedClient();
      
      // Frontend has role logic - determine which endpoint to call
      const userRole = user.publicMetadata?.role;
      const memberships = user.organizationMemberships;
      
      let url = '/api/proposals';
      
      if (userRole === 'recruiter') {
        // Get recruiter profile first
        const profileRes = await client.get(`/api/recruiters/by-user/${user.id}`);
        url = `/api/proposals?recruiter_id=${profileRes.data.id}`;
      } else if (userRole === 'company_admin' || userRole === 'hiring_manager') {
        // Get organization ID from memberships
        const orgId = memberships[0]?.organization.id;
        url = `/api/proposals?organization_id=${orgId}`;
      }
      
      const res = await client.get(url);
      setProposals(res.data.data);
      setLoading(false);
    }
    
    loadProposals();
  }, [user]);
  
  if (loading) return <div>Loading...</div>;
  
  return <ProposalsList proposals={proposals} />;
}
```

**Total**: ~40 lines with role conditionals

---

### ✅ New Pattern (Migration)

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
      
      // Single API call - backend determines scope
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

**Total**: ~20 lines, no role logic

**Savings**: ~50% code reduction, no role checks, faster load (no extra profile fetch)

---

## Benefits Summary

### Code Reduction

| Layer | Old Lines | New Lines | Savings |
|-------|-----------|-----------|---------|
| API Gateway (per endpoint) | ~20 | ~8 | 60% |
| Backend Service (per endpoint) | ~35 | ~11 | 69% |
| Frontend Component | ~40 | ~20 | 50% |

### Maintenance Improvements

1. **Single Source of Truth**
   - Auth header building: 1 function vs duplicated in every route
   - User context extraction: 1 function vs duplicated in every service
   - Role determination: Backend only vs frontend + gateway + backend

2. **Consistency**
   - All endpoints use same helpers
   - Error handling is consistent
   - Easier to review PRs (familiar pattern)

3. **Type Safety**
   - `UserContext` interface ensures proper typing
   - Compiler catches errors in context usage
   - Less runtime errors

4. **Testing**
   - Helper functions can be unit tested independently
   - Endpoints become simpler to test (fewer branches)
   - Mock helpers instead of mocking inline logic

5. **Future Changes**
   - Add new role: Update helper function only
   - Add new auth context: Update interface + helpers only
   - Change auth strategy: Update helpers, endpoints unchanged

---

## Migration Checklist

When migrating an endpoint:

- [ ] Gateway: Replace inline role determination with `buildAuthHeaders()`
- [ ] Gateway: Ensure `requireRoles()` middleware includes all allowed roles
- [ ] Backend: Replace inline context extraction with `requireUserContext()`
- [ ] Backend: Update service method to accept auth context parameters
- [ ] Backend: Implement `resolveEntityId()` if not already present
- [ ] Frontend: Remove role conditionals, use single API call
- [ ] Test: Verify each role sees correct data scope
- [ ] Test: Verify pagination, filtering, sorting still work
- [ ] Test: Verify error cases (unauthorized, not found)
- [ ] Document: Update API docs if response format changed

---

**Migration makes code simpler, cleaner, and more maintainable!** ✨
