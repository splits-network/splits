/**
 * Candidate Role Assignment Types
 * 
 * Manages the fiscal tracking and recruiter attribution for candidate-job pairings.
 * Each assignment tracks the relationship between a candidate, job, and up to TWO
 * distinct recruiter roles:
 * 
 * 1. Candidate Recruiter ("Closer") - Represents the candidate
 * 2. Company Recruiter ("Client/Hiring Facilitator") - Represents the company
 * 
 * Both roles are optional (nullable). Assignments can exist with:
 * - Both recruiters (full recruiter collaboration)
 * - Only candidate recruiter (candidate represented, company direct)
 * - Only company recruiter (company represented, candidate direct)
 * - Neither recruiter (direct candidate-company connection)
 * 
 * Key Concepts:
 * - One assignment per candidate-job pair (uniqueness enforced)
 * - Tracks proposal lifecycle through gate review system
 * - Gate sequence determined by which recruiter roles are filled
 * - Used for placement fee attribution and deal routing
 * - State machine enforces business rules around assignments
 */

import type { CandidateRoleAssignment } from './database/ats.types';

/**
 * Assignment State Machine
 * 
 * proposed → awaiting_candidate_recruiter → awaiting_company_recruiter → awaiting_company → submitted_to_company → in_process → offer → hired
 *         ↓
 *       rejected / declined / withdrawn / timed_out
 * 
 * Gates are skipped if corresponding recruiter role is not filled.
 */
export type CandidateRoleAssignmentState =
    // Proposal & Gate Review Phase
    | 'proposed'                    // Deal created, determining routing
    | 'awaiting_candidate_recruiter' // At candidate recruiter gate
    | 'awaiting_company_recruiter'   // At company recruiter gate
    | 'awaiting_company'             // At company gate
    | 'under_review'                 // Gate actively reviewing
    | 'info_requested'               // Gate requested more info

    // Deal Pipeline Phase
    | 'submitted_to_company'         // Passed all gates, in company's hands
    | 'screen'                       // Phone screening
    | 'in_process'                   // Interview process
    | 'offer'                        // Offer extended
    | 'hired'                        // Deal closed successfully

    // Terminal States
    | 'rejected'                     // Rejected by a gate or company
    | 'declined'                     // Candidate declined
    | 'withdrawn'                    // Candidate withdrew
    | 'timed_out';                   // Proposal expired without response

/**
 * Gate types in the review system
 */
export type GateType = 'candidate_recruiter' | 'company_recruiter' | 'company' | 'none';

/**
 * Gate review decision types
 */
export type GateDecision = 'approved' | 'denied' | 'info_requested';

/**
 * Individual gate history entry
 */
export interface GateHistoryEntry {
    gate: GateType;
    action: GateDecision;
    timestamp: string;  // ISO 8601
    reviewer_user_id: string;
    notes?: string;
}

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
    candidate_recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    company_recruiter?: {
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
    candidate_recruiter_id?: string;  // Optional - Closer role
    company_recruiter_id?: string;    // Optional - Client/Hiring Facilitator role
    state?: CandidateRoleAssignmentState;  // Defaults to 'proposed'
    proposed_by: string;              // Required - who initiated this CRA
    proposal_notes?: string;
    response_due_at?: Date;
}

/**
 * Input for updating assignment
 */
export interface CandidateRoleAssignmentUpdateInput {
    state?: CandidateRoleAssignmentState;
    candidate_recruiter_id?: string;
    company_recruiter_id?: string;
    current_gate?: GateType | null;  // Allow null to clear gate
    gate_sequence?: string[];         // Allow updating gate sequence
    gate_history?: any[];             // Allow updating gate history (JSONB)
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
    candidate_recruiter_id?: string;  // Filter by Closer role
    company_recruiter_id?: string;    // Filter by Client/Hiring Facilitator role
    state?: CandidateRoleAssignmentState | CandidateRoleAssignmentState[];
    current_gate?: GateType;
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
