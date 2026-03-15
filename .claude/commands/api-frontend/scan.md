# /api-frontend:scan - Scan Frontend V3 Migration Scope

**Description:** Analyze all frontend consumers of a resource and generate a migration checklist. This is the read-only planning step before migration.

## Usage

```bash
/api-frontend:scan <resource>
```

## Parameters

- `<resource>` — Resource name in kebab-case (e.g., `candidates`, `jobs`, `applications`)

## Prerequisites

- Backend `/api:plan` report must exist at `.planning/api-migrations/<resource>-plan.html`
- Backend `/api:migrate` must be complete (V3 endpoints registered and functional)
- Backend `/api:validate` should have passed

## Examples

```bash
/api-frontend:scan candidates
/api-frontend:scan applications
/api-frontend:scan companies
```

## What It Does

1. **Reads the backend plan report** — extracts V2-to-V3 endpoint mapping and the "Frontend Impact" section
2. **Greps all apps** for every reference to the V2 resource (`/candidates`, `/api/v2/candidates`, etc.)
3. **Classifies each consumer** by change type:
   - **endpoint-swap** — just change the endpoint string
   - **type-update** — response shape changed, update TypeScript interface
   - **filter-rename** — query parameter names changed
   - **include-removal** — `include` param no longer needed (V3 views handle joins)
   - **direct-call** — `client.get/post/patch/delete` path change
   - **action-call** — action endpoint path restructured
   - **test-update** — test mocks reference V2 URLs
4. **Groups consumers** by app, then by change type
5. **Identifies already-migrated files** that already use V3 (skip these)
6. **Generates visual HTML report** via the `visual-explainer` skill

## Output

Report saved to: `.planning/api-migrations/<resource>-frontend-scan.html`

The report contains:
- V2-to-V3 endpoint mapping table (from backend plan)
- Consumer inventory (every file, every call site, grouped by app)
- Change classification per file
- New types needed (if V3 response shape differs)
- Already-migrated files (for reference)
- Estimated scope (file count per app, change type counts)

## Rules

- **Read-only** — never creates or modifies source code
- **Must complete before `/api-frontend:migrate`** — mandatory first step
- **User must review** the report and approve before proceeding

## Execution

Spawn the `api-frontend` agent to scan. It will research the full frontend scope, then use the `visual-explainer` skill to generate the HTML report.
