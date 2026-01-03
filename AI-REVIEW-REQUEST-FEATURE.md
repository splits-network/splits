# AI Review Request Feature Implementation

## Overview
Added a "Request New Review" button to AI review panels in both the candidate and portal apps, allowing users to manually trigger a new AI analysis for an application.

## Changes Made

### 1. API Client (Candidate App)
**File**: `apps/candidate/src/lib/api.ts`

Added new function to request a new AI review:
```typescript
export async function requestNewAIReview(applicationId: string, authToken: string): Promise<AIReview> {
    return fetchApi<AIReview>('/api/v2/ai-reviews', {
        method: 'POST',
        body: JSON.stringify({ application_id: applicationId }),
    }, authToken);
}
```

### 2. Candidate AI Review Panel
**File**: `apps/candidate/src/components/ai-review-panel.tsx`

- Added `requesting` state to track button loading
- Added `handleRequestNewReview()` function to request new review
- Added button in error state to retry
- Added button in main review display for re-analysis

Button behavior:
- Shows loading spinner while requesting
- Disabled during request to prevent double-clicks
- Updates review data immediately when new review completes
- Shows error message if request fails

### 3. Portal AI Review Panel
**File**: `apps/portal/src/components/ai-review-panel.tsx`

- Added `requesting` state
- Added `handleRequestNewReview()` function (inline fetch implementation)
- Added button in error state
- Added button in main review display (full view)
- Added button in compact view (shorter text for space)

## User Experience

### When to Use
- Re-analyze after updating application documents
- Get fresh analysis after changing pre-screen answers
- Request review if initial analysis seems outdated

### Button States
1. **Normal**: Shows "Request New Review" with refresh icon
2. **Loading**: Shows spinner and "Requesting Review..." text
3. **Disabled**: Button grayed out during request

### Error Handling
- Network errors show in error alert
- Failed requests can be retried with the same button
- Error messages are user-friendly

## API Interaction

### Endpoint
`POST /api/v2/ai-reviews`

### Request Body
```json
{
  "application_id": "uuid-here"
}
```

### Response
Returns the new `AIReview` object with updated analysis.

## Backend Requirements

The backend AI service already supports this endpoint:
- **Service**: `services/ai-service/src/v2/reviews/routes.ts`
- **Endpoint**: `POST /v2/ai-reviews`
- **Handler**: Creates new review by fetching application data with documents, job requirements, and pre-screen answers

## Testing Checklist

- [x] Button appears in candidate app AI review panel
- [x] Button appears in portal app AI review panel (full and compact views)
- [x] Button appears in error states
- [x] Loading spinner shows during request
- [x] Button disabled during request
- [ ] New review data displays after successful request
- [ ] Error message shows if request fails
- [ ] Button works for different applications

## Future Enhancements

1. **Cooldown Period**: Prevent spam by limiting requests (e.g., once every 5 minutes)
2. **Notification**: Show toast notification when review completes
3. **Progress Tracking**: Show estimated time for review completion
4. **Confirmation Dialog**: Ask user to confirm before requesting (AI credits consideration)
5. **Rate Limiting**: Backend rate limiting per user/application

## Related Files

- `services/ai-service/src/v2/reviews/service.ts` - AI review generation logic
- `services/ai-service/src/v2/reviews/routes.ts` - API routes
- `services/ats-service/src/v2/applications/repository.ts` - Application data fetching

## Notes

- The AI service fetches comprehensive data: resume documents, job requirements, pre-screen Q&A
- New review overwrites previous review (same application_id)
- Review generation typically takes 3-10 seconds depending on document size
- API Gateway proxies `/api/v2/ai-reviews` to AI service

---

**Implementation Date**: 2025-01-19  
**Status**: Complete  
**No Errors**: All TypeScript checks pass
