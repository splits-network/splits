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
    company_id?: string;
    job_owner_filter?: 'all' | 'assigned'; // 'all' = all active jobs, 'assigned' = jobs where recruiter is job_owner_id
}

export interface JobUpdate {
    title?: string;
    description?: string;
    requirements?: string;
    responsibilities?: string;
    location?: string;
    employment_type?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    status?: string;
    closed_reason?: string;
    [key: string]: any;
}
