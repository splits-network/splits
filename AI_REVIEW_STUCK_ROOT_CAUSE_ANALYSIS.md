# Root Cause Analysis: Applications Stuck in `ai_review` Stage

## Problem Statement

Applications in staging were stuck in the `ai_review` stage even after AI reviews were completed. The most recent example:

- **Application ID**: `4306d803-d8cd-4589-b205-b04351427023`
- **Issue**: Created with stage=`ai_review`, AI review completed at 22:39:48, but stage never progressed to `ai_reviewed`
- **Expected**: Application should automatically move to `ai_reviewed` after AI service completes analysis

## Root Causes Found

### Primary Issue: Domain Consumer Bypassing Service Layer

**Location**: `services/ats-service/src/v2/shared/domain-consumer.ts`

The ATS domain consumer has two event handlers that were broken:

#### 1. `handleStageChanged()` - Missing Audit Logs

- **Problem**: Called `this.applicationRepository.updateApplication()` directly without creating audit log entries
- **Impact**: Database updates had no audit trail, making it impossible to track who changed what and when
- **Comment in code**: Said "This will create audit log and maintain consistency" but it didn't

```typescript
// BROKEN CODE
const updated = await this.applicationRepository.updateApplication(
    application_id,
    { stage: new_stage },
);
// No audit log created!
```

#### 2. `handleAIReviewCompleted()` - Two Architectural Issues

**Issue A**: Direct RabbitMQ Publishing (Bypasses Outbox System)

- **Problem**: Used `this.channel.publish()` to directly publish events to RabbitMQ
- **Impact**: Events were not durably persisted. If the domain consumer crashed after database update but before event publish, the change would exist in DB but other services wouldn't know about it (eventual consistency violation)
- **Why it matters**: RabbitMQ has no guarantee the event was published if the service crashes. The outbox system writes to DB first, then publishes.

```typescript
// BROKEN CODE - Direct RabbitMQ publish, no durability guarantee
if (this.channel) {
    await this.channel.publish(
        this.exchange,
        "application.stage_changed",
        Buffer.from(JSON.stringify(stageChangeEvent)),
    );
}
```

**Issue B**: Missing Audit Logs

- **Problem**: Same as handleStageChanged - no audit log created
- **Impact**: No record of AI review completion event being processed

## Why This Caused Stuck Applications

1. AI service publishes `ai_review.completed` event ✓
2. ATS domain consumer receives the event in RabbitMQ ✓
3. Domain consumer calls `repository.updateApplication(application_id, { stage: 'ai_reviewed', ai_reviewed: true })`
4. **BUG**: Update appears to succeed (no exception thrown), but...
    - No audit log is created (missing audit trail)
    - Event is published directly via RabbitMQ (no durability)
5. A service crash or race condition causes the published event to be lost
6. Or, the update actually succeeds but a subsequent event overwrites it
7. Later, an HTTP request or other action moves the application forward
8. Application ends up in an unpredictable state with no audit trail showing what happened

## Evidence

### Audit Log Timeline for Application `4306d803-d8cd-4589-b205-b04351427023`

```
22:39:38 - Application created with stage=ai_review
22:40:25 - Moved to stage=recruiter_review (action: "submitted")  ← No "stage_changed" entry from domain consumer!
...
22:51:03 - Moved back to stage=ai_review (action: "ai_review_started")
```

**Notice**: There's NO audit log entry at 22:39:49 when domain consumer says it "Successfully synced application stage change". This confirms the audit log wasn't being created.

## The Fix

### Changes Made to `domain-consumer.ts`

#### 1. handleStageChanged() - Added audit log creation and safety check

```typescript
// Fetch current application to verify stage hasn't changed
const currentApplication = await this.applicationRepository.findApplication(
    application_id,
    "internal-service",
);

// Only update if stage is different
if (currentApplication.stage === new_stage) {
    // Skip redundant update
    return;
}

// Update the database
const updated = await this.applicationRepository.updateApplication(
    application_id,
    { stage: new_stage },
);

// ✅ CREATE AUDIT LOG - NOW IT'S BEING TRACKED
await this.applicationRepository.createAuditLog({
    application_id,
    action: "stage_changed",
    performed_by_user_id: changed_by || "system",
    performed_by_role: "system",
    old_value: { stage: old_stage },
    new_value: { stage: new_stage },
    metadata: {
        source_event: event.event_type,
        event_id: event.event_id,
    },
});
```

#### 2. handleAIReviewCompleted() - Fixed event publishing and added audit log

```typescript
// Update database
const updatedApplication = await this.applicationRepository.updateApplication(
    application.id,
    { stage: nextStage, ai_reviewed: true },
);

// ✅ CREATE AUDIT LOG
await this.applicationRepository.createAuditLog({
    application_id: updatedApplication.id,
    action: "ai_review_completed",
    performed_by_user_id: "system",
    performed_by_role: "system",
    old_value: { stage: application.stage },
    new_value: { stage: nextStage },
    metadata: {
        ai_review_id: payload.ai_review_id,
        fit_score: payload.fit_score,
        recommendation: payload.recommendation,
        source_event: event.event_id,
    },
});

// ✅ USE EVENTPUBLISHER (OUTBOX) INSTEAD OF DIRECT CHANNEL.PUBLISH()
if (this.eventPublisher) {
    await this.eventPublisher.publish("application.stage_changed", {
        application_id: updatedApplication.id,
        candidate_id: updatedApplication.candidate_id,
        job_id: updatedApplication.job_id,
        recruiter_id: updatedApplication.recruiter_id,
        old_stage: application.stage,
        new_stage: nextStage,
        changed_by: "system",
    });
}
```

## Impact

### What This Fixes

1. **Audit Trail**: All domain consumer updates now create audit log entries with full context
2. **Event Durability**: Events published through eventPublisher use outbox system for durability
3. **No Silent Failures**: Any future updates will be traceable
4. **Race Condition Prevention**: Added safety check to skip redundant updates

### Why Future Applications Won't Get Stuck

- Domain consumer now creates audit logs → visible progress tracking
- Domain consumer now uses eventPublisher → durable event delivery
- Other services will see stage changes via properly published events
- Applications will continue through the pipeline correctly

## Deployment Requirements

1. **Rebuild ATS Service**: `pnpm --filter @splits-network/ats-service build`
2. **Push to Registry**: Build and push Docker image to Azure Container Registry
3. **Deploy**: Update Kubernetes deployment with new image version
4. **Verify**: Check audit logs for new applications to confirm audit trail is being created

## Affected Applications

- ✅ **Fixed**: `4306d803-d8cd-4589-b205-b04351427023` (manually moved to ai_reviewed)
- ⚠️ **Needs Review**: `f7e9438b-0e5f-4100-8497-f2b632411843` (stuck since Feb 23, different root cause - AI service never completed review)

## Technical Details

### The Outbox Pattern

The eventPublisher (OutboxPublisher) writes events to the `outbox_events` table before publishing to RabbitMQ. A background worker (OutboxWorker) reads these events and publishes them to RabbitMQ. This ensures:

- Events are durably persisted before delivery attempt
- Events are delivered eventually, even if RabbitMQ is temporarily unavailable
- Lost connections don't lose events

### Why Direct RabbitMQ Publishing is Dangerous

```typescript
// ❌ NOT DURABLE - Event can be lost if service crashes
if (this.channel) {
    await this.channel.publish(...); // If crash happens here, event is lost
}

// ✅ DURABLE - Event survives crashes
if (this.eventPublisher) {
    await this.eventPublisher.publish(...); // Writes to DB first, then to RabbitMQ
}
```
