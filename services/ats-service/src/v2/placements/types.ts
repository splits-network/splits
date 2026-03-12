/**
 * Placement Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface PlacementFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    job_id?: string;
    candidate_id?: string;
    include?: string;
    salary_range?: string;
    fee_range?: string;
    fee_amount_range?: string;
    guarantee_status?: string;
    is_replacement?: string;
    has_started?: string;
    invoice_status?: string;
    payout_status?: string;
}

export interface PlacementUpdate {
    status?: string;
    start_date?: string;
    guarantee_days?: number;
    salary?: number;
    fee_percentage?: number;
    notes?: string;
    [key: string]: any;
}
