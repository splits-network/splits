import type {
    Candidate as BaseCandidate,
    MarketplaceProfile,
    ResumeMetadata,
    RecruiterCandidateWithCandidate,
} from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

export type { MarketplaceProfile, ResumeMetadata, RecruiterCandidateWithCandidate };

export type CandidateScope = "mine" | "saved" | "all";

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
    last_active_at?: string | null;

    // Saved state (enriched by backend)
    is_saved?: boolean;
    saved_record_id?: string | null;
}

export type RecruiterCandidate = RecruiterCandidateWithCandidate;

export interface CandidateFilters {
    scope?: CandidateScope;
    verification_status?: string;
    desired_job_type?: string;
    open_to_remote?: string;
    open_to_relocation?: string;
    availability?: string;
    has_account?: string;
    has_resume?: string;
    activity?: string;
}

// ===== LABEL MAPS =====

export const VERIFICATION_STATUS_LABELS: Record<string, string> = {
    verified: "Verified",
    pending: "Pending",
    unverified: "Unverified",
    rejected: "Rejected",
};

export const JOB_TYPE_LABELS: Record<string, string> = {
    full_time: "Full Time",
    contract: "Contract",
    freelance: "Freelance",
    part_time: "Part Time",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
    immediate: "Immediate",
    two_weeks: "2 Weeks",
    one_month: "1 Month",
    three_months: "3 Months",
    not_looking: "Not Looking",
};

export const RELOCATION_LABELS: Record<string, string> = {
    true: "Open to Relocation",
    false: "Not Relocating",
};

export const REMOTE_LABELS: Record<string, string> = {
    yes: "Open to Remote",
    no: "Not Remote",
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
    yes: "Has Account",
    no: "No Account",
};

export const RESUME_STATUS_LABELS: Record<string, string> = {
    yes: "Has Resume",
    no: "No Resume",
};

export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
    online: "Online Now",
    recent: "Recently Active",
    inactive: "Inactive",
};

export const CANDIDATE_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Last Updated" },
    { value: "full_name", label: "Name" },
];

export function formatVerificationStatus(status?: string | null): string {
    if (!status) return "Unverified";
    return VERIFICATION_STATUS_LABELS[status] || status;
}

export function formatJobType(type?: string | null): string {
    if (!type) return "Job type not specified";
    return JOB_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

export function formatAvailability(availability?: string | null): string {
    if (!availability) return "Availability Not specified";
    return AVAILABILITY_LABELS[availability] || availability.replace(/_/g, " ");
}
