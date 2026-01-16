# Phase 2 Implementation - Ready to Start

**Date:** January 16, 2026  
**Status:** 📋 PLANNED - Ready for implementation  
**Prerequisites:** Phase 1 (AI Review Loop) - ✅ COMPLETE

---

## Executive Summary

Phase 1 of the Application/Proposal Flow is complete. The AI Review Loop now works correctly with proper state management and manual submission control. We are ready to begin Phase 2: **Gate Review Infrastructure**.

## Phase 1 Completion Status ✅

**Implemented (January 15, 2026):**
- AI review completion sets stage to `ai_reviewed` (NOT `submitted`)
- Candidate can "Return to Draft" to address feedback
- Candidate manually submits application when satisfied
- Full workflow: draft → ai_review → ai_reviewed → {draft OR submitted}
- CandidateRoleAssignment created on submission with `proposed` state
- All events published for state transitions

**Files Modified:**
- `services/ats-service/src/v2/applications/service.ts` - Added 4 methods
- `services/ats-service/src/v2/applications/routes.ts` - Added 3 routes
- `services/api-gateway/src/routes/v2/ats.ts` - Added 3 proxy routes
- `apps/candidate/src/app/portal/applications/[id]/components/ai-review-panel.tsx` - Enhanced UI
- `apps/candidate/src/app/portal/applications/[id]/page.tsx` - Pass stage prop

**Documentation:**
- See `PHASE-1-COMPLETE-AI-REVIEW-LOOP.md` for full implementation details
- See `plan-applicationProposalFlowImplementationAlignment.prompt.md` for overall plan

---

## Phase 2 Overview: Gate Review Infrastructure

### What We're Building

The **gate review system** is the core marketplace differentiator. Applications must pass through representative gates before entering the hiring pipeline:

1. **Candidate Recruiter Gate** (if candidate has recruiter)
2. **Company Recruiter Gate** (if job has assigned recruiter)  
3. **Company Gate** (always required)

### Current vs. Target State

**Current Implementation:**
- ✅ `submitApplication()` creates CandidateRoleAssignment
- ❌ CRA created with hardcoded state: `'proposed'`
- ❌ No gate routing determination
- ❌ No gate sequence stored
- ❌ No gate actions (approve/deny/request info)
- ❌ CRA table missing gate columns (`current_gate`, `gate_sequence`, `gate_history`)

**Target Implementation:**
- ✅ `submitApplication()` determines gate routing
- ✅ CRA created with state: `'awaiting_[first_gate]'` 
- ✅ Gate sequence stored in CRA: `['candidate_recruiter', 'company_recruiter', 'company']`
- ✅ Gate actions available: approve, deny, request info, provide info
- ✅ CRA table has gate columns populated
- ✅ Gate reviewers see applications at their gate
- ✅ Candidates see gate progress

### Gate Routing Matrix (from 02-proposal-flow.md)

| Candidate Recruiter | Company Recruiter | Gate Sequence |
|---------------------|-------------------|---------------|
| ❌ No | ❌ No | company |
| ❌ No | ✅ Yes | company_recruiter → company |
| ✅ Yes | ❌ No | candidate_recruiter → company |
| ✅ Yes | ✅ Yes | candidate_recruiter → company_recruiter → company |

---

## Implementation Plan

### 📁 Detailed Implementation Document

I've created a comprehensive implementation plan with all code, migrations, and testing requirements:

**Location:** `docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md`

This document includes:
- ✅ Complete database migration scripts
- ✅ Full TypeScript implementation for all services
- ✅ API route definitions with schemas
- ✅ Frontend component specifications
- ✅ Testing strategy and acceptance criteria
- ✅ 4-week implementation timeline

### Step-by-Step Implementation Sequence

**Week 1: Database + Backend Core**
1. Run migrations to add gate columns to CRA table
2. Create `cra_gate_feedback` table for gate communication
3. Add new CRA states for gate workflow
4. Implement `GateRoutingService` - determines gate sequence
5. Implement `GateActionsService` - handles approve/deny/request info

**Week 2: Integration + Events**
1. Update `submitApplication()` to use gate routing
2. Add API routes for gate actions
3. Implement event publishing for gate transitions
4. Add notification hooks for gate events
5. Integration testing of full gate flow

**Week 3: Frontend UI**
1. Recruiter gate review dashboard
2. Company gate review dashboard  
3. Candidate gate status component
4. Gate history timeline component
5. Info request/response UI

**Week 4: Testing + Polish**
1. E2E testing all 4 gate routing scenarios
2. Permission validation testing
3. Bug fixes and edge cases
4. Documentation updates
5. Demo preparation

---

## Technical Architecture

### New Database Tables

**candidate_role_assignments** (add columns):
```sql
current_gate TEXT CHECK (IN candidate_recruiter, company_recruiter, company, none)
gate_sequence JSONB DEFAULT '[]'
gate_history JSONB DEFAULT '[]'
has_candidate_recruiter BOOLEAN DEFAULT FALSE
has_company_recruiter BOOLEAN DEFAULT FALSE
```

**cra_gate_feedback** (new table):
```sql
CREATE TABLE cra_gate_feedback (
    id UUID PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES candidate_role_assignments(id),
    gate_name TEXT NOT NULL,
    created_by_user_id UUID NOT NULL,
    feedback_type TEXT NOT NULL, -- info_request, info_response, approval_note, denial_reason
    message_text TEXT NOT NULL,
    in_response_to_id UUID REFERENCES cra_gate_feedback(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### New Backend Services

**GateRoutingService:**
- `determineRouting(jobId, candidateId)` - Query recruiters and return routing object
- `getNextGate(currentGate, gateSequence)` - Helper for gate progression
- `validateGatePermission(userId, assignmentId, gate)` - Permission checking

**GateActionsService:**
- `approveGate(userId, assignmentId, notes)` - Approve and move to next gate
- `denyGate(userId, assignmentId, reason)` - Reject application
- `requestInfo(userId, assignmentId, request)` - Request more information
- `provideInfo(userId, assignmentId, response)` - Respond to info request

### New API Routes

```
POST /v2/candidate-role-assignments/:id/gate/approve
POST /v2/candidate-role-assignments/:id/gate/deny
POST /v2/candidate-role-assignments/:id/gate/request-info
POST /v2/candidate-role-assignments/:id/gate/provide-info
GET  /v2/candidate-role-assignments/:id/gate/feedback
```

### New Events

```
cra.gate.awaiting_review
cra.gate.approved
cra.gate.denied
cra.gate.info_requested
cra.gate.info_provided
```

---

## Success Criteria

Phase 2 is complete when:

- ✅ All 4 gate routing scenarios work correctly
- ✅ Permissions prevent unauthorized gate actions
- ✅ Gate feedback communication works
- ✅ Gate history is properly tracked
- ✅ Events published for all transitions
- ✅ Recruiters can review applications at their gate
- ✅ Companies can review applications that passed gates
- ✅ Candidates can see gate progress
- ✅ All tests passing (unit, integration, E2E)

---

## Next Steps

### Immediate Actions

1. **Review Implementation Plan** - Read `PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md`
2. **Create Feature Branch** - `git checkout -b feature/phase-2-gate-review`
3. **Start with Migrations** - Begin Week 1 database setup
4. **Implement Core Services** - GateRoutingService and GateActionsService
5. **Test Routing Logic** - Verify all 4 scenarios work correctly

### Questions to Consider

- **Migration Strategy:** Do we migrate existing `proposed` CRAs to proper gate states?
- **Notification Preferences:** Which gate events trigger emails vs in-app only?
- **Permission Model:** Should platform admins be able to approve any gate?
- **Gate Bypass:** Do we need an "expedite" feature for emergency hires?

---

## Resources

### Documentation
- **Phase 1 Complete:** `PHASE-1-COMPLETE-AI-REVIEW-LOOP.md`
- **Phase 2 Plan:** `docs/flows/PHASE-2-GATE-REVIEW-IMPLEMENTATION-PLAN.md`
- **Overall Plan:** `docs/flows/plan-applicationProposalFlowImplementationAlignment.prompt.md`
- **Original Design:** `docs/originals/01-application-flow.md` and `02-proposal-flow.md`

### Code References
- **Application Service:** `services/ats-service/src/v2/applications/service.ts`
- **CRA Service:** `services/ats-service/src/v2/candidate-role-assignments/service.ts`
- **CRA Repository:** `services/ats-service/src/v2/candidate-role-assignments/repository.ts`
- **API Gateway:** `services/api-gateway/src/routes/v2/ats.ts`

### Database Schema
- **ATS Schema:** All application and CRA tables in `*` schema
- **Current Migrations:** `services/ats-service/migrations/`
- **Supabase Project:** einhgkqmxbkgdohwfayv

---

## Timeline

- **Week 1 (Jan 16-23):** Database + Backend Core
- **Week 2 (Jan 24-31):** Integration + Events
- **Week 3 (Feb 1-8):** Frontend UI
- **Week 4 (Feb 9-16):** Testing + Polish
- **Target Completion:** February 16, 2026

---

**Document Status:** 📋 READY FOR REVIEW  
**Created:** January 16, 2026  
**Next Action:** Review implementation plan and begin Week 1 tasks

