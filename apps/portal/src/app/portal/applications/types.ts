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
}

export type ViewMode = "table" | "grid" | "split";

export const APPLICATION_STAGE_LABELS: Record<string, string> = {
    draft: "Draft",
    screen: "Screening",
    submitted: "Submitted",
    company_review: "Company Review",
    recruiter_review: "Recruiter Review",
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
