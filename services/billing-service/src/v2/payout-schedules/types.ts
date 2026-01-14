// Payout Schedule Types for V2 Domain

export interface PayoutSchedule {
    id: string;
    placement_id: string;
    payout_id?: string;
    scheduled_date: string;  // ISO date
    guarantee_completion_date?: string;  // ISO date
    trigger_event: string;
    status: PayoutScheduleStatus;
    triggered_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    processed_at?: string;
    failure_reason?: string;
    retry_count: number;
    last_retry_at?: string;
    created_at: string;
    updated_at: string;
}

export type PayoutScheduleStatus =
    | 'scheduled'
    | 'triggered'
    | 'cancelled'
    | 'pending'
    | 'processing'
    | 'processed'
    | 'failed';

export interface PayoutScheduleCreate {
    placement_id: string;
    payout_id?: string;
    scheduled_date: string;
    guarantee_completion_date?: string;
    trigger_event: string;
    status?: PayoutScheduleStatus;
}

export interface PayoutScheduleUpdate {
    scheduled_date?: string;
    guarantee_completion_date?: string;
    status?: PayoutScheduleStatus;
    triggered_at?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    processed_at?: string;
    failure_reason?: string;
    retry_count?: number;
    last_retry_at?: string;
}

export interface PayoutScheduleFilters {
    status?: PayoutScheduleStatus;
    date_from?: string;
    date_to?: string;
    placement_id?: string;
    trigger_event?: string;
}
