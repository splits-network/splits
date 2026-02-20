# /api:scaffold - Scaffold New V2 Resource

**Description:** Scaffold a complete V2 resource with types, repository, service, and routes

## Usage

```bash
/api:scaffold <service> <resource>
```

## Parameters

- `<service>` — Target service (e.g., `ats-service`, `network-service`)
- `<resource>` — Resource name in kebab-case (e.g., `interviews`, `skill-assessments`)

## Examples

```bash
/api:scaffold ats-service interviews
/api:scaffold network-service skill-assessments
/api:scaffold billing-service invoices
```

## What Gets Created

1. `services/<service>/src/v2/<resource>/types.ts`
2. `services/<service>/src/v2/<resource>/repository.ts`
3. `services/<service>/src/v2/<resource>/service.ts`
4. `services/<service>/src/v2/<resource>/routes.ts`
5. Updated `services/<service>/src/v2/routes.ts` (route registry)
6. Gateway proxy in `services/api-gateway/src/routes/v2/`

## Execution

Spawn the `api` agent with context about the target service and resource. The agent will:
1. Read the canonical reference (`ats-service/src/v2/jobs/`) for patterns
2. Read the target service's existing V2 structure
3. Scaffold all files following the established patterns
4. Register routes in the parent routes.ts
5. Add the gateway proxy route