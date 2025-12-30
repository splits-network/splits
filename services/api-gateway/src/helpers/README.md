# API Gateway Helpers

This directory contains shared helper functions for the API Gateway.

## auth-headers.ts

Helper for building authentication headers to send to backend services.

### `buildAuthHeaders(request: FastifyRequest): AuthHeaders`

Extracts authentication context from a Fastify request (populated by Clerk middleware) and builds headers to pass to backend services.

**Returns:**
```typescript
{
  'x-clerk-user-id': string;    // Clerk user ID
  'x-user-role': string;         // Primary role (recruiter, company_admin, etc.)
  'x-organization-id'?: string;  // Organization ID (for company users)
}
```

**Example:**
```typescript
import { buildAuthHeaders } from './helpers/auth-headers';

app.get('/api/proposals', async (request, reply) => {
  const authHeaders = buildAuthHeaders(request);
  
  // Pass headers to backend service
  const data = await atsService().get('/api/proposals', undefined, undefined, authHeaders);
  return reply.send(data);
});
```

**Rules:**
- Request must be authenticated (throws error if not)
- Automatically determines primary role from memberships
- For company users, includes first membership's organization_id

**See:** 
- [API Role-Based Scoping Migration](../../docs/migration/api-role-based-scoping-migration.md)
- [Pattern Comparison](../../docs/migration/PATTERN-COMPARISON.md)

---

## Adding New Helpers

When creating new helpers:

1. Create file in this directory: `helpers/new-helper.ts`
2. Export functions with clear JSDoc comments
3. Add examples in this README
4. Consider TypeScript interfaces for parameters/returns
5. Add unit tests if complex logic

---

**Last Updated**: December 29, 2025
