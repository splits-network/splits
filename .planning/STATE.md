# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Jobs accurately describe work arrangements and seniority level
**Current focus:** v4.0 Commute Types & Job Levels

## Current Position

Phase: 10 of 10 (Frontend & Search)
Plan: 2 of 5 in current phase
Status: In progress
Last activity: 2026-02-13 — Completed 10-02-PLAN.md

Progress: [███░░░░░░░] 22%

## Performance Metrics

**Velocity (v2.0):**
- Total plans completed: 7
- Average duration: 4.4 min
- Total execution time: ~31 minutes

**Velocity (v3.0):**
- Total plans completed: 6
- Average duration: 3.2 min
- Total execution time: ~19 minutes

**Velocity (v4.0):**
- Total plans completed: 5
- Average duration: 2.6 min
- Total execution time: ~13.3 minutes

**Cumulative:**
- Total plans completed: 18
- Average duration: 3.5 min
- Total execution time: ~63 minutes

## Accumulated Context

### Decisions

- commute_types as TEXT[] array (multi-select, Postgres array with @> filtering)
- Hybrid granularity: hybrid_1 through hybrid_4 (1-4 days in office)
- job_level as TEXT with CHECK constraint (8 levels: entry -> c_suite)
- Keep open_to_relocation as-is (orthogonal to commute type)
- Inline literal types in dtos.ts (no model imports in that file)
- commute_types placed after open_to_relocation in Job interface (semantic grouping)
- Used Supabase .overlaps() (Postgres &&) for commute_type any-match filtering
- Self-contained VALID_COMMUTE_TYPES/VALID_JOB_LEVELS const arrays in service.ts (no shared-types coupling)
- commute_type filter supports both top-level query param and nested filters object
- Search index metadata stores commute_types as JSONB array via to_jsonb()
- Search context includes array values via array_to_string() for full-text matching
- Job wizard uses checkbox group (flex-wrap) for commute types, dropdown for job level
- Conditional payload inclusion: only send commute_types/job_level if set (preserves null on edit)
- Job detail views use label maps for human-readable display (COMMUTE_TYPE_LABELS, JOB_LEVEL_LABELS)
- Single-select dropdowns for commute_type and job_level filters (matches API any-match semantics)

### Pending Todos

None.

### Blockers/Concerns

**From v2.0:**
- User must run migration `20260214000001_search_index_company_access_control.sql` in Supabase and rebuild search-service Docker container for v2.0 access control to take effect.

**From v3.0:**
- User should run `supabase gen types typescript` to regenerate database.types.ts after applying Phase 4 migration.

**From v4.0:**
- User must apply migration `20260217000001_add_commute_types_and_job_level.sql` and run `supabase gen types typescript` to regenerate database.types.ts.
- User must apply migration `20260218000001_search_index_add_commute_and_level.sql` to update search index triggers.

## Session Continuity

Last session: 2026-02-13
Stopped at: Completed 10-02-PLAN.md (Job Detail Display & Filters)
Resume file: None
Next: Continue Phase 10 with remaining plans (03-05)

---
*Created: 2026-02-12*
*Last updated: 2026-02-13 (Phase 10 in progress - Plan 02 complete)*
