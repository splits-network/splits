import { Job as BaseJob, Company, JobRequirement, JobPreScreenQuestion } from "@splits-network/shared-types";
import { BrowseListItem, BrowseFilters } from "@splits-network/shared-ui";

// Extend BaseJob to include enriched fields from API
export interface Job extends BaseJob, BrowseListItem {
    company?: Company;
    requirements?: JobRequirement[];
    pre_screen_questions?: JobPreScreenQuestion[];
}

export interface JobFilters extends BrowseFilters {
    job_owner_filter?: "assigned" | "all";
    status?: string;
    company_id?: string;
    employment_type?: string;
    is_remote?: boolean;
}
