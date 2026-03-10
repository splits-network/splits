# /api:remove - Remove Deprecated V2 Resource

**Description:** Permanently remove a deprecated V2 resource after confirming zero consumers remain. This is destructive and irreversible.

## Usage

```bash
/api:remove <service> <resource>
```

## Parameters

- `<service>` — Service containing the deprecated V2 resource (e.g., `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `recruiters`, `applications`)

## Prerequisites

- Resource must have been deprecated via `/api:deprecate`
- V3 replacement must be live and validated
- No V2 consumers remaining in the codebase
- No recent deprecation log entries (< 14 days)

## Examples

```bash
/api:remove network-service recruiters
/api:remove ats-service applications
```

## What It Does

1. **Verifies zero consumers** — re-scans entire codebase for V2 references
2. **Checks deprecation logs** — refuses if any calls in the last 14 days
3. **Confirms with user** — lists all files to be deleted, requires explicit approval
4. **Deletes V2 code** — removes the `v2/<resource>/` folder
5. **Cleans up** — removes route registration, gateway proxy, broken imports
6. **Verifies build** — runs `pnpm build` to confirm no broken references

## Rules

- **MANDATORY user confirmation** before any deletion
- **Never remove if recent V2 calls exist** (< 14 days in logs)
- **One resource at a time** — don't batch removals
- **Irreversible** — make sure V3 is solid before removing V2

## Execution

Spawn the `api` agent to remove. It will verify safety, get user approval, then delete the V2 code and clean up references.