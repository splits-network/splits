/**
 * Assignment Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination.js';

export interface AssignmentFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    recruiter_id?: string;
    job_id?: string;
}

export interface AssignmentUpdate {
    status?: string;
    notes?: string;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
