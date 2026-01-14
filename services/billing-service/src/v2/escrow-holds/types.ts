// Escrow Hold Types for V2 Domain

export interface EscrowHold {
    id: string;
    placement_id: string;
    payout_id?: string;
    hold_amount: number;
    hold_reason: string;
    held_at: string;
    release_scheduled_date: string;
    released_at?: string;
    released_by?: string;
    status: EscrowHoldStatus;
    created_at: string;
    updated_at: string;
}

export type EscrowHoldStatus = 'active' | 'released' | 'expired' | 'cancelled';

export interface EscrowHoldCreate {
    placement_id: string;
    payout_id?: string;
    hold_amount: number;
    hold_reason: string;
    release_scheduled_date: string;
}

export interface EscrowHoldUpdate {
    hold_amount?: number;
    hold_reason?: string;
    release_scheduled_date?: string;
    status?: EscrowHoldStatus;
    released_at?: string;
    released_by?: string;
}

export interface EscrowHoldFilters {
    status?: EscrowHoldStatus;
    placement_id?: string;
    date_from?: string;
    date_to?: string;
}
