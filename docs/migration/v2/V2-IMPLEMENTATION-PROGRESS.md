# V2 Architecture Implementation Progress

**Date**: December 29, 2025  
**Status**: Phase 3 Complete - ATS + Network + Billing Services migrated to V2

---

## Completed: Phase 1 - ATS Service V2

### Structure Created
```
services/ats-service/src/v2/
|- types.ts           (complete - shared resource types, filters, updates)
|- helpers.ts         (complete - user context + pagination helpers)
|- repository.ts      (complete - single file with all CRUD operations)
|- services/
|  |- jobs.ts         (complete - JobServiceV2 with smart validation)
|  |- companies.ts    (complete - CompanyServiceV2)
|  |- candidates.ts   (complete - CandidateServiceV2)
|  |- applications.ts (complete - ApplicationServiceV2)
|  |- placements.ts   (complete - PlacementServiceV2)
|- shared/
|  |- events.ts
|  |- helpers.ts
|  |- pagination.ts
|- routes.ts          (complete - 5-route pattern for 5 resources)
```

### Features Implemented
- Standardized 5-route pattern (LIST, GET, CREATE, UPDATE, DELETE)
- Role-based data scoping via identity.memberships
- Direct Supabase queries with enriched JOINs
- Single update methods with smart validation
- Event publishing after all operations
- Consistent error handling and response format
- Pagination with total counts
- Integration with main index.ts

### API Endpoints Available
**Jobs (5 routes)**:
- GET /v2/jobs - List with role-scoping
- GET /v2/jobs/:id - Single job
- POST /v2/jobs - Create
- PATCH /v2/jobs/:id - Update (all updates)
- DELETE /v2/jobs/:id - Soft delete

**Companies (5 routes)**:
- GET /v2/companies - List
- GET /v2/companies/:id - Single
- POST /v2/companies - Create
- PATCH /v2/companies/:id - Update
- DELETE /v2/companies/:id - Soft delete

**Candidates (5 routes)**:
- GET /v2/candidates - List
- GET /v2/candidates/:id - Single
- POST /v2/candidates - Create
- PATCH /v2/candidates/:id - Update
- DELETE /v2/candidates/:id - Soft delete

**Applications (5 routes)**:
- GET /v2/applications - List with enriched data
- GET /v2/applications/:id - Single with candidate/job data
- POST /v2/applications - Create
- PATCH /v2/applications/:id - Update (handles stage transitions)
- DELETE /v2/applications/:id - Soft delete

**Placements (5 routes)**:
- GET /v2/placements - List with enriched data
- GET /v2/placements/:id - Single with full context
- POST /v2/placements - Create
- PATCH /v2/placements/:id - Update (handles status transitions)
- DELETE /v2/placements/:id - Soft delete

---

## Completed: Phase 2 - Network Service V2

### Structure Created
```
services/network-service/src/v2/
|- types.ts
|- helpers.ts
|- repository.ts
|- shared/
|  |- events.ts
|  |- helpers.ts
|  |- pagination.ts
|- recruiters/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- assignments/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- recruiter-candidates/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- reputation/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- proposals/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- routes.ts
```

### Features Implemented
- Standardized 5-route pattern across recruiters, assignments, recruiter-candidates, reputation, and proposals
- Role-based data scoping using requireUserContext and scoped Supabase queries
- Dedicated repositories per domain with enriched JOINs and zero service-to-service calls
- Single update methods that validate status transitions, marketplace visibility, capacity, and ratings
- Event publishing pipeline built on v2/shared/events.ts
- Pagination + filtering helpers reused across all resources
- services/network-service/src/index.ts registers both legacy and v2 routes for dual-run support

### API Endpoints Available
**Recruiters (5 routes)**:
- GET /v2/recruiters - List with filters and pagination
- GET /v2/recruiters/:id - Single recruiter profile
- POST /v2/recruiters - Create
- PATCH /v2/recruiters/:id - Update (status, profile, marketplace visibility)
- DELETE /v2/recruiters/:id - Soft delete

**Assignments (5 routes)**:
- GET /v2/assignments - List recruiter-job assignments
- GET /v2/assignments/:id - Single assignment with job/recruiter context
- POST /v2/assignments - Create
- PATCH /v2/assignments/:id - Update (capacity, status, fees)
- DELETE /v2/assignments/:id - Soft delete

**Recruiter-Candidates (5 routes)**:
- GET /v2/recruiter-candidates - List recruiter <> candidate relationships
- GET /v2/recruiter-candidates/:id - Single record with metadata
- POST /v2/recruiter-candidates - Create
- PATCH /v2/recruiter-candidates/:id - Update (notes, state, ownership)
- DELETE /v2/recruiter-candidates/:id - Soft delete

**Reputation (5 routes)**:
- GET /v2/reputation - List recruiter reputation metrics
- GET /v2/reputation/:id - Single metric bundle
- POST /v2/reputation - Create
- PATCH /v2/reputation/:id - Update (ratings, volume, response metrics)
- DELETE /v2/reputation/:id - Hard delete when needed

**Proposals (5 routes)**:
- GET /v2/proposals - List proposals with filtering
- GET /v2/proposals/:id - Single proposal with recruiter + company context
- POST /v2/proposals - Create
- PATCH /v2/proposals/:id - Update (state transitions, notes, fees)
- DELETE /v2/proposals/:id - Soft delete

---

## Completed: Phase 3 - Billing Service V2

### Structure Created
```
services/billing-service/src/v2/
|- types.ts
|- shared/
|  |- events.ts
|  |- helpers.ts (user context, pagination, billing admin helper)
|- plans/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- subscriptions/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- payouts/
|  |- types.ts
|  |- repository.ts
|  |- service.ts
|- routes.ts
```

### Features Implemented
- Standardized 5-route pattern across plans, subscriptions, and payouts
- Direct Supabase queries per resource with pagination + filtering support
- Role-aware subscription access (recruiters see their own, admins see all)
- Billing admin enforcement helpers for plan/payout management
- Event publishing for every create/update/delete lifecycle hook
- services/billing-service/src/index.ts registers both legacy routes and V2 routes with dual-run RabbitMQ publisher

### API Endpoints Available

**Plans (5 routes)**:
- GET /v2/plans - List with filters + pagination
- GET /v2/plans/:id - Single plan
- POST /v2/plans - Create (billing admin only)
- PATCH /v2/plans/:id - Update (billing admin only)
- DELETE /v2/plans/:id - Archive plan (billing admin only)

**Subscriptions (5 routes)**:
- GET /v2/subscriptions - List (self-service for recruiters, global for admins)
- GET /v2/subscriptions/:id - Single subscription with authorization guard
- POST /v2/subscriptions - Create (non-admin auto-binds to caller)
- PATCH /v2/subscriptions/:id - Update metadata/status
- DELETE /v2/subscriptions/:id - Cancel subscription (soft delete)

**Payouts (5 routes)**:
- GET /v2/payouts - List payouts (billing admin only)
- GET /v2/payouts/:id - Single payout (billing admin only)
- POST /v2/payouts - Create payout record
- PATCH /v2/payouts/:id - Update payout status/details
- DELETE /v2/payouts/:id - Mark payout as failed/removed (soft delete)

### Combined Progress
- ATS Service: 25 V2 routes (jobs, companies, candidates, applications, placements)
- Network Service: 25 V2 routes (recruiters, assignments, recruiter-candidates, reputation, proposals)
- Billing Service: 15 V2 routes (plans, subscriptions, payouts)
- Total so far: 65 standardized V2 routes across 13 resources

---

## Remaining Work

### Phase 4: API Gateway V2 Routes (Estimated: 2 hours)
- [ ] Create services/api-gateway/src/routes/v2/routes.ts
- [ ] Register proxy routes for ATS, Network, and Billing V2 endpoints (65 routes once billing lands)
- [ ] Apply requireRoles() middleware for each proxy
- [ ] Update api-gateway/src/index.ts to register both legacy and V2 proxies

### Phase 5: Frontend Migration + Testing & Cleanup (Estimated: 6-8 hours)
- [ ] Wire portal + candidate apps to `/api/v2/*` endpoints page-by-page
- [ ] Test all ATS V2 endpoints
- [ ] Test all Network V2 endpoints
- [ ] Test all Billing V2 endpoints
- [ ] Compare V1 vs V2 performance + capture metrics
- [ ] V1 deprecation strategy and code removal

---

## Key Principles Followed

### 1. Standardized 5-Route Pattern
Every resource (Jobs, Companies, Recruiters, etc.) follows exactly:
- GET /v2/:resource - LIST with pagination
- GET /v2/:resource/:id - GET single
- POST /v2/:resource - CREATE
- PATCH /v2/:resource/:id - UPDATE (handles all updates)
- DELETE /v2/:resource/:id - DELETE (soft delete unless otherwise noted)

### 2. Single Update Methods
- No separate endpoints for status changes, stage transitions, etc.
- PATCH handles everything with smart validation
- Service layer inspects updates and validates accordingly

### 3. Direct Supabase Queries
- No SQL functions
- No service-to-service calls
- Role resolution in TypeScript using parallel queries
- Enriched queries with JOINs for related data

### 4. Consistent Response Format
- Success: `{ data: {...} }` or `{ data: [...], pagination: {...} }`
- Error: `{ error: { message: 'Description' } }`

### 5. Role-Based Scoping
- Backend determines data access via identity.memberships
- No authorization logic duplicated in downstream services
- Organization ID resolved from user's memberships or recruiter status

---

## Next Steps

1. Implement API Gateway V2 proxies for ATS + Network + Billing routes to enable frontend adoption.
2. Migrate portal and candidate-facing apps to `/api/v2/*` endpoints page-by-page.
3. Execute the testing + cleanup phase (performance baselines, V1 retirement, documentation refresh).

---

## Performance Impact (Projected)
- Query time: 100-200ms (vs 3-5s in V1)
- Network requests: 4-5 per page (vs 15-20+ in V1)
- Code complexity: 70-80% reduction
- Maintenance time: 90% reduction in fixing breaks

---

## Files Created So Far

### ATS Service (Complete)
1. `services/ats-service/src/v2/types.ts`
2. `services/ats-service/src/v2/helpers.ts`
3. `services/ats-service/src/v2/shared/helpers.ts`
4. `services/ats-service/src/v2/shared/events.ts`
5. `services/ats-service/src/v2/shared/pagination.ts`
6. `services/ats-service/src/v2/repository.ts`
7. `services/ats-service/src/v2/jobs/repository.ts`
8. `services/ats-service/src/v2/jobs/service.ts`
9. `services/ats-service/src/v2/jobs/types.ts`
10. `services/ats-service/src/v2/companies/repository.ts`
11. `services/ats-service/src/v2/companies/service.ts`
12. `services/ats-service/src/v2/companies/types.ts`
13. `services/ats-service/src/v2/candidates/repository.ts`
14. `services/ats-service/src/v2/candidates/service.ts`
15. `services/ats-service/src/v2/candidates/types.ts`
16. `services/ats-service/src/v2/applications/repository.ts`
17. `services/ats-service/src/v2/applications/service.ts`
18. `services/ats-service/src/v2/applications/types.ts`
19. `services/ats-service/src/v2/placements/repository.ts`
20. `services/ats-service/src/v2/placements/service.ts`
21. `services/ats-service/src/v2/placements/types.ts`
22. `services/ats-service/src/v2/routes.ts`
23. Updated `services/ats-service/src/index.ts`

### Network Service (Complete)
1. `services/network-service/src/v2/types.ts`
2. `services/network-service/src/v2/helpers.ts`
3. `services/network-service/src/v2/repository.ts`
4. `services/network-service/src/v2/shared/helpers.ts`
5. `services/network-service/src/v2/shared/pagination.ts`
6. `services/network-service/src/v2/shared/events.ts`
7. `services/network-service/src/v2/recruiters/types.ts`
8. `services/network-service/src/v2/recruiters/repository.ts`
9. `services/network-service/src/v2/recruiters/service.ts`
10. `services/network-service/src/v2/assignments/types.ts`
11. `services/network-service/src/v2/assignments/repository.ts`
12. `services/network-service/src/v2/assignments/service.ts`
13. `services/network-service/src/v2/recruiter-candidates/types.ts`
14. `services/network-service/src/v2/recruiter-candidates/repository.ts`
15. `services/network-service/src/v2/recruiter-candidates/service.ts`
16. `services/network-service/src/v2/reputation/types.ts`
17. `services/network-service/src/v2/reputation/repository.ts`
18. `services/network-service/src/v2/reputation/service.ts`
19. `services/network-service/src/v2/proposals/types.ts`
20. `services/network-service/src/v2/proposals/repository.ts`
21. `services/network-service/src/v2/proposals/service.ts`
22. `services/network-service/src/v2/routes.ts`
23. Updated `services/network-service/src/index.ts`

### Billing Service (Complete)
1. `services/billing-service/src/v2/types.ts`
2. `services/billing-service/src/v2/shared/helpers.ts`
3. `services/billing-service/src/v2/shared/events.ts`
4. `services/billing-service/src/v2/plans/types.ts`
5. `services/billing-service/src/v2/plans/repository.ts`
6. `services/billing-service/src/v2/plans/service.ts`
7. `services/billing-service/src/v2/subscriptions/types.ts`
8. `services/billing-service/src/v2/subscriptions/repository.ts`
9. `services/billing-service/src/v2/subscriptions/service.ts`
10. `services/billing-service/src/v2/payouts/types.ts`
11. `services/billing-service/src/v2/payouts/repository.ts`
12. `services/billing-service/src/v2/payouts/service.ts`
13. `services/billing-service/src/v2/routes.ts`
14. Updated `services/billing-service/src/index.ts`

---

## Success Metrics

### Phase 1 (ATS) - Complete
- [x] All 25 ATS V2 routes registered
- [x] All services follow standardized pattern
- [x] All CRUD operations in single repository files
- [x] Single update methods with smart validation
- [x] Direct Supabase queries only
- [x] Consistent response format
- [x] Role-based data scoping
- [x] Event publishing after operations

### Phase 2 (Network) - Complete
- [x] All 25 Network V2 routes registered
- [x] Dedicated repositories + services per domain with Supabase JOINs
- [x] Single update methods enforcing recruiter workflow rules
- [x] Event publisher wired into V2 routes
- [x] services/network-service/src/index.ts registers both legacy + V2 routes

### Phase 3 (Billing) - Complete
- [x] 15 V2 routes (plans, subscriptions, payouts)
- [x] Repository + services mirroring ATS/Network patterns
- [x] Dual registration alongside v1 until frontend migration completes

### Phase 4 (Gateway + Frontend) - Pending
- [ ] Register API Gateway proxies for all 65 V2 endpoints
- [ ] Frontend routes migrated to `/api/v2/*`
- [ ] V1 traffic monitored for safe deprecation
