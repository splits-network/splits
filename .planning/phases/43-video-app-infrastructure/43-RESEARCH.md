# Phase 43: Video App & Infrastructure - Research

**Researched:** 2026-03-08
**Domain:** Next.js video app, LiveKit integration, multi-subdomain branding, K8s ingress
**Confidence:** HIGH

## Summary

This phase creates a standalone `apps/video/` Next.js app that serves two branded subdomains (`video.splits.network` and `video.applicant.network`) for video calls. The app uses magic-link-only authentication -- no Clerk -- and connects to LiveKit for real-time video via the existing `@splits-network/shared-video` package.

The codebase is extremely well-positioned for this phase. The `packages/shared-video/` package already contains all video UI components (lobby, room, controls, participant tiles, notes panel, device selectors, recording consent). The `services/call-service/` already has token creation and exchange endpoints. The main work is: (1) scaffold the Next.js app shell, (2) implement brand detection via Host header, (3) add a magic-link exchange route that bypasses Clerk auth in the gateway, (4) wire up the shared-video components in the new app, and (5) create K8s deployment + ingress rules.

**Primary recommendation:** Scaffold `apps/video/` as a lightweight Next.js 16 app (no Clerk, no api-client auth) that consumes `@splits-network/shared-video` components and exchanges magic-link tokens directly with the call-service via the API gateway.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.1.0 | App framework | Already used by all apps in monorepo |
| React | ^19.2.1 | UI library | Monorepo standard |
| @livekit/components-react | ^2.9.20 | LiveKit React components | Already in shared-video package |
| livekit-client | ^2.17.2 | LiveKit client SDK | Already used across portal/candidate |
| TailwindCSS | ^4.1.17 | Styling | Monorepo standard |
| DaisyUI | ^5.5.14 | Component library | Monorepo standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @splits-network/shared-video | workspace:* | Video components (lobby, room, controls) | All video UI |
| @splits-network/shared-api-client | workspace:* | API calls to gateway | Token exchange |
| @splits-network/basel-ui | workspace:* | Design system components | Branding, layout |
| @splits-network/shared-ui | workspace:* | Shared UI utilities | Icons, common components |
| @sentry/nextjs | ^10.32.1 | Error monitoring | Production error tracking |

### Not Needed
| Library | Reason |
|---------|--------|
| @clerk/nextjs | Video app uses magic-link-only auth, no Clerk |
| @splits-network/shared-gamification | No gamification in video app |
| @splits-network/chat-ui | No chat in video app |

**Installation:**
```bash
# No new packages -- all deps already exist in the monorepo
# The video app just references workspace packages
```

## Architecture Patterns

### Recommended Project Structure
```
apps/video/
  src/
    app/
      layout.tsx          # Root layout with brand context provider
      page.tsx            # Landing/redirect (shows error for direct access)
      globals.css         # TailwindCSS + DaisyUI + animations import
      join/
        [token]/
          page.tsx         # Magic link entry point -- exchanges token, shows lobby
      error/
        page.tsx           # Expired/invalid link error page
      call/
        [callId]/
          page.tsx         # Active call experience (client component)
    components/
      brand-provider.tsx   # React context for brand (logo, colors, theme)
      branded-header.tsx   # Minimal header with logo
      splash-screen.tsx    # Loading screen with branded animation
      call-ended.tsx       # Post-call summary screen
      reconnecting.tsx     # Connection loss overlay
      identity-confirm.tsx # "Joining as John Smith" confirmation
      error-page.tsx       # Branded error display
    lib/
      brand.ts             # Brand detection from Host header
      call-api.ts          # API client for token exchange (no auth)
      types.ts             # Video app specific types
    hooks/
      use-call-token.ts    # Hook wrapping token exchange
      use-brand.ts         # Hook to consume brand context
  next.config.mjs
  package.json
  Dockerfile
  tsconfig.json
```

### Pattern 1: Host Header Brand Detection (Server-Side)
**What:** Detect brand from hostname in server components/layout
**When to use:** Root layout to determine brand context for all pages
**Example:**
```typescript
// Source: Codebase pattern + Next.js docs
// apps/video/src/lib/brand.ts

export type Brand = 'splits' | 'applicant';

export interface BrandConfig {
  brand: Brand;
  name: string;
  logoUrl: string;
  primaryColor: string;     // DaisyUI theme override
  daisyTheme: string;       // DaisyUI data-theme value
  portalUrl: string;
}

const BRANDS: Record<Brand, BrandConfig> = {
  splits: {
    brand: 'splits',
    name: 'Splits Network',
    logoUrl: '/logos/splits-network.svg',
    primaryColor: '#...',
    daisyTheme: 'splits',
    portalUrl: 'https://splits.network',
  },
  applicant: {
    brand: 'applicant',
    name: 'Applicant Network',
    logoUrl: '/logos/applicant-network.svg',
    primaryColor: '#...',
    daisyTheme: 'applicant',
    portalUrl: 'https://applicant.network',
  },
};

export function detectBrand(hostname: string): BrandConfig {
  if (hostname.includes('applicant')) {
    return BRANDS.applicant;
  }
  // Default to Splits Network for unknown hosts
  return BRANDS.splits;
}
```

```typescript
// apps/video/src/app/layout.tsx
import { headers } from 'next/headers';
import { detectBrand } from '@/lib/brand';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  // Behind nginx ingress, use x-forwarded-host; fallback to host
  const hostname = headersList.get('x-forwarded-host') || headersList.get('host') || '';
  const brand = detectBrand(hostname);

  return (
    <html lang="en" data-theme={brand.daisyTheme}>
      <body>
        <BrandProvider brand={brand}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

### Pattern 2: Magic Link Token Exchange Flow
**What:** Exchange URL token for LiveKit JWT without Clerk auth
**When to use:** The `/join/[token]` route
**Example:**
```typescript
// The flow:
// 1. Portal user clicks "Join Call" -> portal calls POST /api/v2/calls/:id/token (Clerk auth)
// 2. Portal receives { token, livekit_token } -> redirects to video.splits.network/join/{token}
// 3. Video app exchanges token via POST /api/v2/calls/exchange-token (NO auth)
// 4. Video app receives { livekit_token, call } -> connects to LiveKit room

// This requires a NEW gateway route that bypasses Clerk auth:
// POST /api/v2/calls/exchange-token { token: string }
// -> Proxied to call-service exchangeToken() which already exists
```

### Pattern 3: LiveKit Room Connection with Auto-Reconnect
**What:** LiveKit handles reconnection automatically; we just need UI overlay
**When to use:** Active call experience
**Example:**
```typescript
// LiveKit client automatically attempts reconnection on connection loss
// The @livekit/components-react ConnectionState component tracks:
// "connected" | "connecting" | "disconnected" | "reconnecting"
// Use useConnectionState() hook to show/hide reconnecting overlay
```

### Anti-Patterns to Avoid
- **Duplicating shared-video components:** The `@splits-network/shared-video` package has everything. Do NOT copy components into the video app. Extend/wrap them if needed.
- **Adding Clerk to the video app:** Decision is magic-link-only. The video app NEVER imports `@clerk/nextjs`.
- **Direct service calls:** The video app calls the API gateway, not services directly. Even the public token exchange goes through the gateway.
- **Client-side Host header detection:** Brand detection MUST happen server-side in the layout. The Host header is only available on the server. Pass brand config down via React context.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Video room UI | Custom WebRTC components | `@splits-network/shared-video` VideoRoom, VideoControls, ParticipantTile | Already built, tested, uses LiveKit React components |
| Pre-call lobby | Custom camera preview | `@splits-network/shared-video` VideoLobby, DeviceSelector, AudioLevelMeter | Already handles permission errors, device enumeration |
| Connection state tracking | Custom WebSocket monitoring | LiveKit `useConnectionState()` hook | LiveKit handles reconnection natively |
| Video grid layout | Custom CSS grid logic | `VideoRoom` component already has GridLayout + ScreenShareLayout | Handles 1-6+ participants with screen share mode |
| Device selection | Custom `getUserMedia` calls | LiveKit `usePreviewTracks`, `MediaDeviceSelect` | Already in shared-video |
| TLS certificates | Manual cert management | cert-manager with letsencrypt-prod ClusterIssuer | Already configured in existing ingress |

**Key insight:** Almost all video UI code already exists in `packages/shared-video/`. The video app is primarily a thin shell that provides the routing, brand context, and magic-link token exchange -- then delegates to shared components.

## Common Pitfalls

### Pitfall 1: Host Header Behind Nginx Ingress
**What goes wrong:** `headers().get('host')` returns the K8s service name (e.g., `video`) instead of the actual domain (`video.splits.network`)
**Why it happens:** Nginx ingress rewrites headers when proxying. The original Host header may be moved to `X-Forwarded-Host`.
**How to avoid:** Always check `X-Forwarded-Host` first, then fall back to `Host`. The nginx ingress controller forwards the original host by default, but verify in staging.
**Warning signs:** Brand always defaults to Splits Network regardless of domain accessed.

### Pitfall 2: CORS Configuration for Video App Domains
**What goes wrong:** Token exchange API calls from video.splits.network/video.applicant.network are blocked by CORS
**Why it happens:** The API gateway's CORS configuration (`CORS_ORIGIN`) does not include the new video subdomains
**How to avoid:** Add both `https://video.splits.network` and `https://video.applicant.network` to the gateway's CORS allowed origins
**Warning signs:** Browser console shows CORS errors when the video app tries to exchange tokens

### Pitfall 3: Gateway Auth Bypass for Token Exchange
**What goes wrong:** The token exchange endpoint returns 401 because all call routes require Clerk auth
**Why it happens:** The gateway wraps all `/api/v2/calls/*` routes with Clerk auth middleware. The video app has no Clerk token to send.
**How to avoid:** Add a specific public route in the gateway for `POST /api/v2/calls/exchange-token` that uses `noAuth()` middleware instead of the global Clerk verification
**Warning signs:** Video app receives 401 Unauthorized when trying to exchange magic link token

### Pitfall 4: TLS Certificate for New Subdomains
**What goes wrong:** cert-manager fails to issue certificates for video.splits.network and video.applicant.network
**Why it happens:** DNS records for the new subdomains may not exist, or the TLS secret doesn't include them
**How to avoid:** Ensure DNS A/CNAME records exist BEFORE deploying the ingress. Add video subdomains to the TLS hosts list in ingress.yaml. cert-manager will auto-issue via HTTP-01 challenge.
**Warning signs:** Browser shows certificate warning, `kubectl describe certificate` shows failed challenges

### Pitfall 5: shared-video InterviewContext vs Call Types Mismatch
**What goes wrong:** The shared-video components expect `InterviewContext` type but the call-service returns `Call` type
**Why it happens:** shared-video was built for the interview flow (v9.0). The new call-service has a different data shape.
**How to avoid:** Create an adapter function that maps `CallWithParticipants` to `InterviewContext` (or extend shared-video types to accept a union). The shapes are similar but field names differ.
**Warning signs:** TypeScript errors when passing call-service data to shared-video components

### Pitfall 6: Shared-Video Package Not Transpiled
**What goes wrong:** Build fails with "unexpected token" errors from shared-video package
**Why it happens:** Next.js doesn't transpile workspace packages by default
**How to avoid:** Add `@splits-network/shared-video` to `transpilePackages` in next.config.mjs. Check existing candidate/portal configs for the pattern.
**Warning signs:** Build error pointing to JSX/TS syntax in node_modules

## Code Examples

### Magic Link Join Page
```typescript
// apps/video/src/app/join/[token]/page.tsx
// Server component: validate token exists, then render client join flow

import { redirect } from 'next/navigation';
import { JoinFlow } from '@/components/join-flow';

interface JoinPageProps {
  params: Promise<{ token: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params;

  if (!token || token.length < 32) {
    redirect('/error?reason=invalid');
  }

  return <JoinFlow token={token} />;
}
```

### Token Exchange (Client-Side)
```typescript
// apps/video/src/lib/call-api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ExchangeResult {
  livekit_token: string;
  call: {
    id: string;
    title: string | null;
    call_type: string;
    status: string;
    scheduled_at: string | null;
    livekit_room_name: string;
    participants: Array<{
      id: string;
      user_id: string;
      role: string;
      user: {
        first_name: string;
        last_name: string;
        avatar_url: string | null;
        email: string;
      };
    }>;
    entity_links: Array<{
      entity_type: string;
      entity_id: string;
    }>;
  };
}

export async function exchangeToken(token: string): Promise<ExchangeResult> {
  const res = await fetch(`${API_URL}/api/v2/calls/exchange-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Token exchange failed (${res.status})`);
  }

  const { data } = await res.json();
  return data;
}
```

### Gateway Public Route for Token Exchange
```typescript
// In services/api-gateway/src/routes/v2/calls.ts
// Add BEFORE the catch-all /api/v2/calls/* route:

app.post(
  '/api/v2/calls/exchange-token',
  { preHandler: noAuth() },  // No Clerk auth required
  async (request: FastifyRequest, reply: FastifyReply) => {
    const correlationId = getCorrelationId(request);
    try {
      const data = await callService().post(
        '/api/v2/calls/exchange-token',
        request.body,
        correlationId,
        {} // No auth headers
      );
      return reply.send(data);
    } catch (error: any) {
      return reply.status(error.statusCode || 500)
        .send(error.jsonBody || { error: 'Token exchange failed' });
    }
  }
);
```

### K8s Deployment Template
```yaml
# infra/k8s/video/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video
  namespace: splits-network
spec:
  replicas: ${REPLICAS:-2}
  selector:
    matchLabels:
      app: video
  template:
    metadata:
      labels:
        app: video
    spec:
      nodeSelector:
        agentpool: userpool
      tolerations:
        - key: "kubernetes.azure.com/scalesetpriority"
          operator: "Equal"
          value: "spot"
          effect: "NoSchedule"
      containers:
        - name: video
          image: ${ACR_SERVER}/video:${IMAGE_TAG}
          ports:
            - containerPort: 3102
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3102"
            - name: NEXT_PUBLIC_API_URL
              value: "${API_BASE_URL}"
            - name: NEXT_PUBLIC_LIVEKIT_URL
              value: "${LIVEKIT_PUBLIC_URL:-wss://livekit.splitsnetwork.com}"
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /
              port: 3102
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /
              port: 3102
            initialDelaySeconds: 10
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: video
  namespace: splits-network
spec:
  type: ClusterIP
  ports:
    - port: 80
      targetPort: 3102
      name: http
  selector:
    app: video
```

### Ingress Addition
```yaml
# Add to infra/k8s/ingress.yaml TLS hosts:
- video.splits.network
- video.applicant.network

# Add rules:
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

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Interview-specific video types | Generic call types (Phase 42) | Phase 42 | shared-video types need adapter to work with call-service data |
| Clerk auth for video | Magic-link-only auth | Phase 43 design | Video app is simpler -- no Clerk dep |
| Video in portal iframe | Standalone video app | Phase 43 design | Clean separation, two branded domains |

**Key evolution:** The `shared-video` package was built around `InterviewContext` type. Phase 42 introduced a new `Call` model. The video app needs to bridge these -- either adapt call data to InterviewContext shape, or evolve shared-video to accept a more generic `CallContext` type. Recommend the adapter approach first (less risk, shared-video stays stable for portal too).

## Open Questions

1. **Port number for video app**
   - What we know: Portal uses 3100, candidate uses 3101. Services use 3001-3010+.
   - What's unclear: Is 3102 available and the right choice?
   - Recommendation: Use 3102 (next app port in sequence)

2. **Staging subdomain pattern**
   - What we know: Staging uses `staging.splits.network`, `staging.applicant.network`
   - What's unclear: Should staging video be `video.staging.splits.network` or `staging.video.splits.network`?
   - Recommendation: Use `video.staging.splits.network` to match existing pattern (`api.staging.splits.network`)

3. **Token exchange endpoint path**
   - What we know: `TokenService.exchangeToken()` already exists in call-service. No route exposes it yet.
   - What's unclear: Best path -- `/api/v2/calls/exchange-token` vs `/api/v2/calls/join`
   - Recommendation: Use `/api/v2/calls/exchange-token` to be explicit about what it does

4. **shared-video type evolution**
   - What we know: shared-video uses `InterviewContext`, call-service uses `CallWithParticipants`
   - What's unclear: Should we modify shared-video or build an adapter?
   - Recommendation: Build adapter in video app first. Evolve shared-video types in a future phase if needed.

5. **Nginx X-Forwarded-Host verification**
   - What we know: Blocker flagged in research -- need staging verification
   - What's unclear: Whether nginx ingress passes original Host or X-Forwarded-Host by default
   - Recommendation: Test both headers in staging. Default nginx ingress preserves the Host header but also sets X-Forwarded-Host. Check `X-Forwarded-Host` first.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `packages/shared-video/` -- all video components examined
- Codebase analysis: `services/call-service/src/v2/token-service.ts` -- token exchange logic
- Codebase analysis: `services/api-gateway/src/auth.ts` -- auth middleware pattern
- Codebase analysis: `services/api-gateway/src/helpers/simple-auth.ts` -- `noAuth()` pattern
- Codebase analysis: `infra/k8s/candidate/deployment.yaml` -- K8s deployment pattern
- Codebase analysis: `infra/k8s/ingress.yaml` -- ingress pattern with TLS
- Codebase analysis: `apps/candidate/Dockerfile` -- Dockerfile pattern for Next.js apps

### Secondary (MEDIUM confidence)
- [Next.js headers() docs](https://nextjs.org/docs/app/api-reference/functions/headers) - Host header access in server components
- [LiveKit Room connection docs](https://docs.livekit.io/home/client/connect/) - Auto-reconnect behavior
- [LiveKit ConnectionState component](https://docs.livekit.io/reference/components/react/component/connectionstate/) - Connection status tracking

### Tertiary (LOW confidence)
- [Nginx ingress X-Forwarded-Host](https://discuss.kubernetes.io/t/cannot-customise-x-forwarded-host-header-for-nginx-ingress-controller/23411) - Header forwarding behavior needs staging verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages already exist in monorepo, no new dependencies needed
- Architecture: HIGH - follows established patterns from candidate/portal apps
- Pitfalls: HIGH - identified from direct codebase analysis of existing gateway auth, ingress, and type mismatches
- K8s/Infra: HIGH - follows exact patterns from existing deployments

**Research date:** 2026-03-08
**Valid until:** 2026-04-07 (stable -- all based on existing codebase patterns)
