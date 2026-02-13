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
    closed_reason?: string;
    [key: string]: any;
}
