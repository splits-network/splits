import { Job as BaseJob, Company, JobRequirement, JobPreScreenQuestion } from "@splits-network/shared-types";

// Extend BaseJob to include enriched fields from API
export interface Job extends BaseJob {
    company?: Company;
    requirements?: JobRequirement[];
    pre_screen_questions?: JobPreScreenQuestion[];
}

export interface JobFilters {
    job_owner_filter?: "assigned" | "all";
    status?: string;
    company_id?: string;
    employment_type?: string;
    is_remote?: boolean;
}
