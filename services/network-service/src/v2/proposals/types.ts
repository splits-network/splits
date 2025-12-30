/**
 * Proposal Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ProposalFilters extends PaginationParams, SortParams {
    search?: string;
    state?: string;
    recruiter_id?: string;
    job_id?: string;
    candidate_id?: string;
}

export interface ProposalUpdate {
    state?: string;
    notes?: string;
    rejection_reason?: string;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
