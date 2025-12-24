/**
 * Unified Proposals System - Type Definitions
 * 
 * Defines types for the unified proposal management interface that handles
 * all approval workflows across the Splits Network platform.
 * 
 * @see docs/guidance/unified-proposals-system.md
 */

/**
 * Proposal Types - All workflow types on the platform
 */
export type ProposalType = 
    | 'job_opportunity'        // Recruiter sends job to candidate
    | 'direct_application'     // Candidate applies directly to company
    | 'application_screen'     // Candidate approved job, recruiter must screen
    | 'application_review'     // Recruiter/Candidate submitted to company
    | 'collaboration'          // Recruiter proposes collaboration to another recruiter
    | 'interview_invitation'   // Company invites candidate to interview (future)
    | 'job_offer';             // Company extends offer to candidate (future)

/**
 * Who can take action on a proposal
 */
export type ActionParty = 
    | 'candidate' 
    | 'recruiter' 
    | 'company_recruiter'      // Company-side recruiter in collaboration scenario
    | 'company'
    | 'admin';

/**
 * Types of actions that can be performed on proposals
 */
export type ActionType = 
    | 'approve'      // Accept opportunity, approve candidate for submission
    | 'decline'      // Reject opportunity, decline candidate
    | 'screen'       // Conduct phone screen with candidate
    | 'review'       // Review application materials
    | 'interview'    // Schedule or conduct interview
    | 'offer'        // Extend job offer
    | 'accept'       // Accept offer
    | 'negotiate'    // Counter-offer or negotiate terms
    | 'withdraw';    // Withdraw application or offer

/**
 * Visual badge configuration for proposal status
 */
export interface StatusBadge {
    text: string;
    color: 'info' | 'warning' | 'success' | 'error' | 'neutral';
    icon: string;
}

/**
 * AI analysis result (when applicable)
 */
export interface AIAnalysisResult {
    fit_grade: string;        // A-F grade
    fit_score: number;        // 0-100 score
    strengths: string[];      // Key strengths
    concerns: string[];       // Potential concerns
    recommendation: string;   // Overall recommendation
    skills_matched: string[];
    skills_missing: string[];
}

/**
 * Party information in a proposal
 */
export interface ProposalParty {
    id: string;
    name: string;
    email?: string;
    type: 'candidate' | 'recruiter' | 'company';
}

/**
 * Unified Proposal Interface
 * 
 * Represents any approval workflow on the platform. All proposals share
 * this common structure regardless of type.
 */
export interface UnifiedProposal {
    // Core identifiers
    id: string;
    type: ProposalType;
    stage: string;  // Application stage from ats.applications
    
    // Parties involved
    candidate: ProposalParty;
    recruiter?: ProposalParty;           // Candidate's recruiter (if represented)
    company_recruiter?: ProposalParty;   // Company-side recruiter (if collaboration)
    company: ProposalParty;
    
    // Job details
    job_id: string;
    job_title: string;
    job_description?: string;
    job_location?: string;
    
    // Action tracking
    pending_action_by: ActionParty;
    pending_action_type: ActionType;
    can_current_user_act: boolean;       // Derived from user role + pending_action_by
    
    // Deadlines and urgency
    action_due_date?: Date;
    expires_at?: Date;
    is_urgent: boolean;                  // < 24 hours or overdue
    is_overdue: boolean;
    hours_remaining?: number;
    
    // Context and metadata
    proposal_notes?: string;             // Initial pitch/notes from proposer
    response_notes?: string;             // Response reasoning from responder
    ai_analysis?: AIAnalysisResult;      // AI review results if applicable
    metadata?: Record<string, any>;      // Additional type-specific data
    
    // Timestamps
    created_at: Date;
    updated_at: Date;
    responded_at?: Date;
    
    // Display helpers
    status_badge: StatusBadge;
    action_label: string;                // "Review Application", "Accept Opportunity", etc.
    subtitle: string;                    // Contextual subtitle for card display
}

/**
 * Filters for querying proposals
 */
export interface ProposalFilters {
    // Filter by state
    state?: 'actionable' | 'waiting' | 'completed' | 'all';
    
    // Filter by type
    type?: ProposalType;
    
    // Filter by urgency
    urgent_only?: boolean;
    
    // Full-text search
    search?: string;
    
    // Date ranges
    created_after?: Date;
    created_before?: Date;
    
    // Sorting
    sort_by?: 'urgency' | 'date' | 'status' | 'job_title';
    sort_order?: 'asc' | 'desc';
    
    // Pagination
    page?: number;
    limit?: number;
}

/**
 * Response from proposals API
 */
export interface ProposalsResponse {
    data: UnifiedProposal[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    summary: {
        actionable_count: number;
        waiting_count: number;
        urgent_count: number;
        overdue_count: number;
    };
}

/**
 * Request body for proposal actions
 */
export interface ProposalActionRequest {
    action: ActionType;
    notes?: string;
    metadata?: Record<string, any>;
}

/**
 * Helper function to determine proposal type from application stage
 */
export function getProposalTypeFromStage(
    stage: string,
    recruiterId?: string
): ProposalType {
    switch (stage) {
        case 'recruiter_proposed':
            return 'job_opportunity';
        case 'draft':
        case 'ai_review':
            return recruiterId ? 'application_screen' : 'direct_application';
        case 'screen':
            return 'application_screen';
        case 'submitted':
        case 'interview':
            return 'application_review';
        case 'offer':
            return 'job_offer';
        default:
            return 'application_review';
    }
}

/**
 * Helper function to determine who needs to act based on stage
 */
export function getPendingActionParty(
    stage: string,
    recruiterId?: string
): ActionParty {
    switch (stage) {
        case 'recruiter_proposed':
            return 'candidate';
        case 'ai_review':
        case 'screen':
            return recruiterId ? 'recruiter' : 'company';
        case 'submitted':
        case 'interview':
        case 'offer':
            return 'company';
        default:
            return 'company';
    }
}

/**
 * Helper function to get action type from stage
 */
export function getActionType(stage: string): ActionType {
    switch (stage) {
        case 'recruiter_proposed':
            return 'approve';
        case 'ai_review':
        case 'screen':
            return 'screen';
        case 'submitted':
            return 'review';
        case 'interview':
            return 'interview';
        case 'offer':
            return 'accept';
        default:
            return 'review';
    }
}
