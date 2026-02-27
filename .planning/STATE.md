# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** Phase 17 - Admin App & Gateway Scaffold

## Current Position

Phase: 17 of 19 (Admin App & Gateway Scaffold)
Plan: 2 of 3 in current phase
Status: In progress
Last activity: 2026-02-27 -- Completed 17-02 admin app scaffold (Next.js 16 + Clerk + DaisyUI)

Progress: [#################.] 84% (16/19 phases complete across all milestones)

## Performance Metrics

**Cumulative (v2.0-v5.0):**
- Total plans completed: 36
- Average duration: 3.2 min
- Total execution time: ~119 minutes

**Recent Trend (v5.0):**
- Average: 3.0 min/plan
- Trend: Stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

See .planning/PROJECT.md Key Decisions table for full list.
Recent decisions affecting current work:

- [v6.0]: Separate admin app from portal -- admin is a different persona, 59 files is a full app
- [v6.0]: Separate admin gateway -- api-gateway is 6.6k lines, admin routes have different auth model
- [v6.0]: User handles Clerk instance setup -- new Clerk app for admin, user will configure
- [16-01]: createPortalClient/createAdminClient accept token arg -- no Clerk coupling in shared-hooks
- [16-01]: useStandardList accepts urlSync option -- no next/navigation coupling in shared-hooks
- [16-01]: StandardListLoadingState alias -- avoids collision with shared-ui's generic LoadingState
- [16-02]: ApiClient subclass pattern -- extends AppApiClient with portal base URL + business methods; avoids breaking 42 consumers
- [16-02]: Portal useStandardList wrapper -- auto-injects Clerk getToken + Next.js urlSync; admin app uses shared hook directly (no wrapper needed)
- [17-01]: verifyToken only (no createClerkClient) -- admin gateway only verifies JWTs, no Clerk API calls needed
- [17-01]: ADMIN_CLERK_SECRET_KEY via getEnvOrThrow directly -- no loadAdminClerkConfig added to shared-config (single-use)
- [17-01]: PORT default 3020 set via process.env before loadBaseConfig -- avoids conflicts with api-gateway (3000) and services (3001-3017)
- [17-02]: Custom sign-in form over Clerk SignIn component -- matches portal UX pattern
- [17-02]: user-button-client.tsx extraction -- keeps secure/page.tsx server component while enabling Clerk UserButton
- [17-02]: postcss.config.mjs uses @tailwindcss/postcss not tailwindcss -- required for TailwindCSS v4

### Pending Todos

None.

### Blockers/Concerns

Carried from previous milestones -- user action items from v2.0-v5.0 migrations.
See previous STATE.md versions for full list if needed.

## Session Continuity

Last session: 2026-02-27T23:59:00Z
Stopped at: Completed 17-02-PLAN.md (admin app scaffold)
Resume file: None
Next: Execute 17-03-PLAN.md (Dockerfiles + K8s + CI/CD)

---
*Created: 2026-02-12*
*Last updated: 2026-02-27 (v6.0 roadmap created)*
