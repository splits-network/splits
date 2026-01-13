export const getStatusColor = (stage: string) => {
    switch (stage) {
        case 'draft':
            return 'badge-ghost';
        case 'ai_review':
            return 'badge-warning';
        case 'screen':
        case 'submitted':
            return 'badge-info';
        case 'recruiter_proposed':
            return 'badge-secondary';
        case 'recruiter_request':
            return 'badge-info';
        case 'interviewing':
            return 'badge-primary';
        case 'offer':
            return 'badge-success badge-soft';
        case 'hired':
            return 'badge-success';
        case 'rejected':
            return 'badge-error';
        case 'withdrawn':
            return 'badge-error badge-soft';
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
        case 'screen':
            return 'Recruiter Review';
        case 'recruiter_proposed':
            return 'Recruiter Proposed';
        case 'recruiter_request':
            return 'Recruiter Request';
        case 'submitted':
            return 'Submitted';
        case 'interviewing':
            return 'Interviewing';
        case 'offer':
            return 'Offer';
        case 'rejected':
            return 'Rejected';
        case 'withdrawn':
            return 'Withdrawn';
        default:
            return stage;
    }
};