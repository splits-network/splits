/**
 * Recruiter-Candidate Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface RecruiterCandidateFilters extends PaginationParams, SortParams {
    recruiter_id?: string;
    candidate_id?: string;
    status?: string;
}

export interface RecruiterCandidateUpdate {
    status?: string;
    notes?: string;
    [key: string]: any;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}
