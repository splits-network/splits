# Splits Network Platform

## What This Is

A split-fee recruiting marketplace connecting recruiters, hiring companies, and candidates. The platform includes job management, candidate tracking, role-based access control, global search across all entities, and a Custom GPT backend enabling candidates to interact with Applicant.Network via natural language in ChatGPT.

## Core Value

Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements.

## Current State

v5.0 Custom GPT (Applicant Network) shipped. All candidate-facing GPT features implemented.

## Current Milestone: v6.0 Admin App Extraction

**Goal:** Extract platform administration from portal into a dedicated admin app and admin gateway, reducing complexity in both the portal and api-gateway.

**Target features:**
- Dedicated `apps/admin/` Next.js app with its own Clerk instance
- Dedicated `services/admin-gateway/` Fastify service for admin-only API routes
- Shared hooks/utilities extracted into packages (use-standard-list, api-client, toast)
- All 30 admin routes moved from portal to admin app
- Admin-specific gateway routes moved from api-gateway to admin-gateway
- Portal and api-gateway cleaned up after extraction

## Requirements

### Validated

<!-- v2.0 -->

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

<!-- v4.0 -->

- commute_types TEXT[] column on jobs table with CHECK constraint — v4.0
- job_level TEXT column on jobs table with CHECK constraint — v4.0
- TypeScript types for commute types and job levels in shared-types — v4.0
- ats-service CRUD and filtering support for commute_types and job_level — v4.0
- Job create/edit form with commute type checkboxes and job level dropdown — v4.0
- Job detail view displaying commute types and job level with human-readable labels — v4.0
- Job list filtering by commute type and job level — v4.0
- Search index includes commute_types and job_level for full-text matching — v4.0

<!-- v5.0 -->

- New gpt-service microservice following nano-service architecture — v5.0
- OAuth2 provider endpoints (authorize, token, revoke) with Clerk identity — v5.0
- GPT-scoped short-lived access tokens with per-user isolation — v5.0
- Job search endpoint for GPT Actions (natural language query to structured results) — v5.0
- Resume analysis endpoint (parse uploaded resume, score against job postings) — v5.0
- Application status lookup endpoint — v5.0
- Application submission endpoint with confirmation safety pattern — v5.0
- OpenAPI 3.0.1 schema defining all GPT Actions — v5.0
- GPT Instructions document for Custom GPT configuration — v5.0

### Active

- [ ] Dedicated admin Next.js app (`apps/admin/`) with independent Clerk auth
- [ ] Dedicated admin gateway (`services/admin-gateway/`) for admin-only API routes
- [ ] Shared frontend packages for hooks/utilities used by both portal and admin
- [ ] All admin pages extracted from portal to admin app
- [ ] Admin gateway routes extracted from api-gateway
- [ ] Portal and api-gateway simplified after extraction

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

**Current codebase:**
- Tech stack: Fastify, TypeScript, Supabase Postgres, Next.js 16, jose (ES256 JWT), svix (webhook verification)
- 16 microservices including gpt-service
- Portal admin: 59 files, ~15k lines, 30 routes across 8 sections
- Api-gateway: 22 v2 route files, 6.6k lines, 530-line index.ts

**Key integration points for v6.0:**
- `apps/portal/src/app/portal/admin/` — Admin feature to extract (59 files)
- `services/api-gateway/src/routes/v2/` — Route files to split (admin vs user)
- `packages/shared-ui/` — Existing shared UI components
- `packages/shared-access-context/` — resolveAccessContext for RBAC
- `@/hooks/use-standard-list` — Portal hook to extract to shared package
- `@/lib/api-client` — Portal utility to extract to shared package
- `@/lib/toast-context` — Portal utility to extract to shared package

## Constraints

- **Nano-service**: Each service focused on one purpose, routes through api-gateway
- **No direct DB queries for domain data**: gpt-service uses shared database access patterns
- **Write-action safety**: All GPT mutations require confirmed flag — no exceptions
- **Token scoping**: GPT tokens are scoped to candidate actions only, not recruiter/admin
- **Rate limiting**: Per-user GPT-specific throttle policies (30 reads/min, 10 writes/min)
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
| Backend as OAuth provider for GPT | Full control over token scoping, GPT-specific permissions, clean revocation, multi-tenant awareness. Clerk handles identity only. | ✓ Good |
| New gpt-service microservice | Follows nano-service philosophy. Keeps GPT concerns isolated from domain services. | ✓ Good |
| Applicant.Network features first | Candidate-facing features are simpler, lower risk. Splits.Network recruiter features in future milestone. | ✓ Good |
| Confirmation safety pattern | All write actions require confirmed flag. Prevents AI misuse of write endpoints. | ✓ Good |
| ES256 asymmetric JWT signing | More secure than symmetric (HS256). jose library is ESM-compatible with native ES256 support. | ✓ Good |
| PKCE with SHA-256 | Required for public clients (GPT). Prevents authorization code interception attacks. | ✓ Good |
| Token rotation with replay detection | Rotated token usage revokes ALL sessions — security-first approach indicates compromise. | ✓ Good |
| OpenAPI 3.0.1 (not 3.1) | GPT Builder only supports 3.0.x. Avoids compatibility issues. | ✓ Good |
| Dual-auth pattern | GPT Bearer tokens for ChatGPT, x-gpt-clerk-user-id header for candidate profile page. Both supported. | ✓ Good |
| In-memory confirmation token store | 15-min TTL, tokens regenerated easily. Simple for MVP, migrate to Redis if needed later. | ✓ Good |

| Separate admin app from portal | Admin is a different persona with different workflows. 59 files, 15k lines is a full app. Reduces portal complexity. | — Pending |
| Separate admin gateway | Api-gateway is 6.6k lines across 22 route files. Admin routes have different auth model (is_platform_admin). Reduces gateway complexity. | — Pending |
| User handles Clerk instance | New Clerk app for admin. User will configure. | — Pending |

---
*Last updated: 2026-02-27 after v6.0 milestone started*
