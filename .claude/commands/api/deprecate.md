# /api:deprecate - Deprecate V2 Resource

**Description:** Mark a V2 resource as deprecated by adding deprecation headers and usage logging. V2 code behavior is not changed.

## Usage

```bash
/api:deprecate <service> <resource>
```

## Parameters

- `<service>` — Service containing the V2 resource (e.g., `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `recruiters`, `applications`)

## Prerequisites

- V3 replacement must exist and be registered
- `/api:validate <service> <resource>` should have passed on the V3 version
- Frontend consumers should be migrated first — run `/api-frontend:validate <resource>` to confirm

## Examples

```bash
/api:deprecate network-service recruiters
/api:deprecate ats-service applications
```

## What It Does

1. **Scans for remaining V2 consumers** — reports which files still call the V2 endpoints
2. **Adds deprecation headers** — `Deprecation`, `Sunset`, `Link` to successor V3 route
3. **Adds deprecation logging** — preHandler that logs every V2 call for tracking
4. **Updates documentation** — marks resource as deprecated in route file comments

## Rules

- **V2 behavior is NOT changed** — only headers and logging are added
- **Sets sunset date** at least 30 days out
- **Tracks usage** so you know when it's safe to remove

## Execution

Spawn the `api` agent to deprecate. It will scan consumers, add headers/logging to V2 routes, and report the deprecation status.