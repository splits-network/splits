# Roadmap: Global Search

## Overview

Build full-stack global search from database infrastructure through API to real-time UI. Deliver a Google-like search experience across all entities (candidates, jobs, companies, recruiters, applications, placements) with role-based access control. The journey starts with a dedicated search schema and trigger-based sync, then builds API endpoints, real-time typeahead in the portal header, and finally a full search results page.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work

- [x] **Phase 1: Search Infrastructure** - Dedicated search schema with trigger-based sync from all entity tables
- [ ] **Phase 2: Search API** - Backend search endpoints with access control and validation
- [ ] **Phase 3: Typeahead Search** - Real-time search bar in portal header with keyboard navigation
- [ ] **Phase 4: Full Search Page** - Dedicated search page with filtering and pagination

## Phase Details

### Phase 1: Search Infrastructure
**Goal**: Dedicated search schema operational with near-real-time sync from all entity tables
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06, INFRA-07, INFRA-08, INFRA-09
**Success Criteria** (what must be TRUE):
  1. Recruiters table has search_vector column with tsvector data and GIN index
  2. search.search_index table exists with normalized schema (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id)
  3. Triggers on all 7 entity tables sync to search_index in same transaction when data changes
  4. Query against search_index returns ranked results across multiple entity types with ts_rank scoring
  5. Inserting/updating a candidate, job, or company immediately reflects in search_index (verifiable via SELECT)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Foundation: fix recruiters ILIKE->tsvector, create search schema + search_index table + GIN index
- [x] 01-02-PLAN.md — Core entity triggers: candidates, jobs, companies sync to search_index
- [x] 01-03-PLAN.md — Relational entity triggers: recruiters, applications, placements, recruiter_candidates sync to search_index

### Phase 2: Search API
**Goal**: Backend search endpoints ready with access control and input validation
**Depends on**: Phase 1
**Requirements**: API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. GET /v2/search?q=query&mode=typeahead endpoint returns top 5 results per entity type in <200ms
  2. GET /v2/search?q=query&mode=full endpoint returns paginated results with standard { data, pagination } envelope
  3. Search results respect role-based access control (company users only see their candidates/jobs, recruiters see assigned entities)
  4. Malformed queries (empty string, special characters, SQL injection attempts) return validation errors without crashing
**Plans**: TBD

Plans:
- [ ] 02-01: [TBD during phase planning]

### Phase 3: Typeahead Search
**Goal**: Real-time search bar in portal header with keyboard navigation and result navigation
**Depends on**: Phase 2
**Requirements**: TYPE-01, TYPE-02, TYPE-03, TYPE-04, TYPE-05, TYPE-06, TYPE-07, TYPE-08, INT-01, INT-02
**Success Criteria** (what must be TRUE):
  1. User can type in search bar at top of portal and see dropdown with results grouped by entity type (Candidates, Jobs, Companies, etc.)
  2. Dropdown shows top 5 results per entity type with icon, title, subtitle, and highlighted matching terms
  3. User can navigate results with arrow keys, select with Enter, and close with Esc
  4. Cmd+K (Mac) or Ctrl+K (Windows) focuses search bar from any page
  5. Clicking any result navigates to that entity's detail page
  6. Recent searches (last 5) appear in dropdown when input is empty
  7. Loading spinner shows while searching and empty state message shows when no results found
  8. Clear button (X) resets search input and closes dropdown
**Plans**: TBD

Plans:
- [ ] 03-01: [TBD during phase planning]

### Phase 4: Full Search Page
**Goal**: Dedicated search page with filtering, sorting, and pagination
**Depends on**: Phase 3
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04
**Success Criteria** (what must be TRUE):
  1. User can navigate to /portal/search and see paginated search results (25 per page)
  2. User can filter results by entity type (All, Candidates, Jobs, Companies, Recruiters, Applications, Placements)
  3. User can sort results by relevance or date
  4. Pressing Enter in typeahead search bar without selecting a result navigates to full search page with query preserved
**Plans**: TBD

Plans:
- [ ] 04-01: [TBD during phase planning]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Search Infrastructure | 3/3 | **Complete** | 2026-02-13 |
| 2. Search API | 0/TBD | Not started | - |
| 3. Typeahead Search | 0/TBD | Not started | - |
| 4. Full Search Page | 0/TBD | Not started | - |

---
*Created: 2026-02-12*
*Last updated: 2026-02-13*
