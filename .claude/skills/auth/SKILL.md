---
name: auth
description: Clerk authentication patterns, user identification flow, and common auth gotchas for frontend and backend.
---

# /auth - Authentication Patterns

On-demand reference for Clerk auth patterns across the stack. No agent spawn needed — this skill provides the patterns directly.

## Frontend (Next.js Apps)

### Clerk Hooks

```tsx
import { useAuth, useUser } from '@clerk/nextjs';

const { getToken, isSignedIn } = useAuth();
const { user } = useUser();
```

### CRITICAL: getToken Dependency Array Bug

**NEVER put `getToken` in React dependency arrays.** The ref is unstable and causes infinite render loops.

```tsx
// BAD — infinite loop
useEffect(() => { fetchData(); }, [getToken]);

// GOOD — omit from deps, suppress ESLint
useEffect(() => { fetchData(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
```

Exception: `use-chat-gateway.ts` uses a ref pattern intentionally.

### Making Authenticated API Calls

```tsx
const token = await getToken();
const response = await fetch(`${API_URL}/api/v2/resource`, {
    headers: { Authorization: `Bearer ${token}` },
});
```

**Never set `x-clerk-user-id` from frontend code.** Only send the Bearer token.

## API Gateway (Middleware)

The gateway extracts identity from the JWT and sets headers:

```typescript
// api-gateway extracts from Clerk JWT:
request.headers['x-clerk-user-id'] = clerkUserId;
```

## Backend Services

```typescript
// Read identity set by gateway
const clerkUserId = request.headers['x-clerk-user-id'] as string;
if (!clerkUserId) {
    return reply.status(400).send({
        error: { code: 'AUTH_REQUIRED', message: 'Missing x-clerk-user-id header' }
    });
}

// Resolve full access context for authorization
const context = await this.accessResolver.resolve(clerkUserId);
// context.identityUserId, context.roles, context.organizationIds, etc.
```

## User Identification Flow

```
Browser → Bearer token → API Gateway → x-clerk-user-id header → Backend Service
                              ↓
                    Clerk JWT validation
                    Extract clerk_user_id
```

| Layer | What it does |
|-------|-------------|
| Frontend | Sends `Authorization: Bearer <token>` via Clerk `getToken()` |
| API Gateway | Validates JWT, sets `x-clerk-user-id` header |
| Backend | Reads `x-clerk-user-id`, resolves `AccessContext` |
| Database | Stores `clerk_user_id` column |

## Protected Routes (Next.js Middleware)

Clerk middleware handles route protection. Check `apps/portal/src/middleware.ts` for the current config.
