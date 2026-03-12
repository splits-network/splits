import {
    Company,
    JobRequirement,
    JobPreScreenQuestion,
    JobSkill,
} from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

// Local type definitions (these exist in shared-types/models but aren't exported from index)
export type JobStatus = "draft" | "pending" | "early" | "active" | "priority" | "paused" | "filled" | "closed";
export type EmploymentType = "full_time" | "part_time" | "contract" | "temporary";

/**
 * Unified Job type for all roles views (grid, table, browse)
 * Extends the base Job type with enriched fields from the API
 */
export interface Job {
    // Core identifiers
    id: string;
    company_id: string | null;
    source_firm_id?: string | null;

    // Basic info
    title: string;
    department?: string;
    location?: string;

    // Compensation
    salary_min?: number;
    salary_max?: number;
    fee_percentage: number;

    // Descriptions
    description?: string;
    recruiter_description?: string;
    candidate_description?: string;

    // Job details
    employment_type?: EmploymentType | string;
    open_to_relocation?: boolean;
    commute_types?: string[] | null;
    job_level?: string | null;
    show_salary_range?: boolean;
    guarantee_days?: number;
    is_remote?: boolean;

    // Ownership/Assignment
    job_owner_id?: string;
    recruiter_id?: string;
    company_recruiter_id?: string;
    job_owner_recruiter_id?: string;

    // Status
    status: JobStatus | string;

    // Timestamps
    activates_at?: string | null;
    closes_at?: string | null;
    created_at: string | Date;
    updated_at?: string | Date;

    // Enriched data from API
    company?: Company & {
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
    requirements?: JobRequirement[];
    pre_screen_questions?: JobPreScreenQuestion[];
    skills?: JobSkill[];

    // Computed/aggregated fields
    application_count?: number;
}

// ===== LABEL MAPS =====

export const JOB_STATUS_LABELS: Record<string, string> = {
    draft: "Draft",
    pending: "Pending",
    early: "Early Access",
    active: "Active",
    priority: "Priority",
    paused: "Paused",
    filled: "Filled",
    closed: "Closed",
};

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    full_time: "Full Time",
    part_time: "Part Time",
    contract: "Contract",
    temporary: "Temporary",
};

export const COMMUTE_TYPE_LABELS: Record<string, string> = {
    remote: "Remote",
    hybrid_1: "Hybrid (1 day)",
    hybrid_2: "Hybrid (2 days)",
    hybrid_3: "Hybrid (3 days)",
    hybrid_4: "Hybrid (4 days)",
    in_office: "In Office",
};

export const JOB_LEVEL_LABELS: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    manager: "Manager",
    director: "Director",
    vp: "VP",
    c_suite: "C-Suite",
};

export function formatCommuteTypes(types?: string[] | null): string | null {
    if (!types || types.length === 0) return null;
    return types.map((t) => COMMUTE_TYPE_LABELS[t] || t).join(", ");
}

export function formatJobLevel(level?: string | null): string | null {
    if (!level) return null;
    return JOB_LEVEL_LABELS[level] || level;
}

// ===== SORT OPTIONS =====

export const ROLE_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Last Updated" },
    { value: "title", label: "Title" },
    { value: "status", label: "Status" },
    { value: "salary_min", label: "Salary" },
];

// ===== FILTERS =====

/**
 * Unified filter interface for all view modes (browse, grid, table)
 * Includes all filterable fields from the jobs data model
 */
export interface UnifiedJobFilters {
    // Scope
    job_owner_filter?: "all" | "assigned";

    // Inline filters (Row 1)
    status?: string;
    employment_type?: string;

    // Expanded filters (Row 3)
    commute_type?: string;
    job_level?: string;
    company_id?: string;
}
