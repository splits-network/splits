# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v10.0 Video Platform & Recruiting Calls — Phase 43 in progress

## Current Position

Phase: 43 (2 of 5 in v10.0) — Video App Infrastructure
Plan: 4 of 4 complete
Status: Phase complete
Last activity: 2026-03-08 — Completed 43-04-PLAN.md (Docker & K8s Deployment)

Progress: [████████░░░░░░░░░░░░] 8/20 plans (40%)

## Performance Metrics

**Cumulative (v2.0-v9.0):**
- Total plans completed: 114 (36 from v2.0-v5.0 + 20 from v6.0 + 14 from v7.0 + 44 from v9.0)
- v10.0 plans completed: 8

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42-call-data-model-service-layer | 4/4 | 11min | 2.75min |
| 43-video-app-infrastructure | 4/4 | 13min | 3.25min |

## Accumulated Context

### Decisions

See .planning/PROJECT.md Key Decisions table for full cumulative list.

Recent decisions affecting current work:

- [v10.0 Research]: New `calls` table alongside existing `interviews` (parallel tables, not replacing)
- [v10.0 Research]: Magic-link-only auth for video app (no Clerk in video app)
- [v10.0 Research]: Single `apps/video/` serving two subdomains via Host header brand detection
- [v10.0 Research]: Call artifacts owned by call record, not posted to entity note tables
- [42-01]: RLS uses participant-based access only; entity stakeholder access at service layer
- [42-01]: Polymorphic entity index on (entity_type, entity_id) resolves research performance concern
- [42-01]: call_types as lookup table (not enum) for extensibility without migrations
- [42-02]: Split repository into 3 files (main + participant + artifact) for ~200 line architecture compliance
- [42-02]: Entity-based list filtering uses pre-query on call_entity_links then IN clause
- [42-03]: Auto-add creator as host participant when not in participants list
- [42-03]: State transitions use 409 Conflict; access tokens 24h expiry, LiveKit JWTs 4h TTL
- [42-04]: No auth bypass for call routes in Phase 42; magic-link bypass deferred to Phase 43
- [42-04]: No S3 env vars in call-service K8s — recording upload stays in video-service/ai-service
- [43-01]: Applicant Network theme uses violet-600 (#7c3aed) primary to distinguish from Splits indigo
- [43-01]: Brand detection defaults to Splits Network for unknown hostnames
- [43-02]: SessionStorage keyed by callId to pass LiveKit token between join and call pages
- [43-02]: First participant in exchange response treated as current user for identity display
- [43-02]: Server-side token length validation (32+ chars) before client rendering
- [43-03]: LiveKitRoom wraps entire CallExperience; connect gated on state (connecting|in-call)
- [43-03]: Prep state auto-skips to lobby since identity confirmation happens in join flow
- [43-03]: Inner CallStateRouter component pattern for hooks requiring LiveKit context
- [43-04]: Lighter resource limits for video (100m/128Mi) since no SSR auth overhead
- [43-04]: No Sentry DSN in initial video deployment - add when monitoring configured
- [43-04]: No direct service URLs in video deployment - communicates only through API gateway

### Pending Todos

None.

### Blockers/Concerns

- [RESOLVED]: Polymorphic entity query performance — composite index on (entity_type, entity_id) created in 42-01
- [Research]: Host header behind nginx ingress needs staging verification (Phase 43)
- [Research]: Summary storage for non-interview calls needs resolution (Phase 45)

## Session Continuity

Last session: 2026-03-08
Stopped at: Completed 43-04-PLAN.md (Docker & K8s Deployment) — Phase 43 complete
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-03-08 (43-04 complete — Dockerfile, K8s deployment, dual-subdomain ingress for video app)*
