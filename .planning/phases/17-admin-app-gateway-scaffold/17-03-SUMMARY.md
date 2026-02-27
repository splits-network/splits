---
phase: 17-admin-app-gateway-scaffold
plan: "03"
subsystem: infra
tags: [docker, kubernetes, k8s, github-actions, ci-cd, ingress, clerk, nginx]

# Dependency graph
requires:
  - phase: 17-01
    provides: services/admin-gateway Fastify service on port 3020
  - phase: 17-02
    provides: apps/admin Next.js app on port 3200
provides:
  - apps/admin/Dockerfile: multi-stage Docker build for admin Next.js app
  - services/admin-gateway/Dockerfile: multi-stage Docker build for admin-gateway Fastify service
  - infra/k8s/admin/deployment.yaml: K8s Deployment + Service for admin app
  - infra/k8s/admin-gateway/deployment.yaml: K8s Deployment + Service for admin-gateway
  - Ingress rules for admin.employment-networks.com and admin.api.employment-networks.com
  - Staging ingress rules for admin.staging.employment-networks.com domains
  - CI/CD build matrix entries and deploy steps for both services
affects: [phase-18-admin-pages-migration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Double pnpm install --frozen-lockfile: once in dependencies stage, once in build stage after COPY to establish workspace symlinks"
    - "Admin app Dockerfile: ARG/ENV pattern for NEXT_PUBLIC_* build args baked at image build time"
    - "K8s admin-gateway deployment: ADMIN_CLERK_SECRET_KEY from clerk-secrets/admin-clerk-secret-key secretKeyRef"
    - "Staging workflow: admin-gateway in SERVICES loop (deployed before frontends), admin in FRONTENDS loop"
    - "Production workflow: explicit Deploy Admin Gateway + Deploy Admin App steps before Deploy Ingress"

key-files:
  created:
    - apps/admin/Dockerfile
    - services/admin-gateway/Dockerfile
    - infra/k8s/admin/deployment.yaml
    - infra/k8s/admin-gateway/deployment.yaml
  modified:
    - infra/k8s/ingress.yaml
    - infra/k8s/staging-ingress.yaml
    - .github/workflows/deploy-aks.yml
    - .github/workflows/deploy-staging.yml

key-decisions:
  - "admin-gateway added to ALL_SERVICES array (not ALL_APPS) since it is a backend service"
  - "admin added to ALL_APPS array to match portal/candidate/corporate/status pattern"
  - "Deploy order: admin-gateway deploys before admin app (gateway must be ready before app starts serving)"
  - "Ingress rules appended to existing splits-network-ingress TLS block (no separate ingress resource)"

patterns-established:
  - "Admin Dockerfile pattern: shared-types, shared-config, shared-hooks, shared-ui packages for Next.js apps"
  - "Admin-gateway Dockerfile pattern: same as api-gateway — shared-config, shared-types, shared-logging, shared-fastify, shared-access-context"

# Metrics
duration: 4min
completed: 2026-02-27
---

# Phase 17 Plan 03: Dockerfiles, K8s Manifests, and CI/CD Summary

**Multi-stage Dockerfiles, K8s deployments with health probes and Clerk secrets, ingress rules for admin.employment-networks.com domains, and full CI/CD pipeline integration for both admin app and admin-gateway**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-27T23:21:29Z
- **Completed:** 2026-02-27T23:25:01Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Multi-stage Dockerfiles for both admin app (port 3200) and admin-gateway (port 3020) with the double pnpm install pattern for workspace symlink establishment
- K8s Deployment + Service manifests for admin and admin-gateway with health probes, resource limits, and ADMIN_CLERK_SECRET_KEY from clerk-secrets
- Production and staging ingress rules for admin domains appended to existing ingress resources
- Both CI/CD workflows extended: build matrix, admin-specific docker build args, clerk-secrets expansion, deploy steps

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Dockerfiles for admin app and admin-gateway** - `03f6ebd6` (feat)
2. **Task 2: Create K8s manifests and update ingress** - `7dec0dac` (feat)
3. **Task 3: Update CI/CD workflows for admin app and admin-gateway** - `cb6014b3` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `apps/admin/Dockerfile` - Multi-stage build: base/dependencies/build/production; build args for NEXT_PUBLIC_ADMIN_GATEWAY_URL and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY; shared-types, shared-config, shared-hooks, shared-ui packages
- `services/admin-gateway/Dockerfile` - Multi-stage build mirroring api-gateway; shared-config, shared-fastify, shared-logging, shared-types, shared-access-context; node index.js CMD
- `infra/k8s/admin/deployment.yaml` - Deployment (1 replica, port 3200) + ClusterIP Service; liveness/readiness probes on /; 100m/500m cpu, 128Mi/512Mi memory
- `infra/k8s/admin-gateway/deployment.yaml` - Deployment (1 replica, port 3020) + ClusterIP Service; ADMIN_CLERK_SECRET_KEY from clerk-secrets; all 13 domain service URLs; probes on /health
- `infra/k8s/ingress.yaml` - Added admin.employment-networks.com → admin and admin.api.employment-networks.com → admin-gateway rules + TLS hosts
- `infra/k8s/staging-ingress.yaml` - Added admin.staging.employment-networks.com → admin and admin.api.staging.employment-networks.com → admin-gateway rules + TLS hosts
- `.github/workflows/deploy-aks.yml` - admin-gateway in ALL_SERVICES, admin in ALL_APPS, elif block for admin build, extended clerk-secrets, Deploy Admin Gateway + Deploy Admin App steps
- `.github/workflows/deploy-staging.yml` - Same matrix additions, elif block with staging URL, extended clerk-secrets, admin-gateway in SERVICES loop, admin in FRONTENDS loop

## Decisions Made

- **admin-gateway in ALL_SERVICES, not ALL_APPS:** It is a backend service (Fastify). This ensures it gets the right change-detection triggers (services/* changes rebuild it, shared-fastify changes rebuild all services including admin-gateway).
- **Deploy order — gateway before app:** admin-gateway deploy step comes before admin app in production workflow. The app's isPlatformAdmin gate calls the gateway at startup, so the gateway must be available.
- **Ingress appended to existing resource:** Rather than creating a separate ingress resource for admin domains, the new hosts and rules are appended to the existing `splits-network-ingress`. This keeps cert-manager TLS certificates consolidated in one secret.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. IDE warnings about `ADMIN_CLERK_PUBLISHABLE_KEY` and `ADMIN_CLERK_SECRET_KEY` context access are expected — these are new GitHub repository secrets that the user will need to configure before the workflows run.

## User Setup Required

Before the CI/CD workflows can build and deploy the admin services, add these GitHub repository secrets (Settings → Secrets and variables → Actions):

- `ADMIN_CLERK_PUBLISHABLE_KEY` — Admin Clerk instance publishable key (pk_live_...)
- `ADMIN_CLERK_SECRET_KEY` — Admin Clerk instance secret key (sk_live_...)

These are the same values configured in apps/admin/.env.local per the 17-02 User Setup Required section.

## Next Phase Readiness

- Admin app and admin-gateway are fully deployable to both staging and production
- All Phase 17 success criteria met: gateway service, app scaffold, Dockerfiles, K8s manifests, CI/CD pipeline
- Phase 18 (admin pages migration) can begin: the infrastructure is ready to receive feature work
- DNS records for admin.employment-networks.com and admin.api.employment-networks.com need to be created by the user pointing to the AKS ingress load balancer IP

---
*Phase: 17-admin-app-gateway-scaffold*
*Completed: 2026-02-27*
