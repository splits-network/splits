/**
 * V2 Types for ATS Service
 * These types are specific to V2 architecture
 */

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface PaginationResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export interface RepositoryListResponse<T> {
    data: T[];
    total: number;
}

// Job Types
export interface JobFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    location?: string;
    employment_type?: string;
    company_id?: string;
}

// Company Types
export interface CompanyFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
}

// Candidate Types
export interface CandidateFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    location?: string;
}

// Application Types
export interface ApplicationFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    stage?: string;
    job_id?: string;
    candidate_id?: string;
}

// Placement Types
export interface PlacementFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    job_id?: string;
    candidate_id?: string;
}

// Update Types
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

export interface CompanyUpdate {
    name?: string;
    description?: string;
    website?: string;
    status?: string;
    [key: string]: any;
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

export interface ApplicationUpdate {
    status?: string;
    stage?: string;
    notes?: string;
    [key: string]: any;
}

export interface PlacementUpdate {
    status?: string;
    start_date?: string;
    salary?: number;
    fee_percentage?: number;
    notes?: string;
    [key: string]: any;
}
