# Proposals Workflow - API/Backend Implementation Tracker

**Feature**: Complete Proposals Workflow  
**Priority**: 🔥 HIGH  
**Status**: Backend V2 Complete, Automation Pending  
**Created**: January 14, 2026  
**Last Updated**: January 14, 2026

---

## Overview

Complete the proposals workflow backend implementation including timeout automation and event publishing. Frontend integration tracked separately in `proposals-workflow-ui-frontend.md`.

**Related Documents**:
- Feature Plan: `docs/plan-databaseTableIntegration2.prompt.md` (Feature 1)
- API Specification: Network Service V2 Proposals

---

## Backend Status Summary

### ✅ Complete (V2 Implementation)
- [x] Proposals repository with role-based access control
- [x] Proposals service with state machine validation
- [x] Standard 5-route REST API (`/api/v2/proposals`)
- [x] API Gateway proxy routes
- [x] Event publishing (`proposal.created`, `proposal.accepted`, `proposal.declined`)
- [x] Email notification templates (accept/decline/timeout)
- [x] Notification service event consumers
- [x] Database table `candidate_role_assignments` with indexes
- [x] Shared types in `@splits-network/shared-types`

### ❌ Missing Implementation
- [ ] Timeout automation (72-hour expiration)
- [ ] `proposal.timed_out` event publishing
- [ ] Kubernetes CronJob for timeout checker
- [ ] Monitoring/alerting for timeout job failures
- [ ] Integration tests for timeout scenarios

---

## Implementation Tasks

### 1. Timeout Automation Service

**File**: `services/automation-service/src/jobs/proposal-timeout.ts`

#### Tasks
- [ ] Create timeout checker job file
- [ ] Implement Supabase query for expired proposals
  - [ ] Filter: `state = 'proposed'`
  - [ ] Filter: `response_due_at < NOW()`
- [ ] Update proposal state to `timed_out`
- [ ] Set `timed_out_at` timestamp
- [ ] Publish `proposal.timed_out` event to RabbitMQ
- [ ] Add error handling and retry logic
- [ ] Add logging for debugging
- [ ] Test with manually created past-due proposals

#### Code Structure
```typescript
// services/automation-service/src/jobs/proposal-timeout.ts
import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '@splits-network/shared-job-queue';

export async function checkProposalTimeouts() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const eventPublisher = new EventPublisher(/* config */);
    
    // Find expired proposals
    const { data: expiredProposals, error } = await supabase
        .schema('public')
        .from('candidate_role_assignments')
        .select('id, job_id, candidate_id, recruiter_id')
        .eq('state', 'proposed')
        .lt('response_due_at', new Date().toISOString());
    
    if (error) throw error;
    
    for (const proposal of expiredProposals || []) {
        // Update state
        await supabase
            .schema('public')
            .from('candidate_role_assignments')
            .update({
                state: 'timed_out',
                timed_out_at: new Date().toISOString(),
            })
            .eq('id', proposal.id);
        
        // Publish event
        await eventPublisher.publish('proposal.timed_out', {
            proposal_id: proposal.id,
            job_id: proposal.job_id,
            candidate_id: proposal.candidate_id,
            recruiter_id: proposal.recruiter_id,
        });
    }
}
```

**Dependencies**:
- `@supabase/supabase-js`
- `@splits-network/shared-job-queue` (RabbitMQ publisher)
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RABBITMQ_URL`

**Testing**:
```bash
# Manual test
cd services/automation-service
node dist/jobs/proposal-timeout.js

# Verify proposals updated
psql $DATABASE_URL -c "SELECT id, state, timed_out_at FROM candidate_role_assignments WHERE state = 'timed_out';"
```

---

### 2. Kubernetes CronJob Configuration

**File**: `infra/k8s/automation-service/cronjobs/proposal-timeout.yaml`

#### Tasks
- [ ] Create CronJob manifest file
- [ ] Set schedule: Every 6 hours (`0 */6 * * *`)
- [ ] Configure service account with Supabase access
- [ ] Add resource limits (CPU: 100m, Memory: 256Mi)
- [ ] Set timeout: 10 minutes
- [ ] Configure restart policy: `OnFailure`
- [ ] Add labels for monitoring
- [ ] Test deployment to dev/staging cluster

#### Manifest Template
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: proposal-timeout-checker
  namespace: splits-network
  labels:
    app: automation-service
    component: cron
    feature: proposals
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 5
  concurrencyPolicy: Forbid  # Prevent overlapping runs
  jobTemplate:
    spec:
      backoffLimit: 2  # Retry failed jobs
      activeDeadlineSeconds: 600  # 10 minute timeout
      template:
        metadata:
          labels:
            app: automation-service
            component: cron-job
        spec:
          restartPolicy: OnFailure
          containers:
          - name: timeout-checker
            image: splits-network/automation-service:latest
            imagePullPolicy: Always
            command: ["node", "dist/jobs/proposal-timeout.js"]
            resources:
              requests:
                cpu: "50m"
                memory: "128Mi"
              limits:
                cpu: "100m"
                memory: "256Mi"
            env:
              - name: SUPABASE_URL
                valueFrom:
                  secretKeyRef:
                    name: supabase-credentials
                    key: url
              - name: SUPABASE_SERVICE_ROLE_KEY
                valueFrom:
                  secretKeyRef:
                    name: supabase-credentials
                    key: service-role-key
              - name: RABBITMQ_URL
                valueFrom:
                  secretKeyRef:
                    name: rabbitmq-credentials
                    key: url
```

**Deployment**:
```bash
kubectl apply -f infra/k8s/automation-service/cronjobs/proposal-timeout.yaml
kubectl get cronjobs -n splits-network
kubectl logs -n splits-network -l component=cron-job --tail=50
```

---

### 3. Monitoring & Alerting

#### Tasks
- [ ] Add Prometheus metrics for timeout job
  - [ ] `proposals_timeout_check_runs_total` (counter)
  - [ ] `proposals_timed_out_total` (counter)
  - [ ] `proposals_timeout_check_duration_seconds` (histogram)
  - [ ] `proposals_timeout_check_errors_total` (counter)
- [ ] Create Grafana dashboard for proposal metrics
- [ ] Set up alerts for job failures
  - [ ] Alert if job hasn't run in 12 hours
  - [ ] Alert if error rate > 5%
  - [ ] Alert if execution time > 5 minutes
- [ ] Add logging to Loki/CloudWatch
- [ ] Create runbook for timeout job failures

#### Metrics Implementation
```typescript
// services/automation-service/src/jobs/proposal-timeout.ts
import { register, Counter, Histogram } from 'prom-client';

const timeoutCheckRuns = new Counter({
    name: 'proposals_timeout_check_runs_total',
    help: 'Total number of proposal timeout check runs',
});

const proposalsTimedOut = new Counter({
    name: 'proposals_timed_out_total',
    help: 'Total number of proposals timed out',
});

const checkDuration = new Histogram({
    name: 'proposals_timeout_check_duration_seconds',
    help: 'Duration of timeout check job',
    buckets: [0.1, 0.5, 1, 2, 5, 10],
});

const checkErrors = new Counter({
    name: 'proposals_timeout_check_errors_total',
    help: 'Total number of timeout check errors',
});
```

---

### 4. Integration Testing

**File**: `services/automation-service/tests/integration/proposal-timeout.test.ts`

#### Test Cases
- [ ] Test proposal timeout after 72 hours
- [ ] Test multiple proposals timing out in same run
- [ ] Test proposals within timeout window (not expired)
- [ ] Test already timed-out proposals (idempotency)
- [ ] Test event publishing success
- [ ] Test event publishing failure (retry logic)
- [ ] Test Supabase connection failure
- [ ] Test partial batch failures

#### Test Template
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { checkProposalTimeouts } from '../src/jobs/proposal-timeout';

describe('Proposal Timeout Job', () => {
    let supabase: any;
    let testProposalIds: string[] = [];
    
    beforeEach(async () => {
        supabase = createClient(
            process.env.TEST_SUPABASE_URL!,
            process.env.TEST_SUPABASE_SERVICE_ROLE_KEY!
        );
        
        // Create test proposals
        const pastDueDate = new Date();
        pastDueDate.setHours(pastDueDate.getHours() - 73); // 73 hours ago
        
        const { data } = await supabase
            .from('candidate_role_assignments')
            .insert([
                {
                    job_id: 'test-job-1',
                    candidate_id: 'test-candidate-1',
                    recruiter_id: 'test-recruiter-1',
                    state: 'proposed',
                    response_due_at: pastDueDate.toISOString(),
                },
            ])
            .select();
        
        testProposalIds = data.map((p: any) => p.id);
    });
    
    afterEach(async () => {
        // Cleanup test data
        await supabase
            .from('candidate_role_assignments')
            .delete()
            .in('id', testProposalIds);
    });
    
    it('should timeout expired proposals', async () => {
        await checkProposalTimeouts();
        
        const { data } = await supabase
            .from('candidate_role_assignments')
            .select('state, timed_out_at')
            .in('id', testProposalIds);
        
        expect(data[0].state).toBe('timed_out');
        expect(data[0].timed_out_at).toBeTruthy();
    });
    
    it('should not timeout proposals within window', async () => {
        // Create proposal due in 24 hours
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 24);
        
        const { data: newProposal } = await supabase
            .from('candidate_role_assignments')
            .insert([
                {
                    job_id: 'test-job-2',
                    candidate_id: 'test-candidate-2',
                    recruiter_id: 'test-recruiter-2',
                    state: 'proposed',
                    response_due_at: futureDate.toISOString(),
                },
            ])
            .select();
        
        testProposalIds.push(newProposal[0].id);
        
        await checkProposalTimeouts();
        
        const { data } = await supabase
            .from('candidate_role_assignments')
            .select('state')
            .eq('id', newProposal[0].id);
        
        expect(data[0].state).toBe('proposed');
    });
});
```

**Run Tests**:
```bash
cd services/automation-service
pnpm test tests/integration/proposal-timeout.test.ts
```

---

### 5. Event Verification

#### Tasks
- [ ] Verify `proposal.timed_out` event schema matches shared types
- [ ] Confirm notification service handles timeout event
- [ ] Test email delivery for timeout notifications
- [ ] Verify event payload includes all required fields
- [ ] Test event publishing error handling

#### Event Schema Verification
```typescript
// packages/shared-types/src/events.ts
export interface ProposalTimedOutEvent extends DomainEvent {
    event_type: 'proposal.timed_out';
    payload: {
        proposal_id: string;
        job_id: string;
        candidate_id: string;
        recruiter_id: string;
    };
}
```

**Check**: ✅ Already defined in `packages/shared-types/src/events.ts`

#### Notification Handler Verification
```typescript
// services/notification-service/src/consumers/proposals/consumer.ts
async handleProposalTimeout(event: DomainEvent): Promise<void> {
    const { proposal_id, candidate_id, job_id, recruiter_id } = event.payload;
    
    // Fetch data and send email
    await this.emailService.sendProposalTimeout(recruiterEmail, {
        candidateName: candidate.name,
        jobTitle: job.title,
        userId: recruiter.user_id,
    });
}
```

**Check**: ✅ Already implemented in notification service

---

## API Endpoints (Already Complete)

### GET /api/v2/proposals
**Status**: ✅ Complete  
**File**: `services/network-service/src/v2/proposals/routes.ts`

**Query Parameters**:
- `page?: number` (default: 1)
- `limit?: number` (default: 25)
- `search?: string`
- `state?: string` (proposed, accepted, declined, timed_out)
- `recruiter_id?: string`
- `job_id?: string`
- `candidate_id?: string`
- `sort_by?: string`
- `sort_order?: 'asc' | 'desc'`

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 25,
    "total_pages": 4
  }
}
```

---

### GET /api/v2/proposals/:id
**Status**: ✅ Complete  
**Response**: `{ data: {...} }`

---

### POST /api/v2/proposals
**Status**: ✅ Complete  
**Body**:
```json
{
  "recruiter_id": "uuid",
  "job_id": "uuid",
  "candidate_id": "uuid",
  "proposal_notes": "string",
  "response_due_at": "ISO-8601" // Optional, defaults to now + 72h
}
```

---

### PATCH /api/v2/proposals/:id
**Status**: ✅ Complete  
**Body** (accept/decline):
```json
{
  "state": "accepted" | "declined",
  "response_notes": "string",
  "accepted_at": "ISO-8601",  // If accepting
  "declined_at": "ISO-8601"   // If declining
}
```

---

### DELETE /api/v2/proposals/:id
**Status**: ✅ Complete  
**Response**: 204 No Content

---

## Database Schema (Already Complete)

### Table: candidate_role_assignments
**Status**: ✅ Table exists with all required columns and indexes

**Key Columns**:
- `state`: enum (proposed, accepted, declined, timed_out, submitted, closed)
- `response_due_at`: timestamptz (used for timeout check)
- `timed_out_at`: timestamptz (set by automation)

**Indexes**:
- `idx_candidate_role_assignments_state` on (state)
- `idx_candidate_role_assignments_due` on (response_due_at)

**No database changes required** ✅

---

## Acceptance Criteria

### Functional Requirements
- [ ] Proposals automatically timeout after 72 hours
- [ ] Timeout job runs every 6 hours
- [ ] Timed-out proposals transition to `timed_out` state
- [ ] `timed_out_at` timestamp recorded accurately
- [ ] `proposal.timed_out` event published for each timeout
- [ ] Recruiter receives timeout notification email
- [ ] Job handles multiple proposals timing out in same run
- [ ] Job is idempotent (can run multiple times safely)

### Technical Requirements
- [ ] Job completes in <5 minutes for 1000+ proposals
- [ ] Error handling prevents partial state updates
- [ ] Metrics exported to Prometheus
- [ ] Logs available in centralized logging system
- [ ] Kubernetes CronJob deployed to production
- [ ] Alerts configured for job failures

### Testing Requirements
- [ ] Unit tests for timeout logic
- [ ] Integration tests with real database
- [ ] Manual testing with past-due proposals
- [ ] Load testing with large proposal datasets
- [ ] Failure scenario testing (DB down, RabbitMQ down)

---

## Implementation Timeline

### Day 1: Timeout Job Development
- [ ] Create job file structure
- [ ] Implement Supabase queries
- [ ] Add event publishing
- [ ] Local testing with mock data

### Day 2: Kubernetes & Deployment
- [ ] Create CronJob manifest
- [ ] Deploy to dev cluster
- [ ] Test with real data in dev
- [ ] Add monitoring/metrics

### Day 3: Testing & Validation
- [ ] Write integration tests
- [ ] Run load tests
- [ ] Test failure scenarios
- [ ] Deploy to staging

### Day 4: Production Deployment
- [ ] Deploy to production cluster
- [ ] Monitor first 24 hours
- [ ] Verify timeouts working correctly
- [ ] Update documentation

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code reviewed and approved
- [ ] Integration tests passing
- [ ] Staging deployment successful
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Runbook created

### Deployment
- [ ] Deploy automation-service with timeout job
- [ ] Apply Kubernetes CronJob manifest
- [ ] Verify CronJob scheduled correctly
- [ ] Check initial job execution

### Post-Deployment
- [ ] Monitor first 3 job runs
- [ ] Verify proposals timing out correctly
- [ ] Check notification emails sent
- [ ] Review metrics and logs
- [ ] Update status in this document

---

## Troubleshooting

### Job Not Running
1. Check CronJob status: `kubectl get cronjobs -n splits-network`
2. Check recent jobs: `kubectl get jobs -n splits-network -l app=automation-service`
3. Check pod logs: `kubectl logs -n splits-network -l component=cron-job --tail=100`

### Job Failing
1. Check error logs in CloudWatch/Loki
2. Verify Supabase credentials
3. Verify RabbitMQ connection
4. Check database connectivity
5. Review recent code changes

### No Proposals Timing Out
1. Verify proposals exist with `response_due_at` in past
2. Check job query logic
3. Verify state transition logic
4. Check event publishing

### Events Not Received
1. Check RabbitMQ queue status
2. Verify notification service running
3. Check event schema compatibility
4. Review event consumer logs

---

## Related Files

### Implementation Files
- `services/automation-service/src/jobs/proposal-timeout.ts` (NEW)
- `infra/k8s/automation-service/cronjobs/proposal-timeout.yaml` (NEW)
- `services/automation-service/tests/integration/proposal-timeout.test.ts` (NEW)

### Existing Files (Reference Only)
- `services/network-service/src/v2/proposals/repository.ts` ✅
- `services/network-service/src/v2/proposals/service.ts` ✅
- `services/network-service/src/v2/proposals/routes.ts` ✅
- `services/notification-service/src/consumers/proposals/consumer.ts` ✅
- `services/notification-service/src/templates/proposals/index.ts` ✅
- `packages/shared-types/src/events.ts` ✅

---

## Status Summary

**Overall Status**: 🟡 Backend V2 Complete, Automation Pending  
**Backend API**: ✅ 100% Complete  
**Event System**: ✅ 100% Complete  
**Timeout Automation**: ❌ 0% Complete  
**Monitoring**: ❌ 0% Complete  
**Testing**: ❌ 0% Complete

**Blockers**: None  
**Dependencies**: All backend dependencies complete

---

**Last Updated**: January 14, 2026  
**Next Review**: After automation implementation complete
