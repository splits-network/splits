---
phase: 05-access-integration
plan: 02
subsystem: api
tags: [identity-service, user-roles, rbac, platform-admin, events, audit]

# Dependency graph
requires:
  - phase: 04-schema-data-migration
    provides: user_roles table with nullable role_entity_id, migrated platform_admin data
provides:
  - identity-service user-roles API accepting platform_admin with null role_entity_id
  - Conditional validation: entity_id required for entity-linked roles, optional for system-level roles
  - Enriched user_role.deleted event with user_id, role_name, role_entity_id for audit trail
affects: [06-cleanup, audit-service, analytics]

# Tech tracking
tech-stack:
  added: []
  patterns: [conditional validation by role type, enriched event payloads for audit]

key-files:
  created: []
  modified:
    - services/identity-service/src/v2/user-roles/types.ts
    - services/identity-service/src/v2/user-roles/service.ts

key-decisions:
  - "SYSTEM_ROLES constant defines which roles don't need entity linkage (currently platform_admin)"
  - "Enriched delete events with full role context for audit trail (AUDIT-01 requirement)"

patterns-established:
  - "Conditional validation pattern: check role type before enforcing entity_id requirement"
  - "Event enrichment pattern: capture full entity state before deletion for audit"

# Metrics
duration: 5min
completed: 2026-02-13
---

# Phase 5 Plan 2: Identity Service Platform Admin API Support Summary

**Identity-service user-roles API now accepts platform_admin with null role_entity_id, validates conditionally, and publishes enriched audit events**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-13T10:12:06Z
- **Completed:** 2026-02-13T10:17:22Z
- **Tasks:** 1
- **Files modified:** 2

## Accomplishments
- UserRoleCreate interface updated with optional role_entity_id field
- Conditional validation implemented: entity_id required for entity-linked roles (recruiter, candidate), optional for system-level roles (platform_admin)
- user_role.deleted event enriched with user_id, role_name, role_entity_id for comprehensive audit trail
- identity-service compiles cleanly with all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Update user-roles types and service for platform_admin support** - `791d5bc0` (feat)

## Files Created/Modified
- `services/identity-service/src/v2/user-roles/types.ts` - Made role_entity_id optional in UserRoleCreate interface, updated JSDoc to document system-level roles
- `services/identity-service/src/v2/user-roles/service.ts` - Added SYSTEM_ROLES constant, conditional validation logic, enriched delete event payload, updated JSDoc

## Decisions Made

**SYSTEM_ROLES constant for role classification**
- Created constant array to define which roles are system-level (don't need entity linkage)
- Currently contains only 'platform_admin', extensible for future system roles
- Rationale: Explicit list makes validation intent clear and easy to extend

**Event enrichment for audit trail**
- user_role.deleted event now includes user_id, role_name, role_entity_id (was only user_role_id)
- user_role.created event already had full payload (no change needed)
- Rationale: Supports AUDIT-01 requirement for comprehensive audit logging

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward implementation. TypeScript compilation succeeded on first build.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 6 (Cleanup):**
- identity-service user-roles API fully supports platform_admin role creation/deletion
- Events publish with full context for audit/analytics consumers
- Conditional validation pattern established for future role types

**No blockers:**
- All changes backward compatible (role_entity_id made optional, not removed)
- Existing entity-linked role validation still enforced
- No breaking changes to event schemas (only enriched, not restructured)

**Integration points verified:**
- Routes already pass request body through to service (no changes needed)
- Repository already handles nullable role_entity_id (no changes needed)
- Authorization still works via resolveAccessContext reading memberships (legacy data intact until Phase 6)

---
*Phase: 05-access-integration*
*Completed: 2026-02-13*
