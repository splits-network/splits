/**
 * Candidate Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface CandidateFilters extends PaginationParams, SortParams {
    search?: string;
    location?: string;
    scope?: string;
}

export interface CandidateUpdate {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    verification_status?: string;
    verification_metadata?: Record<string, any>;
    verified_at?: string;
    verified_by_user_id?: string;
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
