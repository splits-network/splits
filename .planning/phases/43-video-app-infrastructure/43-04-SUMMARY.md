---
phase: 43-video-app-infrastructure
plan: 04
subsystem: infra
tags: [docker, kubernetes, ingress, tls, next.js, deployment]

# Dependency graph
requires:
  - phase: 43-01
    provides: "Video app scaffold at apps/video/ with Next.js on port 3102"
  - phase: 43-02
    provides: "Magic-link join flow pages"
  - phase: 43-03
    provides: "Active call experience pages"
provides:
  - "Multi-stage Dockerfile for video app production image"
  - "K8s deployment and service for video app on port 3102"
  - "Ingress rules routing video.splits.network and video.applicant.network with TLS"
affects: [44-livekit-server-config, 45-video-service]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Simplified Dockerfile without Clerk for unauthenticated apps", "Dual-subdomain ingress routing to single service"]

key-files:
  created:
    - apps/video/Dockerfile
    - infra/k8s/video/deployment.yaml
  modified:
    - infra/k8s/ingress.yaml

key-decisions:
  - "Lighter resource limits (100m/128Mi requests vs 200m/256Mi for candidate) since no SSR auth"
  - "No Sentry DSN in initial deployment - add in future plan if needed"
  - "No service URL env vars - video app only talks through API gateway"

patterns-established:
  - "Unauthenticated app Dockerfile: same multi-stage pattern minus Clerk ARGs and packages"
  - "Dual-subdomain service: single K8s service with two ingress host rules"

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 43 Plan 04: Docker & K8s Deployment Summary

**Multi-stage Dockerfile and K8s deployment for video app with dual-subdomain ingress (video.splits.network + video.applicant.network)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-08T23:56:10Z
- **Completed:** 2026-03-08T23:59:10Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Multi-stage Dockerfile building video app with only required workspace packages (no Clerk, chat-ui, memphis-ui, gamification)
- K8s deployment with health checks, spot tolerations, and lighter resource allocation
- Ingress rules routing both branded subdomains to video service with TLS via cert-manager

## Task Commits

Each task was committed atomically:

1. **Task 1: Dockerfile for video app** - `a9b618e0` (feat)
2. **Task 2: K8s deployment, service, and ingress rules** - `3608f18a` (feat)

## Files Created/Modified
- `apps/video/Dockerfile` - Multi-stage Docker build for production video app image
- `infra/k8s/video/deployment.yaml` - Deployment (2 replicas, port 3102) + ClusterIP service
- `infra/k8s/ingress.yaml` - Added video.splits.network and video.applicant.network to TLS hosts and rules

## Decisions Made
- Lighter resource limits (100m CPU / 128Mi mem requests) compared to candidate app since video has no SSR auth overhead
- No Sentry DSN included in initial deployment -- can be added later when monitoring is configured
- No direct service URLs in env vars -- video app communicates exclusively through API gateway

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Video app is fully deployable to production with both branded subdomains
- Phase 43 (Video App Infrastructure) is now complete
- Ready for LiveKit server configuration and video service development in subsequent phases
- Host header brand detection (from 43-01) should be verified in staging once deployed

---
*Phase: 43-video-app-infrastructure*
*Completed: 2026-03-08*
