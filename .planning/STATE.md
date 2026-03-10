# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08)

**Core value:** Connecting recruiters and companies through a marketplace model with transparent split-fee arrangements
**Current focus:** v10.0 Video Platform & Recruiting Calls — Gap closure in progress

## Current Position

Phase: 50 (9 of 9 in v10.0) — Post-Migration Text & Metadata Cleanup
Plan: 1 of 2
Status: In progress
Last activity: 2026-03-10 — Completed 50-01-PLAN.md (notification metadata & swagger cleanup)

Progress: [███████████████████████████████████] 35/36 plans

## Performance Metrics

**Cumulative (v2.0-v9.0):**
- Total plans completed: 114 (36 from v2.0-v5.0 + 20 from v6.0 + 14 from v7.0 + 44 from v9.0)
- v10.0 plans completed: 35

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 42-call-data-model-service-layer | 4/4 | 11min | 2.75min |
| 43-video-app-infrastructure | 4/4 | 13min | 3.25min |
| 44-recruiter-company-calls-portal-integration | 12/12 | 78min | 6.50min |
| 45-ai-pipeline-generalization | 4/4 | 11min | 2.75min |
| 46-interview-migration | 4/4 | 59min | 14.75min |
| 47-critical-bug-fixes-event-wiring | 1/1 | 4min | 4.00min |
| 48-interview-migration-cleanup | 3/3 | 7min | 2.33min |
| 49-critical-flow-fixes | 2/2 | 5min | 2.50min |
| 50-post-migration-text-metadata-cleanup | 1/2 | 2min | 2.00min |

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
- [44-01]: call_status is Postgres ENUM (ALTER TYPE ADD VALUE), not CHECK constraint
- [44-01]: cancelled_by is UUID REFERENCES users(id), matching created_by column type
- [44-01]: Call tags use lookup table + junction table pattern with participant-based RLS
- [44-04]: Scheduler repository in separate file to keep main repository under 200 lines
- [44-04]: Reminder windows use ranges (23h-25h) to tolerate 1-min interval drift
- [44-04]: 5-min reminders publish separate call.starting_soon event for in-app toast handling
- [44-05]: HTTP routes (not RabbitMQ consumer) for calendar operations — integration-service has no consumer infrastructure
- [44-05]: call_calendar_events tracking table with UNIQUE(call_id, user_id) for per-participant event mapping
- [44-05]: Multi-user availability endpoint at /api/v2/integrations/calendar/availability (no connectionId required)
- [44-02]: Extract lifecycle methods into call-lifecycle-service.ts for 200-line compliance
- [44-02]: Extract action routes into call-action-routes.ts for 200-line compliance
- [44-02]: Stats use parallel Supabase count queries, not RPC/raw SQL
- [44-02]: Search pre-filters extracted into list-helpers.ts as standalone function
- [44-07]: Instant calls show confirmation dialog before initiating
- [44-07]: Email-only participants use email: prefix for user_id
- [44-07]: Scheduling panel shows 30-min slots 8am-6pm when calendar available
- [44-07]: Tags use badge-lg with toggle selection pattern
- [44-06]: Calls sidebar item placed after Calendar in management section
- [44-06]: Table view as default viewMode for calls (data-dense content)
- [44-06]: Call list uses useStandardList hook following roles feature pattern
- [44-10]: Guest detection via accessToken presence (null = guest, Chat tab only)
- [44-10]: Panel preference stored per callId in localStorage
- [44-10]: Chat uses call:{callId} WebSocket channel for real-time messaging
- [44-08]: Shared currentTimestamp state in useCallDetail for recording-transcript sync
- [44-08]: Two-column 60/40 layout for call detail (main tabs + context panel)
- [44-08]: Pre-call notes visible to all participants for transparency
- [44-09]: Entity call tabs use syncToUrl: false to avoid polluting parent page URL
- [44-09]: Entity-scoped stats via /calls/stats?entity_type=X&entity_id=Y
- [44-09]: Default limit 10 for entity tabs (secondary content within detail panel)
- [44-11]: Call icon added to shared ChatSidebarHeader via optional onCallClick prop
- [44-11]: activeConversationMeta extended with otherUserId for call pre-fill context
- [44-11]: Schedule Follow-up uses URL params to pre-fill portal call creation page
- [44-12]: In-app notifications use notification_log with channel='in_app' and status='sent'
- [44-12]: Decline removes participant and publishes call.declined event
- [44-12]: Call toasts poll at 10s intervals for time-sensitive events
- [44-12]: normalizePayload handles both snake_case and camelCase event payloads
- [45-01]: Unified webhook with fallback pattern — tries interview egress first, falls back to call recording
- [45-02]: CallPipelineService has own OpenAI method rather than reusing interview-specific SummaryService
- [45-03]: Separate playback URL paths for video-service (in-call) vs call-service (portal detail page)
- [45-03]: Call recording webhook gateway route added for future direct call webhook endpoint
- [45-04]: Detect new vs legacy summary format via presence of tldr or content fields
- [45-04]: Pipeline status hides when complete — summary content is sufficient indicator
- [45-04]: 15-second polling interval for auto-refresh during processing
- [46-01]: Kept interview_feedback note type -- general-purpose, not tied to interview schema
- [46-01]: No interview_id column on applications -- FK was interviews.application_id, dropped with table
- [46-02]: Moved signed-url-helper from interviews/ to shared/ -- call-recording-routes depends on it
- [46-02]: Created dedicated call recording webhook replacing unified interview+call webhook
- [46-03]: Kept application-search.tsx and platform-selector.tsx in scheduling dir (used by calendar create-event-modal)
- [46-03]: Deleted available-slots-list.tsx (only used by deleted interview scheduling modals)
- [46-03]: Left API endpoint paths in use-call-notes.ts unchanged — backend migration separate
- [46-03]: Kept interview_type field name in CallContext (matches existing API response shape) — RESOLVED in 48-02, renamed to call_type

- [46-04]: CallCreationModal used inline with defaultEntityType/defaultEntityId/defaultParticipants props for Schedule Call shortcut
- [46-04]: Schedule Call added to speed dial actions in actions-toolbar, available to recruiters/company users/admins

### Pending Todos

None.

### Blockers/Concerns

- [RESOLVED]: Polymorphic entity query performance — composite index on (entity_type, entity_id) created in 42-01
- [Research]: Host header behind nginx ingress needs staging verification (Phase 43)
- [RESOLVED]: Summary storage for non-interview calls — JSONB in call_summaries table, resolved in 45-02

## Session Continuity

Last session: 2026-03-10
Stopped at: Completed 50-01-PLAN.md (notification metadata & swagger cleanup)
Resume file: None

---
*Created: 2026-02-12*
*Last updated: 2026-03-10 (Completed 50-01: notification metadata & swagger cleanup)*
