# Roadmap: Splits Network

## Milestones

- [x] **v2.0 Global Search** - Phases 1-3 (shipped 2026-02-13)
- [x] **v3.0 Platform Admin Restructure** - Phases 4-7 (shipped 2026-02-13)
- [ ] **v4.0 Commute Types & Job Levels** - Phases 8-10 (in progress)

## Phases

<details>
<summary>v2.0 Global Search (Phases 1-3) - SHIPPED 2026-02-13</summary>

See MILESTONES.md for details.

</details>

<details>
<summary>v3.0 Platform Admin Restructure (Phases 4-7) - SHIPPED 2026-02-13</summary>

See MILESTONES.md for details.

</details>

### v4.0 Commute Types & Job Levels (In Progress)

**Milestone Goal:** Jobs accurately describe work arrangements and seniority level so recruiters and candidates can filter effectively.

## Overview

Add commute type (multi-select) and job level (single-select) fields to the jobs system. Work flows from database schema and TypeScript types, through the ATS service API layer, to the portal frontend and search index. Three phases covering foundation, API, and consumer layers.

- [x] **Phase 8: Schema & Types** - Database columns and TypeScript type definitions (completed 2026-02-13)
- [x] **Phase 9: API** - ATS service CRUD and filtering support (completed 2026-02-13)
- [ ] **Phase 10: Frontend & Search** - Job form UI, detail display, list filtering, and search index

## Phase Details

### Phase 8: Schema & Types
**Goal**: The database and type system know about commute types and job levels
**Depends on**: Nothing (first phase of v4.0)
**Requirements**: SCHM-01, SCHM-02, SCHM-03, TYPE-01, TYPE-02, TYPE-03
**Success Criteria** (what must be TRUE):
  1. jobs table has commute_types TEXT[] and job_level TEXT columns with CHECK constraints enforcing valid values
  2. Both columns default to NULL and existing jobs are unaffected by the migration
  3. TypeScript union types for commute type values and job level values exist in shared-types
  4. Job model, CreateJobDTO, and JobDTO include the new fields as optional properties
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md -- Database migration adding commute_types/job_level columns + TypeScript union types and DTO updates

### Phase 9: API
**Goal**: The ATS service accepts, persists, returns, and filters by commute types and job levels
**Depends on**: Phase 8
**Requirements**: API-01, API-02, API-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. POST /v2/jobs accepts commute_types and job_level and persists them to the database
  2. PATCH /v2/jobs/:id accepts commute_types and job_level and updates them
  3. GET /v2/jobs and GET /v2/jobs/:id return commute_types and job_level in the response
  4. Job list endpoint supports filtering by commute_type (any-match against array) and job_level
**Plans**: 1 plan

Plans:
- [x] 09-01-PLAN.md -- ATS service types, repository filtering, and service validation for commute_types and job_level

### Phase 10: Frontend & Search
**Goal**: Users can set, view, and filter by commute types and job levels in the portal
**Depends on**: Phase 9
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, SRCH-01
**Success Criteria** (what must be TRUE):
  1. Job create/edit form has a commute type multi-select (checkboxes) and a job level dropdown
  2. Job detail view displays commute types and job level with human-readable labels
  3. Job list page supports filtering by commute type and job level
  4. Search index includes commute_types and job_level so jobs appear in search results by these fields
**Plans**: TBD

Plans:
- [ ] 10-01: Job form commute type and job level controls
- [ ] 10-02: Job detail display and list filtering
- [ ] 10-03: Search index update

## Progress

**Execution Order:** 8 -> 9 -> 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 8. Schema & Types | v4.0 | 1/1 | Complete | 2026-02-13 |
| 9. API | v4.0 | 1/1 | Complete | 2026-02-13 |
| 10. Frontend & Search | v4.0 | 0/3 | Not started | - |

---
*Created: 2026-02-13*
*Last updated: 2026-02-13*
