import { Application as BaseApplication, Candidate, Job, Company, AIReview } from "@splits-network/shared-types";

// Extend BaseApplication to include enriched fields from API
export interface Application extends BaseApplication {
    candidate?: Candidate;
    job?: Job & { company?: Company };
    recruiter?: {
        id: string;
        name: string;
        email: string;
    };
    ai_review?: AIReview;
    documents?: any[]; // TODO: Add Document type when available
    timeline?: any[]; // TODO: Add Timeline type when available
}

export interface ApplicationFilters {
    stage?: string;
    candidate_id?: string;
    job_id?: string;
    recruiter_id?: string;
    company_id?: string;
    ai_score_filter?: string;
    date_range?: {
        start: string;
        end: string;
    };
}