# API Role-Based Scoping Migration - Progress Report

**Date**: December 29, 2025  
**Status**: Foundation Complete, Ready for Testing  
**Approach**: Parallel implementation with `-new` suffix

---

## ✅ Completed (Phase 0: Foundation)

### Helper Functions Created

1. **API Gateway** - `services/api-gateway/src/helpers/auth-headers.ts`
   - `buildAuthHeaders()` - Extracts auth context from request and builds headers for backend calls
   - Handles Clerk user ID, role determination, and organization ID
   - Replaces inline `buildHeaders()` functions throughout gateway

2. **ATS Service** - `services/ats-service/src/helpers/auth-context.ts`
   - `getUserContext()` - Extracts user context from headers (optional)
   - `requireUserContext()` - Same but throws error if not authenticated
   - Clean interface for reading gateway-provided auth headers

3. **Network Service** - `services/network-service/src/helpers/auth-context.ts`
   - Same implementation as ATS service
   - Ready for network-related endpoints to use consistent pattern

4. **Billing Service** - `services/billing-service/src/helpers/auth-context.ts`
   - Same implementation as ATS service
   - Ready for billing-related endpoints to use consistent pattern

---

## ✅ Completed (Phase 1: Proposals Migration)

### Simplified Gateway Routes

**File**: `services/api-gateway/src/routes/proposals/routes-new.ts`

Key improvements:
- Uses `buildAuthHeaders()` helper instead of inline function
- Removed complex `determineUserRole()` logic from gateway
- Cleaner code - each endpoint is just 5-7 lines
- Uses `requireRoles()` middleware for RBAC enforcement
- All auth context passed via headers to backend

**Endpoints covered**:
- `GET /api/proposals` - List with filters
- `GET /api/proposals/actionable` - Actionable items
- `GET /api/proposals/pending` - Waiting on others
- `GET /api/proposals/summary` - Statistics
- `GET /api/proposals/:id` - Detail view
- `POST /api/proposals/:id/accept` - Accept action
- `POST /api/proposals/:id/decline` - Decline action

### Simplified ATS Service Routes

**File**: `services/ats-service/src/routes/proposals/routes-new.ts`

Key improvements:
- Uses `requireUserContext()` helper for all endpoints
- Consistent error handling
- Cleaner, more readable code
- Type-safe context extraction

**Note**: The existing proposal service already implements the migration pattern!
- `ProposalService.resolveEntityId()` already exists
- `ProposalService.getProposalsForUser()` already implements role-based scoping
- Service layer is already migration-ready

---

## 📋 Next Steps (Testing)

### Step 1.3: Test Proposals Migration

Before moving to applications, we should test the new proposal routes:

1. **Switch routes to use -new versions**:
   - In `services/api-gateway/src/routes.ts`: Import and use `registerProposalsRoutesNew`
   - In `services/ats-service/src/routes.ts`: Import and use `proposalRoutesNew`

2. **Test each role**:
   ```bash
   # As recruiter
   curl -H "Authorization: Bearer $RECRUITER_TOKEN" http://localhost:3001/api/proposals
   
   # As company admin
   curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/proposals
   
   # As hiring manager
   curl -H "Authorization: Bearer $HM_TOKEN" http://localhost:3001/api/proposals
   
   # As platform admin
   curl -H "Authorization: Bearer $PLATFORM_TOKEN" http://localhost:3001/api/proposals
   ```

3. **Verify data scoping**:
   - Recruiter sees only their proposals
   - Company admin sees company's proposals
   - Platform admin sees all proposals
   - No unauthorized data leakage

4. **Test filtering and pagination**:
   - `/api/proposals?state=actionable`
   - `/api/proposals?type=interview`
   - `/api/proposals?page=2&limit=10`
   - `/api/proposals?search=engineer`

---

## 🚀 Ready to Implement Next

### Applications (Step 2)

Use same pattern as proposals:
1. Create `services/api-gateway/src/routes/applications/routes-new.ts`
2. Create `services/ats-service/src/routes/applications/routes-new.ts`
3. Update `ApplicationService` to add role-based methods (similar to ProposalService)

### Jobs (Step 3)

**Special consideration**: Jobs must handle both public and authenticated access
- Unauthenticated: Active jobs only
- Authenticated: Role-based scoping (company sees their jobs, recruiters see marketplace)

### Candidates (Step 4)

Use same pattern as proposals and applications.

---

## 📝 Key Learnings

1. **Proposals were already 90% migrated** - The service layer and routes already implemented the pattern!
2. **Helper functions dramatically simplify code** - Compare old vs new routes, much cleaner
3. **Parallel implementation (-new files) is working well** - Easy to compare side-by-side
4. **Backend services already have entity resolution** - ProposalService.resolveEntityId() exists

---

## 🎯 Migration Benefits (So Far)

### Lines of Code Reduced

**API Gateway** (per endpoint):
- Old: ~15-20 lines (inline role determination, header building)
- New: ~7 lines (helper function calls)
- **Savings**: ~50% reduction

**ATS Service** (per endpoint):
- Old: ~10 lines (inline context extraction, error handling)
- New: ~5 lines (helper function)
- **Savings**: ~50% reduction

### Maintenance Improvements

- **Single source of truth** for auth header building
- **Consistent error handling** across all endpoints
- **Type safety** with UserContext interface
- **Easier to test** - helpers can be unit tested independently

### Future Benefits

- When we add new roles, only update helper functions
- When we add new auth context (e.g., team_id), only update helpers
- Easier onboarding for new developers (clear patterns)

---

## 📚 Files Created

1. `services/api-gateway/src/helpers/auth-headers.ts` (73 lines)
2. `services/ats-service/src/helpers/auth-context.ts` (52 lines)
3. `services/network-service/src/helpers/auth-context.ts` (52 lines)
4. `services/billing-service/src/helpers/auth-context.ts` (52 lines)
5. `services/api-gateway/src/routes/proposals/routes-new.ts` (175 lines)
6. `services/ats-service/src/routes/proposals/routes-new.ts` (140 lines)

**Total**: 544 lines of foundation + migration code

---

## 🔄 Next Session Plan

1. Test proposal routes-new with all roles
2. If tests pass, create applications-new routes
3. Continue through jobs, candidates, placements
4. Update frontend to remove role conditionals (Phase 2)
5. Clean up old files once migration complete

---

**Ready for testing!** 🚀
