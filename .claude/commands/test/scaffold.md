# /test:scaffold - Scaffold Vitest Tests

**Description:** Scaffold unit and integration tests for a V2 resource

## Usage

```bash
/test:scaffold <service> <resource>
```

## Parameters

- `<service>` — Target service (e.g., `ats-service`, `network-service`)
- `<resource>` — Resource name (e.g., `jobs`, `interviews`)

## Examples

```bash
/test:scaffold ats-service interviews
/test:scaffold network-service skill-assessments
/test:scaffold billing-service invoices
```

## What Gets Created

1. `services/<service>/tests/unit/<resource>.service.test.ts` — Unit tests with mocked repository
2. `services/<service>/tests/impl/<resource>.routes.test.ts` — Integration tests with mocked service

## Execution

Spawn the `testing` agent. It will:
1. Read the resource's service.ts and routes.ts to understand the API surface
2. Read canonical test references (`ats-service/tests/`)
3. Scaffold unit tests covering all service methods
4. Scaffold integration tests covering all 5 routes
5. Mock patterns: `vi.fn()` for repositories, `AccessContextResolver` mock returning test context
