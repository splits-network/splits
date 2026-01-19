// Proposal statistics types for analytics service

export interface ProposalSummary {
    actionable_count: number;   // Proposals requiring recruiter action
    waiting_count: number;       // Awaiting response from other party
    urgent_count: number;        // Expiring in < 24 hours
    overdue_count: number;       // Expired/timed out
}

export interface ProposalStatsFilters {
    recruiter_id?: string;
    // Future: company_id, date_range, etc.
}
