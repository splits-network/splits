// Identity domain types
export interface User {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string;
    onboarding_status?: string;
    onboarding_step?: number;
    onboarding_completed_at?: Date;
    onboarding_metadata?: OnboardingMetadata; // New persistent state
    created_at: Date;
    updated_at: Date;
}

// Onboarding types
export type OnboardingUserType = 'recruiter' | 'company' | null;

export interface PersonalInfo {
    name?: string;
    email?: string;
    phone?: string;
    experience_years?: number;
    resume_url?: string;
}

export interface CompanyInfo {
    name?: string;
    website?: string;
    size?: number;
    description?: string;
}

export interface JobInfo {
    title?: string;
    description?: string;
    requirements?: string[];
    locations?: string[];
    salary_min?: number;
    salary_max?: number;
    remote_ok?: boolean;
}

export interface MarketplaceProfile {
    // Recruitment specialization
    industries?: string[];
    job_levels?: string[];
    skills_expertise?: string[];

    // Rates and fees
    placement_fee_type?: 'percentage' | 'flat';
    placement_fee_amount?: number;

    // Professional profile
    bio?: string;
    linkedin_url?: string;
    website_url?: string;

    // Service settings
    available_for_work?: boolean;
    max_concurrent_roles?: number;
    preferred_communication?: string[];
}

export interface SelectedPlan {
    plan_id?: string;
    billing_cycle?: 'monthly' | 'annual';
    price?: number;
}

export interface StripePaymentInfo {
    payment_method_id?: string;
    customer_id?: string;
    subscription_id?: string;
}

export interface OnboardingMetadata {
    // Core onboarding state
    user_type?: OnboardingUserType;
    current_step?: number;
    completed_steps?: number[];
    last_active_step?: number;

    // Form data by step
    personal_info?: PersonalInfo;
    company_info?: CompanyInfo;
    job_info?: JobInfo;
    marketplace_profile?: MarketplaceProfile;
    selected_plan?: SelectedPlan;
    stripe_payment_info?: StripePaymentInfo;

    // Step completion tracking
    personal_info_completed?: boolean;
    company_info_completed?: boolean;
    job_info_completed?: boolean;
    marketplace_profile_completed?: boolean;
    payment_completed?: boolean;

    // Session metadata
    started_at?: string; // ISO date string
    last_updated_at?: string; // ISO date string
    device_info?: {
        user_agent?: string;
        platform?: string;
    };
}

export interface Organization {
    id: string;
    name: string;
    type: 'company' | 'recruiter';
    created_at: Date;
    updated_at: Date;
}

/** All possible role names in the system */
export type RoleName = 'platform_admin' | 'company_admin' | 'hiring_manager' | 'recruiter' | 'candidate';

/** A role definition from the roles table */
export interface RoleDefinition {
    id: string;
    name: RoleName;
    display_name: string;
    description: string | null;
    permissions: Record<string, Record<string, boolean>>;
    is_system: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/** A user's entity-linked role assignment from the user_roles table (recruiter, candidate) */
export interface UserRole {
    id: string;
    user_id: string;
    role_name: RoleName;
    role_entity_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

/** An org-scoped membership from the memberships table (company_admin, hiring_manager, platform_admin) */
export interface Membership {
    id: string;
    user_id: string;
    role_name: RoleName;
    organization_id: string;
    company_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// ATS domain types
export interface Company {
    id: string;
    identity_organization_id?: string;
    name: string;
    website?: string;
    industry?: string;
    company_size?: string;
    headquarters_location?: string;
    description?: string;
    logo_url?: string;
    created_at: Date;
    updated_at: Date;
}

export type JobStatus = 'active' | 'paused' | 'filled' | 'closed';

export type EmploymentType = 'full_time' | 'contract' | 'temporary';

export type RequirementType = 'mandatory' | 'preferred';

export interface Job {
    id: string;
    company_id: string;
    title: string;
    department?: string;
    location?: string;
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;
    description?: string; // Deprecated: use recruiter_description
    recruiter_description?: string;
    candidate_description?: string;
    employment_type?: EmploymentType;
    open_to_relocation: boolean;
    show_salary_range: boolean;
    guarantee_days?: number; // Placement guarantee period in days (default 90)
    job_owner_id?: string; // Splits Network or recruiting partner GUID
    recruiter_id?: string; // Legacy: company recruiter (Client/Hiring Facilitator role) - use company_recruiter_id
    company_recruiter_id?: string; // Company recruiter (Client/Hiring Facilitator role) - represents company
    job_owner_recruiter_id?: string; // Job owner (Specs Owner role) - recruiter who posted job (recruiter-only, external postings only)
    status: JobStatus;
    created_at: Date;
    updated_at: Date;
    company?: Company;  // Enriched data from service layer
    requirements?: JobRequirement[]; // Enriched data from service layer
    pre_screen_questions?: JobPreScreenQuestion[]; // Enriched data from service layer
}

export interface JobRequirement {
    id: string;
    job_id: string;
    requirement_type: RequirementType;
    description: string;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

export type PreScreenQuestionType = 'text' | 'yes_no' | 'select' | 'multi_select';

export interface JobPreScreenQuestion {
    id: string;
    job_id: string;
    question: string;
    question_type: PreScreenQuestionType;
    options?: string[]; // For select/multi_select types - stored as JSON
    is_required: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

export type CandidateVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Candidate {
    id: string;
    email: string;
    full_name: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    phone?: string;
    location?: string;
    current_title?: string;
    current_company?: string;
    bio?: string;
    skills?: string;
    user_id?: string; // If set, candidate is self-managed (has their own account); if null, recruiter-managed
    recruiter_id?: string; // SOURCER: The recruiter who brought this candidate to the platform (permanent credit for visibility, NOT editing)
    verification_status: CandidateVerificationStatus; // Verification status: unverified (default when recruiter adds), pending, verified, rejected
    verification_metadata?: Record<string, any>; // Additional verification details
    verified_at?: Date;
    verified_by_user_id?: string;

    // Marketplace enhancement fields
    marketplace_visibility?: 'public' | 'private' | 'hidden';
    marketplace_profile?: MarketplaceProfile; // Rich bio and other structured content
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    show_current_company?: boolean;
    show_salary_expectations?: boolean;
    desired_salary_min?: number;
    desired_salary_max?: number;
    desired_job_type?: string;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    availability?: string;

    created_at: Date;
    updated_at: Date;
}

// Masked candidate data for company users before acceptance
export interface MaskedCandidate {
    id: string;
    email: string; // Will be "hidden@splits.network"
    full_name: string; // Will be initials like "J.D."
    linkedin_url?: string; // Will be undefined
    verification_status: CandidateVerificationStatus; // Show verification status even when masked
    created_at: Date;
    updated_at: Date;
    _masked: true; // Flag to indicate this is masked data
}

export type ApplicationStage =
    // Candidate self-service stages
    | 'draft'              // Candidate working on application
    | 'ai_review'          // AI analyzing fit
    | 'ai_reviewed'        // AI review complete, awaiting candidate action

    // Recruiter involvement stages
    | 'recruiter_request'  // Recruiter requested more details from candidate (should also contain notes that are appended to recruiter_notes)
    | 'recruiter_proposed' // Recruiter proposed candidate to job (should also include notes that are appended to recruiter_notes)
    | 'recruiter_review'   // Recruiter reviewing before submission

    // Company review stages (replaces CRA gates)
    | 'screen'             // Initial screen phase if no company recruiter, it will be shown to company and prompted for engaging a recruiter for screening
    | 'submitted'          // Submitted to company
    | 'company_review'     // Company reviewing candidate, now company can see candidate details
    | 'company_feedback'   // Company provided feedback, awaiting next action (if company recruiter assigned, they handle feedback; if not, recruiter assigned to job handles feedback; if none assigned, candidate notified directly)
    | 'interview'          // Interview scheduled/in-progress
    | 'offer'              // Offer extended

    // Terminal states
    | 'hired'              // Candidate hired → create placement
    | 'rejected'           // Company/recruiter rejected
    | 'withdrawn'          // Candidate withdrew
    | 'expired'            // Timed out without action
    ;

// ===== Application Notes (formerly Application Feedback) =====

export type ApplicationNoteType =
    | 'info_request'       // Someone requested more info
    | 'info_response'      // Response to info request
    | 'note'               // General comment/guidance
    | 'improvement_request' // Specific change requested
    | 'stage_transition'   // Notes during stage changes
    | 'interview_feedback' // Company interview notes
    | 'general';           // Catch-all type

export type ApplicationNoteCreatorType =
    | 'candidate'
    | 'candidate_recruiter'
    | 'company_recruiter'
    | 'hiring_manager'
    | 'company_admin'
    | 'platform_admin';

export type ApplicationNoteVisibility =
    | 'shared'        // Visible to all parties
    | 'company_only'  // Only visible to company-side users
    | 'candidate_only'; // Only visible to candidate-side users

export interface ApplicationNote {
    id: string;
    application_id: string;
    created_by_user_id: string;
    created_by_type: ApplicationNoteCreatorType;
    note_type: ApplicationNoteType;
    visibility: ApplicationNoteVisibility;
    message_text: string;
    in_response_to_id?: string;
    created_at: Date;
    updated_at: Date;
    // Enriched data from service layer
    created_by?: { id: string; name: string; email: string };
    in_response_to?: ApplicationNote;
}

// Legacy aliases for backwards compatibility during migration
/** @deprecated Use ApplicationNoteType instead */
export type ApplicationFeedbackType = ApplicationNoteType;
/** @deprecated Use ApplicationNoteCreatorType instead */
export type ApplicationFeedbackCreatorType = ApplicationNoteCreatorType;
/** @deprecated Use ApplicationNote instead */
export type ApplicationFeedback = ApplicationNote;
// Audit log for tracking application actions
export interface ApplicationAuditLog {
    id: string;
    application_id: string;
    action: 'accepted' | 'rejected' | 'stage_changed' | 'viewed' | 'created' | 'draft_saved' | 'recruiter_request' | 'submitted_to_recruiter' | 'recruiter_reviewed' | 'submitted_to_company' | 'withdrawn' | 'prescreen_requested' | 'note_added' | 'ai_review_started' | 'ai_review_completed' | 'ai_review_failed' | 'recruiter_proposed_job' | 'candidate_approved_opportunity' | 'candidate_declined_opportunity' | 'returned_to_draft' | 'submitted' | 'recruiter_proposed' | 'proposal_accepted' | 'proposal_declined' | 'hired';
    performed_by_user_id?: string;
    performed_by_role?: string;
    company_id?: string;
    old_value?: Record<string, any>;
    new_value?: Record<string, any>;
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
}

// AI Review types
export type AIRecommendation = 'strong_fit' | 'good_fit' | 'fair_fit' | 'poor_fit';
export type LocationCompatibility = 'perfect' | 'good' | 'challenging' | 'mismatch';

export interface AISkillsMatch {
    matched_skills: string[];
    missing_skills: string[];
    match_percentage: number;
}

export interface AIExperienceAnalysis {
    required_years: number;
    candidate_years: number;
    meets_requirement: boolean;
}

export interface AIReview {
    id: string;
    application_id: string;

    // AI Analysis Results
    fit_score: number; // 0-100
    recommendation: AIRecommendation;
    overall_summary: string;
    confidence_level: number; // 0-100

    // Detailed Analysis
    strengths: string[];
    concerns: string[];
    skills_match: AISkillsMatch;

    // Experience Analysis
    experience_analysis: AIExperienceAnalysis;

    // Location
    location_compatibility: LocationCompatibility;

    // Metadata
    model_version: string;
    processing_time_ms: number;
    analyzed_at: Date;
    created_at: Date;
}

export interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    candidate_recruiter_id?: string | null;  // Renamed from recruiter_id for clarity - represents candidate (Closer role)
    stage: ApplicationStage;

    // Application content
    cover_letter?: string;     // Candidate's cover letter
    salary?: number;           // Candidate's requested salary

    // Submission and hire tracking
    submitted_at?: Date | null;
    hired_at?: Date | null;
    placement_id?: string | null;  // Link to placement record when hired

    // Legacy fields (maintained for compatibility)
    accepted_by_company: boolean;
    accepted_at?: Date;
    ai_reviewed: boolean;  // Whether AI review has been completed

    // Timestamps
    created_at: Date;
    updated_at: Date;

    // Enriched data from service layer (not stored in DB)
    candidate?: Candidate | MaskedCandidate;
    recruiter?: { id: string; name: string; email: string };
    job?: Job;
    ai_review?: AIReview;  // AI analysis results (enriched)
}

export type PlacementState = 'hired' | 'active' | 'completed' | 'failed';

export interface Placement {
    id: string;
    job_id: string;
    candidate_id: string;
    company_id: string;

    // 5-role commission structure (all nullable)
    candidate_recruiter_id?: string | null;        // Closer role
    company_recruiter_id?: string | null;          // Client/Hiring Facilitator role  
    job_owner_recruiter_id?: string | null;        // Specs Owner role
    candidate_sourcer_recruiter_id?: string | null; // Discovery role
    company_sourcer_recruiter_id?: string | null;   // BD role

    application_id?: string;
    hired_at: Date;
    salary: number;
    fee_percentage: number;
    fee_amount: number;
    placement_fee?: number | null;  // Total placement fee
    recruiter_share: number;
    platform_share: number;
    created_at: Date;
    updated_at: Date;
    // Phase 2: Placement lifecycle
    state?: PlacementState;
    start_date?: Date;
    end_date?: Date;
    guarantee_days?: number;
    guarantee_expires_at?: Date;
    failure_reason?: string;
    failed_at?: Date;
    replacement_placement_id?: string;
}

// Network domain types
export type RecruiterStatus = 'pending' | 'active' | 'suspended';

export type MarketplaceVisibility = 'public' | 'limited' | 'hidden';

/**
 * Structured marketplace profile data
 * Allows recruiters to add rich content beyond basic fields
 */
export interface MarketplaceProfile {
    bio_rich?: string;  // Rich text/markdown bio (Phase 1)
    specialties?: string[]; // Areas of expertise
    industries?: string[];  // Industries served
    // Future Phase 1 fields:
    // education?: { institution: string; degree: string; fieldOfStudy: string; startYear: number; endYear: number }[];
    // Future Phase 2 fields:
    // achievements?: { title: string; description: string; year: number }[];
    // certifications?: { name: string; issuer: string; year: number }[];
    // specializations?: { area: string; yearsExperience: number }[];
    // Future Phase 3 fields:
    // portfolio_items?: { title: string; description: string; url?: string }[];
    // media_urls?: string[];
}

export interface Recruiter {
    id: string;
    user_id: string;
    status: RecruiterStatus;
    bio?: string;
    // Core profile fields (all recruiters)
    industries?: string[];
    specialties?: string[];
    location?: string;
    tagline?: string;
    years_experience?: number;
    created_at: Date;
    updated_at: Date;
    // Marketplace-specific fields (opt-in)
    marketplace_enabled?: boolean;
    marketplace_profile?: MarketplaceProfile;
    marketplace_visibility?: MarketplaceVisibility;
    show_success_metrics?: boolean;
    show_contact_info?: boolean;
}

export interface RoleAssignment {
    id: string;
    job_id: string;
    recruiter_id: string;
    assigned_at: Date;
    assigned_by?: string;
}

// Marketplace domain types
export type MarketplaceConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface MarketplaceConnection {
    id: string;
    candidate_user_id: string; // users.id
    recruiter_id: string; // recruiters.id
    status: MarketplaceConnectionStatus;
    message?: string;
    created_at: Date;
    updated_at: Date;
    responded_at?: Date;
}

export type MarketplaceSenderType = 'candidate' | 'recruiter';

export interface MarketplaceMessage {
    id: string;
    connection_id: string;
    sender_user_id: string; // users.id
    sender_type: MarketplaceSenderType;
    message: string;
    read_at?: Date;
    created_at: Date;
}

export interface MarketplaceConfig {
    id: string;
    key: string;
    value: any; // JSON value
    description?: string;
    created_at: Date;
    updated_at: Date;
}

// Billing domain types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Plan {
    id: string;
    name: string;
    price_monthly: number;
    stripe_price_id?: string;
    features: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

export interface Subscription {
    id: string;
    recruiter_id: string;
    plan_id: string;
    stripe_subscription_id?: string;
    status: SubscriptionStatus;
    current_period_start?: Date;
    current_period_end?: Date;
    cancel_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// ============================================================================
// Phase 2 Types
// ============================================================================

// Candidate Ownership & Sourcing
export type SourcerType = 'recruiter' | 'tsn';

export interface CandidateSourcer {
    id: string;
    candidate_id: string;
    sourcer_user_id: string;
    sourcer_type: SourcerType;
    sourced_at: Date;
    protection_window_days: number;
    protection_expires_at: Date;
    notes?: string;
    created_at: Date;
}
// Recruiter-Candidate Relationship (12-month renewable relationship)
export type RecruiterCandidateStatus = 'active' | 'expired' | 'terminated' | 'pending' | 'accepted' | 'declined' | 'cancelled';
export const RecruiterCandidateStatusFilter = {
    all: 'All',
    active: 'Active',
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    terminated: 'Terminated',
    cancelled: 'Cancelled',
} as const;

export interface RecruiterCandidate {
    id: string;
    recruiter_id: string;
    candidate_id: string;
    relationship_start_date: Date;
    relationship_end_date: Date; // 12 months from start
    status: RecruiterCandidateStatus;
    // Invitation and consent tracking
    invited_at: Date;
    invitation_token?: string;
    invitation_expires_at?: Date;
    consent_given: boolean;
    consent_given_at?: Date;
    consent_ip_address?: string;
    consent_user_agent?: string;
    declined_at?: Date;
    declined_reason?: string;
    created_at: Date;
    updated_at: Date;
}

// Enriched version with joined candidate data (for API responses)
export interface RecruiterCandidateWithCandidate extends RecruiterCandidate {
    candidate?: {
        id: string;
        full_name: string;
        email: string;
        phone?: string;
        profile_picture?: string;
        current_title?: string;
        current_company?: string;
        location?: string;
        verification_status?: string;
    };
    recruiter_name?: string;
    recruiter_email?: string;
    recruiter_bio?: string;
    recruiter_status?: string;
}

// Multi-Recruiter Placements
export type CollaboratorRole = 'sourcer' | 'submitter' | 'closer' | 'support';

export interface PlacementCollaborator {
    id: string;
    placement_id: string;
    recruiter_user_id: string;
    role: CollaboratorRole;
    split_percentage: number;
    split_amount: number;
    notes?: string;
    created_at: Date;
}

// Reputation System
export interface RecruiterReputation {
    recruiter_id: string;
    total_submissions: number;
    total_hires: number;
    hire_rate?: number;
    total_placements: number;
    completed_placements: number;
    failed_placements: number;
    completion_rate?: number;
    total_collaborations: number;
    collaboration_rate?: number;
    avg_response_time_hours?: number;
    proposals_accepted: number;
    proposals_declined: number;
    proposals_timed_out: number;
    reputation_score: number; // 0-100
    last_calculated_at?: Date;
    created_at: Date;
    updated_at: Date;
}

// Outreach Tracking
export interface CandidateOutreach {
    id: string;
    candidate_id: string;
    recruiter_user_id: string;
    job_id?: string;
    sent_at: Date;
    email_subject: string;
    email_body: string;
    opened_at?: Date;
    clicked_at?: Date;
    replied_at?: Date;
    unsubscribed_at?: Date;
    bounced: boolean;
    created_at: Date;
}

// Marketplace Events Log
export interface MarketplaceEvent {
    id: string;
    event_type: string;
    event_data: Record<string, any>;
    user_id?: string;
    recruiter_id?: string;
    job_id?: string;
    candidate_id?: string;
    placement_id?: string;
    created_at: Date;
}

// ============================================================================
// Phase 3 Types - Automated Payouts & Intelligence
// ============================================================================

// Payout System
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'on_hold';

export interface Payout {
    id: string;
    placement_id: string;
    recruiter_id: string;

    // Amounts
    placement_fee: number;
    recruiter_share_percentage: number;
    payout_amount: number;

    // Stripe details
    stripe_transfer_id?: string;
    stripe_payout_id?: string;
    stripe_connect_account_id?: string;

    // Status tracking
    status: PayoutStatus;
    processing_started_at?: Date;
    completed_at?: Date;
    failed_at?: Date;
    failure_reason?: string;

    // Escrow/Holdback
    holdback_amount: number;
    holdback_released_at?: Date;

    // Audit
    created_at: Date;
    updated_at: Date;
    created_by?: string;
}

export type PayoutScheduleStatus = 'scheduled' | 'triggered' | 'cancelled';

export interface PayoutSchedule {
    id: string;
    placement_id: string;
    scheduled_date: Date;
    trigger_event: string; // guarantee_complete, replacement_cleared, manual
    status: PayoutScheduleStatus;
    triggered_at?: Date;
    cancelled_at?: Date;
    cancellation_reason?: string;
    created_at: Date;
    updated_at: Date;
}

export interface PayoutSplit {
    id: string;
    payout_id: string;
    collaborator_recruiter_id: string;
    split_percentage: number;
    split_amount: number;
    status: PayoutStatus;
    stripe_transfer_id?: string;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
}

export type EscrowHoldStatus = 'active' | 'released' | 'forfeited';

export interface EscrowHold {
    id: string;
    placement_id: string;
    payout_id?: string;
    hold_amount: number;
    hold_reason: string;
    held_at: Date;
    release_scheduled_date?: Date;
    released_at?: Date;
    released_by?: string;
    status: EscrowHoldStatus;
    created_at: Date;
    updated_at: Date;
}

export interface PayoutAuditLog {
    id: string;
    payout_id: string;
    event_type: string;
    old_status?: string;
    new_status?: string;
    old_amount?: number;
    new_amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
    created_at: Date;
    created_by: string;
}

// Decision Audit System
export interface DecisionAuditLog {
    id: string;
    decision_type: string; // ai_suggestion_accepted, automation_triggered, fraud_flag_raised, etc.
    entity_type: string; // placement, application, recruiter, etc.
    entity_id: string;
    decision_data: Record<string, any>;
    ai_confidence_score?: number;
    human_override?: boolean;
    override_reason?: string;
    created_by?: string; // 'system' for automated decisions
    created_at: Date;
}

// AI Match Suggestions
export interface CandidateRoleMatch {
    id: string;
    candidate_id: string;
    job_id: string;
    match_score: number; // 0-100
    match_reason: string[]; // Explainable factors
    suggested_at: Date;
    suggested_by: 'system' | string;
    reviewed_by?: string;
    reviewed_at?: Date;
    accepted?: boolean;
    rejection_reason?: string;
    created_at: Date;
}

// Fraud Detection
export type FraudSignalSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FraudSignalStatus = 'active' | 'resolved' | 'false_positive';

export interface FraudSignal {
    id: string;
    signal_type: string; // duplicate_submission, suspicious_pattern, velocity_anomaly, etc.
    severity: FraudSignalSeverity;
    status: FraudSignalStatus;

    // Affected entities
    recruiter_id?: string;
    job_id?: string;
    candidate_id?: string;
    application_id?: string;
    placement_id?: string;

    // Signal data
    signal_data: Record<string, any>;
    confidence_score: number; // 0-100

    // Resolution
    reviewed_by?: string;
    reviewed_at?: Date;
    resolution_notes?: string;
    action_taken?: string;

    created_at: Date;
    updated_at: Date;
}

// Automation Rules
export type AutomationRuleStatus = 'active' | 'paused' | 'disabled';

export interface AutomationRule {
    id: string;
    name: string;
    description: string;
    rule_type: string; // stage_transition, notification, payout_trigger, etc.
    status: AutomationRuleStatus;

    // Rule definition
    trigger_conditions: Record<string, any>;
    actions: Record<string, any>[];

    // Safety
    requires_human_approval: boolean;
    max_executions_per_day?: number;

    // Stats
    times_triggered: number;
    times_executed: number;
    last_triggered_at?: Date;
    last_executed_at?: Date;

    created_by: string;
    created_at: Date;
    updated_at: Date;
}

// Automation Executions
export type AutomationExecutionStatus =
    | 'pending'
    | 'pending_approval'
    | 'approved'
    | 'executing'
    | 'completed'
    | 'failed'
    | 'rejected';

export interface AutomationExecution {
    id: string;
    rule_id: string;

    // Trigger details
    trigger_data: Record<string, any>;
    triggered_by: string;

    // Execution status
    status: AutomationExecutionStatus;
    requires_human_approval: boolean;

    // Approval workflow
    approved_by?: string;
    approved_at?: Date;
    rejected_by?: string;
    rejected_at?: Date;
    rejection_reason?: string;

    // Execution results
    executed_at?: Date;
    action_result?: Record<string, any>;
    error_message?: string;

    created_at: Date;
    updated_at: Date;
}

// ============================================================================
// Notification Types (Email + In-App)
// ============================================================================

export type NotificationChannel = 'email' | 'in_app' | 'both';
export type NotificationStatus = 'sent' | 'failed' | 'pending';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationLog {
    id: string;
    event_type: string;
    recipient_user_id?: string;
    recipient_email: string;
    subject: string;
    template: string;
    payload?: Record<string, any>;

    // Channel and delivery
    channel: NotificationChannel;
    status: NotificationStatus;
    sent_at?: Date;
    error_message?: string;

    // Email-specific fields
    resend_message_id?: string;

    // In-app specific fields
    read: boolean;
    read_at?: Date;
    dismissed: boolean;
    action_url?: string;
    action_label?: string;
    priority: NotificationPriority;
    category?: string;

    created_at: Date;
}
