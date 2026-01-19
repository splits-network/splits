# Legacy Pattern Cleanup - /me Endpoints Migration

**Date**: January 19, 2026  
**Status**: ✅ COMPLETE - All legacy patterns removed or validated

## Overview

Completed comprehensive audit and cleanup of legacy data access patterns in the frontend applications. All instances of `?limit=1` queries and inefficient filtering have been eliminated or validated.

## What Was Cleaned Up

### Portal App API Client

**Removed:**
- ❌ `getUserRoles()` method - Used legacy `get('/users', { params: { limit: 1 } })` pattern

**Why Removed:**
- Method was **not being used** anywhere in the codebase
- Functionality already provided by `UserProfileContext` which correctly uses `/users/me`
- Used insecure pattern that could potentially leak data if backend filtering failed

**Before:**
```typescript
async getUserRoles(): Promise<{
    isRecruiter: boolean;
    isCompanyAdmin: boolean;
    isHiringManager: boolean;
    isPlatformAdmin: boolean;
}> {
    // ❌ Legacy pattern - risky and inefficient
    const response: any = await this.get('/users', { params: { limit: 1 } });
    const payload = response?.data ?? response;
    const user = Array.isArray(payload) ? payload[0] : payload;
    // ... role extraction logic
}
```

**After:**
```typescript
// Method completely removed - use UserProfileContext instead
```

**Replacement Pattern:**
```typescript
// In any component
import { useUserProfile } from '@/contexts';

function MyComponent() {
    const { isRecruiter, isCompanyAdmin, isHiringManager, isAdmin } = useUserProfile();
    // ✅ Secure, cached, and efficient
}
```

## Validation Results

### No Legacy Patterns Found

Comprehensive searches across the codebase found **zero instances** of legacy patterns:

| Pattern | Portal App | Candidate App | Result |
|---------|-----------|---------------|---------|
| `limit: 1` | ❌ Not found | ❌ Not found | ✅ Clean |
| `limit=1` | ❌ Not found | ❌ Not found | ✅ Clean |
| `/candidates?` queries | ❌ Not found | ❌ Not found | ✅ Clean |
| `/recruiters?` queries | ❌ Not found | ❌ Not found | ✅ Clean |
| `/subscriptions?` queries | ❌ Not found | ❌ Not found | ✅ Clean |
| `.getUserRoles()` calls | ❌ Not found | N/A | ✅ Clean |

### Validated Correct Patterns

All current data access patterns use the secure `/me` endpoints:

**Portal App - UserProfileContext:**
```typescript
// ✅ CORRECT - Uses /users/me endpoint
const response: any = await apiClient.get('/users/me');
const profileData = response?.data || null;

// Derived checks from profile data
const isRecruiter = Boolean(profile?.recruiter_id);
const isCompanyUser = roles.some(role => role === 'company_admin' || role === 'hiring_manager');
```

**Candidate App - Profile Page:**
```typescript
// ✅ CORRECT - Uses /candidates/me endpoint
const result = await client.get('/candidates/me', {
    params: { include: 'documents' }
});
```

**Portal App - Dashboard:**
```typescript
// ✅ CORRECT - Uses V2 stats endpoint (not user profile)
const statsResponse: any = await api.get('/stats', {
    params: {
        scope: 'recruiter',
        range: 'ytd',
    }
});
```

## Backend Service Patterns

Service-side queries using `limit` were validated as legitimate pagination logic:

**Valid Pagination Patterns (Not Legacy):**
```typescript
// ✅ CORRECT - Legitimate pagination in repository
const safeLimit = Math.max(1, Math.min(limit, 25));
query = query.range(offset, offset + limit - 1);
```

These patterns are **not legacy** - they're proper pagination implementations for list endpoints.

## Security Improvements

### Before Cleanup

**Potential Issues:**
- `getUserRoles()` method used `?limit=1` which could return wrong user if backend filtering failed
- Unused code increased attack surface
- Inconsistent patterns across codebase

### After Cleanup

**Security Benefits:**
- All user-specific queries use `/me` endpoints (backend-guaranteed security)
- No unused code that could be accidentally called
- Consistent patterns make security audits easier
- Zero reliance on client-side filtering for security

## Code Quality Improvements

### Removed Technical Debt

**Eliminated:**
- 1 unused method (getUserRoles)
- ~25 lines of dead code
- 1 legacy pattern reference

**Benefits:**
- Smaller bundle size (minor, but measurable)
- Clearer API surface (no confusing duplicate functionality)
- Easier maintenance (one less method to document/test)
- Better developer experience (obvious which method to use)

### Improved Patterns

**Before:**
```typescript
// Multiple ways to get role information
const roles1 = await apiClient.getUserRoles();        // ❌ Unused legacy method
const roles2 = useUserProfile();                      // ✅ Correct pattern
```

**After:**
```typescript
// Single, obvious way to get role information
const roles = useUserProfile();                       // ✅ Only pattern
```

## Build Verification

All apps compile successfully with no TypeScript errors:

```bash
✓ Portal app: pnpm build
  - 65 routes built successfully
  - 0 TypeScript errors
  - 0 warnings (except daisyUI CSS)

✓ Candidate app: pnpm build  
  - 45 routes built successfully
  - 0 TypeScript errors
  - 0 warnings (except daisyUI CSS)
```

## Migration Impact

### Breaking Changes

**None** - The removed method was not being used anywhere in the codebase.

### Required Code Changes

**Zero** - No application code needed updates because:
1. `getUserRoles()` was never called
2. All existing code already uses `UserProfileContext`
3. All data access already uses `/me` endpoints

## Documentation Updates

Updated files to reflect cleanup:

- ✅ [FRONTEND-ME-ENDPOINTS-IMPLEMENTATION.md](FRONTEND-ME-ENDPOINTS-IMPLEMENTATION.md) - Added cleanup notes
- ✅ [LEGACY-PATTERN-CLEANUP.md](LEGACY-PATTERN-CLEANUP.md) - This document
- ✅ [apps/portal/src/lib/api-client.ts](apps/portal/src/lib/api-client.ts) - Removed getUserRoles method

## Recommendations for Future Development

### Do's ✅

1. **Use /me endpoints for user-specific singletons**
   ```typescript
   const { data: recruiter } = await api.getCurrentRecruiter();
   ```

2. **Use UserProfileContext for role checks**
   ```typescript
   const { isRecruiter, isAdmin } = useUserProfile();
   ```

3. **Use convenience methods from API clients**
   ```typescript
   getCurrentRecruiter(), getCurrentSubscription(), getCurrentCandidate()
   ```

### Don'ts ❌

1. **Never use ?limit=1 for user-specific data**
   ```typescript
   // ❌ WRONG - Security risk
   const users = await api.get('/users', { params: { limit: 1 } });
   ```

2. **Never create duplicate functionality**
   ```typescript
   // ❌ WRONG - getUserRoles() duplicates UserProfileContext
   ```

3. **Never rely on client-side filtering for security**
   ```typescript
   // ❌ WRONG - Backend must enforce access control
   const myData = allData.filter(item => item.userId === currentUser.id);
   ```

## Audit Methodology

### Search Patterns Used

1. **Direct limit queries:**
   - `limit: 1` (JavaScript/TypeScript syntax)
   - `limit=1` (URL query string)

2. **Resource queries:**
   - `/candidates?` (query with parameters)
   - `/recruiters?` (query with parameters)
   - `/subscriptions?` (query with parameters)

3. **Method usage:**
   - `.getUserRoles()` (method calls)
   - `getUserRoles` (method references)

4. **Generic patterns:**
   - `get('/users'` (direct users endpoint calls)

### Files Searched

- `apps/portal/src/**/*.{ts,tsx}` - All Portal TypeScript/React files
- `apps/candidate/src/**/*.{ts,tsx}` - All Candidate TypeScript/React files
- `services/**/*.{ts,tsx}` - All service TypeScript files (validation only)

### Exclusions

Backend service files were **validated** but not modified because:
- `limit` in repositories is legitimate pagination logic
- Backend enforces security via access context
- No legacy patterns found in backend code

## Conclusion

All legacy patterns have been successfully identified and removed from the frontend applications. The codebase now exclusively uses secure `/me` endpoints for user-specific data access, eliminating potential security vulnerabilities and improving code consistency.

**Final Status:**
- ✅ Zero legacy patterns remaining
- ✅ All apps build successfully
- ✅ No breaking changes
- ✅ Improved security posture
- ✅ Better developer experience

---

**Cleanup Status**: ✅ COMPLETE  
**Next Steps**: Integration testing with real authentication tokens
