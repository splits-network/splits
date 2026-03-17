# /api:audit - Audit Service for V2 Compliance

**Description:** Audit an existing service's V2 routes for compliance and identify what needs migration to V3

## Usage

```bash
/api:audit <service>
```

## Parameters

- `<service>` — Service to audit (e.g., `ats-service`, `network-service`)

## Examples

```bash
/api:audit ats-service
/api:audit billing-service
```

## Audit Checklist

1. All 5 routes present per resource (LIST, GET, CREATE, PATCH, DELETE)
2. Responses use `{ data }` envelope
3. LIST returns pagination object
4. Auth check on all mutation routes
5. Access context resolves user roles before data access
6. Events published for all mutations
7. Validation in service layer (not routes)
8. Soft delete (not hard delete)
9. Identify routes that should be views in V3 (joins, shaped responses)
10. Identify routes that should be actions in V3 (state transitions, side effects)

## Execution

Spawn the `api` agent to audit. It will read all V2 files in the service, report compliance issues, and recommend which resources are ready for V3 migration.