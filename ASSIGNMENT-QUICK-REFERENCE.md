# Candidate Role Assignment - Developer Quick Reference

## Quick Start

### What Are Assignments?

Assignments track **fiscal attribution** - which recruiter gets paid for a successful placement. They establish a **protection window** when a recruiter first proposes a candidate for a job.

**One candidate-job pair = one assignment**

## State Machine

```
proposed → accepted → submitted → closed
           ↓
        declined
           ↓
        timed_out
```

## Automatic Integration

### Applications Automatically Create Assignments

When an application is created or updated **with a recruiter_id**, the system automatically creates or updates the assignment:

```typescript
// Application created with recruiter
const application = await applicationService.create(clerkUserId, {
  job_id: 'job-123',
  candidate_id: 'candidate-456',
  recruiter_id: 'recruiter-789', // ← Assignment auto-created
  stage: 'screen'
});
// Assignment created with state: 'accepted'
```

### Placements Validate Assignments

When creating a placement, the system validates the assignment exists and closes it:

```typescript
// Placement creation validates assignment
const placement = await placementService.create(clerkUserId, {
  job_id: 'job-123',
  candidate_id: 'candidate-456',
  recruiter_id: 'recruiter-789', // ← Must have valid assignment
  application_id: 'app-123',
  salary: 150000,
  fee_percentage: 20
});
// Assignment automatically closed (state: 'closed')
```

## API Endpoints

### List Assignments (Filtered)

```http
GET /api/v2/candidate-role-assignments?job_id=xxx&candidate_id=yyy
GET /api/v2/candidate-role-assignments?recruiter_id=zzz&state=submitted
GET /api/v2/candidate-role-assignments?page=1&limit=25
```

**Response**:
```json
{
  "data": [
    {
      "id": "assignment-123",
      "job_id": "job-456",
      "candidate_id": "candidate-789",
      "recruiter_id": "recruiter-101",
      "state": "submitted",
      "proposed_at": "2026-01-01T10:00:00Z",
      "accepted_at": "2026-01-01T11:00:00Z",
      "submitted_at": "2026-01-01T12:00:00Z",
      "closed_at": null,
      "declined_at": null,
      "timed_out_at": null,
      "created_at": "2026-01-01T10:00:00Z",
      "updated_at": "2026-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 25,
    "total_pages": 1
  }
}
```

### Get Single Assignment

```http
GET /api/v2/candidate-role-assignments/:id
```

### Update Assignment (Manual Override)

```http
PATCH /api/v2/candidate-role-assignments/:id
Content-Type: application/json

{
  "state": "closed",
  "notes": "Manually closed due to duplicate assignment"
}
```

### Close Assignment

```http
DELETE /api/v2/candidate-role-assignments/:id
```

**Note**: This is a soft delete that sets `state: 'closed'` and `closed_at` timestamp.

## Phase 2 Proposal Workflow (Not Yet in UI)

### Propose Candidate for Job

```http
POST /api/v2/candidate-role-assignments/propose
Content-Type: application/json

{
  "job_id": "job-123",
  "candidate_id": "candidate-456",
  "recruiter_id": "recruiter-789",
  "notes": "Great fit for this role"
}
```

Creates assignment with `state: 'proposed'` and sends notification to candidate.

### Accept Proposal

```http
POST /api/v2/candidate-role-assignments/:id/accept
```

Moves assignment to `state: 'accepted'` and creates application.

### Decline Proposal

```http
POST /api/v2/candidate-role-assignments/:id/decline
```

Moves assignment to `state: 'declined'`. No application created.

## TypeScript Usage

### Import Types

```typescript
import {
  CandidateRoleAssignment,
  CandidateRoleAssignmentState,
  CandidateRoleAssignmentFilters,
  CandidateRoleAssignmentInput,
  CandidateRoleAssignmentUpdate
} from '@splits-network/shared-types';
```

### Check Assignment State

```typescript
const assignment = await client.get<{ data: CandidateRoleAssignment }>(
  `/api/v2/candidate-role-assignments/${id}`
);

if (assignment.data.state === 'closed') {
  console.log('Assignment complete');
} else if (assignment.data.state === 'declined') {
  console.log('Candidate declined');
} else if (assignment.data.state === 'submitted') {
  console.log('Candidate in hiring pipeline');
}
```

### Find Assignment for Candidate-Job Pair

```typescript
const assignments = await client.get<{
  data: CandidateRoleAssignment[];
  pagination: any;
}>('/api/v2/candidate-role-assignments', {
  params: {
    job_id: 'job-123',
    candidate_id: 'candidate-456',
    limit: 1
  }
});

const assignment = assignments.data[0];
```

## Access Control

### Recruiters
- Can view **only their own** assignments (`recruiter_id = their user ID`)
- Can propose candidates (Phase 2)

### Company Users
- Can view assignments for **their company's jobs**
- Can see which recruiters are working on candidates

### Platform Admins
- Can view **all assignments**
- Can manually override states if needed

### Candidates
- Can view proposals they've received (Phase 2)
- Can accept/decline proposals

## Common Patterns

### Check if Assignment Exists Before Placement

```typescript
// Frontend: Check before showing placement form
const assignments = await client.get<{
  data: CandidateRoleAssignment[];
}>('/api/v2/candidate-role-assignments', {
  params: {
    job_id: jobId,
    candidate_id: candidateId,
    recruiter_id: recruiterId
  }
});

if (assignments.data.length === 0) {
  // Show error: "No assignment found. Application must be submitted first."
  return;
}

const assignment = assignments.data[0];
if (assignment.state === 'declined' || assignment.state === 'timed_out') {
  // Show error: "Cannot create placement for declined/timed out assignment"
  return;
}

// Proceed with placement creation
```

### Display Assignment Timeline

```typescript
function renderAssignmentTimeline(assignment: CandidateRoleAssignment) {
  const timeline = [];
  
  if (assignment.proposed_at) {
    timeline.push({
      label: 'Proposed',
      timestamp: assignment.proposed_at,
      icon: 'fa-lightbulb'
    });
  }
  
  if (assignment.accepted_at) {
    timeline.push({
      label: 'Accepted',
      timestamp: assignment.accepted_at,
      icon: 'fa-check'
    });
  }
  
  if (assignment.submitted_at) {
    timeline.push({
      label: 'In Pipeline',
      timestamp: assignment.submitted_at,
      icon: 'fa-paper-plane'
    });
  }
  
  if (assignment.closed_at) {
    timeline.push({
      label: 'Closed',
      timestamp: assignment.closed_at,
      icon: 'fa-circle-check'
    });
  }
  
  if (assignment.declined_at) {
    timeline.push({
      label: 'Declined',
      timestamp: assignment.declined_at,
      icon: 'fa-circle-xmark'
    });
  }
  
  return timeline;
}
```

### Filter Recruiter's Active Assignments

```typescript
// Show recruiter their current workload
const activeAssignments = await client.get<{
  data: CandidateRoleAssignment[];
  pagination: any;
}>('/api/v2/candidate-role-assignments', {
  params: {
    recruiter_id: currentRecruiterId,
    state: 'submitted', // Only active pipeline
    page: 1,
    limit: 25
  }
});

console.log(`${activeAssignments.data.length} active assignments`);
```

## State Transition Rules

| From State | To State | Allowed? | Trigger |
|------------|----------|----------|---------|
| proposed | accepted | ✅ | Candidate accepts proposal |
| proposed | declined | ✅ | Candidate declines proposal |
| proposed | timed_out | ✅ | Timeout window expires |
| accepted | submitted | ✅ | Application stage advances |
| accepted | declined | ✅ | Candidate withdraws |
| submitted | closed | ✅ | Placement created or rejected |
| declined | * | ❌ | Final state |
| timed_out | * | ❌ | Final state |
| closed | * | ❌ | Final state |

## Troubleshooting

### Assignment Not Created for Application

**Problem**: Created application but no assignment exists.

**Solution**: Ensure `recruiter_id` is set on the application:
```typescript
const application = await applicationService.create(clerkUserId, {
  job_id: 'job-123',
  candidate_id: 'candidate-456',
  recruiter_id: 'recruiter-789', // ← Required for assignment
  stage: 'screen'
});
```

### Cannot Create Placement

**Problem**: Placement creation fails with "No assignment found".

**Solution**: Verify assignment exists and is in valid state:
```http
GET /api/v2/candidate-role-assignments?job_id=xxx&candidate_id=yyy&recruiter_id=zzz
```

Assignment must exist and have `state` of `proposed`, `accepted`, or `submitted`.

### Assignment State Not Updating

**Problem**: Application stage changed but assignment state didn't update.

**Solution**: Assignment service integration is optional. Check that ApplicationServiceV2 has assignmentService injected:
```typescript
// In services/ats-service/src/v2/routes.ts
const applicationService = new ApplicationServiceV2(
  applicationRepository,
  applicationRepository.getSupabase(),
  config.eventPublisher,
  assignmentService // ← Must be passed
);
```

## Event Listening

To react to assignment changes:

```typescript
// Subscribe to assignment events
eventPublisher.subscribe('candidate_role_assignment.created', (data) => {
  console.log('New assignment:', data);
});

eventPublisher.subscribe('candidate_role_assignment.state_changed', (data) => {
  console.log('State changed:', data.previous_state, '→', data.new_state);
});

eventPublisher.subscribe('candidate_role_assignment.closed', (data) => {
  console.log('Assignment closed:', data.assignment_id);
});
```

## Database Schema Reference

```sql
CREATE TABLE candidate_role_assignments (
  id UUID PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  recruiter_id UUID NOT NULL REFERENCES users(id),
  
  state assignment_state NOT NULL DEFAULT 'proposed',
  
  -- State transition timestamps
  proposed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  timed_out_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one assignment per candidate-job pair
  CONSTRAINT unique_candidate_job UNIQUE (candidate_id, job_id)
);

CREATE TYPE assignment_state AS ENUM (
  'proposed',
  'accepted',
  'declined',
  'timed_out',
  'submitted',
  'closed'
);
```

---

**For more details, see**: [ASSIGNMENT-MIGRATION-IMPLEMENTATION.md](./ASSIGNMENT-MIGRATION-IMPLEMENTATION.md)
