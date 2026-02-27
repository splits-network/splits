---
phase: 17-admin-app-gateway-scaffold
plan: "02"
subsystem: ui
tags: [nextjs, clerk, tailwindcss, daisyui, react-query, admin, auth]

# Dependency graph
requires:
  - phase: 16-shared-packages
    provides: AppApiClient, useStandardList, shared-hooks patterns used by admin app
  - phase: 17-01
    provides: admin-gateway service that secure/layout.tsx fetches /admin/identity/users/me from
provides:
  - Admin Next.js 16 app at apps/admin/ on port 3200
  - Clerk authentication middleware protecting /secure/* routes
  - Server-side isPlatformAdmin gate in secure/layout.tsx
  - TailwindCSS v4 + DaisyUI v5 theme identical to portal
  - AdminApiClient extending AppApiClient with admin gateway base URL
  - useStandardList wrapper injecting admin Clerk getToken and Next.js urlSync
  - QueryProvider mirroring portal pattern
  - Public landing page, unauthorized page, sign-in page, welcome placeholder
affects: [phase-18-admin-pages-migration, Dockerfile-plan-03]

# Tech tracking
tech-stack:
  added:
    - "@clerk/nextjs ^6.36.5 (admin app)"
    - "@tanstack/react-query ^5.67.2 (admin app)"
    - "@tanstack/react-query-devtools ^5.67.2 (admin app)"
    - "tailwindcss ^4.1.17 (admin app)"
    - "daisyui ^5.5.8 (admin app)"
    - "@tailwindcss/postcss (required for TailwindCSS v4 postcss integration)"
  patterns:
    - "clerkMiddleware in proxy.ts protecting /secure/* routes"
    - "Server component secure/layout.tsx fetching admin-gateway for isPlatformAdmin check"
    - "Client component user-button-client.tsx wrapping Clerk UserButton for use in server page"
    - "AdminApiClient extends AppApiClient with env-driven admin gateway base URL"
    - "useStandardList wrapper injecting Clerk getToken + Next.js urlSync"

key-files:
  created:
    - apps/admin/package.json
    - apps/admin/tsconfig.json
    - apps/admin/next.config.mjs
    - apps/admin/postcss.config.mjs
    - apps/admin/proxy.ts
    - apps/admin/src/app/globals.css
    - apps/admin/src/app/themes/light.css
    - apps/admin/src/app/themes/dark.css
    - apps/admin/src/app/layout.tsx
    - apps/admin/src/app/page.tsx
    - apps/admin/src/app/unauthorized/page.tsx
    - apps/admin/src/app/(auth)/layout.tsx
    - apps/admin/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
    - apps/admin/src/app/secure/layout.tsx
    - apps/admin/src/app/secure/page.tsx
    - apps/admin/src/app/secure/user-button-client.tsx
    - apps/admin/src/providers/query-provider.tsx
    - apps/admin/src/hooks/use-standard-list.ts
    - apps/admin/src/lib/api-client.ts
  modified:
    - pnpm-lock.yaml (workspace install)

key-decisions:
  - "Used custom email/password form for sign-in (matching portal pattern) rather than Clerk <SignIn /> component"
  - "Extracted UserButton into user-button-client.tsx client component so secure/page.tsx stays server component"
  - "Used portal test Clerk key in .env.local for build verification (gitignored, user must replace with admin Clerk key)"
  - "postcss.config.mjs uses @tailwindcss/postcss not tailwindcss directly (required for v4)"

patterns-established:
  - "Admin app structure: mirrors portal with /secure/* protected zone instead of /portal/*"
  - "isPlatformAdmin gate: server component layout fetches admin-gateway /admin/identity/users/me, checks data.is_platform_admin"
  - "AdminApiClient: env-driven base URL with K8s fallback (admin-gateway:3020) and localhost fallback for client"
  - "Theme files: copied verbatim from portal — identical DaisyUI splits-light/splits-dark themes"

# Metrics
duration: 45min
completed: 2026-02-27
---

# Phase 17 Plan 02: Admin App Scaffold Summary

**Next.js 16 admin app with Clerk auth middleware, server-side isPlatformAdmin gate, DaisyUI v5 portal-identical theme, and AdminApiClient/useStandardList wrappers on port 3200**

## Performance

- **Duration:** ~45 min
- **Started:** 2026-02-27T23:14:12Z
- **Completed:** 2026-02-27T23:59:00Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments

- Complete admin Next.js 16 app scaffold at apps/admin/ on port 3200
- Clerk authentication with clerkMiddleware protecting /secure/* and public access to /, /sign-in, /unauthorized
- Server-side isPlatformAdmin check in secure/layout.tsx fetching /admin/identity/users/me from admin-gateway
- TailwindCSS v4 + DaisyUI v5 with themes copied verbatim from portal (splits-light / splits-dark)
- AdminApiClient extending AppApiClient with admin-gateway base URL from NEXT_PUBLIC_ADMIN_GATEWAY_URL
- useStandardList wrapper auto-injecting admin Clerk getToken and Next.js urlSync

## Task Commits

Each task was committed atomically:

1. **Task 1: Create admin app scaffold with config, styles, and providers** - `b627cf85` (feat)
2. **Task 2: Create Clerk middleware, auth pages, secure layout, and app pages** - `cfd2ed56` (feat)

## Files Created/Modified

- `apps/admin/package.json` - Admin app package, @splits-network/admin, port 3200
- `apps/admin/tsconfig.json` - TypeScript config mirroring portal with @/* path alias
- `apps/admin/next.config.mjs` - transpilePackages for shared packages, serverExternalPackages supabase
- `apps/admin/postcss.config.mjs` - @tailwindcss/postcss plugin for TailwindCSS v4
- `apps/admin/proxy.ts` - clerkMiddleware: protect /secure/*, allow / /sign-in /unauthorized
- `apps/admin/src/app/globals.css` - @import "tailwindcss" + @plugin "daisyui" + theme imports
- `apps/admin/src/app/themes/light.css` - DaisyUI splits-light theme (copied verbatim from portal)
- `apps/admin/src/app/themes/dark.css` - DaisyUI splits-dark theme (copied verbatim from portal)
- `apps/admin/src/app/layout.tsx` - Root layout: ClerkProvider + QueryProvider + FontAwesome script
- `apps/admin/src/app/page.tsx` - Public landing page: Splits Network branding + Sign In link
- `apps/admin/src/app/unauthorized/page.tsx` - Access denied page with sign-in link
- `apps/admin/src/app/(auth)/layout.tsx` - Centered auth shell layout
- `apps/admin/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` - Email/password sign-in form
- `apps/admin/src/app/secure/layout.tsx` - Server component: isPlatformAdmin gate with redirect
- `apps/admin/src/app/secure/page.tsx` - Welcome placeholder with user name and logout
- `apps/admin/src/app/secure/user-button-client.tsx` - Client component wrapping Clerk UserButton
- `apps/admin/src/providers/query-provider.tsx` - QueryClient + ReactQueryDevtools
- `apps/admin/src/hooks/use-standard-list.ts` - Admin wrapper injecting Clerk getToken + urlSync
- `apps/admin/src/lib/api-client.ts` - AdminApiClient extends AppApiClient with admin-gateway URL

## Decisions Made

- **Custom sign-in form over Clerk `<SignIn />` component:** Matches portal's established pattern of a custom email/password form with error handling and OAuth buttons. Provides consistent UX across portal and admin.
- **user-button-client.tsx extraction:** secure/page.tsx is a server component (fetches `currentUser`). Clerk's `UserButton` requires client context (`'use client'`). Extracting it to a minimal client component keeps the page server-side while enabling the logout widget.
- **Portal test Clerk key in .env.local:** The `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be a validly-formatted Clerk key (Clerk validates format at render time). Used portal's test key temporarily for build verification. This file is gitignored — user must replace with their admin Clerk instance's publishable key.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] postcss.config.mjs must use @tailwindcss/postcss not tailwindcss directly**

- **Found during:** Task 2 (build verification)
- **Issue:** Plan said to copy portal's postcss.config.mjs which uses `tailwindcss: {}`. But TailwindCSS v4 moved its PostCSS plugin to `@tailwindcss/postcss`. Running `next build` failed with "It looks like you're trying to use tailwindcss directly as a PostCSS plugin". Portal works because it has compatible postcss resolution already installed, but admin app as a fresh package pick-up throws the error.
- **Fix:** Changed postcss.config.mjs to use `'@tailwindcss/postcss': {}` (same pattern as apps/candidate/postcss.config.js).
- **Files modified:** apps/admin/postcss.config.mjs
- **Verification:** Build succeeded after fix
- **Committed in:** cfd2ed56 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary fix for correct TailwindCSS v4 PostCSS integration. No scope creep.

## Issues Encountered

- Clerk publishable key format validation: Clerk strictly validates the publishable key format at SSG time (not just at runtime). A placeholder value like `pk_test_placeholder` causes build failures. Resolved by using the portal's existing test key in .env.local (gitignored, user replaces with actual admin Clerk key before running).

## User Setup Required

Before running the admin app, the user must:

1. Create a new Clerk instance for admin at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `apps/admin/.env.local` to the admin Clerk publishable key
3. Set `CLERK_SECRET_KEY` in `apps/admin/.env.local` to the admin Clerk secret key
4. Ensure `NEXT_PUBLIC_ADMIN_GATEWAY_URL=http://localhost:3020` is set (already in .env.local)

## Next Phase Readiness

- Admin app shell is complete: auth flow, admin gate, placeholder page all working
- Build compiles cleanly with `pnpm --filter @splits-network/admin build`
- Ready for Dockerfile creation in Plan 03
- Ready for admin page migration in Phase 18 (populate /secure/* routes)
- The secure/layout.tsx isPlatformAdmin gate requires admin-gateway to be running at NEXT_PUBLIC_ADMIN_GATEWAY_URL to function at runtime

---
*Phase: 17-admin-app-gateway-scaffold*
*Completed: 2026-02-27*
