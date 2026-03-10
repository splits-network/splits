# /api:plan - Plan V2 to V3 Migration

**Description:** Research and visualize a V2 resource's full usage across the platform before migration. Generates an HTML report.

## Usage

```bash
/api:plan <service> <resource>
```

## Parameters

- `<service>` — Service containing the V2 resource (e.g., `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `recruiters`, `applications`)

## Examples

```bash
/api:plan network-service recruiters
/api:plan ats-service applications
/api:plan billing-service company-billing
```

## What It Does

1. **Analyzes the V2 API surface** — catalogs every route, repository method, service method, and event
2. **Scans for all consumers** — searches apps/portal, apps/candidate, apps/corporate, services, and gateway for every reference
3. **Classifies routes** — maps each V2 route to its V3 destination (core CRUD, view, or action)
4. **Identifies role-based authorization** — flags endpoints where different roles see different data, recommends separate views per role
5. **Maps frontend migration scope** — documents every file that needs URL updates
6. **Generates visual HTML report** via the visual-explainer skill

## Output

Report saved to: `.planning/api-migrations/<resource>-plan.html`

The report contains:
- V2 API surface table (all routes with request/response shapes)
- Consumer map (which apps/pages call which endpoints)
- Migration classification (V2 route → V3 destination)
- Role-based authorization analysis (which endpoints need separate views per role)
- Frontend impact (files needing URL updates, grouped by app)
- V3 file plan (exact folder/file structure)
- Estimated scope (files to create + files to update)

## Rules

- **Read-only** — never creates or modifies source code
- **Must complete before `/api:migrate`** — this is the mandatory first step
- **User must review** the report and approve before proceeding

## Execution

Spawn the `api` agent to plan. It will research the full scope, then use the `visual-explainer` skill to generate the HTML report.