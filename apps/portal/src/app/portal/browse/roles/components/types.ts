import { Job as BaseJob, Company, JobRequirement } from "@splits-network/shared-types";

// Extend BaseJob to include enriched fields from API
export interface Job extends BaseJob {
    company?: Company;
    requirements?: JobRequirement[];
}

export interface JobFilters {
    scope?: "mine" | "all";
    status?: string;
    company_id?: string;
    employment_type?: string;
    is_remote?: boolean;
}
