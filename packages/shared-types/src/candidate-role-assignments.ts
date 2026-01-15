/**
 * Candidate Role Assignment Types
 * 
 * Manages the fiscal tracking and recruiter attribution for candidate-job pairings.
 * Each assignment represents one recruiter's exclusive right to work with a specific
 * candidate on a specific job opening.
 * 
 * Key Concepts:
 * - One assignment per candidate-job-recruiter tuple
 * - Tracks proposal lifecycle from proposed → accepted → submitted → closed
 * - Used for placement fee attribution and protection windows
 * - State machine enforces business rules around assignments
 */

import type { CandidateRoleAssignment } from './database/ats.types';

/**
 * Assignment State Machine
 * 
 * proposed → accepted → submitted → closed
 *         ↓
 *       declined / timed_out
 */
export type CandidateRoleAssignmentState =
    | 'proposed'     // Recruiter proposed to work this pairing
    | 'accepted'     // Recruiter accepted/assigned to work this pairing
    | 'declined'     // Recruiter or company declined the proposal
    | 'timed_out'    // Proposal expired without response
    | 'submitted'    // Application submitted to company
    | 'closed';      // Placement made or opportunity closed

/**
 * Enriched assignment with related data
 */
export interface EnrichedCandidateRoleAssignment extends CandidateRoleAssignment {
    job?: {
        id: string;
        title: string;
        company_id: string;
        company_name?: string;
        status: string;
    };
    candidate?: {
        id: string;
        name: string;
        email: string;
    };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    application_id?: string;      // If application exists
    placement_id?: string;        // If placement exists
}

/**
 * Input for creating new assignment
 */
export interface CandidateRoleAssignmentCreateInput {
    job_id: string;
    candidate_id: string;
    recruiter_id: string;
    state?: CandidateRoleAssignmentState;  // Defaults to 'accepted' for direct assignments
    proposed_by?: string;
    proposal_notes?: string;
    response_due_at?: Date;
}

/**
 * Input for updating assignment
 */
export interface CandidateRoleAssignmentUpdateInput {
    state?: CandidateRoleAssignmentState;
    response_notes?: string;
    accepted_at?: Date;
    declined_at?: Date;
    timed_out_at?: Date;
    submitted_at?: Date;
    closed_at?: Date;
}

/**
 * Filters for listing assignments
 */
export interface CandidateRoleAssignmentFilters {
    job_id?: string;
    candidate_id?: string;
    recruiter_id?: string;
    state?: CandidateRoleAssignmentState | CandidateRoleAssignmentState[];
    proposed_after?: Date;
    proposed_before?: Date;
}

/**
 * Proposal input for recruiter-initiated proposals
 */
export interface ProposeAssignmentInput {
    job_id: string;
    candidate_id: string;
    proposal_notes?: string;
}

/**
 * Response to proposal (accept/decline)
 */
export interface RespondToProposalInput {
    assignment_id: string;
    action: 'accept' | 'decline';
    response_notes?: string;
}

/**
 * Assignment statistics
 */
export interface AssignmentStats {
    total_assignments: number;
    by_state: Record<CandidateRoleAssignmentState, number>;
    active_assignments: number;        // accepted + submitted
    pending_proposals: number;         // proposed
    closed_assignments: number;        // closed
    average_time_to_acceptance?: number;  // milliseconds
    average_time_to_submission?: number;  // milliseconds
}

/**
 * Assignment validation error
 */
export interface AssignmentValidationError {
    code: 'DUPLICATE_ASSIGNMENT' | 'INVALID_STATE_TRANSITION' | 'EXPIRED_PROPOSAL' | 'MISSING_REQUIRED_FIELD';
    message: string;
    field?: string;
}
