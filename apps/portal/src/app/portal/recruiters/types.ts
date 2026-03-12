import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

export const RECRUITER_STATUS_LABELS: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    suspended: "Suspended",
};

export const RECRUITER_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Joined" },
    { value: "name", label: "Name" },
];

export const CANDIDATE_RECRUITER_LABELS: Record<string, string> = {
    yes: "Candidate Recruiter",
    no: "Not Candidate Recruiter",
};

export const COMPANY_RECRUITER_LABELS: Record<string, string> = {
    yes: "Company Recruiter",
    no: "Not Company Recruiter",
};

export const MARKETPLACE_ENABLED_LABELS: Record<string, string> = {
    yes: "Marketplace Enabled",
    no: "Not on Marketplace",
};

export const REPUTATION_TIER_LABELS: Record<string, string> = {
    high: "High (80+)",
    medium: "Medium (50-79)",
    low: "Low (< 50)",
    no_score: "No Score",
};

export const HIRE_RATE_TIER_LABELS: Record<string, string> = {
    high: "High (20%+)",
    medium: "Medium (10-19%)",
    low: "Low (< 10%)",
};

export interface RecruiterActivity {
    id: string;
    activity_type: string;
    description: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

/**
 * Extended recruiter type with joined user data from Supabase
 */
export interface RecruiterWithUser extends MarketplaceRecruiterDTO {
    users?: {
        id: string;
        name: string;
        email: string;
        profile_image_url?: string;
    };
    hire_rate?: number;
    firm_name?: string | null;
    firm_slug?: string | null;
    firm_role?: string | null;
    recent_activity?: RecruiterActivity[];
    response_rate?: number;
    avg_response_time_hours?: number;
}

/**
 * Filter interface for recruiter marketplace list
 */
export interface MarketplaceFilters {
    status?: string;
    marketplace_enabled?: boolean;
    company_ids?: string[];
    is_candidate_recruiter?: string;
    is_company_recruiter?: string;
    is_marketplace_enabled?: string;
    reputation_tier?: string;
    hire_rate_tier?: string;
}

/**
 * Company type for invite functionality
 */
export interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
}

/**
 * Recruiter-company relationship data for termination flow
 */
export interface CompanyRecruiterRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    status: string;
    company?: {
        id: string;
        name: string;
    };
}

/**
 * Resolve display name from recruiter with user join data
 */
export function getDisplayName(recruiter: RecruiterWithUser): string {
    return (
        recruiter.users?.name ||
        recruiter.name ||
        recruiter.users?.email ||
        "Unknown Recruiter"
    );
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}
