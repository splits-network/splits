# /api:migrate - Migrate V2 Resource to V3

**Description:** Migrate an existing V2 resource to V3 by creating a new v3 folder. V2 code is never modified.

## Usage

```bash
/api:migrate <service> <resource>
```

## Parameters

- `<service>` — Service containing the V2 resource (e.g., `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `recruiters`, `applications`)

## Prerequisites

- `/api:plan <service> <resource>` must have been run first
- The plan report at `.planning/api-migrations/<resource>-plan.html` must exist
- User must have reviewed and approved the plan

## Examples

```bash
/api:migrate network-service recruiters
/api:migrate ats-service applications
```

## What Gets Created

```
services/<service>/src/v3/<resource>/
  types.ts                  — Types + JSON schemas
  repository.ts             — Core CRUD (no joins)
  service.ts                — Business logic
  routes.ts                 — Core 5 routes
  views/
    <name>.route.ts         — Per the plan report
    <name>.service.ts
    <name>.repository.ts
  actions/
    <name>.route.ts         — Per the plan report
    <name>.service.ts
    <name>.repository.ts
```

## Rules

- **V2 is NEVER modified** — zero risk to existing consumers
- **One resource at a time** — don't batch multiple resources
- **Commit after each step** — core CRUD, views, actions, gateway each get a commit
- **V2 and V3 coexist** — both registered and functional simultaneously
- **Gateway uses declarative config** — add route entries to `services/api-gateway/src/routes/v3/<service>.ts` using `registerV3Routes()`

## Execution

Spawn the `api` agent to migrate. It will read the plan report, then create the V3 implementation following the migration steps in the agent instructions. The final step is always adding the declarative gateway route config for all new V3 endpoints (core CRUD + views + actions).