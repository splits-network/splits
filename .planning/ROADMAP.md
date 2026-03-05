# Roadmap: Splits Network

## Milestones

- [x] **v2.0 Global Search** - Phases 1-3 (shipped 2026-02-13)
- [x] **v3.0 Platform Admin Restructure** - Phases 4-7 (shipped 2026-02-13)
- [x] **v4.0 Commute Types & Job Levels** - Phases 8-10 (shipped 2026-02-13)
- [x] **v5.0 Custom GPT / Applicant Network** - Phases 11-15 (shipped 2026-02-13)
- [x] **v6.0 Admin App Extraction** - Phases 16-21 (shipped 2026-02-27)
- [x] **v7.0 Company Profile Enhancement** - Phases 22-27 (shipped 2026-03-04)
- [ ] **v8.0 Company Experience Enhancement** - Phases 28-32 (in progress)

## Phases

<details>
<summary>v2.0-v6.0 (Phases 1-21) - See MILESTONES.md</summary>

Completed milestones documented in .planning/MILESTONES.md

</details>

### v7.0 Company Profile Enhancement (Complete)

**Milestone Goal:** Enrich company profiles with tech stack, perks, culture tags, stage, and social links — then surface all of it in redesigned company cards and search.

- [x] **Phase 22: Schema & Types** - Database tables, columns, RLS, and TypeScript types for all new company data (completed 2026-03-03)
- [x] **Phase 23: Lookup APIs** - Search/create endpoints for perks and culture tags, plus junction CRUD for skills/perks/culture (completed 2026-03-03)
- [x] **Phase 24: Company Enrichment APIs** - Scalar field updates, computed stats, and gateway routing (completed 2026-03-03)
- [x] **Phase 25: Company Settings UI** - Form sections for all new fields in company settings (completed 2026-03-04)
- [x] **Phase 26: Company Card Redesign** - Grid card, detail panel, and description section (completed 2026-03-04)
- [x] **Phase 27: Search Index Enrichment** - Triggers to index new fields into company search vector (completed 2026-03-04)

### v8.0 Company Experience Enhancement (Active)

**Milestone Goal:** Make the portal a first-class experience for company users — invite matched candidates to apply, send email and in-app notifications to both parties, tailor the role detail tabs per user role, and surface top matches on the company dashboard.

- [ ] **Phase 28: Schema & Types** - Migration for `invited` status, `invited_by`/`invited_at` columns, and TypeScript types
- [ ] **Phase 29: Invite API & Event** - Invite endpoint in matching-service, RabbitMQ event published
- [ ] **Phase 30: Notifications** - Notification-service consumers, in-app notifications, and email templates for candidate and recruiter
- [ ] **Phase 31: Portal UI** - Invite button, invited badge, role-aware tabs, and company dashboard top matches widget
- [ ] **Phase 32: Candidate UI** - Invited badge on match cards, invited matches sorted to top

## Phase Details

### Phase 22: Schema & Types
**Goal**: All new database tables, columns, and TypeScript types exist so API and UI work can begin
**Depends on**: Nothing (foundation phase)
**Requirements**: SCHEMA-01, SCHEMA-02, SCHEMA-03, SCHEMA-04, SCHEMA-05, SCHEMA-06, SCHEMA-07, SCHEMA-08, SCHEMA-09, SCHEMA-10, SCHEMA-11
**Success Criteria** (what must be TRUE):
  1. Running the migration creates perks, company_perks, culture_tags, company_culture_tags, and company_skills tables with correct constraints and trigram indexes
  2. The companies table has stage (with CHECK constraint), founded_year, tagline, linkedin_url, twitter_url, and glassdoor_url columns
  3. RLS policies enforce authenticated select/insert/update/delete on all new tables with service_role bypass
  4. TypeScript types in shared-types cover CompanyStage enum, Perk, CultureTag, and all junction table row types
**Plans:** 2 plans

Plans:
- [x] 22-01-PLAN.md -- Migration for new tables, columns, indexes, and RLS
- [x] 22-02-PLAN.md -- TypeScript types in shared-types

### Phase 23: Lookup APIs
**Goal**: Perks and culture tags can be searched and created via typeahead, and company junction tables have full CRUD
**Depends on**: Phase 22
**Requirements**: API-01, API-02, API-03, API-04, API-05, API-06, API-07, API-08, API-09, API-10
**Success Criteria** (what must be TRUE):
  1. Typing partial text into a perks search returns matching perks via trigram similarity (like existing skills search)
  2. Creating a perk that already exists (by slug) returns the existing record instead of duplicating
  3. Culture tags search and create work identically to perks
  4. Bulk-replacing a company's skills/perks/culture tags atomically swaps the full set in one call
  5. List endpoints return all skills/perks/culture tags for a given company
**Plans:** 3 plans

Plans:
- [x] 23-01-PLAN.md -- Perks search/create endpoints (repository, service, routes)
- [x] 23-02-PLAN.md -- Culture tags search/create endpoints (repository, service, routes)
- [x] 23-03-PLAN.md -- Company junction bulk-replace and list (skills, perks, culture tags)

### Phase 24: Company Enrichment APIs
**Goal**: Companies can be updated with new scalar fields, queries return computed stats, and all new routes are exposed through the gateway
**Depends on**: Phase 23
**Requirements**: API-11, API-12, API-13, API-14
**Success Criteria** (what must be TRUE):
  1. Updating a company with stage, founded_year, tagline, or social links persists and returns the updated values
  2. Company list and detail queries include computed open_roles_count and avg_salary derived from the jobs table
  3. All new endpoints (perks, culture tags, junction CRUD, company update) are accessible through api-gateway
**Plans:** 2 plans

Plans:
- [x] 24-01-PLAN.md -- Scalar field support in company update + computed stats in queries
- [x] 24-02-PLAN.md -- Gateway routes for all Phase 23 + 24 endpoints

### Phase 25: Company Settings UI
**Goal**: Company administrators can manage all new profile fields from company settings
**Depends on**: Phase 24
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07
**Success Criteria** (what must be TRUE):
  1. User can select company stage from a dropdown and save it
  2. User can enter founded year, tagline, and social links and save them
  3. User can search/add/remove tech stack skills, perks, and culture tags using BaselSkillPicker with typeahead
  4. All settings persist after page reload
**Plans**: 2 plans

Plans:
- [x] 25-01-PLAN.md -- Scalar field settings (stage, founded year, tagline, social links)
- [x] 25-02-PLAN.md -- Tag picker settings (tech stack, perks, culture tags)

### Phase 26: Company Card Redesign
**Goal**: Company grid cards and detail panel display all new profile data in the redesigned layout
**Depends on**: Phase 25
**Requirements**: UI-08, UI-09, UI-10, UI-11, UI-12, UI-13
**Success Criteria** (what must be TRUE):
  1. Company grid card shows header with industry kicker, hiring badge, logo, name, location, and founded year
  2. Company grid card shows stats row with open roles, size, stage, and avg salary
  3. Company grid card shows tech stack and perks as tag sections
  4. Company detail panel displays all new fields (stage, tagline, social links, tech stack, perks, culture tags)
  5. Company card includes a description/about section with line-clamped text
**Plans:** 3 plans

Plans:
- [x] 26-01-PLAN.md -- Update types + redesign grid card header, stats, and tagline
- [x] 26-02-PLAN.md -- Grid card tech stack and perks tag sections
- [x] 26-03-PLAN.md -- Detail panel with all new profile fields

### Phase 27: Search Index Enrichment
**Goal**: All new company data is searchable via the existing global search infrastructure
**Depends on**: Phase 26
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05
**Success Criteria** (what must be TRUE):
  1. Searching for a tech stack skill name returns companies that use that skill
  2. Searching for a perk or culture tag name returns companies with that perk/tag
  3. Searching for a company stage or tagline text returns matching companies
  4. Adding or removing a junction record (skill/perk/culture tag) refreshes the company search index
**Plans:** 2 plans

Plans:
- [x] 27-01-PLAN.md -- Update company search vector and search index sync with new fields (stage, tagline, skills, perks, culture tags)
- [x] 27-02-PLAN.md -- Junction table cascade triggers to refresh company search on skill/perk/culture tag changes

### Phase 28: Schema & Types
**Goal**: The database and TypeScript types support the `invited` match status, invite tracking columns, and all downstream code can reference the new values
**Depends on**: Nothing (foundation phase for v8.0)
**Requirements**: INVITE-01, INVITE-02
**Success Criteria** (what must be TRUE):
  1. Running the migration adds `invited` to the candidate_role_matches CHECK constraint without breaking existing status values
  2. The candidate_role_matches table has `invited_by` (user_id) and `invited_at` (timestamp) columns with appropriate nullability
  3. TypeScript types in shared-types include `invited` in the match status union and expose `invitedBy` and `invitedAt` on match DTOs
**Plans:** 2 plans

Plans:
- [ ] 28-01-PLAN.md -- Migration: invited status in CHECK constraint, invited_by and invited_at columns
- [ ] 28-02-PLAN.md -- TypeScript types: match status union updated, DTO extended in shared-types

### Phase 29: Invite API & Event
**Goal**: Company users can trigger an invite through the API and a RabbitMQ event carries full context for downstream consumers
**Depends on**: Phase 28
**Requirements**: INVITE-03, INVITE-04
**Success Criteria** (what must be TRUE):
  1. A company user calling `PATCH /api/v2/matches/:id/invite` sets the match status to `invited`, records `invited_by` and `invited_at`, and returns the updated match
  2. Calling the endpoint as a non-company user (recruiter, candidate, platform admin) returns 403
  3. Calling the endpoint for a match that belongs to a different company returns 403
  4. A `match.invited` event is published to RabbitMQ after a successful invite containing match, job, candidate, and inviter context
**Plans:** 2 plans

Plans:
- [ ] 29-01-PLAN.md -- Invite endpoint in matching-service (repository, service, route, authorization)
- [ ] 29-02-PLAN.md -- Gateway route for invite endpoint + RabbitMQ event publishing

### Phase 30: Notifications
**Goal**: Both the candidate and recruiter are notified in-app and by email when a candidate is invited to apply
**Depends on**: Phase 29
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04
**Success Criteria** (what must be TRUE):
  1. After an invite, the candidate sees an in-app notification linking to the match
  2. After an invite, the recruiter who owns the job sees an in-app notification with match and candidate context
  3. The candidate receives an email with role details and a CTA to view their match
  4. The recruiter receives an email with match details and candidate information
**Plans:** 2 plans

Plans:
- [ ] 30-01-PLAN.md -- Notification-service consumers for match.invited (in-app notifications for candidate and recruiter)
- [ ] 30-02-PLAN.md -- Email templates and Resend dispatch for candidate invite and recruiter alert

### Phase 31: Portal UI
**Goal**: Company users see an invite action on match rows, invited matches are visually marked, tabs are tailored to the company persona, and the dashboard shows top matches
**Depends on**: Phase 29
**Requirements**: CUI-01, CUI-02, CUI-03, CUI-04
**Success Criteria** (what must be TRUE):
  1. A company user viewing the Matches tab on a role detail sees an "Invite to Apply" button on each non-invited match row
  2. Matches where status is `invited` display an "Invited" badge showing when the invite was sent
  3. A company user viewing a role detail does not see the Recruiter Brief tab and does not see fee percentages in the Financials tab
  4. The company dashboard displays a "Top Matches" widget listing the highest-scored matches across all company roles
**Plans:** 2 plans

Plans:
- [ ] 31-01-PLAN.md -- Invite button and invited badge in role detail Matches tab + role-aware tab visibility
- [ ] 31-02-PLAN.md -- Company dashboard top matches widget

### Phase 32: Candidate UI
**Goal**: Candidates can immediately see which roles they have been invited to apply for, with invited matches surfaced first
**Depends on**: Phase 28
**Requirements**: CAND-01, CAND-02
**Success Criteria** (what must be TRUE):
  1. A candidate viewing their matches list sees an "Invited" badge on any match with `invited` status
  2. Invited matches appear at the top of the matches list ahead of all other matches
**Plans:** 1 plan

Plans:
- [ ] 32-01-PLAN.md -- Invited badge on candidate match cards + sort invited matches to top

## Progress

**Execution Order:**
Phases execute in numeric order: 28 -> 29 -> 30 -> 31 -> 32

Note: Phase 31 and Phase 32 both depend on Phase 28 (types) and Phase 29 (API) but are independent of each other and can execute in parallel.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 22. Schema & Types | v7.0 | 2/2 | Complete | 2026-03-03 |
| 23. Lookup APIs | v7.0 | 3/3 | Complete | 2026-03-03 |
| 24. Company Enrichment APIs | v7.0 | 2/2 | Complete | 2026-03-03 |
| 25. Company Settings UI | v7.0 | 2/2 | Complete | 2026-03-04 |
| 26. Company Card Redesign | v7.0 | 3/3 | Complete | 2026-03-04 |
| 27. Search Index Enrichment | v7.0 | 2/2 | Complete | 2026-03-04 |
| 28. Schema & Types | v8.0 | 0/2 | Pending | — |
| 29. Invite API & Event | v8.0 | 0/2 | Pending | — |
| 30. Notifications | v8.0 | 0/2 | Pending | — |
| 31. Portal UI | v8.0 | 0/2 | Pending | — |
| 32. Candidate UI | v8.0 | 0/1 | Pending | — |
