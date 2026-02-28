# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-27)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** Phase 18 - Page Migration

## Current Position

Phase: 18 of 19 (Page Migration)
Plan: 9 of 10 in current phase
Status: In progress
Last activity: 2026-02-28 -- Completed 18-09 Finance, Content, Analytics, Settings Pages

Progress: [##################] 89% (17/19 phases complete across all milestones)

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
- [17-03]: admin-gateway in ALL_SERVICES (backend service, not app) -- correct change-detection triggers
- [17-03]: Deploy order gateway before app -- isPlatformAdmin gate calls gateway at startup
- [17-03]: Ingress appended to existing splits-network-ingress -- keeps TLS certificates consolidated
- [18-01]: getSplitsThemeOptions() merges DaisyUI oklch vars into ECharts option object at component level
- [18-01]: SVG renderer for all chart components -- crisp on retina, no pixelation
- [18-01]: Sparkline zero chrome -- no axes/grid/tooltip, purely visual trend indicator
- [18-02]: setupRealtimeServer receives config struct not AdminAuthMiddleware -- keeps WS module independent of Fastify
- [18-02]: Separate redisSub client via redis.duplicate() -- pub/sub requires dedicated Redis connection
- [18-02]: admin: prefix applied server-side -- clients subscribe to short names, server prefixes to prevent arbitrary Redis key access
- [18-02]: useRealtimeCounts: REST initial load + WS updates + 60s polling fallback -- counts visible before WS connects
- [18-03]: Admin routes under /admin/* in domain services -- clean separation from user-scoped /api/v2/* routes
- [18-03]: Admin-gateway rewritePrefix:'' strips /admin/{service}, leaving /admin/* intact -- no gateway changes needed
- [18-03]: network-service admin uses recruiters+recruiter_companies (no matches table exists in network-service)
- [18-03]: notification-service admin covers site_notifications (CRUD) + notification_log (read-only)
- [18-04]: SecureShell client component extracted from server layout -- keeps auth check as server component while allowing useState for mobile drawer
- [18-04]: admin-toast.tsx re-exports from toast-provider.tsx -- single render location, clean import paths
- [18-04]: AdminDataTable uses T extends { id: string | number } constraint for type-safe key/selection
- [18-07]: useStandardList option is defaultLimit not pageSize — hook returns data/goToPage as canonical names
- [18-07]: Job detail page is 'use client' with useEffect fetch — Clerk token required, syncToUrl:false on nested lists
- [18-08]: Match detail uses useEffect + createAuthenticatedClient not useStandardList — single entity fetch, not paginated list
- [18-08]: AdminEmptyState fallback for trust/intelligence pages — backend endpoints speculative, pages show empty not error
- [18-06]: RecruiterActions isolated from table — action mutation logic separate from presentational table component
- [18-06]: NotificationForm accepts loose initial prop type — avoids complex Partial<SiteNotification> mapping
- [18-09]: useStandardList canonical API: data/sortBy/sortOrder/handleSort/goToPage (items/sortField/sortDir deprecated aliases)
- [18-09]: Content Navigation and Images show empty states — content API not yet connected
- [18-09]: Metrics page uses sample chart data — analytics endpoints not yet available

### Pending Todos

None.

### Blockers/Concerns

Carried from previous milestones -- user action items from v2.0-v5.0 migrations.
See previous STATE.md versions for full list if needed.

## Session Continuity

Last session: 2026-02-28
Stopped at: Completed 18-09 Finance, Content, Analytics, Settings Pages
Resume file: None
Next: Execute 18-10-PLAN.md

---
*Created: 2026-02-12*
*Last updated: 2026-02-27 (v6.0 roadmap created)*
