// Placement Payout Audit Types for V2 Domain

export interface PlacementPayoutAuditLog {
    id: string;
    placement_id: string;
    schedule_id?: string;
    transaction_id?: string;
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
}

export interface PlacementPayoutAuditCreate {
    placement_id: string;
    schedule_id?: string;
    transaction_id?: string;
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
}

export interface PlacementPayoutAuditFilters {
    placement_id?: string;
    schedule_id?: string;
    transaction_id?: string;
    event_type?: string;
    action?: string;
    changed_by?: string;
    date_from?: string;
    date_to?: string;
}

// Keep old names as aliases for backward compatibility during transition
export type PayoutAuditLog = PlacementPayoutAuditLog;
export type PayoutAuditCreate = PlacementPayoutAuditCreate;
export type PayoutAuditFilters = PlacementPayoutAuditFilters;
