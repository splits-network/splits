# Recruiter Proposal Response Wizard - Implementation Guide

**Document:** Candidate Response to Recruiter-Proposed Job Opportunities  
**Created:** December 29, 2025  
**Status:** Implementation Guide  
**Priority:** Critical - Phase 1 Enhancement  
**Related Documents:**
- [`docs/business-logic/recruiter-submission-flow.md`](../business-logic/recruiter-submission-flow.md) - Business logic and flow
- [`docs/guidance/wizard-pattern.md`](wizard-pattern.md) - Multi-step wizard pattern
- [`docs/guidance/form-controls.md`](form-controls.md) - Form implementation standards

---

## Overview

This document provides a comprehensive technical implementation guide for the candidate-facing wizard that allows candidates to respond to job opportunities sent by recruiters. When a recruiter sends a job opportunity to a candidate, the application is created in the `recruiter_proposed` stage. This wizard enables candidates to either accept (and complete the application) or decline the opportunity.

**Key Principle:** Even with an active "Right to Represent" agreement, candidates must approve each specific job opportunity and provide job-specific application materials.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Architecture Overview](#architecture-overview)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [User Experience Flow](#user-experience-flow)
6. [Testing Strategy](#testing-strategy)
7. [Implementation Checklist](#implementation-checklist)

---

## Current State Analysis

### What Already Exists

✅ **Backend:**
- `POST /applications/propose-to-candidate` - Creates application in `recruiter_proposed` stage
- `GET /applications/:id/full` - Fetches complete application data with enriched job/company/recruiter info
- `ApplicationStage` type includes `recruiter_proposed` stage
- Audit log actions defined: `recruiter_proposed_job`, `candidate_approved_opportunity`, `candidate_declined_opportunity`
- Application model includes `recruiter_notes` field for recruiter's pitch

✅ **Frontend:**
- Application detail page (`apps/candidate/src/app/(authenticated)/applications/[id]/page.tsx`)
- Displays job details, company info, recruiter info
- Shows application status badge
- Breadcrumb navigation

### What's Missing

❌ **Backend:**
- `POST /applications/:id/accept-proposal` - Accepts proposal, moves to `draft`, returns pre-screen questions
- `POST /applications/:id/decline-proposal` - Declines proposal, moves to `rejected`, captures reason
- `PATCH /applications/:id/complete` - Completes application with documents/answers, triggers AI review

❌ **Frontend:**
- Detection of `recruiter_proposed` stage on detail page
- Alert banner showing recruiter's pitch with accept/decline options
- Decline modal with reason capture
- Multi-step wizard for completing application:
  - Document upload (resume, cover letter)
  - Pre-screen question answering
  - Notes entry
  - Review and submit
- Document upload component (reusable)

---

## Architecture Overview

### Application Stage Flow

```
recruiter_proposed (recruiter sends job)
    ↓
    [Candidate Decision]
    ↓
    ├─→ rejected (candidate declines)
    │   └─→ [ARCHIVED - No further action]
    │
    └─→ draft (candidate accepts)
        ↓
        [Candidate completes application in wizard]
        ↓
        ai_review (AI analyzes fit)
        ↓
        screen (recruiter reviews)
        ↓
        submitted (recruiter submits to company)
        ↓
        ... (rest of flow continues)
```

### Wizard Pattern

Following the canonical pattern from [`wizard-pattern.md`](wizard-pattern.md):

**Step 1: Upload Documents**
- Resume upload (required)
- Cover letter upload (optional)
- Select primary resume
- View uploaded documents

**Step 2: Answer Pre-Screen Questions**
- Dynamic form based on job's `pre_screen_questions`
- Support for multiple question types:
  - `text` - Free text input
  - `yes_no` - Boolean radio buttons
  - `select` - Single choice dropdown
  - `multi_select` - Multiple choice checkboxes
- Mark required questions
- Validation before proceeding

**Step 3: Add Notes**
- Personal notes text area
- Why you're interested in this role
- Any additional context for recruiter

**Step 4: Review & Submit**
- Summary of all uploaded documents
- Review all answers
- Review notes
- Submit button triggers completion

### Progressive Data Loading

- **Initial Load:** Application, job, company, recruiter (already loaded on detail page)
- **On Accept:** Fetch pre-screen questions from backend
- **On Upload:** Documents uploaded to document service, IDs returned
- **On Submit:** Send complete application data to backend

---

## Backend Implementation

### File Locations

```
services/ats-service/
├── src/
│   ├── routes/
│   │   └── applications/
│   │       └── routes.ts              [MODIFY] - Add 3 new endpoints
│   ├── service.ts                      [MODIFY] - Add business logic methods
│   └── repository.ts                   [MODIFY] - Add data layer methods
```

### Endpoint 1: Accept Proposal

**Purpose:** Candidate accepts recruiter's job proposal, moving application to `draft` stage.

```typescript
// POST /applications/:id/accept-proposal

// Request
Headers:
  Authorization: Bearer <token>
  x-clerk-user-id: <clerk_user_id>

// Response (200 OK)
{
  data: {
    application: Application,  // stage = 'draft'
    next_steps: {
      pre_screen_questions: JobPreScreenQuestion[],
      requires_documents: boolean
    }
  }
}

// Error Responses
400 Bad Request - Invalid application ID
403 Forbidden - Not the candidate for this application
404 Not Found - Application not found
409 Conflict - Application not in 'recruiter_proposed' stage
```

**Implementation:**

```typescript
// services/ats-service/src/routes/applications/routes.ts

app.post(
    '/applications/:id/accept-proposal',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const correlationId = (request as any).correlationId;
        
        if (!clerkUserId) {
            throw new BadRequestError('User authentication required');
        }
        
        // Look up candidate by Clerk user ID
        const candidate = await repository.findCandidateByClerkUserId(clerkUserId);
        if (!candidate) {
            return reply.status(404).send({ 
                error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate profile not found' } 
            });
        }
        
        // Get application and verify ownership
        const application = await service.getApplicationById(request.params.id);
        if (application.candidate_id !== candidate.id) {
            return reply.status(403).send({
                error: { code: 'FORBIDDEN', message: 'Not authorized for this application' }
            });
        }
        
        // Verify stage
        if (application.stage !== 'recruiter_proposed') {
            return reply.status(409).send({
                error: { code: 'INVALID_STAGE', message: 'Application is not in recruiter_proposed stage' }
            });
        }
        
        // Accept proposal (changes stage to draft)
        const result = await service.acceptRecruiterProposal({
            applicationId: request.params.id,
            candidateId: candidate.id,
            candidateUserId: clerkUserId,
        });
        
        request.log.info({
            applicationId: request.params.id,
            candidateId: candidate.id,
            jobId: application.job_id,
        }, 'Candidate accepted recruiter proposal');
        
        return reply.send(result);
    }
);
```

**Service Method:**

```typescript
// services/ats-service/src/service.ts

async acceptRecruiterProposal(params: {
    applicationId: string;
    candidateId: string;
    candidateUserId: string;
}): Promise<{
    application: Application;
    next_steps: {
        pre_screen_questions: JobPreScreenQuestion[];
        requires_documents: boolean;
    };
}> {
    const { applicationId, candidateId, candidateUserId } = params;
    
    // Update application stage to draft
    const application = await this.repository.updateApplicationStage(
        applicationId,
        'draft'
    );
    
    // Resolve identity user for audit log
    const identityUser = await this.repository.findUserByClerkUserId(candidateUserId);
    
    // Create audit log entry
    await this.repository.createApplicationAuditLog({
        application_id: applicationId,
        action: 'candidate_approved_opportunity',
        performed_by_user_id: identityUser?.id,
        performed_by_role: 'candidate',
        old_value: { stage: 'recruiter_proposed' },
        new_value: { stage: 'draft' },
        metadata: {
            candidate_id: candidateId,
        },
    });
    
    // Publish event for notification service
    await this.eventPublisher.publish('application.candidate_approved', {
        application_id: applicationId,
        candidate_id: candidateId,
        job_id: application.job_id,
        recruiter_id: application.recruiter_id,
        approved_at: new Date().toISOString(),
    });
    
    // Fetch pre-screen questions for the job
    const questions = await this.getPreScreenQuestionsForJob(application.job_id);
    
    return {
        application,
        next_steps: {
            pre_screen_questions: questions,
            requires_documents: true,
        },
    };
}
```

---

### Endpoint 2: Decline Proposal

**Purpose:** Candidate declines recruiter's job proposal, archiving the application.

```typescript
// POST /applications/:id/decline-proposal

// Request
Headers:
  Authorization: Bearer <token>
  x-clerk-user-id: <clerk_user_id>

Body:
{
  reason: string,      // Required: dropdown selection
  details?: string     // Optional: additional context
}

// Response (200 OK)
{
  data: {
    application: Application,  // stage = 'rejected'
    message: "Opportunity declined successfully"
  }
}

// Error Responses
400 Bad Request - Missing required fields or invalid application ID
403 Forbidden - Not the candidate for this application
404 Not Found - Application not found
409 Conflict - Application not in 'recruiter_proposed' stage
```

**Decline Reasons (Frontend Dropdown):**
- Not interested in role
- Not interested in company
- Salary/compensation concerns
- Location not suitable
- Already accepted another position
- Other

**Implementation:**

```typescript
// services/ats-service/src/routes/applications/routes.ts

app.post(
    '/applications/:id/decline-proposal',
    async (request: FastifyRequest<{
        Params: { id: string };
        Body: { reason: string; details?: string };
    }>, reply: FastifyReply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { reason, details } = request.body;
        
        if (!clerkUserId) {
            throw new BadRequestError('User authentication required');
        }
        
        if (!reason) {
            throw new BadRequestError('Decline reason is required');
        }
        
        // Look up candidate by Clerk user ID
        const candidate = await repository.findCandidateByClerkUserId(clerkUserId);
        if (!candidate) {
            return reply.status(404).send({ 
                error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate profile not found' } 
            });
        }
        
        // Get application and verify ownership
        const application = await service.getApplicationById(request.params.id);
        if (application.candidate_id !== candidate.id) {
            return reply.status(403).send({
                error: { code: 'FORBIDDEN', message: 'Not authorized for this application' }
            });
        }
        
        // Verify stage
        if (application.stage !== 'recruiter_proposed') {
            return reply.status(409).send({
                error: { code: 'INVALID_STAGE', message: 'Application is not in recruiter_proposed stage' }
            });
        }
        
        // Decline proposal
        const result = await service.declineRecruiterProposal({
            applicationId: request.params.id,
            candidateId: candidate.id,
            candidateUserId: clerkUserId,
            reason,
            details,
        });
        
        request.log.info({
            applicationId: request.params.id,
            candidateId: candidate.id,
            jobId: application.job_id,
            reason,
        }, 'Candidate declined recruiter proposal');
        
        return reply.send(result);
    }
);
```

**Service Method:**

```typescript
// services/ats-service/src/service.ts

async declineRecruiterProposal(params: {
    applicationId: string;
    candidateId: string;
    candidateUserId: string;
    reason: string;
    details?: string;
}): Promise<{
    application: Application;
    message: string;
}> {
    const { applicationId, candidateId, candidateUserId, reason, details } = params;
    
    // Update application stage to rejected
    const application = await this.repository.updateApplicationStage(
        applicationId,
        'rejected'
    );
    
    // Resolve identity user for audit log
    const identityUser = await this.repository.findUserByClerkUserId(candidateUserId);
    
    // Create audit log entry with decline reason
    await this.repository.createApplicationAuditLog({
        application_id: applicationId,
        action: 'candidate_declined_opportunity',
        performed_by_user_id: identityUser?.id,
        performed_by_role: 'candidate',
        old_value: { stage: 'recruiter_proposed' },
        new_value: { stage: 'rejected' },
        metadata: {
            candidate_id: candidateId,
            decline_reason: reason,
            decline_details: details,
            declined_at: new Date().toISOString(),
        },
    });
    
    // Publish event for notification service (notify recruiter)
    await this.eventPublisher.publish('application.candidate_declined', {
        application_id: applicationId,
        candidate_id: candidateId,
        job_id: application.job_id,
        recruiter_id: application.recruiter_id,
        decline_reason: reason,
        decline_details: details,
        declined_at: new Date().toISOString(),
    });
    
    return {
        application,
        message: 'Opportunity declined successfully',
    };
}
```

---

### Endpoint 3: Complete Application

**Purpose:** Candidate completes application with documents, answers, and notes. Triggers AI review.

```typescript
// PATCH /applications/:id/complete

// Request
Headers:
  Authorization: Bearer <token>
  x-clerk-user-id: <clerk_user_id>

Body:
{
  document_ids: string[],           // Required: List of document IDs
  primary_resume_id: string,        // Required: Primary resume document ID
  pre_screen_answers: Array<{       // Optional: Answers to pre-screen questions
    question_id: string,
    answer: string | string[]       // String for text/yes_no/select, array for multi_select
  }>,
  notes?: string                    // Optional: Candidate notes
}

// Response (200 OK)
{
  data: {
    application: Application,       // stage = 'ai_review'
    ai_review_initiated: boolean
  }
}

// Error Responses
400 Bad Request - Missing required fields or invalid data
403 Forbidden - Not the candidate for this application
404 Not Found - Application not found
409 Conflict - Application not in 'draft' stage
```

**Implementation:**

```typescript
// services/ats-service/src/routes/applications/routes.ts

app.patch(
    '/applications/:id/complete',
    async (request: FastifyRequest<{
        Params: { id: string };
        Body: {
            document_ids: string[];
            primary_resume_id: string;
            pre_screen_answers?: Array<{ question_id: string; answer: any }>;
            notes?: string;
        };
    }>, reply: FastifyReply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { document_ids, primary_resume_id, pre_screen_answers, notes } = request.body;
        
        if (!clerkUserId) {
            throw new BadRequestError('User authentication required');
        }
        
        if (!document_ids || document_ids.length === 0 || !primary_resume_id) {
            throw new BadRequestError('document_ids and primary_resume_id are required');
        }
        
        // Look up candidate by Clerk user ID
        const candidate = await repository.findCandidateByClerkUserId(clerkUserId);
        if (!candidate) {
            return reply.status(404).send({ 
                error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate profile not found' } 
            });
        }
        
        // Get application and verify ownership
        const application = await service.getApplicationById(request.params.id);
        if (application.candidate_id !== candidate.id) {
            return reply.status(403).send({
                error: { code: 'FORBIDDEN', message: 'Not authorized for this application' }
            });
        }
        
        // Verify stage (must be draft)
        if (application.stage !== 'draft') {
            return reply.status(409).send({
                error: { code: 'INVALID_STAGE', message: 'Application must be in draft stage to complete' }
            });
        }
        
        // Complete application
        const result = await service.completeCandidateApplication({
            applicationId: request.params.id,
            candidateId: candidate.id,
            candidateUserId: clerkUserId,
            documentIds: document_ids,
            primaryResumeId: primary_resume_id,
            preScreenAnswers: pre_screen_answers,
            notes,
        });
        
        request.log.info({
            applicationId: request.params.id,
            candidateId: candidate.id,
            jobId: application.job_id,
            documentsCount: document_ids.length,
            hasAnswers: !!pre_screen_answers,
        }, 'Candidate completed application');
        
        return reply.send(result);
    }
);
```

**Service Method:**

```typescript
// services/ats-service/src/service.ts

async completeCandidateApplication(params: {
    applicationId: string;
    candidateId: string;
    candidateUserId: string;
    documentIds: string[];
    primaryResumeId: string;
    preScreenAnswers?: Array<{ question_id: string; answer: any }>;
    notes?: string;
}): Promise<{
    application: Application;
    ai_review_initiated: boolean;
}> {
    const { 
        applicationId, 
        candidateId, 
        candidateUserId, 
        documentIds, 
        primaryResumeId, 
        preScreenAnswers, 
        notes 
    } = params;
    
    // 1. Link documents to application
    await this.repository.linkDocumentsToApplication(applicationId, documentIds, primaryResumeId);
    
    // 2. Save pre-screen answers (if any)
    if (preScreenAnswers && preScreenAnswers.length > 0) {
        await this.repository.savePreScreenAnswers(applicationId, preScreenAnswers);
    }
    
    // 3. Update notes (if provided)
    if (notes) {
        await this.repository.updateApplicationNotes(applicationId, notes);
    }
    
    // 4. Update application stage to ai_review
    const application = await this.repository.updateApplicationStage(
        applicationId,
        'ai_review'
    );
    
    // 5. Resolve identity user for audit log
    const identityUser = await this.repository.findUserByClerkUserId(candidateUserId);
    
    // 6. Create audit log entry
    await this.repository.createApplicationAuditLog({
        application_id: applicationId,
        action: 'candidate_submitted_application',
        performed_by_user_id: identityUser?.id,
        performed_by_role: 'candidate',
        old_value: { stage: 'draft' },
        new_value: { stage: 'ai_review' },
        metadata: {
            candidate_id: candidateId,
            documents_count: documentIds.length,
            has_answers: !!preScreenAnswers,
            submitted_at: new Date().toISOString(),
        },
    });
    
    // 7. Trigger AI review (async)
    const aiReviewInitiated = await this.initiateAIReview(applicationId);
    
    // 8. Publish event (will notify recruiter after AI review completes)
    await this.eventPublisher.publish('application.submitted_for_recruiter_review', {
        application_id: applicationId,
        candidate_id: candidateId,
        job_id: application.job_id,
        recruiter_id: application.recruiter_id,
        submitted_at: new Date().toISOString(),
    });
    
    return {
        application,
        ai_review_initiated: aiReviewInitiated,
    };
}
```

---

### API Gateway Routes

All three new endpoints need to be registered in the API Gateway with proper RBAC.

```typescript
// services/api-gateway/src/index.ts (or routes file)

// Accept proposal - Candidate only
app.post('/api/applications/:id/accept-proposal', {
    preHandler: requireRoles(['candidate'], services),
}, async (request, reply) => {
    return atsService().post(`/applications/${request.params.id}/accept-proposal`, {
        headers: {
            'x-clerk-user-id': request.auth.clerkUserId,
            'x-user-role': 'candidate',
        },
    });
});

// Decline proposal - Candidate only
app.post('/api/applications/:id/decline-proposal', {
    preHandler: requireRoles(['candidate'], services),
}, async (request, reply) => {
    return atsService().post(`/applications/${request.params.id}/decline-proposal`, {
        headers: {
            'x-clerk-user-id': request.auth.clerkUserId,
            'x-user-role': 'candidate',
        },
        body: request.body,
    });
});

// Complete application - Candidate only
app.patch('/api/applications/:id/complete', {
    preHandler: requireRoles(['candidate'], services),
}, async (request, reply) => {
    return atsService().patch(`/applications/${request.params.id}/complete`, {
        headers: {
            'x-clerk-user-id': request.auth.clerkUserId,
            'x-user-role': 'candidate',
        },
        body: request.body,
    });
});
```

---

## Frontend Implementation

### File Structure

```
apps/candidate/src/
├── app/(authenticated)/applications/[id]/
│   ├── page.tsx                                    [MODIFY]
│   └── components/
│       ├── proposal-alert.tsx                      [CREATE]
│       ├── decline-modal.tsx                       [CREATE]
│       ├── proposal-response-wizard.tsx            [CREATE]
│       └── wizard-steps/
│           ├── upload-documents-step.tsx           [CREATE]
│           ├── answer-questions-step.tsx           [CREATE]
│           ├── add-notes-step.tsx                  [CREATE]
│           └── review-submit-step.tsx              [CREATE]
├── components/
│   └── document-uploader.tsx                       [CREATE]
└── lib/
    └── api-client.ts                               [VERIFY]
```

---

### 1. Modify Application Detail Page

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/page.tsx`

**Changes:**
1. Add import for new components
2. Add state management for wizard/modal visibility
3. Add conditional rendering of `ProposalAlert` when `stage === 'recruiter_proposed'`
4. Add modal components at end of page

**Implementation:**

```typescript
// At top of file, add imports
'use client';  // Convert to client component

import { useState } from 'react';
import ProposalAlert from './components/proposal-alert';
import DeclineModal from './components/decline-modal';
import ProposalResponseWizard from './components/proposal-response-wizard';

// Inside component, add state
const [showWizard, setShowWizard] = useState(false);
const [showDeclineModal, setShowDeclineModal] = useState(false);

// After breadcrumbs, before header
{application.stage === 'recruiter_proposed' && (
    <ProposalAlert
        application={application}
        job={job}
        company={company}
        recruiter={recruiter}
        onAccept={() => setShowWizard(true)}
        onDecline={() => setShowDeclineModal(true)}
    />
)}

// At end of component, before closing </div>
{showWizard && (
    <ProposalResponseWizard
        applicationId={application.id}
        job={job}
        onClose={() => setShowWizard(false)}
        onComplete={() => {
            setShowWizard(false);
            window.location.reload(); // Refresh to show updated state
        }}
    />
)}

{showDeclineModal && (
    <DeclineModal
        applicationId={application.id}
        jobTitle={job.title}
        onClose={() => setShowDeclineModal(false)}
        onComplete={() => {
            setShowDeclineModal(false);
            window.location.href = '/applications'; // Navigate away
        }}
    />
)}
```

**Note:** Page needs to be converted from server component to client component since we're adding state management.

---

### 2. ProposalAlert Component

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/proposal-alert.tsx`

```tsx
'use client';

interface Props {
    application: any;
    job: any;
    company: any;
    recruiter: any;
    onAccept: () => void;
    onDecline: () => void;
}

export default function ProposalAlert({ 
    application, 
    job, 
    company, 
    recruiter, 
    onAccept, 
    onDecline 
}: Props) {
    return (
        <div className="alert alert-info mb-6 shadow-lg">
            <div className="flex-1">
                <i className="fa-solid fa-envelope-open-text text-3xl"></i>
                <div>
                    <h3 className="font-bold text-lg mb-1">
                        Job Opportunity from {recruiter.first_name} {recruiter.last_name}
                    </h3>
                    <p className="text-sm">
                        {recruiter.first_name} thinks you'd be a great fit for 
                        <strong> {job.title}</strong> at <strong>{company.name}</strong>.
                    </p>
                    
                    {application.recruiter_notes && (
                        <div className="mt-3 p-4 bg-base-100 rounded-lg border border-base-300">
                            <div className="flex items-start gap-2">
                                <i className="fa-solid fa-quote-left text-primary mt-1"></i>
                                <div className="flex-1">
                                    <div className="text-xs text-base-content/60 mb-1">
                                        Why {recruiter.first_name} thinks this is a good match:
                                    </div>
                                    <p className="whitespace-pre-wrap">{application.recruiter_notes}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-none flex flex-col sm:flex-row gap-2">
                <button 
                    onClick={onDecline} 
                    className="btn btn-ghost gap-2"
                >
                    <i className="fa-solid fa-times"></i>
                    Not Interested
                </button>
                <button 
                    onClick={onAccept} 
                    className="btn btn-primary gap-2"
                >
                    <i className="fa-solid fa-check"></i>
                    Accept & Apply
                </button>
            </div>
        </div>
    );
}
```

---

### 3. DeclineModal Component

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/decline-modal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

interface Props {
    applicationId: string;
    jobTitle: string;
    onClose: () => void;
    onComplete: () => void;
}

export default function DeclineModal({ 
    applicationId, 
    jobTitle, 
    onClose, 
    onComplete 
}: Props) {
    const { getToken } = useAuth();
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const reasons = [
        'Not interested in role',
        'Not interested in company',
        'Salary/compensation concerns',
        'Location not suitable',
        'Already accepted another position',
        'Other',
    ];
    
    const handleSubmit = async () => {
        if (!reason) {
            setError('Please select a reason');
            return;
        }
        
        setSubmitting(true);
        setError(null);
        
        try {
            const token = await getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            
            await axios.post(
                `${apiUrl}/applications/${applicationId}/decline-proposal`,
                {
                    reason,
                    details: details.trim() || undefined,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            onComplete();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to decline opportunity');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Decline Job Opportunity</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                <div className="alert mb-4">
                    <i className="fa-solid fa-info-circle"></i>
                    <span>
                        Are you sure you want to decline <strong>{jobTitle}</strong>? 
                        Your recruiter will be notified of your decision.
                    </span>
                </div>
                
                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}
                
                <div className="space-y-4">
                    <div className="fieldset">
                        <label className="label">Reason for declining *</label>
                        <select
                            className="select w-full"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            <option value="">Select a reason...</option>
                            {reasons.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="fieldset">
                        <label className="label">Additional details (optional)</label>
                        <textarea
                            className="textarea h-24 w-full"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Any additional context you'd like to share..."
                        />
                        <label className="label">
                            <span className="label-text-alt">
                                This will be shared with your recruiter to help them understand your preferences.
                            </span>
                        </label>
                    </div>
                </div>
                
                <div className="modal-action">
                    <button 
                        onClick={onClose} 
                        className="btn btn-ghost"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="btn btn-error gap-2"
                        disabled={submitting || !reason}
                    >
                        {submitting && <span className="loading loading-spinner loading-sm"></span>}
                        {submitting ? 'Declining...' : 'Decline Opportunity'}
                    </button>
                </div>
            </div>
        </div>
    );
}
```

---

### 4. ProposalResponseWizard Component

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/proposal-response-wizard.tsx`

This is the main wizard component following the pattern from [`wizard-pattern.md`](wizard-pattern.md).

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import axios from 'axios';
import UploadDocumentsStep from './wizard-steps/upload-documents-step';
import AnswerQuestionsStep from './wizard-steps/answer-questions-step';
import AddNotesStep from './wizard-steps/add-notes-step';
import ReviewSubmitStep from './wizard-steps/review-submit-step';

interface Props {
    applicationId: string;
    job: any;
    onClose: () => void;
    onComplete: () => void;
}

export default function ProposalResponseWizard({ 
    applicationId, 
    job, 
    onClose, 
    onComplete 
}: Props) {
    const { getToken } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Accepting proposal state
    const [accepting, setAccepting] = useState(true);
    
    // Step 1: Documents
    const [documents, setDocuments] = useState<any[]>([]);
    const [primaryResumeId, setPrimaryResumeId] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    
    // Step 2: Pre-screen questions
    const [questions, setQuestions] = useState<any[]>([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    
    // Step 3: Notes
    const [notes, setNotes] = useState('');
    
    // Accept proposal when wizard opens
    useEffect(() => {
        acceptProposal();
    }, []);
    
    const acceptProposal = async () => {
        try {
            const token = await getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            
            const response = await axios.post(
                `${apiUrl}/applications/${applicationId}/accept-proposal`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            // Load pre-screen questions
            if (response.data.next_steps?.pre_screen_questions) {
                setQuestions(response.data.next_steps.pre_screen_questions);
            }
            
            setAccepting(false);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to accept proposal');
            setAccepting(false);
        }
    };
    
    // Navigation handlers
    const handleNext = () => {
        // Step 1 validation: Must have primary resume
        if (currentStep === 1 && !primaryResumeId) {
            setError('Please upload and select a primary resume before continuing');
            return;
        }
        
        // Step 2 validation: Required questions must be answered
        if (currentStep === 2 && questions.length > 0) {
            const requiredQuestions = questions.filter(q => q.is_required);
            const missingAnswers = requiredQuestions.filter(q => !answers[q.id] || answers[q.id] === '');
            
            if (missingAnswers.length > 0) {
                setError('Please answer all required questions before continuing');
                return;
            }
        }
        
        setError(null);
        setCurrentStep(currentStep + 1);
    };
    
    const handleBack = () => {
        setError(null);
        setCurrentStep(currentStep - 1);
    };
    
    const handleSubmit = async () => {
        if (!primaryResumeId) {
            setError('Primary resume is required');
            return;
        }
        
        setSubmitting(true);
        setError(null);
        
        try {
            const token = await getToken();
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            
            await axios.patch(
                `${apiUrl}/applications/${applicationId}/complete`,
                {
                    document_ids: documents.map(d => d.id),
                    primary_resume_id: primaryResumeId,
                    pre_screen_answers: Object.entries(answers).map(([questionId, answer]) => ({
                        question_id: questionId,
                        answer,
                    })),
                    notes: notes.trim() || undefined,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            onComplete();
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Failed to submit application');
        } finally {
            setSubmitting(false);
        }
    };
    
    // Show loading while accepting proposal
    if (accepting) {
        return (
            <div className="modal modal-open">
                <div className="modal-box">
                    <div className="flex flex-col items-center justify-center py-8">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4 text-lg">Accepting opportunity...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-base-300">
                    <div>
                        <h2 className="text-2xl font-bold">Complete Your Application</h2>
                        <p className="text-base-content/70 mt-1">{job.title}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={submitting}
                    >
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>
                
                {/* Progress Steps */}
                <div className="steps w-full mt-4">
                    <div className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>
                        Documents
                    </div>
                    <div className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>
                        Questions
                    </div>
                    <div className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>
                        Notes
                    </div>
                    <div className={`step ${currentStep >= 4 ? 'step-primary' : ''}`}>
                        Review
                    </div>
                </div>
                
                {/* Error Display */}
                {error && (
                    <div className="alert alert-error mt-4">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}
                
                {/* Content Area - Scrollable */}
                <div className="flex-1 overflow-y-auto py-6">
                    {currentStep === 1 && (
                        <UploadDocumentsStep
                            documents={documents}
                            setDocuments={setDocuments}
                            primaryResumeId={primaryResumeId}
                            setPrimaryResumeId={setPrimaryResumeId}
                            uploading={uploading}
                            setUploading={setUploading}
                        />
                    )}
                    {currentStep === 2 && (
                        <AnswerQuestionsStep
                            questions={questions}
                            answers={answers}
                            setAnswers={setAnswers}
                        />
                    )}
                    {currentStep === 3 && (
                        <AddNotesStep
                            notes={notes}
                            setNotes={setNotes}
                            job={job}
                        />
                    )}
                    {currentStep === 4 && (
                        <ReviewSubmitStep
                            documents={documents}
                            primaryResumeId={primaryResumeId}
                            questions={questions}
                            answers={answers}
                            notes={notes}
                        />
                    )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-base-300">
                    <button 
                        onClick={onClose} 
                        className="btn btn-ghost"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <div className="flex gap-2">
                        {currentStep > 1 && (
                            <button 
                                onClick={handleBack} 
                                className="btn btn-ghost gap-2"
                                disabled={submitting}
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                                Back
                            </button>
                        )}
                        {currentStep < 4 && (
                            <button 
                                onClick={handleNext} 
                                className="btn btn-primary gap-2"
                                disabled={currentStep === 1 && !primaryResumeId}
                            >
                                Next
                                <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        )}
                        {currentStep === 4 && (
                            <button 
                                onClick={handleSubmit} 
                                className="btn btn-primary gap-2"
                                disabled={submitting}
                            >
                                {submitting && <span className="loading loading-spinner loading-sm"></span>}
                                {submitting ? 'Submitting...' : 'Submit Application'}
                                {!submitting && <i className="fa-solid fa-paper-plane"></i>}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
```

---

### 5. Wizard Step Components

Due to length, I'll provide the interface/structure for each step. Full implementations would follow the patterns from `wizard-pattern.md`.

#### Step 1: Upload Documents

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/wizard-steps/upload-documents-step.tsx`

```tsx
interface Props {
    documents: any[];
    setDocuments: (docs: any[]) => void;
    primaryResumeId: string;
    setPrimaryResumeId: (id: string) => void;
    uploading: boolean;
    setUploading: (uploading: boolean) => void;
}

export default function UploadDocumentsStep({ ... }: Props) {
    // Document upload logic
    // Display uploaded documents
    // Radio buttons to select primary resume
    // Upload new document button
}
```

#### Step 2: Answer Questions

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/wizard-steps/answer-questions-step.tsx`

```tsx
interface Props {
    questions: any[];
    answers: Record<string, any>;
    setAnswers: (answers: Record<string, any>) => void;
}

export default function AnswerQuestionsStep({ ... }: Props) {
    // Dynamic form based on question types
    // text -> textarea
    // yes_no -> radio buttons
    // select -> dropdown
    // multi_select -> checkboxes
    // Mark required fields with *
}
```

#### Step 3: Add Notes

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/wizard-steps/add-notes-step.tsx`

```tsx
interface Props {
    notes: string;
    setNotes: (notes: string) => void;
    job: any;
}

export default function AddNotesStep({ ... }: Props) {
    // Large textarea for notes
    // Helper text about what to include
    // Character counter
}
```

#### Step 4: Review & Submit

**File:** `apps/candidate/src/app/(authenticated)/applications/[id]/components/wizard-steps/review-submit-step.tsx`

```tsx
interface Props {
    documents: any[];
    primaryResumeId: string;
    questions: any[];
    answers: Record<string, any>;
    notes: string;
}

export default function ReviewSubmitStep({ ... }: Props) {
    // Summary of all uploaded documents
    // Review all answers to questions
    // Display notes
    // Final confirmation message
}
```

---

## User Experience Flow

### Happy Path: Candidate Accepts

1. **Candidate receives email notification** (from notification service)
   - "New job opportunity from [Recruiter Name]"
   - Link to application detail page

2. **Candidate views application detail page**
   - Page loads with `stage === 'recruiter_proposed'`
   - `ProposalAlert` banner appears at top
   - Shows recruiter's name and pitch
   - Two buttons: "Accept & Apply" | "Not Interested"

3. **Candidate clicks "Accept & Apply"**
   - `ProposalResponseWizard` modal opens
   - Shows loading spinner: "Accepting opportunity..."
   - Backend: `POST /applications/:id/accept-proposal`
   - Application stage changes: `recruiter_proposed` → `draft`
   - Pre-screen questions loaded
   - Wizard shows Step 1: Upload Documents

4. **Step 1: Upload Documents**
   - Candidate uploads resume (required)
   - Candidate uploads cover letter (optional)
   - Candidate selects primary resume via radio button
   - "Next" button enabled only when primary resume selected

5. **Step 2: Answer Pre-Screen Questions**
   - Dynamic form based on job's questions
   - Required questions marked with *
   - Validation prevents proceeding without answering required questions
   - "Next" button enabled when all required questions answered

6. **Step 3: Add Notes**
   - Candidate adds personal notes
   - Why they're interested in the role
   - Any relevant context
   - "Next" button always enabled (notes optional)

7. **Step 4: Review & Submit**
   - Summary of all documents (with primary badge)
   - Review all answers
   - Review notes
   - "Submit Application" button

8. **Candidate clicks "Submit Application"**
   - Button shows loading spinner: "Submitting..."
   - Backend: `PATCH /applications/:id/complete`
   - Application stage changes: `draft` → `ai_review`
   - AI review triggered (async)
   - Success: Modal closes, page refreshes
   - Application now shows "AI Review" stage

9. **Post-submission**
   - AI completes review (~30 seconds)
   - Application stage changes: `ai_review` → `screen`
   - Recruiter notified: "Candidate completed application"
   - Candidate can view AI review results on detail page

### Alternate Path: Candidate Declines

1. **Candidate views application detail page**
   - `ProposalAlert` banner appears
   - Candidate clicks "Not Interested"

2. **DeclineModal opens**
   - Confirmation message
   - Dropdown: "Reason for declining"
   - Textarea: "Additional details" (optional)
   - "Cancel" and "Decline Opportunity" buttons

3. **Candidate selects reason and clicks "Decline Opportunity"**
   - Button shows loading spinner: "Declining..."
   - Backend: `POST /applications/:id/decline-proposal`
   - Application stage changes: `recruiter_proposed` → `rejected`
   - Audit log created with decline reason
   - Event published to notify recruiter
   - Success: Modal closes, redirects to `/applications` list

4. **Post-decline**
   - Application archived (visible in history)
   - Recruiter receives notification with decline reason
   - Recruiter-candidate relationship remains intact

---

## Testing Strategy

### Backend Tests

#### Unit Tests

```typescript
// services/ats-service/src/service.test.ts

describe('AtsService - Proposal Response', () => {
    describe('acceptRecruiterProposal', () => {
        it('should change stage from recruiter_proposed to draft', async () => {
            // Test stage transition
        });
        
        it('should create audit log entry', async () => {
            // Test audit log creation
        });
        
        it('should publish candidate_approved event', async () => {
            // Test event publishing
        });
        
        it('should return pre-screen questions', async () => {
            // Test questions are returned
        });
        
        it('should throw error if not in recruiter_proposed stage', async () => {
            // Test invalid stage handling
        });
    });
    
    describe('declineRecruiterProposal', () => {
        it('should change stage from recruiter_proposed to rejected', async () => {
            // Test stage transition
        });
        
        it('should store decline reason in audit log', async () => {
            // Test reason storage
        });
        
        it('should publish candidate_declined event', async () => {
            // Test event publishing
        });
    });
    
    describe('completeCandidateApplication', () => {
        it('should link documents to application', async () => {
            // Test document linking
        });
        
        it('should save pre-screen answers', async () => {
            // Test answer storage
        });
        
        it('should change stage from draft to ai_review', async () => {
            // Test stage transition
        });
        
        it('should trigger AI review', async () => {
            // Test AI review initiation
        });
        
        it('should throw error if not in draft stage', async () => {
            // Test invalid stage handling
        });
    });
});
```

#### Integration Tests

```typescript
// services/ats-service/src/routes/applications/routes.test.ts

describe('Application Routes - Proposal Response', () => {
    describe('POST /applications/:id/accept-proposal', () => {
        it('should accept proposal for valid candidate', async () => {
            // Test successful acceptance
        });
        
        it('should return 404 if candidate not found', async () => {
            // Test missing candidate
        });
        
        it('should return 403 if not candidate\'s application', async () => {
            // Test unauthorized access
        });
        
        it('should return 409 if not in recruiter_proposed stage', async () => {
            // Test invalid stage
        });
    });
    
    describe('POST /applications/:id/decline-proposal', () => {
        it('should decline proposal with reason', async () => {
            // Test successful decline
        });
        
        it('should return 400 if reason missing', async () => {
            // Test missing required field
        });
    });
    
    describe('PATCH /applications/:id/complete', () => {
        it('should complete application with all data', async () => {
            // Test successful completion
        });
        
        it('should return 400 if documents missing', async () => {
            // Test missing required fields
        });
    });
});
```

### Frontend Tests

#### Component Tests

```typescript
// apps/candidate/src/app/(authenticated)/applications/[id]/components/proposal-alert.test.tsx

describe('ProposalAlert', () => {
    it('should render recruiter name and job title', () => {
        // Test display
    });
    
    it('should show recruiter notes if present', () => {
        // Test conditional rendering
    });
    
    it('should call onAccept when Accept button clicked', () => {
        // Test callback
    });
    
    it('should call onDecline when Decline button clicked', () => {
        // Test callback
    });
});

// apps/candidate/src/app/(authenticated)/applications/[id]/components/decline-modal.test.tsx

describe('DeclineModal', () => {
    it('should require reason selection', () => {
        // Test validation
    });
    
    it('should submit with reason and details', async () => {
        // Test submission
    });
    
    it('should show error on API failure', async () => {
        // Test error handling
    });
});

// apps/candidate/src/app/(authenticated)/applications/[id]/components/proposal-response-wizard.test.tsx

describe('ProposalResponseWizard', () => {
    it('should accept proposal on mount', async () => {
        // Test initial API call
    });
    
    it('should load pre-screen questions', async () => {
        // Test data loading
    });
    
    it('should validate primary resume before advancing', () => {
        // Test step 1 validation
    });
    
    it('should validate required questions before advancing', () => {
        // Test step 2 validation
    });
    
    it('should submit complete application', async () => {
        // Test final submission
    });
});
```

### End-to-End Tests

```typescript
// tests/e2e/candidate-proposal-response.spec.ts

describe('Candidate Proposal Response E2E', () => {
    it('should complete full acceptance flow', async () => {
        // 1. Recruiter proposes job
        // 2. Candidate views application
        // 3. Candidate accepts
        // 4. Candidate completes wizard
        // 5. Verify AI review started
    });
    
    it('should complete decline flow', async () => {
        // 1. Recruiter proposes job
        // 2. Candidate views application
        // 3. Candidate declines with reason
        // 4. Verify application rejected
        // 5. Verify recruiter notified
    });
    
    it('should handle validation errors gracefully', async () => {
        // Test various validation scenarios
    });
});
```

---

## Implementation Checklist

### Phase 1: Backend Foundation

- [ ] **Service Layer**
  - [ ] Implement `acceptRecruiterProposal()` method
  - [ ] Implement `declineRecruiterProposal()` method
  - [ ] Implement `completeCandidateApplication()` method
  - [ ] Add unit tests for all methods

- [ ] **Routes**
  - [ ] Create `POST /applications/:id/accept-proposal` endpoint
  - [ ] Create `POST /applications/:id/decline-proposal` endpoint
  - [ ] Create `PATCH /applications/:id/complete` endpoint
  - [ ] Add integration tests for all endpoints

- [ ] **Repository**
  - [ ] Add `linkDocumentsToApplication()` method
  - [ ] Add `savePreScreenAnswers()` method
  - [ ] Add `updateApplicationNotes()` method
  - [ ] Verify audit log methods exist

- [ ] **Events**
  - [ ] Verify event publisher for `application.candidate_approved`
  - [ ] Verify event publisher for `application.candidate_declined`
  - [ ] Verify event publisher for `application.submitted_for_recruiter_review`

- [ ] **API Gateway**
  - [ ] Register accept-proposal route with RBAC
  - [ ] Register decline-proposal route with RBAC
  - [ ] Register complete route with RBAC

### Phase 2: Frontend Components

- [ ] **Core Components**
  - [ ] Create `ProposalAlert` component
  - [ ] Create `DeclineModal` component
  - [ ] Create `ProposalResponseWizard` component
  - [ ] Add component tests

- [ ] **Wizard Steps**
  - [ ] Create `UploadDocumentsStep` component
  - [ ] Create `AnswerQuestionsStep` component
  - [ ] Create `AddNotesStep` component
  - [ ] Create `ReviewSubmitStep` component
  - [ ] Add tests for each step

- [ ] **Reusable Components**
  - [ ] Create `DocumentUploader` component (or verify exists)
  - [ ] Style per DaisyUI standards

- [ ] **Page Integration**
  - [ ] Modify application detail page to client component
  - [ ] Add state management
  - [ ] Add conditional rendering for `recruiter_proposed` stage
  - [ ] Wire up modal opening/closing
  - [ ] Test page integration

### Phase 3: Integration & Testing

- [ ] **Backend Integration**
  - [ ] Test full flow: propose → accept → complete
  - [ ] Test decline flow
  - [ ] Verify audit logs created correctly
  - [ ] Verify events published correctly
  - [ ] Test error scenarios

- [ ] **Frontend Integration**
  - [ ] Test wizard navigation
  - [ ] Test form validation
  - [ ] Test document upload
  - [ ] Test question answering
  - [ ] Test submission
  - [ ] Test error handling

- [ ] **End-to-End**
  - [ ] Write E2E test for happy path
  - [ ] Write E2E test for decline path
  - [ ] Test on staging environment
  - [ ] Verify notification emails sent

### Phase 4: Polish & Documentation

- [ ] **User Experience**
  - [ ] Review and improve loading states
  - [ ] Review and improve error messages
  - [ ] Add tooltips/help text where needed
  - [ ] Mobile responsiveness check
  - [ ] Accessibility audit

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Update user guide
  - [ ] Create demo video
  - [ ] Document known limitations

- [ ] **Deployment**
  - [ ] Deploy backend changes
  - [ ] Deploy frontend changes
  - [ ] Run smoke tests
  - [ ] Monitor error rates
  - [ ] Monitor conversion rates (accept vs decline)

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Document Upload:**
   - Must implement document upload component
   - Currently no drag-and-drop interface
   - File size limits not enforced client-side

2. **Pre-Screen Questions:**
   - No support for conditional questions (show question B only if answer A is X)
   - No support for file upload questions
   - No auto-save of partial answers

3. **Wizard State:**
   - Closing wizard loses all progress
   - No "save draft" functionality
   - Cannot resume wizard later

### Future Enhancements

1. **Progressive Enhancement:**
   - Save wizard progress to backend
   - Resume wizard from any step
   - Email reminder if wizard not completed after 48 hours

2. **Rich Question Types:**
   - File upload questions
   - Date picker questions
   - Numeric range questions
   - Conditional question logic

3. **Document Management:**
   - Preview documents before selecting
   - Edit document metadata
   - Replace documents
   - Drag-and-drop upload

4. **Analytics:**
   - Track time spent on each step
   - Track drop-off points
   - A/B test wizard layouts

---

## Related Documents

- [`docs/business-logic/recruiter-submission-flow.md`](../business-logic/recruiter-submission-flow.md) - Business logic
- [`docs/guidance/wizard-pattern.md`](wizard-pattern.md) - Multi-step wizard pattern
- [`docs/guidance/form-controls.md`](form-controls.md) - Form standards
- [`docs/guidance/api-response-format.md`](api-response-format.md) - API standards
- [`docs/guidance/user-identification-standard.md`](user-identification-standard.md) - Auth standards

---

**Last Updated:** December 29, 2025  
**Version:** 1.0  
**Author:** GitHub Copilot  
**Status:** Implementation Guide - Ready for Development
