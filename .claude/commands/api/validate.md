# /api:validate - Validate V3 Resource

**Description:** Validate a V3 resource against all new standards. Stricter than the V2 audit — covers 38 checks across 8 categories.

## Usage

```bash
/api:validate <service> <resource>
```

## Parameters

- `<service>` — Service containing the V3 resource (e.g., `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `recruiters`, `applications`)

## Examples

```bash
/api:validate network-service recruiters
/api:validate ats-service applications
```

## Validation Categories

1. **File structure** — correct files exist, no extra files
2. **Route compliance** — core 5 only, views GET-only, actions POST-only, JSON schemas
3. **Service compliance** — no HTTP concepts, typed errors, event publishing
4. **Repository compliance** — no joins in core, sort allowlists, pagination
5. **Types compliance** — JSON schemas match interfaces, additionalProperties: false
6. **URL structure** — correct v3 paths for core, views, actions
7. **Performance** — field selection, caching, idempotency, no N+1
8. **File size** — routes <150, services <300, repos <400, types <200
9. **Gateway integration** — declarative route config exists in `v3/<service>.ts`, uses `registerV3Routes()`, no custom handlers

## Output

Reports each check as:
- **PASS** — meets the standard
- **FAIL** — violates the standard (must fix)
- **WARN** — not ideal but acceptable (should fix)

## Execution

Spawn the `api` agent to validate. It will read all V3 files for the resource and run the full 38-check validation.