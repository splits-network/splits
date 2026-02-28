# Phase 17: Admin App & Gateway Scaffold - Research

**Researched:** 2026-02-27
**Domain:** Next.js 16 app scaffold + Fastify gateway scaffold with Clerk auth, @fastify/http-proxy, K8s, CI/CD
**Confidence:** HIGH — all findings verified directly from codebase source files

## Summary

Phase 17 creates two new services from scratch: `apps/admin/` (Next.js 16 app) and `services/admin-gateway/` (Fastify). Both have clear, exact counterparts in the repo: the portal app and api-gateway service. This phase is primarily a structured "clone + adapt" task, not novel engineering.

The admin app mirrors the portal app's structure: App Router, `clerkMiddleware` in `proxy.ts`, `(auth)/sign-in` route group, `/secure/*` for authenticated routes, TailwindCSS v4 with `@import "tailwindcss"` + `@plugin "daisyui"`, `QueryProvider` in root layout, and `ClerkProvider` wrapping the HTML.

The admin gateway mirrors api-gateway but is simpler: no RabbitMQ, no Supabase direct access, no Swagger, just `@fastify/http-proxy` routes with a single auth middleware that verifies the admin Clerk JWT + checks `isPlatformAdmin` from `resolveAccessContext`. All `loadBaseConfig`/`createLogger`/`buildServer` patterns are identical to api-gateway.

The key differences from portal/api-gateway: separate Clerk instance (env var prefix `ADMIN_`), admin gateway calls identity-service to check `isPlatformAdmin` on every request, admin-gateway proxies to domain services directly at `/admin/{service}/{resource}`, 1 replica instead of 3, and resources scoped down for low-traffic use.

**Primary recommendation:** Copy portal as the base for admin app, copy api-gateway auth middleware + config loading patterns for admin-gateway, strip everything not needed, adapt env var prefixes and route paths.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `^16.1.0` | Admin app framework | Mirrors portal exactly |
| `@clerk/nextjs` | `^6.36.5` | Auth in Next.js app | Portal uses same version |
| `@clerk/backend` | `^2.4.0` | JWT verification in gateway | api-gateway uses this |
| `fastify` | `^5.6.2` | Admin gateway server | All services use this |
| `@fastify/http-proxy` | `^11.4.1` | Proxy to domain services | api-gateway already has it |
| `@fastify/rate-limit` | `^10.1.1` | Rate limiting per user | api-gateway uses same |
| `@tanstack/react-query` | `^5.67.2` | Data fetching in admin app | Portal uses same |
| `@splits-network/shared-config` | `workspace:*` | Config loaders (loadBaseConfig, loadClerkConfig) | All services use this |
| `@splits-network/shared-logging` | `workspace:*` | createLogger | All services use this |
| `@splits-network/shared-fastify` | `workspace:*` | buildServer, errorHandler | api-gateway + all services |
| `@splits-network/shared-access-context` | `workspace:*` | resolveAccessContext → isPlatformAdmin | api-gateway uses this |
| `@splits-network/shared-types` | `workspace:*` | Shared TypeScript types | Universal |
| `@splits-network/shared-hooks` | `workspace:*` | createAdminClient, useStandardList | Decisions require this |
| `@splits-network/shared-ui` | `workspace:*` | UI components | Decisions require this |
| `tailwindcss` | `^4.1.17` | Styling | Portal uses v4 |
| `daisyui` | `^5.5.8` | Component library | Portal uses this |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `ioredis` | `^5.8.2` | Redis for rate limiting | admin-gateway needs it |
| `@supabase/supabase-js` | `^2.47.10` | Admin app server components | For fetching profile during layout |
| `@supabase/supabase-js` | `^2.86.2` | Admin-gateway access context | resolveAccessContext needs Supabase |
| `@fastify/cors` | included via `shared-fastify` | CORS restriction to admin origin | Via buildServer options |
| `@fastify/helmet` | included via `shared-fastify` | Security headers | Via buildServer |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@fastify/http-proxy` | Custom fetch-based proxy | @fastify/http-proxy handles streaming, headers, errors. Don't hand-roll. |
| `resolveAccessContext` | Custom DB query | Already handles isPlatformAdmin check correctly |

### Installation

Admin app:
```bash
pnpm --filter @splits-network/admin add @clerk/nextjs @tanstack/react-query @tanstack/react-query-devtools @supabase/supabase-js @splits-network/shared-types @splits-network/shared-config @splits-network/shared-hooks @splits-network/shared-ui next react react-dom
pnpm --filter @splits-network/admin add -D tailwindcss daisyui @tailwindcss/postcss postcss typescript @types/node @types/react @types/react-dom
```

Admin gateway:
```bash
pnpm --filter @splits-network/admin-gateway add fastify @fastify/http-proxy @fastify/rate-limit @fastify/cors @clerk/backend ioredis @supabase/supabase-js @splits-network/shared-config @splits-network/shared-logging @splits-network/shared-fastify @splits-network/shared-access-context @splits-network/shared-types
pnpm --filter @splits-network/admin-gateway add -D typescript tsx @types/node
```

## Architecture Patterns

### Admin App Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in form, mirrors portal
│   │   │   └── layout.tsx                        # Auth shell layout
│   │   ├── secure/
│   │   │   ├── layout.tsx                        # Server component: isPlatformAdmin check + redirect
│   │   │   └── page.tsx                          # Welcome placeholder (Phase 17)
│   │   ├── layout.tsx                            # Root layout: ClerkProvider, QueryProvider
│   │   ├── page.tsx                              # Public landing: logo + "Admin Portal" + Sign In btn
│   │   ├── unauthorized/page.tsx                 # Non-admin authenticated user landing
│   │   └── globals.css                           # @import "tailwindcss" + @plugin "daisyui"
│   ├── hooks/
│   │   └── use-standard-list.ts                  # Admin wrapper: injects admin Clerk getToken + urlSync
│   ├── lib/
│   │   └── api-client.ts                         # Thin wrapper: extends AppApiClient, admin base URL
│   └── providers/
│       └── query-provider.tsx                    # QueryClientProvider, mirrors portal
├── proxy.ts                                      # clerkMiddleware: protect /secure/*, allow / and /sign-in
├── next.config.mjs                               # transpilePackages for shared packages
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── Dockerfile
```

```
services/admin-gateway/
├── src/
│   ├── auth.ts             # AdminAuthMiddleware: verify admin Clerk JWT, resolve isPlatformAdmin
│   ├── routes.ts           # registerAdminRoutes: proxy routes for all domain services
│   └── index.ts            # main(): loadBaseConfig, buildServer, rate-limit, health, register routes
├── tsconfig.json
├── package.json
└── Dockerfile
```

### Pattern 1: Admin App - clerkMiddleware (proxy.ts)

**What:** Next.js middleware that protects `/secure/*` routes, allows public access to `/` and `/sign-in`
**When to use:** All routes in admin app

```typescript
// Source: apps/portal/src/proxy.ts — adapted for admin
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, request) => {
    const pathname = request.nextUrl.pathname;

    const isPublicEndpoint =
        pathname === '/' ||
        pathname.startsWith('/sign-in') ||
        pathname.startsWith('/unauthorized');

    if (isPublicEndpoint) {
        return;
    }

    await auth.protect();
});

export const config = {
    matcher: [
        '/',
        '/sign-in(.*)',
        '/secure/(.*)',
    ],
};
```

### Pattern 2: Admin App - Secure Layout (server component isPlatformAdmin check)

**What:** Server component layout that fetches user profile, checks `is_platform_admin`, redirects non-admins
**When to use:** `apps/admin/src/app/secure/layout.tsx`

```typescript
// Source: apps/portal/src/app/portal/admin/layout.tsx — adapted for admin app
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SecureLayout({ children }: { children: React.ReactNode }) {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Fetch from admin-gateway's /users/me (forwarded to identity-service)
    let isAdmin = false;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL}/admin/identity/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
            const data = await response.json();
            isAdmin = data?.data?.is_platform_admin === true;
        }
    } catch {
        // Fall through to redirect
    }

    if (!isAdmin) {
        redirect('/unauthorized');
    }

    return <>{children}</>;
}
```

### Pattern 3: Admin Gateway - Auth Middleware

**What:** Fastify hook that verifies admin Clerk JWT, resolves access context, rejects non-platform-admins
**When to use:** All routes in admin-gateway except `/health`

```typescript
// Source: services/api-gateway/src/auth.ts + shared-access-context — adapted for single Clerk instance
import { createClerkClient, verifyToken } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { UnauthorizedError, ForbiddenError } from '@splits-network/shared-fastify';

export class AdminAuthMiddleware {
    private clerkClient: ReturnType<typeof createClerkClient>;
    private supabase: ReturnType<typeof createClient>;

    constructor(secretKey: string, supabaseUrl: string, supabaseServiceRoleKey: string) {
        this.clerkClient = createClerkClient({ secretKey });
        this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    }

    createMiddleware() {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const authHeader = request.headers.authorization;
            if (!authHeader?.startsWith('Bearer ')) {
                throw new UnauthorizedError('Missing authorization header');
            }

            const token = authHeader.substring(7);
            const verified = await verifyToken(token, { secretKey: this.secretKey });
            if (!verified?.sub) throw new UnauthorizedError('Invalid token');

            const context = await resolveAccessContext(this.supabase, verified.sub);
            if (!context.isPlatformAdmin) {
                throw new ForbiddenError('Platform admin access required');
            }

            // Attach for downstream header injection
            (request as any).adminAuth = {
                clerkUserId: verified.sub,
                userId: context.identityUserId,
                isPlatformAdmin: true,
            };
        };
    }
}
```

### Pattern 4: Admin Gateway - Proxy Routes

**What:** `@fastify/http-proxy` registration for each domain service under `/admin/{service}/`
**When to use:** All domain service routes in admin-gateway

```typescript
// Source: services/api-gateway package.json shows @fastify/http-proxy ^11.4.1
import httpProxy from '@fastify/http-proxy';

export async function registerAdminRoutes(app: FastifyInstance, services: Record<string, string>) {
    const serviceMap: Record<string, string> = {
        identity: services.identity,
        ats: services.ats,
        network: services.network,
        billing: services.billing,
        notification: services.notification,
        document: services.document,
        automation: services.automation,
        'document-processing': services['document-processing'],
        ai: services.ai,
        analytics: services.analytics,
        content: services.content,
        integration: services.integration,
        matching: services.matching,
    };

    for (const [serviceName, serviceUrl] of Object.entries(serviceMap)) {
        await app.register(httpProxy, {
            upstream: serviceUrl,
            prefix: `/admin/${serviceName}`,
            rewritePrefix: '',
            replyOptions: {
                rewriteRequestHeaders: (req, headers) => ({
                    ...headers,
                    'x-clerk-user-id': (req as any).adminAuth?.clerkUserId ?? '',
                    'x-user-id': (req as any).adminAuth?.userId ?? '',
                    'x-is-platform-admin': 'true',
                }),
            },
        });
    }
}
```

### Pattern 5: Admin App - Root Layout

**What:** Root layout with ClerkProvider (admin Clerk keys), QueryProvider, minimal chrome
**When to use:** `apps/admin/src/app/layout.tsx`

```typescript
// Source: apps/portal/src/app/layout.tsx — stripped down for admin
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/providers/query-provider';
import Script from 'next/script';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <html lang="en" suppressHydrationWarning>
                <head>
                    <Script
                        src="https://kit.fontawesome.com/728c8ddec8.js"
                        crossOrigin="anonymous"
                        async
                        data-auto-replace-svg="nest"
                        strategy="afterInteractive"
                    />
                </head>
                <body className="flex flex-col min-h-screen bg-base-300">
                    <QueryProvider>{children}</QueryProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
```

### Pattern 6: Admin Gateway - main() Entry Point

**What:** Fastify service entry following api-gateway pattern, but without RabbitMQ/Swagger
**When to use:** `services/admin-gateway/src/index.ts`

```typescript
// Source: services/api-gateway/src/index.ts — stripped down
import { loadBaseConfig, loadDatabaseConfig, loadClerkConfig, loadRedisConfig } from '@splits-network/shared-config';
import { createLogger } from '@splits-network/shared-logging';
import { buildServer, errorHandler, setupProcessErrorHandlers } from '@splits-network/shared-fastify';
import rateLimit from '@fastify/rate-limit';
import Redis from 'ioredis';
import { createClient } from '@supabase/supabase-js';
import { AdminAuthMiddleware } from './auth';
import { registerAdminRoutes } from './routes';

async function main() {
    const baseConfig = loadBaseConfig('admin-gateway');
    // Note: loadClerkConfig uses CLERK_SECRET_KEY — admin-gateway uses ADMIN_CLERK_SECRET_KEY
    // Either add a new loader or read directly with getEnvOrThrow
    const dbConfig = loadDatabaseConfig();
    const redisConfig = loadRedisConfig();

    const logger = createLogger({ serviceName: 'admin-gateway', ... });

    const redis = new Redis({ host: redisConfig.host, port: redisConfig.port });
    const supabase = createClient(dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);

    const adminClerkSecretKey = process.env.ADMIN_CLERK_SECRET_KEY!;
    const authMiddleware = new AdminAuthMiddleware(adminClerkSecretKey, dbConfig.supabaseUrl, dbConfig.supabaseServiceRoleKey!);

    const app = await buildServer({
        logger,
        cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3200', credentials: true },
    });

    app.setErrorHandler(errorHandler);

    await app.register(rateLimit, {
        max: 100,
        timeWindow: '1 minute',
        redis,
        keyGenerator: (req) => {
            const auth = req.headers['authorization'];
            return auth ? `admin-auth:${auth.slice(-16)}` : req.ip;
        },
    });

    // Auth hook — all routes except health
    app.addHook('onRequest', async (request, reply) => {
        if (request.url === '/health') return;
        await authMiddleware.createMiddleware()(request, reply);
    });

    const services = {
        identity: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3001',
        ats: process.env.ATS_SERVICE_URL || 'http://localhost:3002',
        // ... all services
    };

    await registerAdminRoutes(app, services);

    app.get('/health', async () => ({ status: 'healthy', service: 'admin-gateway', timestamp: new Date().toISOString() }));

    await app.listen({ port: baseConfig.port, host: '0.0.0.0' });
}

main();
```

### Pattern 7: Admin App - use-standard-list wrapper

**What:** App-level hook that injects admin Clerk `getToken` and Next.js URL sync into the shared hook
**When to use:** `apps/admin/src/hooks/use-standard-list.ts`

```typescript
// Source: apps/portal/src/hooks/use-standard-list.ts — adapted with useAuth from admin Clerk
'use client';

import { useAuth } from '@clerk/nextjs';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    useStandardList as useStandardListBase,
    type UseStandardListOptions,
    type UseStandardListReturn,
} from '@splits-network/shared-hooks';

export function useStandardList<T = any, F extends Record<string, any> = Record<string, any>>(
    options: UseStandardListOptions<T, F>
): UseStandardListReturn<T, F> {
    const { getToken } = useAuth(); // admin Clerk instance via ClerkProvider
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    return useStandardListBase<T, F>({
        ...options,
        getToken: options.getToken ?? getToken,
        urlSync: options.urlSync ?? (options.syncToUrl !== false ? {
            searchParams,
            pathname,
            replace: (url, opts) => router.replace(url, opts),
        } : undefined),
    });
}
```

### Pattern 8: Admin App - api-client.ts (lib wrapper)

**What:** Portal-style subclass of AppApiClient for admin-specific base URL
**When to use:** `apps/admin/src/lib/api-client.ts`

```typescript
// Source: apps/portal/src/lib/api-client.ts pattern — using createAdminClient from shared-hooks
import { AppApiClient, createAdminClient } from '@splits-network/shared-hooks';
export { AppApiClient } from '@splits-network/shared-hooks';

export class AdminApiClient extends AppApiClient {
    constructor(token?: string) {
        const baseUrl = AdminApiClient._getAdminBaseUrl();
        super(baseUrl, token);
    }

    private static _getAdminBaseUrl(): string {
        const url = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL;
        if (url) return url.replace(/\/+$/, '');
        return typeof window === 'undefined' ? 'http://admin-gateway:3020' : 'http://localhost:3020';
    }
}

export function createAuthenticatedClient(token: string): AdminApiClient {
    return new AdminApiClient(token);
}
```

### Anti-Patterns to Avoid

- **Using portal's Clerk keys in admin app:** Admin MUST use separate Clerk instance. Never share `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` between portal and admin.
- **Skipping isPlatformAdmin check in gateway middleware:** The gateway must check this on every request, not just the app.
- **Checking isPlatformAdmin in Next.js client component:** The secure layout check must be a server component (runs on server, can call APIs safely before rendering).
- **Adding DB access to admin-gateway:** The gateway is a thin proxy only. It can call resolveAccessContext (via shared-access-context which uses Supabase) for auth, but otherwise has no DB access.
- **Proxying through api-gateway:** Admin-gateway goes directly to domain services. No api-gateway hop.
- **Using `loadMultiClerkConfig` in admin-gateway:** Admin-gateway has one Clerk instance (admin). Use `loadClerkConfig` or a new `loadAdminClerkConfig` with `ADMIN_` prefix.
- **Not copying workspace link pattern to Dockerfile:** The portal Dockerfile reinstalls after COPY (`pnpm install --frozen-lockfile` twice) to establish workspace symlinks. Admin Dockerfiles must do the same.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP proxy to domain services | Custom fetch forwarding | `@fastify/http-proxy` | Handles streaming, error codes, header rewriting, large payloads |
| Rate limiting | Custom in-memory counter | `@fastify/rate-limit` with Redis | Per-user buckets, distributed, already in api-gateway |
| JWT verification | Manual JWT parse | `@clerk/backend` `verifyToken` | Handles JWKS rotation, expiry, audience |
| isPlatformAdmin check | Custom SQL query | `resolveAccessContext` from `@splits-network/shared-access-context` | Already resolves full access context including platform_admin role |
| Fastify server setup | Raw fastify() + cors + helmet | `buildServer` from `@splits-network/shared-fastify` | Consistent headers, CORS, error handling across all services |
| Logger | console.log | `createLogger` from `@splits-network/shared-logging` | Structured logging, pino, consistent across all services |
| QueryClient setup | New QueryClient per render | `QueryProvider` pattern with `useState(() => new QueryClient())` | Prevents shared state between SSR requests |

**Key insight:** This codebase has very mature shared patterns. Every piece of infrastructure needed for admin-gateway already exists as a tested package or in api-gateway. Diverging from these patterns creates maintenance burden.

## Common Pitfalls

### Pitfall 1: Clerk Key Variable Name Collision

**What goes wrong:** Admin app accidentally uses portal's Clerk keys because both apps use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
**Why it happens:** Next.js Clerk SDK reads `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` by convention. If the admin app's `.env` has the same value as portal, users can sign in with portal accounts.
**How to avoid:** Admin app's `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` must be set to the admin Clerk instance's publishable key (a different value from portal's `SPLITS_CLERK_PUBLISHABLE_KEY`). Each app has its own `.env.local`. In K8s, admin-app and portal Deployments have separate env values.
**Warning signs:** Admin sign-in accepts portal user accounts; portal users can navigate to admin URLs after auth.

### Pitfall 2: Workspace symlinks not established in Dockerfile

**What goes wrong:** Build fails with "cannot find module @splits-network/shared-hooks" in Docker production stage.
**Why it happens:** The monorepo uses pnpm workspaces. Copying source files doesn't establish workspace symlinks — a second `pnpm install --frozen-lockfile` run is needed after COPY.
**How to avoid:** Follow the portal Dockerfile pattern exactly: install deps, copy sources, install again, build packages in dependency order, then build the app.
**Warning signs:** Build succeeds locally but fails in Docker; "Cannot resolve module" errors during `next build` in Docker.

### Pitfall 3: transpilePackages missing shared packages

**What goes wrong:** Admin app builds but crashes at runtime with "SyntaxError: Cannot use import statement" for shared packages.
**Why it happens:** Next.js can't process ESM packages that aren't transpiled. Portal's `next.config.mjs` explicitly lists packages in `transpilePackages`.
**How to avoid:** Copy portal's `transpilePackages` list to admin's `next.config.mjs`. Include all `@splits-network/*` packages that are consumed as workspace source.
**Warning signs:** Build succeeds but server crashes on first request; "Module not found" or SyntaxError in edge/server runtime.

### Pitfall 4: @fastify/http-proxy prefix stripping

**What goes wrong:** Proxy forwards `/admin/identity/users` to downstream as `/admin/identity/users` (wrong) instead of `/users` (correct).
**Why it happens:** `@fastify/http-proxy` preserves the full prefix by default. `rewritePrefix: ''` removes the registered prefix but the upstream path must be configured correctly.
**How to avoid:** When registering `httpProxy` with `prefix: '/admin/identity'` set `rewritePrefix: ''`. Domain services expect paths like `/users`, `/jobs` — not `/admin/identity/users`.
**Warning signs:** 404s on all proxied requests; domain service logs show paths with `/admin/` prefix.

### Pitfall 5: resolveAccessContext requires Supabase service role key

**What goes wrong:** `resolveAccessContext` returns `{ isPlatformAdmin: false }` for all users.
**Why it happens:** `resolveAccessContext` queries the `users`, `memberships`, and `user_roles` tables. If admin-gateway's Supabase client is initialized with the anon key, RLS policies may block the reads.
**How to avoid:** Initialize the Supabase client in admin-gateway with `SUPABASE_SERVICE_ROLE_KEY`, not `SUPABASE_ANON_KEY`. Same pattern as api-gateway.
**Warning signs:** All admin users get 403 Forbidden even after being assigned `is_platform_admin` in the portal users page.

### Pitfall 6: CORS blocks admin app from reaching admin-gateway

**What goes wrong:** Browser requests to admin-gateway fail with CORS error.
**Why it happens:** admin-gateway's CORS origin must include the admin app domain. Production: `admin.employment-networks.com`. Staging: `admin.staging.employment-networks.com`.
**How to avoid:** Set `CORS_ORIGIN=https://admin.employment-networks.com` in admin-gateway's K8s Deployment env. In development, allow `http://localhost:3200` (admin app local port).
**Warning signs:** Browser console shows "CORS policy" errors for requests to admin-gateway; health check from browser fails.

### Pitfall 7: Port conflicts in local development

**What goes wrong:** `pnpm dev` for admin app or admin-gateway fails because port is already in use.
**Why it happens:** Portal uses 3100, candidate uses 3101. api-gateway uses 3000. All domain services use 3001-3017. A new admin app + gateway need distinct ports.
**How to avoid:** Assign admin app port 3200, admin-gateway port 3020. These are unoccupied in the current service registry.

## Code Examples

### globals.css (TailwindCSS v4 + DaisyUI — verified pattern)

```css
/* Source: apps/portal/src/app/globals.css — identical pattern */
@import "tailwindcss";
@plugin "daisyui";

@import "./themes/light.css";
@import "./themes/dark.css";
```

### postcss.config.mjs (TailwindCSS v4 — verified pattern)

```javascript
// Source: apps/portal/postcss.config.mjs
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
};
```

### next.config.mjs (transpilePackages — verified pattern)

```javascript
// Source: apps/portal/next.config.mjs — stripped to needed packages
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        '@splits-network/shared-types',
        '@splits-network/shared-config',
        '@splits-network/shared-hooks',
        '@splits-network/shared-ui',
    ],
    serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
```

### DaisyUI theme (reuse portal theme — verified pattern)

```css
/* Source: apps/portal/src/app/themes/light.css — copy verbatim */
@plugin "daisyui/theme" {
    name: "splits-light";
    color-scheme: light;
    default: true;
    --color-primary: #233876;
    --color-secondary: #0f9d8a;
    /* ... rest of portal theme */
}
```

### K8s Deployment - admin-gateway (based on api-gateway pattern)

```yaml
# Source: infra/k8s/api-gateway/deployment.yaml — adapted
apiVersion: apps/v1
kind: Deployment
metadata:
    name: admin-gateway
    namespace: splits-network
spec:
    replicas: 1  # Low-traffic admin tool
    selector:
        matchLabels:
            app: admin-gateway
    template:
        spec:
            containers:
                - name: admin-gateway
                  image: ${ACR_SERVER}/admin-gateway:${IMAGE_TAG}
                  ports:
                      - containerPort: 3020
                  env:
                      - name: NODE_ENV
                        value: "production"
                      - name: PORT
                        value: "3020"
                      - name: CORS_ORIGIN
                        value: "https://admin.employment-networks.com"
                      - name: ADMIN_CLERK_SECRET_KEY
                        valueFrom:
                            secretKeyRef:
                                name: clerk-secrets
                                key: admin-clerk-secret-key
                      # Supabase (for resolveAccessContext)
                      - name: SUPABASE_URL
                        valueFrom:
                            secretKeyRef:
                                name: supabase-secrets
                                key: supabase-url
                      - name: SUPABASE_SERVICE_ROLE_KEY
                        valueFrom:
                            secretKeyRef:
                                name: supabase-secrets
                                key: supabase-service-role-key
                      # All domain service URLs
                      - name: IDENTITY_SERVICE_URL
                        value: "http://identity-service:3001"
                      # ... etc
                  resources:
                      requests:
                          cpu: 100m
                          memory: 128Mi
                      limits:
                          cpu: 500m
                          memory: 512Mi
                  livenessProbe:
                      httpGet:
                          path: /health
                          port: 3020
                      initialDelaySeconds: 30
                      periodSeconds: 10
                  readinessProbe:
                      httpGet:
                          path: /health
                          port: 3020
                      initialDelaySeconds: 10
                      periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
    name: admin-gateway
    namespace: splits-network
spec:
    type: ClusterIP
    ports:
        - port: 80
          targetPort: 3020
    selector:
        app: admin-gateway
```

### K8s Deployment - admin app (based on portal pattern)

```yaml
# Source: infra/k8s/portal/deployment.yaml — adapted
apiVersion: apps/v1
kind: Deployment
metadata:
    name: admin
    namespace: splits-network
spec:
    replicas: 1  # Low-traffic
    selector:
        matchLabels:
            app: admin
    template:
        spec:
            containers:
                - name: admin
                  image: ${ACR_SERVER}/admin:${IMAGE_TAG}
                  ports:
                      - containerPort: 3200
                  env:
                      - name: NODE_ENV
                        value: "production"
                      - name: PORT
                        value: "3200"
                      # Admin Clerk publishable key — set at BUILD TIME via build arg
                      # NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is baked in at build
                      - name: NEXT_PUBLIC_ADMIN_GATEWAY_URL
                        value: "https://admin.api.employment-networks.com"
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
                          port: 3200
                      initialDelaySeconds: 30
                      periodSeconds: 10
```

### CI/CD Workflow additions (to deploy-aks.yml matrix)

```yaml
# Source: .github/workflows/deploy-aks.yml — add to matrix.service
- name: admin-gateway
  path: services/admin-gateway
- name: admin
  path: apps/admin

# Add to build-and-push conditional handling:
elif [ "${{ matrix.service.name }}" = "admin" ]; then
  docker build \
    -f ${{ matrix.service.path }}/Dockerfile \
    -t $IMAGE_TAG \
    --target production \
    --build-arg NEXT_PUBLIC_ADMIN_GATEWAY_URL=https://admin.api.employment-networks.com \
    --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${{ secrets.ADMIN_CLERK_PUBLISHABLE_KEY }} \
    .
```

### Ingress additions (to infra/k8s/ingress.yaml)

```yaml
# Add to TLS hosts:
- admin.employment-networks.com
- admin.api.employment-networks.com

# Add rules:
- host: admin.employment-networks.com
  http:
      paths:
          - path: /
            pathType: Prefix
            backend:
                service:
                    name: admin
                    port:
                        number: 80
- host: admin.api.employment-networks.com
  http:
      paths:
          - path: /
            pathType: Prefix
            backend:
                service:
                    name: admin-gateway
                    port:
                        number: 80
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| TailwindCSS v3 (tailwind.config.js) | TailwindCSS v4 (`@import "tailwindcss"` in CSS) | No tailwind.config.js file needed in v4 |
| DaisyUI v4 | DaisyUI v5.5.8 (`@plugin "daisyui"` in CSS) | Theme config via `@plugin "daisyui/theme"` blocks in CSS |
| Custom auth header passing | `buildAuthHeaders` helper + `x-clerk-user-id` header | Services resolve roles from DB, not from passed headers |
| Multi-instance Clerk: `loadMultiClerkConfig` | Single instance for admin: `loadClerkConfig` or direct env reads | Admin gateway only needs one Clerk instance |

**Deprecated/outdated:**
- `tailwind.config.js`: Not used in portal or candidate apps (v4 dropped it). Do not create one for admin app.
- `clerkMiddleware` wrapping every page: Only applies to routes in the matcher. Admin uses narrow matcher.

## Open Questions

1. **New K8s secret for admin Clerk keys**
   - What we know: K8s creates `clerk-secrets` with `splits-clerk-*` and `app-clerk-*` keys. Admin needs new `admin-clerk-*` keys.
   - What's unclear: Whether to extend existing `clerk-secrets` secret or create `admin-clerk-secrets`.
   - Recommendation: Extend the existing `clerk-secrets` secret with `admin-clerk-publishable-key` and `admin-clerk-secret-key` entries. Mirrors the existing pattern. Both deploy workflows (production + staging) must add `admin-clerk` literals to the `kubectl create secret generic clerk-secrets` command.

2. **Identity-service /users/me endpoint for admin gateway**
   - What we know: Portal calls `/users/me` via api-gateway which forwards to identity-service. Admin-gateway will proxy to identity-service directly.
   - What's unclear: Whether identity-service's `/users/me` endpoint is already set up to accept `x-clerk-user-id` header from admin Clerk users (admin users are separate DB users with their own `clerk_user_id`).
   - Recommendation: Admin users are created via the existing identity-service webhook (user.created from admin Clerk). The `users` table has their `clerk_user_id`. The `/users/me` endpoint should work since it only queries by `clerk_user_id` header. Verify at runtime; no changes expected.

3. **`loadClerkConfig` vs new `loadAdminClerkConfig`**
   - What we know: `loadClerkConfig()` reads `CLERK_SECRET_KEY` env var. Admin-gateway needs `ADMIN_CLERK_SECRET_KEY`.
   - What's unclear: Whether to add a `loadAdminClerkConfig` to `shared-config` or just use `getEnvOrThrow` directly.
   - Recommendation: Use `getEnvOrThrow('ADMIN_CLERK_SECRET_KEY')` directly in admin-gateway's `index.ts`. No need to pollute shared-config with a single-use loader for one service.

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — all patterns verified from source files
  - `apps/portal/src/app/layout.tsx` — root layout pattern
  - `apps/portal/src/proxy.ts` — clerkMiddleware pattern
  - `apps/portal/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx` — sign-in page pattern
  - `apps/portal/src/app/portal/admin/layout.tsx` — isPlatformAdmin server component gate pattern
  - `apps/portal/src/hooks/use-standard-list.ts` — portal wrapper hook pattern
  - `apps/portal/src/lib/api-client.ts` — ApiClient subclass pattern
  - `apps/portal/src/providers/query-provider.tsx` — QueryProvider pattern
  - `apps/portal/Dockerfile` — Next.js monorepo Dockerfile pattern
  - `apps/portal/next.config.mjs` — transpilePackages pattern
  - `apps/portal/src/app/globals.css` — TailwindCSS v4 + DaisyUI v5 import pattern
  - `services/api-gateway/src/index.ts` — Fastify gateway entry pattern
  - `services/api-gateway/src/auth.ts` — Clerk JWT verification middleware pattern
  - `services/api-gateway/src/helpers/auth-headers.ts` — header passing pattern
  - `services/api-gateway/Dockerfile` — Fastify service Dockerfile pattern
  - `services/api-gateway/package.json` — gateway dependencies including @fastify/http-proxy
  - `packages/shared-config/src/index.ts` — loadBaseConfig, loadClerkConfig, loadDatabaseConfig
  - `packages/shared-access-context/src/index.ts` — resolveAccessContext, isPlatformAdmin
  - `packages/shared-fastify/src/server.ts` — buildServer API
  - `packages/shared-hooks/src/api-client.ts` — createAdminClient, AppApiClient
  - `packages/shared-hooks/src/use-standard-list.ts` — useStandardList API
  - `infra/k8s/api-gateway/deployment.yaml` — K8s deployment manifest pattern
  - `infra/k8s/portal/deployment.yaml` — K8s app deployment pattern
  - `infra/k8s/ingress.yaml` — Ingress pattern with TLS and host routing
  - `.github/workflows/deploy-aks.yml` — CI/CD matrix build pattern
  - `.github/workflows/deploy-staging.yml` — Staging CI/CD pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — exact versions from package.json files
- Architecture: HIGH — direct pattern from portal + api-gateway source
- Pitfalls: HIGH — derived from actual code and Dockerfile patterns; Pitfall 4 (proxy prefix) is MEDIUM (inferred from @fastify/http-proxy docs knowledge)
- Code examples: HIGH — all examples adapted directly from verified source files

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (stable stack, 30 days)
