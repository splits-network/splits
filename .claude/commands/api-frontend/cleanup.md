# /api-frontend:cleanup - Clean Up V2 Frontend Artifacts

**Description:** Remove dead V2 compatibility code, unused types, and stale imports left over from the migration. This step is optional but recommended.

## Usage

```bash
/api-frontend:cleanup <resource>
```

## Parameters

- `<resource>` — Resource name in kebab-case (e.g., `candidates`, `jobs`, `applications`)

## Prerequisites

- `/api-frontend:validate <resource>` must have passed

## Examples

```bash
/api-frontend:cleanup candidates
/api-frontend:cleanup applications
```

## What It Does

1. **Scans for dead code** — unused type imports, unused filter constants, commented-out V2 code
2. **Removes dead imports** — type definitions only used with V2 responses
3. **Removes unused filter constants** — label maps or option arrays for V2-specific values
4. **Removes TODO comments** — `// TODO: migrate to v3` that are now resolved
5. **Removes commented-out V2 code** — `// Old V2 endpoint: "/candidates"` style leftovers
6. **Verifies build** — `pnpm --filter @splits-network/<app> build` after cleanup

## Rules

- **Only run after validate passes** — don't clean up until migration is confirmed complete
- **One app at a time** — commit cleanup per app
- **Verify build** after each cleanup pass

## Execution

Spawn the `api-frontend` agent to cleanup. It will scan for V2 artifacts, remove them, and verify the build.