# Roadmap: Splits Network

## Milestones

- v2.0 Global Search (Phases 1-3) -- shipped 2026-02-13
- v3.0 Platform Admin Restructure (Phases 4-7) -- shipped 2026-02-13
- v4.0 Commute Types & Job Levels (Phases 8-10) -- shipped 2026-02-13
- v5.0 Custom GPT / Applicant Network (Phases 11-15) -- in progress

## Phases

<details>
<summary>v2.0 Global Search (Phases 1-3) -- SHIPPED 2026-02-13</summary>

### Phase 1: Search Infrastructure
**Goal**: Unified search index with trigger-based sync across 7 entity types
**Plans**: 2 plans

Plans:
- [x] 01-01: Database schema and search index table
- [x] 01-02: Trigger-based sync from entity tables

### Phase 2: Search Service
**Goal**: Search microservice with typeahead and full search modes
**Plans**: 3 plans

Plans:
- [x] 02-01: Search service scaffold and health check
- [x] 02-02: Typeahead search endpoint
- [x] 02-03: Full search endpoint with pagination

### Phase 3: Search UI
**Goal**: Real-time typeahead search bar with keyboard navigation
**Plans**: 2 plans

Plans:
- [x] 03-01: Search bar component with typeahead
- [x] 03-02: Keyboard navigation and deep linking

</details>

<details>
<summary>v3.0 Platform Admin Restructure (Phases 4-7) -- SHIPPED 2026-02-13</summary>

### Phase 4: Schema Migration
**Goal**: Nullable role_entity_id and split partial unique indexes
**Plans**: 1 plan

Plans:
- [x] 04-01: Database migration for nullable role_entity_id

### Phase 5: Data Migration
**Goal**: Atomic platform admin migration from memberships to user_roles
**Plans**: 2 plans

Plans:
- [x] 05-01: Atomic data migration with validation gate
- [x] 05-02: resolveAccessContext dual-read support

### Phase 6: Code Alignment
**Goal**: Identity-service SYSTEM_ROLES and TypeScript type updates
**Plans**: 2 plans

Plans:
- [x] 06-01: SYSTEM_ROLES constant and identity-service validation
- [x] 06-02: Shared types and clients alignment

### Phase 7: Legacy Cleanup
**Goal**: Remove synthetic platform organization and legacy memberships
**Plans**: 1 plan

Plans:
- [x] 07-01: FK-safe cleanup migration

</details>

<details>
<summary>v4.0 Commute Types & Job Levels (Phases 8-10) -- SHIPPED 2026-02-13</summary>

### Phase 8: Schema & Types
**Goal**: Database columns and TypeScript types for commute types and job levels
**Plans**: 1 plan

Plans:
- [x] 08-01: Database migration and shared-types definitions

### Phase 9: Backend & Filtering
**Goal**: ATS service CRUD and filtering support for new fields
**Plans**: 2 plans

Plans:
- [x] 09-01: Repository and service layer updates
- [x] 09-02: Search index enrichment

### Phase 10: Portal UI
**Goal**: Job create/edit forms and detail views with new fields
**Plans**: 2 plans

Plans:
- [x] 10-01: Job form controls (checkboxes and dropdown)
- [x] 10-02: Job detail and list view display

</details>

---

## v5.0 Custom GPT / Applicant Network (In Progress)

**Milestone Goal:** Candidates interact with Applicant.Network via natural language through a Custom GPT in ChatGPT -- search jobs, analyze resumes, check application status, and submit applications.

**Phase Numbering:**
- Integer phases (11, 12, 13, ...): Planned milestone work
- Decimal phases (12.1, 12.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 11: Service Foundation** - gpt-service scaffold, database tables, environment configuration
- [x] **Phase 12: OAuth2 Provider** - OAuth2 authorization code flow, gateway integration, token validation
- [x] **Phase 13: GPT API Endpoints** - Job search, job details, application status, application submission, resume analysis
- [x] **Phase 14: OpenAPI Schema + GPT Configuration** - OpenAPI 3.0.1 schema, schema serving endpoint, GPT Instructions document
- [ ] **Phase 15: Production Hardening** - Kubernetes deployment, rate limiting, token cleanup, audit logging

### Phase 11: Service Foundation
**Goal**: gpt-service microservice exists with database tables and configuration, ready for OAuth and endpoint development
**Depends on**: Nothing (first phase of v5.0)
**Requirements**: INFRA-01, INFRA-02, INFRA-03
**Success Criteria** (what must be TRUE):
  1. gpt-service starts, passes health check, and responds on its configured port
  2. All 4 GPT database tables exist (gpt_authorization_codes, gpt_refresh_tokens, gpt_sessions, gpt_oauth_events) with correct schemas
  3. Environment variables for GPT OAuth (client ID, client secret, JWT secret, token expiry) are loaded and validated on startup
**Plans**: 3 plans

Plans:
- [x] 11-01-PLAN.md — Service scaffold, GPT config loader, health check, EventPublisher
- [x] 11-02-PLAN.md — Database migration with 4 GPT OAuth tables and indexes
- [x] 11-03-PLAN.md — Audit event consumer for end-to-end RabbitMQ flow

### Phase 12: OAuth2 Provider
**Goal**: Candidates can authenticate via Clerk through the GPT OAuth flow and receive scoped access tokens that gpt-service validates
**Depends on**: Phase 11
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07
**Success Criteria** (what must be TRUE):
  1. ChatGPT can initiate OAuth2 authorization code flow and user is redirected to Clerk login
  2. After Clerk authentication, authorization code is exchanged for access token + refresh token via token endpoint
  3. Expired access tokens can be refreshed via refresh token endpoint (with token rotation)
  4. Refresh tokens can be revoked, immediately preventing further token issuance
  5. api-gateway routes /api/v1/gpt/* requests to gpt-service, bypassing Clerk auth, and gpt-service validates its own opaque tokens extracting clerk_user_id
**Plans**: 6 plans

Plans:
- [x] 12-01-PLAN.md -- Schema migration (scopes columns) + shared-config ES256 update
- [x] 12-02-PLAN.md -- OAuth core service (TDD): auth code flow, PKCE, JWT ES256, token rotation, replay detection
- [x] 12-03-PLAN.md -- api-gateway GPT routing with Clerk auth bypass
- [x] 12-04-PLAN.md -- OAuth route handlers + JWT validation middleware in gpt-service
- [x] 12-05-PLAN.md -- Consent page, error page, success flash, learn-more page (candidate app)
- [x] 12-06-PLAN.md -- Connected Apps management on profile page + Clerk webhook handler

### Phase 13: GPT API Endpoints
**Goal**: GPT can search jobs, view job details, check application status, submit applications with confirmation safety, and analyze resume fit -- all with candidate-scoped data isolation
**Depends on**: Phase 12
**Requirements**: ENDP-01, ENDP-02, ENDP-03, ENDP-04, ENDP-05, ENDP-06, ENDP-07
**Success Criteria** (what must be TRUE):
  1. Job search returns GPT-formatted results filtered by keywords, location, commute type, and job level
  2. Job details endpoint returns comprehensive job info including requirements, pre-screen questions, and company details
  3. Application status endpoint returns the authenticated candidate's applications with human-readable status labels and job context
  4. Application submission returns CONFIRMATION_REQUIRED with summary on first call, and executes submission (with pre-screen answers) only when confirmed=true on second call
  5. Resume analysis endpoint parses candidate's existing resume and returns fit score against a specific job posting
**Plans**: 4 plans

Plans:
- [x] 13-01-PLAN.md — Foundation layer: types, repository, error helpers, confirmation token store
- [x] 13-02-PLAN.md — Read endpoints: job search, job details, application status
- [x] 13-03-PLAN.md — Write endpoint: application submission with confirmation safety pattern
- [x] 13-04-PLAN.md — Resume analysis endpoint with ai-service integration

### Phase 14: OpenAPI Schema + GPT Configuration
**Goal**: Complete OpenAPI schema and GPT Instructions document enable configuring a functional Custom GPT in OpenAI's GPT Builder
**Depends on**: Phase 13
**Requirements**: CONF-01, CONF-02, CONF-03, CONF-04
**Success Criteria** (what must be TRUE):
  1. OpenAPI 3.0.1 schema defines all GPT Actions with operationIds, parameter descriptions, response schemas, and OAuth2 security scheme
  2. Schema is served at /api/v1/gpt/openapi.yaml and is accepted by GPT Builder's schema validator
  3. GPT Instructions document covers all action scenarios, confirmation rules, error handling, and conversational patterns
  4. All write action operations are annotated with x-openai-isConsequential: true
**Plans**: 2 plans

Plans:
- [x] 14-01-PLAN.md — OpenAPI 3.0.1 schema file and serving endpoint
- [x] 14-02-PLAN.md — GPT Instructions document and Builder listing copy

### Phase 15: Production Hardening
**Goal**: gpt-service is production-ready with deployment infrastructure, rate limiting, token lifecycle management, and observability
**Depends on**: Phase 14
**Requirements**: HARD-01, HARD-02, HARD-03, HARD-04
**Success Criteria** (what must be TRUE):
  1. Kubernetes deployment manifest exists and gpt-service can be deployed to the cluster
  2. GPT-specific per-user rate limits are enforced in api-gateway, preventing abuse of expensive endpoints
  3. Token cleanup job automatically expires old authorization codes and revoked refresh tokens
  4. All GPT OAuth events and action executions are audit-logged via RabbitMQ events
**Plans**: 2 plans

Plans:
- [ ] 15-01-PLAN.md — Deployment hardening, token cleanup CronJob, Clerk webhook signature verification
- [ ] 15-02-PLAN.md — GPT-specific per-user tiered rate limiting in api-gateway

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14 -> 15

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Search Infrastructure | v2.0 | 2/2 | Complete | 2026-02-13 |
| 2. Search Service | v2.0 | 3/3 | Complete | 2026-02-13 |
| 3. Search UI | v2.0 | 2/2 | Complete | 2026-02-13 |
| 4. Schema Migration | v3.0 | 1/1 | Complete | 2026-02-13 |
| 5. Data Migration | v3.0 | 2/2 | Complete | 2026-02-13 |
| 6. Code Alignment | v3.0 | 2/2 | Complete | 2026-02-13 |
| 7. Legacy Cleanup | v3.0 | 1/1 | Complete | 2026-02-13 |
| 8. Schema & Types | v4.0 | 1/1 | Complete | 2026-02-13 |
| 9. Backend & Filtering | v4.0 | 2/2 | Complete | 2026-02-13 |
| 10. Portal UI | v4.0 | 2/2 | Complete | 2026-02-13 |
| 11. Service Foundation | v5.0 | 3/3 | Complete | 2026-02-13 |
| 12. OAuth2 Provider | v5.0 | 6/6 | Complete | 2026-02-13 |
| 13. GPT API Endpoints | v5.0 | 4/4 | Complete | 2026-02-13 |
| 14. OpenAPI Schema + GPT Configuration | v5.0 | 2/2 | Complete | 2026-02-13 |
| 15. Production Hardening | v5.0 | 0/2 | Not started | - |

---
*Roadmap created: 2026-02-12 (v2.0)*
*Last updated: 2026-02-13 (Phase 15 planned)*
