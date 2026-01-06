# Extended API Migration Phases (6-24)

This document extends the main migration plan with detailed phases for all remaining API routes.

## Quick Reference - All Migration Phases

### ✅ Completed (Phases 1-5)
1. ✅ Proposals - Recruiter/Company proposal management
2. ✅ Applications - Multi-role application lifecycle
3. ✅ Jobs - Company/Recruiter job management  
4. ✅ Candidates - Candidate profiles with two-step lookup
5. ✅ Companies - Organization/Recruiter company access

### 🔄 In Progress (Phase 6)
6. 🔄 Placements - Placement tracking and payouts

### ⏳ Planned (Phases 7-24)
7. ⏳ Recruiters - Recruiter profiles and stats
8. ⏳ Recruiter-Candidates - Recruiter-candidate relationships
9. ⏳ Assignments - Recruiter-to-job assignments
10. ⏳ Identity - User and organization management
11. ⏳ Roles - RBAC-filtered content
12. ⏳ Reputation - Recruiter reputation system
13. ⏳ Billing - Subscriptions and payments
14. ⏳ Documents - File storage and retrieval
15. ⏳ Dashboards - Stats and insights
16. ⏳ Admin - Platform administration
17. ⏳ Notifications - Notification preferences
18. ⏳ Teams - Team management
19. ⏳ Onboarding - User onboarding flows
20. ⏳ Webhooks - Webhook subscriptions
21. ⏳ OAuth - OAuth token management
22. ⏳ Analytics - Usage analytics
23. ⏳ Audit - Audit logs
24. ⏳ Settings - User/org settings

---

## Phase 6: Placements

**Service**: ATS Service  
**Priority**: HIGH - Critical for payouts  
**Estimated Time**: 4 hours

### Entities
- `placements` - Placement records
- Related: applications, candidates, jobs, companies, recruiters

### Role Scoping
- **Platform Admin**: All placements
- **Company Users**: Placements for their company's jobs
- **Recruiters**: Placements they facilitated
- **Candidates**: Their own placements

### Implementation Tasks

#### 1. Repository Method
Create `findPlacementsForUser()` in `services/ats-service/src/repository.ts`:

```typescript
async findPlacementsForUser(
    clerkUserId: string,
    organizationId: string | null,
    filters: {
        status?: string;
        search?: string;
        sort_by?: string;
        sort_order?: 'ASC' | 'DESC';
        page?: number;
        limit?: number;
    }
): Promise<{ data: any[]; total: number }>
```

**Role Resolution**:
- Check `memberships` for platform_admin
- Check `memberships` + company match for company users
- Check `recruiters` for recruiter role
- Check `candidates` for candidate role

**Filters**:
- Search by candidate name, job title
- Filter by status (active, completed, cancelled)
- Sort by placement_date, salary, etc.

#### 2. Service Method
Create `getPlacementsForUser()` in `services/ats-service/src/services/placements/service.ts`

#### 3. Routes
Update `services/ats-service/src/routes/placements/routes.ts`:
- Add `requireUserContext()` helper
- New `GET /placements` endpoint
- Rename old to `GET /placements/legacy`

#### 4. Gateway
Update `services/api-gateway/src/routes/placements/routes.ts`:
- Use `buildAuthHeaders()` helper
- Update `GET /api/placements` endpoint
- Add `requireRoles()` middleware

---

## Phase 7: Recruiters

**Service**: Network Service  
**Priority**: HIGH - Core marketplace functionality  
**Estimated Time**: 4 hours

### Entities
- `recruiters` - Recruiter profiles
- Related: users, stats, assignments, proposals

### Role Scoping
- **Platform Admin**: All recruiters
- **Company Users**: Recruiters assigned to their company's jobs
- **Recruiters**: Their own profile + network connections

### Implementation Tasks

#### 1. Repository Method
Create `findRecruitersForUser()` in `services/network-service/src/repository.ts`

**Role Resolution**:
- Platform admin: All recruiters
- Company users: Recruiters via assignments to company jobs
- Recruiters: Own profile + connected recruiters (if networking feature exists)

#### 2. Service Method
Create `getRecruitersForUser()` in service layer

#### 3. Routes
Update routes with `requireUserContext()` and new endpoint

#### 4. Gateway
Update gateway with `buildAuthHeaders()` and `requireRoles()`

---

## Phase 8: Recruiter-Candidates

**Service**: Network Service  
**Priority**: MEDIUM - Relationship tracking  
**Estimated Time**: 3 hours

### Entities
- `recruiter_candidate_relationships` - Relationships between recruiters and candidates

### Role Scoping
- **Recruiters**: Their own candidate relationships
- **Platform Admin**: All relationships (for audit)

---

## Phase 9: Assignments

**Service**: Network Service  
**Priority**: HIGH - Job assignment system  
**Estimated Time**: 4 hours

### Entities
- `role_assignments` - Recruiter assignments to jobs

### Role Scoping
- **Platform Admin**: All assignments
- **Company Users**: Assignments to their company's jobs
- **Recruiters**: Their own assignments

---

## Phase 10: Identity

**Service**: Identity Service  
**Priority**: LOW - Already uses Clerk for auth  
**Estimated Time**: 2 hours

### Entities
- `users` - User profiles
- `organizations` - Organizations
- `memberships` - User-org relationships

### Note
Most identity operations are already user-scoped by Clerk.  
Migration focuses on admin endpoints for user management.

---

## Phase 11: Roles

**Service**: API Gateway  
**Priority**: LOW - RBAC helper routes  
**Estimated Time**: 2 hours

### Endpoints
Routes that provide RBAC-filtered content based on user role.  
May be redundant after full migration.

---

## Phase 12: Reputation

**Service**: Network Service (future)  
**Priority**: LOW - Phase 2 feature  
**Estimated Time**: 3 hours

### Entities
- `reputation_scores` - Recruiter reputation
- Related: placements, feedback, performance metrics

---

## Phase 13: Billing

**Service**: Billing Service  
**Priority**: MEDIUM - Subscription management  
**Estimated Time**: 5 hours

### Entities
- `subscriptions` - Recruiter subscriptions
- `payouts` - Payment records
- `invoices` - Billing history

### Role Scoping
- **Platform Admin**: All billing data
- **Recruiters**: Their own subscriptions and payouts
- **Company Users**: Their organization's billing

---

## Phase 14: Documents

**Service**: Document Service  
**Priority**: MEDIUM - File management  
**Estimated Time**: 4 hours

### Entities
- `files` - File metadata
- Storage: Supabase Storage buckets

### Role Scoping
- Users see documents they uploaded or have access to
- Company users see company documents
- Recruiters see candidate documents they have access to

---

## Phase 15: Dashboards

**Service**: ATS Service  
**Priority**: HIGH - Analytics and insights  
**Estimated Time**: 5 hours

### Endpoints
Dashboard stats endpoints that aggregate data based on user role.

### Role Scoping
- Platform admin: Global stats
- Company users: Company-specific stats
- Recruiters: Personal performance stats

---

## Phase 16: Admin

**Service**: Multiple  
**Priority**: LOW - Platform administration  
**Estimated Time**: 6 hours

### Endpoints
Platform admin endpoints for system management.  
Already restricted to platform_admin role.

---

## Phase 17-24: Additional Modules

Remaining modules follow the same pattern:

17. **Notifications**: User notification preferences (Identity Service)
18. **Teams**: Team management within organizations (Identity Service)
19. **Onboarding**: User onboarding workflows (Identity Service)
20. **Webhooks**: Webhook subscription management (API Gateway)
21. **OAuth**: OAuth token management (API Gateway)
22. **Analytics**: Usage analytics (separate service if exists)
23. **Audit**: Audit log management (separate service if exists)
24. **Settings**: User/organization settings (Identity Service)

---

## Implementation Strategy

### Prioritization Criteria
1. **HIGH Priority**: Core marketplace functions (Placements, Recruiters, Assignments)
2. **MEDIUM Priority**: Supporting features (Billing, Documents, Dashboards)
3. **LOW Priority**: Admin/meta endpoints (Identity, Roles, Admin)

### Parallel Work
Can be executed in parallel groups:
- **Group A** (ATS): Placements, Dashboards
- **Group B** (Network): Recruiters, Assignments, Recruiter-Candidates
- **Group C** (Billing): Subscriptions, Payouts, Invoices
- **Group D** (Documents): File operations

### Timeline Estimate
- **HIGH Priority** (Phases 6-9): 15 hours (2 work days)
- **MEDIUM Priority** (Phases 13-15): 14 hours (2 work days)
- **LOW Priority** (Phases 10-12, 16-24): 30 hours (4 work days)
- **Total**: ~59 hours (~8 work days)

With parallel execution: **4-5 work days total**

---

## Testing Strategy

### Per-Phase Testing
Each phase includes:
1. ✅ Compilation check (0 errors)
2. ✅ Unit tests for repository method
3. ✅ Integration tests for endpoint
4. ✅ Role-based access tests (all roles)
5. ✅ Performance verification (10-50ms target)

### End-to-End Testing
After all phases complete:
1. Full portal workflow tests
2. Load testing (concurrent users)
3. Performance regression tests
4. Security audit (access control verification)

---

## Success Metrics

### Performance
- ✅ 10-25x improvement in response times
- ✅ 10-50ms average response time
- ✅ Eliminated service-to-service call overhead

### Code Quality
- ✅ 0 compilation errors
- ✅ Consistent pattern across all routes
- ✅ No role-based branching in service layer
- ✅ All role resolution via database JOINs

### Architecture
- ✅ Direct Supabase queries (no SQL functions)
- ✅ Type-safe TypeScript implementation
- ✅ Maintainable and debuggable
- ✅ Version controlled with application code

---

**Last Updated**: December 29, 2025  
**Next Review**: After Phase 6 completion
