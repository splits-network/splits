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
        company_ids?: string[];
    };
    include?: string;
    is_candidate_recruiter?: string;
    is_company_recruiter?: string;
    is_marketplace_enabled?: string;
    reputation_tier?: string;
    hire_rate_tier?: string;
}

export interface RecruiterUpdate {
    name?: string;
    email?: string;
    phone?: string;
    slug?: string;
    specialization?: string;
    status?: string;
    candidate_recruiter?: boolean;
    company_recruiter?: boolean;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
