# Technology Stack: v10.0 Video Platform & Recruiting Calls

**Project:** v10.0 Video Platform Generalization
**Researched:** 2026-03-08
**Mode:** Subsequent milestone -- incremental additions to existing stack
**Overall Confidence:** HIGH

## Executive Decision

**No new libraries needed.** The existing stack covers every requirement for the video app and generalized call types. This milestone is an architecture and data model evolution, not a technology addition.

The only "new" artifact is `apps/video/` -- a new Next.js 16 app that reuses existing packages, following the exact same patterns as the 5 existing apps (portal, candidate, corporate, admin, status).

---

## Recommended Stack for `apps/video/`

### Dependencies (match existing app versions exactly)

| Technology | Version | Purpose | Why This Version |
|------------|---------|---------|------------------|
| `next` | `^16.1.0` | App framework | Matches portal, candidate, corporate, admin |
| `react` / `react-dom` | `^19.2.1` | UI | Matches all existing apps |
| `livekit-client` | `^2.17.2` | LiveKit browser SDK | Already in portal + candidate |
| `@livekit/components-react` | `^2.9.20` | LiveKit React components | Already in shared-video peer dep |
| `@livekit/components-styles` | `^1.2.0` | LiveKit component CSS | Already in shared-video |
| `@sentry/nextjs` | `^10.32.1` | Error tracking | Matches all existing apps |

### Workspace Dependencies (no version to manage)

| Package | Purpose |
|---------|---------|
| `@splits-network/shared-video` | Lobby, room, controls, hooks -- the core video UI |
| `@splits-network/shared-api-client` | API gateway HTTP client |
| `@splits-network/shared-types` | Shared TypeScript types |
| `@splits-network/shared-config` | Environment config helpers |
| `@splits-network/shared-ui` | Common UI components |
| `@splits-network/basel-ui` | Basel design system |

### Dev Dependencies

| Technology | Version | Purpose |
|------------|---------|---------|
| `@tailwindcss/postcss` | `^4.1.17` | CSS processing |
| `@types/node` | `^24.10.1` | Node type defs |
| `@types/react` | `^19.0.1` | React type defs |
| `@types/react-dom` | `^19.0.2` | ReactDOM type defs |
| `typescript` | `^5.9.3` | Type checking |

**Key principle:** Every dependency version MUST match what portal and candidate already use. Zero version drift across apps.

---

## What NOT to Add (and Why)

| Tempting Addition | Why Skip It |
|-------------------|-------------|
| `@clerk/nextjs` in video app | Not needed. All participants authenticate via magic link tokens. Clerk-authenticated users get a magic link token from their portal/candidate app before redirecting to the video app. Eliminates multi-Clerk-instance complexity entirely. |
| Separate Clerk instance | The portal uses one Clerk app, candidate uses another. Adding a third creates auth sprawl. Magic links are the universal auth mechanism for video. |
| `@clerk/multi-domain` or satellite SDK | Solves a problem we do not have. Both subdomains serve the same video experience; neither needs Clerk sign-in/sign-up flows. |
| Next.js middleware for domain detection | Overkill. Use `headers().get('host')` in a server component utility to detect brand at runtime. |
| `next-themes` or theming library | Brand differences are logo + accent color + favicon. CSS variables toggled by hostname, not a library. |
| WebSocket library (socket.io, etc.) | LiveKit already provides the real-time connection. |
| Separate API gateway for video | Over-engineering. The video app calls the existing `api-gateway` at `api.splits.network` / `api.applicant.network`, which routes to `video-service`. Same pattern as portal and candidate. |
| Video processing libraries | LiveKit Egress + Azure Blob + ai-service pipeline already handles recording/transcription/summarization. |
| `@tanstack/react-query` | The video app has no list views, no pagination, no complex data fetching. It fetches call context once on mount, then it is purely real-time via LiveKit. Simple `useEffect` + `useState` suffices, as the existing interview clients in portal and candidate already demonstrate. |

---

## Multi-Domain Architecture

### How Two Subdomains Serve One Codebase

**Pattern: Same K8s Deployment, two ingress rules.** This is the proven pattern already in production.

Current ingress routes (from `infra/k8s/ingress.yaml`):
- `splits.network` -> portal K8s Service
- `applicant.network` -> candidate K8s Service
- `status.splits.network` -> status K8s Service
- `status.employment-networks.com` -> status K8s Service (same deployment, two domains)

The video app will add:
- `video.splits.network` -> video K8s Service
- `video.applicant.network` -> video K8s Service (SAME deployment)

```yaml
# Addition to infra/k8s/ingress.yaml TLS hosts
- video.splits.network
- video.applicant.network

# Addition to ingress rules
- host: video.splits.network
  http:
    paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
- host: video.applicant.network
  http:
    paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
```

### Brand Detection at Runtime

```typescript
// apps/video/src/lib/brand.ts
import { headers } from 'next/headers';

export type Brand = 'splits' | 'applicant';

export async function getBrand(): Promise<Brand> {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    return host.includes('applicant') ? 'applicant' : 'splits';
}
```

Brand determines: logo, page title, favicon, accent color CSS variable. All via a single `<BrandProvider>` in the root layout.

### TLS Certificate

Add `video.splits.network` and `video.applicant.network` to the existing `splits-network-tls` certificate in `ingress.yaml`. cert-manager with the existing `letsencrypt-prod` ClusterIssuer handles provisioning automatically.

---

## Auth Strategy: Magic-Link-Only (No Clerk)

### Rationale

The video app is a call experience, not a portal. Users arrive via two paths:

1. **Magic link email** (candidates, external participants) -- already works in candidate app at `apps/candidate/src/app/(public)/interview/[token]/`
2. **Redirect from portal/candidate app** -- user is already authenticated in their own app

Both paths converge on the same mechanism: a magic link token validated by `video-service`.

### Flow for Clerk-Authenticated Users (Recruiters, Hiring Managers)

```
1. User clicks "Join Call" in portal
2. Portal frontend calls POST /api/v2/video/calls/{id}/token
   (authenticated via Clerk JWT in portal's api-gateway)
3. video-service generates magic link token, returns it
4. Portal redirects to: video.splits.network/call/{magic-token}
5. Video app validates token with video-service, gets LiveKit JWT
6. Video app connects to LiveKit room
```

### Flow for Magic Link Participants (Candidates)

```
1. Candidate receives email with link: video.applicant.network/call/{magic-token}
2. Video app validates token with video-service, gets LiveKit JWT
3. Video app connects to LiveKit room
```

**Result:** The video app never needs Clerk. Every participant authenticates identically via magic link token. This eliminates:
- Multi-Clerk-instance configuration
- Cross-domain auth cookies
- Clerk middleware in the video app
- `proxy.ts` file entirely

### If Clerk Is Needed Later

If future requirements need user profile display in the video UI, the candidate app's Clerk instance can be added (since both recruiter and candidate users exist there). But this is explicitly deferred -- the magic link approach is simpler and more robust.

---

## Data Model Changes (Database Migration)

### Recommended: Add `call_type` to Existing `interviews` Table

The `interviews` table already has: room management, participant tracking, recording fields, access tokens, transcript storage, and the full RabbitMQ event pipeline wired up. Creating a separate table would duplicate everything.

```sql
-- Migration: generalize interviews for multiple call types

-- 1. New enum for call types
CREATE TYPE video_call_type AS ENUM ('interview', 'client_meeting');

-- 2. Add call_type column (default preserves existing data)
ALTER TABLE interviews
    ADD COLUMN call_type video_call_type NOT NULL DEFAULT 'interview';

-- 3. Make application_id nullable (client meetings have no application)
ALTER TABLE interviews
    ALTER COLUMN application_id DROP NOT NULL;

-- 4. Add entity linking for non-interview calls
ALTER TABLE interviews
    ADD COLUMN job_id UUID REFERENCES jobs(id),
    ADD COLUMN company_id UUID REFERENCES companies(id),
    ADD COLUMN firm_id UUID REFERENCES firms(id);

-- 5. Constraint: interview calls require application_id
ALTER TABLE interviews
    ADD CONSTRAINT chk_interview_requires_application
    CHECK (call_type != 'interview' OR application_id IS NOT NULL);

-- 6. Index for new call types
CREATE INDEX idx_interviews_call_type ON interviews(call_type);
CREATE INDEX idx_interviews_job_id ON interviews(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX idx_interviews_company_id ON interviews(company_id) WHERE company_id IS NOT NULL;
```

**Why not a new `video_calls` table:** Would require duplicating the `interview_participants`, `interview_access_tokens`, recording columns, transcript tables, ALL RabbitMQ event handlers in video-service and ai-service, and every route in api-gateway. The table name `interviews` is slightly legacy but renaming it would break everything for zero functional benefit.

### AI Summary Linking for Non-Interview Calls

Currently, ai-service posts interview summaries as application notes via ats-service. For `client_meeting` calls, summaries need to link to the entity (job, company, firm) rather than an application.

This requires:
- A new `call_summaries` table (or extending `interview_transcripts`) with entity reference columns
- Updated summarizer prompt in ai-service to generate meeting-appropriate summaries (not interview-focused)
- Updated RabbitMQ consumer to check `call_type` and route summary storage accordingly

---

## shared-video Package Evolution

The `shared-video` package currently exports interview-specific types. For generalization, add aliases without breaking existing consumers.

| Current Export | Add Generalized Alias | Breaking Change? |
|---------------|----------------------|-----------------|
| `InterviewContext` type | `CallContext` (type alias) | No -- old name still works |
| `useInterviewToken` hook | `useCallToken` (re-export) | No -- old name still works |
| `TokenResult.interview` field | `TokenResult.call` field | No -- add new field, keep old |
| `useInterviewNotes` hook | `useCallNotes` (re-export) | No -- old name still works |
| `CallState` type | No change | Already generic |
| `VideoLobby` component | No change | Already generic |
| `VideoRoom` component | No change | Already generic |

**Strategy:** Portal and candidate continue using old names. Video app uses new generalized names. Migrate portal/candidate to new names in a later cleanup pass.

---

## Dev Configuration

### Port Assignment

| App | Port | Status |
|-----|------|--------|
| portal | 3100 | Existing |
| candidate | 3101 | Existing |
| corporate | 3102 | Existing |
| status | 3103 | Existing |
| **video** | **3104** | **New** |
| admin | 3200 | Existing |

### Package Name

`@splits-network/video` -- follows `@splits-network/<app-name>` convention.

### Environment Variables

```bash
# Required
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000    # Same gateway as portal/candidate
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.yourdomain.com # Existing LiveKit instance

# Brand-aware URLs (for "return to portal" links)
NEXT_PUBLIC_PORTAL_URL=http://localhost:3100
NEXT_PUBLIC_CANDIDATE_URL=http://localhost:3101

# Sentry
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...

# NO Clerk keys -- magic-link-only auth
```

---

## Backend Changes (video-service)

### No New Libraries

The video-service already has everything needed:
- `livekit-server-sdk` ^2.9.1 -- room + token management
- `@supabase/supabase-js` -- database access
- `amqplib` -- RabbitMQ events
- `ioredis` -- caching
- `fastify` -- HTTP framework

### Route Changes Needed

| Change | Description |
|--------|-------------|
| Generalize route namespace | Add `/api/v2/video/calls/` routes alongside existing `/api/v2/video/interviews/` |
| Call creation endpoint | Accept `call_type` parameter; route to appropriate entity linking |
| Token generation | Support both interview and meeting call types |
| Summary linking | When call completes, link AI summary to correct entity |

### api-gateway Changes

Add proxy routes for the new call endpoints. Pattern matches existing interview proxy routes.

---

## AI Service Changes

### No New Libraries

The ai-service already processes recordings via:
- `openai` SDK -- Whisper transcription + GPT summarization
- RabbitMQ consumer -- listens for `recording_ready` events
- Supabase client -- stores transcripts and summaries

### Logic Changes Needed

| Change | Description |
|--------|-------------|
| Consumer routing | Check `call_type` on incoming `recording_ready` event |
| Prompt adaptation | Use interview-focused prompt for `interview` calls, meeting-focused prompt for `client_meeting` calls |
| Summary storage | Interview summaries -> application notes (existing). Meeting summaries -> `call_summaries` table or entity-linked notes (new). |

---

## Installation Commands

```bash
# Scaffold the new app directory
mkdir -p apps/video/src/app

# Install dependencies (from monorepo root)
pnpm --filter @splits-network/video add \
  next@^16.1.0 \
  react@^19.2.1 \
  react-dom@^19.2.1 \
  livekit-client@^2.17.2 \
  @livekit/components-react@^2.9.20 \
  @livekit/components-styles@^1.2.0 \
  @sentry/nextjs@^10.32.1

# Dev dependencies
pnpm --filter @splits-network/video add -D \
  @tailwindcss/postcss@^4.1.17 \
  @types/node@^24.10.1 \
  @types/react@^19.0.1 \
  @types/react-dom@^19.0.2 \
  typescript@^5.9.3

# Workspace packages are added via package.json manually:
# "@splits-network/shared-video": "workspace:*"
# "@splits-network/shared-api-client": "workspace:*"
# "@splits-network/shared-types": "workspace:*"
# "@splits-network/shared-config": "workspace:*"
# "@splits-network/shared-ui": "workspace:*"
# "@splits-network/basel-ui": "workspace:*"
```

---

## K8s Deployment

### New Manifests

```
infra/k8s/video/deployment.yaml     # New app deployment + ClusterIP Service
```

Follow the exact pattern from `infra/k8s/candidate/deployment.yaml`:
- Image: `${ACR_SERVER}/video:${IMAGE_TAG}`
- Port: 3104 (containerPort) -> 80 (Service port)
- Resources: 200m CPU / 256Mi request, 1000m CPU / 1Gi limit (same as candidate)
- Liveness/readiness probes on port 3104
- No Clerk secret refs (magic-link-only)
- Env vars: `NEXT_PUBLIC_API_GATEWAY_URL`, `NEXT_PUBLIC_LIVEKIT_URL`, Sentry DSN

### Ingress Changes

Add `video.splits.network` and `video.applicant.network` to existing ingress (detailed in Multi-Domain section above).

### Dockerfile

Copy from `apps/candidate/Dockerfile` pattern. Standard Next.js standalone output build.

---

## Confidence Assessment

| Decision | Confidence | Rationale |
|----------|------------|-----------|
| No new libraries needed | HIGH | Verified every package.json in the monorepo |
| Multi-domain via K8s ingress | HIGH | Proven pattern with 8+ domains in production ingress.yaml |
| Magic-link-only auth (no Clerk) | HIGH | Candidate app already does this at `/interview/[token]` |
| Generalize `interviews` table (not new table) | HIGH | Reviewed full schema + all event consumers |
| Port 3104 | HIGH | Verified ports 3100-3103 and 3200 in use |
| Brand detection via Host header | MEDIUM | Standard pattern; need to verify `headers()` returns correct Host behind nginx ingress (should work -- nginx passes Host header by default) |
| shared-video backward-compatible aliases | HIGH | TypeScript type aliases and re-exports are non-breaking by definition |

---

## Sources

All findings based on direct codebase inspection:

| File | What It Informed |
|------|-----------------|
| `apps/portal/package.json` | Dependency versions, workspace package references |
| `apps/candidate/package.json` | Candidate app deps, Clerk setup |
| `apps/candidate/src/app/(public)/interview/[token]/interview-client.tsx` | Magic link auth pattern (lines 31-59) |
| `apps/portal/src/app/portal/interview/[id]/interview-client.tsx` | Clerk auth video pattern |
| `packages/shared-video/src/index.ts` | Current shared-video exports |
| `packages/shared-video/src/types.ts` | Current type definitions |
| `packages/shared-video/package.json` | Shared video dependencies |
| `services/video-service/package.json` | Backend dependencies |
| `services/video-service/src/index.ts` | Service entry point, env vars |
| `services/video-service/src/v2/interviews/types.ts` | Current data model types |
| `services/video-service/src/v2/interviews/repository.ts` | DB access patterns |
| `services/ai-service/src/v2/transcription/repository.ts` | AI pipeline entity linking |
| `supabase/migrations/20260307000005_create_interviews_schema.sql` | Database schema, constraints |
| `infra/k8s/ingress.yaml` | Multi-domain routing (8+ domains), TLS cert pattern |
| `infra/k8s/candidate/deployment.yaml` | K8s deployment template for Next.js apps |
| Next.js 16.1.6 official docs (WebFetch) | Config options verification |
