/**
 * Recruiter Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface RecruiterFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    specialization?: string;
    filters?: {
        marketplace_enabled?: boolean;
    };
    include?: string;
}

export interface RecruiterUpdate {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    status?: string;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
