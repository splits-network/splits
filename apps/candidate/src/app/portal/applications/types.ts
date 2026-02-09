export { getStatusColor, formatStage } from "@/lib/application-utils";
export { getApplicationStageBadge } from "@/lib/utils/badge-styles";

// ===== TYPES =====

export interface ApplicationDocument {
    id: string;
    file_name: string;
    content_type: string | null;
    file_size: number | null;
    document_type: string | null;
    is_primary: boolean;
    storage_path: string;
    metadata?: { is_primary?: boolean };
}

export interface PreScreenAnswer {
    question_id?: string;
    question?: { question: string } | string;
    answer: string;
}

export interface ApplicationAuditLog {
    id: string;
    application_id: string;
    action: string;
    performed_by_user_id?: string;
    performed_by_role?: string;
    company_id?: string;
    old_value?: Record<string, any>;
    new_value?: Record<string, any>;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface Application {
    id: string;
    stage: string;
    accepted_by_company: boolean;
    created_at: string;
    updated_at: string;
    ai_reviewed?: boolean;
    job_id: string;
    notes?: string;
    candidate_notes?: string;
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
        description?: string;
        recruiter_description?: string;
        status?: string;
        location: string;
        employment_type?: string;
        salary_min?: number;
        salary_max?: number;
        salary_currency?: string;
        department?: string;
        open_to_relocation?: boolean;
        job_requirements?: {
            id?: string;
            requirement_type: string;
            description: string;
            sort_order?: number;
        }[];
        company?: {
            id?: string;
            name?: string;
            industry?: string;
            headquarters_location?: string;
            logo_url?: string;
            website?: string;
            company_size?: string;
            description?: string;
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
        name?: string;
        email?: string;
        tagline?: string;
        bio?: string;
        years_experience?: number;
        phone?: string;
        user?: {
            id?: string;
            name: string;
            email?: string;
        };
    };
    ai_review?: {
        id?: string;
        fit_score: number;
        recommendation: "strong_fit" | "good_fit" | "fair_fit" | "poor_fit";
        confidence_level?: number;
        overall_summary?: string;
        strengths?: string[];
        concerns?: string[];
    };
    documents?: ApplicationDocument[];
    pre_screen_answers?: PreScreenAnswer[];
    timeline?: ApplicationAuditLog[];
    audit_log?: ApplicationAuditLog[];
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
