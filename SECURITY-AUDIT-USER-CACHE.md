# Security Audit Report: User Data Caching Vulnerabilities

**Date**: 2026-02-02
**Auditor**: Security Review
**Severity**: 🔴 **CRITICAL**
**Affected Components**: Identity Service, Portal App

---

## Executive Summary

Critical security vulnerabilities have been identified in the user data caching and authorization system that could allow:
1. **Unauthorized access to user PII** (names, emails)
2. **Cross-user data leakage** on shared devices
3. **Indefinite caching of sensitive data** without invalidation

**Immediate Action Required**: Backend authorization must be implemented before this reaches production.

---

## Vulnerability 1: Missing Authorization on User Lookup Endpoint

### Severity: 🔴 CRITICAL

### Description
The `GET /api/v2/users/:id` endpoint returns user data without verifying the requesting user has permission to view it.

### Location
- **File**: `services/identity-service/src/v2/users/service.ts`
- **Method**: `findUserById(clerkUserId: string, id: string)`
- **Lines**: 115-122

### Code Analysis
```typescript
async findUserById(clerkUserId: string, id: string) {
    this.logger.info({ id }, 'UserService.findUserById');
    const user = await this.repository.findUserById(id);
    if (!user) {
        throw new Error(`User not found: ${id}`);
    }
    return user;  // ⚠️ PROBLEM: clerkUserId is NEVER checked!
}
```

**The `clerkUserId` parameter is accepted but never used for authorization checks.**

### Exploitation Scenario
```
1. User A authenticates and gets a valid JWT token
2. User A calls GET /api/v2/users/123 (arbitrary user ID)
3. API returns full user record without checking if User A should see it
4. User A can enumerate all users in the system by incrementing IDs
```

### Impact
- ✅ Authentication required (endpoint requires valid JWT)
- ❌ **No authorization** - any authenticated user can access any other user's data
- 📧 **PII exposure**: email addresses
- 👤 **Identity disclosure**: names, roles, organization memberships
- 🔍 **User enumeration**: attackers can discover all platform users

### Proof of Concept
```bash
# As any authenticated user
curl -H "Authorization: Bearer $TOKEN" \
  https://api.splits.network/api/v2/users/ANY_USER_ID_HERE

# Returns full user object with no authorization check
```

### Fix Required
**Add relationship-based authorization check:**

```typescript
async findUserById(clerkUserId: string, id: string) {
    this.logger.info({ id }, 'UserService.findUserById');

    // Get requesting user's access context
    const accessContext = await this.resolveAccessContext(clerkUserId);

    // Verify authorization: user can only see other users if they:
    // 1. Are platform admin, OR
    // 2. Share a conversation with the user, OR
    // 3. Share an organization with the user
    const canView =
        accessContext.isPlatformAdmin ||
        await this.repository.hasSharedConversation(clerkUserId, id) ||
        await this.repository.hasSharedOrganization(accessContext.organizationIds, id);

    if (!canView) {
        throw new Error('Forbidden: You do not have permission to view this user');
    }

    const user = await this.repository.findUserById(id);
    if (!user) {
        throw new Error(`User not found: ${id}`);
    }

    // Return limited fields (not full record)
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        // Do NOT return: clerk_user_id, onboarding_status, etc.
    };
}
```

---

## Vulnerability 2: Client-Side Cache Not Cleared on Logout

### Severity: 🔴 CRITICAL

### Description
The `user-cache.ts` module uses JavaScript Map objects that persist in memory across user sessions. When a user logs out, this cache is not cleared, leading to potential data leakage to subsequent users on the same browser.

### Location
- **File**: `apps/portal/src/lib/user-cache.ts`
- **Lines**: 9-10

### Code Analysis
```typescript
const cache = new Map<string, UserSummary>();  // ⚠️ Module-level - persists across logouts
const pending = new Map<string, Promise<UserSummary | null>>();
```

**No `clear()` function was exported or called on logout until today's fix.**

### Exploitation Scenario
```
1. User A logs in and views conversations (caches other users' names/emails)
2. User A logs out (cache remains in memory)
3. User B logs in on the same browser/device
4. User B's UI could potentially display cached names from User A's session
5. User B sees PII from users they shouldn't have access to
```

### Impact
- 🚨 **Cross-user data leakage** on shared devices
- 📧 **PII exposure**: emails and names persisted in memory
- 🏢 **Enterprise risk**: shared workstation environments
- 🔓 **No access control**: cache has no user context

### Fix Status
✅ **FULLY RESOLVED** as of 2026-02-02:
- **Eliminated client-side user caching entirely** - `user-cache.ts` has been deleted
- Chat API refactored to include participant names inline (participant_a, participant_b)
- Frontend updated to use inline participant data from API responses
- No more unauthorized GET /users/:id calls from frontend
- Cross-user data leakage vulnerability completely eliminated

### Architecture Change
**Before**: Frontend made unauthorized GET /users/:id calls and cached results in module-level Map

**After**: Backend includes participant details inline when returning conversation data:
- Modified `listConversationsWithParticipants()` to JOIN with users table
- Modified `resyncConversationWithParticipants()` to JOIN with users table
- Frontend uses inline `conversation.participant_a` and `conversation.participant_b` data
- Files deleted: `apps/portal/src/lib/user-cache.ts`, `apps/portal/src/lib/current-user.ts`

---

## Vulnerability 3: No Cache Invalidation Strategy

### Severity: 🟡 MEDIUM

### Description
Once user data is cached, it remains indefinitely until browser refresh or logout. Changes to user profiles are not reflected in cached data.

### Impact
- Stale data displayed to users
- Privacy concerns if user updates their info
- Inconsistent UX across the application

### Recommendation
Implement one of:
1. **TTL-based expiration** (e.g., 5 minutes)
2. **Event-based invalidation** (WebSocket updates when user data changes)
3. **Server-side inclusion** (return user info with conversation data)

---

## Vulnerability 4: Over-Fetching User Data

### Severity: 🟡 MEDIUM

### Description
The messages feature fetches full user records to display names in the conversation list. This is inefficient and potentially insecure.

### Current Flow
```
Frontend → GET /api/v2/users/:id → Full user record → Cache → Display name only
```

### Better Architecture
```
Frontend → GET /api/v2/chat/conversations → Include participant names inline → Display
```

**Why This Is Better:**
- Server controls what data is exposed
- Authorization checked once (on conversation access)
- Fewer API calls
- No client-side caching needed
- Automatic updates when conversations are fetched

### Recommendation
Modify `/api/v2/chat/conversations` to include:
```json
{
  "id": "conv-123",
  "participants": [
    {
      "user_id": "user-456",
      "name": "John Doe",
      "profile_image_url": "..."
    }
  ]
}
```

---

## Data Flow Analysis

### Current (Vulnerable) Flow
```
┌─────────────────┐
│  User A Browser │
│   (Logged In)   │
└────────┬────────┘
         │
         │ GET /users/789
         ▼
┌─────────────────┐
│  API Gateway    │
│  (Auth Check ✓) │
└────────┬────────┘
         │
         │ Forward with JWT
         ▼
┌─────────────────┐
│ Identity Service│
│  findUserById() │
│  ⚠️ No authz!   │
└────────┬────────┘
         │
         │ Returns full user
         ▼
┌─────────────────┐
│ Module-level    │
│ Map cache       │
│ (persists!)     │
└─────────────────┘
         │
         │ User A logs out
         ▼
         │ Cache NOT cleared ⚠️
         │
         │ User B logs in
         ▼
┌─────────────────┐
│ User B sees     │
│ User A's cache! │
└─────────────────┘
```

### Recommended (Secure) Flow
```
┌─────────────────┐
│  User A Browser │
└────────┬────────┘
         │
         │ GET /chat/conversations
         ▼
┌─────────────────┐
│  Chat Service   │
│  (loads convos  │
│   for User A)   │
└────────┬────────┘
         │
         │ JOIN with users table
         │ (server-side)
         ▼
┌─────────────────┐
│ Returns convos  │
│ with participant│
│ names inline    │
└─────────────────┘
```

---

## Compliance Concerns

### GDPR Article 5 - Data Minimization
**Issue**: Fetching full user records when only name/email needed
**Violation**: Excessive data processing
**Fix**: Return only necessary fields

### GDPR Article 32 - Security of Processing
**Issue**: PII cached client-side without expiration
**Violation**: Inadequate technical measures
**Fix**: Server-side rendering or strict TTL

### SOC 2 CC6.1 - Logical Access Controls
**Issue**: Missing authorization on user lookup endpoint
**Violation**: Insufficient access restrictions
**Fix**: Relationship-based authorization

---

## Remediation Plan

### Priority 1: Immediate (Deploy ASAP)
- [x] ✅ Clear user cache on logout (COMPLETED 2026-02-02 - now OBSOLETE, cache deleted)
- [x] ✅ Eliminate client-side user caching pattern (COMPLETED 2026-02-02)
- [x] ✅ Refactor chat API to include participant names inline (COMPLETED 2026-02-02)
- [x] ✅ Update frontend to use inline participant data (COMPLETED 2026-02-02)
- [ ] 🔴 Add authorization to `findUserById()` endpoint (BACKEND STILL NEEDS FIX)
- [ ] 🔴 Add integration tests for authorization logic

### Priority 2: Short-term (Next Sprint)
- [x] ✅ Modify chat API to include participant names inline (COMPLETED 2026-02-02)
- [x] ✅ Remove client-side user caching (COMPLETED 2026-02-02)
- [x] ~~Implement TTL-based cache expiration~~ (NO LONGER NEEDED - cache deleted)

### Priority 3: Long-term (Next Quarter)
- [x] ~~Implement event-based cache invalidation~~ (NO LONGER NEEDED - cache deleted)
- [x] ~~Add cache size limits~~ (NO LONGER NEEDED - cache deleted)
- [ ] 🟢 Conduct full authorization audit across all endpoints (STILL RECOMMENDED)

---

## Testing Recommendations

### Authorization Tests
```typescript
describe('GET /api/v2/users/:id', () => {
  it('should return 403 when user has no relationship', async () => {
    const userA = await createUser();
    const userB = await createUser();

    const response = await request(app)
      .get(`/api/v2/users/${userB.id}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(response.status).toBe(403);
  });

  it('should return user when in same organization', async () => {
    const [userA, userB] = await createUsersInSameOrg();

    const response = await request(app)
      .get(`/api/v2/users/${userB.id}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('name');
  });
});
```

### Cache Clearing Tests
```typescript
describe('logout cache clearing', () => {
  it('should clear user cache on logout', async () => {
    // Populate cache
    await getCachedUserSummary(getToken, 'user-123');
    expect(cache.size).toBeGreaterThan(0);

    // Logout
    await logout();

    // Verify cache cleared
    expect(cache.size).toBe(0);
  });
});
```

---

## References

- [OWASP A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [CWE-639: Authorization Bypass Through User-Controlled Key](https://cwe.mitre.org/data/definitions/639.html)
- [GDPR Article 5 - Data Minimization](https://gdpr-info.eu/art-5-gdpr/)
- [NIST 800-53 AC-3 - Access Enforcement](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=AC-3)

---

## Sign-off

**Created by**: Security Review
**Date**: 2026-02-02
**Updated**: 2026-02-02 (same day resolution)
**Status**: PARTIALLY RESOLVED
- ✅ Frontend vulnerability FIXED (user-cache eliminated, inline participant data used)
- ⚠️ Backend authorization STILL NEEDS FIX (GET /users/:id endpoint)
**Next Review**: After backend authorization implemented

**Distribution List**:
- Backend Team Lead
- Security Team
- Product Manager
- CTO

---

## Appendix: Related Files

### Frontend (Portal App) - REFACTORED 2026-02-02
- ~~`apps/portal/src/lib/user-cache.ts`~~ - **DELETED** - Multi-user cache eliminated
- ~~`apps/portal/src/lib/current-user.ts`~~ - **DELETED** - Replaced by `getCachedCurrentUserId` in current-user-profile.ts
- `apps/portal/src/lib/current-user-profile.ts` - **UPDATED**: Added `getCachedCurrentUserId()` helper
- `apps/portal/src/contexts/user-profile-context.tsx` - **UPDATED**: Removed clearUserCache call
- `apps/portal/src/app/portal/messages/components/browse/list-panel.tsx` - **REFACTORED**: Uses inline participant data
- `apps/portal/src/app/portal/messages/components/thread-panel.tsx` - **REFACTORED**: Uses inline participant data
- `apps/portal/src/components/sidebar.tsx` - **UPDATED**: Uses getCachedCurrentUserId from current-user-profile.ts

### Backend (Identity Service) - STILL VULNERABLE
- `services/identity-service/src/v2/users/service.ts` - **STILL VULNERABLE**: No authorization on findUserById()
- `services/identity-service/src/v2/users/routes.ts` - Routes definition
- `services/identity-service/src/v2/users/repository.ts` - Data access layer
- `services/identity-service/src/v2/shared/access.ts` - Access context resolution

### Backend (Chat Service) - REFACTORED 2026-02-02
- `services/chat-service/src/v2/chat/types.ts` - **ADDED**: ParticipantDetails, ChatConversationWithParticipants types
- `services/chat-service/src/v2/chat/repository.ts` - **ADDED**: listConversationsWithParticipants(), getConversationWithParticipants()
- `services/chat-service/src/v2/chat/service.ts` - **ADDED**: listConversationsWithParticipants(), resyncConversationWithParticipants()
- `services/chat-service/src/v2/chat/routes.ts` - **UPDATED**: Both endpoints now use enriched methods with inline participant data

### Next Steps
Create corresponding GitHub issues for each Priority 1 item with links to this audit report.
