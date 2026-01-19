# Frontend `/me` Endpoints Implementation

**Date**: January 19, 2026  
**Status**: ✅ COMPLETE - API clients updated with convenience methods

## Overview

Updated both Portal and Candidate app API clients with convenience methods for the new `/me` endpoints. These methods provide type-safe, secure access to user-specific singleton resources.

## Implementation Summary

### Portal App API Client (`apps/portal/src/lib/api-client.ts`)

Added two new convenience methods:

```typescript
/**
 * Get current user's recruiter profile
 * Uses /me endpoint for security (prevents seeing other users' data)
 */
async getCurrentRecruiter(): Promise<{ data: any }> {
    return await this.get('/recruiters/me');
}

/**
 * Get current user's active subscription
 * Uses /me endpoint for security
 */
async getCurrentSubscription(): Promise<{ data: any }> {
    return await this.get('/subscriptions/me');
}
```

### Candidate App API Client (`apps/candidate/src/lib/api-client.ts`)

Added one new convenience method:

```typescript
/**
 * Get current user's candidate profile
 * Uses /me endpoint for security (prevents seeing other users' data)
 */
async getCurrentCandidate(): Promise<{ data: any }> {
    return await this.get('/candidates/me');
}
```

## Usage Examples

### Portal App - Recruiter Profile

```tsx
import { createAuthenticatedClient } from '@/lib/api-client';

// ✅ CORRECT - Use convenience method
const api = createAuthenticatedClient(token);
const { data: recruiter } = await api.getCurrentRecruiter();

// ❌ WRONG - Direct call (still works but less semantic)
const response = await api.get('/recruiters/me');
const recruiter = response.data;
```

### Portal App - Subscription

```tsx
import { createAuthenticatedClient } from '@/lib/api-client';

// ✅ CORRECT - Use convenience method
const api = createAuthenticatedClient(token);
const { data: subscription } = await api.getCurrentSubscription();

// Handle no subscription case
if (!subscription) {
    console.log('No active subscription found');
}
```

### Candidate App - Candidate Profile

```tsx
import { createAuthenticatedClient } from '@/lib/api-client';

// ✅ CORRECT - Use convenience method
const api = createAuthenticatedClient(token);
const { data: candidate } = await api.getCurrentCandidate();

// ❌ WRONG - Old pattern with limit query
const response = await api.get('/candidates', { params: { limit: 1 } });
```

## Current Usage Patterns

### Portal App - User Profile Context

The portal app's `UserProfileContext` already handles user roles correctly by calling `/users/me`:

```tsx
// apps/portal/src/contexts/user-profile-context.tsx
const response: any = await apiClient.get('/users/me');
const profileData = response?.data || null;

// Derived role checks
const isRecruiter = Boolean(profile?.recruiter_id);
const isCompanyUser = roles.some(role => role === 'company_admin' || role === 'hiring_manager');
```

**No changes needed** - The context already uses the `/users/me` endpoint and correctly identifies recruiters via `recruiter_id` field.

### Candidate App - Profile Page

The candidate app's profile page already uses the `/candidates/me` endpoint correctly:

```tsx
// apps/candidate/src/app/portal/profile/page.tsx (line 124)
const result = await client.get('/candidates/me', {
    params: { include: 'documents' }
});
```

**Optional enhancement** - Could migrate to use `getCurrentCandidate()` helper:

```tsx
// Before
const result = await client.get('/candidates/me', { params: { include: 'documents' } });

// After (with helper method)
const result = await client.getCurrentCandidate();
// Note: Would need to update helper to support include parameter
```

## Security Benefits

### Before (Potential Data Leakage)

```typescript
// ❌ WRONG - Could expose other users' data if not filtered properly
const { data: recruiters } = await api.get('/recruiters', { params: { limit: 1 } });
const recruiter = recruiters[0]; // Might get wrong recruiter if filtering fails!
```

### After (Secure)

```typescript
// ✅ CORRECT - Backend guarantees this is the current user's profile
const { data: recruiter } = await api.getCurrentRecruiter();
// Returns 404 if user doesn't have a recruiter profile
```

## Backend Endpoints Used

All convenience methods route through the API Gateway V2 endpoints:

| Frontend Method | Gateway Route | Backend Service | Backend Route |
|----------------|---------------|-----------------|---------------|
| `getCurrentRecruiter()` | `GET /api/v2/recruiters/me` | network-service | `GET /api/v2/recruiters/me` |
| `getCurrentSubscription()` | `GET /api/v2/subscriptions/me` | billing-service | `GET /v2/subscriptions/me` |
| `getCurrentCandidate()` | `GET /api/v2/candidates/me` | ats-service | `GET /v2/candidates/me` |

## Response Format

All `/me` endpoints follow the standard V2 response format:

```typescript
// Success (200)
{
    data: {
        id: "uuid",
        // ... resource fields
    }
}

// Not Found (404)
{
    error: {
        message: "Recruiter profile not found" // or "No active subscription found"
    }
}
```

## Error Handling

### 404 - Profile Not Found

```tsx
try {
    const { data: recruiter } = await api.getCurrentRecruiter();
    // User has a recruiter profile
} catch (error) {
    if (error.statusCode === 404) {
        // User doesn't have a recruiter profile yet
        console.log('No recruiter profile found');
    }
}
```

### 401 - Unauthorized

```tsx
try {
    const { data: subscription } = await api.getCurrentSubscription();
} catch (error) {
    if (error.statusCode === 401) {
        // User needs to sign in
        redirect('/sign-in');
    }
}
```

## Future Usage Opportunities

### Recruiter Dashboard

**Current**: Uses `/stats` endpoint for metrics (correct).  
**Future**: Could call `getCurrentRecruiter()` if we need recruiter profile fields like bio, status, etc.

```tsx
// Future enhancement
const { data: recruiter } = await api.getCurrentRecruiter();
if (recruiter.status !== 'active') {
    showInactiveAccountBanner();
}
```

### Billing Page

**Current**: Uses static placeholder data.  
**Future**: Call `getCurrentSubscription()` when Stripe integration is complete.

```tsx
// Future implementation
const { data: subscription } = await api.getCurrentSubscription();
if (subscription) {
    displayPlanDetails(subscription.plan_name, subscription.status);
} else {
    showUpgradeCTA();
}
```

### Profile Settings

**Future**: Use all three `/me` endpoints to display comprehensive profile.

```tsx
// Future implementation
const [user, recruiter, subscription] = await Promise.all([
    api.get('/users/me'),
    api.getCurrentRecruiter().catch(() => null), // Optional
    api.getCurrentSubscription().catch(() => null), // Optional
]);

displayUserProfile({
    email: user.data.email,
    name: user.data.name,
    recruiterStatus: recruiter?.data?.status,
    subscriptionTier: subscription?.data?.plan_name,
});
```

## Testing Checklist

- [x] Portal API client compiles successfully
- [x] Candidate API client compiles successfully
- [x] Removed legacy `getUserRoles()` method (unused, replaced by UserProfileContext)
- [ ] Test `getCurrentRecruiter()` with recruiter user
- [ ] Test `getCurrentRecruiter()` with non-recruiter user (should 404)
- [ ] Test `getCurrentSubscription()` with subscribed user
- [ ] Test `getCurrentSubscription()` with non-subscribed user (should 404)
- [ ] Test `getCurrentCandidate()` with candidate user
- [ ] Test `getCurrentCandidate()` with non-candidate user (should 404)
- [ ] Test error handling for 401 (unauthorized)
- [ ] Test error handling for 500 (server error)

## Documentation Updated

- ✅ Portal API client JSDoc comments added
- ✅ Candidate API client JSDoc comments added
- ✅ Implementation guide created (this document)
- ✅ Backend V2 endpoints documented in service copilot instructions
- ✅ AGENTS.md updated with `/me` endpoint guidelines

## Related Documentation

- [`AGENTS.md`](AGENTS.md) - V2 Architecture Guardrails section
- [`services/ats-service/.github/copilot-instructions.md`](services/ats-service/.github/copilot-instructions.md) - Candidates `/me` endpoint
- [`services/network-service/.github/copilot-instructions.md`](services/network-service/.github/copilot-instructions.md) - Recruiters `/me` endpoint
- [`services/billing-service/.github/copilot-instructions.md`](services/billing-service/.github/copilot-instructions.md) - Subscriptions `/me` endpoint

---

**Implementation Status**: ✅ COMPLETE  
**Next Steps**: Integration testing with real authentication tokens
