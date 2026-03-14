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

## Design Principles

```
Design standards: in the root /showcase directory
```

## Database Principles

1. **Migrations** - All schema changes must be made via migrations; never manual DB changes. A migration file must be created to support multiple environments and ensure consistency.

## Architecture Rules

1. **MANDATORY: Small files** — max ~200 lines; split into multiple files/components if larger
1. **No backend logic in `apps/`** — all APIs go in `services/*`
1. **No HTTP calls between services** — use direct DB queries or RabbitMQ events
1. **Single Supabase Postgres database** — only `public`, `search`, and `analytics` schemas
1. **Frontend calls `api-gateway` only** — never individual domain services
1. **Server-side pagination/filtering** — client-side filtering does NOT scale
1. **Nano-service philosophy** — small, focused services; new purpose = new service
1. **Technical Debt Paydown** — if you see something wrong, fix it immediately; no "I'll do it later"
1. **Don't leave unused code** — if something is no longer needed, delete it; don't comment it out or leave it in limbo
1. **MANDATORY: V3 CRUD routes must be pure** — Core CRUD (list, get, create, update, delete) must NEVER contain joins, access control, enrichment, computed fields, or includes. They are flat `select('*')` against a single table. ALWAYS `auth: 'required'` in the gateway. If a frontend page needs joined data, enrichment, role-based scoping, or public/optional auth — use a **view**. See `docs/guidance/v3-crud-vs-views.md`.

## Decision-Making Rules

1. **Architectural correctness over quick fixes** — When something doesn't fit (wrong column, missing type, no endpoint), fix the architecture: add the migration, extend the type, create the route. Never shove data into the wrong place to save time.
2. **Check the database before assuming** — Before writing code that touches the DB, verify the actual schema (check migrations, Docker logs, or Supabase). Column names, constraints, and table structure are the source of truth — not service code that may be stale.
3. **Understand the full data flow first** — Before making changes, trace the path: frontend → gateway → service → repository → database. Identify where data actually lives and how it gets there. Don't guess.
4. **Extend enums/types properly** — When a new concept needs a new type value (e.g., a new note type, status, or role), add it to the database constraint via migration AND the TypeScript type. Never repurpose an existing value.
5. **Follow existing patterns** — Look at how similar features were built. If notes use `application_notes`, new note-like data goes there too. If events use RabbitMQ, new events do too. Don't invent a new pattern when one exists.
6. **MANDATORY: Use the framework before writing custom code** — DaisyUI and TailwindCSS provide components, classes, and patterns for nearly every UI need. NEVER build custom implementations (click-outside listeners, open/close state, dropdowns, modals, tooltips, etc.) when the framework already handles it. Check the DaisyUI docs first. If a DaisyUI component exists for the pattern, use it. When modifying a component that uses a custom implementation where DaisyUI provides the pattern, refactor it to use DaisyUI as part of the change.

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

| Skill                    | Purpose                          |
| ------------------------ | -------------------------------- |
| `/api:scaffold`          | Scaffold V3 backend resource     |
| `/api:audit`             | Audit service V2 compliance      |
| `/api:plan`              | Plan V2 to V3 backend migration  |
| `/api:migrate`           | Migrate V2 resource to V3        |
| `/api:validate`          | Validate V3 resource compliance  |
| `/api:deprecate`         | Deprecate V2 resource            |
| `/api:remove`            | Remove deprecated V2 resource    |
| `/api-frontend:scan`     | Scan frontend V3 migration scope |
| `/api-frontend:migrate`  | Migrate frontend to V3 APIs      |
| `/api-frontend:validate` | Validate frontend V3 migration   |
| `/api-frontend:cleanup`  | Clean up V2 frontend artifacts   |
| `/migration`             | Create database migration        |
| `/test:scaffold`         | Scaffold Vitest tests            |
| `/event:scaffold`        | Scaffold RabbitMQ event flow     |
| `/auth`                  | Clerk auth patterns & gotchas    |
| `/ui`                    | DaisyUI component patterns       |
| `/email:scaffold`        | Create email template            |
| `/basel`                 | Basel design system migration    |
| `/seo`                   | SEO audit & optimization         |
| `/aio`                   | AI optimization audit            |
| `/dashboard`             | Dashboard design patterns (GA-quality) |
| `/promo:create`          | Create social media promo video  |
| `/promo:record`          | Record HTML animation to MP4     |

## Guidance Documents

Key standards in `docs/guidance/`:

- `v3-crud-vs-views.md` — **MANDATORY**: CRUD is flat, views handle joins/public/enrichment
- `api-response-format.md` — `{ data: <payload> }` envelope
- `form-controls.md` — `fieldset` wrapper, no `-bordered` suffixes
- `pagination.md` — StandardListParams/StandardListResponse
- `user-identification-standard.md` — Always use `clerkUserId`
- `loading-patterns-usage-guide.md` — Standardized loading components
