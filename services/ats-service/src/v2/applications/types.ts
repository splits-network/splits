/**
 * Application Domain Types
 */

import { PaginationParams, SortParams } from '../shared/pagination';

export interface ApplicationFilters extends PaginationParams, SortParams {
    search?: string;
    stage?: string;
    job_id?: string;
    candidate_id?: string;
    include?: string;
}

export interface ApplicationUpdate {
    stage?: string;
    cover_letter?: string;
    salary?: number;
    submitted_at?: Date | string;
    hired_at?: Date | string;
    placement_id?: string;
    accepted_by_company?: boolean;
    accepted_at?: Date | string;
    document_ids?: string[];
    pre_screen_answers?: Array<{ question_id: string; answer: any }>;
    decline_reason?: string;
    decline_details?: string;
    [key: string]: any;
}
