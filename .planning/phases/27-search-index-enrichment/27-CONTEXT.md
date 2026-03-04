# Phase 27: Search Index Enrichment - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Enrich the existing company search index triggers to include all new v7.0 fields (stage, tagline, founded_year, social links) and create junction table triggers so that adding/removing skills, perks, or culture tags refreshes the company search vector. No new search UI or filtering — purely database trigger work.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All implementation decisions are delegated to Claude — this is straightforward infrastructure that follows established trigger patterns from the existing search index migrations.

Specifically, Claude decides:
- **Search weight assignment** — How to weight new fields (A/B/C/D) relative to existing company fields (name=A, description/industry=B, location=C, etc.)
- **Subtitle and context enrichment** — Whether/how to update the company subtitle and context strings in search.search_index with new fields
- **Metadata enrichment** — Which new fields to include in the metadata jsonb column for search result display
- **Junction trigger design** — How junction table triggers (company_skills, company_perks, company_culture_tags) refresh the parent company's search vector
- **Backfill strategy** — How to backfill existing company data with the new search vector content

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. Follow the patterns established in:
- `20260213000003_search_index_triggers_core.sql` (company sync trigger)
- `20260213000004_search_index_triggers_relational.sql` (cascade triggers)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 27-search-index-enrichment*
*Context gathered: 2026-03-04*
