/**
 * Application Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ApplicationFilters extends PaginationParams, SortParams {
    search?: string;
    stage?: string;
    job_id?: string;
    candidate_id?: string;
}

export interface ApplicationUpdate {
    stage?: string;
    notes?: string;
    candidate_notes?: string;
    document_ids?: string[];
    primary_resume_id?: string;
    decline_reason?: string;
    decline_details?: string;
    [key: string]: any;
}
