# /api-frontend:migrate - Migrate Frontend to V3 APIs

**Description:** Update all frontend consumer files to use V3 API endpoints. Handles hooks, direct calls, types, and filter configurations.

## Usage

```bash
/api-frontend:migrate <resource>
```

## Parameters

- `<resource>` — Resource name in kebab-case (e.g., `candidates`, `jobs`, `applications`)

## Prerequisites

- `/api-frontend:scan <resource>` must have been run
- Scan report must exist at `.planning/api-migrations/<resource>-frontend-scan.html`
- User must have reviewed and approved the scan

## Examples

```bash
/api-frontend:migrate candidates
/api-frontend:migrate applications
/api-frontend:migrate companies
```

## What Gets Updated

### Step 1: Types (one commit)
- Update or create frontend type interfaces to match V3 response shapes
- Read V3 view repository `.select()` to determine exact response shape
- Update shared types if the type lives in `packages/shared-types/`

### Step 2: Hook Calls (one commit per app)
- Update `useStandardList` `endpoint` to full V3 path
- Remove `include` parameter (V3 views handle joins server-side)
- Update `defaultFilters` if filter parameter names changed
- Update `defaultSortBy` if sortable fields changed
- Update `transformData` if response shape changed

### Step 3: Direct API Calls (one commit per app)
- Map each `client.get/post/patch/delete` call to its V3 equivalent
- Update request bodies if V3 expects different fields
- Update response handling if V3 returns different shape

### Step 4: Filter/Sort Configuration (same commit as hook calls)
- Update sort option arrays
- Update filter type definitions and UI label maps
- Update filter dropdown options

## Rules

- **One app at a time** — complete all steps for one app before the next
- **Commit after each step** — types, then hooks per app, then direct calls per app
- **Verify build** after each step: `pnpm --filter @splits-network/<app> build`
- **Skip consumers with no V3 equivalent** — log a warning, don't break the consumer
- **Never modify backend code** — if V3 endpoint doesn't match, backend needs updating first

## Execution

Spawn the `api-frontend` agent to migrate. It will read the scan report, then systematically update each consumer following the steps above.