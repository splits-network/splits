# Candidate Profile & Database Schema Alignment

**Date**: December 19, 2025  
**Issue**: Field discrepancies between candidate profile page and database table

---

## Current State Analysis

### Database Schema (`candidates`)

The database table has these fields:

```typescript
interface Candidate {
    id: string;
    email: string;
    full_name: string;                    // ✅ Single name field
    linkedin_url?: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    user_id?: string;
    recruiter_id?: string;
    verification_status: CandidateVerificationStatus;
    verification_metadata?: Record<string, any>;
    verified_at?: Date;
    verified_by_user_id?: string;
    created_at: Date;
    updated_at: Date;
}
```

### Profile Page Fields (Current - INCORRECT)

```typescript
{
    first_name: string;           // ❌ Should be full_name
    last_name: string;            // ❌ Should be removed
    email: string;                // ✅ Matches DB
    phone: string;                // ✅ Matches DB
    location: string;             // ✅ Matches DB
    linkedin_url: string;         // ✅ Matches DB
    github_url: string;           // ❌ Not in DB (should add?)
    portfolio_url: string;        // ❌ Not in DB (should add?)
    headline: string;             // ❌ Should map to current_title
    summary: string;              // ❌ Not in DB (should add as bio/summary?)
    skills: string;               // ❌ Not in DB (future enhancement)
}
```

---

## Issues Identified

1. **Name Fields**: Profile uses `first_name` + `last_name`, DB uses `full_name`
2. **Missing in Profile**: `current_title`, `current_company` (exist in DB but not shown)
3. **Mismatched Names**: `headline` should be `current_title`
4. **Extra Fields in Profile**: `github_url`, `portfolio_url`, `summary`, `skills` don't exist in DB
5. **No read/write API**: Profile has hardcoded data, no API integration

---

## Recommended Changes

### Phase 1: Align Existing Fields (Immediate)

**Profile Page Changes:**
- Replace `first_name` + `last_name` with single `full_name` field
- Rename `headline` to `current_title` to match DB
- Add `current_company` field
- Remove `github_url`, `portfolio_url`, `summary`, `skills` (or mark as "Coming Soon")
- Implement actual API read/write functionality

**Database**: No changes needed for Phase 1

### Phase 2: Enhanced Profile Fields (Future)

If we want to add the extra fields later, add to database:

```sql
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[];
```

---

## Implementation Plan

### Step 1: Update Profile Page Structure

**File**: `apps/candidate/src/app/portal/profile/page.tsx`

Changes:
1. Replace `first_name` + `last_name` with `full_name`
2. Remove or comment out unsupported fields
3. Add `current_title` and `current_company`
4. Keep it simple and aligned with DB

### Step 2: Add API Integration

**Files to create/update:**
- `apps/candidate/src/lib/api.ts` - Add profile fetch/update functions
- `services/api-gateway/src/routes/candidates/routes.ts` - Add `/api/candidates/me/profile` endpoints
- Backend already supports updates via `updateCandidate()` method

### Step 3: Test & Validate

- Verify fields save correctly to database
- Ensure proper error handling
- Test with real candidate account

---

## Final Profile Structure (Aligned with DB)

```typescript
interface CandidateProfileForm {
    full_name: string;              // Matches DB
    email: string;                  // Matches DB (read-only, from Clerk)
    phone?: string;                 // Matches DB
    location?: string;              // Matches DB
    current_title?: string;         // Matches DB
    current_company?: string;       // Matches DB
    linkedin_url?: string;          // Matches DB
}
```

**Fields NOT in current DB** (future consideration):
- `github_url` - Professional link
- `portfolio_url` - Professional link  
- `bio/summary` - Professional summary
- `skills` - Skill tags array

---

## Next Steps

1. ✅ Create this analysis document
2. ⬜ Update profile page form structure
3. ⬜ Implement API client methods
4. ⬜ Add API Gateway endpoints for `/api/candidates/me/profile`
5. ⬜ Test end-to-end profile update flow
6. ⬜ Consider Phase 2 enhancements (github_url, portfolio_url, bio, skills)

---

## API Endpoints Needed

### GET `/api/candidates/me/profile`
**Auth**: Candidate only  
**Returns**: Current candidate profile data

### PATCH `/api/candidates/me/profile`
**Auth**: Candidate only  
**Body**: Profile fields to update  
**Returns**: Updated candidate profile

**Note**: These should leverage existing ATS service `updateCandidate()` method
