# Requirements: Splits Network v7.0 — Company Profile Enhancement

**Defined:** 2026-03-03
**Core Value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements

## v7.0 Requirements

Requirements for company profile enrichment and card redesign. Each maps to roadmap phases.

### Schema

- [x] **SCHEMA-01**: `perks` master table with name, slug (unique), is_approved, created_by, trigram index
- [x] **SCHEMA-02**: `company_perks` junction table (company_id, perk_id, composite PK)
- [x] **SCHEMA-03**: `culture_tags` master table with name, slug (unique), is_approved, created_by, trigram index
- [x] **SCHEMA-04**: `company_culture_tags` junction table (company_id, culture_tag_id, composite PK)
- [x] **SCHEMA-05**: `company_skills` junction table (company_id, skill_id, composite PK) reusing existing `skills` table
- [x] **SCHEMA-06**: `companies.stage` TEXT column with CHECK constraint (Seed, Series A, Series B, Series C, Growth, Public, Bootstrapped, Non-Profit)
- [x] **SCHEMA-07**: `companies.founded_year` SMALLINT column
- [x] **SCHEMA-08**: `companies.tagline` TEXT column
- [x] **SCHEMA-09**: `companies.linkedin_url`, `companies.twitter_url`, `companies.glassdoor_url` TEXT columns
- [x] **SCHEMA-10**: RLS policies on all new tables (select/insert/update/delete for authenticated, service_role bypass)
- [x] **SCHEMA-11**: TypeScript types for all new fields, enums, and junction table rows in shared-types

### API

- [ ] **API-01**: Perks search endpoint (typeahead with trigram matching, like skills)
- [ ] **API-02**: Perks create endpoint (find-or-create with slug deduplication)
- [ ] **API-03**: Culture tags search endpoint (typeahead with trigram matching)
- [ ] **API-04**: Culture tags create endpoint (find-or-create with slug deduplication)
- [ ] **API-05**: Company skills bulk-replace endpoint (`PUT /company-skills/company/:id/bulk-replace`)
- [ ] **API-06**: Company perks bulk-replace endpoint (`PUT /company-perks/company/:id/bulk-replace`)
- [ ] **API-07**: Company culture tags bulk-replace endpoint (`PUT /company-culture-tags/company/:id/bulk-replace`)
- [ ] **API-08**: Company skills list endpoint (`GET /company-skills?company_id=X`)
- [ ] **API-09**: Company perks list endpoint (`GET /company-perks?company_id=X`)
- [ ] **API-10**: Company culture tags list endpoint (`GET /company-culture-tags?company_id=X`)
- [ ] **API-11**: Company update endpoint supports new scalar fields (stage, founded_year, tagline, social links)
- [ ] **API-12**: Company queries return computed open_roles_count from jobs table
- [ ] **API-13**: Company queries return computed avg_salary from jobs table
- [ ] **API-14**: Gateway routes for all new endpoints

### UI

- [ ] **UI-01**: Company settings section for stage (dropdown select)
- [ ] **UI-02**: Company settings section for founded year (number input)
- [ ] **UI-03**: Company settings section for tagline (text input)
- [ ] **UI-04**: Company settings section for social links (LinkedIn, Twitter/X, Glassdoor text inputs)
- [ ] **UI-05**: Company settings section for tech stack (BaselSkillPicker, search + create)
- [ ] **UI-06**: Company settings section for perks (BaselSkillPicker, search + create)
- [ ] **UI-07**: Company settings section for culture tags (BaselSkillPicker, search + create)
- [ ] **UI-08**: Redesigned company grid card header (matches showcase — industry kicker, hiring/status badge, logo, name, location, founded year)
- [ ] **UI-09**: Redesigned company grid card stats row (4 stats: Open Roles, Size, Stage, Avg Salary with colored icon squares)
- [ ] **UI-10**: Redesigned company grid card tech stack tags section (BaselBadge outline)
- [ ] **UI-11**: Redesigned company grid card perks tags section (BaselBadge secondary)
- [ ] **UI-12**: Company detail panel updated with all new fields
- [ ] **UI-13**: Company description section in card (About with line-clamp)

### Search

- [ ] **SRCH-01**: Search trigger updated to index tech stack names into company search vector
- [ ] **SRCH-02**: Search trigger updated to index perks names into company search vector
- [ ] **SRCH-03**: Search trigger updated to index culture tags into company search vector
- [ ] **SRCH-04**: Search trigger updated to index stage and tagline into company search vector
- [ ] **SRCH-05**: Junction table triggers to refresh company search index on skill/perk/culture_tag changes

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Company Profile v2

- **PROF-01**: Company photo gallery / office images
- **PROF-02**: Company team size history / growth chart
- **PROF-03**: Company reviews / reputation display from external sources
- **PROF-04**: Company comparison feature (side-by-side)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Company onboarding wizard | Separate UX initiative, not part of profile enrichment |
| Company profile public page (corporate site) | Future milestone — requires SEO work |
| Job-level tech stack | Jobs already have skills via job_skills; company tech stack is company-level |
| Paid company profile tiers | Monetization is a separate milestone |
| Company admin approval workflow for perks/culture | is_approved defaults to true; moderation is future |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHEMA-01 | Phase 22 | Complete |
| SCHEMA-02 | Phase 22 | Complete |
| SCHEMA-03 | Phase 22 | Complete |
| SCHEMA-04 | Phase 22 | Complete |
| SCHEMA-05 | Phase 22 | Complete |
| SCHEMA-06 | Phase 22 | Complete |
| SCHEMA-07 | Phase 22 | Complete |
| SCHEMA-08 | Phase 22 | Complete |
| SCHEMA-09 | Phase 22 | Complete |
| SCHEMA-10 | Phase 22 | Complete |
| SCHEMA-11 | Phase 22 | Complete |
| API-01 | Phase 23 | Pending |
| API-02 | Phase 23 | Pending |
| API-03 | Phase 23 | Pending |
| API-04 | Phase 23 | Pending |
| API-05 | Phase 23 | Pending |
| API-06 | Phase 23 | Pending |
| API-07 | Phase 23 | Pending |
| API-08 | Phase 23 | Pending |
| API-09 | Phase 23 | Pending |
| API-10 | Phase 23 | Pending |
| API-11 | Phase 24 | Pending |
| API-12 | Phase 24 | Pending |
| API-13 | Phase 24 | Pending |
| API-14 | Phase 24 | Pending |
| UI-01 | Phase 25 | Pending |
| UI-02 | Phase 25 | Pending |
| UI-03 | Phase 25 | Pending |
| UI-04 | Phase 25 | Pending |
| UI-05 | Phase 25 | Pending |
| UI-06 | Phase 25 | Pending |
| UI-07 | Phase 25 | Pending |
| UI-08 | Phase 26 | Pending |
| UI-09 | Phase 26 | Pending |
| UI-10 | Phase 26 | Pending |
| UI-11 | Phase 26 | Pending |
| UI-12 | Phase 26 | Pending |
| UI-13 | Phase 26 | Pending |
| SRCH-01 | Phase 27 | Pending |
| SRCH-02 | Phase 27 | Pending |
| SRCH-03 | Phase 27 | Pending |
| SRCH-04 | Phase 27 | Pending |
| SRCH-05 | Phase 27 | Pending |

**Coverage:**
- v7.0 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after roadmap creation*
