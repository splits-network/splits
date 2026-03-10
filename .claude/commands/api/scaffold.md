# /api:scaffold - Scaffold New V3 Resource

**Description:** Scaffold a complete V3 resource with types, repository, service, and routes

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

1. `services/<service>/src/v3/<resource>/types.ts`
2. `services/<service>/src/v3/<resource>/repository.ts`
3. `services/<service>/src/v3/<resource>/service.ts`
4. `services/<service>/src/v3/<resource>/routes.ts`
5. Updated `services/<service>/src/v3/routes.ts` (route registry)
6. Gateway route declaration in `services/api-gateway/src/routes/v3/<service-domain>.ts`

## Execution

Spawn the `api` agent with context about the target service and resource. The agent will:
1. Read the agent instructions (`.claude/agents/api.md`) for V3 patterns
2. Read the target service's existing structure
3. Scaffold all core CRUD files following V3 patterns (no joins, JSON schema validation)
4. Register routes in the parent v3/routes.ts
5. Add declarative gateway route config (using `registerV3Routes()` from `v3/proxy.ts`)
6. Optionally scaffold views/ and actions/ if specified (each gets a gateway entry too)