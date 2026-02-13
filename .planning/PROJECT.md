# Splits Network Platform

## What This Is

A split-fee recruiting marketplace connecting recruiters, hiring companies, and candidates. The platform includes job management, candidate tracking, role-based access control, and global search across all entities.

## Core Value

Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements.

## Current Milestone: v5.0 Custom GPT (Applicant Network)

**Goal:** Build a Custom GPT backend that allows candidates to interact with Applicant.Network via natural language in ChatGPT — search jobs, analyze resumes, check application status, and submit applications.

**Target features:**
- New gpt-service microservice with GPT-specific API endpoints
- OAuth2 provider flow (backend issues scoped GPT tokens, Clerk handles identity)
- Job search via natural language
- Resume analysis (parsing and job fit scoring)
- Application status lookup
- Application submission with confirmation safety pattern
- OpenAPI 3.0 schema for GPT Actions
- GPT Instructions document

## Requirements

### Validated

<!-- From previous milestones -->

- Per-entity full-text search with tsvector columns on 7 tables — existing
- Unified search.search_index table with trigger-based sync — v2.0
- Real-time typeahead search bar in portal header — v2.0
- Role-based filtering via resolveAccessContext() — v2.0
- Keyboard navigation (Cmd/Ctrl+K) for global search — v2.0
- Org-scoped roles (company_admin, hiring_manager) via memberships table — existing
- Entity-linked roles (recruiter, candidate) via user_roles table — existing

<!-- v3.0 -->

- Nullable role_entity_id in user_roles for system-level roles — v3.0
- Platform_admin migrated from memberships to user_roles with atomic validation — v3.0
- Synthetic platform organization removed from database — v3.0
- resolveAccessContext reads platform_admin from user_roles (119+ consumers unchanged) — v3.0
- Identity-service accepts platform_admin with nullable entity fields via SYSTEM_ROLES — v3.0
- All 13 frontend isPlatformAdmin checks work without modification — v3.0
- Platform admin grant/revoke publishes enriched audit events via RabbitMQ — v3.0

<!-- v4.0 (schema + API complete, frontend pending) -->

- commute_types TEXT[] column on jobs table with CHECK constraint — v4.0
- job_level TEXT column on jobs table with CHECK constraint — v4.0
- TypeScript types for commute types and job levels in shared-types — v4.0
- ats-service CRUD and filtering support for commute_types and job_level — v4.0

### Active

<!-- v5.0 Custom GPT (Applicant Network) -->

- [ ] New gpt-service microservice following nano-service architecture
- [ ] OAuth2 provider endpoints (authorize, token, revoke) with Clerk identity
- [ ] GPT-scoped short-lived access tokens with per-user isolation
- [ ] Job search endpoint for GPT Actions (natural language query → structured results)
- [ ] Resume analysis endpoint (parse uploaded resume, score against job postings)
- [ ] Application status lookup endpoint
- [ ] Application submission endpoint with confirmation safety pattern
- [ ] OpenAPI 3.0 schema defining all GPT Actions
- [ ] GPT Instructions document for Custom GPT configuration

### Out of Scope

- Restructuring company_admin/hiring_manager roles — they're legitimately org-scoped, stay in memberships
- Fine-grained permissions system — future milestone
- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Splits.Network GPT features (recruiter search, candidate search, split opportunities) — future milestone
- Contract execution via GPT — too risky for v1
- Payment processing via GPT — too risky for v1
- Fully autonomous submissions — all writes require explicit confirmation
- GPT Store publishing — v5.0 builds the backend, store listing is a separate step

## Context

**GPT Actions architecture:**
- ChatGPT → Custom GPT → OpenAPI Action → gpt-service → existing services (ats-service, ai-service, document-service)
- gpt-service is an OAuth2 provider: GPT sends OAuth request → backend redirects to Clerk login → validates session → issues short-lived GPT access token
- Clerk = identity provider, backend = OAuth provider, GPT = OAuth client
- All write actions require `confirmed: true` flag, return `CONFIRMATION_REQUIRED` error if missing

**Existing guidance docs:**
- `docs/gpt/01_PRD_Custom_GPT.md` — Product requirements
- `docs/gpt/02_Architecture_Custom_GPT.md` — Architecture overview
- `docs/gpt/03_Technical_Specification.md` — Technical spec
- `docs/gpt/04_OpenAPI_Starter.yaml` — OpenAPI starter schema
- `docs/gpt/05_GPT_Instructions_Template.md` — GPT instructions template

**Key integration points:**
- `services/ats-service/` — Jobs, applications data
- `services/ai-service/` — AI-powered fit analysis
- `services/document-service/` — Resume file storage
- `packages/shared-access-context/` — resolveAccessContext for RBAC
- `services/api-gateway/` — Routes to domain services

## Constraints

- **Nano-service**: gpt-service is a dedicated microservice, routes through api-gateway
- **No direct DB queries for domain data**: gpt-service calls existing services' repositories or uses shared database access patterns
- **Write-action safety**: All mutations require confirmed flag — no exceptions
- **Token scoping**: GPT tokens are scoped to candidate actions only, not recruiter/admin
- **Rate limiting**: Per-user GPT-specific throttle policies
- **Tech stack**: Fastify, TypeScript, Supabase Postgres, existing V2 service patterns

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Nullable role_entity_id in user_roles | Platform admins don't link to an entity (recruiter/candidate). Nullable is simplest change. | ✓ Good |
| Only platform_admin moves | company_admin and hiring_manager are legitimately org-scoped. No reason to change them. | ✓ Good |
| Remove platform organization entirely | Clean break. No synthetic data in the system. | ✓ Good |
| Split partial unique indexes | Two indexes (entity-linked + platform_admin) to handle NULL values correctly in uniqueness constraints. | ✓ Good |
| Atomic migration validation | RAISE EXCEPTION in DO block aborts transaction on count mismatch. | ✓ Good |
| Minimal code change (EntityRoleRow nullable) | Existing deduplicated roles union already supports dual-read. One type change. | ✓ Good |
| SYSTEM_ROLES constant | Explicit array defining system-level roles. Extensible for future system roles. | ✓ Good |
| Event enrichment for audit | user_role.deleted event includes full context (user_id, role_name, role_entity_id). | ✓ Good |
| commute_types as TEXT[] array | Multi-select per job. Postgres arrays with @> filtering. | ✓ Good |
| Hybrid granularity: hybrid_1 through hybrid_4 | Full granularity (1-4 days in office) matches real job postings. | ✓ Good |
| job_level as TEXT with CHECK constraint | Single-select, 8 levels. Text with CHECK over enum for easier extension. | ✓ Good |
| Backend as OAuth provider for GPT | Full control over token scoping, GPT-specific permissions, clean revocation, multi-tenant awareness. Clerk handles identity only. | — Pending |
| New gpt-service microservice | Follows nano-service philosophy. Keeps GPT concerns isolated from domain services. | — Pending |
| Applicant.Network features first | Candidate-facing features are simpler, lower risk. Splits.Network recruiter features in future milestone. | — Pending |
| Confirmation safety pattern | All write actions require confirmed flag. Prevents AI misuse of write endpoints. | — Pending |

---
*Last updated: 2026-02-13 after v5.0 milestone started*
