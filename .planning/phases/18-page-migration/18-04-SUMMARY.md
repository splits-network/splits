---
phase: 18-page-migration
plan: 04
subsystem: ui
tags: [nextjs, react, daisyui, tailwindcss, clerk, websocket, sidebar, layout]

# Dependency graph
requires:
  - phase: 18-02
    provides: useRealtimeCounts hook and RealtimeProvider for live sidebar badge counts
  - phase: 17-02
    provides: Admin app Next.js scaffold, Clerk auth, UserButton pattern
provides:
  - Collapsible admin sidebar with search, real-time badges, and localStorage persistence
  - Admin header with branding, breadcrumbs, and Clerk UserButton
  - Responsive secure layout shell (desktop sidebar + mobile drawer)
  - Shared data table component (sorting, selection, row actions, skeleton loading)
  - Toast notification system (context-based, auto-dismiss, 5s)
  - Confirmation modal (DaisyUI dialog, variant styling)
  - Empty/error/loading state components
affects:
  - 18-05 through 18-10 (all admin page plans — they consume the shared layout and components)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Secure layout as server component with client SecureShell child for state
    - Sidebar localStorage persistence for collapsed/open section state
    - Toast system as context + hook (ToastContext + useAdminToast)
    - Generic data table with TypeScript generics for type-safe column rendering

key-files:
  created:
    - apps/admin/src/components/sidebar/nav-config.ts
    - apps/admin/src/components/sidebar/admin-sidebar.tsx
    - apps/admin/src/components/sidebar/sidebar-section.tsx
    - apps/admin/src/components/sidebar/sidebar-item.tsx
    - apps/admin/src/components/sidebar/sidebar-search.tsx
    - apps/admin/src/components/header/admin-header.tsx
    - apps/admin/src/components/header/breadcrumbs.tsx
    - apps/admin/src/app/secure/secure-shell.tsx
    - apps/admin/src/components/shared/admin-data-table.tsx
    - apps/admin/src/components/shared/admin-page-header.tsx
    - apps/admin/src/components/shared/admin-confirm-modal.tsx
    - apps/admin/src/components/shared/admin-toast.tsx
    - apps/admin/src/components/shared/admin-empty-state.tsx
    - apps/admin/src/components/shared/admin-error-state.tsx
    - apps/admin/src/components/shared/admin-loading-state.tsx
    - apps/admin/src/components/shared/index.ts
    - apps/admin/src/providers/toast-provider.tsx
    - apps/admin/src/hooks/use-admin-toast.ts
  modified:
    - apps/admin/src/app/secure/layout.tsx

key-decisions:
  - "SecureShell client component extracted from server layout — keeps auth check as server component while allowing useState for mobile drawer"
  - "sidebar-section.tsx extracted to keep admin-sidebar.tsx under 200 lines"
  - "admin-toast.tsx re-exports from toast-provider.tsx — single render location, clean import paths"
  - "AdminDataTable uses T extends { id: string | number } constraint for type-safe key/selection"

patterns-established:
  - "Shared components import from @/components/shared (barrel index.ts)"
  - "Toast: import useAdminToast from @/hooks/use-admin-toast"
  - "Sidebar badge keys map to AdminCounts from use-realtime-counts.ts"

# Metrics
duration: 4min
completed: 2026-02-28
---

# Phase 18 Plan 04: Admin Layout Shell Summary

**Collapsible sidebar with search, live badge counts, and localStorage persistence; shared data table, toast system, confirm modal, and state components used by all admin pages**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-28T01:08:10Z
- **Completed:** 2026-02-28T01:12:33Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Full admin layout shell: collapsible sidebar rail with 6 consolidated nav sections, search filter, real-time badges from useRealtimeCounts, localStorage state persistence
- Responsive layout: desktop sticky sidebar + mobile hamburger/drawer overlay via DaisyUI-compatible pattern
- Shared component library: generic data table, page header, confirm modal, toast system, empty/error/loading states
- Secure layout updated to wrap children in RealtimeProvider + ToastProvider + SecureShell

## Task Commits

Each task was committed atomically:

1. **Task 1: Admin header, sidebar with collapsible rail, search, real-time badges** - `cc6e6169` (feat)
2. **Task 2: Shared page components (data table, page header, toast, confirm modal, states)** - `40b79d6a` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/admin/src/components/sidebar/nav-config.ts` - 6 nav sections with icons, hrefs, badgeKey mappings
- `apps/admin/src/components/sidebar/admin-sidebar.tsx` - Main collapsible sidebar (134 lines)
- `apps/admin/src/components/sidebar/sidebar-section.tsx` - Collapsible section with badge sum (101 lines)
- `apps/admin/src/components/sidebar/sidebar-item.tsx` - Nav item with active state, badge, tooltip
- `apps/admin/src/components/sidebar/sidebar-search.tsx` - Filter input with collapsed mode icon
- `apps/admin/src/components/header/admin-header.tsx` - Fixed top header with branding + Clerk UserButton
- `apps/admin/src/components/header/breadcrumbs.tsx` - Pathname-based DaisyUI breadcrumbs
- `apps/admin/src/app/secure/secure-shell.tsx` - Client shell for mobile drawer state
- `apps/admin/src/app/secure/layout.tsx` - Updated with RealtimeProvider, ToastProvider, SecureShell
- `apps/admin/src/components/shared/admin-data-table.tsx` - Generic table, sorting, selection, actions (168 lines)
- `apps/admin/src/components/shared/admin-page-header.tsx` - Title/subtitle/actions strip
- `apps/admin/src/components/shared/admin-confirm-modal.tsx` - DaisyUI dialog modal
- `apps/admin/src/providers/toast-provider.tsx` - Toast context + FIFO rendering
- `apps/admin/src/hooks/use-admin-toast.ts` - success/error/info/warning hook
- `apps/admin/src/components/shared/index.ts` - Barrel exports for all shared components

## Decisions Made
- **SecureShell client extraction:** Server layout can't use useState, so SecureShell is a `'use client'` child that holds mobile drawer open/close state.
- **sidebar-section.tsx extraction:** Keeps admin-sidebar.tsx under 200 lines while encapsulating section-level render logic.
- **Toast in provider, re-exported from shared:** Single render point in ToastProvider, admin-toast.tsx just re-exports types for clean import paths.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Layout shell is complete. All admin page plans (18-05 through 18-10) can import from `@/components/shared` and will get the sidebar/header automatically via the secure layout.
- `useAdminToast()` and `AdminDataTable` are the two most-used shared pieces — page plans should rely on these.

---
*Phase: 18-page-migration*
*Completed: 2026-02-28*
