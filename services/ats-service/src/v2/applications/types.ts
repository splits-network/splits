/**
 * Application Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ApplicationFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    stage?: string;
    job_id?: string;
    candidate_id?: string;
}

export interface ApplicationUpdate {
    status?: string;
    stage?: string;
    notes?: string;
    [key: string]: any;
}
