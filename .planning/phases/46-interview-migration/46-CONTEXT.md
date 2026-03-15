# Phase 46: Interview Migration - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Redirect existing interview video flows to the dedicated video app, migrate all interview functionality to the call system, and remove all interview-specific code, services, tables, and infrastructure. This is a full replacement — not a bridge or adapter layer.

</domain>

<decisions>
## Implementation Decisions

### Redirect strategy
- "Join Interview" opens video app in a **new tab** (not same-tab redirect)
- **Big bang rollout** — all interviews redirect to video app at once upon deployment
- No fallback to old flow — **error page** if video app is unreachable
- **Updated branding** on candidate magic link emails (not transparent swap)
- Old in-portal interview video pages are **deleted entirely** — links go to video app
- Interview scheduling **unified** with call creation modal (Phase 44)
- Interview stage **kept** as application stage but **decoupled** from call creation — no auto-call on stage change
- "Schedule Call" **shortcut button** on application detail page opens call creation modal pre-filled with application context
- **Auto-link to application entity** when creating from application detail context
- **Auto-add candidate** as participant when creating from application context
- **Type badge/filter** distinguishes interview calls from recruiting calls in the Calls section
- All calls (interview + recruiting) route **through call-service** — unified service layer
- **Panel interviews migrate** to multi-participant calls
- **Call notes replace** interview-specific in-call notes
- Interview notification emails **replaced with call templates**
- Interview events **routed through call-service**, not direct video-service path

### Data migration
- **No production data exists** — interviews table and artifact tables are empty
- Migration is **purely schema changes and code cleanup** — no data to move, no files to relocate
- Recordings stored in Supabase Storage `copy-recordings` bucket (not Azure Blob Storage)
- **No physical file operations** needed — no recordings exist to move
- **DROP CASCADE** for interview-related tables
- **Drop interviews table** entirely (not just artifact tables)
- **Remove interview_id** column from applications table
- Application references migrated call via existing **call_id FK**
- Multi-round interviews use **call_entity_links** for many-to-many (call_id FK tracks primary/most recent)
- All schema changes via **Supabase migration** (SQL file)
- Use migration timestamps, not preserved original timestamps

### URL continuity
- **Pre-production system** — no magic links sent to real candidates
- **Direct URL change** — new links point to video app, no redirect layer needed
- Old interview token tables **dropped** — all tokens via call_access_tokens
- Magic link domain **based on participant type**: recruiters get splits.network, candidates get applicant.network
- Old portal routes like /interviews/:id **removed entirely** — no redirects

### Full cleanup (all at once deployment)
- **Delete interview-service** entirely (service directory, Dockerfile, package)
- **Keep video-service** — still serves video app and call system
- **Remove interview-specific AI code** from ai-service (generalized pipeline handles everything)
- **Remove interview gateway routes** entirely (no redirects to call-service)
- **Remove interview RabbitMQ events** — call events handle everything
- **Remove interview notification templates** from notification-service
- **Remove interview consumer** from notification-service
- **Remove interview calendar code** from integration-service — call calendar integration replaces it
- **Delete all interview frontend pages** from portal (apps/portal)
- **Delete interview pages** from candidate app (apps/candidate)
- **Rename application "Interviews" tab to "Calls" tab** — shows entity-linked calls
- **Remove interview TypeScript types** from shared packages
- **Delete K8s resources** for interview-service (deployment, service, ingress YAML)
- **Update CI/CD** — remove interview-service from GitHub Actions build/deploy
- **Remove from pnpm workspace** — delete interview-service package entry
- **Keep shared-video package** — still used by video app
- "Interview" **kept as call_type** label in call creation modal
- "Interview" **terminology kept** where it makes UX sense (stage name, call type filter/badge)

### Claude's Discretion
- Exact migration SQL ordering and dependency resolution
- Which interview types/interfaces to trace and remove
- How to handle any edge cases in FK cascade
- Order of file deletions within the coordinated deployment
- Whether to split into multiple migration files or single migration

</decisions>

<specifics>
## Specific Ideas

- Application detail page gets a "Schedule Call" shortcut that opens call creation modal pre-filled with application entity and candidate participant
- Call type badge distinguishes "Interview" from "Client Meeting" in the calls list UI
- Phase 44's entity-scoped call tabs pattern reused for application "Calls" tab

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 46-interview-migration*
*Context gathered: 2026-03-09*
