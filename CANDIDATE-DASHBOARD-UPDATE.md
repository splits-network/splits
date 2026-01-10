# Candidate Dashboard Update

**Date**: January 8, 2026  
**Status**: ✅ Complete

## Summary

Updated the candidate app dashboard to use proper V2 API patterns with improved type safety, error handling, and consistent routing.

## Changes Made

### 1. Type Safety Improvements

Added proper TypeScript interfaces for API responses:

```typescript
import type { ApiResponse } from '@splits-network/shared-api-client';

interface Application {
    id: string;
    stage: string;
    created_at: string;
    job?: {
        title?: string;
        company_name?: string;
    };
}

interface RecruiterRelationship {
    id: string;
    status: string;
}
```

### 2. API Response Handling

Updated API calls to properly unwrap V2 response envelope:

**Before:**
```typescript
const applicationsResponse = await client.get('/applications');
const allApplications = applicationsResponse.data || [];
```

**After:**
```typescript
const applicationsResponse = await client.get<ApiResponse<Application[]>>(
    '/applications',
    { params: { include: 'job' } }
);
const allApplications = applicationsResponse.data || [];
```

**Key improvements:**
- Added type parameter `ApiResponse<Application[]>` for compile-time type checking
- Added `include: 'job'` parameter to fetch related job data in single query (eliminates N+1 queries)
- Removed `any` type usage in favor of proper interfaces

### 3. Error Handling

Added user-visible error feedback:

```typescript
let loadError: string | null = null;

try {
    // ... data fetching
} catch (error) {
    console.error('Failed to load dashboard data:', error);
    loadError = error instanceof Error ? error.message : 'Failed to load dashboard data';
}

// In JSX:
{loadError && (
    <div className="alert alert-error mb-6">
        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
        <div>
            <h3 className="font-bold">Failed to load dashboard data</h3>
            <div className="text-sm">{loadError}</div>
        </div>
    </div>
)}
```

### 4. Routing Consistency

Fixed inconsistent application route paths:

**Before:**
- Quick Actions button: `/portal/application`
- Recent Applications "View All" link: `/portal/application`

**After:**
- Quick Actions button: `/portal/applications` ✅
- Recent Applications "View All" link: `/portal/applications` ✅

This aligns with the actual applications page location.

## V2 API Compliance

### Automatic Path Prefixing

The `SplitsApiClient` automatically prepends `/api/v2` to all endpoint calls:

```typescript
// In code: client.get('/applications')
// Actual HTTP request: GET /api/v2/applications
```

This is handled in `packages/shared-api-client/src/index.ts`:
```typescript
private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v2${endpoint}`;
    // ...
}
```

### Response Envelope

All V2 endpoints return responses in this format:
```typescript
{
    data: T,
    pagination?: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }
}
```

The dashboard now properly types and unwraps this structure.

### Include Parameters

The dashboard leverages V2's `include` parameter to fetch related data efficiently:

```typescript
client.get('/applications', { params: { include: 'job' } })
```

This returns applications with job data embedded, avoiding additional API calls.

## Service Boundaries Respected

The dashboard properly respects service boundaries:

1. **Applications data** → ATS Service via `/api/v2/applications`
2. **Recruiter relationships** → Network Service via `/api/v2/recruiter-candidates`
3. **User profile** → Identity Service (future: if dashboard needs user details beyond Clerk data)

Each service owns its domain and the dashboard accesses data through the proper V2 endpoints.

## Files Modified

- `apps/candidate/src/app/portal/dashboard/page.tsx`

## Testing Checklist

- [x] Type safety verified (no `any` types used)
- [x] API response unwrapping correct
- [x] Error handling displays to user
- [x] Routing paths consistent
- [x] V2 API patterns followed
- [x] Include parameters used for performance
- [ ] **TODO**: Test in browser to verify data loads correctly
- [ ] **TODO**: Test error scenarios display properly

## Related Architecture

This dashboard update follows the patterns established in:

- Service boundary separation (Identity vs ATS vs Network services)
- V2 API standardization (5-route pattern, response envelopes)
- Progressive loading pattern (though dashboard uses server-side rendering)
- Type safety throughout the stack

See also:
- `docs/guidance/user-identification-standard.md`
- `AGENTS.md` - V2 Architecture Guardrails
- Service-specific Copilot instructions

---

**Next Steps:**

1. Test dashboard in browser with real data
2. Add loading states if needed (currently server-rendered)
3. Consider client-side error boundaries for better UX
4. Potentially add profile completion percentage calculation from real user/candidate data
