/**
 * Payout Domain Types
 */

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Payout {
    id: string;
    recruiter_id: string;
    amount_cents: number;
    currency: string;
    status: PayoutStatus;
    stripe_payout_id: string | null;
    period_start: string;
    period_end: string;
    created_at: string;
    updated_at: string;
}

export interface PayoutFilters {
    recruiter_id?: string;
    status?: PayoutStatus;
}

export interface PayoutListFilters extends PayoutFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type PayoutCreateInput = Omit<Payout, 'id' | 'created_at' | 'updated_at'>;
export type PayoutUpdateInput = Partial<Omit<Payout, 'id' | 'created_at' | 'updated_at'>>;
