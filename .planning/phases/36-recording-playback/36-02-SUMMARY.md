---
phase: 36-recording-playback
plan: 02
subsystem: infra
tags: [azure, blob-storage, livekit, egress, kubernetes, lifecycle]

requires:
  - phase: 33-video-infrastructure
    provides: LiveKit egress K8s deployment and node pool configuration
provides:
  - Egress deployment with Azure Blob credentials and temp storage volume
  - Azure Blob lifecycle policy (30-day cool, 90-day delete)
  - Video-service Azure Blob credentials for egress API requests
affects: [36-recording-playback, 37-transcription-ai]

tech-stack:
  added: []
  patterns: [azure-blob-lifecycle-rules, k8s-secret-reference-pattern]

key-files:
  created:
    - infra/k8s/livekit-egress/azure-blob-lifecycle.json
    - infra/k8s/livekit-egress/LIFECYCLE-POLICY.md
  modified:
    - infra/k8s/livekit-egress/deployment.yaml
    - infra/k8s/video-service/deployment.yaml

key-decisions:
  - "Azure credentials on both egress and video-service deployments"
  - "emptyDir 10Gi for egress temp storage during encoding"
  - "90-day recording retention with 30-day tier transition"

patterns-established:
  - "Azure Blob secret reference: azure-blob-secrets K8s secret with account-name, account-key, container-name keys"

duration: 5min
completed: 2026-03-08
---

# Phase 36 Plan 02: Egress Azure Blob Config Summary

**LiveKit Egress deployment updated with Azure Blob Storage credentials, 10Gi temp volume, encoding-grade resources, and 30/90-day lifecycle policy**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-08T07:02:49Z
- **Completed:** 2026-03-08T07:08:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Egress deployment has emptyDir temp volume (10Gi) for large recording files
- Azure Blob Storage credentials referenced from azure-blob-secrets K8s secret
- Egress resources increased to 1000m/4000m CPU and 1Gi/8Gi memory for encoding
- Video-service deployment also receives Azure credentials for egress API requests
- Lifecycle policy moves recordings to Cool tier at 30 days, deletes at 90 days

## Task Commits

Each task was committed atomically:

1. **Task 1: Update LiveKit Egress K8s deployment with Azure Blob config** - `efeed3ef` (feat)
2. **Task 2: Create Azure Blob lifecycle management policy** - `f91b456a` (feat)

## Files Created/Modified
- `infra/k8s/livekit-egress/deployment.yaml` - Added temp volume, Azure credentials, increased resources
- `infra/k8s/video-service/deployment.yaml` - Added Azure Blob credentials for egress API calls
- `infra/k8s/livekit-egress/azure-blob-lifecycle.json` - Lifecycle policy with cool-tier and delete rules
- `infra/k8s/livekit-egress/LIFECYCLE-POLICY.md` - Apply instructions and retention tier documentation

## Decisions Made
- Added Azure credentials to video-service deployment since it orchestrates egress requests (egress receives Azure config per-request, not from env vars)
- Used emptyDir with 10Gi sizeLimit for temp storage rather than PersistentVolumeClaim (egress temp files are ephemeral)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Azure credentials to video-service deployment**
- **Found during:** Task 1
- **Issue:** Plan mentioned documenting that video-service needs Azure credentials, but the deployment.yaml existed and could be updated directly
- **Fix:** Added AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCOUNT_KEY, AZURE_STORAGE_CONTAINER_NAME env vars from azure-blob-secrets
- **Files modified:** infra/k8s/video-service/deployment.yaml
- **Verification:** Read updated file, env vars present
- **Committed in:** efeed3ef (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Video-service needs these credentials at runtime. Adding them now prevents a blocker in later plans.

## Issues Encountered
None

## User Setup Required
The `azure-blob-secrets` K8s secret must be created before deploying:
```bash
kubectl create secret generic azure-blob-secrets \
    --namespace splits-network \
    --from-literal=account-name=<ACCOUNT_NAME> \
    --from-literal=account-key=<ACCOUNT_KEY> \
    --from-literal=container-name=recordings
```

The lifecycle policy must be applied via Azure CLI:
```bash
az storage management-policy create \
    --account-name <ACCOUNT_NAME> \
    --policy @infra/k8s/livekit-egress/azure-blob-lifecycle.json
```

## Next Phase Readiness
- Egress infrastructure configured for Azure Blob output
- Video-service has credentials to pass Azure config in egress API requests
- Lifecycle policy ready to apply when storage account is provisioned

---
*Phase: 36-recording-playback*
*Completed: 2026-03-08*
