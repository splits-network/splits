export interface AuditLogEntry {
    id: string;
    application_id: string;
    action: string;
    performed_by_user_id?: string;
    performed_by_role?: string;
    company_id?: string;
    old_value?: Record<string, any>;
    new_value?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface TimelineEvent {
    id: string;
    label: string;
    description?: string;
    icon: string;
    color: string;
    performedByRole?: string;
    roleLabel?: string;
    timestamp: string;
    details?: Record<string, string>;
    rawAction: string;
}

export type ViewerRole = 'candidate' | 'recruiter' | 'company' | 'admin';

export const STAGE_DISPLAY_NAMES: Record<string, string> = {
    draft: 'Draft',
    ai_review: 'AI Review',
    ai_reviewed: 'AI Reviewed',
    recruiter_proposed: 'Recruiter Proposed',
    recruiter_request: 'Recruiter Request',
    recruiter_review: 'Recruiter Review',
    screen: 'Screening',
    submitted: 'Submitted',
    company_review: 'Company Review',
    company_feedback: 'Company Feedback',
    interview: 'Interview',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    expired: 'Expired',
};

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
    candidate: 'Candidate',
    recruiter: 'Recruiter',
    company: 'Company',
    system: 'System',
    hiring_manager: 'Hiring Manager',
    unknown: 'Unknown',
};

/** Ordered pipeline stages for the direct (no recruiter) path */
export const DIRECT_PIPELINE_STAGES = [
    'draft',
    'ai_review',
    'submitted',
    'company_review',
    'interview',
    'offer',
    'hired',
] as const;

/** Ordered pipeline stages for the recruiter path */
export const RECRUITER_PIPELINE_STAGES = [
    'draft',
    'ai_review',
    'recruiter_review',
    'screen',
    'submitted',
    'company_review',
    'interview',
    'offer',
    'hired',
] as const;
