export const getStatusColor = (stage: string) => {
    switch (stage) {
        case 'draft':
            return 'badge-ghost';
        case 'ai_review':
            return 'badge-warning';
        case 'ai_reviewed':
            return 'badge-success badge-soft';
        case 'screen':
        case 'submitted':
            return 'badge-info';
        case 'recruiter_proposed':
            return 'badge-secondary';
        case 'recruiter_request':
            return 'badge-info';
        case 'recruiter_review':
            return 'badge-info';
        case 'company_review':
            return 'badge-accent';
        case 'company_feedback':
            return 'badge-accent badge-soft';
        case 'interview':
            return 'badge-primary';
        case 'offer':
            return 'badge-success badge-soft';
        case 'hired':
            return 'badge-success';
        case 'rejected':
            return 'badge-error';
        case 'withdrawn':
            return 'badge-error badge-soft';
        case 'expired':
            return 'badge-ghost';
        default:
            return 'badge-ghost';
    }
};

export const formatStage = (stage: string) => {
    switch (stage) {
        case 'draft':
            return 'Draft';
        case 'ai_review':
            return 'AI Review';
        case 'ai_reviewed':
            return 'AI Reviewed';
        case 'screen':
            return 'Screening';
        case 'recruiter_proposed':
            return 'Recruiter Proposed';
        case 'recruiter_request':
            return 'Recruiter Request';
        case 'recruiter_review':
            return 'Recruiter Review';
        case 'submitted':
            return 'Submitted';
        case 'company_review':
            return 'Company Review';
        case 'company_feedback':
            return 'Company Feedback';
        case 'interview':
            return 'Interview';
        case 'offer':
            return 'Offer';
        case 'hired':
            return 'Hired';
        case 'rejected':
            return 'Rejected';
        case 'withdrawn':
            return 'Withdrawn';
        case 'expired':
            return 'Expired';
        default:
            return stage;
    }
};