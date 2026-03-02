# Deployment Checklist: ATS Service Fix

## Status Summary

- ✅ **Root cause identified**: Domain consumer not creating audit logs, using direct RabbitMQ publishing instead of outbox system
- ✅ **Code fixes applied**: `services/ats-service/src/v2/shared/domain-consumer.ts` updated with two critical fixes
- ✅ **Build verified**: `pnpm build` in ATS service succeeded (TypeScript compilation clean)
- 🔄 **Deployment pending**: Docker image not yet built or deployed
- 🔄 **Testing pending**: New applications need to be tested to verify fix works end-to-end

## Pre-Deployment Checklist

- [ ] Review changes in `domain-consumer.ts`
    - `handleStageChanged()`: Added idempotency check + audit log creation
    - `handleAIReviewCompleted()`: Changed to use eventPublisher + added audit log creation
- [ ] Verify no other domain consumers have the same issue
- [ ] Check if similar pattern exists in other services

## Deployment Steps

### Step 1: Build Docker Image

```bash
# From workspace root
cd services/ats-service

# Build and tag image (increment version accordingly)
docker build -t crwwplatformstagwu3.azurecr.io/ats-service:v1.2.3 .

# Push to Azure Container Registry
docker push crwwplatformstagwu3.azurecr.io/ats-service:v1.2.3
```

### Step 2: Update Kubernetes Deployment

```bash
# Update the deployment manifest or patch the running deployment
kubectl set image deployment/ats-service \
  ats-service=crwwplatformstagwu3.azurecr.io/ats-service:v1.2.3 \
  --namespace=default \
  --record

# Verify rollout
kubectl rollout status deployment/ats-service
```

### Step 3: Verify Deployment

```bash
# Check that new pods are running
kubectl get pods -l app=ats-service

# Tail logs to verify startup
kubectl logs -f deployment/ats-service --tail=50
```

## Post-Deployment Testing

### Manual Test: Create New Application and Trigger AI Review

1. Create a new application via Portal UI or API
2. Upload a resume document
3. Verification checklist:
    - [ ] Application moves to `ai_review` stage
    - [ ] AI service processes the resume
    - [ ] Application automatically advances to `ai_reviewed` stage
    - [ ] Audit log shows entry from domain consumer with "ai_review_completed" action
    - [ ] Events in `outbox_events` table show `application.stage_changed` event published

### Database Verification Query

```sql
-- Check that audit logs are being created
SELECT
  a.id,
  a.stage,
  a.ai_reviewed,
  COUNT(l.id) as audit_log_count,
  MAX(l.created_at) as last_audit_log
FROM applications a
LEFT JOIN application_audit_log l ON a.id = l.application_id
WHERE a.created_at > NOW() - INTERVAL '1 hour'
GROUP BY a.id, a.stage, a.ai_reviewed
ORDER BY a.created_at DESC;

-- Check for any applications stuck in ai_review with ai_reviewed=true (the original bug)
-- This should return 0 after fix is deployed
SELECT COUNT(*) as stuck_applications
FROM applications
WHERE stage = 'ai_review' AND ai_reviewed = TRUE;
```

## Rollback Plan

If issues are detected post-deployment:

```bash
# Rollback to previous image version
kubectl rollout undo deployment/ats-service
kubectl rollout status deployment/ats-service
```

## Monitoring Recommendations

1. **Setup Alert**: Alert if audit logs are created for AI review events
2. **Track Metric**: Applications moving from ai_review → ai_reviewed within 5 seconds
3. **Monitor Logs**: Watch for any errors in domain consumer

## Known Issues / Secondary Problems

### Second Stuck Application

- **ID**: `f7e9438b-0e5f-4100-8497-f2b632411843`
- **Different Root Cause**: AI service never published `ai_review.completed` event (has `ai_review.triggered` but no completion)
- **Likely Issue**: AI service failed processing or timed out on older document
- **Action**: Requires separate investigation - may need manual re-trigger or document reprocessing

### Investigation of Future Stuck Applications

If more applications get stuck after this deployment:

1. Check audit logs first (now they should exist!)
2. Check `outbox_events` table for domain consumer events
3. Check AI service logs for errors
4. Check if document processing service completed document text extraction
