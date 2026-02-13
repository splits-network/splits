# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Platform admin is a system-level role assigned directly to a user — no organization membership required.
**Current focus:** Phase 5 - Access Integration

## Current Position

Phase: 5 of 6 (Access Integration)
Plan: 1 of 2 in current phase
Status: Phase in progress
Last activity: 2026-02-13 — Completed 05-01-PLAN.md (Update resolveAccessContext)

Progress: [██░░░░░░░░] 20% (2/10 plans complete)

## Performance Metrics

**Velocity (v2.0):**
- Total plans completed: 7
- Average duration: 4.4 min
- Total execution time: ~31 minutes

**v3.0 Velocity:**
- Total plans completed: 2
- Average duration: 4.0 min
- Total execution time: 0.13 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 4 | 1 | 3min | 3min |
| Phase 5 | 1 | 5min | 5min |

**Recent Trend:**
- Last 5 plans: 3min, 5min (avg: 4min)
- Trend: Consistent fast execution on focused integration tasks

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Nullable role_entity_id in user_roles — Platform admins don't link to an entity (recruiter/candidate). Nullable is simplest change.
- Only platform_admin moves — company_admin and hiring_manager are legitimately org-scoped. No reason to change them.
- Remove platform organization entirely — Clean break. No synthetic data in the system.
- Split unique index strategy (04-01) — Two partial indexes instead of one: entity-linked (WHERE role_entity_id IS NOT NULL) and platform_admin (WHERE role_name = 'platform_admin') to handle NULL values correctly.
- Atomic validation approach (04-01) — RAISE EXCEPTION in DO block aborts entire transaction if migration count mismatch detected.
- Minimal code change approach (05-01) — Made EntityRoleRow.role_entity_id nullable (string | null). Existing deduplicated roles union already supports dual-read.
- Zero downstream impact (05-01) — EntityRoleRow is internal (not exported). AccessContext interface unchanged, 119+ consumers unaffected.

### Pending Todos

None yet.

### Blockers/Concerns

**Phase 4 Risks:**
- ~~Losing all platform admin access if migration transaction boundaries fail~~ — MITIGATED: Atomic validation with RAISE EXCEPTION implemented in 04-01
- ~~NOT NULL constraint blocking INSERT if schema not updated first~~ — RESOLVED: Migration sequences ALTER TABLE before data migration

**Phase 5 Risks:**
- ~~Race condition during deployment if some services read old table~~ — RESOLVED: Dual-read implemented in 05-01 (checks both user_roles and memberships)

**Phase 6 Risks:**
- Foreign key violations preventing platform org deletion — check FK references before deletion

**From v2.0:**
- User must run migration `20260214000001_search_index_company_access_control.sql` in Supabase and rebuild search-service Docker container for v2.0 access control to take effect.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 05-01-PLAN.md (Update resolveAccessContext)
Resume file: None
Next: 05-02-PLAN.md (Update identity-service role assignment endpoints)

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
