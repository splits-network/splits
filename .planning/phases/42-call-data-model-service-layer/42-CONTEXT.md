# Phase 42: Call Data Model & Service Layer - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

A generalized call entity exists in the database and a new call-service can create, read, and manage calls with polymorphic entity linking, independent of the interview system. Existing interview code is not functionally modified — only a nullable `call_id` FK column is added to the interviews table for future Phase 46 migration.

</domain>

<decisions>
## Implementation Decisions

### Call type modeling
- **Lookup table** (`call_types`) rather than Postgres enum — flexible, no migration to add types
- call_types includes **metadata columns**: default_duration, requires_recording_consent, supports_ai_summary
- **Three seed types** at launch: `interview`, `client_meeting`, `internal_call`
- Call **status** as **Postgres enum**: `scheduled`, `active`, `completed`, `cancelled`
- **Title column** on calls table (optional text field for subject/description)
- **Time tracking**: all four columns — `scheduled_at`, `started_at`, `ended_at`, `duration_minutes`
- **created_by** FK to users table (tracks who initiated the call)
- **livekit_room_name** stored as explicit column (not derived from call ID)
- **Soft delete** via `deleted_at` timestamp

### Entity linking
- **Junction table** (`call_entity_links`): call_id, entity_type, entity_id
- Supports **multiple entity links per call** (e.g., call linked to both company and job)
- **entity_type as Postgres enum**: `application`, `job`, `company`, `firm`, `candidate`

### Participant model
- `call_participants` table with **role column** as Postgres enum: `host`, `participant`, `observer`
- **Always link to users table** — magic-link participants must have a users record
- Track **joined_at + left_at** timestamps for attendance analytics
- **Per-participant recording consent**: consent_given boolean + consent_at timestamp on call_participants

### Access tokens
- **New `call_access_tokens` table** — dedicated, separate from interview tokens
- Fields: token, call_id, user_id, expires_at, used_at

### Artifact ownership
- **Separate `call_recordings` table** — Claude decides whether one or multiple recordings per call
- **Separate `call_transcripts` table** — structured JSONB format (speaker labels, timestamps per segment)
- Transcripts stored as **JSON files in Supabase Storage**, referenced by URL in `call_transcripts` table (NOT in DB as text, NOT in Azure Blob)
- **Separate `call_summaries` table** — structured JSONB with **type-specific schemas** (interview: strengths/concerns/recommendation; client meeting: action items/decisions/follow-ups)
- **One summary per call** (unique constraint on call_id) — re-running replaces the old summary
- **Separate `call_notes` table**: call_id, user_id, content, created_at (one per participant per call)
- All artifacts **inherit RLS from parent call** — if you can see the call, you see all artifacts

### Interview backward compatibility
- **Nullable `call_id` FK** added to interviews table in Phase 42
- **Unique constraint** on interviews.call_id (1:1 relationship)
- **Column is NOT populated** in Phase 42 — Phase 46 handles all wiring
- **Zero functional changes** to interview code in this phase
- All call tables in **public schema** (consistent with existing convention)
- Table naming: `calls`, `call_*` prefix (matches interview naming pattern)

### API contract design
- **New standalone `call-service`** (separate microservice, not a module in video-service)
- Standard service scaffold: **repository/service/route layers with Fastify**
- Gateway route prefix: **`/api/calls`** (top-level, not nested under /api/video)
- **V2 5-route pattern** (list, get, create, update, delete) **plus status transition routes**: POST /calls/:id/start, /end, /cancel
- **Inline entity links** on creation: POST body includes entity_links array and participants array
- **Separate sub-resource endpoints** for participants: POST /calls/:id/participants, DELETE /calls/:id/participants/:id
- **Separate sub-resource endpoints** for entity links: POST /calls/:id/entities, DELETE /calls/:id/entities/:id
- List endpoint filters: **call_type, entity_type, entity_id, status, date range** (all available from Phase 42)
- List response **includes participant details** (names, avatars) — no N+1 lookups
- Detail response supports **`?include=` flag**: recordings, transcript, summary, notes (client chooses what to load)
- **Standard `{ data }` response envelope** per api-response-format.md
- **StandardListParams/StandardListResponse** pagination per pagination.md
- **Clerk users only** for call creation (no service-to-service auth needed yet)
- **RLS: participants + entity stakeholders** can see calls (not just participants)
- **RabbitMQ lifecycle events** published: call.created, call.started, call.ended, call.cancelled
- **Token generation on call-service**: POST /calls/:id/token handles full magic link creation AND LiveKit JWT exchange
- **Full deployment stack** in Phase 42: Dockerfile, K8s manifests, gateway registration, health check

### Claude's Discretion
- Whether call_recordings supports one or multiple recordings per call
- Exact RLS policy implementation for entity stakeholder access
- Index strategy for polymorphic entity queries
- call_access_tokens column details beyond the core fields
- call_types metadata column specifics

</decisions>

<specifics>
## Specific Ideas

- Transcript storage in Supabase Storage specifically chosen to reduce database burden from large text files
- Summary schemas should be type-specific: interview summaries focus on candidate assessment, client meeting summaries focus on business outcomes and action items
- Per-participant recording consent (not per-call) for compliance granularity

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 42-call-data-model-service-layer*
*Context gathered: 2026-03-08*
