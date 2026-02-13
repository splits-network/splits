# Requirements: Commute Types & Job Levels

**Defined:** 2026-02-13
**Core Value:** Jobs accurately describe work arrangements and seniority level so recruiters and candidates can filter effectively.

## v1 Requirements

### Schema

- [x] **SCHM-01**: jobs table has `commute_types TEXT[]` column with CHECK constraint limiting values to `remote`, `hybrid_1`, `hybrid_2`, `hybrid_3`, `hybrid_4`, `in_office`
- [x] **SCHM-02**: jobs table has `job_level TEXT` column with CHECK constraint limiting values to `entry`, `mid`, `senior`, `lead`, `manager`, `director`, `vp`, `c_suite`
- [x] **SCHM-03**: Both columns default to NULL (optional fields on existing jobs)

### Types

- [x] **TYPE-01**: shared-types Job model includes `commute_types` and `job_level` fields
- [x] **TYPE-02**: DTOs (CreateJobDTO, JobDTO) include new fields
- [x] **TYPE-03**: TypeScript union types defined for commute type values and job level values

### API

- [x] **API-01**: ats-service accepts `commute_types` and `job_level` on job creation (POST /v2/jobs)
- [x] **API-02**: ats-service accepts `commute_types` and `job_level` on job update (PATCH /v2/jobs/:id)
- [x] **API-03**: ats-service returns `commute_types` and `job_level` in job responses
- [x] **API-04**: ats-service supports filtering jobs by `commute_type` (any match in array)
- [x] **API-05**: ats-service supports filtering jobs by `job_level`

### Frontend

- [ ] **UI-01**: Job create/edit form includes commute type multi-select (checkboxes)
- [ ] **UI-02**: Job create/edit form includes job level dropdown (single-select)
- [ ] **UI-03**: Job detail view displays commute types with human-readable labels
- [ ] **UI-04**: Job detail view displays job level with human-readable label
- [ ] **UI-05**: Job list supports filtering by commute type
- [ ] **UI-06**: Job list supports filtering by job level

### Search

- [ ] **SRCH-01**: Search index includes commute_types and job_level for job entities

## Out of Scope

| Feature | Reason |
|---------|--------|
| Removing open_to_relocation | Orthogonal concern — relocation is independent of commute type |
| Commute type preferences on candidate profiles | Different milestone — candidate profile enhancements |
| Salary adjustments based on commute type | Business logic complexity, defer |
| Location validation based on commute type | Remote jobs don't need location, but not enforcing this now |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHM-01 | Phase 8 | Complete |
| SCHM-02 | Phase 8 | Complete |
| SCHM-03 | Phase 8 | Complete |
| TYPE-01 | Phase 8 | Complete |
| TYPE-02 | Phase 8 | Complete |
| TYPE-03 | Phase 8 | Complete |
| API-01 | Phase 9 | Complete |
| API-02 | Phase 9 | Complete |
| API-03 | Phase 9 | Complete |
| API-04 | Phase 9 | Complete |
| API-05 | Phase 9 | Complete |
| UI-01 | Phase 10 | Pending |
| UI-02 | Phase 10 | Pending |
| UI-03 | Phase 10 | Pending |
| UI-04 | Phase 10 | Pending |
| UI-05 | Phase 10 | Pending |
| UI-06 | Phase 10 | Pending |
| SRCH-01 | Phase 10 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after Phase 9 complete*
