# Candidate Role Assignment Migration - Implementation Summary

## Overview

This document summarizes the implementation of the candidate role assignment system migration. The `candidate_role_assignments` table is now fully integrated into the ATS service, replacing the previous ad-hoc tracking system.

## Purpose

The `candidate_role_assignments` table serves as the **fiscal attribution system** for the Splits Network marketplace:

1. **Fiscal Attribution**: Tracks which recruiter should receive payment for a successful placement
2. **Protection Window**: Records the timestamp when a recruiter first proposes a candidate for a job
3. **State Tracking**: Manages the lifecycle from proposal through placement
4. **One Assignment Per Pair**: Enforces uniqueness constraint - one candidate-job pair can only have one active assignment

## State Machine

```
proposed → accepted → submitted → closed
           ↓
        declined
           ↓
        timed_out
```

- **proposed**: Recruiter proposes candidate for role (Phase 2 feature)
- **accepted**: Candidate accepts the proposal and moves to screening
- **declined**: Candidate declines the proposal
- **timed_out**: Candidate doesn't respond within protection window
- **submitted**: Candidate is actively in the hiring pipeline
- **closed**: Final state - placement created, assignment complete

## Implementation Components

### 1. Database Migration ✅

**File**: `services/ats-service/migrations/017_backfill_candidate_role_assignments.sql`

Backfills the candidate_role_assignments table from existing applications data:
- Maps application stages to assignment states
- Sets appropriate timestamps for state transitions
- Validates data integrity (no duplicates, missing references)

**Status**: Created, not yet executed

### 2. Type Definitions ✅

**File**: `packages/shared-types/src/candidate-role-assignments.ts`

Defines:
- `CandidateRoleAssignmentState`: 6 possible states
- `CandidateRoleAssignment`: Full assignment record with state transition timestamps
- `CandidateRoleAssignmentFilters`: Query filters
- `CandidateRoleAssignmentInput`: Creation input
- `CandidateRoleAssignmentUpdate`: Update input
- `ProposeAssignmentInput`, `RespondToProposalInput`: Phase 2 proposal workflow types

### 3. Repository Layer ✅

**File**: `services/ats-service/src/v2/candidate-role-assignments/repository.ts`

Implements data access with role-based filtering:
- **Recruiters**: See only their own assignments
- **Company Users**: See assignments for their company's jobs
- **Platform Admins**: See all assignments

Key methods:
- `list()`: Paginated list with filters
- `get()`: Single assignment by ID
- `findByJobAndCandidate()`: Check existing assignment
- `findByJobCandidateRecruiter()`: Specific lookup
- `create()`: Create new assignment with duplicate check
- `update()`: Update assignment
- `delete()`: Soft delete (close assignment)
- `findByRecruiter()`: Recruiter's assignments
- `findActiveByCandidate()`: Candidate's active assignments

### 4. Service Layer ✅

**File**: `services/ats-service/src/v2/candidate-role-assignments/service.ts`

Business logic and state machine validation:
- `createOrUpdateForApplication()`: Automatic sync from applications
- `validateStateTransition()`: Enforces valid state changes
- `mapApplicationStateToAssignmentState()`: Maps application stages to assignment states
- `proposeAssignment()`: Phase 2 proposal workflow
- `acceptProposal()`, `declineProposal()`: Phase 2 responses
- `markAsSubmitted()`: Move to submitted state
- `closeAssignment()`: Final state on placement

### 5. Application Integration ✅

**File**: `services/ats-service/src/v2/applications/service.ts`

Applications now automatically manage assignments:
- **On creation**: Creates assignment if `recruiter_id` exists
- **On stage change**: Updates assignment state to match application stage
- Error handling: Logs but doesn't fail if assignment operations fail

### 6. Placement Integration ✅

**File**: `services/ats-service/src/v2/placements/service.ts`

Placements now validate and close assignments:
- **On creation**: Validates assignment exists for the recruiter
- **State check**: Ensures assignment is in valid state (not declined/timed_out/closed)
- **Closure**: Closes the assignment when placement is created
- **Fee attribution**: Uses `assignment.recruiter_id` for payment tracking

### 7. REST API ✅

**File**: `services/ats-service/src/v2/candidate-role-assignments/routes.ts`

Eight endpoints for assignment management:

**Standard CRUD:**
- `GET /v2/candidate-role-assignments` - List with filters
- `GET /v2/candidate-role-assignments/:id` - Get single assignment
- `POST /v2/candidate-role-assignments` - Create (internal use)
- `PATCH /v2/candidate-role-assignments/:id` - Update
- `DELETE /v2/candidate-role-assignments/:id` - Soft delete (close)

**Phase 2 Proposal Workflow:**
- `POST /v2/candidate-role-assignments/propose` - Propose candidate for role
- `POST /v2/candidate-role-assignments/:id/accept` - Accept proposal
- `POST /v2/candidate-role-assignments/:id/decline` - Decline proposal

### 8. API Gateway ✅

**File**: `services/api-gateway/src/routes/v2/ats.ts`

Added `candidate-role-assignments` to the `ATS_RESOURCES` array, which automatically creates proxy routes:

- `GET /api/v2/candidate-role-assignments`
- `GET /api/v2/candidate-role-assignments/:id`
- `POST /api/v2/candidate-role-assignments`
- `PATCH /api/v2/candidate-role-assignments/:id`
- `DELETE /api/v2/candidate-role-assignments/:id`
- `POST /api/v2/candidate-role-assignments/propose`
- `POST /api/v2/candidate-role-assignments/:id/accept`
- `POST /api/v2/candidate-role-assignments/:id/decline`

## Architecture Flow

### Application Creation Flow
```
1. Company creates job → job record created
2. Recruiter submits candidate → application created
3. If recruiter_id exists:
   → Assignment automatically created (state: accepted)
   → Event: candidate_role_assignment.created
4. Application moves through stages
   → Assignment state updated to match
```

### Placement Creation Flow
```
1. Hiring manager marks candidate as hired
2. Create placement:
   → Validates assignment exists
   → Checks assignment state is valid
   → Closes assignment (state: closed)
   → Creates placement record with recruiter_id from assignment
   → Event: placement.created
```

### Phase 2 Proposal Flow (Not Yet Used)
```
1. Recruiter proposes candidate for job
   → Assignment created (state: proposed)
   → Notification sent to candidate
2. Candidate responds:
   Accept → Assignment moves to accepted → Application created
   Decline → Assignment moves to declined → No application
3. If no response within window → Assignment moves to timed_out
```

## Data Integrity Rules

1. **One Assignment Per Pair**: Unique constraint on (job_id, candidate_id)
2. **Valid State Transitions**: Enforced by service layer
3. **Timestamp Tracking**: Each state transition sets a timestamp
4. **Protection Window**: `proposed_at` timestamp establishes first-mover advantage
5. **Fee Attribution**: `assignment.recruiter_id` is the source of truth for payment

## Access Control

**Recruiters**:
- Can view their own assignments
- Can propose candidates (Phase 2)
- Can view proposals they've received

**Company Users**:
- Can view assignments for their company's jobs
- Can see which recruiters are working on which candidates

**Platform Admins**:
- Can view all assignments
- Can manually override states if needed

**Candidates**:
- Can view proposals they've received (Phase 2)
- Can accept/decline proposals

## Event Publishing

The assignment service publishes events for:
- `candidate_role_assignment.created`
- `candidate_role_assignment.updated`
- `candidate_role_assignment.state_changed`
- `candidate_role_assignment.deleted`
- `candidate_role_assignment.proposed` (Phase 2)
- `candidate_role_assignment.accepted` (Phase 2)
- `candidate_role_assignment.declined` (Phase 2)

## Testing Checklist

### ⏳ Pending Tests

1. **Backfill Migration**
   - [ ] Run migration on staging database
   - [ ] Verify all existing applications have assignments
   - [ ] Verify state mapping is correct
   - [ ] Verify no duplicate assignments

2. **Assignment Creation**
   - [ ] Create application with recruiter_id → assignment created
   - [ ] Create application without recruiter_id → no assignment
   - [ ] Verify assignment state matches application stage
   - [ ] Verify assignment timestamps set correctly

3. **Assignment Updates**
   - [ ] Move application to different stages → assignment state updates
   - [ ] Verify invalid state transitions are blocked
   - [ ] Verify assignment timestamps update correctly

4. **Placement Creation**
   - [ ] Create placement with valid assignment → success
   - [ ] Create placement without assignment → error
   - [ ] Create placement with declined assignment → error
   - [ ] Verify assignment closes on placement creation

5. **Phase 2 Proposal Workflow**
   - [ ] Propose candidate for job → assignment created (proposed)
   - [ ] Candidate accepts → assignment moves to accepted
   - [ ] Candidate declines → assignment moves to declined
   - [ ] Verify notifications sent correctly

6. **Access Control**
   - [ ] Recruiter can only see own assignments
   - [ ] Company user can see company job assignments
   - [ ] Platform admin can see all assignments
   - [ ] Verify role-based filtering works correctly

## Next Steps

### Immediate (Phase 1)
1. **Execute Backfill Migration** ⏳
   - Run on staging database first
   - Verify data integrity
   - Run on production

2. **Test Assignment Flow** ⏳
   - Create test applications with recruiters
   - Verify assignments created automatically
   - Test state transitions

3. **Test Placement Flow** ⏳
   - Create test placements
   - Verify assignment validation
   - Verify assignment closure

### Future (Phase 2)
4. **Frontend Assignment Views** ⏳
   - Recruiter dashboard: My assignments
   - Job detail: Assigned recruiters
   - Candidate detail: Assignment history

5. **Proposal Workflow UI** ⏳
   - Recruiter: Propose candidate page
   - Candidate: View/respond to proposals
   - Notifications for proposals

6. **Analytics & Reporting**
   - Assignment success rates
   - Time to placement metrics
   - Recruiter performance tracking

## Migration Rollback Plan

If issues arise, rollback procedure:

1. **Stop application creation** - Prevent new assignments
2. **Remove assignment service** from ApplicationServiceV2 constructor
3. **Remove assignment service** from PlacementServiceV2 constructor
4. **Remove assignment routes** from ATS service and API Gateway
5. **Revert database** - Drop candidate_role_assignments table if needed

**Note**: This will NOT affect existing applications or placements. The assignments table is supplementary fiscal tracking only.

## Key Decisions

1. **One Assignment Per Candidate-Job Pair**: Simplifies fiscal attribution
2. **Automatic Creation on Application**: No manual assignment step needed
3. **State Machine Validation**: Prevents invalid state transitions
4. **Soft Delete Only**: Never hard delete assignments for audit trail
5. **Event-Driven**: Enables future automation and notifications
6. **Phase 2 Proposal Workflow**: Built but not yet used in UI

## Files Modified

### Created Files
- `services/ats-service/migrations/017_backfill_candidate_role_assignments.sql`
- `packages/shared-types/src/candidate-role-assignments.ts`
- `services/ats-service/src/v2/candidate-role-assignments/repository.ts`
- `services/ats-service/src/v2/candidate-role-assignments/service.ts`
- `services/ats-service/src/v2/candidate-role-assignments/routes.ts`
- `services/ats-service/src/v2/candidate-role-assignments/types.ts`

### Modified Files
- `packages/shared-types/src/index.ts` - Added assignment types export
- `services/ats-service/src/v2/applications/service.ts` - Added assignment integration
- `services/ats-service/src/v2/placements/service.ts` - Added assignment validation
- `services/ats-service/src/v2/routes.ts` - Wired assignment service
- `services/api-gateway/src/routes/v2/ats.ts` - Added assignment proxy routes

## Documentation References

- Original PRD: `docs/splits-network-phase1-prd.md`
- Architecture: `docs/splits-network-architecture.md`
- V2 Architecture: `docs/migration/v2/V2-ARCHITECTURE-IMPLEMENTATION-GUIDE.md`
- User Roles: `docs/guidance/user-roles-and-permissions.md`

---

**Implementation Status**: ✅ Core implementation complete  
**Next Step**: Execute backfill migration and test  
**Last Updated**: January 8, 2026
