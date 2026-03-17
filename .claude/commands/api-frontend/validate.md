# /api-frontend:validate - Validate Frontend V3 Migration

**Description:** Verify that all frontend consumers have been migrated to V3 and no V2 references remain. Runs 8 validation checks.

## Usage

```bash
/api-frontend:validate <resource>
```

## Parameters

- `<resource>` — Resource name in kebab-case (e.g., `candidates`, `jobs`, `applications`)

## Prerequisites

- `/api-frontend:migrate <resource>` must have been run

## Examples

```bash
/api-frontend:validate candidates
/api-frontend:validate applications
```

## Validation Checks

1. **Zero V2 references** — No remaining `"/<resource>"` or `"/api/v2/<resource>"` in any frontend file (excludes comments and migration plans)
2. **V3 endpoint correctness** — Every V3 endpoint string in frontend matches a registered route in `services/api-gateway/src/routes/v3/*.ts`
3. **Type alignment** — Frontend type interfaces include all fields returned by the V3 view (compared against backend `types.ts` and view repository `.select()`)
4. **No orphaned include params** — No `useStandardList` call for this resource still uses an `include` parameter
5. **Filter compatibility** — All filter keys in `defaultFilters` exist in the V3 backend's query schema
6. **Build success** — `pnpm build` passes for all affected apps
7. **No hardcoded V2 paths** — No string literal containing `/v2/<resource>` in any frontend file
8. **Multi-app coverage** — Every app identified in the scan report has been migrated

## Output

Reports each check as:
- **PASS** — meets the standard
- **FAIL** — violates the standard (must fix)
- **WARN** — not ideal but acceptable (should fix)

## Execution

Spawn the `api-frontend` agent to validate. It will run all 8 checks and report results.