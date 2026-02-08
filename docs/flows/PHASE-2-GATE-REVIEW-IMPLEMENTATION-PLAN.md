# Phase 2 Implementation Plan: Gate Review Infrastructure

**Date:** January 16, 2026  
**Status:** 📋 READY TO START  
**Prerequisites:** Phase 1 (AI Review Loop) - ✅ COMPLETE

---

## Overview

Phase 2 implements the **gate review system**, which is the core marketplace differentiator for Splits Network. Applications must pass through representative gates (candidate recruiter, company recruiter, company) before entering the hiring pipeline.

## Implementation Scope

### What We're Building

1. **Gate Routing System** - Automatic determination of which gates an application must pass through
2. **Gate Actions** - Approve, deny, request info actions for each gate
3. **Gate Communication** - Feedback system for gate reviews
4. **State Management** - Proper CRA state transitions through gates
5. **Event Architecture** - Events for all gate transitions
6. **API Endpoints** - REST APIs for gate operations
7. **Frontend UI** - Gate review interfaces for recruiters and companies

### What We're NOT Building (Yet)

- Interview scheduling (Phase 5)
- Offer management UI (Phase 5)
- Advanced analytics (Phase 6)
- Automated matching (Phase 6)

---

## Database Schema Changes

### Step 1: Add Gate Columns to CRA Table

**Migration:** `services/ats-service/migrations/XXX_add_gate_columns_to_cra.sql`

```sql
-- Gate routing metadata
ALTER TABLE candidate_role_assignments
ADD COLUMN IF NOT EXISTS current_gate TEXT
CHECK (current_gate IN ('candidate_recruiter', 'company_recruiter', 'company', 'none'));

ALTER TABLE candidate_role_assignments
ADD COLUMN IF NOT EXISTS gate_sequence JSONB DEFAULT '[]';
-- Example: ['candidate_recruiter', 'company_recruiter', 'company']

ALTER TABLE candidate_role_assignments
ADD COLUMN IF NOT EXISTS gate_history JSONB DEFAULT '[]';
-- Example: [
--   {
--     "gate": "candidate_recruiter",
--     "action": "approved",
--     "timestamp": "2026-01-16T10:00:00Z",
--     "reviewer_user_id": "uuid",
--     "notes": "Strong candidate"
--   }
-- ]

-- Routing flags (cached for query performance)
ALTER TABLE candidate_role_assignments
ADD COLUMN IF NOT EXISTS has_candidate_recruiter BOOLEAN DEFAULT FALSE;

ALTER TABLE candidate_role_assignments
ADD COLUMN IF NOT EXISTS has_company_recruiter BOOLEAN DEFAULT FALSE;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_cra_current_gate
ON candidate_role_assignments(current_gate)
WHERE current_gate IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cra_routing_flags
ON candidate_role_assignments(has_candidate_recruiter, has_company_recruiter);
```

### Step 2: Create Gate Feedback Table

**Migration:** `services/ats-service/migrations/XXX_create_cra_gate_feedback.sql`

```sql
CREATE TABLE IF NOT EXISTS cra_gate_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES candidate_role_assignments(id) ON DELETE CASCADE,

    -- Which gate is this at?
    gate_name TEXT NOT NULL CHECK (gate_name IN (
        'candidate_recruiter',
        'company_recruiter',
        'company'
    )),

    -- Who created this feedback
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_by_type TEXT NOT NULL CHECK (created_by_type IN (
        'candidate_recruiter',
        'company_recruiter',
        'company_admin',
        'hiring_manager',
        'platform_admin'
    )),

    -- What type of communication
    feedback_type TEXT NOT NULL CHECK (feedback_type IN (
        'info_request',    -- Gate reviewer needs more info
        'info_response',   -- Response to gate's request
        'clarification',   -- Additional context provided
        'approval_note',   -- Note attached to approval
        'denial_reason'    -- Reason for denial
    )),

    -- The message
    message_text TEXT NOT NULL,

    -- Thread reference (which message is this responding to?)
    in_response_to_id UUID REFERENCES cra_gate_feedback(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cra_feedback_assignment
ON cra_gate_feedback(assignment_id, created_at DESC);

CREATE INDEX idx_cra_feedback_gate
ON cra_gate_feedback(assignment_id, gate_name, created_at DESC);

CREATE INDEX idx_cra_feedback_thread
ON cra_gate_feedback(in_response_to_id);

COMMENT ON TABLE cra_gate_feedback IS 'Communication between gate reviewers and candidates during gate review process';
```

### Step 3: Add New CRA States & Schema Updates

**Migration:** `services/ats-service/migrations/XXX_add_cra_gate_states.sql`

```sql
-- Add missing CRA states for gate workflow
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'awaiting_candidate_recruiter';
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'awaiting_company_recruiter';
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'awaiting_company';
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'info_requested';
ALTER TYPE candidate_role_assignment_state ADD VALUE IF NOT EXISTS 'submitted_to_company';

-- **CRITICAL: Recruiter Role Separation**
-- See docs/guidance/cra-schema-specifications.md for complete specification
-- Split ambiguous recruiter_id into candidate_recruiter_id and company_recruiter_id
ALTER TABLE candidate_role_assignments RENAME COLUMN recruiter_id TO candidate_recruiter_id;
ALTER TABLE candidate_role_assignments ADD COLUMN IF NOT EXISTS company_recruiter_id UUID REFERENCES recruiters(id);

-- Optional: Add sourcer fields as denormalized convenience
ALTER TABLE candidate_role_assignments ADD COLUMN IF NOT EXISTS candidate_sourcer_id UUID REFERENCES recruiters(id);
ALTER TABLE candidate_role_assignments ADD COLUMN IF NOT EXISTS company_sourcer_id UUID REFERENCES recruiters(id);

-- Enforce required fields
ALTER TABLE candidate_role_assignments ALTER COLUMN candidate_id SET NOT NULL;
ALTER TABLE candidate_role_assignments ALTER COLUMN job_id SET NOT NULL;
ALTER TABLE candidate_role_assignments ALTER COLUMN proposed_by SET NOT NULL;

-- Add uniqueness constraint (one active deal per candidate-job pair)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cra_unique_active_deal
ON candidate_role_assignments(candidate_id, job_id)
WHERE state NOT IN ('rejected', 'declined', 'withdrawn', 'timed_out', 'closed');

-- Update indexes
CREATE INDEX IF NOT EXISTS idx_cra_candidate_recruiter ON candidate_role_assignments(candidate_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_cra_company_recruiter ON candidate_role_assignments(company_recruiter_id);
CREATE INDEX IF NOT EXISTS idx_cra_candidate_sourcer ON candidate_role_assignments(candidate_sourcer_id);
CREATE INDEX IF NOT EXISTS idx_cra_company_sourcer ON candidate_role_assignments(company_sourcer_id);

-- Update existing 'proposed' assignments to proper gate state
-- This is a data migration for historical records
UPDATE candidate_role_assignments
SET
    state = 'awaiting_company',
    current_gate = 'company'
WHERE state = 'proposed'
AND NOT has_candidate_recruiter
AND NOT has_company_recruiter;

COMMENT ON COLUMN candidate_role_assignments.candidate_recruiter_id IS 'Represents the candidate (Closer role)';
COMMENT ON COLUMN candidate_role_assignments.company_recruiter_id IS 'Represents the company (Client/Hiring Facilitator role)';
COMMENT ON COLUMN candidate_role_assignments.candidate_sourcer_id IS 'Denormalized convenience - authority is candidates.candidate_sourcer_id';
COMMENT ON COLUMN candidate_role_assignments.company_sourcer_id IS 'Denormalized convenience - authority is companies.company_sourcer_id';
COMMENT ON COLUMN candidate_role_assignments.proposed_by IS 'User who initiated this CRA (NOT the same as recruiter IDs)';
COMMENT ON TYPE candidate_role_assignment_state IS 'Lifecycle states for CRA including gate review workflow';
```

**Important Notes:**

- `candidate_recruiter_id` vs `company_recruiter_id` are distinct roles, not redundant fields
- Both can be null (direct candidate application or direct company hire)
- `proposed_by` tracks who initiated the deal (could be candidate, recruiter, or admin)
- Money rates and snapshots belong in placements table, NOT on CRA
- Sourcers are denormalized convenience - placement_snapshot is authority for payouts
- See [CRA Schema Specifications](../guidance/cra-schema-specifications.md) for complete details

---

## Backend Implementation

### Step 4: Gate Routing Service

**File:** `services/ats-service/src/v2/candidate-role-assignments/gate-routing.ts`

```typescript
/**
 * Gate Routing Service
 * Determines which gates an application must pass through
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";

export interface GateRouting {
    firstGate: "candidate_recruiter" | "company_recruiter" | "company";
    gateSequence: string[];
    hasCandidateRecruiter: boolean;
    hasCompanyRecruiter: boolean;
    candidateRecruiterId?: string;
    companyRecruiterId?: string;
}

export class GateRoutingService {
    constructor(
        private supabase: SupabaseClient,
        private logger: Logger,
    ) {}

    /**
     * Determine gate routing for an application
     * Based on candidate recruiter and company recruiter presence
     */
    async determineRouting(
        jobId: string,
        candidateId: string,
    ): Promise<GateRouting> {
        // Check for active candidate recruiter relationship
        const { data: candidateRecruiter } = await this.supabase
            .from("recruiter_candidates")
            .select("recruiter_id, recruiter_user_id")
            .eq("candidate_id", candidateId)
            .eq("status", "active")
            .maybeSingle();

        // Check for company recruiter assignment on job
        const { data: job } = await this.supabase
            .from("jobs")
            .select("recruiter_id, company_id") // This becomes company_recruiter_id in CRA
            .eq("id", jobId)
            .single();

        if (!job) {
            throw new Error(`Job ${jobId} not found`);
        }

        const hasCandidateRecruiter = !!candidateRecruiter?.recruiter_id;
        const hasCompanyRecruiter = !!job.recruiter_id;

        // Build gate sequence based on routing matrix
        const gateSequence: string[] = [];
        let firstGate: "candidate_recruiter" | "company_recruiter" | "company";

        if (hasCandidateRecruiter) {
            gateSequence.push("candidate_recruiter");
            firstGate = "candidate_recruiter";
        }

        if (hasCompanyRecruiter) {
            gateSequence.push("company_recruiter");
            if (!firstGate!) firstGate = "company_recruiter";
        }

        gateSequence.push("company");
        if (!firstGate!) firstGate = "company";

        this.logger.info(
            {
                jobId,
                candidateId,
                hasCandidateRecruiter,
                hasCompanyRecruiter,
                gateSequence,
                firstGate,
                candidateRecruiterId: candidateRecruiter?.recruiter_id,
                companyRecruiterId: job.recruiter_id,
            },
            "Determined gate routing",
        );

        return {
            firstGate,
            gateSequence,
            hasCandidateRecruiter,
            hasCompanyRecruiter,
            candidateRecruiterId: candidateRecruiter?.recruiter_id, // Stored in CRA.candidate_recruiter_id
            companyRecruiterId: job.recruiter_id, // Stored in CRA.company_recruiter_id
        };
    }

    /**
     * Determine next gate in sequence
     */
    getNextGate(currentGate: string, gateSequence: string[]): string | null {
        const currentIndex = gateSequence.indexOf(currentGate);
        if (currentIndex === -1 || currentIndex === gateSequence.length - 1) {
            return null; // No next gate (last gate or invalid)
        }
        return gateSequence[currentIndex + 1];
    }

    /**
     * Check if user has permission to review at this gate
     *
     * CRITICAL: Uses candidate_recruiter_id and company_recruiter_id from CRA
     * See docs/guidance/cra-schema-specifications.md for complete schema
     */
    async validateGatePermission(
        clerkUserId: string,
        assignmentId: string,
        gateName: string,
    ): Promise<boolean> {
        // Fetch CRA with separated recruiter IDs
        const { data: assignment } = await this.supabase
            .from("candidate_role_assignments")
            .select(
                `
                *,
                candidate_recruiter:recruiters!candidate_recruiter_id(id, user_id),
                company_recruiter:recruiters!company_recruiter_id(id, user_id),
                jobs(recruiter_id, company_id)
            `,
            )
            .eq("id", assignmentId)
            .single();

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Get user context
        const { data: user } = await this.supabase
            .from("users")
            .select("id, clerk_user_id")
            .eq("clerk_user_id", clerkUserId)
            .single();

        if (!user) {
            throw new Error("User not found");
        }

        // Check permissions based on gate
        switch (gateName) {
            case "candidate_recruiter":
                // Check if user is the candidate recruiter
                const { data: recruiterCandidate } = await this.supabase
                    .from("recruiter_candidates")
                    .select("recruiter_user_id")
                    .eq("candidate_id", assignment.candidate_id)
                    .eq("status", "active")
                    .single();

                return recruiterCandidate?.recruiter_user_id === user.id;

            case "company_recruiter":
                // Check if user is the company recruiter for this job
                const { data: recruiter } = await this.supabase
                    .from("recruiters")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();

                return assignment.jobs?.recruiter_id === recruiter?.id;

            case "company":
                // Check if user is company admin or hiring manager for this company
                const { data: membership } = await this.supabase
                    .from("memberships")
                    .select("role, organization_id")
                    .eq("user_id", user.id)
                    .in("role", ["company_admin", "hiring_manager"])
                    .maybeSingle();

                // Get company's organization_id
                const { data: company } = await this.supabase
                    .from("companies")
                    .select("identity_organization_id")
                    .eq("id", assignment.jobs?.company_id)
                    .single();

                return (
                    membership?.organization_id ===
                    company?.identity_organization_id
                );

            default:
                return false;
        }
    }
}
```

### Step 5: Gate Actions Service Methods

**File:** `services/ats-service/src/v2/candidate-role-assignments/gate-actions.ts`

```typescript
/**
 * Gate Actions Service
 * Handles approve, deny, request info actions for gate reviews
 */

import { SupabaseClient } from "@supabase/supabase-js";
import { Logger } from "@splits-network/shared-logging";
import { EventPublisher } from "../shared/events";
import { GateRoutingService } from "./gate-routing";
import type { CandidateRoleAssignment } from "@splits-network/shared-types";

export interface GateAction {
    assignment_id: string;
    gate_name: string;
    action: "approved" | "denied" | "info_requested";
    reviewer_user_id: string;
    notes?: string;
}

export class GateActionsService {
    constructor(
        private supabase: SupabaseClient,
        private gateRouting: GateRoutingService,
        private eventPublisher: EventPublisher | null,
        private logger: Logger,
    ) {}

    /**
     * Approve application at current gate
     * Moves to next gate or submits to company
     */
    async approveGate(
        clerkUserId: string,
        assignmentId: string,
        notes?: string,
    ): Promise<CandidateRoleAssignment> {
        // Get assignment
        const { data: assignment, error } = await this.supabase
            .from("candidate_role_assignments")
            .select("*")
            .eq("id", assignmentId)
            .single();

        if (error || !assignment) {
            throw new Error("Assignment not found");
        }

        // Validate permission
        const hasPermission = await this.gateRouting.validateGatePermission(
            clerkUserId,
            assignmentId,
            assignment.current_gate,
        );

        if (!hasPermission) {
            throw new Error(
                "User does not have permission to review at this gate",
            );
        }

        // Get user ID for audit
        const { data: user } = await this.supabase
            .from("users")
            .select("id")
            .eq("clerk_user_id", clerkUserId)
            .single();

        // Add approval to gate history
        const gateHistory = [
            ...(assignment.gate_history || []),
            {
                gate: assignment.current_gate,
                action: "approved",
                timestamp: new Date().toISOString(),
                reviewer_user_id: user?.id,
                notes: notes || null,
            },
        ];

        // Determine next gate
        const gateSequence = assignment.gate_sequence || [];
        const nextGate = this.gateRouting.getNextGate(
            assignment.current_gate,
            gateSequence,
        );

        let newState: string;
        let newCurrentGate: string | null;

        if (nextGate) {
            // Move to next gate
            newState = `awaiting_${nextGate}`;
            newCurrentGate = nextGate;
        } else {
            // All gates passed - submit to company
            newState = "submitted_to_company";
            newCurrentGate = "none";
        }

        // Update assignment
        const { data: updated, error: updateError } = await this.supabase
            .from("candidate_role_assignments")
            .update({
                state: newState,
                current_gate: newCurrentGate,
                gate_history: gateHistory,
                updated_at: new Date(),
            })
            .eq("id", assignmentId)
            .select()
            .single();

        if (updateError) {
            throw new Error(
                `Failed to update assignment: ${updateError.message}`,
            );
        }

        // Create feedback record
        await this.supabase.from("cra_gate_feedback").insert({
            assignment_id: assignmentId,
            gate_name: assignment.current_gate,
            created_by_user_id: user?.id,
            created_by_type: this.getReviewerType(assignment.current_gate),
            feedback_type: "approval_note",
            message_text: notes || "Approved",
        });

        // Publish event
        await this.eventPublisher?.publish("cra.gate.approved", {
            assignment_id: assignmentId,
            gate: assignment.current_gate,
            next_gate: nextGate,
            reviewer_user_id: user?.id,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
        });

        this.logger.info(
            {
                assignmentId,
                gate: assignment.current_gate,
                nextGate,
                newState,
            },
            "Gate approved",
        );

        return updated;
    }

    /**
     * Deny application at current gate
     * Marks assignment as rejected
     */
    async denyGate(
        clerkUserId: string,
        assignmentId: string,
        reason: string,
    ): Promise<CandidateRoleAssignment> {
        if (!reason || reason.trim().length === 0) {
            throw new Error("Denial reason is required");
        }

        // Get assignment
        const { data: assignment } = await this.supabase
            .from("candidate_role_assignments")
            .select("*")
            .eq("id", assignmentId)
            .single();

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Validate permission
        const hasPermission = await this.gateRouting.validateGatePermission(
            clerkUserId,
            assignmentId,
            assignment.current_gate,
        );

        if (!hasPermission) {
            throw new Error(
                "User does not have permission to review at this gate",
            );
        }

        // Get user ID
        const { data: user } = await this.supabase
            .from("users")
            .select("id")
            .eq("clerk_user_id", clerkUserId)
            .single();

        // Add denial to gate history
        const gateHistory = [
            ...(assignment.gate_history || []),
            {
                gate: assignment.current_gate,
                action: "denied",
                timestamp: new Date().toISOString(),
                reviewer_user_id: user?.id,
                notes: reason,
            },
        ];

        // Update assignment to rejected
        const { data: updated } = await this.supabase
            .from("candidate_role_assignments")
            .update({
                state: "rejected",
                current_gate: "none",
                gate_history: gateHistory,
                closed_at: new Date(),
                updated_at: new Date(),
            })
            .eq("id", assignmentId)
            .select()
            .single();

        // Create feedback record
        await this.supabase.from("cra_gate_feedback").insert({
            assignment_id: assignmentId,
            gate_name: assignment.current_gate,
            created_by_user_id: user?.id,
            created_by_type: this.getReviewerType(assignment.current_gate),
            feedback_type: "denial_reason",
            message_text: reason,
        });

        // Publish event
        await this.eventPublisher?.publish("cra.gate.denied", {
            assignment_id: assignmentId,
            gate: assignment.current_gate,
            reviewer_user_id: user?.id,
            reason,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
        });

        this.logger.info(
            {
                assignmentId,
                gate: assignment.current_gate,
                reason,
            },
            "Gate denied",
        );

        return updated!;
    }

    /**
     * Request more information at current gate
     * Moves assignment to info_requested state
     */
    async requestInfo(
        clerkUserId: string,
        assignmentId: string,
        request: string,
    ): Promise<CandidateRoleAssignment> {
        if (!request || request.trim().length === 0) {
            throw new Error("Info request message is required");
        }

        // Get assignment
        const { data: assignment } = await this.supabase
            .from("candidate_role_assignments")
            .select("*")
            .eq("id", assignmentId)
            .single();

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        // Validate permission
        const hasPermission = await this.gateRouting.validateGatePermission(
            clerkUserId,
            assignmentId,
            assignment.current_gate,
        );

        if (!hasPermission) {
            throw new Error(
                "User does not have permission to review at this gate",
            );
        }

        // Get user ID
        const { data: user } = await this.supabase
            .from("users")
            .select("id")
            .eq("clerk_user_id", clerkUserId)
            .single();

        // Update assignment to info_requested
        const { data: updated } = await this.supabase
            .from("candidate_role_assignments")
            .update({
                state: "info_requested",
                updated_at: new Date(),
            })
            .eq("id", assignmentId)
            .select()
            .single();

        // Create feedback record
        await this.supabase.from("cra_gate_feedback").insert({
            assignment_id: assignmentId,
            gate_name: assignment.current_gate,
            created_by_user_id: user?.id,
            created_by_type: this.getReviewerType(assignment.current_gate),
            feedback_type: "info_request",
            message_text: request,
        });

        // Publish event
        await this.eventPublisher?.publish("cra.gate.info_requested", {
            assignment_id: assignmentId,
            gate: assignment.current_gate,
            reviewer_user_id: user?.id,
            request,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
        });

        this.logger.info(
            {
                assignmentId,
                gate: assignment.current_gate,
            },
            "Info requested at gate",
        );

        return updated!;
    }

    /**
     * Provide info in response to gate request
     * Returns assignment to awaiting_gate state
     */
    async provideInfo(
        clerkUserId: string,
        assignmentId: string,
        response: string,
        inResponseToId: string,
    ): Promise<CandidateRoleAssignment> {
        if (!response || response.trim().length === 0) {
            throw new Error("Response message is required");
        }

        // Get assignment
        const { data: assignment } = await this.supabase
            .from("candidate_role_assignments")
            .select("*")
            .eq("id", assignmentId)
            .single();

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        if (assignment.state !== "info_requested") {
            throw new Error("Assignment is not in info_requested state");
        }

        // Get user ID
        const { data: user } = await this.supabase
            .from("users")
            .select("id")
            .eq("clerk_user_id", clerkUserId)
            .single();

        // Return to awaiting gate state
        const awaitingState = `awaiting_${assignment.current_gate}`;
        const { data: updated } = await this.supabase
            .from("candidate_role_assignments")
            .update({
                state: awaitingState,
                updated_at: new Date(),
            })
            .eq("id", assignmentId)
            .select()
            .single();

        // Create feedback record
        await this.supabase.from("cra_gate_feedback").insert({
            assignment_id: assignmentId,
            gate_name: assignment.current_gate,
            created_by_user_id: user?.id,
            created_by_type: "candidate_recruiter", // Assuming response from candidate side
            feedback_type: "info_response",
            message_text: response,
            in_response_to_id: inResponseToId,
        });

        // Publish event
        await this.eventPublisher?.publish("cra.gate.info_provided", {
            assignment_id: assignmentId,
            gate: assignment.current_gate,
            user_id: user?.id,
            job_id: assignment.job_id,
            candidate_id: assignment.candidate_id,
        });

        this.logger.info(
            {
                assignmentId,
                gate: assignment.current_gate,
            },
            "Info provided for gate review",
        );

        return updated!;
    }

    private getReviewerType(gateName: string): string {
        switch (gateName) {
            case "candidate_recruiter":
                return "candidate_recruiter";
            case "company_recruiter":
                return "company_recruiter";
            case "company":
                return "company_admin";
            default:
                return "unknown";
        }
    }
}
```

### Step 6: Update Application Service - Submit with Routing

**File:** `services/ats-service/src/v2/applications/service.ts` (update existing method)

```typescript
/**
 * Submit application after AI review
 * Candidate is satisfied with AI feedback and ready to submit
 * NOW WITH GATE ROUTING
 */
async submitApplication(applicationId: string, clerkUserId: string, data?: any): Promise<{
    application: any;
    assignment?: any;
}> {
    const application = await this.repository.findApplication(applicationId, clerkUserId);

    if (!application) {
        throw new Error('Application not found');
    }

    // Only allow submission from ai_reviewed or screen
    if (!['ai_reviewed', 'screen'].includes(application.stage)) {
        throw new Error(`Cannot submit from stage: ${application.stage}. Application must be in ai_reviewed or screen stage.`);
    }

    // Update to submitted
    const updated = await this.repository.updateApplication(applicationId, {
        stage: 'submitted',
    });

    // Determine gate routing
    const gateRouting = await this.gateRoutingService.determineRouting(
        updated.job_id,
        updated.candidate_id
    );

    // Create CandidateRoleAssignment with gate routing
    let assignment = null;
    if (this.assignmentService && this.assignmentService.create) {
        try {
            const firstGateState = `awaiting_${gateRouting.firstGate}` as any;

            assignment = await this.assignmentService.create(clerkUserId, {
                candidate_id: updated.candidate_id,
                job_id: updated.job_id,
                recruiter_id: updated.recruiter_id,
                state: firstGateState,
                // NEW: Gate routing metadata
                current_gate: gateRouting.firstGate,
                gate_sequence: gateRouting.gateSequence,
                has_candidate_recruiter: gateRouting.hasCandidateRecruiter,
                has_company_recruiter: gateRouting.hasCompanyRecruiter,
            });

            // Publish gate event
            await this.eventPublisher?.publish('cra.gate.awaiting_review', {
                assignment_id: assignment.id,
                gate: gateRouting.firstGate,
                job_id: updated.job_id,
                candidate_id: updated.candidate_id,
                gate_sequence: gateRouting.gateSequence,
            });
        } catch (error) {
            console.error('Failed to create CandidateRoleAssignment:', error);
            // Don't fail the submission if CRA creation fails
        }
    }

    // Publish event
    if (this.eventPublisher) {
        const userContext = await this.accessResolver.resolve(clerkUserId);
        await this.eventPublisher.publish('application.submitted', {
            applicationId,
            candidate_id: application.candidate_id,
            job_id: application.job_id,
            submittedBy: userContext.identityUserId,
            has_assignment: !!assignment,
            gate_routing: gateRouting,
        });
    }

    return { application: updated, assignment };
}
```

---

## API Routes

### Step 7: Gate Action Endpoints

**File:** `services/ats-service/src/v2/candidate-role-assignments/routes.ts` (add to existing routes)

```typescript
/**
 * Gate action routes
 */

// Approve at current gate
app.post<{ Params: { id: string }; Body: { notes?: string } }>(
    "/api/v2/candidate-role-assignments/:id/gate/approve",
    {
        schema: {
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: {
                type: "object",
                properties: {
                    notes: { type: "string" },
                },
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const { notes } = request.body;
        const clerkUserId = request.headers["x-clerk-user-id"] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: "Authentication required" });
        }

        const assignment = await config.gateActionsService.approveGate(
            clerkUserId,
            id,
            notes,
        );

        return reply.send({ data: assignment });
    },
);

// Deny at current gate
app.post<{ Params: { id: string }; Body: { reason: string } }>(
    "/api/v2/candidate-role-assignments/:id/gate/deny",
    {
        schema: {
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: {
                type: "object",
                properties: {
                    reason: { type: "string" },
                },
                required: ["reason"],
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const { reason } = request.body;
        const clerkUserId = request.headers["x-clerk-user-id"] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: "Authentication required" });
        }

        const assignment = await config.gateActionsService.denyGate(
            clerkUserId,
            id,
            reason,
        );

        return reply.send({ data: assignment });
    },
);

// Request info at current gate
app.post<{ Params: { id: string }; Body: { request: string } }>(
    "/api/v2/candidate-role-assignments/:id/gate/request-info",
    {
        schema: {
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: {
                type: "object",
                properties: {
                    request: { type: "string" },
                },
                required: ["request"],
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const { request: infoRequest } = request.body;
        const clerkUserId = request.headers["x-clerk-user-id"] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: "Authentication required" });
        }

        const assignment = await config.gateActionsService.requestInfo(
            clerkUserId,
            id,
            infoRequest,
        );

        return reply.send({ data: assignment });
    },
);

// Provide info in response to request
app.post<{
    Params: { id: string };
    Body: { response: string; in_response_to_id: string };
}>(
    "/api/v2/candidate-role-assignments/:id/gate/provide-info",
    {
        schema: {
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
            body: {
                type: "object",
                properties: {
                    response: { type: "string" },
                    in_response_to_id: { type: "string" },
                },
                required: ["response", "in_response_to_id"],
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const { response, in_response_to_id } = request.body;
        const clerkUserId = request.headers["x-clerk-user-id"] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: "Authentication required" });
        }

        const assignment = await config.gateActionsService.provideInfo(
            clerkUserId,
            id,
            response,
            in_response_to_id,
        );

        return reply.send({ data: assignment });
    },
);

// Get gate feedback for assignment
app.get<{ Params: { id: string } }>(
    "/api/v2/candidate-role-assignments/:id/gate/feedback",
    {
        schema: {
            params: {
                type: "object",
                properties: {
                    id: { type: "string" },
                },
                required: ["id"],
            },
        },
    },
    async (request, reply) => {
        const { id } = request.params;
        const clerkUserId = request.headers["x-clerk-user-id"] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: "Authentication required" });
        }

        // Fetch feedback records
        const { data: feedback } = await config.supabase
            .from("cra_gate_feedback")
            .select("*, users(name, email)")
            .eq("assignment_id", id)
            .order("created_at", { ascending: true });

        return reply.send({ data: feedback || [] });
    },
);
```

---

## Frontend Implementation (Next Steps)

### Step 8: Recruiter Gate Review UI

**File:** `apps/portal/src/app/portal/gates/page.tsx`

```typescript
// Gate review dashboard for recruiters
// Shows applications awaiting review at their gate
// Allows approve/deny/request info actions
```

### Step 9: Company Gate Review UI

**File:** `apps/portal/src/app/portal/reviews/page.tsx`

```typescript
// Gate review dashboard for company users
// Shows applications that passed recruiter gates
// Allows company accept/reject actions
```

### Step 10: Candidate Gate Status UI

**File:** `apps/candidate/src/app/portal/applications/[id]/components/gate-status.tsx`

```typescript
// Shows candidate which gates their application is at
// Shows gate history (approved by X on date Y)
// Shows info requests from gates
```

---

## Testing Strategy

### Unit Tests

- [ ] `gate-routing.ts` - determineRouting() for all 4 scenarios
- [ ] `gate-actions.ts` - approve/deny/request info logic
- [ ] Permission validation for each gate type
- [ ] State transition validation

### Integration Tests

- [ ] Full gate flow: submission → routing → gate approval → next gate
- [ ] Info request → response → re-review cycle
- [ ] Denial at each gate type
- [ ] Permission violations

### E2E Tests

- [ ] Recruiter approves at candidate_recruiter gate
- [ ] Company recruiter approves at company_recruiter gate
- [ ] Company accepts at company gate
- [ ] Application passes all 3 gates successfully

---

## Acceptance Criteria

Phase 2 is complete when:

- [ ] Database schema includes all gate columns and feedback table
- [ ] Gate routing logic determines correct gate sequence for all 4 scenarios
- [ ] Gate actions (approve/deny/request info) work correctly
- [ ] Permission validation prevents unauthorized gate actions
- [ ] Gate feedback communication system works
- [ ] Events published for all gate transitions
- [ ] API endpoints available for all gate actions
- [ ] Frontend UI shows gate status to candidates
- [ ] Frontend UI allows recruiters/company to review at gates
- [ ] All tests passing (unit, integration, E2E)

---

## Implementation Timeline

**Week 1:** Database + Backend Core

- Days 1-2: Run migrations, add gate columns
- Days 3-4: Implement gate routing service
- Day 5: Implement gate actions service

**Week 2:** API + Events

- Days 1-2: Add API routes for gate actions
- Days 3-4: Event publishing and testing
- Day 5: Integration testing

**Week 3:** Frontend

- Days 1-2: Recruiter gate review UI
- Days 3-4: Company gate review UI
- Day 5: Candidate gate status UI

**Week 4:** Testing + Polish

- Days 1-3: E2E testing all gate scenarios
- Days 4-5: Bug fixes and polish

---

## Next Steps After Phase 2

**Phase 3:** Gate Actions UI Polish

- Advanced gate review dashboards
- Bulk actions for recruiters
- Gate analytics and metrics

**Phase 4:** Recruiter Proposals

- Recruiter can propose jobs to candidates
- Candidate accept/decline workflow
- Auto-create draft on acceptance

**Phase 5:** Full Hiring Pipeline

- Interview scheduling
- Offer management
- Hire action → placement creation

---

**Document Status:** 📋 READY FOR REVIEW  
**Last Updated:** January 16, 2026  
**Next Review:** After implementation begins
