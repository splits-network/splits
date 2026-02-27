# Phase 17: Admin App & Gateway Scaffold - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `apps/admin/` (Next.js 16) and `services/admin-gateway/` (Fastify), both running, authenticated via a separate Clerk instance, and connected to existing domain services. Admin-gateway is a thin HTTP proxy. Admin app shows a minimal placeholder after login. Ready for Phase 18 page migration.

</domain>

<decisions>
## Implementation Decisions

### Clerk auth setup
- Separate Clerk instance for admin (not shared with portal)
- Admin users are separate DB users with their own clerk_user_id — admin should NOT also be a company user or recruiter in portal
- Separate Clerk keys (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY) per app — user configures admin Clerk in dashboard
- Admin users are manually created in admin Clerk dashboard
- Identity-service webhook (existing endpoint) handles user.created from admin Clerk — creates user row in DB
- Existing portal admin users page assigns is_platform_admin role — no new role assignment UI needed in Phase 17
- Admin-gateway has its own Clerk SDK setup with admin Clerk secret key for JWT verification
- Admin-gateway verifies JWT + resolves user + checks is_platform_admin on every route

### Gateway routing strategy
- Simplified admin route layout: `/admin/{service}/{resource}` (e.g., /admin/identity/users, /admin/ats/jobs)
- Thin HTTP proxy — forwards requests to domain services, does NOT have its own route handlers or DB access
- Forwards directly to domain services (ats-service, identity-service, etc.) — bypasses api-gateway
- Proxy routes for ALL existing domain services from day one
- Uses @fastify/http-proxy plugin for request forwarding
- Pass-through response format — whatever downstream service returns, admin-gateway forwards as-is
- Context passing via headers: X-User-Id, X-Clerk-User-Id, X-Is-Platform-Admin forwarded to downstream services
- CORS: admin origin only (admin.employment-networks.com)
- Basic rate limiting (e.g., 100 req/min per user)
- Uses @splits-network/shared-config and @splits-network/shared-logging (same as other services)

### Admin app structure
- Same DaisyUI theme and TailwindCSS config as portal — identical look and feel
- Minimal placeholder page after login for Phase 17 (Welcome + user name + logout). Phase 18 adds real dashboard and pages
- Branded landing page for unauthenticated users (Splits Network logo, "Admin Portal" title, Sign In button)
- Non-admin authenticated users see a landing page with a link to the sign-in page
- Mirror portal's Next.js patterns: App Router, server components by default, 'use client' only when needed
- Route prefix: `/secure/*` for all authenticated admin routes
- Auth routes follow portal pattern: `(auth)/sign-in`
- QueryClientProvider (React Query) in root layout, same setup as portal
- Wire up shared packages from Phase 16: @splits-network/shared-hooks and @splits-network/shared-ui in package.json
- Admin-specific useStandardList wrapper (apps/admin/src/hooks/use-standard-list.ts) following portal's pattern — injects admin Clerk getToken + Next.js urlSync

### DevOps & deployment
- Dockerfiles follow exact same patterns as portal (admin app) and api-gateway (admin-gateway)
- Same K8s namespace as existing services
- Add admin-app and admin-gateway build/deploy jobs to existing deploy-aks.yml and deploy-staging.yml workflows
- Staging + production deploy targets from the start
- Production domains: admin.employment-networks.com (app), admin.api.employment-networks.com (gateway)
- Staging domains: admin.staging.employment-networks.com (app), admin.api.staging.employment-networks.com (gateway)
- Scaled down resources: 1 replica, smaller resource requests (admin is low-traffic)
- ClusterIP Service + Ingress for admin-gateway (browser needs to reach it, same pattern as api-gateway)

### Claude's Discretion
- Admin-gateway local dev port
- Admin app local dev port
- Admin api-client wrapper implementation (apps/admin/src/lib/api-client.ts)
- Internal package structure and barrel exports for admin app
- Rate limiting exact configuration

</decisions>

<specifics>
## Specific Ideas

No specific requirements — follow existing portal and api-gateway patterns for consistency.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 17-admin-app-gateway-scaffold*
*Context gathered: 2026-02-27*
