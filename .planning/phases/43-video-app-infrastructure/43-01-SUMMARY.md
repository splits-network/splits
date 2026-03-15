---
phase: 43
plan: 01
subsystem: video-app
tags: [nextjs, brand-detection, daisyui, token-exchange, cors, api-gateway]
depends_on: [42]
provides: [video-app-scaffold, brand-detection, public-token-exchange]
affects: [43-02, 43-03, 43-04]
tech_stack:
  added: []
  patterns: [host-header-brand-detection, brand-provider-context, public-token-exchange]
key_files:
  created:
    - apps/video/package.json
    - apps/video/tsconfig.json
    - apps/video/next.config.mjs
    - apps/video/postcss.config.js
    - apps/video/src/app/globals.css
    - apps/video/src/app/themes/splits-light.css
    - apps/video/src/app/themes/applicant-light.css
    - apps/video/src/app/layout.tsx
    - apps/video/src/app/page.tsx
    - apps/video/src/lib/brand.ts
    - apps/video/src/components/brand-provider.tsx
    - apps/video/src/components/branded-header.tsx
    - apps/video/src/hooks/use-brand.ts
  modified:
    - services/call-service/src/v2/routes.ts
    - services/call-service/src/v2/token-service.ts
    - services/api-gateway/src/routes/v2/calls.ts
    - services/api-gateway/src/index.ts
    - infra/k8s/api-gateway/deployment.yaml
decisions:
  - Applicant Network theme uses violet-600 primary to distinguish from Splits Network indigo
  - Brand detection uses hostname.includes('applicant') with default fallback to Splits
metrics:
  duration: 3min
  completed: 2026-03-08
---

# Phase 43 Plan 01: Video App Scaffold & Token Exchange Summary

**One-liner:** Next.js video app with host-header brand detection, dual DaisyUI themes, and public token exchange endpoint through API gateway

## What Was Done

### Task 1: Scaffold video app with brand detection and themes (b20f1161)
- Created `apps/video/` Next.js 16 app on port 3102
- Two DaisyUI themes: `splits-light` (indigo #233876) and `applicant-light` (violet #7c3aed)
- `detectBrand(hostname)` checks for 'applicant' in hostname, defaults to Splits Network
- Server-side brand detection in root layout via `x-forwarded-host` / `host` headers
- `BrandProvider` context with `useBrand()` hook for client components
- `BrandedHeader` with show/hide support (hidden during active call)
- Root page shows "requires valid call link" with branded portal link

### Task 2: Exchange-token route, token service fix, gateway auth bypass, CORS (7c206f6d)
- Added `POST /api/v2/calls/exchange-token` in call-service (public, no `requireUserContext`)
- Changed `TokenService.exchangeToken()` to return `CallDetail` (with `participants` including user names/avatars and `entity_links`) instead of bare `Call`
- Added gateway proxy route for exchange-token without auth headers
- Added auth bypass in gateway `index.ts` for the exchange-token endpoint
- Added video subdomains to CORS: `video.splits.network`, `video.applicant.network`, plus staging variants

## Decisions Made

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Applicant Network uses violet-600 (#7c3aed) as primary | Needs visual distinction from Splits Network indigo; violet is warm but professional |
| 2 | Brand detection defaults to Splits Network | Unknown hostnames (localhost, staging) get the primary brand safely |

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/video build` -- passed
- `pnpm --filter @splits-network/call-service build` -- passed
- `pnpm --filter @splits-network/api-gateway build` -- passed
- Exchange-token route exists in call-service routes (line 32)
- `getCallDetail` used in token-service (line 94)
- Auth bypass present in gateway index.ts (line 484)
- CORS includes video subdomains in deployment.yaml

## Next Phase Readiness

All artifacts are in place for subsequent plans:
- **43-02** (Call Token Flow): Can build on exchange-token endpoint and brand system
- **43-03** (Call Room): Can use BrandProvider context and shared-video components
- **43-04** (Deployment): Video app has standard Next.js build configuration
