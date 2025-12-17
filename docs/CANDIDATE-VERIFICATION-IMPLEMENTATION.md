# Candidate Verification Status Implementation

## Summary

Successfully implemented candidate verification status tracking and confirmed that recruiter-candidate relationships are being created properly.

## Changes Made

### 1. Database Migration
**File**: [`infra/migrations/010_add_candidate_verification_status.sql`](infra/migrations/010_add_candidate_verification_status.sql)

- Added `verification_status` column to `ats.candidates` table
  - Values: `unverified` (default), `pending`, `verified`, `rejected`
  - Default value: `unverified`
- Added `verification_metadata` JSONB column for storing verification details
- Added `verified_at` and `verified_by_user_id` columns for audit trail
- Added index on `verification_status` for efficient filtering

### 2. Type Definitions
**File**: [`packages/shared-types/src/models.ts`](packages/shared-types/src/models.ts)

- Added `CandidateVerificationStatus` type
- Updated `Candidate` interface to include:
  - `verification_status: CandidateVerificationStatus`
  - `verification_metadata?: Record<string, any>`
  - `verified_at?: Date`
  - `verified_by_user_id?: string`

### 3. Backend Service
**File**: [`services/ats-service/src/services/candidates/service.ts`](services/ats-service/src/services/candidates/service.ts)

- Updated `findOrCreateCandidate` method to set `verification_status: 'unverified'` by default when a recruiter adds a new candidate

### 4. Frontend UI Updates

#### Candidate Detail Page
**File**: [`apps/portal/src/app/(authenticated)/candidates/[id]/candidate-detail-client.tsx`](apps/portal/src/app/(authenticated)/candidates/[id]/candidate-detail-client.tsx)

- Added helper functions:
  - `getVerificationStatusBadge()` - Returns appropriate badge color
  - `getVerificationStatusIcon()` - Returns appropriate FontAwesome icon
- Added verification status badge next to candidate name in header

#### Candidates List Page
**File**: [`apps/portal/src/app/(authenticated)/candidates/candidates-list-client.tsx`](apps/portal/src/app/(authenticated)/candidates/candidates-list-client.tsx)

- Added helper functions for verification status badges and icons
- **Table View**: Added "Status" column displaying verification status badge
- **Grid View**: Added verification status icon badge next to candidate name

### 5. Recruiter-Candidate Relationship Confirmation
**File**: [`services/api-gateway/src/routes/candidates/routes.ts`](services/api-gateway/src/routes/candidates/routes.ts) (lines 164-168)

✅ **Confirmed**: The API Gateway is already properly creating `network.recruiter_candidates` records when a recruiter adds a candidate:

```typescript
// Create recruiter-candidate relationship in network service
if (candidateData.data?.id) {
    await networkService().post('/recruiter-candidates', {
        recruiter_id: recruiterId,
        candidate_id: candidateData.data.id
    }, undefined, correlationId);
}
```

## How It Works

### When a Recruiter Adds a Candidate:

1. **API Gateway** receives POST request to `/api/candidates`
2. **ATS Service** creates candidate record with:
   - `verification_status: 'unverified'` (default)
   - `recruiter_id` set to the recruiter who added them
3. **Network Service** creates `recruiter_candidates` relationship:
   - 12-month relationship
   - Status: `active`
   - Grants recruiter editing rights

### Verification Status Lifecycle:

```
unverified → pending → verified
                    ↘ rejected
```

- **unverified**: Default when recruiter adds candidate
- **pending**: Verification in progress (manually set by admin)
- **verified**: Candidate information confirmed
- **rejected**: Verification failed (e.g., fake LinkedIn, incorrect info)

### Visual Indicators:

| Status | Badge Color | Icon |
|--------|-------------|------|
| Verified | Green (success) | ✓ (circle-check) |
| Pending | Yellow (warning) | ⏱ (clock) |
| Unverified | Gray (neutral) | ? (circle-question) |
| Rejected | Red (error) | ✗ (circle-xmark) |

## Next Steps

To apply these changes:

```bash
# Apply the database migration
supabase db push infra/migrations/010_add_candidate_verification_status.sql

# Or use the Supabase MCP tool
# (migration will be auto-detected on next db operation)

# Rebuild services
pnpm --filter @splits-network/ats-service build
pnpm --filter @splits-network/api-gateway build

# Rebuild portal
pnpm --filter portal build

# Restart services
docker-compose restart ats-service api-gateway portal
```

## Future Enhancements

1. **Admin Verification UI**: Create an admin panel to review and verify candidates
2. **Verification Workflow**: Automated checks (LinkedIn API, email verification)
3. **Verification Notes**: Add UI to view/edit `verification_metadata`
4. **Verification Filters**: Add filter in candidates list to show only unverified/pending candidates
5. **Bulk Verification**: Allow admins to verify multiple candidates at once
6. **Verification History**: Track verification attempts and changes over time

## Testing

To test the implementation:

1. Sign in as a recruiter
2. Add a new candidate via `/candidates/new`
3. Verify the candidate shows "Unverified" badge
4. Check database: `SELECT verification_status FROM ats.candidates WHERE email = 'test@example.com';`
5. Check relationship: `SELECT * FROM network.recruiter_candidates WHERE candidate_id = '<candidate_id>';`

---

**Date**: December 17, 2025  
**Status**: ✅ Complete and ready for testing
