import { AuditLogEntry, TimelineEvent, STAGE_DISPLAY_NAMES, ROLE_DISPLAY_NAMES } from './types';

/** Map direct action names to human-readable labels */
const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    created: { label: 'Application Created', icon: 'fa-plus-circle', color: 'text-info' },
    ai_review_started: { label: 'AI Review Started', icon: 'fa-brain', color: 'text-accent' },
    ai_review_completed: { label: 'AI Review Completed', icon: 'fa-brain', color: 'text-success' },
    ai_review_failed: { label: 'AI Review Failed', icon: 'fa-brain', color: 'text-error' },
    returned_to_draft: { label: 'Returned to Draft', icon: 'fa-rotate-left', color: 'text-warning' },
    submitted: { label: 'Application Submitted', icon: 'fa-paper-plane', color: 'text-primary' },
    recruiter_proposed: { label: 'Recruiter Proposed Job', icon: 'fa-handshake', color: 'text-primary' },
    recruiter_proposed_job: { label: 'Recruiter Proposed Job', icon: 'fa-handshake', color: 'text-primary' },
    proposal_accepted: { label: 'Proposal Accepted', icon: 'fa-check-circle', color: 'text-success' },
    candidate_approved_opportunity: { label: 'Proposal Accepted', icon: 'fa-check-circle', color: 'text-success' },
    proposal_declined: { label: 'Proposal Declined', icon: 'fa-times-circle', color: 'text-error' },
    candidate_declined_opportunity: { label: 'Proposal Declined', icon: 'fa-times-circle', color: 'text-error' },
    hired: { label: 'Candidate Hired', icon: 'fa-trophy', color: 'text-success' },
    prescreen_requested: { label: 'Pre-Screen Requested', icon: 'fa-clipboard-question', color: 'text-info' },
    accepted: { label: 'Accepted by Company', icon: 'fa-check-circle', color: 'text-success' },
    rejected: { label: 'Application Rejected', icon: 'fa-times-circle', color: 'text-error' },
    withdrawn: { label: 'Application Withdrawn', icon: 'fa-undo', color: 'text-warning' },
    draft_saved: { label: 'Draft Saved', icon: 'fa-save', color: 'text-warning' },
    note_added: { label: 'Note Added', icon: 'fa-note-sticky', color: 'text-warning' },
    viewed: { label: 'Viewed', icon: 'fa-eye', color: 'text-base-content/50' },
    recruiter_request: { label: 'Recruiter Requested Changes', icon: 'fa-comment-dots', color: 'text-warning' },
};

/** Map stage transitions to human-readable labels */
const STAGE_TRANSITION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    'submitted->company_review': { label: 'Company Reviewing Application', icon: 'fa-building', color: 'text-info' },
    'company_review->interview': { label: 'Advanced to Interview', icon: 'fa-comments', color: 'text-primary' },
    'company_review->company_feedback': { label: 'Company Provided Feedback', icon: 'fa-comment-dots', color: 'text-info' },
    'company_feedback->interview': { label: 'Advanced to Interview', icon: 'fa-comments', color: 'text-primary' },
    'interview->offer': { label: 'Offer Extended', icon: 'fa-file-signature', color: 'text-success' },
    'company_review->offer': { label: 'Offer Extended', icon: 'fa-file-signature', color: 'text-success' },
    'company_feedback->offer': { label: 'Offer Extended', icon: 'fa-file-signature', color: 'text-success' },
    'offer->hired': { label: 'Candidate Hired', icon: 'fa-trophy', color: 'text-success' },
    'recruiter_review->screen': { label: 'Moved to Screening', icon: 'fa-clipboard-check', color: 'text-info' },
    'recruiter_review->submitted': { label: 'Recruiter Submitted to Company', icon: 'fa-paper-plane', color: 'text-primary' },
    'screen->submitted': { label: 'Screening Complete - Submitted', icon: 'fa-paper-plane', color: 'text-primary' },
    'screen->company_review': { label: 'Screening Complete - Company Reviewing', icon: 'fa-building', color: 'text-info' },
    'recruiter_proposed->draft': { label: 'Proposal Accepted - Draft Started', icon: 'fa-check-circle', color: 'text-success' },
    'draft->ai_review': { label: 'AI Review Started', icon: 'fa-brain', color: 'text-accent' },
    'ai_review->ai_reviewed': { label: 'AI Review Completed', icon: 'fa-brain', color: 'text-success' },
    'ai_reviewed->draft': { label: 'Returned to Draft', icon: 'fa-rotate-left', color: 'text-warning' },
    'ai_reviewed->submitted': { label: 'Application Submitted', icon: 'fa-paper-plane', color: 'text-primary' },
    'ai_reviewed->screen': { label: 'Moved to Screening', icon: 'fa-clipboard-check', color: 'text-info' },
};

function getStageName(stage: string): string {
    return STAGE_DISPLAY_NAMES[stage] || stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function interpretStageChanged(log: AuditLogEntry): { label: string; icon: string; color: string } {
    const from = log.old_value?.stage;
    const to = log.new_value?.stage;

    if (!from || !to) {
        return { label: 'Stage Changed', icon: 'fa-arrow-right-arrow-left', color: 'text-primary' };
    }

    // Check for specific transition
    const key = `${from}->${to}`;
    if (STAGE_TRANSITION_LABELS[key]) {
        return STAGE_TRANSITION_LABELS[key];
    }

    // Generic terminal state transitions
    if (to === 'rejected') {
        return { label: 'Application Rejected', icon: 'fa-times-circle', color: 'text-error' };
    }
    if (to === 'withdrawn') {
        return { label: 'Application Withdrawn', icon: 'fa-undo', color: 'text-warning' };
    }
    if (to === 'recruiter_request') {
        return { label: 'Recruiter Requested Changes', icon: 'fa-comment-dots', color: 'text-warning' };
    }
    if (to === 'draft') {
        return { label: 'Returned to Draft', icon: 'fa-rotate-left', color: 'text-warning' };
    }

    // Fallback with human-readable names
    return {
        label: `${getStageName(from)} \u2192 ${getStageName(to)}`,
        icon: 'fa-arrow-right-arrow-left',
        color: 'text-primary',
    };
}

function extractDetails(log: AuditLogEntry): Record<string, string> | undefined {
    const details: Record<string, string> = {};

    if (log.metadata?.decline_reason) {
        details['Reason'] = log.metadata.decline_reason;
    }
    if (log.metadata?.decline_details) {
        details['Details'] = log.metadata.decline_details;
    }
    if (log.new_value?.decline_reason) {
        details['Reason'] = log.new_value.decline_reason;
    }
    if (log.metadata?.recommendation) {
        const rec = log.metadata.recommendation as string;
        details['AI Recommendation'] = rec.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    if (log.metadata?.message) {
        details['Message'] = log.metadata.message;
    }
    if (log.metadata?.has_message && log.metadata?.message) {
        details['Message'] = log.metadata.message;
    }
    if (log.new_value?.salary) {
        details['Salary'] = `$${Number(log.new_value.salary).toLocaleString()}`;
    }
    if (log.new_value?.start_date) {
        details['Start Date'] = log.new_value.start_date;
    }

    return Object.keys(details).length > 0 ? details : undefined;
}

export function interpretAuditLog(log: AuditLogEntry): TimelineEvent {
    let label: string;
    let icon: string;
    let color: string;

    if (log.action === 'stage_changed') {
        const result = interpretStageChanged(log);
        label = result.label;
        icon = result.icon;
        color = result.color;
    } else if (ACTION_LABELS[log.action]) {
        const config = ACTION_LABELS[log.action];
        label = config.label;
        icon = config.icon;
        color = config.color;
    } else {
        label = log.action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        icon = 'fa-circle';
        color = 'text-base-content';
    }

    return {
        id: log.id,
        label,
        icon,
        color,
        performedByRole: log.performed_by_role,
        roleLabel: log.performed_by_role ? (ROLE_DISPLAY_NAMES[log.performed_by_role] || log.performed_by_role) : undefined,
        timestamp: log.created_at,
        details: extractDetails(log),
        rawAction: log.action,
    };
}
