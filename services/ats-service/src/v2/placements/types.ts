/**
 * Placement Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface PlacementFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    job_id?: string;
    candidate_id?: string;
}

export interface PlacementUpdate {
    status?: string;
    start_date?: string;
    salary?: number;
    fee_percentage?: number;
    notes?: string;
    [key: string]: any;
}
