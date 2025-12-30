# AGENTS.md

*Document the knowledge and context used in this session so future agents stay in the know.*

## V2 Architecture Guardrails

- **No `/me` endpoints.** All V2 services expose the canonical REST resources (`/v2/candidates`, `/v2/recruiter-candidates`, etc.). Per-user access control lives in the repository/service layer via `resolveAccessContext`, so never add `/v2/.../me` or similar shortcuts.
- **Gateway/frontends never special-case “current user.”** Consumers fetch `/api/v2/<resource>` (often with `limit=1` or other filters) and let the backend filter based on the resolved access context.
- **Shared access context lives in `@splits-network/shared-access-context`.** Every service imports `resolveAccessContext` from that package; do not reach into `services/shared/access-context.ts`.
- **RBAC checks rely on the above.** For example, the gateway checks the `candidate` role by calling `/v2/candidates?limit=1`—changing that contract will break role detection.

## Recruiter-Candidate Responses

- The network service V2 repository enriches recruiter-candidate rows with recruiter metadata:
  - It gathers recruiter IDs, loads the corresponding `network.recruiters` plus linked `identity.users`, and fills in `recruiter_name`, `recruiter_email`, `recruiter_bio`, and `recruiter_status` when missing.
  - As a result, frontends can expect these fields without additional joins.
- `/api/v2/recruiter-candidates` returns `{ data: RecruiterRelationship[], pagination: { ... } }`. Client code should read `response.data` before mapping.

## Candidate App Notes

- `apps/candidate/src/lib/api.ts#getMyRecruiters` now unwraps the `{ data }` envelope and maps enriched recruiter metadata. Do not revert back to the legacy array response shape.
- The profile page obtains the user’s candidate record via `/api/v2/candidates?limit=1`. Keep that contract so we never regress to `/api/candidates/me`.

## Portal App Requirements (next up)

- **Always call `/api/v2/*`.** When we migrate the portal pages, every data fetch must go through the V2 gateway routes (`/api/v2/jobs`, `/api/v2/recruiter-candidates`, `/api/v2/applications`, etc.). If a page still points at `/api/*` or `/api/<domain>/me`, update it to the V2 equivalent.
- **Handle `{ data, pagination }` responses.** Many V2 endpoints wrap results in this shape; portal components should destructure `const { data } = await client.get('/api/v2/<resource>')` before iterating.
- **No client-side role checks.** The backend enforces access via `resolveAccessContext`, so portal modules shouldn’t attempt to hit “recruiter-only” variants (like `/api/recruiter-candidates/me`). Use the shared API helper and trust upstream scoping.
- **Reuse shared helpers.** If the portal needs recruiter metadata, rely on the enriched fields returned by `/api/v2/recruiter-candidates`—do not re-fetch `identity.users` directly.
