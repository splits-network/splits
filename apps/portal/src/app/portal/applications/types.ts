import type {
    Application as BaseApplication,
    Candidate,
    Job,
    Company,
    AIReview,
} from "@splits-network/shared-types";
import type { BaselSortOption } from "@splits-network/basel-ui";

// Extend BaseApplication to include enriched fields from API
export interface Application extends BaseApplication {
    candidate?: Candidate;
    job?: Job & { company?: Company };
    recruiter?: {
        id: string;
        name?: string;
        email?: string;
        user?: { name?: string; email?: string };
        bio?: string;
        status?: string;
    };
    ai_review?: AIReview;
    documents?: any[];
    timeline?: any[];
    pre_screen_answers?: any[];
    audit_log?: any[];
}

export interface ApplicationFilters {
    stage?: string;
    ai_score_filter?: string;
    scope?: "all" | "mine";
    application_source?: string;
    ai_reviewed?: string;
    company_accepted?: string;
    candidate_accepted?: string;
    has_cover_letter?: string;
    has_pre_screen?: string;
}

export type ViewMode = "table" | "grid" | "split";

export const APPLICATION_STAGE_LABELS: Record<string, string> = {
    draft: "Draft",
    screen: "Screening",
    submitted: "Submitted",
    company_review: "Company Review",
    recruiter_review: "Recruiter Review",
    ai_review: "AI Review",
    gpt_review: "GPT Review",
    ai_failed: "Review Failed",
    interview: "Interview",
    offer: "Offer",
    hired: "Hired",
    rejected: "Rejected",
};

export const AI_SCORE_LABELS: Record<string, string> = {
    high: "High Match",
    medium: "Medium Match",
    low: "Low Match",
    not_reviewed: "Not Scored",
};


export const APPLICATION_SOURCE_LABELS: Record<string, string> = {
    direct: "Direct Application",
    recruiter: "Recruiter Sourced",
};

export const AI_REVIEWED_LABELS: Record<string, string> = {
    yes: "AI Reviewed",
    no: "Not Reviewed",
};

export const COMPANY_ACCEPTED_LABELS: Record<string, string> = {
    yes: "Company Accepted",
    no: "Company Declined",
    pending: "Pending Company",
};

export const CANDIDATE_ACCEPTED_LABELS: Record<string, string> = {
    yes: "Candidate Accepted",
    no: "Candidate Declined",
    pending: "Pending Candidate",
};

export const HAS_COVER_LETTER_LABELS: Record<string, string> = {
    yes: "Has Cover Letter",
    no: "No Cover Letter",
};

export const HAS_PRE_SCREEN_LABELS: Record<string, string> = {
    yes: "Pre-Screen Complete",
    no: "No Pre-Screen",
};

export const APPLICATION_SORT_OPTIONS: BaselSortOption[] = [
    { value: "created_at", label: "Date Created" },
    { value: "updated_at", label: "Last Updated" },
    { value: "stage", label: "Stage" },
];

export function formatApplicationDate(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "N/A";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
