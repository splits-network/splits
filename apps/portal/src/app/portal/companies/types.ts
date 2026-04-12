export type CompanyTab = "marketplace" | "my-companies";

export type RelationshipStatus = "pending" | "active" | "declined" | "terminated";
export type RelationshipType = "sourcer" | "recruiter";

export interface Company {
    id: string;
    identity_organization_id?: string;
    name: string;
    website?: string;
    industry?: string;
    company_size?: string;
    headquarters_location?: string;
    description?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
    stage?: string;
    founded_year?: number;
    tagline?: string;
    social_links?: { url: string; label?: string }[];
    open_roles_count?: number;
    avg_salary?: number | null;
}

export interface CompanyRelationshipPermissions {
    can_view_jobs: boolean;
    can_create_jobs: boolean;
    can_edit_jobs: boolean;
    can_submit_candidates: boolean;
    can_view_applications: boolean;
    can_advance_candidates: boolean;
}

export interface CompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: RelationshipType;
    status: RelationshipStatus;
    permissions?: CompanyRelationshipPermissions;
    relationship_start_date: string;
    relationship_end_date?: string;
    termination_reason?: string;
    terminated_by?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
    recruiter?: {
        id: string;
        user: { name: string; email: string };
    };
    company: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        description?: string;
        website?: string;
        company_size?: string;
        stage?: string;
        logo_url?: string;
        founded_year?: number;
        tagline?: string;
        open_roles_count?: number;
    };
}

export interface CompanyContact {
    id: string;
    role: "hiring_manager" | "company_admin";
    user_id: string;
    name: string | null;
    email: string | null;
    profile_image_url: string | null;
}

export interface CompanyFilters {
    status?: string;
    industry?: string;
    company_size?: string;
    browse_all?: string;
    stage?: string;
    founded_year_range?: string;
    has_open_roles?: string;
    relationship_type?: string;
}

export const COMPANY_SIZE_LABELS: Record<string, string> = {
    "1-10": "1-10 employees",
    "11-50": "11-50 employees",
    "51-200": "51-200 employees",
    "201-500": "201-500 employees",
    "501+": "501+ employees",
};

export function formatCompanySize(size?: string): string {
    if (!size) return "Unknown";
    return COMPANY_SIZE_LABELS[size] || size;
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function getRelationshipStatusBadgeClass(status: string): string {
    switch (status) {
        case "active":
            return "badge-success";
        case "pending":
            return "badge-warning";
        case "declined":
            return "badge-error";
        case "terminated":
            return "badge-ghost";
        default:
            return "";
    }
}

export function getCompanySizeLabel(size?: string): string {
    if (!size) return "Unknown";
    return size;
}

import type { BaselSortOption } from "@splits-network/basel-ui";

export const INDUSTRY_LABELS: Record<string, string> = {
    Technology: "Technology",
    Healthcare: "Healthcare",
    Finance: "Finance",
    Education: "Education",
    Manufacturing: "Manufacturing",
    Retail: "Retail",
    Consulting: "Consulting",
};

export const RELATIONSHIP_STATUS_LABELS: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    declined: "Declined",
    terminated: "Terminated",
};

export const STAGE_LABELS: Record<string, string> = {
    Seed: "Seed",
    "Series A": "Series A",
    "Series B": "Series B",
    "Series C": "Series C",
    Growth: "Growth",
    Public: "Public",
    Bootstrapped: "Bootstrapped",
    "Non-Profit": "Non-Profit",
};

export const FOUNDED_YEAR_RANGE_LABELS: Record<string, string> = {
    pre_2000: "Before 2000",
    "2000_2010": "2000 – 2010",
    "2010_2020": "2010 – 2020",
    "2020_plus": "2020+",
};

export const HAS_OPEN_ROLES_LABELS: Record<string, string> = {
    yes: "Has Open Roles",
    no: "No Open Roles",
};

export const RELATIONSHIP_TYPE_LABELS: Record<string, string> = {
    sourcer: "Sourcer",
    recruiter: "Recruiter",
};

export const COMPANY_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Added" },
    { value: "name", label: "Company Name" },
];
