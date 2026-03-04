# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v7.0 Company Profile Enhancement — Phase 27: Search Index Enrichment

## Current Position

Phase: 27 of 27 (Search Index Enrichment)
Plan: 0 of 2 in current phase
Status: Ready to plan
Last activity: 2026-03-04 — Phase 26 complete (3 plans, company card redesign)

Progress: [████████████░░░░░░░░] 86% (12/14 v7.0 plans)

## Performance Metrics

**Cumulative (v2.0-v6.0):**
- Total plans completed: 56 (36 from v2.0-v5.0 + 20 from v6.0)
- v6.0: 292 files, +34,562/-16,650 lines, 6 phases, 20 plans

**v7.0:**
- Total plans: 14 across 6 phases
- Completed: 12/14 (22-01, 22-02, 23-01, 23-02, 23-03, 24-01, 24-02, 25-01, 25-02, 26-01, 26-02, 26-03)

## Accumulated Context

### Decisions

See .planning/PROJECT.md Key Decisions table for full cumulative list.
v7.0 decisions: tech stack reuses skills, perks/culture as lookups, stage as enum, computed stats.

| Tech stack reuses skills table | company_skills junction reuses skills; enables cross-entity skill matching | Confirmed in migration |
| Perks as new lookup table | slug deduplication + trigram typeahead, mirrors skills pattern | Confirmed in migration |
| Culture tags as new lookup table | same pattern as perks, open-ended culture descriptors | Confirmed in migration |
| Stage as constrained TEXT | CHECK constraint (8 values) consistent with v4.0 commute_types/job_level approach | Confirmed in migration |
| CompanyStage Title Case with spaces | 'Series A' not 'series_a' — display-ready values matching DB CHECK constraint verbatim | 22-02 |
| Junction types with enrichment | CompanyPerk/CompanyCultureTag/CompanySkill follow CandidateSkill/JobSkill pattern (FK + optional join) | 22-02 |
| Portal Company stage as string | Portal Company interface uses string (not enum) for stage — API returns plain string, portal is display-only | 26-01 |
| Tagline replaces description in card | tagline is purpose-built for card display; description may be long-form | 26-01 |
| Founded year replaces added-ago (marketplace) | Company age more informative than record creation date when browsing marketplace | 26-01 |
| GridView owns junction fetch | tagMap pattern — view fetches, passes name arrays to cards; avoids per-card fetch stampede | 26-02 |
| Tech stack max 6, perks max 4 | limits keep card height reasonable; +N more overflow handles excess | 26-02 |
| Detail panel fetches junction data independently | Detail loader fetches its own skills/perks/culture via parallel API calls; no limit in detail view | 26-03 |
| Tag types have distinct badge variants | outline=tech, secondary=perks, accent=culture — enables quick category scanning | 26-03 |

### Pending Todos

None.

### Blockers/Concerns

None active.

## Session Continuity

Last session: 2026-03-04
Stopped at: Phase 26 complete — company card redesign with grid card, tag sections, detail panel
Resume file: None
Next: `/basel:discuss-phase 27` or `/basel:plan-phase 27`

---
*Created: 2026-02-12*
*Last updated: 2026-03-04 (Phase 26 complete, ready for Phase 27)*
