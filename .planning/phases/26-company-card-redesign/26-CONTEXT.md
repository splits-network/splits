# Phase 26: Company Card Redesign - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign company grid cards and detail panel to display all new profile data added in phases 22-25 (stage, founded year, tagline, social links, tech stack, perks, culture tags, computed stats). The card and panel are display-only — editing happens in company settings (Phase 25). Search indexing is Phase 27.

</domain>

<decisions>
## Implementation Decisions

### Card information density
- Rich cards — show as much data as possible per card (header, stats, tags, tagline)
- Taller cards are acceptable to reduce need for opening detail panel
- Use tagline (not full description) on the card; full description lives in detail panel

### Card header
- Claude's discretion on whether to keep the colored band (bg-base-300) or go flat
- Header includes: industry kicker, hiring badge, logo, name, location, founded year (per roadmap)

### Card visual order
- Claude's discretion on section arrangement (header, tagline, stats, tags)
- Goal: identity first, then supporting data

### Tag section display
- Claude's discretion on whether tech stack and perks use same chip style with labels vs different colors
- Claude's discretion on overflow handling (show N + "+X more" vs wrap to max rows)
- Claude's discretion on chip size (badge-sm vs default)
- Plain text chips preferred (no tech-specific icons) — keep it clean and consistent

### Stats row composition
- Four stats: open roles, size, stage, avg salary (replacing current 2-stat row)
- Claude's discretion on whether to always show all 4 or only show available data
- Claude's discretion on avg salary format (single average vs range)
- Claude's discretion on colored icon backgrounds vs neutral/minimal style
- Hiring badge logic: based on open_roles_count > 0

### Detail panel layout
- Claude's discretion on stacked sections vs tabbed approach
- Claude's discretion on social links presentation (icon row vs labeled links)
- Claude's discretion on culture tag visual treatment (same as tech/perks or distinct)
- Claude's discretion on full description display (show all vs clamp with expand)
- Panel keeps current right-side drawer dimensions (480-540px)

### Claude's Discretion
- Header band style (colored vs flat)
- Card section order
- Tag overflow strategy and chip sizing
- Stats row visual treatment (colored icons vs minimal)
- Detail panel organization and section styling
- Social links presentation
- Description display in detail panel

</decisions>

<specifics>
## Specific Ideas

- Tagline on card, full description in detail panel — clear separation of preview vs detail
- Rich cards that minimize the need to open the detail panel for quick scanning
- Current card design (grid-card.tsx, grid-card-stats.tsx) is the starting point for redesign

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 26-company-card-redesign*
*Context gathered: 2026-03-04*
