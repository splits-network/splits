export { getStatusColor, formatStage } from "@/lib/application-utils";
export { getApplicationStageBadge } from "@/lib/utils/badge-styles";

// ===== TYPES =====

export interface Application {
    id: string;
    stage: string;
    accepted_by_company: boolean;
    created_at: string;
    updated_at: string;
    ai_reviewed?: boolean;
    job_id: string;
    recruiter_notes?: string;
    candidate: {
        full_name: string;
        email: string;
        _masked?: boolean;
    };
    job?: {
        id?: string;
        title: string;
        candidate_description?: string;
        status?: string;
        location: string;
        job_requirements?: {
            requirement_type: string;
            description: string;
        }[];
        company?: {
            id?: string;
            name?: string;
            industry?: string;
            headquarters_location?: string;
            logo_url?: string;
        };
        recruiter?: {
            user?: {
                id?: string;
                name?: string;
                email?: string;
            };
        };
    };
    company?: {
        id?: string;
        name: string;
    };
    recruiter?: {
        user?: {
            id?: string;
            name: string;
            email?: string;
        };
    };
    ai_review?: {
        fit_score: number;
        recommendation: "strong_fit" | "good_fit" | "fair_fit" | "poor_fit";
    };
}

export interface ApplicationFilters {
    stage?: string;
}

// ===== CONSTANTS =====

export const APPLICATION_STAGES = [
    { value: "draft", label: "Draft" },
    { value: "recruiter_proposed", label: "Recruiter Proposed" },
    { value: "recruiter_request", label: "Recruiter Request" },
    { value: "ai_review", label: "AI Review" },
    { value: "screen", label: "Recruiter Review" },
    { value: "submitted", label: "Submitted" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer", label: "Offer" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
] as const;

// Stages where a candidate can withdraw
export const WITHDRAWABLE_STAGES = [
    "submitted",
    "screen",
    "interviewing",
    "recruiter_proposed",
    "recruiter_request",
    "ai_review",
];

// ===== HELPERS =====

export function getRecommendationLabel(
    recommendation: string,
): string {
    switch (recommendation) {
        case "strong_fit":
            return "Strong Fit";
        case "good_fit":
            return "Good Fit";
        case "fair_fit":
            return "Fair Fit";
        case "poor_fit":
            return "Poor Fit";
        default:
            return recommendation;
    }
}

export function getRecommendationColor(
    recommendation: string,
): string {
    switch (recommendation) {
        case "strong_fit":
            return "badge-success";
        case "good_fit":
            return "badge-info";
        case "fair_fit":
            return "badge-warning";
        case "poor_fit":
            return "badge-error";
        default:
            return "badge-ghost";
    }
}
