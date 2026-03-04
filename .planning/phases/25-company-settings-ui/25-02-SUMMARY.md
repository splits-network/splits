---
phase: 25
plan: 02
subsystem: company-settings-ui
tags: [company-settings, tags, skills, perks, culture-tags, typeahead, bulk-replace, typescript]
one-liner: "Tag pickers (tech stack, perks, culture tags) wired to BaselSkillPicker with typeahead search, inline creation, and bulk-replace auto-save"

dependency-graph:
  requires: [25-01]
  provides: [company-tags-ui]
  affects: []

tech-stack:
  added: []
  patterns: [bulk-replace-auto-save, parallel-fetch-on-mount, per-picker-saving-state]

key-files:
  created:
    - apps/portal/src/components/basel/company-settings/company-tags-section.tsx
  modified:
    - apps/portal/src/components/basel/company-settings/company-tab.tsx

decisions:
  - "Tags rendered outside <form> element — they auto-save independently via PUT and must not participate in scalar form submission"
  - "Single loading boolean shared across all three pickers — all three parallel fetches resolve before showing content"
  - "Per-picker saving string state ('skills' | 'perks' | 'culture-tags' | null) — each saving indicator is specific to the active picker"
  - "No type adapters needed — SkillOption { id, name, slug } is compatible with perks and culture_tags shapes"

metrics:
  duration: "2m 37s"
  completed: "2026-03-04"
---

# Phase 25 Plan 02: Company Settings Tag Pickers Summary

Three BaselSkillPicker instances added to company settings for managing junction-based tag data (tech stack, perks, culture tags) with typeahead search, inline creation, and auto-save via bulk-replace PUT endpoints.

## Tasks Completed

| Task | Name | Commit | Files |
| --- | --- | --- | --- |
| 1 | Create CompanyTagsSection component | 49771ee1 | company-tags-section.tsx (new) |
| 2 | Integrate CompanyTagsSection into CompanyTab | 45cebcd6 | company-tab.tsx |

## What Was Built

### company-tags-section.tsx (new, 294 lines)

A "use client" component that:

- **Loads on mount** via three parallel `GET` requests to `/company-skills?company_id=`, `/company-perks?company_id=`, `/company-culture-tags?company_id=`. Extracts the joined entity (`r.skill`, `r.perk`, `r.culture_tag`) from each junction row.
- **Searches** via `GET /skills?q=`, `GET /perks?q=`, `GET /culture-tags?q=` with `limit=10`.
- **Creates inline** via `POST /skills`, `POST /perks`, `POST /culture-tags` with `{ name }` body.
- **Auto-saves** via bulk-replace on every change:
  - `PUT /companies/:id/skills` with `{ skills: [{ skill_id }] }`
  - `PUT /companies/:id/perks` with `{ perks: [{ perk_id }] }`
  - `PUT /companies/:id/culture-tags` with `{ culture_tags: [{ culture_tag_id }] }`
- Shows a per-picker "Saving..." spinner during the save request.
- Shows a full-page spinner while the initial data loads.

Three sections rendered in `space-y-8`:
1. **Tech Stack** — maxSkills=30, placeholder "Search for a technology..."
2. **Perks & Benefits** — maxSkills=30, placeholder "Search for a perk..."
3. **Culture & Values** — maxSkills=20, placeholder "Search for a culture tag..."

### company-tab.tsx

Imports `CompanyTagsSection` and renders it in a `<div className="mt-10">` block after the closing `</form>` tag, conditionally: `{company && <CompanyTagsSection companyId={company.id} />}`. Tag pickers are hidden until a company record exists.

## Decisions Made

1. **Outside the form**: Tags auto-save on every change via their own PUT endpoints. Placing them inside the scalar `<form>` would risk double-submission or interference with form reset. Outside is correct.

2. **Single loading boolean**: All three junction tables are fetched in parallel. A single `loading` boolean is simpler than three independent ones when the UI shows one spinner for the whole section.

3. **Per-picker saving indicator**: `saving` is a discriminated string (`"skills" | "perks" | "culture-tags" | null`) rather than a boolean, so each section shows its own "Saving..." indicator independently.

4. **No type adapters**: `SkillOption` is `{ id, name, slug }`. Perks and culture tags share this exact shape from the DB, so no mapping is needed.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `pnpm --filter @splits-network/portal build` passed with zero TypeScript errors after both tasks
- CompanyTagsSection loads existing data on mount via three parallel GET requests
- Each picker searches via GET with `?q=` parameter (typeahead)
- Each picker creates via POST (inline creation)
- Each picker auto-saves via PUT bulk-replace with correct body format
- Tag pickers only render when `company` prop is non-null

## Next Phase Readiness

Phase 25 is now complete. Both plans (scalar fields and tag pickers) have been delivered. The company settings page supports full enrichment: basic info, social links, stage/year/tagline, tech stack, perks, and culture tags.
