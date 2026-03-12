---
name: api-frontend
description: Migrate frontend apps from V2 to V3 API endpoints. Scan consumers, update hooks/types/calls, validate completeness.
---

# /api-frontend - Frontend API V3 Migration

Spawn the `api-frontend` agent (`.claude/agents/api-frontend.md`) to migrate frontend consumers.

**Frontend migration happens AFTER backend migration.** The backend V3 resource must exist and be registered in the gateway before frontend work begins.

## Sub-Commands

- `/api-frontend:scan <resource>` — Scan all frontend consumers and generate migration checklist (HTML report)
- `/api-frontend:migrate <resource>` — Update all consumer files to use V3 endpoints
- `/api-frontend:validate <resource>` — Verify zero V2 references remain, all V3 calls correct
- `/api-frontend:cleanup <resource>` — Remove dead V2 compatibility code (optional)

### Migration Lifecycle

**scan** → **migrate** → **validate** → **cleanup**

## Integration with Backend `/api:*` Workflow

Full end-to-end migration:

```
Phase 1: Backend
  /api:plan → /api:migrate → /api:validate

Phase 2: Frontend (this skill)
  /api-frontend:scan → /api-frontend:migrate → /api-frontend:validate → /api-frontend:cleanup

Phase 3: V2 Cleanup
  /api:deprecate → /api:remove
```

The frontend scan reads the backend plan report at `.planning/api-migrations/<resource>-plan.html`.

## Key Patterns

### API Client Version Detection

- **V2 (auto-prefix)**: `endpoint: "/candidates"` → `GET baseUrl/api/v2/candidates`
- **V3 (full path)**: `endpoint: "/api/v3/candidates/views/recruiter-board"` → `GET baseUrl/api/v3/candidates/views/recruiter-board`

The `SplitsApiClient` at `packages/shared-api-client/src/index.ts:163` checks `endpoint.startsWith('/api/v')`. If true, the path is used as-is. If false, it gets the `/api/v2` prefix.

**Migration = changing short paths to full V3 paths.**

### Consumer Types

| Type | Example | Migration Action |
|---|---|---|
| `useStandardList` hook | `endpoint: "/candidates"` | Change to full V3 path, remove `include` |
| Direct client call | `client.get("/candidates/123")` | Change to V3 path or view |
| Type definition | `interface Candidate { ... }` | Update to match V3 response shape |
| Filter config | `defaultFilters: { status_filter: ... }` | Update if V3 renamed filters |
| Test mock | `nock("/api/v2/candidates")` | Update URL in mocks |

### Multi-App Surface

| App | Typical View Pattern | Auth |
|---|---|---|
| Portal | `recruiter-board`, `recruiter-detail` | Clerk (required) |
| Candidate | `candidate-listing`, `candidate-detail` | Clerk (optional) |
| Admin | `admin-board`, `admin-detail` | Clerk (required) |
| Corporate | `public-listing` | None |

The same V2 endpoint may map to **different V3 views** depending on which app consumes it.

### Canonical Reference

- `apps/portal/src/app/portal/roles/page.tsx` — V3 list endpoint pattern
- `apps/portal/src/components/save-bookmark.tsx` — V3 direct client call pattern
