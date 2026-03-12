---
name: api
description: Scaffold and audit V3 backend resources following the route/service/repository pattern with core CRUD, views, and actions. Migrate V2 resources to V3.
---

# /api - Backend API Resource Management

Spawn the `api` agent (`.claude/agents/api.md`) to scaffold, migrate, or audit resources.

**All new work targets V3.** V2 is legacy — never create new V2 endpoints, never modify V2 code.

## Sub-Commands

- `/api:scaffold <service> <resource>` — Scaffold a new V3 resource (core CRUD + optional views/actions)
- `/api:audit <service>` — Audit service for V2 compliance (identifies what needs migration)
- `/api:plan <service> <resource>` — Research and visualize a v2 resource's full usage across the platform before migration (generates HTML report)
- `/api:migrate <service> <resource>` — Migrate a v2 resource to v3 (creates new v3 folder with views/actions pattern, v2 untouched)
- `/api:validate <service> <resource>` — Validate a v3 resource against all new standards (stricter than audit)
- `/api:deprecate <service> <resource>` — Mark a v2 resource as deprecated (adds deprecation headers, usage logging, consumer scan)
- `/api:remove <service> <resource>` — Remove a deprecated v2 resource after confirming zero consumers remain

### Migration Lifecycle

**plan** → **migrate** → **validate** → **deprecate** → **remove**

## Architecture Overview

### URL Structure

Every resource has up to three namespaces:

| Namespace | Methods | Purpose |
|-----------|---------|---------|
| `/api/v3/:resource` | GET, POST | Core CRUD (list, create) |
| `/api/v3/:resource/:id` | GET, PATCH, DELETE | Core CRUD (read, update, delete) |
| `/api/v3/:resource/views/*` | GET only | Shaped list responses (named by use case) |
| `/api/v3/:resource/:id/view/*` | GET only | Shaped single-resource responses |
| `/api/v3/:resource/actions/*` | POST only | Collection-level operations |
| `/api/v3/:resource/:id/actions/*` | POST only | Single-resource operations |

### File Structure

```
services/<service>/src/v3/<resource>/
  routes.ts              — Core 5 CRUD route registrations
  service.ts             — Core CRUD business logic
  repository.ts          — Core CRUD queries (NO joins)
  types.ts               — Shared types, filters, inputs, JSON schemas
  views/
    <name>.route.ts      — View route registration (GET only)
    <name>.service.ts    — View shaping/enrichment logic
    <name>.repository.ts — View-specific query (with joins)
  actions/
    <name>.route.ts      — Action route registration (POST only)
    <name>.service.ts    — Action validation, orchestration, events
    <name>.repository.ts — Action data access
```

### Key Rules

- **All new resources are V3** — never create new V2 endpoints
- **V2 is read-only** — use `/api:plan` → `/api:migrate` to move to V3
- **Core 5 = no joins** — flat data only. Need shaped data? Create a view
- **Views are GET-only** — named by use case, not SQL joins (`/views/board` not `/views/with-stage`)
- **Role-specific data = separate views** — `/views/recruiter-board` vs `/views/company-board`, never branch on role in repo
- **Actions are POST-only** — state transitions, side effects, bulk operations
- **Three-layer pattern everywhere** — route.ts → service.ts → repository.ts. No exceptions
- **Fastify JSON Schema** for request validation. No Zod
- **Typed errors** from service layer. Global error handler formats responses
- **Rate limiting at gateway only** — never in services
- **Declarative auth** at route level with role requirements

### Canonical Reference

Study `services/ats-service/src/v2/jobs/` as the V2 pattern reference (for understanding during migration).

### Scaffolding Order

1. `types.ts` — Filter types, create/update input types, JSON schemas
2. `repository.ts` — Core CRUD with Supabase client (no joins)
3. `service.ts` — Business logic with access context + events
4. `routes.ts` — Core 5 Fastify route registrations with JSON schema validation
5. Update parent `v3/routes.ts` — Register the new domain
6. Add gateway proxy — declarative config in `services/api-gateway/src/routes/v3/<service>.ts`
7. Add views/actions as needed (each is a separate three-file set + gateway entry)

## Frontend Migration

After backend migration and validation, migrate frontend consumers using `/api-frontend:*`:

```
/api-frontend:scan → /api-frontend:migrate → /api-frontend:validate → /api-frontend:cleanup
```

Frontend migration must complete before running `/api:deprecate`. See `.claude/skills/api-frontend/SKILL.md` for details.
