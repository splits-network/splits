---
phase: 16-shared-packages
plan: 02
subsystem: ui
tags: [react, typescript, shared-packages, hooks, api-client, toast, standard-list, daisy-ui]

# Dependency graph
requires:
  - phase: 16-01
    provides: "@splits-network/shared-hooks and shared-ui additions (AppApiClient factories, ToastProvider, useStandardList, ConfirmDialog, standard-list UI components)"
provides:
  - "Portal consumes @splits-network/shared-hooks for api-client, toast-context, and use-standard-list"
  - "Portal consumes @splits-network/shared-ui for ConfirmDialog and all standard-list UI components"
  - "Original portal files (confirm-dialog.tsx, 7 standard-lists/*.tsx) deleted"
  - "Thin re-export wrappers maintain backward compat for 42+ existing consumers"
affects:
  - admin app (will mirror same shared package import pattern)

# Tech tracking
tech-stack:
  added:
    - "@splits-network/shared-hooks added to portal dependencies"
  patterns:
    - "Thin re-export wrapper pattern: local files become pass-throughs to shared packages, preserving consumer import paths"
    - "Portal ApiClient subclass pattern: extends AppApiClient with portal base URL + business methods (getCurrentRecruiter)"
    - "Portal useStandardList wrapper: auto-injects Clerk getToken and Next.js urlSync for backward compat"

key-files:
  created: []
  modified:
    - apps/portal/package.json
    - apps/portal/src/lib/api-client.ts
    - apps/portal/src/lib/toast-context.tsx
    - apps/portal/src/hooks/use-standard-list.ts
    - apps/portal/src/components/standard-lists/index.ts
    - apps/portal/src/app/portal/admin/components/admin-confirm-provider.tsx
    - apps/portal/src/components/basel/messages/actions-toolbar.tsx
  deleted:
    - apps/portal/src/components/confirm-dialog.tsx
    - apps/portal/src/components/standard-lists/search-input.tsx
    - apps/portal/src/components/standard-lists/pagination-controls.tsx
    - apps/portal/src/components/standard-lists/empty-state.tsx
    - apps/portal/src/components/standard-lists/loading-state.tsx
    - apps/portal/src/components/standard-lists/error-state.tsx
    - apps/portal/src/components/standard-lists/view-mode-toggle.tsx
    - apps/portal/src/components/standard-lists/mobile-detail-overlay.tsx

key-decisions:
  - "ApiClient extends AppApiClient (not re-exported as alias): AppApiClient requires baseUrl arg, but portal consumers call new ApiClient() without args. Subclass pattern preserves backward compat while deriving baseUrl from env vars."
  - "useStandardList portal wrapper: shared-hooks version removed Clerk/Next.js coupling; portal wrapper re-injects them automatically so 11 consumer pages need no changes."
  - "LoadingState alias in standard-lists/index.ts: one admin file imported LoadingState; StandardListLoadingState re-exported as LoadingState alias."
  - "12 controls-bar.tsx files imported from standard-lists sub-paths (e.g. search-input.tsx) not the barrel — updated to use barrel index."

patterns-established:
  - "Re-export wrapper: thin local file that re-exports from shared package, preserving existing @/ import paths for all consumers"
  - "Portal client subclass: framework-coupled wrapper extends framework-agnostic shared base class"

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 16 Plan 02: Portal Import Switch Summary

**Portal switched to consume @splits-network/shared-hooks and shared-ui via thin re-export wrappers; 8 original files deleted (confirm-dialog.tsx + 7 standard-list components), 42+ consumers unchanged**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-27T22:04:38Z
- **Completed:** 2026-02-27T22:08:38Z
- **Tasks:** 1
- **Files modified:** 28

## Accomplishments

- Added `@splits-network/shared-hooks` dependency to portal
- Replaced `api-client.ts` with a thin wrapper: `ApiClient` subclasses `AppApiClient` from shared-hooks, adding portal base URL resolution and `getCurrentRecruiter`/`getCurrentSubscription` business methods
- Replaced `toast-context.tsx` with a 3-line re-export from `@splits-network/shared-hooks`
- Replaced `use-standard-list.ts` with a portal wrapper that auto-injects Clerk `getToken` and Next.js URL sync, so all 11 consumer pages work without changes
- Switched `admin-confirm-provider.tsx` and `actions-toolbar.tsx` to named `ConfirmDialog` from `@splits-network/shared-ui`
- Deleted `confirm-dialog.tsx` and 7 `standard-lists/*.tsx` component files
- Replaced `standard-lists/index.ts` with thin re-export from `@splits-network/shared-ui` (with `LoadingState` alias for backward compat)

## Task Commits

1. **Task 1: Switch portal imports to shared packages, delete originals** - `ee4bfa70` (feat)

## Files Created/Modified

- `apps/portal/package.json` - Added @splits-network/shared-hooks dependency
- `apps/portal/src/lib/api-client.ts` - ApiClient subclasses AppApiClient from shared-hooks; portal business methods kept
- `apps/portal/src/lib/toast-context.tsx` - 3-line re-export from @splits-network/shared-hooks
- `apps/portal/src/hooks/use-standard-list.ts` - Portal wrapper injecting Clerk + Next.js into shared hook
- `apps/portal/src/components/standard-lists/index.ts` - Thin re-export from @splits-network/shared-ui (LoadingState alias)
- `apps/portal/src/app/portal/admin/components/admin-confirm-provider.tsx` - Import switched to shared-ui named export
- `apps/portal/src/components/basel/messages/actions-toolbar.tsx` - Import switched to shared-ui named export
- Deleted: `apps/portal/src/components/confirm-dialog.tsx`
- Deleted: 7 files under `apps/portal/src/components/standard-lists/` (search-input, pagination-controls, empty-state, loading-state, error-state, view-mode-toggle, mobile-detail-overlay)
- Updated: 12 `controls-bar.tsx` files (sub-path imports fixed to use barrel index)

## Decisions Made

- **ApiClient subclass, not alias**: `AppApiClient(baseUrl, token)` requires a base URL arg, but 42 portal files call `new ApiClient()` without args and expect `getCurrentRecruiter()`. Subclassing with `_getPortalBaseUrl()` static resolves both constraints.
- **Portal useStandardList wrapper**: Rather than updating 11 consumer pages to pass `getToken` and `urlSync`, the wrapper auto-injects them from Clerk/Next.js hooks. Consumers continue to use the same options API.
- **LoadingState alias**: One admin file (`match-detail-client.tsx`) imports `LoadingState` from `use-standard-list`. The alias `StandardListLoadingState as LoadingState` in both `use-standard-list.ts` and `standard-lists/index.ts` preserves this.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] 12 controls-bar.tsx files imported from standard-lists sub-paths**

- **Found during:** Task 1 (first build attempt)
- **Issue:** `controls-bar.tsx` files across all portal sections imported `SearchInput` from `@/components/standard-lists/search-input` (the now-deleted file path) instead of the barrel `@/components/standard-lists`
- **Fix:** Updated all 12 files to import from the barrel index
- **Files modified:** 12 `controls-bar.tsx` files across applications, candidates, companies, company-invitations, invitations, invite-companies, matches, placements, recruiters, referral-codes, roles, teams
- **Verification:** Portal build passes after fix
- **Committed in:** ee4bfa70 (Task 1 commit)

**2. [Rule 3 - Blocking] LoadingState alias missing from use-standard-list.ts re-exports**

- **Found during:** Task 1 (identifying all consumers)
- **Issue:** `match-detail-client.tsx` imports `LoadingState` from `@/hooks/use-standard-list`, but the new wrapper only re-exported `StandardListLoadingState`
- **Fix:** Added `StandardListLoadingState as LoadingState` alias export to use-standard-list.ts
- **Files modified:** `apps/portal/src/hooks/use-standard-list.ts`
- **Verification:** No TypeScript errors, portal build passes
- **Committed in:** ee4bfa70 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both necessary for build correctness. No scope creep.

## Issues Encountered

None - both blocking issues were discovered via build failure and fixed immediately.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Portal builds successfully with all shared imports
- `@splits-network/shared-hooks` and `@splits-network/shared-ui` proven to work with portal
- Admin app can mirror the same pattern: import directly from `@splits-network/shared-hooks` and `@splits-network/shared-ui` without re-export wrappers (admin is a fresh app, no backward compat needed)
- Ready for Phase 17: Admin App scaffold

---
*Phase: 16-shared-packages*
*Completed: 2026-02-27*
