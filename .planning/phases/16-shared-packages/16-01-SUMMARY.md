---
phase: 16-shared-packages
plan: 01
subsystem: ui
tags: [react, typescript, shared-packages, hooks, api-client, toast, standard-list, daisy-ui]

# Dependency graph
requires:
  - phase: shared-api-client
    provides: SplitsApiClient and ApiError/ApiResponse types for HTTP calls
  - phase: shared-types
    provides: StandardListParams, StandardListResponse, PaginationResponse types
  - phase: shared-ui
    provides: existing package infrastructure (tsconfig pattern, package.json pattern)
provides:
  - "@splits-network/shared-hooks package with AppApiClient factories, ToastProvider/useToast, useStandardList"
  - "ConfirmDialog component added to @splits-network/shared-ui"
  - "Standard list UI components (SearchInput, PaginationControls, EmptyState, StandardListLoadingState, ErrorState, ViewModeToggle, MobileDetailOverlay) added to @splits-network/shared-ui"
affects:
  - 16-02 (portal import switch)
  - admin app (will import from shared-hooks and shared-ui)

# Tech tracking
tech-stack:
  added:
    - "@splits-network/shared-hooks (new package)"
  patterns:
    - "Token-passed-in pattern: API factories accept token arg, no Clerk coupling in shared package"
    - "UrlSync option pattern: hook decoupled from Next.js navigation via optional urlSync param"
    - "StandardListLoadingState alias: avoids name collision with shared-ui's generic LoadingState"

key-files:
  created:
    - packages/shared-hooks/package.json
    - packages/shared-hooks/tsconfig.json
    - packages/shared-hooks/src/index.ts
    - packages/shared-hooks/src/api-client.ts
    - packages/shared-hooks/src/toast-context.tsx
    - packages/shared-hooks/src/use-standard-list.ts
    - packages/shared-ui/src/confirm-dialog.tsx
    - packages/shared-ui/src/standard-lists/index.ts
    - packages/shared-ui/src/standard-lists/search-input.tsx
    - packages/shared-ui/src/standard-lists/pagination-controls.tsx
    - packages/shared-ui/src/standard-lists/empty-state.tsx
    - packages/shared-ui/src/standard-lists/loading-state.tsx
    - packages/shared-ui/src/standard-lists/error-state.tsx
    - packages/shared-ui/src/standard-lists/view-mode-toggle.tsx
    - packages/shared-ui/src/standard-lists/mobile-detail-overlay.tsx
  modified:
    - packages/shared-ui/src/index.ts

key-decisions:
  - "AppApiClient wraps SplitsApiClient; createPortalClient/createAdminClient/createUnauthenticatedClient factory pattern"
  - "getToken accepted as option in useStandardList instead of useAuth() import — removes Clerk coupling"
  - "urlSync option replaces hard next/navigation imports — hook now works in any React app"
  - "StandardListLoadingState named to avoid collision with shared-ui generic LoadingState"
  - "ConfirmDialog changed from default export to named export when moved to shared-ui"

patterns-established:
  - "Shared package API client pattern: factory functions accept token arg, no auth library coupling"
  - "URL sync decoupling: provide URLSearchParams/pathname/replace via options object instead of hook imports"

# Metrics
duration: 12min
completed: 2026-02-27
---

# Phase 16 Plan 01: Shared Packages Foundation Summary

**New @splits-network/shared-hooks package with token-in factory clients, ToastProvider, and decoupled useStandardList; confirm-dialog and 7 standard-list UI components added to @splits-network/shared-ui**

## Performance

- **Duration:** 12 min
- **Started:** 2026-02-27T21:56:55Z
- **Completed:** 2026-02-27T22:08:55Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Created `@splits-network/shared-hooks` package with tsc build, no Clerk or Next.js hard dependencies
- Extracted api-client as `createPortalClient(token)`, `createAdminClient(token)`, `createUnauthenticatedClient()` factories
- Extracted toast-context verbatim (pure React + DaisyUI, no app coupling)
- Extracted use-standard-list with getToken option and urlSync option replacing hook imports
- Added ConfirmDialog and 7 standard-list UI components to shared-ui

## Task Commits

1. **Task 1: Create shared-hooks package** - `83710abc` (feat)
2. **Task 2: Move confirm-dialog and standard-list UI into shared-ui** - `49020c96` (feat)

## Files Created/Modified

- `packages/shared-hooks/package.json` - Package config for @splits-network/shared-hooks
- `packages/shared-hooks/tsconfig.json` - Extends tsconfig.base.json, jsx: react-jsx
- `packages/shared-hooks/src/api-client.ts` - AppApiClient + createPortalClient/createAdminClient/createUnauthenticatedClient
- `packages/shared-hooks/src/toast-context.tsx` - ToastProvider, useToast, Toast, ToastType
- `packages/shared-hooks/src/use-standard-list.ts` - useStandardList with getToken option and urlSync option
- `packages/shared-hooks/src/index.ts` - Barrel exports for all above + re-exports standard-list UI from shared-ui
- `packages/shared-ui/src/confirm-dialog.tsx` - ConfirmDialog with named export and exported ConfirmDialogProps
- `packages/shared-ui/src/standard-lists/search-input.tsx` - SearchInput component
- `packages/shared-ui/src/standard-lists/pagination-controls.tsx` - PaginationControls component
- `packages/shared-ui/src/standard-lists/empty-state.tsx` - EmptyState component
- `packages/shared-ui/src/standard-lists/loading-state.tsx` - StandardListLoadingState component
- `packages/shared-ui/src/standard-lists/error-state.tsx` - ErrorState component
- `packages/shared-ui/src/standard-lists/view-mode-toggle.tsx` - ViewModeToggle component
- `packages/shared-ui/src/standard-lists/mobile-detail-overlay.tsx` - MobileDetailOverlay component
- `packages/shared-ui/src/standard-lists/index.ts` - Barrel exports for standard-list components
- `packages/shared-ui/src/index.ts` - Added ConfirmDialog + standard-list exports

## Decisions Made

- **createPortalClient/createAdminClient pattern**: token passed as argument (not derived from Clerk internally) so the package has zero auth library coupling. Apps call `useAuth()` and pass the token in.
- **urlSync option**: useStandardList accepts `{ searchParams, pathname, replace }` as an option instead of calling `useSearchParams`/`usePathname`/`useRouter` directly. When omitted or `syncToUrl` is false, URL sync silently disables — no crash.
- **StandardListLoadingState**: the portal's `LoadingState` component in standard-lists was renamed to avoid colliding with shared-ui's existing `LoadingState` export from the loading module.
- **ConfirmDialog named export**: changed from default export to named export to match shared-ui conventions.

## Deviations from Plan

None - plan executed exactly as written. Task 2 was completed before Task 1 built (shared-ui components are imported by use-standard-list.ts), but both committed in plan order.

## Issues Encountered

None - both packages built cleanly on first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both packages build successfully (`tsc -b` exits 0)
- shared-hooks exports: `createPortalClient`, `createAdminClient`, `createUnauthenticatedClient`, `ToastProvider`, `useToast`, `useStandardList`, and all UI re-exports
- shared-ui exports: `ConfirmDialog`, `SearchInput`, `PaginationControls`, `EmptyState`, `StandardListLoadingState`, `ErrorState`, `ViewModeToggle`, `MobileDetailOverlay`
- Ready for Plan 02: Switch portal imports to use shared packages and delete originals

---
*Phase: 16-shared-packages*
*Completed: 2026-02-27*
