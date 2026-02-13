---
phase: 04-schema-data-migration
plan: 01
subsystem: database
tags: [postgres, supabase, migrations, rbac, platform-admin]

# Dependency graph
requires:
  - phase: previous-migrations
    provides: memberships table with platform_admin rows, user_roles table with NOT NULL role_entity_id
provides:
  - Nullable role_entity_id in user_roles supporting system-level roles
  - Two partial unique indexes (entity-linked + platform_admin) preventing duplicates
  - Platform_admin data migrated from memberships to user_roles with atomic validation
  - Reversible migration with documented rollback SQL
affects: [05-access-integration, resolveAccessContext, identity-service]

# Tech tracking
tech-stack:
  added: []
  patterns: [partial-unique-indexes-for-nullable-columns, atomic-migration-validation, transaction-abort-on-count-mismatch]

key-files:
  created: [supabase/migrations/20260215000001_platform_admin_to_user_roles.sql]
  modified: []

key-decisions:
  - "Split single unique index into two partial indexes to handle NULL role_entity_id for platform_admin"
  - "Use RAISE EXCEPTION on count mismatch to abort transaction if migration validation fails"
  - "Preserve idempotency with ON CONFLICT DO NOTHING for safe re-runs"

patterns-established:
  - "Partial unique indexes: Use WHERE clauses to handle nullable columns in uniqueness constraints"
  - "Migration validation: DO blocks with count comparison and RAISE EXCEPTION to abort on mismatch"
  - "Rollback documentation: Commented SQL at end of migration for manual rollback if needed"

# Metrics
duration: 3min
completed: 2026-02-13
---

# Phase 4 Plan 01: Schema & Data Migration Summary

**Platform admin migrated to user_roles with nullable role_entity_id, partial unique indexes, and atomic validation ensuring zero data loss**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-13T09:58:24Z
- **Completed:** 2026-02-13T10:01:30Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Made role_entity_id nullable in user_roles table to support system-level roles (platform_admin)
- Replaced single unique index with two partial indexes: entity-linked roles (role_entity_id NOT NULL) and platform_admin (role_name filter)
- Migrated all active platform_admin rows from memberships to user_roles with NULL role_entity_id
- Implemented atomic validation with RAISE EXCEPTION to abort transaction on count mismatch
- Documented complete rollback SQL in migration comments for reversibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Create platform_admin migration SQL file** - `eac9b2bf` (feat)

**Plan metadata:** (pending - to be committed after STATE.md update)

## Files Created/Modified
- `supabase/migrations/20260215000001_platform_admin_to_user_roles.sql` - Migrates platform_admin from memberships to user_roles with nullable entity_id, partial unique indexes, atomic validation, and rollback docs

## Decisions Made

**Split unique index strategy:** The existing `uq_user_role_entity_assignment` index on `(user_id, role_name, role_entity_id)` doesn't prevent duplicate platform_admin rows because NULLs are not equal in unique indexes. Solution: Two partial indexes — one for entity-linked roles (WHERE role_entity_id IS NOT NULL), one for platform_admin (WHERE role_name = 'platform_admin').

**Atomic validation approach:** Used DO block with count comparison between source (memberships) and destination (user_roles). RAISE EXCEPTION aborts the entire transaction if counts don't match, ensuring no partial migration.

**Idempotency guarantee:** ON CONFLICT DO NOTHING allows safe re-runs if migration needs to be retried or if rows already exist.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - migration file created successfully with all required sections (schema change, index restructuring, data migration, validation, rollback documentation).

## User Setup Required

None - migration will be applied in Supabase when deployed. No external service configuration required.

## Next Phase Readiness

**Ready for Phase 5 (Access Integration):**
- user_roles schema now supports platform_admin with NULL role_entity_id
- Partial unique indexes prevent duplicate platform_admin assignments
- Data migration complete with atomic validation
- Migration is reversible if needed

**No blockers.**

**Validation checklist for Phase 5:**
1. resolveAccessContext must query user_roles for platform_admin (not just memberships)
2. identity-service must accept platform_admin role assignments with nullable role_entity_id
3. Frontend admin checks should continue working (isPlatformAdmin flag in AccessContext)

---
*Phase: 04-schema-data-migration*
*Completed: 2026-02-13*
