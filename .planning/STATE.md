# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Platform admin is a system-level role assigned directly to a user — no organization membership required.
**Current focus:** Defining requirements for v3.0

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-02-13 — Milestone v3.0 Platform Admin Restructure started

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity (v2.0):**
- Total plans completed: 7
- Average duration: 4.4 min
- Total execution time: ~31 minutes

## Accumulated Context

### Decisions

- Nullable role_entity_id — platform admins have no entity to link to
- Only platform_admin moves to user_roles — company_admin/hiring_manager stay in memberships
- Remove synthetic platform organization entirely

### Pending Todos

None.

### Blockers/Concerns

**Reminder:** User must run migration `20260214000001_search_index_company_access_control.sql` in Supabase and rebuild search-service Docker container for v2.0 access control to take effect.

## Session Continuity

Last session: 2026-02-13
Stopped at: Defining requirements for v3.0
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
