# Notification Service Email Delivery Fix - Implementation Plan

**Version**: 1.0  
**Created**: December 28, 2024  
**Status**: 🔴 Critical - Blocking Email Delivery

---

## Executive Summary

**Problem**: Email notifications are failing to send because the notification service cannot retrieve user email addresses after recent authentication architecture changes.

**Root Cause**: The authentication architecture has changed how user IDs are handled (Clerk user ID vs internal UUID), and the notification service is making incorrect assumptions about the identity service responses.

**Impact**: All email notifications in the system are failing, including:
- Application submission confirmations
- Stage change notifications
- Placement notifications
- Pre-screen requests
- Recruiter-candidate communications

**Estimated Fix Time**: 2-4 hours  
**Risk Level**: Low - Read-only operations, no schema changes

---

## Root Cause Analysis

### Architecture Changes

The authentication system has been standardized around **Clerk user IDs** as primary identifiers:

1. **Frontend** → sends Clerk JWT (contains Clerk user ID)
2. **API Gateway** → extracts Clerk user ID from JWT, passes as `x-clerk-user-id` header
3. **Backend Services** → receive Clerk user ID, must resolve to internal UUID when needed
4. **Database** → stores both `clerk_user_id` (text) and `id` (UUID) in `users` table

### Current Problem Pattern

The notification service consumer (`consumer.ts`) follows this pattern:

```typescript
// Step 1: Fetch recruiter from network service
const recruiterResponse = await this.services.getNetworkService()
    .get<any>(`/recruiters/${recruiter_id}`);
const recruiter = recruiterResponse.data || recruiterResponse;

// Step 2: Fetch user by user_id (PROBLEM - this is internal UUID)
const userResponse = await this.services.getIdentityService()
    .get<any>(`/users/${recruiter.user_id}`);
const user = userResponse.data || userResponse;

// Step 3: Use email (PROBLEM - user may not exist or email not returned)
await this.emailService.sendEmail(user.email, { ... });
```

**Issues**:

1. **Wrong ID Type**: `recruiter.user_id` is an internal UUID, but may need to query by `clerk_user_id`
2. **Missing Email**: Identity service response may not include email in expected format
3. **No Error Handling**: If user lookup fails, email silently doesn't send
4. **Inconsistent Response Unwrapping**: Sometimes `response.data`, sometimes just `response`

### Identity Service API Contract

Based on code analysis, the identity service has these endpoints:

```typescript
// Get user by internal UUID
GET /users/:id
Response: { data: { id, clerk_user_id, email, name, memberships[] } }

// Get user by Clerk user ID (for service-to-service)
GET /users/by-clerk-id/:clerkUserId
Response: { data: { id, clerk_user_id, email, name } }
```

**Key Finding**: The notification service needs to use the **correct endpoint** and **extract email properly**.

---

## Current State Assessment

### Files Requiring Changes

1. **Primary Consumer**: `services/notification-service/src/consumers/applications/consumer.ts` (526 lines)
   - Contains 10+ methods that fetch user data
   - All use same flawed pattern
   - Affects all application-related emails

2. **Service Clients**: `services/notification-service/src/clients.ts`
   - May need enhanced error handling
   - Currently returns raw response without validation

3. **Other Consumers** (if they exist):
   - `consumers/candidates/` - candidate relationship emails
   - `consumers/placements/` - placement notifications
   - Need to audit all consumers

### Affected Email Types

From `consumer.ts` analysis:

| Method | Email Recipients | Issue |
|--------|------------------|-------|
| `handleApplicationAccepted` | Recruiter | Cannot get recruiter email |
| `handleApplicationStageChanged` | Recruiter | Cannot get recruiter email |
| `handleCandidateApplicationSubmitted` | Candidate, Recruiter, Company admins | Cannot get user emails |
| `handleRecruiterSubmittedToCompany` | Candidate, Company admins | Cannot get user emails |
| `handleApplicationWithdrawn` | Candidate, Recruiter | Cannot get user emails |
| `handlePreScreenRequested` | Recruiter | Cannot get recruiter email |
| `handleAIReviewCompleted` | Candidate, Recruiter | Cannot get user emails |

---

## Solution Design

### Approach 1: Fix at Notification Service Level ⭐ **RECOMMENDED**

**Strategy**: Update notification service to properly query identity service with correct ID types and handle responses correctly.

**Pros**:
- Localized changes
- No backend service modifications needed
- Preserves current API contracts
- Can be deployed independently

**Cons**:
- Need to update multiple methods
- Must audit all consumers

### Approach 2: Add Email Enrichment to Backend Services

**Strategy**: Have ATS/Network services return enriched data with email addresses pre-populated.

**Pros**:
- Reduces inter-service calls
- Better performance
- Single source of truth per domain

**Cons**:
- Requires backend service changes
- Breaking API changes
- More complex deployment
- Services need to query identity service

### Approach 3: Create Email Lookup Helper Service

**Strategy**: Create shared helper that resolves any user ID to email address.

**Pros**:
- Reusable across consumers
- Centralized error handling
- Easy to add caching

**Cons**:
- Adds new abstraction
- Still requires backend understanding

---

## Recommended Solution (Approach 1 + Helper)

**Plan**: Fix notification service with a helper utility for consistent email lookup.

### Step 1: Create Email Lookup Helper

**File**: `services/notification-service/src/helpers/email-lookup.ts`

```typescript
import { ServiceRegistry } from '../clients';
import { Logger } from '@splits-network/shared-logging';

/**
 * Email Lookup Helper
 * Resolves user IDs (UUID or Clerk ID) to email addresses
 */
export class EmailLookupHelper {
    constructor(
        private services: ServiceRegistry,
        private logger: Logger
    ) {}

    /**
     * Get email address from internal user UUID
     * Queries: GET /users/:id
     */
    async getEmailByUserId(userId: string): Promise<string | null> {
        try {
            const response = await this.services.getIdentityService()
                .get<any>(`/users/${userId}`);
            
            const user = response.data || response;
            
            if (!user?.email) {
                this.logger.warn({ userId }, 'User found but no email address');
                return null;
            }
            
            return user.email;
        } catch (error) {
            this.logger.error(
                { userId, error },
                'Failed to fetch user email by ID'
            );
            return null;
        }
    }

    /**
     * Get email address from Clerk user ID
     * Queries: GET /users/by-clerk-id/:clerkUserId
     */
    async getEmailByClerkUserId(clerkUserId: string): Promise<string | null> {
        try {
            const response = await this.services.getIdentityService()
                .get<any>(`/users/by-clerk-id/${clerkUserId}`);
            
            const user = response.data || response;
            
            if (!user?.email) {
                this.logger.warn(
                    { clerkUserId },
                    'User found by Clerk ID but no email address'
                );
                return null;
            }
            
            return user.email;
        } catch (error) {
            this.logger.error(
                { clerkUserId, error },
                'Failed to fetch user email by Clerk ID'
            );
            return null;
        }
    }

    /**
     * Get recruiter email address
     * Fetches recruiter from network service, then resolves user email
     */
    async getRecruiterEmail(recruiterId: string): Promise<string | null> {
        try {
            // Fetch recruiter
            const recruiterResponse = await this.services.getNetworkService()
                .get<any>(`/recruiters/${recruiterId}`);
            const recruiter = recruiterResponse.data || recruiterResponse;

            if (!recruiter?.user_id) {
                this.logger.warn({ recruiterId }, 'Recruiter found but no user_id');
                return null;
            }

            // Fetch user email by internal UUID
            return await this.getEmailByUserId(recruiter.user_id);
        } catch (error) {
            this.logger.error(
                { recruiterId, error },
                'Failed to fetch recruiter email'
            );
            return null;
        }
    }

    /**
     * Get candidate email address
     * Fetches candidate from ATS service, then resolves user email if user_id exists
     */
    async getCandidateEmail(candidateId: string): Promise<string | null> {
        try {
            // Fetch candidate
            const candidateResponse = await this.services.getAtsService()
                .get<any>(`/candidates/${candidateId}`);
            const candidate = candidateResponse.data || candidateResponse;

            // Check if candidate has user account
            if (candidate?.user_id) {
                return await this.getEmailByUserId(candidate.user_id);
            }

            // Fallback: candidate may have email directly (legacy data)
            if (candidate?.email) {
                this.logger.info(
                    { candidateId },
                    'Using candidate email directly (no user account)'
                );
                return candidate.email;
            }

            this.logger.warn(
                { candidateId },
                'Candidate has no user account or email'
            );
            return null;
        } catch (error) {
            this.logger.error(
                { candidateId, error },
                'Failed to fetch candidate email'
            );
            return null;
        }
    }

    /**
     * Get company admin emails
     * Fetches organization memberships and returns admin emails
     */
    async getCompanyAdminEmails(
        organizationId: string
    ): Promise<string[]> {
        try {
            // Fetch organization memberships
            const membershipsResponse = await this.services.getIdentityService()
                .get<any>(`/organizations/${organizationId}/memberships`);
            
            const memberships = membershipsResponse.data || membershipsResponse;

            if (!Array.isArray(memberships)) {
                this.logger.warn(
                    { organizationId },
                    'No memberships found for organization'
                );
                return [];
            }

            // Filter for company_admin role
            const adminMemberships = memberships.filter(
                (m: any) => m.role === 'company_admin'
            );

            // Fetch emails for all admins
            const emails: string[] = [];
            for (const membership of adminMemberships) {
                if (membership.user_id) {
                    const email = await this.getEmailByUserId(membership.user_id);
                    if (email) {
                        emails.push(email);
                    }
                }
            }

            return emails;
        } catch (error) {
            this.logger.error(
                { organizationId, error },
                'Failed to fetch company admin emails'
            );
            return [];
        }
    }
}
```

### Step 2: Update Consumer to Use Helper

**File**: `services/notification-service/src/consumers/applications/consumer.ts`

**Changes Required**: Update each handler method to use `EmailLookupHelper` instead of direct service calls.

**Example - Before**:
```typescript
// Old pattern (BROKEN)
const recruiterResponse = await this.services.getNetworkService()
    .get<any>(`/recruiters/${recruiter_id}`);
const recruiter = recruiterResponse.data || recruiterResponse;

const userResponse = await this.services.getIdentityService()
    .get<any>(`/users/${recruiter.user_id}`);
const user = userResponse.data || userResponse;

await this.emailService.sendEmail(user.email, { ... });
```

**Example - After**:
```typescript
// New pattern (FIXED)
const recruiterEmail = await this.emailLookup.getRecruiterEmail(recruiter_id);

if (!recruiterEmail) {
    this.logger.warn(
        { recruiter_id, application_id },
        'Cannot send email - recruiter has no email address'
    );
    return; // Skip email, don't throw error
}

await this.emailService.sendEmail(recruiterEmail, { ... });
```

### Step 3: Methods to Update

**In `consumer.ts`, update these methods**:

1. ✅ `handleApplicationAccepted()`
   - Line ~25-35: Fetch recruiter email
   - Send email to recruiter

2. ✅ `handleApplicationStageChanged()`
   - Line ~58-73: Fetch recruiter email
   - Send email to recruiter

3. ✅ `handleCandidateApplicationSubmitted()`
   - Line ~125-250: Fetch candidate email, recruiter email, company admin emails
   - Multiple recipients with different scenarios

4. ✅ `handleRecruiterSubmittedToCompany()`
   - Line ~335-415: Fetch candidate email, company admin emails
   - Send confirmation to candidate and company

5. ✅ `handleApplicationWithdrawn()`
   - Line ~445-515: Fetch candidate email, recruiter email
   - Notify both parties

6. ✅ `handlePreScreenRequested()`
   - Line ~535-593: Fetch recruiter email, requesting user email
   - Notify recruiter and confirm to requester

7. ✅ `handleAIReviewCompleted()`
   - Line ~630-702: Fetch candidate email, recruiter email
   - Notify both about AI review results

---

## Implementation Steps

### Phase 1: Create Helper (30 min)

- [ ] Create `services/notification-service/src/helpers/email-lookup.ts`
- [ ] Implement `EmailLookupHelper` class with all methods
- [ ] Add comprehensive error handling and logging
- [ ] Add unit tests (optional for quick fix)

### Phase 2: Update Consumer Constructor (15 min)

- [ ] Update `ApplicationsEventConsumer` constructor to accept `EmailLookupHelper`
- [ ] Initialize helper in consumer instantiation

**File**: `services/notification-service/src/consumers/applications/consumer.ts`

```typescript
export class ApplicationsEventConsumer {
    constructor(
        private emailService: ApplicationsEmailService,
        private services: ServiceRegistry,
        private emailLookup: EmailLookupHelper,  // ADD THIS
        private logger: Logger
    ) {}
    
    // ... methods
}
```

### Phase 3: Update Handler Methods (90-120 min)

For **each handler method**, follow this pattern:

1. **Identify all email recipients** (recruiter, candidate, company admins)
2. **Replace direct service calls** with `emailLookup` helper calls
3. **Add null checks** - skip email if no address found, log warning
4. **Remove response unwrapping logic** - helper handles it
5. **Test the changes** - verify email lookups work

**Priority Order**:
1. `handleApplicationAccepted` (most common)
2. `handleRecruiterSubmittedToCompany` (critical flow)
3. `handleCandidateApplicationSubmitted` (critical flow)
4. `handleApplicationStageChanged` (common)
5. `handleApplicationWithdrawn` (user-initiated)
6. `handlePreScreenRequested` (admin flow)
7. `handleAIReviewCompleted` (nice-to-have)

### Phase 4: Update Consumer Initialization (15 min)

**File**: `services/notification-service/src/domain-consumer.ts` or wherever consumer is instantiated

```typescript
import { EmailLookupHelper } from './helpers/email-lookup';

// Create helper
const emailLookup = new EmailLookupHelper(services, logger);

// Pass to consumer
const applicationsConsumer = new ApplicationsEventConsumer(
    notificationService.applications,
    services,
    emailLookup,  // ADD THIS
    logger
);
```

### Phase 5: Test & Deploy (30 min)

- [ ] Test each event type manually:
  - Create application
  - Change application stage
  - Withdraw application
  - Complete AI review
- [ ] Monitor logs for warnings about missing emails
- [ ] Check Resend dashboard for successful sends
- [ ] Verify email content renders correctly

---

## Testing Strategy

### Unit Tests (Optional - Can Skip for Quick Fix)

```typescript
// tests/helpers/email-lookup.test.ts

describe('EmailLookupHelper', () => {
    it('should fetch email by user ID', async () => {
        // Mock identity service response
        // Assert email returned
    });

    it('should return null if user not found', async () => {
        // Mock 404 response
        // Assert null returned, no throw
    });

    it('should fetch recruiter email via network service', async () => {
        // Mock network service -> recruiter
        // Mock identity service -> user email
        // Assert email returned
    });
});
```

### Integration Tests (Manual)

1. **Test Application Flow**:
   - Candidate submits application
   - Check inbox for confirmation email
   - Recruiter reviews application
   - Check inbox for stage change email

2. **Test Withdrawal Flow**:
   - Candidate withdraws application
   - Check both candidate and recruiter inboxes

3. **Test Company Notification**:
   - Recruiter submits candidate to company
   - Check company admin inbox

### Monitoring

After deployment, monitor:

1. **RabbitMQ Queues**: Ensure events are being consumed
2. **Notification Service Logs**: Check for email lookup errors
3. **Resend Dashboard**: Verify emails are being sent
4. **Error Rates**: Watch for spikes in notification service errors

---

## Rollback Plan

If emails still fail after deployment:

1. **Immediate**: Check logs for specific error messages
2. **Debug**: Add additional logging to identify which lookup is failing
3. **Hotfix**: If helper has bugs, can revert to direct service calls with fixes
4. **Alternative**: Can implement Approach 2 (backend enrichment) if helper doesn't work

**Rollback Steps**:
1. Revert `consumer.ts` changes
2. Redeploy notification service
3. Events will queue and can be reprocessed after fix

---

## Additional Considerations

### Future Improvements

1. **Caching**: Add in-memory cache for user email lookups (TTL: 5 min)
2. **Batch Lookups**: When sending to multiple admins, batch the requests
3. **Fallback to ATS**: If identity service is down, can candidate email be fetched from ATS directly?
4. **Error Metrics**: Track email lookup failure rates in monitoring

### Schema Considerations

Currently, the pattern requires:
- `users` table has `clerk_user_id` and `email` columns ✅
- `recruiters` table has `user_id` column (internal UUID) ✅
- `candidates` table may have `user_id` column (optional) ✅

**No schema changes needed** for this fix.

### Other Consumers to Audit

After fixing applications consumer, audit these consumers (if they exist):

- [ ] `consumers/candidates/consumer.ts` - Candidate relationship emails
- [ ] `consumers/placements/consumer.ts` - Placement notifications
- [ ] `consumers/proposals/consumer.ts` - Proposal notifications
- [ ] Any other consumers in `consumers/` directory

---

## Success Criteria

✅ **Emails are delivered successfully**:
- Application submissions send confirmation emails
- Stage changes notify recruiters
- Withdrawals notify all parties
- AI review results are emailed

✅ **No silent failures**:
- If email lookup fails, log clear warning
- Don't throw errors that block event processing
- Events can be retried if needed

✅ **Performance acceptable**:
- Email lookup adds <500ms per event
- No timeout errors
- Resend API calls succeed

✅ **Logs are actionable**:
- Can identify which user lookup failed
- Can see which events didn't send emails
- Error messages include all context (IDs, reasons)

---

## Estimated Timeline

| Phase | Duration | Description |
|-------|----------|-------------|
| Phase 1: Create Helper | 30 min | Implement `EmailLookupHelper` class |
| Phase 2: Update Constructor | 15 min | Wire up helper in consumer |
| Phase 3: Update Handlers | 90-120 min | Refactor all 7 handler methods |
| Phase 4: Update Initialization | 15 min | Wire up in domain consumer |
| Phase 5: Test & Deploy | 30 min | Manual testing, deployment |
| **Total** | **3-4 hours** | Complete fix and deployment |

---

## Questions for Review

1. ✅ **Identity Service Contract**: Confirmed that `/users/:id` and `/users/by-clerk-id/:clerkUserId` both return `{ data: { email, ... } }`?
2. ⚠️ **Candidate Emails**: Do candidates without user accounts have emails stored in `candidates.email`? Or do they always have user accounts?
3. ✅ **Company Admin Lookup**: Confirmed that `/organizations/:id/memberships` returns array with `user_id` and `role`?
4. ❓ **Error Handling**: Should we throw errors if critical emails fail (e.g., application confirmation), or just log warnings?
5. ❓ **Event Replay**: If an email fails, can we replay the event? Or do we need idempotency keys?

---

## Conclusion

This implementation plan provides a **systematic approach** to fixing email delivery in the notification service. By creating a centralized `EmailLookupHelper`, we:

1. ✅ **Fix the root cause**: Properly resolve user IDs to email addresses
2. ✅ **Improve reliability**: Add error handling and graceful degradation
3. ✅ **Simplify consumer logic**: Remove repetitive service call patterns
4. ✅ **Enable future improvements**: Caching, batching, fallbacks

The fix is **low-risk** (read-only operations), **localized** (notification service only), and **deployable independently** (no backend changes needed).

**Next Steps**: Review this plan, confirm the approach, and proceed with implementation.
