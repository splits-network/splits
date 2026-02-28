# Phase 16: Shared Packages - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Extract `use-standard-list`, `api-client`, `toast-context`, and `confirm-dialog` from portal into shared packages so both portal and admin apps can import them. Portal switches to shared imports immediately and original local files are deleted. Portal build must pass after switch.

</domain>

<decisions>
## Implementation Decisions

### Package organization
- One new package: `@splits-network/shared-hooks` containing use-standard-list hook, api-client utility, and toast-context
- confirm-dialog component goes into existing `@splits-network/shared-ui` (it's a UI component, not a hook)
- Hook logic in shared-hooks, companion UI components (pagination controls, filter UI) go into shared-ui
- Package naming follows existing pattern: `packages/shared-hooks/`

### API client design
- Two separate factory functions: `createPortalClient(token)` and `createAdminClient(token)`
- Both share the same underlying HTTP client logic with different base URL configs
- Token is passed in by the app (no Clerk coupling in shared package) — apps get token from Clerk's useAuth(), pass it to the factory
- Base URLs configured via environment variables in each app

### Migration strategy
- Extract and switch portal imports immediately in this phase (no stale copies)
- Delete original local files immediately after switching (git revert is the fallback)
- Run `pnpm --filter @splits-network/portal build` as verification gate before phase is complete
- Phase fails if portal build breaks after import switch

### Toast/notification approach
- Identical toast behavior across both apps (same positioning, animation, duration, styling)
- Keep DaisyUI toast/alert component pattern (no third-party toast library)
- No app-specific customization — consistent platform feel

### Claude's Discretion
- Internal structure of shared-hooks package (file organization, barrel exports)
- Exact pagination/filter component API when moving to shared-ui
- Error handling patterns in the shared api-client
- Build tooling for the new package (tsconfig, package.json scripts)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard extraction following existing monorepo package patterns (shared-ui, shared-types, shared-config as reference).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-shared-packages*
*Context gathered: 2026-02-27*
