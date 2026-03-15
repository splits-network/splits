---
phase: 33-infrastructure
plan: 01
subsystem: infra, database
tags: [livekit, kubernetes, webrtc, postgres, interviews, video]

requires:
  - phase: none
    provides: greenfield infrastructure for video interviewing
provides:
  - LiveKit Server K8s deployment with TURN and UDP media
  - LiveKit Egress K8s deployment on dedicated node pool
  - LiveKit config ConfigMap with room and TURN settings
  - interviews, interview_participants, interview_access_tokens database tables
  - interview_status, interview_type, interview_participant_role enums
affects: [33-02 video-service scaffold, 33-03 gateway routing, 34 scheduling UI, 36 recording]

tech-stack:
  added: [livekit-server v1.8, livekit-egress v1.8]
  patterns: [hostNetwork for UDP media, dedicated node pool for egress, magic link tokens]

key-files:
  created:
    - infra/k8s/livekit/deployment.yaml
    - infra/k8s/livekit/livekit-config.yaml
    - infra/k8s/livekit-egress/deployment.yaml
    - supabase/migrations/20260307000001_create_interviews_schema.sql
  modified: []

key-decisions:
  - "hostNetwork: true for LiveKit media ports (simpler than LoadBalancer for UDP on AKS)"
  - "Official Docker Hub images for LiveKit (not ACR — open source)"
  - "Egress on dedicated node pool with tolerations to isolate CPU-heavy encoding"
  - "Added panel and debrief to interview_type enum beyond the 4 discussed (screening, technical, cultural, final)"
  - "Magic link tokens stored in interview_access_tokens with unique constraint per participant per interview"

patterns-established:
  - "Interview lifecycle: 6-status enum with partial indexes for active states"
  - "Participant tracking: separate table with user_id FK and role enum"
  - "LiveKit config via ConfigMap mounted as volume"

duration: 5min
completed: 2026-03-08
---

# Phase 33 Plan 01: Infrastructure Summary

**LiveKit Server/Egress K8s manifests with hostNetwork UDP media and interviews database schema with 6-status lifecycle, participants, and magic link tokens**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T00:03:57Z
- **Completed:** 2026-03-08T00:09:00Z
- **Tasks:** 2
- **Files created:** 4

## Accomplishments
- LiveKit Server deployment with hostNetwork for WebRTC media, TURN on TCP 443 for restrictive networks
- LiveKit Egress deployment isolated on dedicated node pool with resource guarantees for encoding
- Interviews database schema with 3 enums, 3 tables, proper FKs to applications and users

## Task Commits

Each task was committed atomically:

1. **Task 1: LiveKit Server and Egress K8s manifests** - `4ae93863` (feat)
2. **Task 2: Database migration for interviews schema** - `4f4e65f6` (feat)

## Files Created/Modified
- `infra/k8s/livekit/deployment.yaml` - LiveKit Server Deployment + Service (hostNetwork, ports 7880/7881)
- `infra/k8s/livekit/livekit-config.yaml` - ConfigMap with room limits, TURN, Redis config
- `infra/k8s/livekit-egress/deployment.yaml` - Egress Deployment with nodeSelector and tolerations
- `supabase/migrations/20260307000001_create_interviews_schema.sql` - 3 enums, 3 tables, indexes, trigger

## Decisions Made
- Used `hostNetwork: true` for LiveKit media ports — simpler than LoadBalancer for UDP on AKS, avoids NAT traversal issues
- Official Docker Hub images for LiveKit (not ACR) since it is open source
- Added `panel` and `debrief` to interview_type enum beyond the 4 originally discussed
- Egress gets dedicated node pool with tolerations to prevent scheduling on general-purpose nodes

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. LiveKit secrets (`livekit-secrets` K8s Secret with `api-key` and `api-secret`) must be created before deployment but that is a deployment concern, not a dev setup concern.

## Next Phase Readiness
- K8s manifests ready for `kubectl apply` once LiveKit secrets are created
- Database migration ready for `supabase db push`
- video-service (Plan 02) can now build on these tables and connect to LiveKit
- Gateway routing (Plan 03) can reference `livekit-server:80` ClusterIP service

---
*Phase: 33-infrastructure*
*Completed: 2026-03-08*
