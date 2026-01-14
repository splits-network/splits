# AGENTS.md

*Document the knowledge and context used in this session so future agents stay in the know.*

# Further Context and Guidelines for V2 Services and Client Apps
The /docs/migrations/V2-ARCHITECTURE-IMPLEMENTATION_GUIDE.md outlines the high-level architecture for V2 services and clients. This document captures additional context, guidelines, and requirements to ensure consistency and proper functioning across the codebase.

## V2 Architecture Guardrails

- **No `/me` endpoints.** All V2 services expose the canonical REST resources (`/v2/candidates`, `/v2/recruiter-candidates`, etc.). Per-user access control lives in the repository/service layer via `resolveAccessContext`, so never add `/v2/.../me` or similar shortcuts.
- **Gateway/frontends never special-case “current user.”** Consumers fetch `/api/v2/<resource>` (often with `limit=1` or other filters) and let the backend filter based on the resolved access context.
- **Shared access context lives in `@splits-network/shared-access-context`.** Every service imports `resolveAccessContext` from that package; do not reach into `services/shared/access-context.ts`.
- **RBAC checks rely on the above.** For example, the gateway checks the `candidate` role by calling `/v2/candidates?limit=1`—changing that contract will break role detection.

## Recruiter-Candidate Responses

- The network service V2 repository enriches recruiter-candidate rows with recruiter metadata:
  - It gathers recruiter IDs, loads the corresponding `recruiters` plus linked `users`, and fills in `recruiter_name`, `recruiter_email`, `recruiter_bio`, and `recruiter_status` when missing.
  - As a result, frontends can expect these fields without additional joins.
- `/api/v2/recruiter-candidates` returns `{ data: RecruiterRelationship[], pagination: { ... } }`. Client code should read `response.data` before mapping.

## Candidate App Notes

- `apps/candidate/src/lib/api.ts#getMyRecruiters` now unwraps the `{ data }` envelope and maps enriched recruiter metadata. Do not revert back to the legacy array response shape.
- The profile page obtains the user’s candidate record via `/api/v2/candidates?limit=1`. Keep that contract so we never regress to `/api/candidates/me`.

## Portal App Requirements (next up)

- **Always call `/api/v2/*`.** When we migrate the portal pages, every data fetch must go through the V2 gateway routes (`/api/v2/jobs`, `/api/v2/recruiter-candidates`, `/api/v2/applications`, etc.). If a page still points at `/api/*` or `/api/<domain>/me`, update it to the V2 equivalent.
- **Handle `{ data, pagination }` responses.** Many V2 endpoints wrap results in this shape; portal components should destructure `const { data } = await client.get('/api/v2/<resource>')` before iterating.
- **No client-side role checks.** The backend enforces access via `resolveAccessContext`, so portal modules shouldn't attempt to hit "recruiter-only" variants (like `/api/recruiter-candidates/me`). Use the shared API helper and trust upstream scoping.
- **Reuse shared helpers.** If the portal needs recruiter metadata, rely on the enriched fields returned by `/api/v2/recruiter-candidates`-do not re-fetch `users` directly.

### Portal API Client Base URLs

- `apps/portal/src/lib/api-client.ts` now strips any trailing `/api`/`/api/v*` before appending `/api` or `/api/v2`. This keeps routes from turning into `/api/api/*` when environments set `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_API_GATEWAY_URL` to a path that already ends in `/api`.

### API Gateway Roles Route

- `services/api-gateway/src/routes/roles/routes.ts` must forward `buildAuthHeaders(request)` to ATS when calling `/companies` or `/jobs`; without the `x-clerk-user-id` header, ATS rejects the request and the portal recruiter dashboard sees 500s when loading top roles.

### Network Service V2 Proposals

- PostgREST cannot join across schemas, so `services/network-service/src/v2/proposals/repository.ts` now fetches jobs/candidates via follow-up queries in the `ats` schema and filters company users by precomputing accessible job IDs. Any new V2 repository must avoid `*` joins inside a `schema('public')` select to prevent `PGRST100` errors.
- The canonical proposals table lives at `candidate_role_assignments`. Remember to query that table (not a nonexistent `proposals`) whenever adding new V2 proposal endpoints or migrations.

### Notification APIs

- Portal and candidate apps now expose `/api/v2/notifications/*` Next.js proxies that forward to the API Gateway V2 routes. All notification helpers (`apps/*/src/lib/ts`) call these V2 paths, using `PATCH /api/v2/notifications/:id` to mark as read, `DELETE` to dismiss, `POST /api/v2/notifications/mark-all-read`, and `GET /api/v2/notifications/unread-count`. Keep any new notification fetches on the `/api/v2` surface so we don't reintroduce the legacy `/api/notifications` calls.

### Application Include Parameters

- `/api/v2/applications/:id` supports `?include=` with comma-separated keys. Accepted values are `candidate`, `job`, `recruiter`, `documents`, `pre_screen_answers`, `audit_log`, `job_requirements`, and `ai_review`. Services must load the base application row first, then conditionally fetch each include via follow-up queries (no multi-schema joins inside a single select). Client code should favor these include flags instead of bespoke `/full` endpoints.

### Related Resources

- Do **not** invent child endpoints (e.g., `/applications/:id/pre-screen-questions`) to expose related data. If a consumer needs a related collection, follow one of two patterns:
  1. Extend the canonical parent resource’s `?include=` contract (like applications include job requirements, documents, etc.).
  2. Stand up a proper top-level resource (e.g., `/v2/job-pre-screen-questions?job_id=...`, `/v2/job-requirements?job_id=...`) and call it through `/api/v2/<resource>`.
- Query parameters such as `job_id`/`application_id` keep filtering explicit while preserving the shared access-context enforcement in each service.
- ATS now exposes full CRUD for `job_pre_screen_questions`, `job_pre_screen_answers`, and `job_requirements` at `/api/v2/<resource>` (create/update/delete go through the same access-context pipeline). Use these when persisting candidate questionnaire responses instead of patching bespoke `/applications/*` actions.
- AI reviews follow the same pattern: `/api/v2/ai-reviews` (GET with `application_id`, GET by ID, POST) and `/api/v2/ai-review-stats?job_id=` are the canonical endpoints. Never add `/applications/:id/ai-review` or other child routes—use `include=ai_review` or call the top-level resource directly.

### Dashboard Statistics Endpoint

- `/api/v2/stats` proxies to the ATS V2 stats service and accepts `scope`/`type` and `range` query parameters (e.g., `GET /api/v2/stats?scope=recruiter&range=ytd`). Recruiter scope returns the metrics used on the recruiter dashboard (active_roles, candidates_in_process, offers_pending, placements_this_month, placements_this_year, total_earnings_ytd, pending_payouts). Reuse this endpoint for new dashboard widgets instead of creating bespoke `/.../stats` routes.

### Recruiter Invitation Actions

- Network Service V2 now exposes `/v2/recruiter-candidates/:id/resend-invitation` and `/v2/recruiter-candidates/:id/cancel-invitation`. API Gateway mirrors them at `/api/v2/recruiter-candidates/:id/...`, and the portal invitations client calls these routes instead of the legacy `/api/recruiter-candidates/*` endpoints. Use these V2 actions for any future invitation management features.

### Pending Applications Dashboard Widget

- `ApiClient.getPendingApplications` now queries `/api/v2/applications?stage=screen` instead of the legacy recruiter-specific endpoint, and both the recruiter dashboard widget plus `applications/pending` page rely on that V2 data (which already includes candidate/job joins). When building new recruiter-review flows, prefer this V2 filterable endpoint instead of `/recruiters/:id/pending-applications`.

## Supabase Table Usage Audit (2025-03-08)

- Compared Supabase public tables to runtime usage in apps/services.
- Tables with no runtime usage in apps/services (only migrations/docs): `candidate_sourcers`, `marketplace_events`.
  - `candidate_sourcers`: tracks first sourcer + protection window; shared types/clients expect sourcing endpoints, but no ATS/API Gateway routes exist yet.
  - `marketplace_events`: event log for marketplace actions/analytics; no service writes/consumers found.
- Auth schema tables are Supabase-managed internals; avoid treating them as app-owned resources.
- If implementing new resources, follow V2 guardrails: top-level `/api/v2/<resource>` routes with access-context scoping (no child endpoints).
