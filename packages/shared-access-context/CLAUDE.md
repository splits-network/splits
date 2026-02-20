# shared-access-context

V2 RBAC authorization — resolves a Clerk user ID into a full access context.

## Usage

```typescript
import { AccessContextResolver } from '@splits-network/shared-access-context';

// Initialize once per service
const resolver = new AccessContextResolver(supabase);

// Resolve per request
const context = await resolver.resolve(clerkUserId);
// context.identityUserId, context.roles, context.organizationIds, etc.
```

## AccessContext Shape

```typescript
interface AccessContext {
    identityUserId: string | null;
    candidateId: string | null;
    recruiterId: string | null;
    organizationIds: string[];
    orgWideOrganizationIds: string[];
    companyIds: string[];
    roles: string[];
    isPlatformAdmin: boolean;
    error: string;
}
```

All V2 service repositories use this for role-based query filtering.
