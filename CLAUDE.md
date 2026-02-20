# CLAUDE.md

Splits Network is a **split-fee recruiting marketplace** — microservice backend, Next.js frontend monorepo.

## Commands

```bash
pnpm install                                 # Install all deps
pnpm --filter @splits-network/<name> dev     # Dev a specific app/service
pnpm --filter @splits-network/<name> build   # Build specific package
pnpm build                                   # Build all (packages → services → apps)
pnpm --filter @splits-network/<name> test    # Test specific service
pnpm --filter @splits-network/<name> lint    # Lint specific package
```

## Monorepo Structure

```
apps/portal/          # Main authenticated app (Next.js 16, App Router)
apps/candidate/       # Candidate-facing portal
apps/corporate/       # Marketing site
services/             # Backend APIs (Fastify + TypeScript)
packages/             # Shared code (NOT directly deployable)
```

## Architecture Rules

1. **No backend logic in `apps/`** — all APIs go in `services/*`
2. **No HTTP calls between services** — use direct DB queries or RabbitMQ events
3. **Single Supabase Postgres database** — only `public` and `analytics` schemas
4. **Frontend calls `api-gateway` only** — never individual domain services
5. **Server-side pagination/filtering** — client-side filtering does NOT scale
6. **Nano-service philosophy** — small, focused services; new purpose = new service

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS, DaisyUI, Clerk auth
- **Backend**: Fastify, TypeScript, Supabase Postgres
- **Infra**: Kubernetes (raw YAML), Redis, RabbitMQ
- **3rd Party**: Clerk (auth), Stripe (payments), Resend (email)

## Naming Conventions

- **Files/folders**: kebab-case (`user-profile.tsx`, `api-client/`)
- **Variables/functions**: camelCase
- **Icons**: FontAwesome inline (`<i className='fa-duotone fa-regular fa-icon'>`)

## Skills (On-Demand Patterns)

| Skill | Purpose |
|-------|---------|
| `/api:scaffold` | Scaffold V2 backend resource |
| `/api:audit` | Audit service V2 compliance |
| `/migration` | Create database migration |
| `/test:scaffold` | Scaffold Vitest tests |
| `/event:scaffold` | Scaffold RabbitMQ event flow |
| `/auth` | Clerk auth patterns & gotchas |
| `/ui` | DaisyUI component patterns |
| `/email:scaffold` | Create email template |
| `/basel` | Basel design system migration |
| `/seo` | SEO audit & optimization |
| `/aio` | AI optimization audit |

## Guidance Documents

Key standards in `docs/guidance/`:
- `api-response-format.md` — `{ data: <payload> }` envelope
- `form-controls.md` — `fieldset` wrapper, no `-bordered` suffixes
- `pagination.md` — StandardListParams/StandardListResponse
- `user-identification-standard.md` — Always use `clerkUserId`
- `loading-patterns-usage-guide.md` — Standardized loading components
