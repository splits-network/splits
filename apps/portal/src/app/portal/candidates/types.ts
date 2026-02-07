import type {
    Candidate as BaseCandidate,
    MarketplaceProfile,
    RecruiterCandidateWithCandidate,
} from "@splits-network/shared-types";

export type { MarketplaceProfile };

export type CandidateScope = "mine" | "all";

// Enriched candidate type with computed fields for UI
export interface Candidate
    extends Omit<BaseCandidate, "created_at" | "updated_at" | "marketplace_profile"> {
    created_at: string;
    updated_at?: string;
    marketplace_profile?: MarketplaceProfile;
    description?: string;
    user_id: string | null;
    company_id?: string | null;
    is_new?: boolean;
    has_active_relationship?: boolean;
    has_pending_invitation?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    is_sourcer?: boolean;
}

export type RecruiterCandidate = RecruiterCandidateWithCandidate;

export interface CandidateFilters {
    scope?: CandidateScope;
    verification_status?: string;
    desired_job_type?: string;
    open_to_remote?: string;
}

export function getVerificationBadgeClass(status?: string): string {
    switch (status) {
        case "verified":
            return "badge-success";
        case "pending":
            return "badge-warning";
        case "unverified":
            return "badge-ghost";
        case "rejected":
            return "badge-error";
        default:
            return "";
    }
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
