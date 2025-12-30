/**
 * Candidate Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface CandidateFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    location?: string;
}

export interface CandidateUpdate {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    status?: string;
    [key: string]: any;
}
