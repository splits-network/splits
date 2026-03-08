---
phase: 33-infrastructure
plan: "04"
subsystem: deployment
tags: [docker-compose, ci-cd, kubernetes, livekit, video-service]
dependency-graph:
  requires: ["33-02"]
  provides: ["video-service docker-compose entry", "video-service CI/CD pipeline", "LiveKit URL in frontend K8s deployments"]
  affects: ["34-*"]
tech-stack:
  added: []
  patterns: ["envsubst variable substitution for K8s manifests"]
key-files:
  created: []
  modified:
    - docker-compose.yml
    - .github/workflows/deploy-aks.yml
    - .github/workflows/deploy-staging.yml
    - infra/k8s/portal/deployment.yaml
    - infra/k8s/candidate/deployment.yaml
decisions: []
metrics:
  duration: "3m"
  completed: "2026-03-08"
---

# Phase 33 Plan 04: Video Service Deployment Gaps Summary

Video-service added to all deployment artifacts: docker-compose for local dev, both CI/CD workflows for production/staging, and LiveKit URL injected into portal and candidate K8s deployments.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Add video-service to docker-compose.yml | fd56ba3d | video-service container (port 3019), VIDEO_SERVICE_URL in api-gateway, depends_on |
| 2 | Add video-service to CI/CD deploy workflows | 809fb637 | Build matrix entry + kubectl apply/rollout in both deploy-aks.yml and deploy-staging.yml |
| 3 | Add NEXT_PUBLIC_LIVEKIT_URL to K8s deployments | 68d0a014 | Portal and candidate deployments get LiveKit WSS URL via envsubst |

## Decisions Made

None -- plan executed as specified.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- [x] video-service entry in docker-compose.yml with port 3019 and LiveKit env vars
- [x] VIDEO_SERVICE_URL in api-gateway docker-compose environment
- [x] video-service in deploy-aks.yml build matrix, deploy step, and rollout status
- [x] video-service in deploy-staging.yml build matrix, deploy loop, and rollout status
- [x] NEXT_PUBLIC_LIVEKIT_URL in portal K8s deployment
- [x] NEXT_PUBLIC_LIVEKIT_URL in candidate K8s deployment

## Next Phase Readiness

Phase 33 infrastructure is now complete. All video-service deployment artifacts are in place. The LIVEKIT_PUBLIC_URL environment variable needs to be set in the CI/CD environment secrets for production and staging when LiveKit is deployed.
