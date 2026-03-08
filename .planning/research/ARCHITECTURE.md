# Architecture Patterns: Video Platform & Recruiting Calls

**Domain:** Generalized video calling platform for Splits Network
**Researched:** 2026-03-08
**Confidence:** HIGH (based on direct codebase analysis)

## Executive Summary

The current video architecture is tightly coupled to interviews: the `interviews` table has a mandatory `application_id` FK, all routes live under `/api/v2/interviews`, and the shared-video package types reference `InterviewContext` throughout. Generalizing to support recruiter-company calls requires a new data layer, a new Next.js app, and careful refactoring of shared components -- but the video infrastructure (LiveKit, recording, token generation) is reusable as-is.

The recommended approach is: **new `calls` table + new video app + refactored shared-video types**, keeping the existing interview flow working throughout migration.

---

## Current Architecture (As-Is)

### Component Map

```
Portal App (splits.network)
  /portal/interview/[id]           -- full-screen layout, Clerk auth
  JoinInterviewButton              -- window.open to /portal/interview/[id]
  InterviewClient                  -- useAuth() + fetchAuthenticatedToken()

Candidate App (applicant.network)
  /interview/[token]               -- magic link auth, no Clerk
  InterviewClient                  -- exchangeMagicLink(token)
  PrepPage                         -- candidate prep before lobby

packages/shared-video
  Components: VideoLobby, VideoRoom, VideoControls, NotesPanel, etc.
  Hooks: useInterviewToken, useCallDuration, useRecordingState, useInterviewNotes
  Types: CallState, InterviewContext, TokenResult, LocalUserChoices
  Config: getLiveKitUrl, defaultRoomOptions

services/video-service (port 3019)
  /api/v2/interviews                -- CRUD, list by application
  /api/v2/interviews/:id/token      -- Clerk-authenticated LiveKit JWT
  /api/v2/interviews/join           -- magic link token exchange
  /api/v2/interviews/:id/recording  -- start/stop/consent/playback
  /api/v2/interviews/recording/webhook -- LiveKit Egress callback
  /api/v2/interviews/:id/notes      -- in-call notes (dual-auth)

services/api-gateway
  /api/v2/interviews/*              -- proxies all to video-service
  Auth: passes x-clerk-user-id header, empty for public routes

Infrastructure (K8s)
  livekit/                          -- LiveKit server
  livekit-egress/                   -- Egress service for recording
  video-service/                    -- Backend deployment
```

### Data Model (Current)

```
interviews
  id UUID PK
  application_id UUID NOT NULL FK -> applications(id)  <-- HARD COUPLED
  room_name TEXT UNIQUE
  status interview_status ENUM
  interview_type interview_type ENUM
  title TEXT
  scheduled_at TIMESTAMPTZ
  scheduled_duration_minutes INT
  recording_enabled BOOLEAN
  recording_status TEXT
  recording_egress_id TEXT
  recording_blob_url TEXT
  ... (15+ more columns)
  created_by UUID FK -> users(id)

interview_participants
  id UUID PK
  interview_id UUID FK -> interviews(id)
  user_id UUID FK -> users(id)
  role interview_participant_role ENUM ('interviewer', 'candidate', 'observer')

interview_access_tokens
  id UUID PK
  interview_id UUID FK -> interviews(id)
  participant_id UUID FK -> interview_participants(id)
  token TEXT UNIQUE

interview_notes, interview_transcripts, interview_recording_consents,
interview_reschedule_requests, user_calendar_preferences
```

### Authentication Flow

1. **Portal users (Clerk):** Clerk JWT -> api-gateway extracts `x-clerk-user-id` -> video-service resolves to internal `user_id` via `users.clerk_user_id` -> verifies participant membership -> generates LiveKit JWT.

2. **Candidate users (magic link):** Magic token string -> video-service looks up `interview_access_tokens.token` -> returns interview + participant + LiveKit JWT. No Clerk involved.

3. **API Gateway:** Passes `x-clerk-user-id` header when present, empty headers for public routes. The `/api/v2/interviews/join` endpoint is public (no auth required).

### Key Coupling Points

| Component | Coupled To | How |
|-----------|-----------|-----|
| `interviews` table | `applications` | `application_id NOT NULL FK` |
| `InterviewContext` type | Interview domain | `interview_type`, `job`, `company_name` fields |
| `interview_participants.role` | Interview roles | ENUM: `interviewer`, `candidate`, `observer` |
| Token service | Interview IDs | `interview_access_tokens.interview_id` |
| Recording service | Interview IDs | `interviews.recording_*` columns |
| Portal interview page | Portal app | Lives under `/portal/interview/[id]` |
| Candidate interview page | Candidate app | Lives under `/interview/[token]` |
| `useInterviewToken` hook | `/interviews/` endpoints | Hardcoded API paths |
| `PostCallSummary` | `isCandidate` boolean | Interview-specific post-call behavior |

---

## Target Architecture (To-Be)

### New Component: `apps/video/`

A dedicated Next.js app serving two subdomains:

```
video.splits.network     -- Portal user video (Splits Network branding)
video.applicant.network  -- Candidate video (Applicant Network branding)
```

**Why a separate app instead of routes in portal/candidate:**
1. Video calls need full-screen, chrome-free layout -- existing apps have nav, sidebars, etc.
2. Different authentication model -- video app supports both Clerk AND magic link in one app.
3. Shared codebase between branded experiences -- one app, two themes.
4. The video app already opens in a new window -- no user flow disruption.
5. Future call types (recruiter-company) don't belong in the candidate or portal navigation.

**Architecture of `apps/video/`:**

```
apps/video/
  src/
    app/
      [call-id]/               -- Authenticated call page (Clerk users)
        page.tsx               -- Server component, renders CallClient
        call-client.tsx        -- Client component, uses shared-video
      join/
        [token]/               -- Magic link page (candidates, external)
          page.tsx
          call-client.tsx
      layout.tsx               -- Full-screen, no nav, brand-aware
    lib/
      brand.ts                 -- Detect subdomain, return brand config
    middleware.ts              -- Optional: subdomain detection
```

**Authentication approach -- NO new Clerk instance needed:**

The video app does NOT need its own Clerk instance. Here is why:

- **Portal users (Clerk path):** When a portal user clicks "Join Call", the portal opens `video.splits.network/[call-id]`. The video app uses the SAME Clerk instance as the portal (same `CLERK_PUBLISHABLE_KEY`). Clerk cookies are domain-scoped; since both are on `*.splits.network`, session sharing works IF the Clerk instance is configured for the parent domain. If not, the portal can pass a short-lived session token in the URL query param that the video app exchanges for a LiveKit JWT.

- **Candidate users (magic link path):** No Clerk at all. The candidate clicks a magic link that opens `video.applicant.network/join/[token]`. The video app exchanges the token for a LiveKit JWT, same as today.

- **Recommended approach:** Use the portal's Clerk instance for `video.splits.network`. For the initial implementation, the simplest approach is to pass an opaque session token (not the Clerk JWT itself) in the URL when opening the video window, which the video app exchanges for a LiveKit JWT via the existing `/api/v2/interviews/:id/token` endpoint. This avoids Clerk configuration complexity entirely.

### Data Model: New `calls` Table (Recommended Approach)

**Decision: New `calls` table, NOT modify `interviews`.**

Rationale:
1. The `interviews` table has `application_id NOT NULL` -- making it nullable is a destructive migration that invalidates existing queries and constraints.
2. Interview-specific columns (round_name, interview_type ENUM, reschedule logic) don't apply to recruiter-company calls.
3. Cleaner separation of concerns -- interviews remain interview-specific, calls are the generalized concept.
4. Both interviews and calls are just "types of call" -- the underlying LiveKit room, recording, and participant machinery is the same.

```sql
-- New enum for generalized call types
CREATE TYPE call_type AS ENUM (
    'interview',           -- Linked to an application (migration bridge)
    'recruiter_company',   -- Recruiter <-> company contact call
    'recruiter_candidate', -- Direct recruiter <-> candidate (not application-specific)
    'internal'             -- Internal team calls
);

CREATE TYPE call_status AS ENUM (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'expired'
);

CREATE TYPE call_participant_role AS ENUM (
    'host', 'guest', 'observer'
);

-- The generalized calls table
CREATE TABLE calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_type call_type NOT NULL,
    room_name TEXT UNIQUE,
    status call_status NOT NULL DEFAULT 'scheduled',
    title TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    scheduled_duration_minutes INT NOT NULL DEFAULT 30,
    actual_start_at TIMESTAMPTZ,
    actual_end_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    max_duration_seconds INT NOT NULL DEFAULT 14400,

    -- Polymorphic entity link
    entity_type TEXT,     -- 'application', 'company', 'job', 'firm', etc.
    entity_id UUID,       -- FK to the relevant entity (not enforced at DB level)

    -- Recording (same columns as interviews)
    recording_enabled BOOLEAN NOT NULL DEFAULT false,
    recording_status TEXT CHECK (recording_status IN ('pending','recording','processing','ready','failed')),
    recording_egress_id TEXT,
    recording_blob_url TEXT,
    recording_duration_seconds INT,
    recording_file_size_bytes BIGINT,
    recording_started_at TIMESTAMPTZ,
    recording_ended_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calls_entity ON calls(entity_type, entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_calls_status ON calls(status) WHERE status IN ('scheduled', 'in_progress');
CREATE INDEX idx_calls_scheduled ON calls(scheduled_at) WHERE status = 'scheduled';

CREATE TABLE call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role call_participant_role NOT NULL,
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_participant UNIQUE (call_id, user_id)
);

CREATE TABLE call_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES call_participants(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_call_access_token UNIQUE (call_id, participant_id)
);
```

**Polymorphic entity linking:** The `entity_type` + `entity_id` pattern is used instead of multiple nullable FKs. This is the standard approach for polymorphic associations in Postgres when the set of linked entity types will grow over time. No DB-level FK enforcement on `entity_id` -- application-level validation ensures integrity.

| call_type | entity_type | entity_id points to |
|-----------|------------|---------------------|
| `interview` | `application` | `applications.id` |
| `recruiter_company` | `company` | `companies.id` |
| `recruiter_company` | `job` | `jobs.id` |
| `recruiter_candidate` | `candidate` | `candidates.id` |
| `internal` | NULL | NULL |

### Migration Bridge: Interviews -> Calls

**Phase strategy: Parallel tables, not immediate migration.**

1. **Phase 1:** Create `calls` table. New call types (recruiter-company) use `calls`. Existing interviews stay on `interviews` table.
2. **Phase 2:** Video app works with both tables -- `/api/v2/calls` for new types, `/api/v2/interviews` for existing interviews.
3. **Phase 3 (optional, later):** Migrate interview data to `calls` table with `call_type = 'interview'`, update all references, deprecate `interviews` table.

This avoids a big-bang migration and lets the existing interview flow work unchanged.

### Service Layer Changes

**video-service expansion:**

```
services/video-service/src/v2/
  interviews/          -- EXISTING, unchanged
    routes.ts
    service.ts
    repository.ts
    recording-routes.ts
    recording-service.ts
    token-service.ts
    types.ts
  calls/               -- NEW, parallel module
    routes.ts          -- /api/v2/calls CRUD
    service.ts         -- Call lifecycle
    repository.ts      -- calls table access
    token-service.ts   -- Reuses LiveKit JWT generation
    types.ts           -- Call, CallParticipant, etc.
  shared/
    events.ts          -- Existing
    helpers.ts         -- Existing
    livekit.ts         -- NEW: Extract LiveKit JWT generation to shared
    recording.ts       -- NEW: Extract recording start/stop to shared
```

**Key refactoring:** Extract LiveKit JWT generation and recording logic from `InterviewRepository`/`TokenService` into shared utilities that both `interviews/` and `calls/` modules use. The LiveKit operations (token generation, egress start/stop) are entity-agnostic -- they only need a room name and participant identity.

**api-gateway expansion:**

```typescript
// New route registration in api-gateway
app.all('/api/v2/calls/*', proxyToVideoService);
app.all('/api/v2/calls', proxyToVideoService);
```

### shared-video Package Refactoring

The shared-video package currently uses interview-specific types. For generalization:

**Step 1: Introduce generalized types alongside interview types:**

```typescript
// New generalized types
export interface CallContext {
    id: string;
    callType: 'interview' | 'recruiter_company' | 'recruiter_candidate' | 'internal';
    status: string;
    title: string | null;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    recording_enabled: boolean;
    // Context varies by call type
    context: {
        entityType?: string;
        entityName?: string;    // Job title, company name, etc.
        entitySubName?: string; // Company name for job context
    };
    participants: Array<{
        id: string;
        role: string;
        name: string;
        avatar_url: string | null;
    }>;
}

// InterviewContext becomes an alias or adapter
export type InterviewContext = CallContext & {
    callType: 'interview';
    interview_type: string;
    reschedule_count: number;
    job: { id: string; title: string; company_name: string };
};
```

**Step 2: Update components to accept `CallContext`:**

Components like `VideoLobby`, `VideoRoom`, `PostCallSummary` receive `callContext` instead of `interviewContext`. The interview-specific fields (job title, company name) move into the `context` bag.

**Step 3: Keep backward compatibility:**

Export both `InterviewContext` (for existing portal/candidate code) and `CallContext` (for new video app). Adapter function converts between them.

### Integration Points

```
                    Portal App                          Candidate App
                    (splits.network)                    (applicant.network)
                         |                                    |
                    "Join Call"                          Magic Link
                    window.open()                       email click
                         |                                    |
                         v                                    v
              video.splits.network/[call-id]    video.applicant.network/join/[token]
                         |                                    |
                         |        apps/video/                 |
                         +--------[call-id]--+--join/[token]--+
                                     |
                              shared-video pkg
                         (VideoLobby, VideoRoom, etc.)
                                     |
                              API Gateway
                         (api.splits.network)
                                     |
                    +----------------+----------------+
                    |                                 |
              /api/v2/interviews              /api/v2/calls
              (existing interview flow)       (new call types)
                    |                                 |
                    +--------video-service------------+
                                     |
                              LiveKit Server
                         (rooms, tokens, egress)
```

### How Recruiter-Company Calls Get Created

**Flow:**

1. Recruiter views a company profile or job in portal.
2. Clicks "Schedule Call" or "Call Now" button.
3. Portal frontend POSTs to `/api/v2/calls` with:
   ```json
   {
     "call_type": "recruiter_company",
     "entity_type": "company",
     "entity_id": "company-uuid",
     "title": "Discuss Senior Developer role",
     "scheduled_at": "2026-03-15T14:00:00Z",
     "participants": [
       { "user_id": "recruiter-user-id", "role": "host" },
       { "user_id": "company-contact-user-id", "role": "guest" }
     ]
   }
   ```
4. video-service creates the call, generates access tokens, publishes event.
5. Notification service sends email/push to company contact with magic link.
6. Both parties join via the video app.

### Subdomain & Infrastructure

**New K8s resources needed:**

```
infra/k8s/video/
  deployment.yaml
  service.yaml
  hpa.yaml
```

**Ingress additions:**

```yaml
- host: video.splits.network
  http:
    paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
- host: video.applicant.network
  http:
    paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: video
            port:
              number: 80
```

**TLS:** Add `video.splits.network` and `video.applicant.network` to the cert-manager TLS hosts list.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Making `application_id` nullable on `interviews`

**What:** Modifying the existing `interviews` table to support non-interview calls by making `application_id` nullable.
**Why bad:** Breaks 15+ existing queries that assume `application_id` is present. Requires updating every repository method. Mixes interview-specific logic (round_name, interview_type enum) with general call logic. Creates a "god table" anti-pattern.
**Instead:** Create a separate `calls` table. The interviews table stays pure.

### Anti-Pattern 2: Embedding Clerk auth in the video app for candidates

**What:** Setting up a Clerk instance for the video app and requiring candidates to authenticate via Clerk.
**Why bad:** Candidates access via magic links specifically because they don't have Clerk accounts. Adding Clerk for them would break the existing UX.
**Instead:** The video app supports BOTH paths: Clerk-based auth (portal users) and magic-link token exchange (candidates/external users). The route structure (`/[call-id]` vs `/join/[token]`) determines which path.

### Anti-Pattern 3: Splitting video-service into two services

**What:** Creating a separate `call-service` for the new call types.
**Why bad:** Both call types use the same LiveKit infrastructure, same recording pipeline, same token generation. Two services would duplicate this logic and create synchronization issues.
**Instead:** Add a `calls/` module within the existing video-service. Extract shared LiveKit/recording utilities.

### Anti-Pattern 4: Polymorphic FK columns (multiple nullable FKs)

**What:** `calls` table with `application_id UUID FK`, `company_id UUID FK`, `job_id UUID FK`, `candidate_id UUID FK` -- all nullable.
**Why bad:** Adding new entity types requires schema migrations. Sparse columns. Complex validation logic to ensure exactly one is set.
**Instead:** Use `entity_type TEXT` + `entity_id UUID` polymorphic pattern. Application-level validation. New entity types need zero schema changes.

---

## Patterns to Follow

### Pattern 1: Dual-Auth Route Design

**What:** Routes that support both Clerk-authenticated and magic-link-authenticated users.
**Already used in:** `PUT /api/v2/interviews/:id/notes`, `POST /api/v2/interviews/:id/recording/consent`
**How it works:**
```typescript
// If request has magic link token in body/query -> validate token, extract participant
// Else -> require x-clerk-user-id header, resolve to participant via DB
```

### Pattern 2: Window.open for Video Calls

**What:** Portal/candidate apps open video in a new window via `window.open()`.
**Already used in:** `JoinInterviewButton` component.
**Continue:** The video app opens in its own window. Closing the video window returns user to the portal/candidate app. The portal doesn't need to know anything about the video app's internal state.

### Pattern 3: Event-Driven Side Effects

**What:** Video-service publishes RabbitMQ events (`interview.created`, `interview.recording_ready`). Other services (notification, AI pipeline) consume them.
**Continue:** New call events follow the same pattern: `call.created`, `call.completed`, `call.recording_ready`. Notification service subscribes to send call invitations.

---

## Build Order (Suggested Phase Structure)

### Phase 1: Database & Service Foundation

1. Create `calls`, `call_participants`, `call_access_tokens` tables via migration.
2. Add `calls/` module to video-service (repository, service, types, routes).
3. Extract shared LiveKit JWT generation from interview token-service.
4. Add `/api/v2/calls` proxy routes to api-gateway.

**Dependencies:** None. Can be built without touching existing code.

### Phase 2: Video App Shell

1. Create `apps/video/` Next.js app with full-screen layout.
2. Implement brand detection (subdomain -> theme).
3. Wire up `[call-id]/page.tsx` with Clerk auth path.
4. Wire up `join/[token]/page.tsx` with magic link path.
5. Reuse shared-video components (VideoLobby, VideoRoom, etc.).
6. K8s deployment + ingress for `video.splits.network` and `video.applicant.network`.

**Dependencies:** Phase 1 (needs `/api/v2/calls` endpoints).

### Phase 3: Generalize shared-video Types

1. Introduce `CallContext` type alongside `InterviewContext`.
2. Update shared-video components to accept `CallContext`.
3. Keep `InterviewContext` as backward-compatible alias.
4. Update hooks (`useCallToken` alongside `useInterviewToken`).

**Dependencies:** Phase 2 (needed when video app starts using components for non-interview calls).

### Phase 4: Portal Integration

1. Update `JoinInterviewButton` to open `video.splits.network/[call-id]` instead of `/portal/interview/[id]`.
2. Add "Schedule Call" button on company/recruiter profiles.
3. Add call history/upcoming calls to portal dashboard.

**Dependencies:** Phase 2 (video app must be deployed).

### Phase 5: Candidate App Integration

1. Update magic link emails to point to `video.applicant.network/join/[token]`.
2. Remove interview pages from candidate app (after video app handles them).

**Dependencies:** Phase 2 (video app must be deployed).

### Phase 6: Interview Migration (Optional, Later)

1. Migrate existing interview creation to also create a `calls` row.
2. Eventually route all interview video through the video app.
3. Deprecate `/portal/interview/[id]` route.
4. Consider whether to migrate historical interview data to calls table.

**Dependencies:** Phases 1-5 complete, stable.

---

## Scalability Considerations

| Concern | Current (interviews only) | With calls generalized |
|---------|--------------------------|----------------------|
| LiveKit rooms | ~100 concurrent | Same infra, no change |
| Recording storage | Supabase S3 bucket | Same bucket, partitioned by call ID |
| Database load | Single `interviews` table | Two tables, same query patterns |
| Token generation | Per-interview | Per-call, same mechanism |
| WebSocket connections | LiveKit handles | No change, LiveKit scales |

No significant scalability concerns. The generalization adds a parallel table, not additional infrastructure load.

---

## Sources

- Direct codebase analysis (HIGH confidence):
  - `services/video-service/src/v2/` -- all interview routes, services, repository, types
  - `packages/shared-video/src/` -- all components, hooks, types
  - `apps/portal/src/app/portal/interview/` -- portal interview client
  - `apps/candidate/src/app/(public)/interview/` -- candidate interview client
  - `services/api-gateway/src/routes/v2/video.ts` -- gateway proxy
  - `supabase/migrations/20260307000005_create_interviews_schema.sql` -- DB schema
  - `supabase/migrations/20260308000001_extend_interviews_for_scheduling.sql` -- scheduling extensions
  - `supabase/migrations/20260309000001_add_recording_columns.sql` -- recording columns
  - `supabase/migrations/20260310000001_add_interview_transcripts.sql` -- transcript schema
  - `supabase/migrations/20260311000001_extend_interviews_for_panel_notes.sql` -- notes schema
  - `infra/k8s/ingress.yaml` -- production ingress/subdomain routing
