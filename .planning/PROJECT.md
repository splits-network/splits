# Splits Network Platform

## What This Is

A split-fee recruiting marketplace connecting recruiters, hiring companies, and candidates. The platform includes job management, candidate tracking, role-based access control, global search across all entities, a Custom GPT backend enabling candidates to interact with Applicant.Network via natural language in ChatGPT, and a dedicated admin app for platform administration.

## Core Value

Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements.

## Current State

v7.0 Company Profile Enhancement shipped. v8.0 Company Experience Enhancement shelved (requirements defined but not executed — see REQUIREMENTS-v8.md if resuming).

## Current Milestone: v9.0 Video Interviewing

**Goal:** Add in-app video interviewing powered by self-hosted LiveKit — schedule, conduct, record, transcribe, and AI-summarize interviews directly within the recruiting workflow.

**Target features:**
- LiveKit self-hosted on K8s with new `video-service` microservice for room management
- 1:1 and panel interviews (multi-party support)
- Candidate join via magic link (no account needed) or through candidate app (logged-in)
- Scheduling: stage-triggered prompts, standalone "Schedule Interview" action, Google Calendar sync via combo provider
- Interview recording with LiveKit Egress, stored in object storage
- AI transcription and summary generation via existing ai-service pipeline
- AI summary auto-posted as application note AND available in dedicated interviews tab
- Video call UI: lobby, in-call controls, screen share
- Interview scheduling modal with calendar availability

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

<!-- v6.0 -->

- Dedicated admin Next.js app (apps/admin/) with independent Clerk auth — v6.0
- Dedicated admin gateway (services/admin-gateway/) for admin-only API routes — v6.0
- Shared frontend packages for hooks/utilities used by both portal and admin — v6.0
- All admin pages extracted from portal to admin app (30+ pages) — v6.0
- Admin gateway routes extracted from api-gateway — v6.0
- Portal and api-gateway simplified after extraction — v6.0

<!-- v7.0 -->

- Company profile enrichment with stage, founded year, tagline, social links — v7.0
- Perks and culture tags lookup tables with slug deduplication — v7.0
- Tech stack via company_skills junction to existing skills table — v7.0
- Company settings UI with BaselSkillPicker for lookups — v7.0
- Redesigned company cards matching Basel showcase editorial design — v7.0
- Computed open roles count and average salary from jobs table — v7.0
- Search index enriched with new company profile data — v7.0

### Active

- LiveKit self-hosted infrastructure on K8s with video-service microservice — v9.0
- Interview scheduling with stage triggers, standalone action, and Google Calendar sync — v9.0
- Video call UI with lobby, controls, screen share, 1:1 and panel support — v9.0
- Magic link join for candidates without accounts — v9.0
- Interview recording via LiveKit Egress with object storage — v9.0
- AI transcription and summary generation via ai-service — v9.0
- Dedicated interviews tab on applications/roles with recording playback — v9.0
- AI summary auto-posted as application note — v9.0

### Out of Scope

- Restructuring company_admin/hiring_manager roles — they're legitimately org-scoped, stay in memberships
- Fine-grained permissions system — future milestone
- Elasticsearch/external search engine — Postgres FTS is sufficient for current scale
- Splits.Network GPT features (recruiter search, candidate search, split opportunities) — future milestone
- Contract execution via GPT — too risky for v1
- Payment processing via GPT — too risky for v1
- Fully autonomous submissions — all writes require explicit confirmation
- GPT Store publishing — v5.0 builds the backend, store listing is a separate step
- v8.0 Company Experience Enhancement — shelved (invite to apply, role-aware tabs, top matches widget)

## Context

**Current codebase:**
- Tech stack: Fastify, TypeScript, Supabase Postgres, Next.js 16, jose (ES256 JWT), svix (webhook verification)
- 17 microservices including gpt-service and admin-gateway
- 4 apps: portal, candidate, corporate, admin
- Shared packages: shared-hooks, shared-charts, shared-ui, shared-types, shared-access-context, shared-config, shared-logging, shared-api-client
- Portal: recruiter/company-user focused (admin code removed)
- Api-gateway: user-facing traffic only (admin routes removed)
- Admin app: 30+ pages with real-time dashboard, WebSocket infrastructure
- Admin gateway: Clerk JWT auth, isPlatformAdmin enforcement, proxy to 13 domain services

**Known tech debt (from v6.0):**
- Content Navigation/Images pages show empty state (no backend endpoints)
- Intelligence pages use speculative endpoints (empty state fallback)
- No domain service publishes to admin:* Redis channels
- No platform_settings table (settings page loads defaults only)
- Network-service missing /admin/chart-data endpoint

## Constraints

- **Nano-service**: Each service focused on one purpose, routes through api-gateway (or admin-gateway for admin traffic)
- **No direct DB queries for domain data**: gpt-service uses shared database access patterns
- **Write-action safety**: All GPT mutations require confirmed flag — no exceptions
- **Token scoping**: GPT tokens are scoped to candidate actions only, not recruiter/admin
- **Rate limiting**: Per-user GPT-specific throttle policies (30 reads/min, 10 writes/min)
- **Tech stack**: Fastify, TypeScript, Supabase Postgres, existing V2 service patterns
- **Admin isolation**: Admin traffic routes through admin-gateway, never through api-gateway

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
| Separate admin app from portal | Admin is a different persona with different workflows. 59 files, 15k lines is a full app. Reduces portal complexity. | ✓ Good |
| Separate admin gateway | Api-gateway is 6.6k lines across 22 route files. Admin routes have different auth model (is_platform_admin). Reduces gateway complexity. | ✓ Good |
| User handles Clerk instance | New Clerk app for admin. User will configure. | ✓ Good |
| ECharts with DaisyUI theme bridge | getSplitsThemeOptions() merges DaisyUI oklch CSS vars into ECharts option objects. SVG renderer for retina. | ✓ Good |
| WebSocket with Redis pub/sub relay | Separate redisSub client via redis.duplicate(). Admin: prefix applied server-side for isolation. | ✓ Good |
| Admin routes under /admin/* in domain services | Clean separation from user-scoped /api/v2/* routes. Gateway rewritePrefix strips service prefix. | ✓ Good |
| useStandardList clientFactory option | Admin wrapper injects createAdminClient. No Clerk coupling in shared-hooks. | ✓ Good |

| LiveKit over Daily/Twilio/100ms | Self-hostable on existing K8s, open-source, full control over data and costs. Already running K8s so infra overhead is minimal. | — Pending |
| Tech stack reuses skills table | Tech stack items are the same domain as skills. Reusing avoids duplication and enables cross-entity matching (candidate skills vs company tech stack). | ✓ Good |
| Perks as new lookup table | Perks are a distinct domain from skills. Slug-deduplication pattern with BaselSkillPicker UI. | ✓ Good |
| Culture tags as new lookup table | Culture is open-ended enough to warrant a lookup. Remote-first, async-friendly, etc. | ✓ Good |
| Stage as constrained enum | Small, well-known set (Seed, Series A-C, Growth, Public, etc). CHECK constraint prevents inconsistency. | ✓ Good |
| Computed open roles and avg salary | Derived from jobs table at query time, not stored. Always accurate. | ✓ Good |

---
*Last updated: 2026-03-07 after v9.0 milestone started (v8.0 shelved)*
