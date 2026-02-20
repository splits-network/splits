---
name: test
description: Scaffold and run Vitest tests following established patterns with mocked repositories, services, and access context.
---

# /test - Testing

Spawn the `testing` agent (`.claude/agents/testing.md`) to scaffold or run tests.

## Sub-Commands

- `/test:scaffold <service> <resource>` — Scaffold Vitest tests for a V2 resource

## Framework

- **Vitest** (not Jest)
- Config: Each service has its own `vitest.config.ts`

## Test Structure

```
services/<service>/tests/
  unit/
    <domain>.service.test.ts    — Service logic with mocked repository
  impl/
    <domain>.routes.test.ts     — HTTP routes with mocked service
```

## Running Tests

```bash
pnpm --filter @splits-network/<service> test    # Single service
pnpm test                                        # All services
```

## Canonical Reference

- Unit: `services/ats-service/tests/unit/jobs.service.test.ts`
- Integration: `services/ats-service/tests/impl/jobs.routes.test.ts`