---
phase: 06
plan: 01
subsystem: schema
tags: [migration, cleanup, database, types, platform-admin]
dependency-graph:
  requires: [04-01, 05-01, 05-02]
  provides: [platform-org-removed, legacy-data-cleanup]
  affects: [06-02]
tech-stack:
  added: []
  patterns: [FK-safe-deletion, pre-flight-validation]
key-files:
  created:
    - supabase/migrations/20260216000001_remove_platform_organization.sql
  modified:
    - packages/shared-access-context/src/index.ts
    - packages/shared-types/src/models.ts
    - packages/shared-clients/src/identity-client.ts
decisions: []
metrics:
  duration: 2min
  completed: 2026-02-13
---

# Phase 06 Plan 01: Remove Platform Organization Summary

**One-liner:** Cleanup migration removes synthetic platform organization and legacy platform_admin memberships after Phase 4-5 migration complete

## What Was Built

### SQL Migration (20260216000001_remove_platform_organization.sql)

**7-step FK-safe deletion sequence:**

1. **Pre-flight validation** — Verifies platform_admin exists in user_roles before deleting legacy data. RAISE EXCEPTION if count = 0 (prevents accidental deletion if Phase 4 migration hasn't run).

2. **Soft-delete platform_admin memberships** — SET deleted_at = now() on all memberships WHERE role_name = 'platform_admin'. Matches codebase soft-delete pattern (all queries filter on deleted_at IS NULL).

3. **FK verification** — Checks for references to platform org in invitations, companies, teams tables before deletion. RAISE EXCEPTION if any found. Soft-deleted memberships from Step 2 won't block (deleted_at set).

4. **Hard-delete memberships** — DELETE FROM memberships WHERE organization_id IN (platform org). Removes ALL membership rows (including soft-deleted ones) referencing platform org. Required because FK is NOT cascade delete.

5. **Hard-delete platform organization** — DELETE FROM organizations WHERE type = 'platform'.

6. **Update CHECK constraint** — Drop and recreate organizations_type_check without 'platform': CHECK (type = ANY (ARRAY['company'::text])). Only 'company' remains (recruiter is TS-only type).

7. **Update table comments** — Document post-migration state: "Platform admin is in user_roles, not here."

**Rollback documentation** — Commented SQL at end shows how to re-insert platform org and restore constraint. Notes that membership data cannot be auto-restored (one-way cleanup).

### TypeScript Type Cleanup

**packages/shared-access-context/src/index.ts**
- Removed "During migration period (v3.0 Phase 5-6)" paragraph from JSDoc
- Updated to: "user_roles: entity-linked roles (recruiter, candidate) with role_entity_id, and system-level roles (platform_admin) with role_entity_id = NULL"
- No code changes, only JSDoc cleanup

**packages/shared-types/src/models.ts**
- Organization.type: Changed from `'company' | 'platform' | 'recruiter'` to `'company' | 'recruiter'`
- Removed 'platform' as valid organization type

**packages/shared-clients/src/identity-client.ts**
- createOrganization: Changed type param from `'company' | 'platform'` to `'company'`
- Updated membership comment: Removed platform_admin from "(org-scoped: company_admin, hiring_manager, platform_admin)" → "(org-scoped: company_admin, hiring_manager)"

**Build verification:** All three packages (shared-access-context, shared-types, shared-clients) build cleanly with zero TypeScript errors.

## Key Technical Decisions

None — this plan executed pre-defined cleanup from Phase 4-5 design decisions.

## Deviations from Plan

None — plan executed exactly as written.

## Files Modified

### Created
- `supabase/migrations/20260216000001_remove_platform_organization.sql` (152 lines) — FK-safe cleanup migration

### Modified
- `packages/shared-access-context/src/index.ts` — JSDoc cleanup (no code changes)
- `packages/shared-types/src/models.ts` — Organization.type excludes 'platform'
- `packages/shared-clients/src/identity-client.ts` — createOrganization only accepts 'company'

## Dependencies

### Requires
- **04-01** (platform_admin_to_user_roles migration) — Must run first (pre-flight check enforces this)
- **05-01** (resolveAccessContext dual-read) — Access layer already migrated to user_roles
- **05-02** (identity-service platform admin API) — API already supports user_roles

### Provides
- **platform-org-removed** — Platform organization deleted from database
- **legacy-data-cleanup** — All platform_admin memberships removed
- **type-safety** — TypeScript types reflect post-migration state

### Affects
- **06-02** (V2 API validation) — Will validate system works without platform org

## Testing Performed

1. **TypeScript compilation** — All three packages build cleanly:
   - `pnpm --filter @splits-network/shared-access-context build` ✓
   - `pnpm --filter @splits-network/shared-types build` ✓
   - `pnpm --filter @splits-network/shared-clients build` ✓

2. **Migration review** — Verified:
   - Pre-flight check exists (platform_admin must be in user_roles)
   - FK-safe deletion order (memberships → organization)
   - Constraint update removes 'platform'
   - Rollback SQL documented

## Next Phase Readiness

**Ready for 06-02 (V2 API Validation):**
- Database migration ready to apply (user must run in Supabase)
- TypeScript types cleaned up
- Access layer already migrated (05-01)
- API already supports user_roles (05-02)

**No blockers.**

**Migration application:** User must apply migration 20260216000001 in Supabase before 06-02 validation can confirm platform org removal.

## Notes

**One-way cleanup:** This migration is designed to be irreversible in practice. While rollback SQL is documented, membership data cannot be auto-restored. Once applied, the platform organization and its memberships are permanently removed.

**FK-safe deletion:** Critical implementation detail — memberships table FK to organizations is NOT cascade delete. Must hard-delete ALL memberships (including soft-deleted ones) before deleting the organization. Steps 2-4 handle this sequence correctly.

**Pre-flight validation:** Prevents accidental deletion if Phase 4 migration hasn't been applied. RAISE EXCEPTION if no platform_admin rows exist in user_roles.

**Type safety maintained:** All downstream code already migrated in Phase 5. Removing 'platform' from Organization.type does not break any existing code — it just enforces what's already true (platform org no longer exists).
