# Requirements: Global Search

**Defined:** 2026-02-12
**Core Value:** Users find anything in the platform by typing natural language queries and getting ranked, cross-entity results in real-time.

## v1 Requirements

Requirements for milestone v2.0. Each maps to roadmap phases.

### Search Infrastructure

- [x] **INFRA-01**: Dedicated `search` schema with unified `search_index` table (entity_type, entity_id, title, subtitle, context, search_vector, metadata, organization_id)
- [x] **INFRA-02**: Trigger-based sync from candidates table to search_index (near-real-time, same transaction)
- [x] **INFRA-03**: Trigger-based sync from jobs table to search_index
- [x] **INFRA-04**: Trigger-based sync from companies table to search_index
- [x] **INFRA-05**: Trigger-based sync from recruiters table to search_index
- [x] **INFRA-06**: Trigger-based sync from applications table to search_index
- [x] **INFRA-07**: Trigger-based sync from placements table to search_index
- [x] **INFRA-08**: GIN index on search_index.search_vector with ts_rank scoring
- [x] **INFRA-09**: Recruiters table migrated from ILIKE to tsvector search (prerequisite for trigger sync)

### API

- [x] **API-01**: GET /v2/search endpoint querying search.search_index with typeahead mode (top 5 per entity) and full mode (paginated)
- [x] **API-02**: Access control filtering on all search results via resolveAccessContext (users only see entities they have access to)
- [x] **API-03**: Input sanitization and query validation (min query length, special character handling, injection prevention)

### Typeahead

- [x] **TYPE-01**: Real-time typeahead dropdown in portal header showing top results per entity type
- [x] **TYPE-02**: Results grouped by entity type with count and icon (Candidates, Jobs, Companies, etc.)
- [x] **TYPE-03**: Keyboard navigation (arrow keys to select, Enter to navigate, Esc to close dropdown)
- [x] **TYPE-04**: Loading states while searching and empty state messaging when no results found
- [x] **TYPE-05**: Highlighted matches (bold matching terms in result text)
- [x] **TYPE-06**: Context snippets showing match context (subtitle/secondary text from search_index)
- [x] **TYPE-07**: Click any result to navigate to entity detail page
- [x] **TYPE-08**: Clear button (X) to reset search input and close dropdown

### Full Search Page

- [ ] **PAGE-01**: Dedicated /portal/search page with paginated results (25 per page)
- [ ] **PAGE-02**: Entity type filtering (All, Candidates, Jobs, Companies, Recruiters, Applications, Placements)
- [ ] **PAGE-03**: Sort options (relevance, date)
- [ ] **PAGE-04**: Pressing Enter in typeahead without selection navigates to full search page with query preserved

### Platform Integration

- [x] **INT-01**: Cmd+K (Mac) / Ctrl+K (Windows) keyboard shortcut opens/focuses search from any page
- [x] **INT-02**: Recent searches stored in localStorage, shown in dropdown when input is empty (last 5)

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Advanced Search

- **ADV-01**: Natural language query parsing (extract role, location, salary from free-text)
- **ADV-02**: Fuzzy/typo-tolerant search beyond basic pg_trgm
- **ADV-03**: Synonym expansion for recruiting domain ("developer" matches "engineer")
- **ADV-04**: Search scoping toggle ("My items" vs "All items")

### Enhanced Experience

- **EXP-01**: Saved searches for re-use
- **EXP-02**: Relationship context in results ("Your candidate" vs "Unassigned")
- **EXP-03**: Multi-field match indicators ("Matched in: Title, Skills")
- **EXP-04**: Quick actions in dropdown results ("Message", "Add to job")

### Analytics

- **ANA-01**: Search query tracking and analytics
- **ANA-02**: Popular searches dashboard
- **ANA-03**: Zero-result query reporting

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Elasticsearch/external search engine | Postgres FTS with search schema is sufficient; no new infra |
| Search across chat messages | External service, not in Postgres |
| AI-powered search suggestions | Complex infrastructure, unclear ROI for v1 |
| Advanced search builder UI | Over-engineered; simple text input is sufficient |
| Full-text document/resume search | Expensive; search metadata only, not file content |
| Voice search | Desktop B2B app, not mobile-first |
| Export search results | Reporting feature, not search core |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | **Complete** (01-01) |
| INFRA-02 | Phase 1 | **Complete** (01-02) |
| INFRA-03 | Phase 1 | **Complete** (01-02) |
| INFRA-04 | Phase 1 | **Complete** (01-02) |
| INFRA-05 | Phase 1 | **Complete** (01-03) |
| INFRA-06 | Phase 1 | **Complete** (01-03) |
| INFRA-07 | Phase 1 | **Complete** (01-03) |
| INFRA-08 | Phase 1 | **Complete** (01-01) |
| INFRA-09 | Phase 1 | **Complete** (01-01) |
| API-01 | Phase 2 | **Complete** (02-01) |
| API-02 | Phase 2 | **Complete** (02-01) |
| API-03 | Phase 2 | **Complete** (02-01) |
| TYPE-01 | Phase 3 | **Complete** (03-02) |
| TYPE-02 | Phase 3 | **Complete** (03-02) |
| TYPE-03 | Phase 3 | **Complete** (03-02) |
| TYPE-04 | Phase 3 | **Complete** (03-02) |
| TYPE-05 | Phase 3 | **Complete** (03-02) |
| TYPE-06 | Phase 3 | **Complete** (03-02) |
| TYPE-07 | Phase 3 | **Complete** (03-02) |
| TYPE-08 | Phase 3 | **Complete** (03-02) |
| PAGE-01 | Phase 4 | Pending |
| PAGE-02 | Phase 4 | Pending |
| PAGE-03 | Phase 4 | Pending |
| PAGE-04 | Phase 4 | Pending |
| INT-01 | Phase 3 | **Complete** (03-01) |
| INT-02 | Phase 3 | **Complete** (03-01) |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 25
- Unmapped: 0

---
*Requirements defined: 2026-02-12*
*Last updated: 2026-02-14 after Phase 3 completion*
