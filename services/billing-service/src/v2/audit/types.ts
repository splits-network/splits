// Payout Audit Types for V2 Domain

export interface PayoutAuditLog {
    id: string;
    payout_id: string;
    event_type: string;
    action?: string;
    old_status?: string;
    new_status?: string;
    old_amount?: number;
    new_amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
    changed_by?: string;
    changed_by_role?: string;
    created_at: string;
    created_by?: string;
}

export interface PayoutAuditCreate {
    payout_id: string;
    event_type: string;
    action?: string;
    old_status?: string;
    new_status?: string;
    old_amount?: number;
    new_amount?: number;
    reason?: string;
    metadata?: Record<string, any>;
    changed_by?: string;
    changed_by_role?: string;
    created_by?: string;
}

export interface PayoutAuditFilters {
    payout_id?: string;
    event_type?: string;
    action?: string;
    changed_by?: string;
    date_from?: string;
    date_to?: string;
}
