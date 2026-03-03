# Phase 25: Company Settings UI - Context

**Gathered:** 2026-03-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Form sections in company settings for managing all new profile fields: stage, founded year, tagline, social links (LinkedIn, Twitter, Glassdoor), tech stack skills, perks, and culture tags. This phase builds the settings UI only — card display and search indexing are separate phases (26 and 27).

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All implementation decisions were deferred to Claude. The user trusts Claude to follow existing patterns and make the best choices for each area:

**Form layout & grouping:**
- How to organize new fields on the settings page (sections, tabs, or extension of existing page)
- Whether social links get their own section or group with other scalar fields
- Whether tag pickers are grouped together or separated by type
- Whether to extend the existing settings page or create a new sub-page/route

**Save behavior:**
- Save mechanism for scalar fields (explicit button vs auto-save)
- Save mechanism for tag changes (immediate vs batch)
- Success/error feedback pattern (toast vs inline)
- Whether to implement unsaved changes protection

**Tag picker experience:**
- Whether all three tag types reuse the same picker component or have variations
- How selected tags are displayed (chips, inline text, etc.)
- Whether users can create new perks/culture tags inline from the picker
- Whether to enforce tag count limits per type

**Validation & empty states:**
- URL validation timing (on blur vs on save)
- Founded year input type (number input vs dropdown)
- Empty state presentation (placeholders vs progressive disclosure)
- Whether any new fields are required or all optional

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user deferred all decisions to Claude's judgment, meaning the researcher and planner should follow existing company settings patterns and apply UX best practices.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 25-company-settings-ui*
*Context gathered: 2026-03-03*
