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

export interface CandidateDashboardStats {
    applications: number;
    interviews: number;
    offers: number;
    active_relationships: number;
}

export interface RecentCandidateApplication {
    id: string;
    job_id: string;
    job_title: string;
    company: string;
    location?: string | null;
    status: string;
    stage: string;
    applied_at: string;
    updated_at?: string | null;
}
