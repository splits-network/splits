# Phase 19: Portal & Gateway Cleanup - Context

**Gathered:** 2026-02-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove all admin code from portal and api-gateway. Portal becomes purely a recruiter/user app with no admin traces. Api-gateway becomes purely a user-facing gateway with no admin route proxying. Domain service /admin/* routes stay (admin-gateway uses them).

</domain>

<decisions>
## Implementation Decisions

### Redirect behavior
- No redirects needed — user will communicate the URL change directly
- Delete the redirect stubs added in Phase 18-10
- Old /portal/admin/* URLs return standard Next.js 404
- Old admin API endpoints on api-gateway return natural 404

### Portal sidebar
- Remove admin navigation entirely — no external link, no trace of admin
- Remove isPlatformAdmin check and all admin-specific gating logic from portal
- Portal is purely for recruiters/users after cleanup

### Cleanup completeness
- Remove everything unused: pages, components, hooks, types, interfaces
- If a component/hook/type has zero remaining consumers after admin pages are gone, delete it
- Trace usage across monorepo — remove admin-only types from portal
- Run portal build after cleanup to verify no broken imports

### Api-gateway route removal
- Remove everything admin from api-gateway: route files, admin middleware, admin auth helpers
- Domain service /admin/* routes stay intact (admin-gateway still needs them)
- Run api-gateway build after cleanup to verify no broken imports

### Claude's Discretion
- Order of file deletions (batch by feature area vs. alphabetical)
- Whether to split portal cleanup and gateway cleanup into separate plans
- How to trace and verify dead code before deletion

</decisions>

<specifics>
## Specific Ideas

- Clean break: no backward-compatibility shims, no "moved to" pages, no external links
- Build verification is required for both portal and api-gateway after cleanup

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-portal-gateway-cleanup*
*Context gathered: 2026-02-28*
