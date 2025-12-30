import { Payout, PayoutFilters, PayoutUpdate } from '../types';

export interface PayoutListFilters extends PayoutFilters {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export type PayoutCreateInput = Omit<Payout, 'id' | 'created_at' | 'updated_at'>;
export type PayoutUpdateInput = PayoutUpdate;