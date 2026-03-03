# Phase 23: Lookup APIs - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Search/create endpoints for perks and culture tags (typeahead), plus junction CRUD for company skills/perks/culture tags. This phase builds the API layer on top of Phase 22's schema. UI consumption (settings forms, pickers) is Phase 25.

</domain>

<decisions>
## Implementation Decisions

### Typeahead behavior
- Follow existing skills search pattern for minimum characters, result count, and sorting
- Search uses trigram similarity (already indexed in Phase 22 migration)
- Return all matches including already-assigned items — UI handles filtering/dimming client-side

### Create-on-the-fly rules
- Follow existing skills creation pattern for permissions and validation
- Auto-approved with normalization (clean casing/whitespace)
- Duplicate detection via exact slug match — if slug exists, return existing record
- Display name format follows existing skills convention

### Bulk-replace semantics
- Follow existing patterns (e.g., candidate skills) for replace-vs-add/remove approach
- Empty array = clear all linked items (explicit, clean)
- Separate endpoints per type: PUT /companies/:id/skills, PUT /companies/:id/perks, PUT /companies/:id/culture-tags
- Reasonable cap on items per company (Claude decides based on UX)

### Response shape & errors
- Standard `{ data: <payload> }` envelope per API guidance
- Search response fields follow skills search pattern (id + name + slug minimum)
- List endpoints not paginated — item counts per company are small enough to return all at once
- Creating a duplicate slug returns 200 with existing record (idempotent, no error)

### Claude's Discretion
- Exact minimum character threshold for typeahead
- Number of search results returned
- Sort order for search results (similarity score vs alphabetical)
- Max items per company cap value
- Exact field set in search/list responses beyond id/name/slug
- Error messages and validation details

</decisions>

<specifics>
## Specific Ideas

- Mirror the existing skills search/create pattern as closely as possible — perks and culture tags are structurally identical to skills
- Endpoints should live in ats-service alongside existing company routes
- Slug-based deduplication is the primary mechanism (established in Phase 22 migration)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 23-lookup-apis*
*Context gathered: 2026-03-03*
