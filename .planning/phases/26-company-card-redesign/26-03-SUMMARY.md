---
phase: 26-company-card-redesign
plan: "03"
subsystem: companies-ui
tags: [company-detail, junction-data, social-links, badges, perks, culture-tags, tech-stack]

one-liner: "Company detail panel enriched with junction data fetching (skills/perks/culture), expanded stats grid, tagline, social links, and distinct badge sections"

dependency-graph:
  requires:
    - "26-01: Company type extension with stage/founded_year/tagline/social URLs"
    - "22-01: company_skills junction table"
    - "23-01: company_perks junction table"
    - "24-01: company_culture_tags junction table"
  provides:
    - "Full company profile detail panel with all enrichment fields"
    - "Junction API fetching pattern for company detail"
  affects:
    - "26-04 (if any): Detail panel is now complete with all v7.0 profile data"

tech-stack:
  added: []
  patterns:
    - "Promise.all parallel API fetch for junction data in detail loader"
    - "BaselBadge with distinct color/variant per tag category (outline/secondary/accent)"

key-files:
  created: []
  modified:
    - apps/portal/src/app/portal/companies/components/shared/company-detail.tsx

decisions:
  - decision: "Junction data fetched in CompanyDetailLoader, not CompanyDetail"
    reason: "Loader owns all async data; CompanyDetail stays purely presentational"
  - decision: "Avg salary spans full grid width when present"
    reason: "Salary is supplemental; 4+1 layout avoids odd empty cells"
  - decision: "Tagline above description with border-l-4 accent"
    reason: "Tagline is purpose-built copy; visual accent draws attention before long-form text"
  - decision: "Tag types have distinct visual treatment: outline (tech), secondary (perks), accent (culture)"
    reason: "Enables quick scanning of different data categories in a single glance"

metrics:
  duration: "~3 minutes"
  tasks-completed: 2/2
  completed: "2026-03-04"
---

# Phase 26 Plan 03: Company Detail Panel Enrichment Summary

## What Was Built

The `CompanyDetailLoader` and `CompanyDetail` components were updated to display all new company profile fields introduced in phases 22-26.

**Junction data fetching** — `CompanyDetailLoader` now fires three parallel API calls alongside the existing company and relationship fetches:
- `GET /company-skills?company_id={id}` → parsed to `string[]` of skill names
- `GET /company-perks?company_id={id}` → parsed to `string[]` of perk names
- `GET /company-culture-tags?company_id={id}` → parsed to `string[]` of culture tag names

Results are passed as `techStack`, `perks`, and `cultureTags` props to `CompanyDetail`.

**Layout updates** — The content area was restructured with this section order:
1. Stats grid (Size, Stage, Founded, Open Roles; Avg Salary when present)
2. Tagline (italic with `border-l-4 border-primary`)
3. About / Description (unchanged, no line-clamp in detail view)
4. Social Links (LinkedIn, X/Twitter, Glassdoor — icon + label, opens in new tab)
5. Tech Stack (BaselBadge outline variant)
6. Perks & Benefits (BaselBadge secondary color)
7. Culture & Values (BaselBadge accent color)
8. Details grid (Location, Website, Industry, Company Size) — preserved
9. Relationship details — preserved
10. Achievements — preserved
11. Team Contacts — preserved

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

Phase 26 plan 03 is the final execution plan. The company card redesign phase is now complete:
- 26-01: Company type extension + grid card editorial redesign
- 26-02: List card redesign (completed prior)
- 26-03: Detail panel enrichment (this plan)
