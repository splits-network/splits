/**
 * Proposal display helpers
 * Transforms raw proposal data into display-friendly format
 */

interface ProposalStatusBadge {
    color: string;
    icon: string;
    text: string;
}

interface EnhancedProposal {
    status_badge: ProposalStatusBadge;
    job_title: string;
    subtitle: string;
    is_overdue: boolean;
    is_urgent: boolean;
}

/**
 * Compute status badge properties from proposal state
 */
export function computeStatusBadge(state: string): ProposalStatusBadge {
    switch (state) {
        case 'proposed':
            return { color: 'warning', icon: 'clock', text: 'Pending' };
        case 'accepted':
            return { color: 'success', icon: 'check-circle', text: 'Accepted' };
        case 'declined':
            return { color: 'error', icon: 'times-circle', text: 'Declined' };
        case 'withdrawn':
            return { color: 'neutral', icon: 'undo', text: 'Withdrawn' };
        case 'timed_out':
            return { color: 'error', icon: 'exclamation-triangle', text: 'Expired' };
        case 'submitted':
            return { color: 'info', icon: 'paper-plane', text: 'Submitted' };
        default:
            return { color: 'neutral', icon: 'question-circle', text: state };
    }
}

/**
 * Enhance proposal with computed display fields
 */
export function enhanceProposal(proposal: any): any & EnhancedProposal {
    const job = proposal.job;
    const responseDueAt = proposal.response_due_at ? new Date(proposal.response_due_at) : null;
    const now = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return {
        ...proposal,
        status_badge: computeStatusBadge(proposal.state),
        job_title: job?.title || 'Unknown Job',
        subtitle: job?.company?.name || 'Unknown Company',
        is_overdue: responseDueAt ? responseDueAt < now : false,
        is_urgent: responseDueAt ? (responseDueAt <= tomorrow && responseDueAt > now) : false,
    };
}

/**
 * Enhance multiple proposals
 */
export function enhanceProposals(proposals: any[]): (any & EnhancedProposal)[] {
    return proposals.map(enhanceProposal);
}
