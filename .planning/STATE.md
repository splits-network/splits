# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-03)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v7.0 Company Profile Enhancement — Phase 27: Search Index Enrichment

## Current Position

Phase: 27 of 27 (Search Index Enrichment)
Plan: 2 of 2 in current phase (both 27-01 and 27-02 complete)
Status: Phase complete
Last activity: 2026-03-04 — Completed 27-01 (company search vector enrichment migration)

Progress: [████████████████████] 100% (14/14 v7.0 plans)

## Performance Metrics

**Cumulative (v2.0-v6.0):**
- Total plans completed: 56 (36 from v2.0-v5.0 + 20 from v6.0)
- v6.0: 292 files, +34,562/-16,650 lines, 6 phases, 20 plans

**v7.0:**
- Total plans: 14 across 6 phases
- Completed: 14/14 (22-01, 22-02, 23-01, 23-02, 23-03, 24-01, 24-02, 25-01, 25-02, 26-01, 26-02, 26-03, 27-01, 27-02)

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
| Search vector weights: tagline=B, skills=B, stage/perks/culture=C | tagline is descriptive (B like description); skills primary signal (B like candidate skills); stage/perks/culture categorical (C) | 27-01 |
| BEFORE trigger queries junctions for search_vector, AFTER re-queries for context string | separation keeps company.search_vector authoritative; search_index.context needs raw text, not just vector | 27-01 |
| Junction changes don't auto-trigger company search_vector rebuild | known limitation — only companies INSERT/UPDATE fires the BEFORE trigger; junction-only changes need explicit company touch | 27-01 |
| Junction cascade via touch | INSERT/DELETE on junction fires UPDATE companies SET updated_at = now() to reuse enriched parent triggers | 27-02 |
| Separate trigger functions per junction table | Even with identical bodies today, separate functions allow future divergence without a rewrite | 27-02 |

### Pending Todos

None.

### Blockers/Concerns

None active.

## Session Continuity

Last session: 2026-03-04
Stopped at: Phase 27 complete — search index enrichment for company v7.0 fields (27-01 + 27-02)
Resume file: None
Next: v7.0 complete — all 14 plans done

---
*Created: 2026-02-12*
*Last updated: 2026-03-04 (Phase 27 complete, v7.0 all 14 plans done)*
