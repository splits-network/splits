---
name: api
description: Scaffold and audit V2 backend resources following the 5-route pattern with repository, service, and route layers.
---

# /api - Backend API Resource Management

Spawn the `api` agent (`.claude/agents/api.md`) to scaffold or audit V2 resources.

## Sub-Commands

- `/api:scaffold <service> <resource>` — Scaffold a new V2 resource (types, repository, service, routes)
- `/api:audit <service>` — Audit service for V2 compliance

## Quick Reference

### V2 File Structure (per resource)

```
services/<service>/src/v2/<resource>/
  types.ts      — Filters, update types, domain interfaces
  repository.ts — CRUD with role-based filtering via Supabase
  service.ts    — Business logic, validation, event publishing
  routes.ts     — 5-route Fastify registration
```

### 5-Route Pattern

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v2/:resource` | LIST with pagination |
| `GET` | `/api/v2/:resource/:id` | GET single |
| `POST` | `/api/v2/:resource` | CREATE |
| `PATCH` | `/api/v2/:resource/:id` | UPDATE |
| `DELETE` | `/api/v2/:resource/:id` | Soft delete |

### Canonical Reference

Study `services/ats-service/src/v2/jobs/` as the pattern to follow.

### Scaffolding Order

1. `types.ts` — Filter types, create/update input types
2. `repository.ts` — CRUD with Supabase client
3. `service.ts` — Business logic with access context + events
4. `routes.ts` — 5 Fastify route registrations
5. Update parent `routes.ts` — Register the new domain
6. Add gateway proxy — `services/api-gateway/src/routes/v2/`
