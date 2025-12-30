/**
 * V2 Types for Network Service
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

// Recruiter Types
export interface RecruiterFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    specialization?: string;
}

// Assignment Types
export interface AssignmentFilters extends PaginationParams, SortParams {
    search?: string;
    status?: string;
    recruiter_id?: string;
    job_id?: string;
}

// Recruiter-Candidate Relationship Types
export interface RecruiterCandidateFilters extends PaginationParams, SortParams {
    recruiter_id?: string;
    candidate_id?: string;
    status?: string;
}

// Reputation Types
export interface ReputationFilters extends PaginationParams, SortParams {
    recruiter_id?: string;
}

// Proposal Types
export interface ProposalFilters extends PaginationParams, SortParams {
    search?: string;
    state?: string;
    recruiter_id?: string;
    job_id?: string;
    candidate_id?: string;
}

// Update Types
export interface RecruiterUpdate {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    status?: string;
    [key: string]: any;
}

export interface AssignmentUpdate {
    status?: string;
    notes?: string;
    [key: string]: any;
}

export interface RecruiterCandidateUpdate {
    status?: string;
    relationship_type?: string;
    notes?: string;
    [key: string]: any;
}

export interface ReputationUpdate {
    total_placements?: number;
    successful_placements?: number;
    rating?: number;
    [key: string]: any;
}

export interface ProposalUpdate {
    state?: string;
    notes?: string;
    rejection_reason?: string;
    [key: string]: any;
}
