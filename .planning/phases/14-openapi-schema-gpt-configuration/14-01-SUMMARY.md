---
phase: 14-openapi-schema-gpt-configuration
plan: 01
subsystem: api
tags: [openapi, gpt, oauth2, schema, js-yaml]

# Dependency graph
requires:
  - phase: 13-gpt-api-endpoints
    provides: 5 GPT Action endpoints for job search, application management, and resume analysis
provides:
  - OpenAPI 3.0.1 schema defining all 5 GPT Actions with OAuth2 security
  - Schema serving endpoints at /api/v2/openapi.yaml and /api/v2/openapi.json
  - Gateway proxy routes mapping /api/v1/gpt/openapi.* to gpt-service
affects: [15-gpt-builder-configuration]

# Tech tracking
tech-stack:
  added: [js-yaml, @types/js-yaml]
  patterns: [Static YAML schema served at module initialization, OpenAPI 3.0.1 for GPT Builder compatibility]

key-files:
  created:
    - services/gpt-service/src/openapi.yaml
    - services/gpt-service/src/openapi-route.ts
  modified:
    - services/gpt-service/src/v2/routes.ts

key-decisions:
  - "OpenAPI 3.0.1 (not 3.1) for GPT Builder compatibility"
  - "Static hand-crafted schema (not auto-generated) for rich behavioral descriptions"
  - "x-openai-isConsequential: true on submitApplication, false on analyzeResume"
  - "Public schema endpoints (no auth) for GPT Builder import"
  - "Load schema at module initialization for performance"

patterns-established:
  - "OpenAPI schema with rich behavioral hints guides GPT action selection"
  - "Data envelope pattern ({ data: ... }) documented in all response schemas"
  - "Comprehensive parameter examples and descriptions for AI understanding"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 14 Plan 01: OpenAPI Schema + GPT Configuration Summary

**OpenAPI 3.0.1 schema defining all 5 GPT Actions with OAuth2 security, x-openai-isConsequential annotations, and rich behavioral descriptions served at /api/v1/gpt/openapi.yaml**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T18:08:11Z
- **Completed:** 2026-02-13T18:11:53Z
- **Tasks:** 2
- **Files modified:** 3 created, 1 modified

## Accomplishments
- Complete OpenAPI 3.0.1 schema (727 lines) defining all 5 GPT Actions with operationIds, parameters, request/response schemas, and security
- OAuth2 security scheme with 4 scopes (jobs:read, applications:read, applications:write, resume:read)
- x-openai-isConsequential annotations (true for submitApplication, false for analyzeResume)
- Schema serving endpoints at /api/v2/openapi.yaml (YAML) and /api/v2/openapi.json (JSON)
- Gateway wildcard proxy automatically routes /api/v1/gpt/openapi.* to gpt-service

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OpenAPI 3.0.1 schema file** - `720766ab` (feat)
2. **Task 2: Create schema serving endpoint and wire into service** - `ad792fe8` (feat)

## Files Created/Modified

**Created:**
- `services/gpt-service/src/openapi.yaml` - Complete OpenAPI 3.0.1 schema with all 5 GPT Actions, OAuth2 security, component schemas, and behavioral descriptions
- `services/gpt-service/src/openapi-route.ts` - Route handler serving schema in YAML and JSON formats with module-level initialization

**Modified:**
- `services/gpt-service/src/v2/routes.ts` - Added registerOpenapiRoute import and call
- `services/gpt-service/package.json` - Added js-yaml and @types/js-yaml dependencies

## Decisions Made

**1. OpenAPI 3.0.1 over 3.1**
- GPT Builder only supports OpenAPI 3.0.x as of early 2025
- Avoids compatibility issues during import

**2. Static hand-crafted schema**
- Rich behavioral descriptions guide GPT on when/how to use each action
- Example: "Use this when the candidate asks to find jobs, look for opportunities, or mentions specific roles, skills, or locations"
- Auto-generated schemas lack this contextual guidance

**3. x-openai-isConsequential annotations**
- submitApplication: true (creates state, requires confirmation)
- analyzeResume: false (read-only analysis, no side effects)
- Guides GPT safety mechanisms

**4. Public schema endpoints**
- No authentication required for /openapi.yaml and /openapi.json
- GPT Builder needs unauthenticated access to import schema

**5. Module-level schema loading**
- Load and parse YAML once at startup using readFileSync
- Avoids repeated file I/O on every request

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Next Phase Readiness

**Ready for Phase 15 (GPT Builder Configuration):**
- OpenAPI schema accessible at https://api.splits.network/api/v1/gpt/openapi.yaml
- All 5 GPT Actions defined with complete documentation
- OAuth2 URLs documented for GPT Builder OAuth configuration
- Scope definitions ready for action-to-scope mapping

**Schema validation confirmed:**
- Valid YAML syntax (validated with js-yaml)
- All 5 endpoints present with operationIds
- OAuth2 security scheme defined
- Enum values match codebase (6 commute types, 8 job levels)
- x-openai-isConsequential on both write operations
- All component schemas use data envelope pattern

---
*Phase: 14-openapi-schema-gpt-configuration*
*Completed: 2026-02-13*
