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
}

export interface CompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: RelationshipType;
    status: RelationshipStatus;
    can_manage_company_jobs: boolean;
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
