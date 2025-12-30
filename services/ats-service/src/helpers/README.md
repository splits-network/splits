# ATS Service Helpers

This directory contains shared helper functions for the ATS Service.

## auth-context.ts

Helpers for extracting user authentication context from request headers set by API Gateway.

### `getUserContext(request: FastifyRequest): UserContext | null`

Extracts user context from headers. Returns `null` if not authenticated (for endpoints that support both public and authenticated access).

**Returns:**
```typescript
{
  clerkUserId: string;       // Clerk user ID
  userRole: string;          // User role (recruiter, company_admin, etc.)
  organizationId?: string;   // Organization ID (for company users)
}
```

**Example:**
```typescript
import { getUserContext } from '../../helpers/auth-context';

// For endpoints that support both public and authenticated access
fastify.get('/api/jobs', async (request, reply) => {
  const userContext = getUserContext(request);
  
  if (userContext) {
    // User is authenticated - apply role-based scoping
    const jobs = await jobService.getJobsForUser(userContext.clerkUserId, userContext.userRole);
    return reply.send({ data: jobs });
  } else {
    // No auth - return public jobs only
    const jobs = await jobService.getPublicJobs();
    return reply.send({ data: jobs });
  }
});
```

---

### `requireUserContext(request: FastifyRequest): UserContext`

Same as `getUserContext()` but throws error if not authenticated. Use for endpoints that require authentication.

**Example:**
```typescript
import { requireUserContext } from '../../helpers/auth-context';

// For authenticated-only endpoints
fastify.get('/api/proposals', async (request, reply) => {
  const userContext = requireUserContext(request);
  
  // If we reach here, user is authenticated
  const proposals = await proposalService.getProposalsForUser(
    userContext.clerkUserId,
    userContext.userRole,
    filters,
    undefined,
    userContext.organizationId
  );
  
  return reply.send({ data: proposals });
});
```

---

## Rules

1. **API Gateway sets these headers** - Backend services read them
2. **Never trust headers from clients** - Only trust gateway-set headers
3. **Use requireUserContext() by default** - Only use getUserContext() for public+auth endpoints
4. **Pass context to service layer** - Don't query identity/network directly in routes

---

## See Also

- [API Role-Based Scoping Migration](../../../docs/migration/api-role-based-scoping-migration.md)
- [Pattern Comparison](../../../docs/migration/PATTERN-COMPARISON.md)
- [User Identification Standard](../../../docs/guidance/user-identification-standard.md)

---

**Last Updated**: December 29, 2025
