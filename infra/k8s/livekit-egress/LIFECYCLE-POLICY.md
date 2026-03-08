# Azure Blob Lifecycle Policy for Recordings

## Apply the policy

```bash
az storage management-policy create \
    --account-name <STORAGE_ACCOUNT_NAME> \
    --policy @infra/k8s/livekit-egress/azure-blob-lifecycle.json
```

## Retention tiers

| Age           | Storage Tier | Cost    | Rationale                          |
|---------------|-------------|---------|-------------------------------------|
| 0-30 days     | Hot         | Highest | Frequent playback after interviews |
| 30-90 days    | Cool        | Lower   | Occasional review, lower access    |
| 90+ days      | Deleted     | None    | 90-day retention policy            |

## Scope

Rules apply only to blobs under the `recordings/` prefix. Other blobs in the container are unaffected.
