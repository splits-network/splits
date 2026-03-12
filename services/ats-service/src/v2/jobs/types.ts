/**
 * Jobs Domain Types
 * 
 * Filter and update types for the jobs domain.
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface JobFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    location?: string;
    employment_type?: string;
    commute_type?: string | string[];
    job_level?: string;
    company_id?: string;
    job_owner_filter?: 'all' | 'assigned'; // 'all' = all active jobs, 'assigned' = jobs where recruiter is job_owner_id
    open_to_relocation?: string;
    is_remote?: string;
    job_source?: string;
    salary_range?: string;
    fee_range?: string;
    guarantee_range?: string;
    has_applications?: string;
    include?: string;
    filters?: Record<string, any>;
}

export interface JobUpdate {
    title?: string;
    description?: string;
    requirements?: string;
    responsibilities?: string;
    location?: string;
    employment_type?: string;
    commute_types?: string[];
    job_level?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    status?: string;
    is_early_access?: boolean;
    is_priority?: boolean;
    activates_at?: string | null;
    closes_at?: string | null;
    closed_reason?: string;
    [key: string]: any;
}
