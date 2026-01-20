# Gate Filter Backend Implementation

**Date:** January 8, 2026  
**Status:** ✅ COMPLETE  
**Purpose:** Add backend support for gate_status filter parameter in applications API

---

## Summary

Implemented full backend support for `gate_status` filter in the applications list endpoint. The frontend can now filter applications by gate status (needs_my_review, candidate_recruiter, company_recruiter, company, approved).

---

## Changes Made

### 1. ATS Service - Application Repository

**File:** `services/ats-service/src/v2/applications/repository.ts`

**Changes:**
1. Added gate_status filter handling in `findApplications()` method (lines 134-156)
2. Created `filterByGateStatus()` helper method (lines 399-488)

**Gate Filter Logic:**
- Uses `candidate_role_assignments.application_id` for direct relationship
- **approved**: Applications with no active CRA or CRA in terminal approved state
- **needs_my_review**: Applications at gates where current user has authority
  - Recruiters: Matches `candidate_recruiter_id` or `company_recruiter_id` with user's recruiterId
  - Company users: Matches `current_gate = 'company'` for their organization's jobs
- **candidate_recruiter**: All applications at candidate_recruiter gate
- **company_recruiter**: All applications at company_recruiter gate
- **company**: All applications at company gate

**Access Control:**
- Uses `resolveAccessContext()` from shared-access-context
- Filters based on user role (recruiter, company user, platform admin)
- Only returns applications user has access to

---

## API Usage

### Request Example
```bash
GET /api/v2/applications?gate_status=needs_my_review&page=1&limit=25
```

### Valid gate_status Values
- `needs_my_review` - Applications at gates where current user can act
- `candidate_recruiter` - Applications waiting on candidate recruiter
- `company_recruiter` - Applications waiting on company recruiter
- `company` - Applications waiting on company decision
- `approved` - Applications with no active gates (approved or no CRA)

### Response Format
```json
{
  "data": [
    {
      "id": "uuid",
      "candidate_id": "uuid",
      "job_id": "uuid",
      "stage": "screen",
      "created_at": "2026-01-08T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 42,
    "total_pages": 2
  }
}
```

---

## Database Schema Used

### candidate_role_assignments
- `application_id` (UUID, NOT NULL) - Direct 1-to-1 relationship with applications
- `candidate_recruiter_id` (UUID, nullable) - Recruiter representing candidate
- `company_recruiter_id` (UUID, nullable) - Recruiter representing company
- `current_gate` (TEXT) - Current gate status
- `state` (TEXT) - Overall CRA state (approved, rejected, declined, etc.)

### Applications Table
- Standard fields (id, candidate_id, job_id, stage, etc.)
- No direct CRA relationship - query via `candidate_role_assignments.application_id`

---

## Frontend Integration

**Location:** `apps/portal/src/app/portal/applications/`

**Components Updated:**
1. `components/applications-list.tsx` - Added gate_status to filters
2. `components/application-filters.tsx` - Added gate status dropdown UI

**Filter Flow:**
```
User selects gate filter → 
Frontend updates URL (?gate_status=needs_my_review) → 
API client sends to /api/v2/applications?gate_status=... → 
API Gateway proxies to ATS service → 
Repository filters by CRA current_gate → 
Returns filtered applications
```

---

## Testing

### Manual Testing Steps

1. **needs_my_review Filter (Recruiter)**
   ```bash
   # As recruiter with applications at their gate
   GET /api/v2/applications?gate_status=needs_my_review
   # Should return only applications where:
   # - current_gate = 'candidate_recruiter' AND candidate_recruiter_id = user's recruiter ID
   # - OR current_gate = 'company_recruiter' AND company_recruiter_id = user's recruiter ID
   ```

2. **needs_my_review Filter (Company User)**
   ```bash
   # As company admin/hiring manager
   GET /api/v2/applications?gate_status=needs_my_review
   # Should return only applications where:
   # - current_gate = 'company' AND job belongs to user's organization
   ```

3. **Specific Gate Filters**
   ```bash
   # Filter by candidate_recruiter gate
   GET /api/v2/applications?gate_status=candidate_recruiter
   
   # Filter by company_recruiter gate
   GET /api/v2/applications?gate_status=company_recruiter
   
   # Filter by company gate
   GET /api/v2/applications?gate_status=company
   ```

4. **Approved Applications**
   ```bash
   # Get applications with no active gates
   GET /api/v2/applications?gate_status=approved
   # Should return applications where:
   # - No CRA exists (application_id not in CRAs)
   # - OR CRA state = 'approved'
   ```

5. **Combined Filters**
   ```bash
   # Combine with other filters
   GET /api/v2/applications?gate_status=needs_my_review&stage=screen&job_id=<uuid>
   ```

### Expected Behavior

✅ **Access Control:**
- Recruiters only see applications at gates where they have authority
- Company users only see applications for their organization's jobs
- Platform admins see all applications (no filtering)

✅ **Empty Results:**
- If no applications match gate criteria, returns `{ data: [], pagination: {...} }`
- Does not error out - empty result is valid

✅ **Performance:**
- Uses indexes on `candidate_role_assignments.application_id`
- Efficient IN query instead of N+1 lookups

---

## Implementation Notes

### Why application_id Instead of candidate_id + job_id?

Migration 030 added `application_id` to CRA table for 1-to-1 relationship. This:
1. **Supports reapplications**: Candidate can apply to same job multiple times
2. **Simplifies queries**: Direct foreign key instead of composite key matching
3. **Improves performance**: Single UUID IN query instead of (candidate_id, job_id) pairs

### Fallback Strategy for 'approved' Filter

The 'approved' filter tries two approaches:
1. **Primary**: Use Supabase OR query with foreignTable join
2. **Fallback**: If Supabase query fails, fetch all apps and filter client-side

This ensures robustness even if Supabase syntax changes.

### Why Filter Application IDs First?

The `filterByGateStatus()` method returns an array of application IDs, then the main query uses `query.in('id', gateApplicationIds)`. This:
1. Keeps gate logic isolated in one method
2. Works with existing access control filters
3. Allows early exit if no matching applications

---

## Related Documents

- **Frontend Implementation**: `apps/portal/GATE-FILTER-FRONTEND-IMPLEMENTATION.md`
- **Testing Guide**: `TESTING-GUIDE-END-TO-END.md` (Phase 4)
- **CRA Schema**: `docs/guidance/cra-schema-specifications.md`
- **Architecture**: `AGENTS.md` (CRA section)

---

## Migration Impact

✅ **No Database Changes Required**
- Uses existing `candidate_role_assignments` table
- Relies on migration 030 (application_id column)
- All necessary indexes already exist

✅ **Backward Compatible**
- Existing API calls without gate_status filter work unchanged
- No breaking changes to response format
- Filter is optional (ignored if not provided)

---

## Future Enhancements

### Possible Improvements
1. **Count Endpoint**: Add `/api/v2/applications/count?gate_status=needs_my_review`
2. **Badge Indicators**: Return count of applications at each gate
3. **Real-time Updates**: WebSocket notifications when applications move to user's gate
4. **Bulk Actions**: Move multiple applications through gates at once

### Performance Optimizations
1. **Materialized Views**: Create view of application+CRA joins for faster queries
2. **Redis Caching**: Cache gate counts per user (invalidate on CRA updates)
3. **Database Indexes**: Add composite index on (current_gate, candidate_recruiter_id, company_recruiter_id)

---

**Last Updated:** January 8, 2026  
**Implementation Status:** ✅ COMPLETE - Ready for Testing
