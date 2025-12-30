# V2 Architecture Implementation Progress

**Date**: December 29, 2025  
**Status**: Phase 4 Complete - Document, Notification, and Automation Services migrated to V2

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
- Document Service: 5 V2 routes (documents uploads + lifecycle)
- Notification Service: 10 V2 routes (notifications + templates)
- Automation Service: 20 V2 routes (matches, fraud, rules, metrics)
- Total so far: 100 standardized V2 routes across 20 resources

---

## Completed: Phase 4 - Supporting Services (Document, Notification, Automation)

### Structure Created
```
services/document-service/src/v2/
|- shared/helpers.ts
|- shared/events.ts
|- types.ts
|- documents/
   |- repository.ts
   |- service.ts
|- routes.ts

services/notification-service/src/v2/
|- shared/helpers.ts
|- shared/events.ts
|- types.ts
|- notifications/
   |- repository.ts
   |- service.ts
|- templates/
   |- repository.ts
   |- service.ts
|- routes.ts

services/automation-service/src/v2/
|- shared/helpers.ts
|- shared/events.ts
|- types.ts
|- matches/
   |- repository.ts
   |- service.ts
|- fraud-signals/
   |- repository.ts
   |- service.ts
|- rules/
   |- repository.ts
   |- service.ts
|- metrics/
   |- repository.ts
   |- service.ts
|- routes.ts
```

### Features Implemented
- Standardized 5-route pattern applied to eight new resources (documents, notifications, templates, matches, fraud signals, automation rules, marketplace metrics)
- Multipart upload support + Supabase Storage integration for documents with signed URL responses
- Notification routes expose log management + template CRUD with event publishing hooks
- Automation service split into dedicated domains with Supabase-driven repositories and RabbitMQ events
- All three services now register both legacy and V2 routes for safe cutover

### API Endpoints Available
**Documents (5 routes)**  
`GET /v2/documents`, `GET /v2/documents/:id`, `POST /v2/documents`, `PATCH /v2/documents/:id`, `DELETE /v2/documents/:id`

**Notifications (5 routes)**  
`GET /v2/notifications`, `GET /v2/notifications/:id`, `POST /v2/notifications`, `PATCH /v2/notifications/:id`, `DELETE /v2/notifications/:id`

**Notification Templates (5 routes)**  
`GET /v2/templates`, `GET /v2/templates/:id`, `POST /v2/templates`, `PATCH /v2/templates/:id`, `DELETE /v2/templates/:id`

**Automation Matches (5 routes)**  
`GET /v2/matches`, `GET /v2/matches/:id`, `POST /v2/matches`, `PATCH /v2/matches/:id`, `DELETE /v2/matches/:id`

**Fraud Signals (5 routes)**  
`GET /v2/fraud-signals`, `GET /v2/fraud-signals/:id`, `POST /v2/fraud-signals`, `PATCH /v2/fraud-signals/:id`, `DELETE /v2/fraud-signals/:id`

**Automation Rules (5 routes)**  
`GET /v2/automation-rules`, `GET /v2/automation-rules/:id`, `POST /v2/automation-rules`, `PATCH /v2/automation-rules/:id`, `DELETE /v2/automation-rules/:id`

**Marketplace Metrics (5 routes)**  
`GET /v2/marketplace-metrics`, `GET /v2/marketplace-metrics/:id`, `POST /v2/marketplace-metrics`, `PATCH /v2/marketplace-metrics/:id`, `DELETE /v2/marketplace-metrics/:id`

---

## Remaining Work

### Phase 5: API Gateway V2 Routes (Estimated: 2 hours)
- [ ] Create services/api-gateway/src/routes/v2/routes.ts
- [ ] Register proxy routes for ATS, Network, Billing, Document, Notification, and Automation (100 routes)
- [ ] Apply requireRoles() middleware for each proxy
- [ ] Update api-gateway/src/index.ts to register both legacy and V2 proxies

### Phase 6: Frontend Migration + Testing & Cleanup (Estimated: 6-8 hours)
- [ ] Wire portal + candidate apps to `/api/v2/*` endpoints page-by-page
- [ ] Test all ATS V2 endpoints
- [ ] Test all Network V2 endpoints
- [ ] Test all Billing V2 endpoints
- [ ] Test new Document, Notification, and Automation V2 endpoints
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
1. Domain type modules under `services/ats-service/src/v2/<domain>/types.ts` (legacy `src/v2/types.ts` removed)
2. `services/ats-service/src/v2/helpers.ts`
3. `services/ats-service/src/v2/shared/helpers.ts`
4. `services/ats-service/src/v2/shared/events.ts`
5. `services/ats-service/src/v2/shared/pagination.ts`
6. Removed `services/ats-service/src/v2/repository.ts` in favor of per-domain repositories
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
1. Domain type modules under `services/network-service/src/v2/<domain>/types.ts` (legacy `src/v2/types.ts` removed)
2. `services/network-service/src/v2/helpers.ts`
3. Removed `services/network-service/src/v2/repository.ts` after splitting repositories per domain
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
1. Domain type modules under `services/billing-service/src/v2/{plans,subscriptions,payouts}/types.ts` (legacy `src/v2/types.ts` removed)
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

### Document Service (Complete)
1. Domain type modules under `services/document-service/src/v2/documents/types.ts` (legacy `src/v2/types.ts` removed)
2. `services/document-service/src/v2/shared/helpers.ts`
3. `services/document-service/src/v2/shared/events.ts`
4. `services/document-service/src/v2/documents/repository.ts`
5. `services/document-service/src/v2/documents/service.ts`
6. `services/document-service/src/v2/routes.ts`
7. Updated `services/document-service/src/index.ts`

### Notification Service (Complete)
1. Domain type modules under `services/notification-service/src/v2/{notifications,templates}/types.ts` (legacy `src/v2/types.ts` removed)
2. `services/notification-service/src/v2/shared/helpers.ts`
3. `services/notification-service/src/v2/shared/events.ts`
4. `services/notification-service/src/v2/notifications/repository.ts`
5. `services/notification-service/src/v2/notifications/service.ts`
6. `services/notification-service/src/v2/templates/repository.ts`
7. `services/notification-service/src/v2/templates/service.ts`
8. `services/notification-service/src/v2/routes.ts`
9. Updated `services/notification-service/src/index.ts`

### Automation Service (Complete)
1. Domain type modules under `services/automation-service/src/v2/{matches,fraud-signals,rules,metrics}/types.ts` (legacy `src/v2/types.ts` removed)
2. `services/automation-service/src/v2/shared/helpers.ts`
3. `services/automation-service/src/v2/shared/events.ts`
4. `services/automation-service/src/v2/matches/repository.ts`
5. `services/automation-service/src/v2/matches/service.ts`
6. `services/automation-service/src/v2/fraud-signals/repository.ts`
7. `services/automation-service/src/v2/fraud-signals/service.ts`
8. `services/automation-service/src/v2/rules/repository.ts`
9. `services/automation-service/src/v2/rules/service.ts`
10. `services/automation-service/src/v2/metrics/repository.ts`
11. `services/automation-service/src/v2/metrics/service.ts`
12. `services/automation-service/src/v2/routes.ts`
13. Updated `services/automation-service/src/index.ts`

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

### Phase 4 (Supporting Services) - Complete
- [x] Document service V2 structure with storage + event publisher
- [x] Notification service V2 routes for logs and templates
- [x] Automation service V2 routes for matches, fraud, rules, metrics
- [x] services/*/src/index.ts updated to register V1 + V2 side-by-side

### Phase 5 (API Gateway) - Pending
- [ ] Register API Gateway proxies for all 100 V2 endpoints
- [ ] Apply role requirements per proxy route
- [ ] Confirm gateway forwards user-context headers for RBAC

### Phase 6 (Frontend + Cleanup) - Pending
- [ ] Frontend routes migrated to `/api/v2/*`
- [ ] V1 traffic monitored for safe deprecation
- [ ] Side-by-side testing + documentation refresh
