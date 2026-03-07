# Project Research Summary

**Project:** Splits Network v9.0 -- Video Interviewing with LiveKit
**Domain:** Real-time video interviewing for split-fee recruiting marketplace
**Researched:** 2026-03-07
**Confidence:** HIGH (stack verified via npm; architecture verified against codebase; features well-understood domain)

## Executive Summary

Video interviewing is a well-understood domain in recruiting technology, and the recommended approach is to self-host LiveKit (an open-source WebRTC SFU) on the existing AKS Kubernetes cluster. This gives full data control, zero per-minute API costs, and leverages existing infrastructure (Redis, RabbitMQ, NGINX ingress, cert-manager). A new `video-service` microservice (port 3019) handles interview scheduling, LiveKit token issuance, and recording orchestration, while LiveKit handles all media routing, TURN/STUN negotiation, and recording via its Egress service. The frontend uses LiveKit's official React component library, which is compatible with React 19.

The core competitive advantage is integration depth: unlike Greenhouse and Lever (which rely on external Zoom/Teams links), Splits Network will offer native in-app video with server-side recording, AI transcription via the existing ai-service, and automatic posting of interview summaries as application notes. The user never leaves the platform. Most enterprise ATS competitors do not have this. BreezyHR is the closest competitor with native video but lacks AI-powered transcription and summarization.

The primary risks are infrastructure-related: (1) UDP port exposure on AKS for WebRTC media requires careful LoadBalancer or hostNetwork configuration, (2) LiveKit Egress is resource-intensive (headless Chrome) and can silently drop recordings if under-resourced, and (3) corporate firewalls block UDP, so TURN on TCP 443 must be enabled from day one. These are all solvable with proper K8s configuration but represent the highest-complexity work in the project. The magic link token system for candidate access is the primary security design concern -- it must use a two-step exchange pattern (DB token to LiveKit JWT) rather than embedding LiveKit tokens directly in URLs.

## Key Findings

### Recommended Stack

The stack is additive -- no changes to the existing platform. Two new npm packages for the backend (`livekit-server-sdk@2.15.0`, `@azure/storage-blob@12.31.0`) and three for the frontend (`@livekit/components-react@2.9.20`, `livekit-client@2.17.2`, `@livekit/components-styles@1.2.0`). Two new K8s deployments (LiveKit Server, LiveKit Egress). All other capabilities (transcription, summarization, email, calendar) use existing services.

**Core technologies:**
- **LiveKit Server (self-hosted on AKS):** WebRTC SFU for video/audio routing -- zero per-minute costs, full data sovereignty, built-in TURN server
- **LiveKit Egress (self-hosted):** Server-side recording via headless Chrome compositing to Azure Blob Storage -- independent of client state, reliable MP4 output
- **livekit-server-sdk@2.15.0:** Node.js SDK for room management and JWT token generation -- the video-service's interface to LiveKit
- **@livekit/components-react@2.9.20:** Pre-built React video UI components (VideoConference, ControlBar, ParticipantTile) -- compatible with React 19, style with Tailwind/DaisyUI
- **Azure Blob Storage:** Recording storage with SAS token access, lifecycle management for cost control -- native to AKS infrastructure
- **OpenAI Whisper (via existing ai-service):** Batch transcription of recordings -- no new dependency, reuses existing openai SDK

**Critical version notes:** livekit-client@2.17.2 is a strict peer dependency of @livekit/components-react@2.9.20. Node 22 (current Docker base) is compatible with all packages.

### Expected Features

**Must have (table stakes -- P1 for launch):**
- 1:1 video calls with basic controls (mute, camera, leave, device selection)
- Interview scheduling with Google Calendar sync (enhance existing `schedule-interview-modal.tsx`)
- Magic link join for candidates (no account required)
- In-app join for authenticated recruiters/hiring managers
- Server-side recording with playback
- Waiting room / lobby
- Interview status tracking (scheduled, in_progress, completed, cancelled, no_show)
- Email notifications (confirmation, 24h reminder, cancellation)
- Stage-triggered scheduling (moving to "interview" stage prompts scheduling)
- Interview section on application detail page

**Should have (differentiators -- P2 post-launch):**
- AI transcription of recordings (via Whisper)
- AI interview summary auto-posted as application note
- Panel interviews (3+ participants)
- Screen sharing
- Pre-call device check
- Cancel/reschedule flow with calendar updates
- Interviewer notes during call
- Dedicated interviews tab on application detail

**Defer (v2+):**
- Interview scorecards / structured evaluation
- Live captions (real-time STT)
- Self-service scheduling links (Calendly-style)
- Interview analytics dashboard
- Candidate interview prep page

**Explicitly do NOT build (anti-features):**
- One-way/async video interviews (candidates hate them, 30-50% drop-off increase)
- Custom WebRTC infrastructure (multi-year undertaking)
- Real-time AI coaching during interviews (ethically questionable, legally risky)
- Built-in whiteboard/code editor (separate product category)

### Architecture Approach

The architecture follows the established Splits Network pattern: frontend calls api-gateway, which proxies to video-service, which manages interview sessions in Supabase and issues LiveKit access tokens. The critical architectural insight is that LiveKit is a standalone media server that frontends connect to directly (like Clerk for auth) -- media never flows through api-gateway or video-service. video-service is a session orchestrator, not a media proxy. Recording happens via LiveKit Egress (a separate K8s deployment) which outputs to Azure Blob Storage, triggering RabbitMQ events that ai-service consumes for transcription and summarization.

**Major components:**
1. **video-service** (new Fastify microservice, port 3019) -- interview CRUD, LiveKit token generation, recording orchestration, webhook receiver
2. **LiveKit Server** (K8s deployment, hostNetwork) -- WebRTC SFU, media routing, TURN/STUN, room management
3. **LiveKit Egress** (K8s deployment, dedicated resources) -- server-side recording via headless Chrome, outputs MP4 to Azure Blob Storage
4. **video-ui package** (`packages/video-ui/`) -- shared React components for video room (pre-join, in-call, controls)
5. **Database tables** -- `interviews`, `interview_participants`, `interview_recordings`, `interview_transcripts`, `interview_analyses`

**Modified existing components:**
- api-gateway: add `video` ServiceName, register proxy routes, skip auth for magic link + webhook routes
- shared-types: add interview event types and status enums
- portal app: add interview UI pages
- candidate app: add magic link join page
- K8s ingress: add LiveKit subdomain (`livekit.splits.network`)

### Critical Pitfalls

1. **WebRTC media blocked by corporate firewalls** -- Enable TURN on TCP 443 from day one with a dedicated subdomain (`turn.splits.network`). Test from a restrictive network before launch. Without this, calls "connect" (signaling works) but show black screen (media fails silently).

2. **LiveKit Egress silently drops recordings** -- Run Egress on dedicated node pool with guaranteed resources (2 CPU, 4GB RAM per pod). Set `EGRESS_LIMIT` env var. Subscribe to Egress webhooks and build recording verification (check file size > 0). Without this, corrupted/missing recordings are discovered days later.

3. **Magic link tokens create security holes** -- Use two-step flow: DB access token in magic link, exchanged for LiveKit JWT at join time. Never embed LiveKit tokens in URLs. Bind tokens to participant identity, set short expiry (interview duration + 30 min buffer), make single-use.

4. **LiveKit Server advertises wrong IP on AKS** -- Use `hostNetwork: true` with `rtc.use_external_ip: true`. Verify ICE candidates contain public IP, not pod IP (10.x.x.x). Without this, signaling works but media fails.

5. **Recording storage costs spiral without lifecycle management** -- Define 90-day retention policy before building recording. Configure Azure Blob lifecycle rules (Hot -> Cool after 30 days, Archive after 90 days, delete after retention period). A 60-minute 720p recording is 500MB-1GB.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Infrastructure and Core Service
**Rationale:** LiveKit deployment and video-service are prerequisites for everything else. Infrastructure is the highest-risk work and must be validated first. Firewall traversal (Pitfall 1) and IP advertisement (Pitfall 4) can only be verified with a running LiveKit instance.
**Delivers:** LiveKit Server running on AKS with TURN on TCP 443, video-service scaffolded with interview CRUD, database migrations for all 5 tables, api-gateway integration, magic link token system designed and implemented
**Addresses:** Interview status tracking, database schema, service skeleton, LiveKit K8s deployment
**Avoids:** Pitfall 1 (TURN on TCP 443 from day one), Pitfall 4 (correct IP advertisement), Pitfall 3 (two-step token exchange)
**Key decision:** hostNetwork vs Azure UDP LoadBalancer for LiveKit (recommend hostNetwork for Phase 1 simplicity)

### Phase 2: Video Call Experience
**Rationale:** With infrastructure validated, build the user-facing video experience. This is the core feature that makes the product usable. Pre-join device check (Pitfall 6) prevents support issues from day one.
**Delivers:** Working 1:1 video calls, magic link join for candidates, in-app join for recruiters, waiting room/lobby, basic controls (mute, camera, leave, device selection), pre-join device check, video-ui shared package
**Addresses:** Video room (P1), magic link join (P1), in-app join (P1), waiting room (P1), basic controls (P1)
**Avoids:** Pitfall 6 (pre-join device check built early), Pitfall 9 (room lifecycle tied to interview lifecycle with empty_timeout and max_duration)

### Phase 3: Scheduling and Notifications
**Rationale:** Scheduling builds on the existing `schedule-interview-modal.tsx` and Google Calendar integration. This phase connects the video infrastructure to the ATS workflow. Calendar event orphans (Pitfall 7) are the primary concern.
**Delivers:** Enhanced scheduling modal creating interview DB records, calendar event creation with join links (store calendar_event_id), email notifications (confirmation + 24h reminder + cancellation), stage-triggered scheduling prompt, interview section on application detail page
**Addresses:** Interview scheduling + calendar (P1), email notifications (P1), stage-triggered scheduling (P1), interview section on application detail (P1)
**Avoids:** Pitfall 7 (store calendar_event_id, single mutation path, idempotent calendar operations)

### Phase 4: Recording and Playback
**Rationale:** Recording depends on stable video calls (Phase 2). Egress resource management (Pitfall 2) and storage costs (Pitfall 5) are the main concerns. Recording consent is a legal requirement that must be addressed before launch.
**Delivers:** LiveKit Egress deployment with dedicated resources, server-side recording with consent mechanism, Azure Blob Storage with lifecycle policies, recording playback component, recording verification pipeline (file size > 0, duration check)
**Addresses:** Recording (P1), recording playback (P1)
**Avoids:** Pitfall 2 (dedicated node pool, resource limits, verification pipeline), Pitfall 5 (lifecycle rules from day one, 90-day retention policy)

### Phase 5: AI Transcription and Summarization
**Rationale:** Transcription depends on recordings (Phase 4). This is the key differentiator vs competitors -- no major ATS has built-in AI transcription with auto-posted summaries. The async pipeline design (Pitfall 8) is critical.
**Delivers:** Async transcription pipeline via ai-service consuming `recording.completed` RabbitMQ events, AI interview summary generation via GPT-4o-mini, auto-posting summaries as application notes (new `interview_summary` note type requiring migration), dead-letter queue for failed jobs
**Addresses:** AI transcription (P2), AI summary + app note (P2)
**Avoids:** Pitfall 8 (async job pipeline with dead-letter queue, progress tracking, retry with exponential backoff)

### Phase 6: Panel Interviews and Polish
**Rationale:** Multi-party calls are a distinct scaling concern (Pitfall 10). Build after 1:1 calls are stable and adopted. Screen sharing and cancel/reschedule flows round out the feature set.
**Delivers:** Panel interview support (3-6 participants), screen sharing, cancel/reschedule flow with calendar event updates, interviewer notes during call, dedicated interviews tab on application detail
**Addresses:** Panel interviews (P2), screen sharing (P2), cancel/reschedule (P2), interviewer notes (P2), dedicated interviews tab (P2)
**Avoids:** Pitfall 10 (consistent participant identity, reconnection handling, late joiner support, max_participants with buffer)

### Phase Ordering Rationale

- **Infrastructure first** because every other phase depends on a working LiveKit deployment and video-service. This is also the highest-risk work (K8s networking, UDP exposure, firewall traversal). Fail fast on infrastructure.
- **Video calls before scheduling** because you need to test the call experience before building the workflow around it. Scheduling without working calls is useless.
- **Scheduling before recording** because scheduling creates the interview lifecycle that recording attaches to. Recording needs interview records to exist.
- **Recording before AI** because transcription requires recordings as input. This is a hard sequential dependency.
- **Panel interviews last** because they are a scaling concern on top of working 1:1 calls. The core 1:1 use case covers the majority of recruiting interviews.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** LiveKit K8s deployment specifics -- UDP port exposure on AKS, hostNetwork vs LoadBalancer tradeoffs, LiveKit config file format, webhook setup. Verify against current LiveKit docs at https://docs.livekit.io.
- **Phase 4:** LiveKit Egress Azure Blob Storage configuration -- whether S3-compat API works or needs native Azure config. Whisper API 25MB file size limit for long recordings (may need FFmpeg audio extraction). Recording consent legal requirements per jurisdiction.
- **Phase 5:** Speaker diarization in Whisper output -- verify transcript attributes words to specific speakers, not just a wall of text. May need to use track-based audio export instead of composite recording audio.

Phases with standard patterns (skip research-phase):
- **Phase 2:** LiveKit React components are well-documented with examples. Standard WebRTC UI patterns. @livekit/components-react provides most of the UI out of the box.
- **Phase 3:** Scheduling and notifications follow existing codebase patterns exactly (RabbitMQ events, Resend templates, Google Calendar integration via combo provider). Enhancement of existing `schedule-interview-modal.tsx`.
- **Phase 6:** Panel support is a room capacity configuration, not a fundamentally different architecture. Screen sharing is a standard LiveKit feature.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm versions verified via registry. Peer dependencies confirmed compatible with React 19 and Node 22. All integration points verified against existing codebase. |
| Features | HIGH | Video interviewing is a well-understood recruiting domain with clear industry precedent. Feature priorities validated against competitor analysis (Greenhouse, Lever, BreezyHR, Spark Hire). |
| Architecture | HIGH/MEDIUM | Service architecture HIGH (follows existing V2 patterns exactly, verified against codebase). LiveKit K8s deployment specifics MEDIUM (based on training data, verify against current docs). |
| Pitfalls | MEDIUM | WebRTC networking pitfalls are well-documented (HIGH). LiveKit-specific config details based on training data through May 2025 (MEDIUM). Verify LiveKit webhook format, Egress config, and TURN setup against current docs before implementation. |

**Overall confidence:** HIGH -- the domain is well-understood, the stack additions are minimal and verified, and the architecture follows established codebase patterns. The main uncertainty is LiveKit K8s deployment specifics which should be validated during Phase 1.

### Gaps to Address

- **LiveKit Helm chart vs raw YAML:** Project uses raw K8s YAML, not Helm. Decide whether to adopt Helm for LiveKit only or translate chart values into raw YAML. Raw YAML is more consistent with existing patterns but Helm simplifies LiveKit-specific config. **Resolution:** Investigate during Phase 1 planning.
- **UDP port exposure on Azure AKS:** Exact method for exposing UDP through Azure LoadBalancer needs AKS-specific investigation. **Resolution:** Test hostNetwork first during Phase 1; migrate to UDP LoadBalancer if scaling demands.
- **LiveKit Egress to Azure Blob Storage:** Whether Egress can write via S3-compat API or needs native Azure handler. **Resolution:** Verify against current Egress docs during Phase 4 planning.
- **Whisper API 25MB file limit:** Long interviews (60+ min) may produce recordings exceeding this. **Resolution:** Plan for FFmpeg audio extraction as fallback in Phase 5. Whisper accepts video files directly for shorter recordings.
- **Recording consent legal requirements:** Two-party consent laws vary by jurisdiction. **Resolution:** Legal review needed before Phase 4 recording feature launches. Build consent mechanism regardless.
- **LiveKit webhook payload format:** Exact event names and payload structures should be verified against current LiveKit docs. **Resolution:** Validate during Phase 1 implementation when LiveKit Server is running.

## Sources

### Primary (HIGH confidence)
- npm registry: livekit-server-sdk@2.15.0 (published 2025-12-10), livekit-client@2.17.2 (2026-02-19), @livekit/components-react@2.9.20 (2026-02-19), @azure/storage-blob@12.31.0 -- versions, peer deps, publication dates verified
- Existing codebase: service patterns (V2 architecture), K8s manifests (deployment patterns, port allocations), api-gateway structure (ServiceName union, auth hooks, proxy registration), shared-types enums, ai-service architecture (openai SDK, RabbitMQ consumers), schedule-interview-modal.tsx, integration-service Google Calendar combo provider, notification-service Resend templates

### Secondary (MEDIUM confidence)
- LiveKit architecture (SFU model, Egress behavior, TURN embedding, Redis requirement, webhook system) -- training data through May 2025, verify against https://docs.livekit.io
- Competitor feature sets (Greenhouse, Lever, BreezyHR, Spark Hire) -- training data, not verified against current product pages
- WebRTC networking fundamentals (STUN/TURN/ICE) -- well-established protocol knowledge

### Tertiary (LOW confidence)
- LiveKit Helm chart configuration specifics -- inferred, needs verification
- Azure Blob Storage lifecycle rule syntax for Egress output -- general knowledge, verify Azure docs
- Recording consent legal requirements by jurisdiction -- general knowledge, requires legal counsel
- LiveKit Egress resource requirements (headless Chrome) -- based on training data, validate during staging deployment

---
*Research completed: 2026-03-07*
*Ready for roadmap: yes*
