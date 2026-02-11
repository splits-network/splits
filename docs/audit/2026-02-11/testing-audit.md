# Splits Network -- Comprehensive Testing Audit

**Date:** 2026-02-11
**Auditor:** Testing Agent (Claude Opus 4.6)
**Branch:** staging
**Framework:** Vitest

---

## Executive Summary

The Splits Network codebase has **239 test cases across 79 test files**, covering **11 of 14 backend services**. The testing foundation is solid -- tests follow consistent patterns for both unit (service layer) and integration (route layer) testing with proper mocking strategies. However, there are significant gaps:

- **3 services have zero tests**: document-service, document-processing-service, health-monitor
- **0 packages have tests**: All 9 shared packages are completely untested
- **0 frontend apps have tests**: portal, candidate, corporate have no test files
- **Repository layer is almost entirely untested** (only ai-service has repository tests)
- **Billing service is critically under-tested** -- only 3 of 10 billing domains have tests
- **Network service is missing tests** for 4 of 7 domains
- **API gateway covers only 2 of 16 route modules**

**Overall Test Maturity:** Early-stage. The patterns are excellent, but coverage breadth is insufficient for production confidence, especially in financial and access-control code paths.

---

## Test Inventory by Service

### 1. ATS Service (`services/ats-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| jobs | jobs.service.test.ts (4) | jobs.routes.test.ts (3) | 7 |
| candidates | candidates.service.test.ts (4) | candidates.routes.test.ts (3) | 7 |
| applications | applications.service.test.ts (7) | applications.routes.test.ts (4) | 11 |
| placements | placements.service.test.ts (3) | placements.routes.test.ts (2) | 5 |
| companies | companies.service.test.ts (2) | companies.routes.test.ts (2) | 4 |
| candidate-sourcers | candidate-sourcers.service.test.ts (2) | candidate-sourcers.routes.test.ts (2) | 4 |
| company-sourcers | company-sourcers.service.test.ts (2) | company-sourcers.routes.test.ts (2) | 4 |
| application-feedback | application-feedback.service.test.ts (2) | application-feedback.routes.test.ts (2) | 4 |
| job-pre-screen-answers | job-pre-screen-answers.service.test.ts (2) | job-pre-screen-answers.routes.test.ts (2) | 4 |
| job-pre-screen-questions | -- | job-pre-screen-questions.routes.test.ts (2) | 2 |
| job-requirements | -- | job-requirements.routes.test.ts (2) | 2 |
| **application-notes** | **MISSING** | **MISSING** | **0** |

**Total: 54 tests across 21 files**

**Gaps:**
- `application-notes` domain has no tests at all (service has validation logic, event publishing)
- `job-pre-screen-questions` has no unit test for service
- `job-requirements` has no unit test for service
- No repository tests for any domain
- Applications service test is the strongest with 11 tests covering stage transitions, role-based routing, AI review completion

---

### 2. Billing Service (`services/billing-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| company-billing | company-billing.service.test.ts (5) | company-billing.routes.test.ts (3) | 8 |
| stripe-connect | stripe-connect.service.test.ts (4) | stripe-connect.routes.test.ts (2) | 6 |
| payouts | payouts.service.test.ts (3) | -- | 3 |
| **subscriptions** | **MISSING** | **MISSING** | **0** |
| **plans** | **MISSING** | **MISSING** | **0** |
| **placement-invoices** | **MISSING** | **MISSING** | **0** |
| **escrow-holds** | **MISSING** | **MISSING** | **0** |
| **discounts** | **MISSING** | **MISSING** | **0** |
| **payout-schedules** | **MISSING** | **MISSING** | **0** |
| **placement-snapshot** | **MISSING** | **MISSING** | **0** |

**Total: 17 tests across 5 files**

**Gaps (CRITICAL):**
- **7 of 10 billing domains have no tests at all**
- `subscriptions` service has Stripe integration (create subscriptions, setup intents, invoicing) -- no tests
- `placement-invoices` service handles Stripe invoice creation and payment method charging -- no tests
- `escrow-holds` service manages financial escrow -- no tests
- `payouts` has no route test
- Missing tests for the Stripe webhook handler
- The `plans` service (pricing/plan management) has no tests

---

### 3. Network Service (`services/network-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| recruiters | recruiters.service.test.ts (8) | recruiters.routes.test.ts (4) | 12 |
| assignments | assignments.service.test.ts (5) | assignments.routes.test.ts (3) | 8 |
| recruiter-candidates | recruiter-candidates.service.test.ts (7) | recruiter-candidates.routes.test.ts (4) | 11 |
| **proposals** | **MISSING** | **MISSING** | **0** |
| **reputation** | **MISSING** | **MISSING** | **0** |
| **company-invitations** | **MISSING** | **MISSING** | **0** |
| **recruiter-companies** | **MISSING** | **MISSING** | **0** |

**Total: 31 tests across 6 files**

**Gaps:**
- `proposals` service (candidate proposal workflow with state machine) -- no tests
- `reputation` service (recruiter scoring) -- no tests
- `company-invitations` service (recruiter-to-company invitations with token-based acceptance) -- no tests
- `recruiter-companies` service -- no tests

---

### 4. Identity Service (`services/identity-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| users | users.service.test.ts (5) | users.routes.test.ts (3) | 8 |
| memberships | memberships.service.test.ts (2) | memberships.routes.test.ts (2) | 4 |
| invitations | invitations.service.test.ts (3) | invitations.routes.test.ts (2) | 5 |

**Total: 17 tests across 6 files**

**Assessment:** Reasonable coverage for 3 domains. User sync, registration, and invitation acceptance flows are tested. Missing edge cases around expired invitations, email mismatch on acceptance, and organization-scoped filtering.

---

### 5. AI Service (`services/ai-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| ai-reviews (service) | ai-review-service.test.ts (3) | ai-reviews.routes.test.ts (3) | 6 |
| ai-reviews (prompts) | ai-review-service.prompt.test.ts (3) | ai-reviews.list.test.ts (2) | 5 |
| ai-reviews (OpenAI) | ai-review-service.openai.test.ts (2) | ai-reviews.create.test.ts (4) | 6 |
| ai-reviews (repository) | ai-review-repository.test.ts (5) | ai-reviews.get-by-id.test.ts (1) | 6 |
| ai-reviews (stats) | ai-review-repository.stats.test.ts (2) | ai-reviews.stats.test.ts (3) | 5 |
| domain-consumer | domain-consumer.test.ts (4) | -- | 4 |

**Total: 32 tests across 11 files**

**Assessment:** This is the **best-tested service** in the codebase. It has repository-level tests (the only service that does), prompt validation tests, OpenAI integration mocking, domain event consumer tests, and comprehensive route tests split by operation. This should be the reference standard for other services.

---

### 6. Chat Service (`services/chat-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| chat (service) | chat-service.test.ts (11) | chat-conversations.routes.test.ts (4) | 15 |
| chat (repository) | chat-repository.representation.test.ts (4) | chat-presence.routes.test.ts (3) | 7 |

**Total: 22 tests across 4 files**

**Assessment:** Strong unit tests covering request states, blocking, read receipts, conversation creation/routing, and system messages. Route tests cover conversations and presence. Missing tests for moderation, reporting, and attachment flows.

---

### 7. Chat Gateway (`services/chat-gateway`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| auth | auth.test.ts (2) | handlers.test.ts (3) | 5 |
| presence | presence.test.ts (1) | -- | 1 |
| identity | identity.test.ts (2) | -- | 2 |

**Total: 8 tests across 4 files**

**Assessment:** Minimal but covers core auth verification, typing events, conversation authorization. Missing WebSocket lifecycle tests.

---

### 8. Analytics Service (`services/analytics-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| stats | stats.service.test.ts (2) | stats.routes.test.ts (2) | 4 |
| charts | charts.service.test.ts (2) | charts.routes.test.ts (2) | 4 |
| marketplace-metrics | marketplace-metrics.service.test.ts (2) | marketplace-metrics.routes.test.ts (2) | 4 |
| proposal-stats | proposal-stats.service.test.ts (2) | proposal-stats.routes.test.ts (2) | 4 |

**Total: 16 tests across 8 files**

**Assessment:** Each domain has exactly 2 unit tests and 2 route tests -- likely generated from a template. Tests only cover admin access rejection and a single happy path. No edge case coverage.

---

### 9. Automation Service (`services/automation-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| fraud-signals | fraud-signals.service.test.ts (2) | fraud-signals.routes.test.ts (2) | 4 |
| matches | matches.service.test.ts (2) | matches.routes.test.ts (2) | 4 |
| metrics | metrics.service.test.ts (2) | metrics.routes.test.ts (2) | 4 |
| rules | rules.service.test.ts (2) | rules.routes.test.ts (2) | 4 |

**Total: 16 tests across 8 files**

**Assessment:** Same template-driven pattern as analytics. Exactly 2 tests per file: admin check + create happy path. Missing: rule evaluation logic, fraud signal severity escalation, match scoring validation.

---

### 10. Notification Service (`services/notification-service`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| notifications | notifications.service.test.ts (9) | notifications.routes.test.ts (8) | 17 |

**Total: 17 tests across 2 files**

**Assessment:** Well-tested for a single-domain service. Covers access scoping, admin vs user permissions, event publishing, dismissal, read receipts, and unread counts. Route tests cover all major endpoints. Missing: email delivery integration, template rendering.

---

### 11. API Gateway (`services/api-gateway`)

| Domain | Unit Test | Route Test | Test Count |
|--------|-----------|------------|------------|
| common | common.test.ts (2) | -- | 2 |
| auth-headers | auth-headers.test.ts (3) | -- | 3 |
| service-client | service-client.test.ts (2) | -- | 2 |
| analytics routes | -- | analytics.routes.test.ts (1) | 1 |
| identity routes | -- | identity.routes.test.ts (1) | 1 |

**Total: 9 tests across 5 files**

**Gaps (HIGH PRIORITY):**
- 14 of 16 route modules have no tests: ats, billing, network, chat, documents, presence, notification, automation, roles, status, system-health, site-notifications
- The gateway is the single entry point for all frontend requests -- proxy behavior, error handling, and auth forwarding are minimally tested

---

### 12. Document Service (`services/document-service`) -- NO TESTS

**Source files:**
- `g:\code\splits.network\services\document-service\src\v2\documents\service.ts` -- File validation, upload, signed URL generation, profile image management, primary resume logic
- `g:\code\splits.network\services\document-service\src\v2\documents\repository.ts` -- RBAC-heavy access control (canAccessEntity, canAccessDocument, canModifyEntity)
- `g:\code\splits.network\services\document-service\src\v2\documents\routes.ts` -- Multipart upload routes, CRUD endpoints
- `g:\code\splits.network\services\document-service\src\storage.ts` -- Supabase Storage client

**Critical untested logic:**
- File type validation and MIME type detection
- File size limits enforcement
- Role-based document access control (complex logic in repository)
- Profile image upload/cleanup
- Primary resume management (clearing other primaries)
- Signed URL generation
- No `vitest.config.ts` exists for this service

---

### 13. Document Processing Service (`services/document-processing-service`) -- NO TESTS

**Source files:**
- `g:\code\splits.network\services\document-processing-service\src\v2\documents\service.ts` -- Status transition validation, text extraction size limits
- `g:\code\splits.network\services\document-processing-service\src\processors\text-extractor.ts` -- PDF/document text extraction
- `g:\code\splits.network\services\document-processing-service\src\domain-consumer.ts` -- Event consumer for document processing
- `g:\code\splits.network\services\document-processing-service\src\v2\documents\repository.ts`

**Critical untested logic:**
- Processing status state machine (pending -> processing -> processed/failed)
- Text extraction size validation (1MB limit)
- System-level update paths (bypassing access context)
- Domain event consumer (triggers on `document.uploaded` events)
- Has `vitest.config.ts` in `package.json` ("test": "vitest") but no config file

---

### 14. Health Monitor (`services/health-monitor`) -- NO TESTS

**Source files:**
- `g:\code\splits.network\services\health-monitor\src\sliding-window.ts` -- Sliding window health evaluation (pure logic, highly testable)
- `g:\code\splits.network\services\health-monitor\src\incident-manager.ts` -- Incident lifecycle management (open/resolve/escalate)
- `g:\code\splits.network\services\health-monitor\src\notification-manager.ts` -- Alert notifications
- `g:\code\splits.network\services\health-monitor\src\health-checker.ts` -- Service health checks
- `g:\code\splits.network\services\health-monitor\src\monitor-loop.ts` -- Orchestration loop

**Critical untested logic:**
- Sliding window failure threshold logic (WINDOW_SIZE=5, FAILURE_THRESHOLD=3)
- Status transition detection (healthy -> degraded -> unhealthy)
- Incident database lifecycle
- Has "test": "vitest" in package.json but no vitest.config.ts

---

## Shared Packages -- ZERO TESTS

| Package | Source Files | Critical Logic | Priority |
|---------|-------------|----------------|----------|
| `shared-access-context` | 1 file (145 lines) | AccessContextResolver, role resolution from Supabase joins, recruiter/candidate detection | **CRITICAL** |
| `shared-job-queue` | 1 file (320 lines) | RabbitMQ job queue, retry logic with exponential backoff, dead letter queue | HIGH |
| `shared-fastify` | 4 files | Error handling, health endpoints, server setup | MEDIUM |
| `shared-clients` | 5 files | HTTP clients for inter-service communication | MEDIUM |
| `shared-api-client` | 1 file | Frontend API client | MEDIUM |
| `shared-config` | Config loader | Environment variable loading | LOW |
| `shared-logging` | Logger utilities | Logging wrappers | LOW |
| `shared-types` | Type definitions | TypeScript types only | N/A |
| `shared-ui` | UI components | React components | MEDIUM |

**Most critical gap:** `shared-access-context` is imported by nearly every service and determines all role-based access control. A bug here affects the entire platform. It has complex logic for handling both array and single-object Supabase responses for recruiters/candidates and needs unit tests.

---

## Frontend Apps -- ZERO TESTS

| App | Technology | Priority |
|-----|-----------|----------|
| `apps/portal` | Next.js 16, React 19, App Router | HIGH |
| `apps/candidate` | Next.js, Clerk auth | MEDIUM |
| `apps/corporate` | Marketing site | LOW |

No test files, no test configurations, no test utilities exist in any app directory. No component tests, no hook tests, no integration tests.

---

## Test Quality Assessment

### Strengths

1. **Consistent patterns**: All tests follow the same import structure (`describe/it/expect/vi/beforeEach`), mock setup, and file organization.
2. **Meaningful assertions**: Tests verify specific error messages, status codes, event publishing payloads, and correct parameter passing -- not just "it doesn't throw."
3. **Access control testing**: Tests consistently verify role-based access rejection (admin-only routes, user scoping).
4. **Status machine validation**: Jobs, applications, placements, assignments, and recruiters all have tests for invalid state transitions.
5. **Event publishing verification**: Most unit tests confirm that domain events are published with correct payloads after mutations.
6. **Good mocking strategy**: Services mock repositories, routes mock services -- proper isolation between layers.
7. **Stripe mock pattern**: Billing tests use `vi.hoisted()` for the Stripe mock, which is the correct Vitest pattern for module-level mocks.

### Weaknesses

1. **Template-driven minimal tests**: Analytics and automation services each have exactly 2 tests per file (admin rejection + happy path create), suggesting batch generation without follow-up enrichment.
2. **No error path testing in routes**: Most route tests only verify 1-2 successful paths and the auth check. Missing: malformed body handling, service error propagation, 404 vs 500 distinction.
3. **No repository layer tests**: Except for ai-service, no service tests its repository. This means SQL query construction, pagination math, and Supabase query chaining are entirely untested.
4. **No concurrency/race condition tests**: The chat service has complex participant state management but no tests for simultaneous message sends or read receipt races.
5. **Inconsistent `beforeEach` usage**: Some tests use `vi.resetAllMocks()`, others use `vi.restoreAllMocks()`. This can lead to mock leakage between tests.
6. **Some tests verify implementation rather than behavior**: A few tests check that specific internal methods were called rather than verifying the observable outcome.

---

## Test Configuration Assessment

All 11 tested services share an identical `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/unit/**/*.test.ts', 'tests/impl/**/*.test.ts'],
        exclude: ['node_modules', 'dist'],
        testTimeout: 30000,
        hookTimeout: 30000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
```

**Observations:**
- 30-second timeout is generous but appropriate given Supabase mock complexity
- `globals: true` means `describe/it/expect` are available without imports, but all files import them explicitly anyway (good practice)
- No coverage thresholds configured
- No setup files for global mocks
- No test reporter configuration (defaults to Vitest's terminal reporter)
- Missing services (`document-service`, `document-processing-service`, `health-monitor`) need this config file added

---

## Critical Gaps -- Risk Assessment

### CRITICAL (financial/security risk, must fix)

1. **Billing: subscriptions, placement-invoices, escrow-holds** -- These handle real money through Stripe. Invoice creation, payment charging, and escrow management have zero tests. A bug could overcharge customers or fail to pay recruiters.

2. **shared-access-context** -- This 145-line module determines WHO CAN DO WHAT across the entire platform. It handles edge cases for Supabase returning arrays vs single objects and drives all RBAC. Zero tests.

3. **Document service access control** -- The repository has ~170 lines of access control logic (`canAccessEntity`, `canAccessDocument`, `canModifyEntity`) with nested Supabase queries. A bug here could expose confidential candidate resumes to unauthorized users. Zero tests.

### HIGH (business logic risk)

4. **Network: proposals** -- The proposal workflow (submit/accept/reject/withdraw) is a core marketplace flow with state machine logic. Zero tests.

5. **API gateway route modules** -- 14 of 16 gateway routes are untested. The gateway handles auth forwarding, error transformation, and request proxying. Bugs here break the entire frontend.

6. **Billing: payouts route test** -- Payouts service has unit tests but no route test. The payout calculation logic (`calculatePlatformRemainder`) is tested, but the HTTP API for triggering payouts is not.

7. **Network: company-invitations** -- Token-based invitation acceptance with organization membership creation is entirely untested.

### MEDIUM (data integrity risk)

8. **ATS: application-notes** -- Has validation logic and event publishing but no tests.

9. **Health monitor: sliding-window** -- Pure algorithmic logic (failure thresholds, status aggregation) that would be trivial to test and is currently untested.

10. **Document processing: text extraction pipeline** -- The domain consumer and processing status state machine are untested.

11. **All repository layers** -- Only ai-service tests its repository. Supabase query construction, pagination offset calculations, and filter application are untested across all services.

### LOW (operational risk)

12. **Frontend apps** -- No component or integration tests for portal, candidate, or corporate apps.

13. **Shared packages (shared-fastify, shared-clients, shared-job-queue)** -- Utility code used across services but untested.

---

## Recommended Testing Priorities

### Phase 1: Critical Financial and Security (1-2 weeks)

| Priority | Target | Type | Estimated Tests |
|----------|--------|------|----------------|
| P0 | `packages/shared-access-context` | Unit | 10-15 |
| P0 | `services/billing-service/subscriptions` | Unit + Route | 12-15 |
| P0 | `services/billing-service/placement-invoices` | Unit + Route | 10-12 |
| P0 | `services/billing-service/escrow-holds` | Unit + Route | 8-10 |
| P0 | `services/document-service` (service + repository access control) | Unit + Route | 15-20 |
| P1 | `services/billing-service/payouts` routes | Route | 3-5 |
| P1 | `services/billing-service/plans` | Unit + Route | 6-8 |

### Phase 2: Core Business Logic (2-3 weeks)

| Priority | Target | Type | Estimated Tests |
|----------|--------|------|----------------|
| P1 | `services/network-service/proposals` | Unit + Route | 10-12 |
| P1 | `services/network-service/company-invitations` | Unit + Route | 8-10 |
| P1 | `services/network-service/reputation` | Unit + Route | 6-8 |
| P1 | `services/network-service/recruiter-companies` | Unit + Route | 6-8 |
| P1 | `services/api-gateway` (remaining 14 route modules) | Route | 20-30 |
| P2 | `services/ats-service/application-notes` | Unit + Route | 6-8 |
| P2 | `services/document-processing-service` | Unit | 8-10 |
| P2 | `services/health-monitor` | Unit | 10-12 |

### Phase 3: Depth and Repository Coverage (3-4 weeks)

| Priority | Target | Type | Estimated Tests |
|----------|--------|------|----------------|
| P2 | Repository tests for all ATS domains | Unit | 30-40 |
| P2 | Repository tests for billing domains | Unit | 15-20 |
| P2 | Repository tests for network domains | Unit | 10-15 |
| P2 | `packages/shared-job-queue` | Unit | 8-10 |
| P2 | `packages/shared-fastify` | Unit | 5-8 |
| P3 | Enrich analytics/automation tests beyond 2-per-file | Unit | 20-30 |
| P3 | Error path testing in all route tests | Route | 30-40 |

### Phase 4: Frontend and E2E (ongoing)

| Priority | Target | Type | Estimated Tests |
|----------|--------|------|----------------|
| P3 | `apps/portal` -- core hooks and components | Unit/Component | 30-50 |
| P3 | `packages/shared-ui` -- loading components | Component | 10-15 |
| P4 | E2E critical paths (login, apply, place, payout) | E2E | 10-15 |

---

## Specific Files Needing Tests

### Must-have (P0)

- `g:\code\splits.network\packages\shared-access-context\src\index.ts`
- `g:\code\splits.network\services\billing-service\src\v2\subscriptions\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\subscriptions\routes.ts`
- `g:\code\splits.network\services\billing-service\src\v2\placement-invoices\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\placement-invoices\routes.ts`
- `g:\code\splits.network\services\billing-service\src\v2\escrow-holds\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\escrow-holds\routes.ts`
- `g:\code\splits.network\services\document-service\src\v2\documents\service.ts`
- `g:\code\splits.network\services\document-service\src\v2\documents\repository.ts`
- `g:\code\splits.network\services\document-service\src\v2\documents\routes.ts`

### High priority (P1)

- `g:\code\splits.network\services\billing-service\src\v2\plans\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\plans\routes.ts`
- `g:\code\splits.network\services\billing-service\src\v2\discounts\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\payout-schedules\service.ts`
- `g:\code\splits.network\services\billing-service\src\v2\placement-snapshot\service.ts`
- `g:\code\splits.network\services\network-service\src\v2\proposals\service.ts`
- `g:\code\splits.network\services\network-service\src\v2\proposals\routes.ts`
- `g:\code\splits.network\services\network-service\src\v2\company-invitations\service.ts`
- `g:\code\splits.network\services\network-service\src\v2\company-invitations\routes.ts`
- `g:\code\splits.network\services\network-service\src\v2\reputation\service.ts`
- `g:\code\splits.network\services\network-service\src\v2\recruiter-companies\service.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\ats.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\billing.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\network.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\documents.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\chat.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\notification.ts`
- `g:\code\splits.network\services\api-gateway\src\routes\v2\automation.ts`

### Medium priority (P2)

- `g:\code\splits.network\services\ats-service\src\v2\application-notes\service.ts`
- `g:\code\splits.network\services\ats-service\src\v2\application-notes\routes.ts`
- `g:\code\splits.network\services\document-processing-service\src\v2\documents\service.ts`
- `g:\code\splits.network\services\document-processing-service\src\domain-consumer.ts`
- `g:\code\splits.network\services\health-monitor\src\sliding-window.ts`
- `g:\code\splits.network\services\health-monitor\src\incident-manager.ts`
- `g:\code\splits.network\packages\shared-job-queue\src\index.ts`
- `g:\code\splits.network\packages\shared-fastify\src\errors.ts`
- `g:\code\splits.network\packages\shared-clients\src\base-client.ts`

---

## Configuration Actions Needed

1. **Create `vitest.config.ts`** for: `document-service`, `document-processing-service`, `health-monitor`
2. **Create `tests/unit/` and `tests/impl/` directories** for the 3 untested services
3. **Add coverage configuration** to all vitest configs:
   ```typescript
   coverage: {
       provider: 'v8',
       reporter: ['text', 'lcov'],
       thresholds: {
           statements: 60,
           branches: 50,
           functions: 60,
           lines: 60,
       },
   },
   ```
4. **Add vitest.config.ts** to shared packages that need tests (`shared-access-context`, `shared-job-queue`, `shared-fastify`, `shared-clients`)
5. **Consider a global test setup file** for commonly mocked dependencies (Supabase client, AccessContextResolver, EventPublisher)

---

## Test Count Summary

| Category | Files | Test Cases |
|----------|-------|------------|
| ATS Service | 21 | 54 |
| AI Service | 11 | 32 |
| Network Service | 6 | 31 |
| Chat Service | 4 | 22 |
| Billing Service | 5 | 17 |
| Identity Service | 6 | 17 |
| Notification Service | 2 | 17 |
| Analytics Service | 8 | 16 |
| Automation Service | 8 | 16 |
| API Gateway | 5 | 9 |
| Chat Gateway | 4 | 8 |
| **Document Service** | **0** | **0** |
| **Doc Processing Service** | **0** | **0** |
| **Health Monitor** | **0** | **0** |
| **All 9 Shared Packages** | **0** | **0** |
| **All 3 Frontend Apps** | **0** | **0** |
| **TOTAL** | **79** | **239** |

---

*End of audit.*
