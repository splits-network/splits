---
phase: 25
plan: 01
subsystem: company-settings-ui
tags: [company-settings, form, scalar-fields, enrichment, typescript]
one-liner: "Extended company settings form with stage dropdown, founded year, tagline, and social link URL fields"

dependency-graph:
  requires: [24-01, 24-02]
  provides: [company-scalar-fields-ui]
  affects: [25-02]

tech-stack:
  added: []
  patterns: [component-extraction, null-coalescing-payload]

key-files:
  created:
    - apps/portal/src/components/basel/company-settings/company-details-section.tsx
  modified:
    - apps/portal/src/app/portal/company/settings/types.ts
    - apps/portal/src/components/basel/company-settings/company-tab.tsx

decisions:
  - "Extract Company Details + Social Links into company-details-section.tsx to keep company-tab.tsx under 300 lines (file-size rule)"
  - "Store founded_year as string in form state, convert to number on submit (standard pattern for number inputs)"
  - "Use string for stage in local Company interface, not CompanyStage type — DB constraint enforces validity server-side"

metrics:
  duration: "2m 34s"
  completed: "2026-03-04"
---

# Phase 25 Plan 01: Company Settings Scalar Fields Summary

Extended company settings Company tab with 6 scalar enrichment fields (stage, founded year, tagline, LinkedIn, Twitter/X, Glassdoor) that save via the existing PATCH `/companies/:id` endpoint.

## Tasks Completed

| Task | Name | Commit | Files |
| --- | --- | --- | --- |
| 1 | Extend Company interface in settings types | 737f22e4 | types.ts |
| 2 | Add scalar fields to company-tab form | 00f81a7f | company-tab.tsx, company-details-section.tsx (new) |

## What Was Built

### types.ts
Added 6 optional fields to the `Company` interface after `logo_url`:
- `stage?: string` — matches DB CHECK constraint values (Seed, Series A-C, Growth, Public, Bootstrapped, Non-Profit)
- `founded_year?: number`
- `tagline?: string`
- `linkedin_url?: string`
- `twitter_url?: string`
- `glassdoor_url?: string`

### company-details-section.tsx (new)
A new extracted component that renders the "Company Details" and "Social Links" form sections. Receives all 6 new field values + the shared `onChange` handler as props. Contains the `COMPANY_STAGES` constant array.

### company-tab.tsx
- Imports and renders `CompanyDetailsSection` after the Logo URL field
- Extended `formData` initial state with all 6 new fields
- Updated `handleSubmit` to build a payload that converts `founded_year` string to number (or null) and sends empty strings as null for all optional fields
- Both PATCH (update) and POST (create) paths use the new payload

## Decisions Made

1. **Component extraction**: The plan specified extracting to a separate component if company-tab.tsx would exceed ~200 lines. With additions it reached ~350 lines, so `company-details-section.tsx` was created. This keeps company-tab.tsx at 295 lines.

2. **founded_year stored as string in form state**: Standard approach for `<input type="number">` — the input value is always a string, converted to number only in the submit handler.

3. **Null for empty strings on save**: Empty optional fields send `null` to the API, allowing users to clear previously-set values rather than sending empty strings that the DB may reject.

## Deviations from Plan

None — plan executed exactly as written. The component extraction was pre-specified in the plan as the expected outcome given file size constraints.

## Verification

- `pnpm --filter @splits-network/portal build` passed with zero TypeScript errors
- All 6 new fields present in Company interface
- Stage dropdown has 8 options matching DB CHECK constraint values
- Founded Year uses `parseInt(formData.founded_year, 10)` conversion on submit
- All fields initialize from `company` prop data via optional chaining

## Next Phase Readiness

Plan 25-02 can proceed immediately. The scalar fields are in place; the next plan will add lookup-based fields (perks, culture tags, tech stack) to the same settings page.
