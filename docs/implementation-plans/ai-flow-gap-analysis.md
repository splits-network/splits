# AI-Assisted Application Flow - Gap Analysis
**Date:** January 2, 2026  
**Status:** Implementation Review  
**Related Document:** [ai-assisted-application-flow.md](./ai-assisted-application-flow.md)

---

## Executive Summary

This document analyzes the current state of the AI-assisted application flow implementation and identifies gaps that need to be addressed to complete the feature as designed.

### Current Status: ~70% Complete ✅

**What Works:**
- ✅ Candidate portal application wizard exists and submits applications with `stage: 'ai_review'`
- ✅ AI service exists with V2 routes and can analyze applications
- ✅ AI service publishes `application.stage_changed` events after analysis
- ✅ Notification service listens for various application events
- ✅ ATS service publishes `application.created` and `application.stage_changed` events

**What's Missing:**
- ❌ AI service does NOT listen for `application.stage_changed` events (critical)
- ❌ No domain event consumer in AI service to trigger AI analysis automatically
- ❌ Notification service handlers for AI review completion need verification
- ❌ Stage transition logic from `ai_review` → `screen`/`submitted` may need updates

---

## 1. Current Flow Analysis

### 1.1 Candidate Submits Application ✅

**Location:** `apps/candidate/src/components/application-wizard-modal.tsx:160-175`

```tsx
// Create new application
result = await submitApplication(
    {
        job_id: jobId,
        document_ids: formData.selected,
        primary_resume_id: formData.primary_resume_id!,
        pre_screen_answers: formData.pre_screen_answers,
        notes: formData.notes,
        stage: 'ai_review',  // ✅ Sets stage to ai_review
    },
    token
);
```

**What happens:**
1. Candidate completes wizard and clicks "Submit Application"
2. API call creates application with `stage: 'ai_review'`
3. ATS service creates the application
4. ATS service publishes `application.created` event

**Verification:**  
✅ **WORKS** - Applications are being created with `stage: 'ai_review'`

**Event Published:**
```typescript
const userContext = await this.accessResolver.resolve(clerkUserId);
// services/ats-service/src/v2/applications/service.ts:201
await this.eventPublisher.publish('application.created', {
    application_id: application.id,
    job_id: application.job_id,
    candidate_id: application.candidate_id,
    recruiter_id: application.recruiter_id || null,
    has_recruiter: !!application.recruiter_id,
    stage: application.stage,  // Will be 'ai_review'
    created_by: userContext.identityUserId,
});
```

---

### 1.2 AI Service Triggers Analysis ❌ **CRITICAL GAP**

**Expected:** AI service listens for `application.stage_changed` event with `new_stage: 'ai_review'`

**Current State:** Automation service acts as unnecessary middleman

**Gap Analysis:**

```typescript
// services/ai-service/src/index.ts
// ❌ NO DOMAIN EVENT CONSUMER EXISTS

// Current (WRONG - automation service is middleman):
// automation-service listens for application.stage_changed
// → calls AI service HTTP API (POST /v2/ai-reviews)
// → AI service processes

// Expected (CORRECT - direct event consumption):
// import { DomainEventConsumer } from './domain-consumer';
// 
// const consumer = new DomainEventConsumer(
//     rabbitConfig.url,
//     aiReviewService,
//     logger
// );
// await consumer.connect();
```

**Current flow (INCORRECT):**
1. Application stage changes from `draft` → `ai_review`
2. ATS service publishes `application.stage_changed` event
3. ❌ **Automation service listens** for the event (services/automation-service/src/v2/shared/domain-consumer.ts)
4. ❌ **Automation service makes HTTP call** to AI service API (`POST /v2/ai-reviews`)
5. AI service receives API call, fetches application data
6. AI service processes application through OpenAI
7. AI service publishes `application.stage_changed` with next stage

**Expected flow (CORRECT):**
1. Application stage changes from `draft` → `ai_review`
2. ATS service publishes `application.stage_changed` event
3. ✅ **AI service listens directly** for the event
4. AI service fetches application + related data (documents, questions, requirements)
5. AI service processes application through OpenAI
6. AI service publishes `application.stage_changed` with next stage

**Why current approach is wrong:**
- ❌ Automation service is unnecessary middleman
- ❌ Extra HTTP call adds latency
- ❌ Extra failure point (HTTP request can fail)
- ❌ Violates event-driven architecture principles
- ❌ Automation service should orchestrate complex workflows, not proxy simple 1-to-1 triggers

---

### 1.3 AI Service Publishes Stage Change ✅

**Location:** `services/ai-service/src/v2/reviews/service.ts:192-220`

```typescript
// Publish application.stage_changed event (replaces ai_review.completed)
if (this.eventPublisher) {
    await this.eventPublisher.publish('application.stage_changed', {
        application_id: input.application_id,
        candidate_id: input.candidate_id || application.candidate_id,
        job_id: input.job_id || application.job_id,
        company_id: application.company_id,
        old_stage: 'ai_review',
        new_stage: nextStage,  // 'screen' or 'submitted'
        changed_by: 'ai_service',
        ai_review_id: review.id,
        fit_score: review.fit_score,
        recommendation: review.recommendation,
        processing_time_ms: processingTimeMs,
        timestamp: new Date().toISOString(),
    });
}
```

**Next stage logic:**
```typescript
const application = await this.fetchApplicationForStageTransition(input.application_id);
const nextStage = application.recruiter_id ? 'screen' : 'submitted';
```

**Verification:**  
✅ **WORKS** - AI service correctly determines next stage based on recruiter presence  
✅ **WORKS** - Event payload includes all required fields

---

### 1.4 Notification Service Handles Events ⚠️ **NEEDS VERIFICATION**

**Location:** `services/notification-service/src/domain-consumer.ts:97-111`

```typescript
// Phase 1.5 events - AI Review
await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.started');
await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.completed');
await this.channel.bindQueue(this.queue, this.exchange, 'ai_review.failed');
await this.channel.bindQueue(this.queue, this.exchange, 'application.draft_completed');
```

**Event handling:**
```typescript
// services/notification-service/src/domain-consumer.ts:207-215
case 'ai_review.started':
    await this.applicationsConsumer.handleAIReviewStarted(event);
    break;
case 'ai_review.completed':
    await this.applicationsConsumer.handleAIReviewCompleted(event);
    break;
case 'ai_review.failed':
    await this.applicationsConsumer.handleAIReviewFailed(event);
    break;
```

**Gap Analysis:**

⚠️ **ISSUE**: Notification service listens for legacy event names, not standardized `application.stage_changed`

**Current:**
- AI service publishes: `application.stage_changed` (with `old_stage: 'ai_review'`)
- Notification service listens for: `ai_review.completed` (legacy event)
- **Result:** Notifications won't trigger when AI review completes

**Required fix:**

```typescript
// In notification service domain-consumer.ts
// 1. Bind to application.stage_changed events
await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');

// 2. Handle in switch statement
case 'application.stage_changed':
    // Always handle general stage changes (for any stage transition)
    await this.applicationsConsumer.handleApplicationStageChanged(event);
    
    // Special handling for AI review completion
    if (event.payload.old_stage === 'ai_review') {
        await this.applicationsConsumer.handleAIReviewCompleted(event);
    }
    break;
```

**Why this matters:**
- ✅ Notification service sends emails/in-app notifications for **all** stage changes
- ✅ Special logic for AI review completion (includes fit score, recommendation)
- ✅ Follows standardized event pattern (application.stage_changed for all transitions)
- ✅ Single event type for all stage transitions (easier to maintain)

---

### 1.5 Notification Service Sends Emails ⚠️ **NEEDS VERIFICATION**

**Handler Location:** `services/notification-service/src/consumers/applications/consumer.ts`

**Required handlers:**
1. `handleAIReviewCompleted` - Send emails when AI review finishes
   - To candidate (direct): "Your application has been reviewed (85/100)"
   - To recruiter (represented): "AI review complete for [Candidate] - 85/100"
   - To company (when submitted): "New application received - AI Fit Score: 85/100"

2. `handleApplicationStageChanged` - General stage change handler
   - Must check for `old_stage: 'ai_review'` transitions
   - Handle `ai_review` → `screen` notifications
   - Handle `ai_review` → `submitted` notifications

**Verification needed:**  
⚠️ Need to check if these handlers are fully implemented with correct email templates

---

## 2. Missing Components

### 2.1 Document Text Extraction ❌ **CRITICAL - BLOCKING AI REVIEWS**

**Current Issue:** AI service cannot find resume text because it's looking in the wrong place.

**Problem Details:**

```typescript
// AI service expects this structure (WRONG):
const primaryResume = application.find(doc => doc.extracted_text);
if (primaryResume && primaryResume.extracted_text) {
    resumeText = primaryResume.extracted_text;  // ❌ This field doesn't exist
}
```

**Database Schema (VERIFIED):**
```sql
-- documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY,
    entity_type entity_type NOT NULL,  -- enum: 'candidate', 'job', 'application', 'company', 'placement', 'contract', 'invoice'
    entity_id UUID NOT NULL,           -- polymorphic foreign key
    document_type document_type NOT NULL,
    filename VARCHAR(500) NOT NULL,
    storage_path TEXT NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by_user_id UUID,
    processing_status processing_status DEFAULT 'pending',  -- enum: 'pending', 'processing', 'processed', 'failed'
    metadata JSONB DEFAULT '{}',  -- ✅ Text should go here as metadata.extracted_text
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Current metadata structure (from actual data):
-- {"is_primary": true, "original_document_id": "uuid"}
-- ❌ NO extracted_text column exists!
-- ❌ NO extracted_text in metadata yet (all documents have processing_status='pending')
```

**Document-Application Relationship (VERIFIED):**
- Uses polymorphic pattern via `entity_type` + `entity_id`
- For applications: `entity_type='application'` AND `entity_id` references `applications.id`
- NO junction table - direct polymorphic relation
- Query pattern: `WHERE entity_type='application' AND entity_id={application_id}`

**Root Cause:**
1. Documents table has `metadata` JSONB field for extracted text (schema confirmed)
2. AI service expects `extracted_text` as direct property on document (line 109)
3. Document service NOT extracting text from PDFs/docs yet (all 99 documents show `processing_status='pending'`)
4. Even if text was extracted, it would be in `metadata.extracted_text` (JSONB path)

**Solution Required:**

**Option 1: Fix AI service to read from metadata (recommended)**
```typescript
// services/ai-service/src/v2/reviews/service.ts:109
if (primaryResume && primaryResume.metadata?.extracted_text) {
    resumeText = primaryResume.metadata.extracted_text;
    this.logger.info({ application_id: input.application_id, document_id: primaryResume.id }, 'Using extracted text from resume document');
} else if (primaryResume) {
    this.logger.warn({ 
        application_id: input.application_id, 
        document_id: primaryResume.id,
        processing_status: primaryResume.processing_status,
        has_metadata: !!primaryResume.metadata
    }, 'Resume document found but no extracted_text in metadata');
}
```

**Option 2: Add text extraction to document service**

Document service needs to:
1. Extract text from uploaded PDFs/DOCX files
2. Store extracted text in `metadata.extracted_text`
3. Update `processing_status` from `pending` → `processing` → `processed`
4. Publish `document.processed` event when complete

**Libraries for text extraction:**
- PDF: `pdf-parse` or `pdfjs-dist`
- DOCX: `mammoth` or `docx`
- Plain text: direct read

**Example document service processing:**
```typescript
// After upload, trigger background processing
async function processDocument(documentId: string) {
    const doc = await getDocument(documentId);
    
    // Update status
    await supabase
        .from('documents')
        .update({ processing_status: 'processing' })
        .eq('id', documentId);
    
    // Download file from storage
    const { data: file } = await supabase.storage
        .from(doc.bucket_name)
        .download(doc.storage_path);
    
    // Extract text based on content type
    let extractedText = '';
    if (doc.content_type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
    } else if (doc.content_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractTextFromDocx(file);
    }
    
    // Save extracted text to metadata
    await supabase
        .from('documents')
        .update({ 
            processing_status: 'processed',
            metadata: { extracted_text: extractedText }
        })
        .eq('id', documentId);
    
    // Publish event
    await eventPublisher.publish('document.processed', {
        document_id: documentId,
        entity_type: doc.entity_type,
        entity_id: doc.entity_id,
        has_text: extractedText.length > 0
    });
}
```

**Immediate Fix (Unblocks AI reviews):**
1. Update AI service line 109 to read from `metadata.extracted_text`
2. Verify ATS service passes full document objects with metadata

**Long-term Fix (Complete feature):**
1. Implement text extraction in document service
2. Process existing documents retroactively
3. Auto-process new uploads

---

### 2.2 AI Service Domain Event Consumer ❌ **CRITICAL**

**File to create:** `services/ai-service/src/domain-consumer.ts`

**Required functionality:**
```typescript
import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { Logger } from '@splits-network/shared-logging';
import { DomainEvent } from '@splits-network/shared-types';
import { AIReviewServiceV2 } from './v2/reviews/service';

export class DomainEventConsumer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private readonly exchange = 'splits-network-events';
    private readonly queue = 'ai-service-queue';

    constructor(
        private rabbitMqUrl: string,
        private aiReviewService: AIReviewServiceV2,
        private logger: Logger
    ) {}

    async connect(): Promise<void> {
        this.connection = await amqp.connect(this.rabbitMqUrl);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        await this.channel.assertQueue(this.queue, { durable: true });

        // Bind to events we care about
        await this.channel.bindQueue(this.queue, this.exchange, 'application.stage_changed');

        this.logger.info('AI service connected to RabbitMQ and bound to events');

        await this.startConsuming();
    }

    private async startConsuming(): Promise<void> {
        if (!this.channel) {
            throw new Error('Channel not initialized');
        }

        await this.channel.consume(
            this.queue,
            async (msg: ConsumeMessage | null) => {
                if (!msg) return;

                try {
                    const event: DomainEvent = JSON.parse(msg.content.toString());
                    this.logger.info({ event_type: event.event_type }, 'Processing event');

                    await this.handleEvent(event);
                    
                    this.channel!.ack(msg);
                } catch (error) {
                    this.logger.error({ err: error }, 'Error processing message');
                    this.channel!.nack(msg, false, false);
                }
            },
            { noAck: false }
        );

        this.logger.info('Started consuming events');
    }

    private async handleEvent(event: DomainEvent): Promise<void> {
        switch (event.event_type) {
            case 'application.stage_changed':
                await this.handleApplicationStageChanged(event);
                break;
            default:
                this.logger.debug({ event_type: event.event_type }, 'Ignoring event');
        }
    }

    private async handleApplicationStageChanged(event: DomainEvent): Promise<void> {
        const { application_id, old_stage, new_stage, candidate_id, job_id } = event.payload;

        // Only process when transitioning TO ai_review
        if (new_stage !== 'ai_review') {
            return;
        }

        this.logger.info(
            { application_id, old_stage, new_stage },
            'Triggering AI review for application'
        );

        try {
            // Enrich and analyze application
            // The service will automatically publish application.stage_changed when complete
            await this.aiReviewService.createReview({
                application_id,
                candidate_id,
                job_id,
                // Other fields will be enriched by service
            } as any);

            this.logger.info(
                { application_id },
                'AI review completed successfully'
            );
        } catch (error) {
            this.logger.error(
                { err: error, application_id },
                'Failed to process AI review'
            );
            // Error is already handled by service (publishes ai_review.failed event)
        }
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
        this.logger.info('AI service domain consumer closed');
    }
}
```

**Integration in `services/ai-service/src/index.ts`:**
```typescript
import { DomainEventConsumer } from './domain-consumer';

// After building server and initializing event publisher
const aiReviewService = /* ... create service instance ... */;

const consumer = new DomainEventConsumer(
    rabbitConfig.url,
    aiReviewService,
    logger
);
await consumer.connect();

// Add to graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down ai-service gracefully');
    try {
        await app.close();
        if (eventPublisher) {
            await eventPublisher.close();
        }
        await consumer.close();  // ← Add this
    } finally {
        process.exit(0);
    }
});
```

---

### 2.3 ATS Service Stage Transition Logic ⚠️ **NEEDS VERIFICATION**

**Current behavior:**

When ATS service receives `application.stage_changed` from AI service:
- Event payload: `{ old_stage: 'ai_review', new_stage: 'screen' | 'submitted', ... }`
- ATS service should update application stage in database

**File:** `services/ats-service/src/v2/applications/service.ts`

**Need to verify:**
1. Does ATS service listen for `application.stage_changed` events from AI service?
2. Does it update the application stage automatically?
3. Or does it require explicit API call?

**Expected flow:**
```typescript
// In ATS service domain-consumer (if it exists)
case 'application.stage_changed':
    // If event came from AI service, update application stage
    if (event.payload.changed_by === 'ai_service') {
        await this.applicationsService.updateApplication(
            event.payload.application_id,
            { stage: event.payload.new_stage },
            'ai_service'  // System user
        );
    }
    break;
```

⚠️ **INVESTIGATION NEEDED:** Does ATS service have a domain consumer? Or does AI service call ATS API directly?

**Recommended approach:** AI service should call ATS API to update stage (more reliable):

```typescript
// In AI service after publishing event
await fetch(`${this.atsServiceUrl}/api/v2/applications/${application_id}`, {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'x-internal-service-key': process.env.INTERNAL_SERVICE_KEY || '',
    },
    body: JSON.stringify({
        stage: nextStage,
        ai_reviewed: true,
        ai_review_id: review.id,
    }),
});
```

---

### 2.4 Remove AI Review Trigger from Automation Service ❌ **CRITICAL CLEANUP**

**Current implementation:** Automation service listens for events and triggers AI reviews

**Files to modify:**

1. **services/automation-service/src/v2/shared/domain-consumer.ts**
   - Currently binds to `application.created` and `application.stage_changed`
   - Calls `aiReviewService.triggerReview()` for both events
   - **Action:** Remove AI review triggering logic

2. **services/automation-service/src/v2/ai-review/service.ts**
   - Makes HTTP POST to AI service `/v2/ai-reviews`
   - **Action:** Delete this entire file (no longer needed)

**Cleanup steps:**

```typescript
// services/automation-service/src/v2/shared/domain-consumer.ts
// REMOVE these event handlers:

// ❌ DELETE THIS:
case 'application.created':
    // Trigger AI review for new applications
    this.logger.info({ application_id: event.payload.application_id }, 'Triggering AI review for new application');
    await this.aiReviewService.triggerReview(event);
    break;

case 'application.stage_changed':
    // Only trigger AI review when stage changes to ai_review
    if (event.payload.new_stage === 'ai_review') {
        this.logger.info({ 
            application_id: event.payload.application_id,
            old_stage: event.payload.old_stage,
            new_stage: event.payload.new_stage
        }, 'Application stage changed to ai_review, triggering review');
        await this.aiReviewService.triggerReview(event);
    }
    break;
```

**Rationale:**
- Automation service should handle complex multi-step workflows
- AI review is a simple 1-to-1 event trigger (AI service should listen directly)
- Removes unnecessary HTTP calls between services
- Cleaner separation of concerns

**After cleanup, automation service should focus on:**
- Fraud detection monitoring
- Metrics aggregation
- Rule-based automation (e.g., "if fit_score > 90, auto-advance to interview")
- Complex workflows requiring coordination of multiple services

---

### 2.5 Recruiter Screen to Submitted ✅

**Current implementation:** Seems to be handled by ATS service stage transitions

**Validation rules:** `services/ats-service/src/v2/applications/service.ts:365-375`
```typescript
const validTransitions: Record<ApplicationStage, ApplicationStage[]> = {
    draft: ['ai_review', 'screen', 'rejected'],
    recruiter_proposed: ['ai_review', 'draft', 'rejected'],
    recruiter_request: ['draft', 'ai_review', 'rejected'],
    ai_review: ['screen', 'rejected'],  // ✅ ai_review can go to screen
    screen: ['submitted', 'recruiter_request', 'rejected'],  // ✅ screen can go to submitted
    submitted: ['interview', 'rejected'],
    interview: ['offer', 'rejected'],
    offer: ['hired', 'rejected'],
    hired: [],
    rejected: [],
    withdrawn: [],
};
```

**Verification:**  
✅ **WORKS** - Stage transition validation allows correct flow

---

## 3. Event Flow Diagram (Current vs Expected)

### Current Flow (WRONG - Automation Service as Middleman)
```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Candidate submits application wizard                         │
│    stage: 'ai_review'                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. ATS service creates application                               │
│    Publishes: application.created                                │
│    Publishes: application.stage_changed                          │
│    { old_stage: 'draft', new_stage: 'ai_review' }               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. ❌ Automation service listens for event                      │
│    (services/automation-service/src/v2/shared/domain-consumer)  │
│                                                                   │
│    Receives: application.stage_changed                           │
│    Filters: new_stage === 'ai_review'                           │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. ❌ Automation service makes HTTP call                        │
│    POST http://ai-service:3009/v2/ai-reviews                    │
│    { application_id }                                            │
│                                                                   │
│    Extra latency, extra failure point                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. AI service receives HTTP API call                            │
│    • Fetches application + documents + requirements              │
│    • Calls OpenAI to analyze                                     │
│    • Saves AI review to database                                 │
│                                                                   │
│    Publishes: application.stage_changed                          │
│    { old_stage: 'ai_review',                                     │
│      new_stage: has_recruiter ? 'screen' : 'submitted' }        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6. ❌ Notification service does NOT get notified                │
│    (listens for ai_review.completed, not stage_changed)         │
└──────────────────────────────────────────────────────────────────┘
```

---

### Expected Flow (Designed)
```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Candidate submits application wizard                         │
│    stage: 'ai_review'                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. ATS service creates application                               │
│    Publishes: application.created                                │
│                                                                   │
│    Event: application.stage_changed                              │
│    { old_stage: 'draft', new_stage: 'ai_review' }               │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. AI service listens for application.stage_changed             │
│    (Direct event consumption - no middleman)                    │
│    Filters: new_stage === 'ai_review'                           │
│                                                                   │
│    • Fetches application + documents + requirements              │
│    • Calls OpenAI to analyze                                     │
│    • Saves AI review to database                                 │
│    • Updates application stage via ATS API                       │
│                                                                   │
│    Publishes: application.stage_changed                          │
│    { old_stage: 'ai_review',                                     │
│      new_stage: has_recruiter ? 'screen' : 'submitted',         │
│      changed_by: 'ai_service',                                   │
│      ai_review_id, fit_score, recommendation }                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 4. ATS service updates application stage                        │
│    (via API call from AI service in step 3)                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 5. Notification service listens for application.stage_changed   │
│    (Triggered by AI service event in step 3)                    │
│                                                                   │
│    Sends emails/notifications:                                   │
│    • Candidate: "AI reviewed your application (85/100)"          │
│    • Recruiter: "Ready for screen" (if represented)             │
│    • Company: "New application" (if direct)                     │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 6a. REPRESENTED: Recruiter screens candidate                    │
│     → screen → submitted (or recruiter_request)                  │
│                                                                   │
│ 6b. DIRECT: Company reviews application                         │
│     → submitted → interview → offer → hired                      │
└──────────────────────────────────────────────────────────────────┘
```

### Current Flow (What Actually Happens)
```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Candidate submits application wizard                         │
│    stage: 'ai_review'                                            │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 2. ATS service creates application                               │
│    Publishes: application.created                                │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                              ❌ STOPS HERE ❌
                              
                    (AI service doesn't listen)
                    (No automatic processing)
                    
                    
Manual workaround (via API Gateway):
                              
┌──────────────────────────────────────────────────────────────────┐
│ API call: POST /api/v2/ai-reviews                               │
│ { application_id: "..." }                                        │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│ 3. AI service processes review                                  │
│    Publishes: application.stage_changed                          │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    ⚠️ Unclear what happens next
```

---

## 4. Implementation Checklist

### Phase 1: Critical Path (Immediate)

- [ ] **Create AI service domain event consumer**
  - [ ] File: `services/ai-service/src/domain-consumer.ts`
  - [ ] Listen for `application.stage_changed` events
  - [ ] Filter for `new_stage === 'ai_review'`
  - [ ] Trigger AI analysis automatically
  - [ ] Handle errors and publish `ai_review.failed` events

- [ ] **Integrate consumer into AI service startup**
  - [ ] Update `services/ai-service/src/index.ts`
  - [ ] Initialize consumer after event publisher
  - [ ] Add to graceful shutdown

- [ ] **Verify ATS service stage synchronization**
  - [ ] Option A: AI service calls ATS API to update stage
  - [ ] Option B: ATS service listens for AI's stage_changed event
  - [ ] Test: Application stage updates after AI review completes

- [ ] **Update notification service event handling**
  - [ ] Option: Handle `application.stage_changed` with `old_stage === 'ai_review'`
  - [ ] OR: Keep listening to `ai_review.completed` (AI service publishes both)
  - [ ] Verify email templates exist for all scenarios

### Phase 2: Testing & Validation (Next)

- [ ] **End-to-end flow testing**
  - [ ] Test direct candidate application (no recruiter)
  - [ ] Test represented candidate application (with recruiter)
  - [ ] Verify stage transitions: draft → ai_review → screen/submitted
  - [ ] Verify all emails are sent at correct times

- [ ] **Error handling**
  - [ ] Test AI service failure scenarios
  - [ ] Verify `ai_review.failed` event handling
  - [ ] Test notification service retry logic

- [ ] **Performance & monitoring**
  - [ ] Add timing metrics for AI processing
  - [ ] Monitor RabbitMQ queue depths
  - [ ] Alert on AI processing delays > 30 seconds

### Phase 3: Documentation & Cleanup (Later)

- [ ] **Update architecture diagrams**
  - [ ] Document final event flow
  - [ ] Update service interaction diagrams

- [ ] **Code cleanup**
  - [ ] Remove manual AI review triggers (if any)
  - [ ] Consolidate event schemas in shared-types
  - [ ] Add OpenAPI specs for new endpoints

---

## 5. Questions & Decisions Needed

### 5.1 ATS Stage Synchronization

**Question:** How should AI service update the application stage after review?

**Option A: Direct API call (Recommended)**
```typescript
// AI service calls ATS API
await fetch(`${this.atsServiceUrl}/api/v2/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stage: nextStage }),
});
```
**Pros:** Reliable, immediate, transactional  
**Cons:** Tight coupling between services

**Option B: Event-based sync**
```typescript
// ATS service listens for application.stage_changed from AI service
// and updates its own database
```
**Pros:** Loose coupling, event-driven  
**Cons:** Eventual consistency, requires ATS domain consumer

**Recommendation:** Use **Option A** for reliability. Events are for notifications, not state synchronization.

---

### 5.2 Notification Event Schema

**Question:** Should AI service publish `ai_review.completed` or rely on `application.stage_changed`?

**Option A: Publish BOTH events** (backward compatible)
```typescript
await this.eventPublisher.publish('application.stage_changed', { ... });
await this.eventPublisher.publish('ai_review.completed', { ... });
```
**Pros:** Backward compatible with existing notification handlers  
**Cons:** Duplicate events, extra message volume

**Option B: Notification service handles generic `application.stage_changed`**
```typescript
case 'application.stage_changed':
    if (event.payload.old_stage === 'ai_review') {
        await this.handleAIReviewCompleted(event);
    }
    await this.handleStageChanged(event);
    break;
```
**Pros:** Clean, follows standardized pattern  
**Cons:** Requires notification service updates

**Recommendation:** Use **Option B** - it's cleaner and more maintainable.

---

### 5.3 Recruiter Request Stage

**Question:** What happens when recruiter clicks "Request Changes" from `screen` stage?

**Current validation:**
```typescript
screen: ['submitted', 'recruiter_request', 'rejected']
```

**Expected flow:**
1. Recruiter reviews application in `screen` stage
2. Recruiter decides candidate needs to update something
3. Application moves to `recruiter_request` stage
4. Candidate portal shows "Recruiter requested changes"
5. Candidate updates application
6. Application moves back to `screen` stage for re-review

**Verification needed:**  
⚠️ Does this flow work end-to-end? Are notifications sent correctly?

---

## 6. Risk Assessment

### High Risk ❌
1. **AI service has no domain consumer** - Applications stuck in `ai_review` stage
   - **Impact:** Feature completely broken, candidates see no progress
   - **Mitigation:** Implement consumer immediately (1-2 days)

2. **Stage synchronization unclear** - Application stage may not update after AI review
   - **Impact:** UI shows wrong status, notifications fail
   - **Mitigation:** Choose sync approach (API call vs event) and implement

### Medium Risk ⚠️
3. **Notification templates may not exist** - Users don't receive expected emails
   - **Impact:** Poor user experience, users confused about application status
   - **Mitigation:** Audit notification handlers and templates (1 day)

4. **Error handling incomplete** - Failed AI reviews leave applications in limbo
   - **Impact:** Applications stuck, manual intervention needed
   - **Mitigation:** Add retry logic and error notifications (1 day)

### Low Risk ℹ️
5. **Performance concerns** - AI processing may take too long
   - **Impact:** Perceived slowness, but doesn't break functionality
   - **Mitigation:** Add progress indicators, optimize API calls

---

## 7. Next Steps

### Immediate Actions (This Week)
1. ✅ Create this gap analysis document
2. ❌ **Implement AI service domain consumer** (Priority 1)
3. ❌ **Decide on ATS stage sync approach** (Priority 1)
4. ❌ **Test end-to-end flow manually** (Priority 2)

### Short Term (Next Week)
5. ❌ Update notification service event handling
6. ❌ Verify email templates exist and are correct
7. ❌ Add error handling and retry logic
8. ❌ Write integration tests

### Medium Term (Next Sprint)
9. ❌ Add performance monitoring
10. ❌ Optimize AI processing (parallel document fetch, caching)
11. ❌ Update documentation
12. ❌ User acceptance testing

---

## 8. Success Criteria

The AI-assisted application flow is considered **complete and production-ready** when:

✅ **Automated Processing**
- [ ] Applications automatically move from `draft` to `ai_review` when submitted
- [ ] AI service automatically processes `ai_review` applications without manual trigger
- [ ] Applications automatically move to `screen` (represented) or `submitted` (direct) after AI review

✅ **Notifications**
- [ ] Candidates receive email when AI review starts
- [ ] Candidates receive email when AI review completes with fit score
- [ ] Recruiters receive email when represented candidate is ready for screen
- [ ] Companies receive email when direct candidate application is submitted

✅ **Error Handling**
- [ ] Failed AI reviews publish `ai_review.failed` events
- [ ] Users receive notification when AI review fails
- [ ] Applications can be manually retried after failure

✅ **Performance**
- [ ] AI review completes in < 30 seconds (p95)
- [ ] No applications stuck in `ai_review` for > 5 minutes
- [ ] RabbitMQ queue depths remain < 100 messages

✅ **Testing**
- [ ] End-to-end tests pass for direct and represented flows
- [ ] Error scenarios tested and handled
- [ ] Load testing shows system can handle 100+ concurrent reviews

---

## Appendix A: Event Schemas

### application.stage_changed (from ATS)
```typescript
{
    event_type: 'application.stage_changed',
    payload: {
        application_id: string,
        job_id: string,
        candidate_id: string,
        recruiter_id: string | null,
        company_id: string,
        old_stage: ApplicationStage,
        new_stage: ApplicationStage,
        changed_by: string,  // Clerk user ID or 'system'
        timestamp: string,
    }
}
```

### application.stage_changed (from AI)
```typescript
{
    event_type: 'application.stage_changed',
    payload: {
        application_id: string,
        job_id: string,
        candidate_id: string,
        company_id: string,
        old_stage: 'ai_review',
        new_stage: 'screen' | 'submitted',
        changed_by: 'ai_service',
        ai_review_id: string,
        fit_score: number,
        recommendation: string,
        processing_time_ms: number,
        timestamp: string,
    }
}
```

### ai_review.failed
```typescript
{
    event_type: 'ai_review.failed',
    payload: {
        application_id: string,
        candidate_id: string,
        job_id: string,
        error: string,
        timestamp: string,
    }
}
```

---

**Document End**
