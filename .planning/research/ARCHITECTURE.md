# Architecture Patterns: Video Interviewing with LiveKit

**Domain:** Video interviewing infrastructure for recruiting marketplace
**Researched:** 2026-03-07
**Confidence:** HIGH (codebase analysis) / MEDIUM (LiveKit architecture from training data, not live-verified)

## Executive Summary

Video interviewing adds a self-hosted LiveKit media server to the existing Kubernetes cluster, a new `video-service` microservice following V2 patterns, and frontend video components shared via a new `video-ui` package. The architecture follows the established pattern: frontend calls api-gateway, which proxies to video-service, which manages interview sessions in Supabase and issues LiveKit access tokens. LiveKit handles all WebRTC media routing (SFU model), TURN/STUN negotiation, and recording via its Egress service. Recordings land in Azure Blob Storage and trigger RabbitMQ events for ai-service to transcribe and analyze.

**Critical architectural insight:** LiveKit is NOT a service you call through the api-gateway. It is a standalone media server that frontends connect to directly via WebSocket/WebRTC. The video-service's role is session orchestration -- creating rooms, issuing tokens, managing lifecycle -- while LiveKit handles all media. This is analogous to how Clerk handles authentication: the backend configures it, the frontend connects directly.

## Recommended Architecture

### High-Level System View

```
Browser (portal / candidate app)
    |                              |
    | (1) REST API calls           | (2) WebRTC media connection
    |                              |
    v                              v
NGINX Ingress                 LiveKit Server (K8s)
    |                              |
    v                              | (media routing, TURN/STUN)
API Gateway                        |
    |                              v
    v                         LiveKit Egress (K8s)
video-service (Fastify)            |
    |                              | (recording output)
    | (DB queries)                 v
    v                         Azure Blob Storage
Supabase Postgres                  |
    |                              | (RabbitMQ event)
    v                              v
RabbitMQ  <--------------------  video-service (consumer)
    |                              |
    v                              v
ai-service                    notification-service
(transcription + analysis)    (recording ready email)
```

### Interview Scheduling Flow

```
(1) Recruiter clicks "Schedule Interview" on application
         |
         v
(2) Frontend calls POST /api/v2/video/interviews
    Body: { application_id, scheduled_at, duration_minutes, participant_emails[], type }
         |
         v
(3) api-gateway proxies to video-service
         |
         v
(4) video-service:
    a. Validates application exists, user has permission
    b. Creates interview record in DB (status: 'scheduled')
    c. Generates magic_link_token for each external participant
    d. Publishes 'interview.scheduled' RabbitMQ event
         |
         v
(5) notification-service consumes event:
    a. Sends calendar invite emails with join links
    b. Links include magic_link_token for non-authenticated users
         |
         v
(6) integration-service (optional):
    a. If recruiter has Google/Microsoft calendar connected
    b. Creates calendar event via CalendarService
    c. Adds video link to calendar event description
```

### Interview Join Flow (Authenticated User -- Recruiter/Business)

```
(1) User clicks "Join Interview" in portal app
         |
         v
(2) Frontend calls POST /api/v2/video/interviews/:id/join
    Headers: Authorization: Bearer <Clerk JWT>
         |
         v
(3) api-gateway authenticates via Clerk, proxies to video-service
         |
         v
(4) video-service:
    a. Validates user is a participant on this interview
    b. Creates LiveKit room if not exists (via LiveKit Server API)
    c. Generates LiveKit access token with participant identity + grants
    d. Updates participant status to 'joined'
    e. Returns { livekit_url, token, room_name }
         |
         v
(5) Frontend receives token, connects to LiveKit server directly
    - @livekit/components-react handles WebRTC negotiation
    - Media flows peer <-> LiveKit SFU <-> peer
    - No media touches video-service or api-gateway
```

### Interview Join Flow (Candidate via Magic Link)

```
(1) Candidate clicks magic link in email:
    https://applicant.network/interview/join?token=<magic_link_token>
         |
         v
(2) Candidate app validates token via:
    POST /api/v2/video/interviews/join-by-token
    Body: { token: <magic_link_token>, display_name: "John Doe" }
    Note: NO Clerk auth required -- api-gateway skips auth for this route
         |
         v
(3) video-service:
    a. Looks up magic_link_token in interview_participants table
    b. Validates: not expired, not already consumed, interview is joinable
    c. Creates LiveKit room if not exists
    d. Generates LiveKit access token with candidate identity
    e. Marks token as consumed
    f. Returns { livekit_url, token, room_name }
         |
         v
(4) Candidate app connects to LiveKit directly (same as authenticated flow)
```

### Recording Flow

```
(1) Host clicks "Start Recording" (or auto-record is configured)
         |
         v
(2) Frontend calls POST /api/v2/video/interviews/:id/recording/start
         |
         v
(3) video-service:
    a. Calls LiveKit Egress API: start room composite egress
    b. Configures output: MP4 to Azure Blob Storage
    c. Stores egress_id in interview_recordings table
    d. Returns { recording_id }
         |
         v
(4) LiveKit Egress worker:
    a. Joins the LiveKit room as a hidden participant
    b. Composites all video/audio tracks
    c. Encodes to MP4 in real-time
    d. Uploads segments to Azure Blob Storage
         |
         v
(5) When recording stops (manual or room closes):
    a. LiveKit sends webhook to video-service: egress.ended
    b. video-service updates recording status to 'completed'
    c. video-service publishes 'recording.completed' RabbitMQ event
         |
         v
(6) ai-service consumes 'recording.completed':
    a. Downloads recording from Azure Blob Storage
    b. Transcribes audio (via Whisper API or Azure Speech)
    c. Runs AI analysis on transcript (fit scoring, sentiment, key topics)
    d. Stores results in interview_transcripts / interview_analyses tables
    e. Publishes 'interview.analysis_completed' event
         |
         v
(7) notification-service:
    a. Sends "Interview analysis ready" notification to recruiter
```

## Component Boundaries

### New Components

| Component | Type | Location | Responsibility |
|-----------|------|----------|----------------|
| **video-service** | Fastify microservice | `services/video-service/` | Interview CRUD, LiveKit token generation, recording orchestration, webhook receiver |
| **LiveKit Server** | Third-party container | `infra/k8s/livekit/` | WebRTC SFU, media routing, TURN/STUN, room management |
| **LiveKit Egress** | Third-party container | `infra/k8s/livekit-egress/` | Recording, compositing video tracks to MP4 |
| **video-ui** | Shared package | `packages/video-ui/` | React components for video room (pre-join, in-call, controls) |
| **DB tables** | Schema additions | Supabase migration | interviews, interview_participants, interview_recordings, interview_transcripts |

### Modified Components

| Component | Modification | Why |
|-----------|-------------|-----|
| **api-gateway** | Add `video` to ServiceName union, register video-service, add proxy routes, skip auth for magic link route | Route video API requests |
| **api-gateway K8s** | Add VIDEO_SERVICE_URL env var | K8s service discovery |
| **shared-types** | Add interview event types, interview status enums | Cross-service type safety |
| **ingress.yaml** | Add LiveKit WebSocket/WebRTC paths OR separate ingress for LiveKit domain | LiveKit needs direct browser access |
| **portal app** | Add interview UI pages and components | Recruiter/business video experience |
| **candidate app** | Add magic link join page and video room | Candidate video experience |

### Unchanged Components

| Component | Why Unchanged |
|-----------|--------------|
| **ats-service** | video-service reads application data from DB directly |
| **integration-service** | Calendar integration triggered by RabbitMQ event, not HTTP |
| **chat-service/gateway** | Separate real-time system, no overlap |
| **identity-service** | User lookup via shared DB |
| **document-service** | Recordings go to Azure Blob, not Supabase Storage |
| **billing-service** | Video feature gating via plan checks (DB query) |

## LiveKit Server Architecture

### What LiveKit Is

LiveKit is an open-source WebRTC SFU (Selective Forwarding Unit). It handles:

- **Signaling:** WebSocket connection for session negotiation
- **Media routing:** Receives media from publishers, forwards to subscribers
- **TURN/STUN:** Built-in TURN server for NAT traversal (port 443/TCP relay, 3478/UDP)
- **Room management:** Create/close rooms, manage participants
- **Server API:** HTTP API for room/participant management from backend
- **Webhooks:** Notifies your backend of room events (participant joined, egress completed, etc.)

### Deployment Topology

```
K8s Cluster (splits-network namespace)
+-------------------------------------------------------+
|                                                       |
|  +------------------+    +------------------------+   |
|  | LiveKit Server   |    | LiveKit Egress         |   |
|  | (Deployment)     |    | (Deployment)           |   |
|  |                  |    |                        |   |
|  | Ports:           |    | Connects to:           |   |
|  |  7880 (HTTP API) |    |  - LiveKit Server      |   |
|  |  7881 (WebRTC)   |    |  - Azure Blob Storage  |   |
|  |  7882 (TURN/UDP) |    |  - Redis (for queue)   |   |
|  |  443  (TURN/TLS) |    |                        |   |
|  +------------------+    +------------------------+   |
|           |                                           |
|  +------------------+    +------------------------+   |
|  | video-service    |    | Redis                  |   |
|  | (Deployment)     |    | (existing, shared)     |   |
|  |                  |    |                        |   |
|  | Calls LiveKit    |    | Used by Egress for     |   |
|  |  Server API      |    |  job queuing           |   |
|  | Port: 3020       |    |                        |   |
|  +------------------+    +------------------------+   |
|                                                       |
+-------------------------------------------------------+
         |                           |
   NGINX Ingress              LiveKit Ingress/LB
   (api.splits.network)       (livekit.splits.network)
         |                           |
    video-service API          LiveKit WebRTC+WS
    (REST, via gateway)        (direct browser access)
```

### Network Requirements (MEDIUM confidence)

LiveKit needs specific network configuration for WebRTC to work:

| Port | Protocol | Purpose | Exposure |
|------|----------|---------|----------|
| 7880 | TCP | HTTP API (server-to-server) | Internal only (ClusterIP) |
| 7881 | TCP | WebRTC signaling (WebSocket) | External (ingress or LoadBalancer) |
| 3478 | UDP | STUN/TURN | External (NodePort or LoadBalancer) |
| 50000-60000 | UDP | WebRTC media (ICE candidates) | External (hostNetwork or UDP LB) |
| 443 | TCP | TURN over TLS (fallback) | External (ingress) |

**Critical networking decision: UDP media ports.**

WebRTC performs best with direct UDP. In Kubernetes, this requires one of:
1. **hostNetwork: true** -- Pod uses host's network stack, gets direct UDP access. Simple but limits to 1 LiveKit pod per node.
2. **NodePort service** -- Expose UDP port range via NodePort. Works but limited port range.
3. **Azure LoadBalancer with UDP** -- Azure supports UDP load balancers. Most production-appropriate for AKS.
4. **TURN-only fallback** -- Force all media through TURN on TCP 443. Works through any firewall but higher latency.

**Recommendation: Start with hostNetwork: true for simplicity** (1 LiveKit pod is sufficient for initial scale), then migrate to Azure UDP LoadBalancer when scaling beyond one node. Always enable TURN on TCP 443 as fallback for participants behind restrictive firewalls.

### LiveKit Configuration

```yaml
# livekit-config.yaml (ConfigMap)
port: 7880
rtc:
  port_range_start: 50000
  port_range_end: 60000
  tcp_port: 7881
  use_external_ip: true
turn:
  enabled: true
  domain: livekit.splits.network
  tls_port: 443
  udp_port: 3478
redis:
  address: redis:6379
  # password from secret
keys:
  # API key: secret key pair (from K8s secret)
  # Used by video-service to authenticate API calls
webhook:
  urls:
    - https://api.splits.network/api/v2/video/webhooks/livekit
  api_key: <from secret>
```

### LiveKit Egress Architecture (MEDIUM confidence)

LiveKit Egress is a separate service that records rooms:

- **Deployment:** Runs as a separate K8s Deployment alongside LiveKit Server
- **How it works:** When recording starts, Egress joins the room as a headless Chrome participant, captures all tracks, composites them, encodes to MP4
- **Dependencies:** Needs Chrome/Chromium (runs headless), Redis (for job queuing), and access to output storage
- **Resource intensive:** Each active recording consumes ~1-2 CPU cores and ~1-2GB RAM (headless Chrome + encoding)
- **Storage output:** Supports S3-compatible APIs, Azure Blob Storage, GCS

```yaml
# Egress configuration
api_key: <from secret>
api_secret: <from secret>
ws_url: ws://livekit-server:7880
redis:
  address: redis:6379
azure:
  account_name: <from secret>
  account_key: <from secret>
  container_name: interview-recordings
```

## video-service Internal Architecture

Following the V2 service pattern exactly:

```
services/video-service/
+-- Dockerfile
+-- package.json
+-- tsconfig.json
+-- src/
    +-- index.ts                          # Fastify server setup
    +-- v2/
    |   +-- shared/
    |   |   +-- livekit-client.ts         # LiveKit Server SDK wrapper
    |   |   +-- magic-link.ts             # Token generation/validation
    |   |   +-- events.ts                 # RabbitMQ event publisher
    |   +-- interviews/
    |   |   +-- types.ts                  # Interview, Participant, Recording types
    |   |   +-- repository.ts             # interviews, interview_participants CRUD
    |   |   +-- service.ts                # Business logic, LiveKit orchestration
    |   |   +-- routes.ts                 # REST endpoints
    |   +-- recordings/
    |   |   +-- types.ts                  # Recording, Transcript types
    |   |   +-- repository.ts             # interview_recordings, interview_transcripts CRUD
    |   |   +-- service.ts                # Recording lifecycle, storage URL generation
    |   |   +-- routes.ts                 # Recording endpoints
    |   +-- webhooks/
    |   |   +-- livekit-webhook.ts        # LiveKit webhook handler (egress.ended, etc.)
    |   +-- routes.ts                     # Route registry
    +-- consumers/
        +-- recording-consumer.ts         # (Optional) Process recording events
```

### Key Service Responsibilities

**video-service owns:**
- Interview lifecycle (schedule, start, end, cancel)
- Participant management (invite, join, leave)
- Magic link token generation and validation
- LiveKit room creation and token issuance
- Recording start/stop orchestration
- Webhook processing from LiveKit
- Publishing domain events to RabbitMQ

**video-service does NOT own:**
- Media routing (LiveKit)
- Video encoding/recording (LiveKit Egress)
- Transcription (ai-service)
- Calendar events (integration-service via RabbitMQ)
- Email notifications (notification-service via RabbitMQ)

### LiveKit SDK Integration

```typescript
// services/video-service/src/v2/shared/livekit-client.ts
import { RoomServiceClient, AccessToken, VideoGrant } from 'livekit-server-sdk';

export class LiveKitClient {
    private roomService: RoomServiceClient;

    constructor(
        private livekitHost: string,    // http://livekit-server:7880
        private apiKey: string,
        private apiSecret: string,
    ) {
        this.roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
    }

    /** Create or get a room for an interview */
    async ensureRoom(interviewId: string): Promise<string> {
        const roomName = `interview-${interviewId}`;
        await this.roomService.createRoom({
            name: roomName,
            emptyTimeout: 300,       // Close 5 min after last participant leaves
            maxParticipants: 10,     // Panel interviews
        });
        return roomName;
    }

    /** Generate an access token for a participant */
    generateToken(
        roomName: string,
        participantIdentity: string,
        participantName: string,
        grants: { canPublish: boolean; canSubscribe: boolean; canPublishData: boolean },
    ): string {
        const token = new AccessToken(this.apiKey, this.apiSecret, {
            identity: participantIdentity,
            name: participantName,
            ttl: '4h',  // Token valid for 4 hours
        });
        token.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: grants.canPublish,
            canSubscribe: grants.canSubscribe,
            canPublishData: grants.canPublishData,
        } as VideoGrant);
        return token.toJwt();
    }
}
```

## Database Schema

### New Tables

```sql
-- Interview sessions
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id),
    job_id UUID REFERENCES jobs(id),
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('screening', 'technical', 'panel', 'final')),
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    livekit_room_name TEXT,           -- Set when room is created
    auto_record BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT NOT NULL,          -- clerk_user_id of scheduler
    organization_id UUID,             -- For RBAC scoping
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_application ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_interviews_status ON interviews(status);

-- Interview participants (both authenticated and magic-link)
CREATE TABLE interview_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('host', 'interviewer', 'candidate', 'observer')),
    -- Authenticated participants (Clerk users)
    clerk_user_id TEXT,               -- NULL for magic-link participants
    user_id UUID,                     -- identity-service user ID
    -- Magic-link participants (candidates without accounts)
    email TEXT,
    display_name TEXT,
    magic_link_token TEXT UNIQUE,     -- Hashed token for joining
    magic_link_expires_at TIMESTAMPTZ,
    -- Status
    status TEXT NOT NULL DEFAULT 'invited'
        CHECK (status IN ('invited', 'joined', 'left', 'no_show')),
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT participant_identity CHECK (
        clerk_user_id IS NOT NULL OR email IS NOT NULL
    )
);

CREATE INDEX idx_interview_participants_interview ON interview_participants(interview_id);
CREATE INDEX idx_interview_participants_magic_link ON interview_participants(magic_link_token)
    WHERE magic_link_token IS NOT NULL;
CREATE INDEX idx_interview_participants_clerk_user ON interview_participants(clerk_user_id)
    WHERE clerk_user_id IS NOT NULL;

-- Interview recordings
CREATE TABLE interview_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    livekit_egress_id TEXT NOT NULL,   -- LiveKit egress ID for tracking
    status TEXT NOT NULL DEFAULT 'recording'
        CHECK (status IN ('recording', 'processing', 'completed', 'failed')),
    storage_path TEXT,                 -- Azure Blob path when completed
    storage_url TEXT,                  -- Signed URL (generated on demand, not stored permanently)
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    format TEXT NOT NULL DEFAULT 'mp4',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_recordings_interview ON interview_recordings(interview_id);

-- Interview transcripts (populated by ai-service)
CREATE TABLE interview_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recording_id UUID NOT NULL REFERENCES interview_recordings(id) ON DELETE CASCADE,
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    content TEXT NOT NULL,             -- Full transcript text
    segments JSONB,                    -- Timestamped segments with speaker labels
    language TEXT NOT NULL DEFAULT 'en',
    status TEXT NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interview AI analysis (populated by ai-service)
CREATE TABLE interview_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    transcript_id UUID REFERENCES interview_transcripts(id),
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('summary', 'scorecard', 'sentiment')),
    content JSONB NOT NULL,            -- Structured analysis output
    model_version TEXT,                -- AI model used
    status TEXT NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_analyses_interview ON interview_analyses(interview_id);
```

## Integration Points with Existing Architecture

### 1. API Gateway Integration

Same pattern as all other services. Add `video` to the ServiceName union and register the service.

**api-gateway changes:**

```typescript
// services/api-gateway/src/routes/v2/common.ts
export type ServiceName =
    | 'analytics' | 'ats' | 'network' | 'billing'
    | 'notification' | 'identity' | 'document'
    | 'automation' | 'search' | 'gpt' | 'content'
    | 'integration' | 'matching' | 'gamification'
    | 'video';  // NEW

// services/api-gateway/src/routes/v2/video.ts (new file)
const VIDEO_RESOURCES: ResourceDefinition[] = [
    { name: 'interviews', service: 'video', basePath: '/video/interviews', tag: 'video' },
    { name: 'recordings', service: 'video', basePath: '/video/recordings', tag: 'video' },
];

// Plus custom routes for:
// - POST /api/v2/video/interviews/join-by-token (no auth -- magic link)
// - POST /api/v2/video/webhooks/livekit (no auth -- webhook signature verification)
```

**Auth skip for magic link and webhooks:**
```typescript
// api-gateway auth hook additions
if (request.url.startsWith('/api/v2/video/interviews/join-by-token')) return;  // Magic link
if (request.url.startsWith('/api/v2/video/webhooks/')) return;                 // LiveKit webhooks
```

### 2. RabbitMQ Event Integration

video-service publishes domain events that other services consume:

| Event | Publisher | Consumer(s) | Payload |
|-------|-----------|-------------|---------|
| `interview.scheduled` | video-service | notification-service, integration-service | interview_id, participants, scheduled_at |
| `interview.started` | video-service | notification-service | interview_id |
| `interview.completed` | video-service | ats-service (update stage?), notification-service | interview_id, duration |
| `interview.cancelled` | video-service | notification-service, integration-service | interview_id, reason |
| `recording.completed` | video-service | ai-service | recording_id, interview_id, storage_path |
| `interview.analysis_completed` | ai-service | notification-service | interview_id, analysis_id |
| `application.stage_changed` | ats-service | video-service (optional: auto-schedule?) | application_id, new_stage |

### 3. Calendar Integration

When an interview is scheduled, video-service publishes `interview.scheduled`. The integration-service can consume this event and create calendar events for participants who have connected Google/Microsoft calendars.

**Important:** This is an event-driven integration, NOT an HTTP call. video-service does not call integration-service directly. It publishes the event, and integration-service decides whether to act based on whether participants have calendar connections.

### 4. ai-service Integration

ai-service consumes `recording.completed` events to:
1. Download the MP4 from Azure Blob Storage
2. Extract audio and transcribe via Whisper API or Azure Cognitive Services Speech
3. Run analysis prompts on the transcript
4. Store results in interview_transcripts and interview_analyses tables
5. Publish `interview.analysis_completed` event

This follows the existing pattern where ai-service processes domain events asynchronously.

### 5. LiveKit Webhook Integration

LiveKit sends webhooks to video-service for room lifecycle events:

```typescript
// services/video-service/src/v2/webhooks/livekit-webhook.ts
// LiveKit signs webhooks with the API key/secret pair
// Use livekit-server-sdk WebhookReceiver to verify signatures

// Events we care about:
// - room_started: Room was created (update interview status)
// - room_finished: Last participant left (update interview status)
// - participant_joined: Track who joined and when
// - participant_left: Track who left and when
// - egress_started: Recording began successfully
// - egress_ended: Recording completed (trigger recording.completed event)
```

**Webhook route goes through api-gateway** but skips Clerk auth (same pattern as Stripe webhooks). video-service verifies the LiveKit webhook signature itself.

### 6. LiveKit Direct Browser Access

**Critical:** Unlike all other backend services, LiveKit needs direct browser access. Browsers connect to LiveKit via WebSocket for signaling and WebRTC for media. This traffic does NOT go through api-gateway.

**Options for exposing LiveKit:**

**Option A: Separate subdomain (RECOMMENDED)**
- `livekit.splits.network` points to LiveKit LoadBalancer/Ingress
- Separate TLS certificate (add to cert-manager)
- Clean separation of concerns
- LiveKit handles its own WebSocket upgrade

**Option B: Path-based routing on existing ingress**
- `api.splits.network/livekit/` routes to LiveKit
- Reuses existing TLS cert
- More complex ingress rules, potential conflicts with WebSocket upgrade handling

**Recommendation: Option A.** LiveKit's network requirements (UDP ports, WebSocket upgrades, TURN) are different enough from standard HTTP services that a separate ingress/LB is cleaner. The existing ingress already handles WebSocket for chat-gateway and analytics-gateway, but LiveKit also needs UDP which NGINX ingress handles poorly.

## Kubernetes Resources

### New K8s Manifests

```
infra/k8s/
+-- livekit/
|   +-- configmap.yaml          # LiveKit server config
|   +-- deployment.yaml         # LiveKit server pod (hostNetwork: true)
|   +-- service.yaml            # ClusterIP for internal API access
|   +-- ingress.yaml            # Or LoadBalancer for external WebRTC access
+-- livekit-egress/
|   +-- deployment.yaml         # Egress worker pod
+-- livekit-secrets/
|   +-- secrets.yaml            # API key, API secret, Azure credentials
+-- video-service/
    +-- deployment.yaml         # Standard Fastify service deployment
```

### LiveKit Server Deployment (MEDIUM confidence)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-server
  namespace: splits-network
spec:
  replicas: 1                    # Start with 1, scale later
  selector:
    matchLabels:
      app: livekit-server
  template:
    metadata:
      labels:
        app: livekit-server
    spec:
      hostNetwork: true          # Required for WebRTC UDP ports
      dnsPolicy: ClusterFirstWithHostNet
      containers:
        - name: livekit
          image: livekit/livekit-server:latest  # Pin to specific version in prod
          ports:
            - containerPort: 7880
              name: http
            - containerPort: 7881
              name: rtc-tcp
            - containerPort: 3478
              name: turn-udp
              protocol: UDP
          args: ["--config", "/etc/livekit/config.yaml"]
          volumeMounts:
            - name: config
              mountPath: /etc/livekit
          env:
            - name: LIVEKIT_KEYS
              valueFrom:
                secretKeyRef:
                  name: livekit-secrets
                  key: livekit-keys
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
      volumes:
        - name: config
          configMap:
            name: livekit-config
```

### LiveKit Egress Deployment (MEDIUM confidence)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: livekit-egress
  namespace: splits-network
spec:
  replicas: 1
  selector:
    matchLabels:
      app: livekit-egress
  template:
    metadata:
      labels:
        app: livekit-egress
    spec:
      containers:
        - name: egress
          image: livekit/egress:latest   # Pin version in prod
          env:
            - name: EGRESS_CONFIG_BODY
              valueFrom:
                secretKeyRef:
                  name: livekit-secrets
                  key: egress-config
          resources:
            requests:
              cpu: 1000m            # Recording is CPU intensive
              memory: 2Gi           # Headless Chrome needs RAM
            limits:
              cpu: 4000m
              memory: 4Gi
```

### video-service Deployment

Standard pattern matching existing services:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-service
  namespace: splits-network
spec:
  replicas: 2
  selector:
    matchLabels:
      app: video-service
  template:
    metadata:
      labels:
        app: video-service
    spec:
      containers:
        - name: video-service
          image: ${ACR_SERVER}/video-service:${IMAGE_TAG}
          ports:
            - containerPort: 3020
              name: http
          env:
            - name: PORT
              value: "3020"
            - name: LIVEKIT_HOST
              value: "http://livekit-server:7880"
            - name: LIVEKIT_API_KEY
              valueFrom:
                secretKeyRef:
                  name: livekit-secrets
                  key: api-key
            - name: LIVEKIT_API_SECRET
              valueFrom:
                secretKeyRef:
                  name: livekit-secrets
                  key: api-secret
            - name: LIVEKIT_WS_URL
              value: "wss://livekit.splits.network"
            # Standard env vars (Supabase, RabbitMQ, etc.)
            - name: SUPABASE_URL
              valueFrom:
                secretKeyRef:
                  name: supabase-secrets
                  key: supabase-url
            # ... (same pattern as other services)
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
```

## Frontend Architecture

### video-ui Package

Shared React components used by both portal and candidate apps:

```
packages/video-ui/
+-- src/
|   +-- components/
|   |   +-- pre-join-screen.tsx      # Camera/mic preview, device selection
|   |   +-- video-room.tsx           # Main video room with LiveKit provider
|   |   +-- participant-tile.tsx     # Single participant video/audio
|   |   +-- controls-bar.tsx         # Mute, camera, screen share, record, leave
|   |   +-- screen-share-view.tsx    # Screen share layout
|   |   +-- recording-indicator.tsx  # "Recording" badge
|   |   +-- chat-panel.tsx           # In-call text chat (LiveKit data channels)
|   +-- hooks/
|   |   +-- use-interview.ts         # Fetch interview details, join flow
|   |   +-- use-recording.ts         # Recording start/stop
|   |   +-- use-devices.ts           # Camera/mic enumeration and selection
|   +-- index.ts
+-- package.json                     # Depends on @livekit/components-react
```

**Key dependency:** `@livekit/components-react` provides pre-built React components and hooks for LiveKit. The video-ui package wraps these with Splits Network styling (DaisyUI + TailwindCSS) and business logic.

### Portal App Pages

```
apps/portal/src/app/(authenticated)/interviews/
+-- page.tsx                         # List interviews (upcoming, past)
+-- [id]/
|   +-- page.tsx                     # Interview detail (participants, recording, transcript)
+-- schedule/
    +-- page.tsx                     # Schedule new interview (linked from application)

apps/portal/src/app/(authenticated)/applications/[id]/
+-- (existing page, add "Schedule Interview" button to actions toolbar)
```

### Candidate App Pages

```
apps/candidate/src/app/interview/
+-- join/
    +-- page.tsx                     # Magic link landing page
                                     # Validates token, shows pre-join, enters room
```

## Patterns to Follow

### Pattern 1: LiveKit Token as Authorization Bridge

**What:** video-service generates short-lived LiveKit access tokens that encode participant identity and room permissions. The frontend uses these tokens to connect directly to LiveKit -- no further backend calls needed for media.

**Why:** Separates session orchestration (video-service) from media routing (LiveKit). The token is the authorization bridge between them.

### Pattern 2: Event-Driven Cross-Service Integration

**What:** video-service publishes RabbitMQ events for all interview lifecycle transitions. Other services consume events they care about.

**Why:** No HTTP calls between services (codebase rule). Calendar creation, email notifications, AI analysis, and stage updates all happen via events.

### Pattern 3: Magic Link with Scoped Access

**What:** Magic link tokens grant access to exactly one interview room, nothing else. They encode the interview_id and participant role, expire after the scheduled time, and are single-use.

**Why:** Candidates may not have accounts. Magic links provide frictionless join without compromising security. The token scope is narrower than any authenticated session.

### Pattern 4: Webhook Signature Verification

**What:** LiveKit webhooks are verified using the LiveKit server SDK's WebhookReceiver, which validates the signature using the shared API key/secret.

**Why:** Same pattern as Stripe webhooks in billing-service. Never trust webhook payloads without signature verification.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Routing Media Through api-gateway

**What:** Trying to proxy WebRTC connections through the api-gateway or any backend service.

**Why bad:** WebRTC requires direct peer-to-SFU connections. HTTP proxying adds unacceptable latency for real-time video. WebSocket upgrade through NGINX is possible but fragile for WebRTC signaling.

**Instead:** LiveKit gets its own ingress/LoadBalancer. Browsers connect directly. Only the REST API (room management, token generation) goes through api-gateway.

### Anti-Pattern 2: Storing Recordings in Supabase Storage

**What:** Using Supabase Storage (the existing document-service approach) for video recordings.

**Why bad:** Video files are large (100MB-1GB+ per interview). Supabase Storage has upload limits, is expensive for large files, and lacks streaming playback. LiveKit Egress natively supports Azure Blob/S3 output.

**Instead:** Use Azure Blob Storage with LiveKit Egress direct upload. Generate signed URLs in video-service for playback.

### Anti-Pattern 3: Building Custom WebRTC Components

**What:** Implementing WebRTC signaling, ICE negotiation, or media rendering from scratch.

**Why bad:** WebRTC is extremely complex. Browser compatibility, NAT traversal, codec negotiation, bandwidth adaptation -- all solved problems in LiveKit's SDK.

**Instead:** Use `@livekit/components-react` for all video UI. Customize styling with DaisyUI, not media handling.

### Anti-Pattern 4: Synchronous Recording Processing

**What:** Waiting for transcription/analysis to complete before returning the recording endpoint response.

**Why bad:** Transcription takes minutes. Blocking the request creates timeouts and poor UX.

**Instead:** Recording completion triggers async RabbitMQ event. ai-service processes in background. Frontend polls or receives WebSocket notification when analysis is ready.

### Anti-Pattern 5: One Giant LiveKit Pod with Everything

**What:** Running LiveKit Server and Egress in the same pod/deployment.

**Why bad:** Egress is resource-intensive (headless Chrome). A recording spike could starve the media server of CPU/memory, degrading all active calls.

**Instead:** Separate deployments with independent resource limits. Egress can scale independently.

## Scalability Considerations

| Concern | At 10 concurrent calls | At 100 concurrent calls | At 1000 concurrent calls |
|---------|------------------------|-------------------------|--------------------------|
| **LiveKit Server** | 1 pod (hostNetwork) | 2-3 pods (need Azure UDP LB) | LiveKit Cloud or multi-node with load balancer |
| **LiveKit Egress** | 1 pod (handles ~3-5 recordings) | 3-5 pods | 10+ pods, consider dedicated node pool |
| **video-service** | 2 pods (same as other services) | 2 pods (lightweight) | 3-5 pods |
| **Azure Blob Storage** | Default tier | Default tier | Hot tier, lifecycle policies |
| **Database** | Minimal rows | Thousands of rows | Partition interviews by date |
| **Transcription** | Sequential in ai-service | Queue in ai-service | Dedicated transcription workers |

**Initial scale target:** 5-10 concurrent interviews is realistic for early deployment. The architecture supports this with minimal resources (1 LiveKit pod, 1 Egress pod, 2 video-service pods).

## Suggested Build Order

Based on dependency analysis:

### Phase 1: Infrastructure + Core Service

**Build:**
1. Database migration (interviews, participants, recordings tables)
2. video-service scaffold (Fastify, V2 pattern, health check)
3. LiveKit Server K8s deployment (ConfigMap, Deployment, Service)
4. LiveKit SDK integration in video-service (room create, token generate)
5. api-gateway integration (ServiceName, routes, auth skip for webhooks)
6. DNS + TLS for livekit.splits.network

**Why first:** Everything depends on LiveKit being deployed and video-service being able to create rooms and issue tokens. This is the foundation.

### Phase 2: Join Flow + Video UI

**Build:**
1. video-ui package scaffold (pre-join screen, video room, controls)
2. Authenticated join flow (portal app)
3. Magic link generation and validation
4. Candidate magic link join flow (candidate app)
5. Interview scheduling UI (linked from application actions toolbar)

**Why second:** Users need to actually join video calls. This phase produces a working end-to-end interview experience without recording.

### Phase 3: Recording + Storage

**Build:**
1. LiveKit Egress K8s deployment
2. Azure Blob Storage container setup
3. Recording start/stop endpoints
4. LiveKit webhook handler (egress.ended)
5. Recording playback (signed URL generation)
6. Recording UI (indicator, playback page)

**Why third:** Recording is an enhancement to the core video call. Requires Egress infrastructure and storage, which are independent of the basic call flow.

### Phase 4: Transcription + AI Analysis

**Build:**
1. RabbitMQ event: recording.completed
2. ai-service consumer for recording.completed
3. Whisper/Azure Speech transcription integration
4. Transcript storage and display UI
5. AI interview analysis (summary, scorecard)
6. Analysis display UI

**Why fourth:** Depends on recordings (Phase 3) existing. AI analysis is the highest-value differentiator but has the most external dependencies (AI APIs).

### Phase 5: Calendar + Notifications Integration

**Build:**
1. interview.scheduled event consumer in integration-service
2. Calendar event creation with video link
3. Email templates for interview invitations
4. Reminder notifications (15 min before)
5. Post-interview follow-up notifications

**Why fifth:** These are polish features that enhance the experience but don't block core functionality. Can be developed in parallel with Phase 3/4.

## Sources

**HIGH confidence (codebase analysis):**
- `services/api-gateway/src/clients.ts` -- ServiceRegistry pattern for adding new services
- `services/api-gateway/src/routes/v2/common.ts` -- ServiceName type, ResourceDefinition pattern
- `services/api-gateway/src/routes/v2/ats.ts` -- Resource registration pattern for new service
- `services/chat-gateway/src/index.ts` -- WebSocket gateway pattern, Clerk multi-tenant auth
- `services/integration-service/src/v2/calendar/service.ts` -- Calendar integration pattern
- `packages/shared-types/src/events.ts` -- DomainEvent interface for RabbitMQ events
- `packages/shared-job-queue/src/index.ts` -- RabbitMQ job queue pattern (amqplib)
- `infra/k8s/ingress.yaml` -- Current ingress routing, WebSocket support annotations
- `infra/k8s/ats-service/deployment.yaml` -- Standard K8s deployment pattern
- `infra/k8s/rabbitmq/deployment.yaml` -- Third-party service deployment pattern in K8s

**MEDIUM confidence (training data, not live-verified):**
- LiveKit Server architecture (SFU model, ports, configuration) -- based on training data through May 2025. Core architecture is stable but specific config options and API details should be verified against current LiveKit docs.
- LiveKit Egress (headless Chrome recording, S3/Azure output) -- general approach is well-established but exact configuration format and Azure Blob integration details should be verified.
- `livekit-server-sdk` Node.js API (AccessToken, RoomServiceClient, VideoGrant) -- API shape is stable but method signatures and options may have changed. Verify with Context7 or npm docs during implementation.
- `@livekit/components-react` -- React component library exists and is actively maintained. Specific component names and props should be verified.
- LiveKit webhook events and signature format -- verify with current LiveKit docs.
- Kubernetes hostNetwork for WebRTC UDP -- standard K8s pattern, verified approach for WebRTC workloads.

**LOW confidence (needs validation during implementation):**
- Exact LiveKit Egress Azure Blob Storage configuration format -- may differ from S3 config.
- LiveKit resource consumption per room (CPU/memory estimates are approximate).
- Whether LiveKit's built-in TURN server is sufficient or if a separate TURN server (coturn) is needed for production.
- Specific `@livekit/components-react` component hierarchy and customization points.
