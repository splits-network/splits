# Version Update Notification Banner

## Problem

When new code is deployed, users with stale browser tabs continue running old JavaScript. This can cause API mismatches, missing features, or subtle bugs. There is no mechanism to inform users that a newer version is available.

## Solution

Detect when a new deployment has gone live and show a persistent "New version available" banner prompting the user to refresh - similar to what Supabase does. No service interruptions; the old tab keeps working until the user chooses to refresh.

## How It Works

1. **Build time**: Git commit SHA (7 chars) is injected as `NEXT_PUBLIC_BUILD_ID` via Docker build arg
2. **Client bundle**: `NEXT_PUBLIC_BUILD_ID` is inlined into the JS bundle (Next.js does this automatically for `NEXT_PUBLIC_*` vars)
3. **API route**: `/api/version` returns the current build ID from the running container's environment
4. **Polling**: A `useVersionCheck` hook polls `/api/version` every 2 minutes
5. **Detection**: When the API returns a different build ID than what was baked into the JS bundle, a mismatch means a new deployment happened
6. **Banner**: A persistent, non-dismissable banner appears at the top of the page with a "Refresh now" button

## Scope

- **Portal** and **Candidate** apps only (corporate marketing site excluded - no auth/state to preserve)

## File Changes

### 1. Dockerfiles - Add BUILD_ID to build + production stages

**`apps/portal/Dockerfile`**
- Build stage: Add `ARG NEXT_PUBLIC_BUILD_ID` + `ENV NEXT_PUBLIC_BUILD_ID=$NEXT_PUBLIC_BUILD_ID` (after existing ARGs/ENVs around lines 36/45)
- Production stage: Add same ARG/ENV so server-side API route can read it at runtime (around line 67-70)

**`apps/candidate/Dockerfile`**
- Same changes as portal (around lines 32/38 and 60-63)

### 2. CI/CD - Pass git SHA as build arg

**`.github/workflows/deploy-aks.yml`**
- Add `--build-arg NEXT_PUBLIC_BUILD_ID=${GITHUB_SHA:0:7}` to both portal and candidate `docker build` commands (portal block ~line 97, candidate block ~line 110)

**`.github/workflows/deploy-staging.yml`**
- Same change (portal block ~line 100, candidate block ~line 113)

### 3. API Route - Version endpoint (new files)

**`apps/portal/src/app/api/version/route.ts`** (new)
**`apps/candidate/src/app/api/version/route.ts`** (new)

```typescript
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json(
        { data: { buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'dev' } },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
```

- Uses `{ data }` envelope per API response format standard
- `dynamic = 'force-dynamic'` prevents Next.js route caching
- `Cache-Control: no-store` prevents browser/CDN caching
- Returns `'dev'` in local dev (no build ID set)

### 4. Version Check Hook (new files)

**`apps/portal/src/hooks/use-version-check.ts`** (new)
**`apps/candidate/src/hooks/use-version-check.ts`** (new)

- Captures `NEXT_PUBLIC_BUILD_ID` at module load as the "initial" build ID
- Polls `/api/version` every 2 minutes
- Skips poll when `document.visibilityState === 'hidden'` (saves bandwidth)
- 30-second delay before first check (let app stabilize)
- Sets `hasNewVersion = true` on mismatch (never flips back)
- Ignores `'dev'` responses (no false positives in local dev)
- Silently catches fetch errors
- Returns `{ hasNewVersion, refreshPage }`

### 5. Banner Component (new files)

**`apps/portal/src/components/version-update-banner.tsx`** (new)
**`apps/candidate/src/components/version-update-banner.tsx`** (new)

- Matches `ServiceStatusBanner` visual pattern: `w-full p-2` with `border-b-4`
- Uses DaisyUI `text-info` / `border-info/20` colors (non-alarming)
- FontAwesome icon: `fa-duotone fa-regular fa-arrow-rotate-right`
- "Refresh now" button calls `window.location.reload()`
- Not dismissable (persists until refresh)
- Returns `null` when no new version detected

### 6. Layout Integration

**`apps/portal/src/app/layout.tsx`** (line 139)
- Add `<VersionUpdateBanner />` after `<ServiceStatusBanner>`

**`apps/candidate/src/app/layout.tsx`** (line 149)
- Add `<VersionUpdateBanner />` after `<ServiceStatusBanner>`

## Files Summary

| Action | File |
|--------|------|
| Edit | `apps/portal/Dockerfile` |
| Edit | `apps/candidate/Dockerfile` |
| Edit | `.github/workflows/deploy-aks.yml` |
| Edit | `.github/workflows/deploy-staging.yml` |
| New | `apps/portal/src/app/api/version/route.ts` |
| New | `apps/candidate/src/app/api/version/route.ts` |
| New | `apps/portal/src/hooks/use-version-check.ts` |
| New | `apps/candidate/src/hooks/use-version-check.ts` |
| New | `apps/portal/src/components/version-update-banner.tsx` |
| New | `apps/candidate/src/components/version-update-banner.tsx` |
| Edit | `apps/portal/src/app/layout.tsx` |
| Edit | `apps/candidate/src/app/layout.tsx` |

## Verification Plan

1. **Local dev**: Temporarily hardcode a mismatched build ID in the hook to verify the banner renders correctly
2. **API route**: `curl http://localhost:3100/api/version` should return `{ "data": { "buildId": "dev" } }`
3. **Staging**: Deploy twice - keep a tab open from first deploy, verify banner appears after second deploy
4. **Build**: Run `pnpm --filter @splits-network/portal build` and `pnpm --filter @splits-network/candidate build` to confirm no build errors

## Key Design Decisions

- **Polling over WebSocket**: Simpler, works independently of WebSocket connection status, no gateway changes needed
- **Local to each app** (not shared-ui): Avoids build-time env var scoping issues; duplication is minimal (~60 lines per app)
- **Non-dismissable banner**: Ensures users eventually refresh; stale code accumulates risk over time
- **2-minute poll interval**: Balance between responsiveness and minimal overhead (~1.5 KB/hour per user)
