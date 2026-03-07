# Pitfalls Research: Video Interviewing with Self-Hosted LiveKit

**Domain:** Self-hosted WebRTC video interviewing added to existing recruiting marketplace
**Researched:** 2026-03-07
**Confidence:** MEDIUM (based on training data through May 2025; WebSearch/WebFetch unavailable for verification. WebRTC networking pitfalls are HIGH confidence as they are well-documented and stable. LiveKit-specific API details should be verified against current docs before implementation.)

---

## CRITICAL PITFALLS

Mistakes that cause calls to fail, data loss, or require architecture rewrites.

### Pitfall 1: WebRTC Media Cannot Traverse Corporate Firewalls

**What goes wrong:** Video calls work in development and for home-office users but fail silently for candidates and hiring managers behind corporate firewalls. The call "connects" (WebSocket signaling works) but no audio/video appears. Users see a black screen with no error message.

**Why it happens:**
- WebRTC uses UDP on high ports (typically 10000-65535) for media transport
- Corporate firewalls and symmetric NATs block UDP entirely or restrict to known ports
- STUN alone cannot traverse symmetric NATs; a TURN relay is required
- LiveKit's built-in TURN support requires explicit configuration and additional ports
- Developers test on open networks and never encounter this failure mode
- The failure is silent -- ICE candidate gathering just times out with no user-visible error

**How to avoid:**
- Deploy TURN server from day one, not as an afterthought. LiveKit has built-in TURN support -- enable it on port 443/TCP (the only port guaranteed open on all corporate networks)
- Configure LiveKit's `turn` section to use TLS on port 443 so TURN traffic looks like HTTPS to firewalls
- Use `turn.tls_port: 443` with a dedicated subdomain (e.g., `turn.splits.network`) so it does not conflict with the existing NGINX ingress on port 443
- Test with a restrictive firewall profile before launch (block all UDP, allow only TCP 80/443)
- Implement ICE connection state monitoring on the client -- detect `failed` state and show actionable error ("Your network may be blocking video calls. Try a different network or contact IT.")

**Warning signs:**
- "Works for me" reports during testing while QA on different networks fails
- Users report "black screen" or "no audio" without errors in the console
- ICE connection state logs show `checking` then `failed` with no `connected`
- Only UDP candidates in ICE gathering, no relay candidates

**Phase to address:** Phase 1 (Infrastructure) -- TURN must be part of the initial LiveKit deployment, not bolted on later. Testing with restrictive firewall profiles should be a launch gate.

---

### Pitfall 2: LiveKit Egress Service Runs Out of Resources and Silently Drops Recordings

**What goes wrong:** Interview recordings start successfully but are incomplete, corrupted, or missing entirely. The recording service appears healthy but produces zero-byte files or truncated video. This is discovered hours or days later when someone tries to review the interview.

**Why it happens:**
- LiveKit Egress uses headless Chrome (Chromium) to composite and encode video. Each recording session consumes 1-2 CPU cores and 1-2 GB RAM minimum
- On Kubernetes, if Egress pods hit resource limits, the OOM killer terminates the encoding process mid-stream, producing corrupt files
- If no resource requests/limits are set, the Egress pod steals resources from LiveKit Server or other services, causing cascading failures
- Multiple concurrent recordings multiply resource requirements linearly
- Egress has no built-in alerting for failed recordings -- it emits events but if nothing consumes them, failures are silent
- S3/Azure Blob upload failures at end of recording lose the entire file if not configured for streaming upload

**How to avoid:**
- Run LiveKit Egress on dedicated node(s) or a dedicated node pool in AKS with CPU/memory guarantees. Do NOT co-locate with LiveKit Server or other services
- Set Kubernetes resource requests high (2 CPU, 2Gi RAM minimum per Egress pod) and limits slightly above
- Configure Egress to use segment-based output (HLS/segments) rather than single-file output, so partial recordings survive crashes
- Limit concurrent recordings per Egress instance (LiveKit supports `EGRESS_LIMIT` env var, default is typically 3-5)
- Subscribe to Egress webhook events (`egress_started`, `egress_ended`, `egress_updated`) and build an alerting pipeline for failed recordings
- Store recordings to Azure Blob Storage with streaming upload (not post-completion upload)
- Implement a recording verification job: after egress completes, validate file size > 0 and duration matches expected

**Warning signs:**
- Egress pods showing OOMKilled in `kubectl get pods`
- Recording files with 0 bytes or suspiciously small size
- CPU throttling on Egress pods (check `kubectl top pods`)
- Gaps in recording list vs. completed interview list

**Phase to address:** Phase 1 (Infrastructure) for resource allocation; Phase 2 (Recording) for verification pipeline. Recording verification should be a Phase 2 success criterion.

---

### Pitfall 3: Magic Link Token System Creates Security Holes or Broken Experiences

**What goes wrong:** External participants (candidates, external hiring managers) receive a magic link to join an interview. The token either: (a) never expires, allowing anyone with the link to join any future room; (b) expires too quickly, causing candidates to get "link expired" when they click 5 minutes before the interview; (c) leaks room access because the token grants room-level access without binding to participant identity.

**Why it happens:**
- LiveKit room tokens are JWTs signed with the LiveKit API secret. They contain room name, participant identity, and permissions
- Developers create tokens with long expiry "to be safe" (24h+) or short expiry "for security" (15m) without thinking through the interview lifecycle
- The token is created when the interview is scheduled (hours/days before) but needs to be valid only around the interview time window
- If participant identity in the token is generic ("candidate") rather than unique, multiple candidates could impersonate each other
- Clerk auth cannot be used for external participants who do not have accounts, so a parallel token system is needed
- If the magic link URL contains the token directly, URL shorteners, email preview crawlers, and Slack unfurlers may "use" the token

**How to avoid:**
- Do NOT embed LiveKit tokens directly in magic links. Instead, create a short-lived interview access token (stored in DB) that the join page exchanges for a LiveKit room token at join time
- Two-step flow: magic link -> interview lobby page (validates access token, shows pre-join device check) -> exchange for LiveKit token (generated server-side, 2-hour expiry, at join time)
- Bind tokens to participant identity (email or generated UUID stored with the interview record)
- Set LiveKit token expiry to interview duration + 30-minute buffer (not 24 hours)
- Rate-limit token exchange endpoint to prevent brute-force
- Add `roomJoin`, `canPublish`, `canSubscribe` permissions explicitly -- never grant admin permissions to external participants
- Make the access token single-use or limited-use (mark as consumed after first exchange)

**Warning signs:**
- Magic links working days after the interview was supposed to happen
- Multiple participants with the same identity in a room
- Email security scanners triggering "link already used" errors for candidates
- LiveKit tokens with `roomAdmin: true` for external participants

**Phase to address:** Phase 1 (Auth/Token Design) -- the token architecture must be designed before building the join flow. This is a security-critical design decision.

---

### Pitfall 4: LiveKit Server on K8s Gets Wrong IP / Cannot Advertise Correctly

**What goes wrong:** LiveKit Server starts up on AKS but advertises an internal pod IP or node IP that clients cannot reach. Signaling (WebSocket) connects fine through the ingress, but media (UDP/TCP) fails because clients try to connect to an unreachable IP.

**Why it happens:**
- LiveKit Server needs to know its public IP to include in ICE candidates sent to clients
- In Kubernetes, the pod IP is a cluster-internal IP (10.x.x.x) that external clients cannot reach
- LiveKit has `rtc.node_ip` and `rtc.use_external_ip` configuration options, but these behave differently in cloud vs. bare-metal K8s
- On AKS, `use_external_ip` may resolve to the node's private IP (in a VNet) rather than the public IP
- If using a LoadBalancer Service with `externalTrafficPolicy: Local`, only some nodes receive traffic, but LiveKit may be scheduled on a node without the external IP
- Helm chart defaults may not match AKS-specific networking

**How to avoid:**
- Use a Kubernetes DaemonSet or a single-replica Deployment with `hostNetwork: true` for LiveKit Server so it binds directly to the node's network interface
- Set `rtc.use_external_ip: true` AND verify it resolves correctly on AKS nodes (check with `curl ifconfig.me` from within the pod)
- If AKS nodes are behind a NAT/load balancer, set `rtc.node_ip` explicitly to the public IP or use the `RTC_NODE_IP` environment variable with the Kubernetes downward API to inject the node's external IP
- Use a LoadBalancer Service with `externalTrafficPolicy: Local` to preserve client IP and ensure traffic routes to the correct node
- Expose UDP port 7882 (WebRTC) and TCP port 7881 (signaling) through the LoadBalancer, separate from the NGINX ingress
- Do NOT try to route LiveKit WebRTC traffic through the existing NGINX ingress -- NGINX does not proxy UDP

**Warning signs:**
- Signaling connects but media never flows
- ICE candidates contain `10.x.x.x` addresses
- LiveKit logs show "could not determine node IP" or similar
- Calls work within the cluster but not from external clients

**Phase to address:** Phase 1 (Infrastructure) -- this is the very first thing to get right. A misconfigured LiveKit Server IP means nothing else works.

---

### Pitfall 5: Recording Storage Costs Spiral Without Lifecycle Management

**What goes wrong:** Azure Blob Storage costs grow linearly and indefinitely. After 6 months of interviews, storage bills become significant. Old recordings are never cleaned up because "someone might need them."

**Why it happens:**
- Video recordings are large (100-500 MB per hour of interview at reasonable quality)
- No retention policy is defined at launch -- recordings accumulate forever
- Legal/compliance requirements for recording retention are not clarified upfront
- Recordings are stored at original quality with no tiered storage strategy
- Nobody owns the storage cost line item

**How to avoid:**
- Define retention policy BEFORE building recording: how long must recordings be kept? (Common: 90 days post-hire-decision, 1 year for compliance)
- Use Azure Blob Storage lifecycle management rules from day one: move to Cool tier after 30 days, Archive after 90 days, delete after retention period
- Compress/transcode recordings after interview ends (Egress outputs high-bitrate; a post-processing job can reduce by 50-70%)
- Store audio-only transcription separately (tiny) so recordings can be deleted while transcripts are retained
- Add recording size and count to the admin dashboard so cost growth is visible

**Warning signs:**
- No retention policy in the product requirements
- Storage costs growing month-over-month with no plateau
- All recordings in Hot tier regardless of age
- No admin tooling to view or manage recordings

**Phase to address:** Phase 2 (Recording) for implementation; Phase 0 (Requirements) for policy definition.

---

## MODERATE PITFALLS

Mistakes that cause poor UX, technical debt, or delayed launches.

### Pitfall 6: Pre-Join Device Check Is Skipped or Inadequate

**What goes wrong:** Users join the interview and discover their camera/microphone is not working, is not the right device, or their browser does not support WebRTC. The interview starts with 5 minutes of "can you hear me?" troubleshooting.

**Why it happens:**
- Developers focus on the call itself and treat the join flow as a simple button click
- Browser permissions for camera/microphone are complex (HTTPS required, user must grant, browser may remember denial)
- Users have multiple audio/video devices and the browser picks the wrong one
- Safari and Firefox have different WebRTC behaviors than Chrome

**How to avoid:**
- Build a mandatory pre-join lobby with: (1) camera preview, (2) microphone level meter, (3) speaker test, (4) device selector dropdowns, (5) network quality indicator
- Use LiveKit's `LocalParticipant.setMicrophoneEnabled()` and `setCameraEnabled()` in the lobby before joining the room
- Check `navigator.mediaDevices.enumerateDevices()` and handle the case where it returns empty labels (user has not granted permission yet)
- Test on Safari, Firefox, Chrome, and Edge. Safari in particular has issues with `getUserMedia` in iframes
- Show clear error states: "Camera is being used by another application" vs. "Permission denied" vs. "No camera detected"
- Provide a "test your setup" page accessible before interview day

**Warning signs:**
- No pre-join screen in the design mockups
- First interview feedback mentions "took 5 minutes to get audio working"
- Support tickets about "camera not working" that are actually permission issues
- No browser compatibility matrix in the test plan

**Phase to address:** Phase 2 (Call UX) -- pre-join lobby should be built before multi-party calls.

---

### Pitfall 7: Calendar Integration Creates Duplicate or Orphaned Events

**What goes wrong:** When an interview is scheduled, a Google Calendar event is created. When the interview is rescheduled or cancelled, the calendar event is not updated or deleted, leading to phantom meetings on calendars. Or worse, rescheduling creates a second event without removing the first.

**Why it happens:**
- The existing Google Calendar combo provider creates events but the interview scheduling system is a new concept with its own lifecycle
- Calendar event IDs are not stored with the interview record, so there is no link back for updates/deletes
- OAuth token refresh failures cause silent failures in calendar operations
- The interview can be rescheduled from multiple places (recruiter portal, candidate portal, email link) and not all paths trigger calendar updates
- RabbitMQ event ordering is not guaranteed -- a "reschedule" event might be processed before the "create" event

**How to avoid:**
- Store the Google Calendar event ID (and Microsoft equivalent) on the interview record in the database
- All calendar mutations (create, update, delete) must go through a single service method, never direct API calls from multiple places
- Use RabbitMQ for interview lifecycle events (`interview.scheduled`, `interview.rescheduled`, `interview.cancelled`) and have the integration-service consume these to manage calendar events
- Implement idempotent calendar operations: if the event already exists, update it; if it does not, create it
- Handle OAuth token refresh failures with retry + notification to the user ("We could not update your calendar. Please reconnect your Google account.")
- Add a reconciliation job that compares interview records with calendar events and flags discrepancies

**Warning signs:**
- No `calendar_event_id` column on the interviews table
- Calendar create/update calls scattered across multiple services
- No error handling for Google Calendar API failures
- Users reporting "ghost" calendar events for cancelled interviews

**Phase to address:** Phase 3 (Calendar Integration) -- this is the primary concern for the calendar phase.

---

### Pitfall 8: Transcription Pipeline Blocks on Long-Running AI Processing

**What goes wrong:** After an interview ends, the recording is sent for transcription. The transcription takes 20-60 minutes for a 1-hour interview (depending on approach). During this time, the interview record shows "processing" with no progress indicator. If the transcription fails, there is no retry, and the user never gets notified.

**Why it happens:**
- Speech-to-text on full interview recordings is CPU/GPU-intensive and slow
- Synchronous processing (wait for result) blocks other work and times out
- No progress tracking means failures are invisible
- The ai-service is designed for quick request/response (resume review), not long-running jobs
- Large audio files can exceed memory limits if loaded entirely into RAM

**How to avoid:**
- Use an async job pipeline: interview ends -> RabbitMQ event -> transcription worker picks up job -> updates status in DB -> emits completion event
- Stream audio in chunks rather than processing the entire file at once
- Use LiveKit's built-in track-based audio export (per-participant audio tracks) rather than extracting audio from the composite video
- Consider real-time transcription during the call (LiveKit has an STT plugin ecosystem) rather than post-call batch processing -- this eliminates the processing delay entirely
- If using post-call transcription, provide progress updates (0%, 25%, 50%, 75%, 100%) by processing in segments
- Implement dead-letter queue for failed transcription jobs with alerting
- Set reasonable timeouts and retry policies (3 attempts with exponential backoff)

**Warning signs:**
- Transcription processing in the same request/response cycle as the API call
- No status field on interview records for transcription state
- ai-service receiving 500MB audio files in a single request
- No dead-letter queue configuration for transcription events

**Phase to address:** Phase 4 (AI/Transcription) -- async pipeline must be designed from the start of this phase.

---

### Pitfall 9: Room Lifecycle Not Tied to Interview Lifecycle

**What goes wrong:** LiveKit rooms persist after interviews end, consuming server resources. Or rooms are created too early and expire before the interview starts. Or the interview is cancelled but the room still exists and someone joins it.

**Why it happens:**
- LiveKit rooms are created independently of interview records
- Room names are not deterministic, so there is no way to look up "the room for interview X"
- `empty_timeout` (room closes when empty) and `max_duration` are not set, so rooms live forever
- No cleanup process exists for orphaned rooms
- The interview status in the ATS (screening -> interview -> offer) is not connected to room lifecycle

**How to avoid:**
- Use deterministic room names derived from interview ID: `interview-{interview_id}`
- Create rooms on-demand when the first participant joins (not when the interview is scheduled)
- Set `empty_timeout: 300` (5 minutes) so rooms close shortly after everyone leaves
- Set `max_duration: 14400` (4 hours) as a safety net for rooms that never close
- Tie room creation to interview status: only allow joining when interview status is `scheduled` or `in_progress`
- Emit `interview.started` and `interview.ended` events via RabbitMQ when participants join/leave, updating the ATS record
- Build a cleanup job that lists all active LiveKit rooms and reconciles with interview records

**Warning signs:**
- LiveKit dashboard showing rooms with 0 participants that have been open for hours
- Room names that are UUIDs with no connection to interview IDs
- No `empty_timeout` or `max_duration` in LiveKit room creation options
- Interview records stuck in "in_progress" status indefinitely

**Phase to address:** Phase 2 (Call Infrastructure) -- room lifecycle must be designed with the call implementation.

---

### Pitfall 10: Multi-Party Calls Do Not Handle Late Joiners or Reconnections

**What goes wrong:** A 3-person panel interview starts. One interviewer joins 10 minutes late and sees a blank screen. Or an interviewer's network drops for 30 seconds and they cannot rejoin -- they get an "already connected" error or the room does not recognize them.

**Why it happens:**
- LiveKit handles reconnection automatically but only if the client SDK is configured correctly
- If participant identity is not consistent across reconnections, LiveKit treats the reconnection as a new participant
- Late joiners may not see the correct UI state (who is sharing screen, who is muted, etc.)
- The recording may not capture the late joiner's first few seconds of audio/video
- If room max_participants is set too low, the late joiner is rejected

**How to avoid:**
- Use consistent participant identity (clerk user ID for internal, interview-participant UUID for external) across all join attempts
- Configure LiveKit client SDK with `autoSubscribe: true` and reconnection enabled (default in recent SDKs but verify)
- Handle `ParticipantConnected` events to update the UI for all existing participants when someone new joins
- Set `max_participants` to expected count + buffer (e.g., 6 for a 4-person panel to allow for reconnections)
- Implement a "rejoin" button that creates a new connection with the same identity (LiveKit will replace the old participant)
- Test the reconnection flow explicitly: kill network for 30 seconds, verify automatic reconnection
- For recording: Egress composite recording handles late joiners automatically, but verify this in testing

**Warning signs:**
- No reconnection handling in the client code
- Participant identity generated randomly on each page load
- No "rejoin" or "having trouble?" UI when connection drops
- max_participants set to exact expected count with no buffer

**Phase to address:** Phase 3 (Multi-Party) -- reconnection and late-join are core to panel interviews.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using composite recording for all interviews | Simpler -- one video file output | Cannot isolate speaker audio for transcription, cannot create speaker-specific highlights | MVP only; switch to track-based recording for transcription phase |
| Hardcoding LiveKit Server URL in frontend | Quick setup | Cannot do blue-green deployments, cannot use different regions | Never -- use environment variable from server config endpoint |
| Storing recordings in LiveKit Server's local disk | No blob storage setup needed | Lost on pod restart, not scalable, no lifecycle management | Never -- use Azure Blob Storage from day one |
| Skipping pre-join device check | Faster to build | Support tickets, bad first impressions, wasted interviewer time | Only for internal-only dogfooding |
| Single LiveKit Server pod (no HA) | Simple deployment | Single point of failure; pod restart kills all active calls | Acceptable for beta/staging, not production |
| Using LiveKit Cloud for development, self-hosted for production | Faster dev setup | Different behavior between environments, config drift | Acceptable if tested thoroughly before launch |

## Integration Gotchas

Common mistakes when connecting to existing Splits Network services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Clerk Auth + External Participants | Trying to create Clerk sessions for candidates who join via magic link | Build a separate lightweight token system for interview access; Clerk is only for authenticated platform users |
| API Gateway Routing | Adding LiveKit WebSocket routes to the existing NGINX ingress | LiveKit needs its own LoadBalancer Service with UDP support; NGINX cannot proxy WebRTC media |
| RabbitMQ Events | Creating a monolithic `interview` event with all state changes | Use granular events: `interview.scheduled`, `interview.started`, `interview.participant_joined`, `interview.ended`, `interview.recording_ready` |
| ATS Application Stages | Auto-advancing application stage when interview is scheduled | Interview scheduling and stage advancement are separate concerns; scheduling does not imply the candidate passed screening |
| Google Calendar Combo Provider | Reusing the email integration's OAuth tokens for calendar | Calendar scopes must be explicitly requested; the existing token may not have calendar write permissions |
| ai-service | Sending full video files to ai-service for transcription | Extract audio track first (much smaller), send audio-only to transcription service; ai-service should receive text for summarization |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Single LiveKit Server pod handling all rooms | Increased latency, audio glitches, then pod OOM | Use LiveKit's multi-node support with Redis for room distribution | >20 concurrent rooms |
| Recording all interviews at 1080p | Storage costs, Egress CPU spikes | Default to 720p; 1080p only if screen sharing is active | >50 recordings/day |
| Loading all interview recordings in a list view | Page takes 30+ seconds, browser memory spike | Server-side pagination, lazy-load video players, thumbnail previews instead of embedded players | >100 recordings in history |
| Polling for room state instead of using LiveKit webhooks | Unnecessary API calls, stale state, high latency | Use LiveKit Server webhooks for room/participant events, push to frontend via existing WebSocket infrastructure | >10 concurrent calls |
| Storing transcription text in a single JSON column | Works for short interviews, query performance degrades | Normalized table with segments, speaker labels, timestamps; full-text search index | >500 transcribed interviews |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| LiveKit API key/secret in frontend code | Anyone can create rooms, join any room, start recordings | API key/secret ONLY on server-side; frontend receives room-specific JWTs from the interview-service |
| Room names that are guessable (e.g., `interview-1`, `interview-2`) | Unauthorized users can join interviews by guessing room names | Use UUID-based interview IDs in room names; room tokens bound to specific room + participant |
| Recording URLs publicly accessible without auth | Anyone with the URL can watch interview recordings | Use Azure Blob Storage SAS tokens with short expiry (15 min); generate on-demand through authenticated API endpoint |
| No recording consent mechanism | Legal liability under GDPR, CCPA, state-specific two-party consent laws | Require explicit consent from ALL participants before recording starts; store consent records; allow opt-out (audio-only interview) |
| LiveKit webhook endpoint without signature verification | Attacker can send fake events (fake "recording complete" events) | Verify LiveKit webhook signatures using the API secret; reject unsigned/invalid requests |
| External participants can screen share or control recording | Candidates could share inappropriate content or stop recording | Set granular permissions in LiveKit tokens: external participants get `canPublish: true` (camera/mic only), `canPublishSources: ['camera', 'microphone']`, no `recorder` or `admin` permissions |

## UX Pitfalls

Common user experience mistakes in video interviewing.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No lobby/waiting room | Candidate joins before interviewers are ready; awkward silence | Waiting room that shows "Your interviewer will be with you shortly" until host admits |
| Recording indicator not visible | Candidates do not know they are being recorded; trust/legal issue | Persistent, non-dismissable recording indicator visible to all participants |
| No post-call summary | Interviewer has to manually write notes from memory | Auto-generate interview summary from transcription; present for review/editing |
| Generic "connection failed" errors | User does not know if it is their camera, network, or the server | Specific error messages: "Camera in use by another app", "Network too slow for video", "Interview room not available yet" |
| No mobile-responsive call UI | Candidates joining from phone see broken layout | Test on mobile viewports; stack video tiles vertically; larger touch targets for mute/camera buttons |
| Interview link works only once | Candidate accidentally closes tab and cannot rejoin | Allow re-joining with same token within interview time window; show "Reconnecting..." state |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **LiveKit deployment:** Often missing TURN on TCP 443 -- verify by testing from a restrictive corporate network
- [ ] **Recording:** Often missing verification that recording file is valid -- verify by checking file size > 0 and running ffprobe on output
- [ ] **Magic links:** Often missing link expiry handling -- verify that links expire gracefully with a human-readable "this interview has ended" page, not a 500 error
- [ ] **Pre-join check:** Often missing speaker test (output test) -- verify users can test their speakers, not just microphone
- [ ] **Calendar events:** Often missing timezone handling -- verify events show correct time for participants in different timezones
- [ ] **Transcription:** Often missing speaker diarization -- verify transcript attributes words to specific speakers, not just a wall of text
- [ ] **Multi-party layout:** Often missing screenshare layout switch -- verify that when someone shares screen, the layout adapts (screen large, cameras small)
- [ ] **Reconnection:** Often missing state recovery -- verify that after reconnect, mute states, screen shares, and recording status are restored
- [ ] **Consent:** Often missing per-participant consent tracking -- verify each participant's consent is stored independently
- [ ] **Cleanup:** Often missing room cleanup job -- verify orphaned rooms are detected and closed after max_duration

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Firewall blocking media (no TURN) | LOW | Deploy TURN on TCP 443; update LiveKit config; no data loss, just UX improvement |
| Corrupted/lost recordings | HIGH | Cannot recover lost recordings. Implement verification pipeline, re-record if possible, apologize to participants |
| Token security holes | MEDIUM | Rotate LiveKit API keys, invalidate all outstanding tokens, audit room access logs, issue new magic links |
| Wrong IP advertisement | LOW | Update LiveKit config, restart pods; in-progress calls will drop but new calls work |
| Orphaned calendar events | MEDIUM | Build reconciliation script, batch-delete orphaned events via Google Calendar API, apologize to affected users |
| Transcription pipeline failure | LOW | Re-queue failed jobs from dead-letter queue; recordings are intact, just re-process |
| Rooms not closing | LOW | List all rooms via LiveKit API, close orphaned ones; set empty_timeout going forward |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Firewall/TURN (Pitfall 1) | Phase 1: Infrastructure | Test call from corporate-firewalled network; ICE candidates include relay type |
| Egress resource exhaustion (Pitfall 2) | Phase 1: Infrastructure + Phase 2: Recording | Egress pods have dedicated node pool; no OOMKilled events during load test |
| Magic link token security (Pitfall 3) | Phase 1: Auth Design | Security review of token flow; tokens expire correctly; single-use enforcement works |
| LiveKit IP advertisement (Pitfall 4) | Phase 1: Infrastructure | ICE candidates contain public IP; calls work from external network |
| Storage cost spiral (Pitfall 5) | Phase 2: Recording | Azure lifecycle rules configured; Cool tier transition verified; retention policy documented |
| Pre-join device check (Pitfall 6) | Phase 2: Call UX | All device states tested (no camera, denied permission, multiple devices); works on Safari |
| Calendar event orphans (Pitfall 7) | Phase 3: Calendar | Reschedule and cancel flows update/delete calendar events; reconciliation job runs |
| Transcription blocking (Pitfall 8) | Phase 4: AI/Transcription | Jobs process asynchronously; dead-letter queue configured; progress visible in UI |
| Room lifecycle (Pitfall 9) | Phase 2: Call Infrastructure | Rooms close after empty_timeout; orphan cleanup job running; interview status updates on join/leave |
| Multi-party reconnection (Pitfall 10) | Phase 3: Multi-Party | Late joiner test passes; 30-second network drop recovers; identity consistent across reconnects |

## Sources

- LiveKit official documentation (not directly fetched -- based on training data, MEDIUM confidence; verify against https://docs.livekit.io before implementation)
- WebRTC networking fundamentals (STUN/TURN/ICE) -- well-established protocol knowledge, HIGH confidence
- Kubernetes resource management patterns -- well-established, HIGH confidence
- Azure Blob Storage lifecycle management -- well-established, HIGH confidence
- Recording consent legal requirements -- general knowledge, verify with legal counsel for specific jurisdictions

**Important caveat:** WebSearch and WebFetch were unavailable during this research session. LiveKit-specific configuration options (env var names, config field names, API methods) are based on training data through May 2025 and should be verified against current LiveKit documentation before implementation. The LiveKit ecosystem evolves rapidly -- check for new features (especially around Egress, STT/TTS plugins, and Agents framework) that may simplify some of these concerns.

---
*Pitfalls research for: Self-hosted LiveKit video interviewing on Splits Network*
*Researched: 2026-03-07*
