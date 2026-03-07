# Stack Research: Video Interviewing with LiveKit

**Domain:** Real-time video interviewing for recruiting marketplace
**Researched:** 2026-03-07
**Confidence:** HIGH (versions verified via npm registry; architecture patterns verified against existing codebase)

## Overview

This document covers stack **additions only** for adding self-hosted LiveKit video interviewing to the existing Splits Network platform. The existing stack (Fastify 5, Supabase Postgres, Next.js 16, React 19, Clerk, K8s on Azure AKS, Redis, RabbitMQ) is validated and unchanged. New capabilities: **LiveKit SFU server, video call UI, recording via Egress, AI transcription, and a new video-service microservice.**

## Decision Summary

| Capability | Recommendation | Rationale |
|------------|---------------|-----------|
| Video SFU | LiveKit Server (self-hosted on AKS) | Open-source, self-hostable, full data control, no per-minute costs. Already on K8s so infra overhead is minimal. |
| Server SDK | livekit-server-sdk 2.15.0 | Official Node.js SDK for room management and token generation. |
| Client SDK | livekit-client 2.17.2 + @livekit/components-react 2.9.20 | Battle-tested React components. Compatible with React 19. |
| Recording | LiveKit Egress (self-hosted) | Server-side recording to Azure Blob Storage. Reliable, independent of client state. |
| Transcription | OpenAI Whisper via existing ai-service | Already has openai SDK. Batch transcription of recordings. No new dependency. |
| Summarization | GPT-4o-mini via existing ai-service | Same pipeline as fit scoring. No new dependency. |
| Recording storage | Azure Blob Storage | Native to AKS infrastructure. S3-compatible API for Egress. |
| Magic links | crypto.randomUUID() (Node built-in) | No library needed. Short-lived tokens stored in DB. |

## Recommended Stack Additions

### Infrastructure: LiveKit Server (K8s Deployment)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| LiveKit Server | latest stable | WebRTC SFU (Selective Forwarding Unit) | Core video infrastructure. Handles all WebRTC complexity: signaling, STUN/TURN, media routing, room management. Self-hosted means zero per-minute API costs and full data sovereignty. |
| LiveKit Egress | latest stable | Server-side recording | Joins rooms as hidden participant, composites video, outputs MP4 to object storage. Runs headless Chrome internally. Separate K8s deployment for resource isolation. |
| Redis (existing) | existing cluster | LiveKit room state coordination | LiveKit requires Redis for multi-node state sync. Reuse existing Redis with a dedicated database index (db 2) to isolate from app cache (db 0). No new infrastructure. |

**LiveKit Server K8s Requirements:**

| Resource | Minimum | Notes |
|----------|---------|-------|
| CPU | 2 cores | SFU is CPU-bound (media forwarding). Scale up for concurrent rooms. |
| Memory | 2 GB | Moderate per-room overhead. 2 GB handles ~20 concurrent 1:1 calls. |
| Ports | 7880 (HTTP/WS), 7881 (TCP/TLS), 7882 (UDP) | UDP port 7882 is critical for WebRTC media quality. Must be externally accessible. |
| TLS | Required | Dedicated subdomain: `livekit.splits.network`. Use existing cert-manager + ingress-nginx. |
| TURN | Built-in | LiveKit includes embedded TURN server. No external TURN service (e.g., Twilio) needed. |

**LiveKit Egress K8s Requirements:**

| Resource | Minimum | Notes |
|----------|---------|-------|
| CPU | 2 cores per pod | Headless Chrome compositing is CPU-intensive. |
| Memory | 4 GB per pod | Headless Chrome is memory-hungry. 4 GB minimum per worker. |
| Scaling | 1 pod per concurrent recording | Each recording consumes one Egress instance. 2-3 replicas handles typical recruiting load. |
| Storage output | Azure Blob Storage | Configured via S3-compatible API or Azure-native settings. |

### Backend: video-service (New Microservice, Port 3019)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| livekit-server-sdk | 2.15.0 | Room management, participant token generation, Egress control | Official Node.js SDK. Creates/destroys rooms, generates access tokens with capability grants, starts/stops Egress recordings. Published 2025-12-10. Depends on @livekit/protocol ^1.43.1 and jose ^5.1.2 (both auto-resolved). |
| @azure/storage-blob | 12.31.0 | Recording storage management | Generate SAS URLs for secure playback. Manage recording lifecycle (retention policies). Azure-native, matches AKS infrastructure. |
| Fastify | ^5.6.2 | HTTP framework | Matches all 17 existing services. Use shared-fastify for consistent setup. |
| amqplib | ^0.10.9 | RabbitMQ event publishing | Publish interview lifecycle events (scheduled, started, ended, recording.ready) for ai-service and notification-service consumption. |

**Existing workspace dependencies (no installation needed):**
shared-config, shared-fastify, shared-logging, shared-types, shared-access-context, shared-job-queue, @supabase/supabase-js, @sentry/node

### Frontend: Portal + Candidate Apps

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @livekit/components-react | 2.9.20 | Pre-built video UI components | Official React component library. Provides `<VideoConference>`, `<ParticipantTile>`, `<ControlBar>`, `<Chat>`, and composable primitives. Peer dep on React >=18 (our React 19 is compatible). Published 2026-02-19. |
| livekit-client | 2.17.2 | Client-side WebRTC SDK | Core SDK handling room connection, track management, reconnection, bandwidth adaptation. Required peer dep of components-react. Published 2026-02-19. |
| @livekit/components-styles | 1.2.0 | Base CSS for LiveKit components | Default styling. Import as base layer, then override with Tailwind/DaisyUI classes to match Basel design system. |

### Supporting Libraries (Optional / Post-MVP)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @livekit/track-processors | 0.7.2 | Background blur, virtual backgrounds | Post-MVP polish. Not needed for initial launch. |
| @livekit/krisp-noise-filter | 0.4.1 | AI noise suppression | Post-MVP. Optional peer dep of components-react. Consider for noisy environment support. Separate license consideration. |

### No New Dependencies Required

These capabilities use existing infrastructure:

| Capability | Existing Tool | How |
|------------|--------------|-----|
| AI transcription | openai ^4.82.1 (in ai-service) | Whisper API accepts audio/video files. Send recording from Azure Blob. |
| AI summarization | openai ^4.82.1 (in ai-service) | GPT-4o-mini summarizes transcript. Same pipeline as fit scoring. |
| Magic link tokens | crypto.randomUUID() (Node.js built-in) | No library needed. |
| Email invitations | notification-service + Resend | Existing email infrastructure. New template for interview invitations. |
| Calendar integration | integration-service (Google combo provider) | Add LiveKit join URL to calendar event description. Existing Google Calendar sync. |
| Real-time events | RabbitMQ (existing) | Publish interview lifecycle events for async processing. |

## Installation

```bash
# video-service (new service, port 3019)
cd services/video-service
pnpm add livekit-server-sdk@2.15.0 @azure/storage-blob@12.31.0
# Plus existing workspace deps via package.json workspace:* references

# portal app
cd apps/portal
pnpm add @livekit/components-react@2.9.20 livekit-client@2.17.2 @livekit/components-styles@1.2.0

# candidate app (for magic link join UI)
cd apps/candidate
pnpm add @livekit/components-react@2.9.20 livekit-client@2.17.2 @livekit/components-styles@1.2.0
```

## New K8s Manifests

```
infra/k8s/livekit-server/deployment.yaml    # LiveKit SFU server (ports 7880, 7881, 7882)
infra/k8s/livekit-egress/deployment.yaml    # Egress recording service
infra/k8s/video-service/deployment.yaml     # Our video-service (port 3019)
```

### New K8s Secrets

```yaml
# livekit-secrets (new Secret resource)
livekit-api-key: "APIxxxxxx"            # Generated during LiveKit server setup
livekit-api-secret: "xxxxxxxxxxxxx"     # Generated during LiveKit server setup
livekit-ws-url: "wss://livekit.splits.network"

# azure-storage-secrets (new Secret resource)
azure-storage-account-name: "splitsrecordings"
azure-storage-account-key: "xxxxx"
azure-storage-container: "interview-recordings"
```

### DNS / Ingress Addition

New subdomain `livekit.splits.network` with:
- TLS certificate via cert-manager (same issuer as existing domains)
- Ingress rule routing to livekit-server Service on port 7880
- UDP exposure requires either a LoadBalancer Service for port 7882 or host networking

**UDP port exposure is the trickiest infrastructure piece.** Options:
1. **LoadBalancer Service (recommended):** Separate Azure LoadBalancer for UDP port 7882. Simple but adds a small Azure cost.
2. **HostNetwork mode:** Pod uses host's network stack directly. Avoids LoadBalancer but limits scheduling (one pod per node).
3. **NodePort:** Expose UDP on a high port. Works but may be blocked by corporate firewalls.

Recommendation: Use a dedicated LoadBalancer Service for LiveKit's UDP port. The HTTP/WS ports can go through existing ingress-nginx.

## Azure Blob Storage Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| Container name | `interview-recordings` | Dedicated container, separate from other storage |
| Access tier | Hot | Recordings accessed frequently after interviews. Apply lifecycle policy to move to Cool after 30 days. |
| Playback access | SAS tokens (generated by video-service) | Time-limited (1 hour) read-only URLs. Never expose storage keys to frontend. |
| Retention | 90-day default | Configurable per company. Compliance: some jurisdictions require consent + retention limits for recorded interviews. |
| Naming convention | `{company_id}/{interview_id}/{timestamp}.mp4` | Organized by company for easy bulk operations |

## Port Allocation

| Port | Service | Status |
|------|---------|--------|
| 3019 | video-service | **Available** (next unallocated in sequence: 3018 is gamification-service) |
| 7880 | livekit-server (HTTP/WS) | Infrastructure port, outside service range |
| 7881 | livekit-server (TCP/TLS) | Infrastructure port |
| 7882/udp | livekit-server (WebRTC media) | Infrastructure port |

## Integration Points with Existing Stack

| System | Integration | How |
|--------|-------------|-----|
| **api-gateway** | New `/api/v2/interviews/*` routes | Proxy to video-service:3019. Same pattern as other service proxy routes. |
| **ats-service** | Stage-triggered interview prompts | When application moves to "interview" stage, publish RabbitMQ event. Portal UI shows "Schedule Interview" prompt. |
| **integration-service** | Google Calendar event creation | Call integration-service to create calendar event with LiveKit join URL in location/description. Uses existing combo Google provider. |
| **ai-service** | Transcription + summarization pipeline | Consume `interview.recording.ready` RabbitMQ event. Download from Azure Blob, transcribe via Whisper, summarize via GPT-4o-mini, post as application note via ats-service. |
| **notification-service** | Interview invitation emails | Trigger email with magic link join URL via existing Resend templates. New template needed. |
| **Clerk** | Participant identity for authenticated users | Recruiter/hiring manager tokens include Clerk user ID as LiveKit participant identity. |
| **candidate app** | Magic link join page | `/interview/[token]` route. Validates token via video-service, connects to LiveKit room. No Clerk auth required. |

## Data Flow

```
SCHEDULING:
  Portal UI -> api-gateway -> video-service -> DB (interviews table)
                                            -> integration-service (Google Calendar event)
                                            -> notification-service (email with magic link)

JOIN (authenticated recruiter/hiring manager):
  Portal UI -> api-gateway -> video-service (generate LiveKit token)
  Portal UI -> LiveKit Server (WebSocket + WebRTC direct connection)

JOIN (candidate via magic link):
  Email link -> Candidate App /interview/[token]
  Candidate App -> api-gateway -> video-service (validate token, generate LiveKit token)
  Candidate App -> LiveKit Server (WebSocket + WebRTC direct connection)

RECORDING:
  In-call: Recruiter clicks "Record"
  Portal UI -> api-gateway -> video-service -> LiveKit Server API (start RoomCompositeEgress)
  LiveKit Egress -> joins room as hidden participant -> composites video -> Azure Blob Storage
  Egress completion -> webhook/callback -> video-service -> update DB -> publish RabbitMQ event

TRANSCRIPTION + SUMMARY:
  ai-service <- RabbitMQ (interview.recording.ready)
  ai-service -> Azure Blob Storage (download recording MP4)
  ai-service -> OpenAI Whisper API (audio transcription)
  ai-service -> OpenAI GPT-4o-mini (interview summary)
  ai-service -> ats-service (post as application note)
  ai-service -> video-service or direct DB (store transcript + summary on interview record)
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| LiveKit self-hosted | LiveKit Cloud | If K8s setup proves too complex or you want to ship faster. Start with Cloud, migrate to self-hosted when costs warrant it. Good Phase 1 shortcut if infrastructure timeline is tight. |
| LiveKit self-hosted | Daily.co | If you want zero infra management and accept per-minute pricing (~$0.004/min/participant). No self-hosting option. Good for teams without K8s experience. |
| LiveKit self-hosted | Twilio Video | Only if PSTN dial-in is a primary requirement. Twilio is stronger in telephony. For browser-only video, LiveKit is technically superior and cheaper self-hosted. Note: Twilio invested in LiveKit and is migrating its own video infrastructure toward it. |
| LiveKit self-hosted | 100ms | Managed SFU with generous free tier. Less self-hosting friendly. We want self-hosted for data control. |
| Azure Blob Storage | AWS S3 | Only if on AWS. We're on Azure (AKS). LiveKit Egress supports both via S3-compatible API. Azure Blob is the natural choice. |
| OpenAI Whisper API (batch) | Deepgram / AssemblyAI | If real-time transcription during the call is needed. Whisper is batch-only (post-recording). For post-interview transcription, Whisper is simpler since openai SDK is already in ai-service. |
| OpenAI Whisper API | Self-hosted Whisper | If transcription costs become significant. Requires GPU nodes in AKS. Not worth the complexity for typical recruiting interview volumes (tens to low hundreds per day). |
| @livekit/components-react | Custom video UI | Never. Building grid layouts, speaker detection, screen share layouts, and responsive video from scratch is person-years of work. Use the component library, style with Tailwind/DaisyUI. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| WebRTC peer-to-peer (no SFU) | Cannot scale beyond 2 participants. No recording. NAT traversal nightmare. | LiveKit SFU. |
| MediaRecorder API (client-side recording) | Browser-dependent quality. Lost if tab closes. No server control. Inconsistent formats. | LiveKit Egress (server-side recording). |
| Socket.IO for signaling | LiveKit handles all WebRTC signaling internally over its own WebSocket. Adding Socket.IO duplicates functionality. | LiveKit built-in signaling. |
| FFmpeg for post-processing recordings | LiveKit Egress outputs playable MP4 directly. Only needed if extracting audio-only track for Whisper (and Whisper accepts video files directly up to 25 MB). | Egress MP4 output directly. For large recordings, use FFmpeg audio extraction only. |
| Custom video UI from scratch | Extremely complex. Grid layouts, speaker detection, screen share switching, bandwidth adaptation UI, responsive design. | @livekit/components-react with Tailwind/DaisyUI styling. |
| Twilio Programmable Video | Twilio invested in LiveKit and is migrating. Writing is on the wall. | LiveKit directly. |
| Jitsi Meet | Full-featured but opinionated. Hard to embed cleanly. Heavy. Overkill for 1:1/panel interview use case. | LiveKit with custom React components. |

## Database Additions

New tables in `public` schema (via migrations, per project rules):

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `interviews` | Interview scheduling, metadata, recording references | id, application_id, job_id, scheduled_at, duration_minutes, status (scheduled/in_progress/completed/cancelled), livekit_room_name, recording_storage_path, transcript, summary, created_by |
| `interview_participants` | Invited/joined participants | id, interview_id, user_id (nullable for magic link candidates), email, name, role (interviewer/candidate/observer), magic_link_token (nullable), joined_at, left_at |

No new schemas needed. `public` schema per architecture rules.

## Environment Variables (New)

```bash
# video-service
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxx
LIVEKIT_WS_URL=wss://livekit.splits.network
AZURE_STORAGE_ACCOUNT_NAME=splitsrecordings
AZURE_STORAGE_ACCOUNT_KEY=xxxxx
AZURE_STORAGE_CONTAINER=interview-recordings

# ai-service (addition for recording download)
AZURE_STORAGE_ACCOUNT_NAME=splitsrecordings
AZURE_STORAGE_ACCOUNT_KEY=xxxxx
AZURE_STORAGE_CONTAINER=interview-recordings

# Frontend apps (public env vars)
NEXT_PUBLIC_LIVEKIT_WS_URL=wss://livekit.splits.network
```

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @livekit/components-react@2.9.20 | livekit-client@^2.17.2 | Strict peer dep. Must install matching version. |
| @livekit/components-react@2.9.20 | React >=18 | Our React 19 is fully compatible. |
| @livekit/components-react@2.9.20 | tslib@^2.6.2 | Already in monorepo. |
| livekit-server-sdk@2.15.0 | Node.js >=20 | Uses jose ^5.1.2 for JWT. Our Node 22 Docker base image is compatible. |
| livekit-server-sdk@2.15.0 | @livekit/protocol@^1.43.1 | Transitive dep, auto-resolved by npm/pnpm. |
| livekit-client@2.17.2 | @livekit/protocol@1.44.0 | Transitive dep, auto-resolved. |
| @azure/storage-blob@12.31.0 | Node.js >=18 | Compatible with Node 22. |

## video-service package.json

```json
{
    "name": "@splits-network/video-service",
    "version": "0.1.0",
    "private": true,
    "main": "./dist/index.js",
    "scripts": {
        "dev": "tsx watch src/index.ts",
        "build": "tsc -b",
        "start": "node dist/index.js",
        "clean": "rm -rf dist *.tsbuildinfo",
        "test": "vitest"
    },
    "dependencies": {
        "@azure/storage-blob": "^12.31.0",
        "@fastify/swagger": "^9.5.0",
        "@fastify/swagger-ui": "^5.2.3",
        "@sentry/node": "^10.32.1",
        "@splits-network/shared-access-context": "workspace:*",
        "@splits-network/shared-config": "workspace:*",
        "@splits-network/shared-fastify": "workspace:*",
        "@splits-network/shared-logging": "workspace:*",
        "@splits-network/shared-types": "workspace:*",
        "@splits-network/shared-job-queue": "workspace:*",
        "@supabase/supabase-js": "^2.86.2",
        "amqplib": "^0.10.9",
        "fastify": "^5.6.2",
        "livekit-server-sdk": "^2.15.0"
    },
    "devDependencies": {
        "@types/amqplib": "^0.10.5",
        "@types/node": "^24.10.1",
        "@vitest/coverage-v8": "^2.1.9",
        "tsx": "^4.19.2",
        "typescript": "^5.9.3",
        "vitest": "^2.1.9"
    }
}
```

**New dependencies not in any existing service:** livekit-server-sdk, @azure/storage-blob
**Everything else** is already used across the monorepo.

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| LiveKit CLI | Local dev: create tokens, inspect rooms | Install: `curl -sSL https://get.livekit.io/cli \| bash`. Not an npm dep. |
| livekit-server Docker image | Local dev: run LiveKit locally | `docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp livekit/livekit-server --dev`. No API key needed in dev mode. |
| livekit-egress Docker image | Local dev: test recording locally | Requires more setup (Chrome, output config). Consider skipping local Egress and testing recording only in staging. |

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| npm package versions | HIGH | Verified via npm registry (npm view). All dates confirmed Feb 2026 or later. |
| Peer dependency compatibility | HIGH | Verified via npm view peerDependencies. React 19 satisfies >=18. |
| Integration with existing stack | HIGH | Verified against actual codebase (package.json files, K8s manifests, port allocations, service patterns). |
| LiveKit Server K8s deployment specifics | MEDIUM | Based on training data. UDP exposure strategy and exact Helm values should be verified against official docs during implementation. |
| LiveKit Egress resource requirements | MEDIUM | Based on training data (headless Chrome is known to be resource-intensive). Exact minimums should be validated during staging deployment. |
| Azure Blob Storage for Egress output | MEDIUM | LiveKit Egress supports S3-compatible storage. Azure Blob exposes S3-compatible API. Exact configuration should be verified. |

## Research Gaps

1. **LiveKit Helm chart vs raw manifests** -- LiveKit publishes an official Helm chart. Given this project uses raw YAML manifests (not Helm), decide whether to adopt Helm for LiveKit only or translate chart values into raw YAML. Raw YAML is more consistent with existing patterns but Helm simplifies LiveKit-specific config.

2. **UDP port exposure on Azure AKS** -- The exact method for exposing UDP port 7882 through Azure LoadBalancer needs AKS-specific investigation. This is the single most infrastructure-complex piece.

3. **LiveKit Egress Azure Blob configuration** -- Whether Egress can write directly to Azure Blob (via S3-compat API) or needs a custom output handler should be verified against current Egress docs.

4. **Recording file size vs Whisper API limits** -- OpenAI Whisper API has a 25 MB file size limit. For long interviews (60+ min), the recording MP4 may exceed this. Plan for FFmpeg audio extraction as a fallback.

5. **LiveKit webhook configuration** -- How LiveKit Server notifies video-service of events (room started, participant joined, Egress completed). Webhook URL configuration and payload format need verification.

## Sources

| Source | Type | What It Provided |
|--------|------|-----------------|
| npm registry: livekit-server-sdk@2.15.0 | Verified | Version, dependencies, publication date (2025-12-10) |
| npm registry: livekit-client@2.17.2 | Verified | Version, dependencies, publication date (2026-02-19) |
| npm registry: @livekit/components-react@2.9.20 | Verified | Version, peer deps, publication date (2026-02-19) |
| npm registry: @livekit/components-styles@1.2.0 | Verified | Version |
| npm registry: @livekit/track-processors@0.7.2 | Verified | Version |
| npm registry: @livekit/krisp-noise-filter@0.4.1 | Verified | Version |
| npm registry: @azure/storage-blob@12.31.0 | Verified | Version |
| Existing codebase: infra/k8s/*/deployment.yaml | Verified | K8s patterns, port allocations, secret references |
| Existing codebase: services/ai-service/package.json | Verified | Service dependency pattern, openai SDK version |
| Existing codebase: services/ai-service/Dockerfile | Verified | Docker multi-stage build pattern |
| LiveKit architecture (training data) | Medium confidence | SFU architecture, Egress behavior, TURN embedding, Redis requirement |

---
*Stack research for: Video Interviewing with LiveKit*
*Researched: 2026-03-07*
