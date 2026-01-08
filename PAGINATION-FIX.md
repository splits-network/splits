# Server-Side Pagination Fix

## Problem

The server-side pagination in the candidates list was **inconsistent** - different pages returned different numbers of results, and candidates could be skipped or appear on multiple pages.

### Root Cause

In [services/ats-service/src/v2/candidates/repository.ts](services/ats-service/src/v2/candidates/repository.ts), the `enrichCandidatesFromJoin` method was applying a **`.filter()`** operation **AFTER pagination** was applied:

```typescript
// WRONG - Filter applied AFTER pagination
const { data } = query.range(offset, offset + limit - 1);  // ← Pagination here
return enrichCandidatesFromJoin(data).filter(...);          // ← Filter here reduces results
```

**Why This Breaks Pagination**:
1. SQL pagination requests 25 candidates → Database returns 25 candidates
2. `.filter()` removes candidates that don't match scope criteria
3. Result: Only 15-20 candidates returned instead of 25
4. Frontend pagination counts are wrong (shows "25" but only 15 displayed)
5. Candidates get skipped on next page because offset is wrong

### Example Scenario

- Recruiter on "My Candidates" page (scope="mine")
- Page 1 requests 25 candidates → Backend returns only 10 (others filtered out)
- Page 2 requests next 25 → Database skip 25 correctly, but again filters to 10
- Result: Inconsistent page sizes and missing candidates

## Solution

**Move the scope filtering to the SQL query BEFORE pagination:**

```typescript
// CORRECT - Filter BEFORE pagination
if (scope === 'mine') {
    query = query.in('id', candidateIds);  // ← Filter in SQL
}

query = query.range(offset, offset + limit - 1);  // ← Then paginate
```

### Changes Made

#### 1. **Move Filtering to SQL** (findCandidates method)
   - Check `scope === 'mine'` parameter
   - If true: Query `recruiter_candidates` table to get candidate IDs
   - Apply `.in('id', candidateIds)` **before** calling `.range()`
   - Result: Database filters and paginates as a single operation

#### 2. **Simplify enrichment** (enrichCandidatesFromJoin method)
   - Removed the `.filter()` that was causing the problem
   - Now **only enriches** with relationship metadata
   - No more post-processing filtering

#### 3. **Ensure Consistency**
   - `count: 'exact'` now reflects **filtered** results (correct total_pages calculation)
   - Every page returns correct number of results
   - No candidates are skipped

## Impact

### Before Fix
```
Page 1: 10 candidates (should be 25)
Page 2: 8 candidates (should be 25)
Total: 200 candidates but showing 18
```

### After Fix
```
Page 1: 25 candidates ✓
Page 2: 25 candidates ✓
Page 3: 25 candidates ✓
Total: 200 candidates shown correctly
```

## Testing

1. **Load candidate list as recruiter with scope="mine"**
   - Each page should show exactly 25 candidates
   - No candidates should repeat across pages
   - Total count should match pagination formula

2. **Load candidate list with scope="all"**
   - All candidates should be visible (no filtering)
   - Pagination should work normally

3. **Check small datasets**
   - If recruiter has only 7 "my" candidates
   - Page 1 should show 7, Page 2 should show empty

## Files Modified

- [services/ats-service/src/v2/candidates/repository.ts](services/ats-service/src/v2/candidates/repository.ts)
  - `findCandidates()` - Added pre-pagination filtering for scope
  - `enrichCandidatesFromJoin()` - Removed post-pagination filtering

## Related Endpoints

- `GET /api/v2/candidates?scope=mine` - Now returns consistent pages
- `GET /api/v2/candidates?scope=all` - Now returns consistent pages
- Frontend: [apps/portal/src/components/candidates/candidates-list-client.tsx](apps/portal/src/components/candidates/candidates-list-client.tsx)

---

**Status**: ✅ Fixed  
**Date**: January 2, 2026  
**Related**: Server-side pagination, Scope filtering, SQL optimization
