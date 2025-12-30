/**
 * Reputation Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ReputationFilters extends PaginationParams, SortParams {
    recruiter_id?: string;
}

export interface ReputationUpdate {
    total_placements?: number;
    successful_placements?: number;
    rating?: number;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
