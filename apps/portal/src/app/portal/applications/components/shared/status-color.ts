/* ─── Basel Status Colors (DaisyUI semantic tokens ONLY) ─────────────────── */

/**
 * Maps application stage to DaisyUI semantic badge/status classes.
 * No Memphis colors — only success, warning, error, info, primary, secondary, neutral.
 */

export interface StageDisplay {
    label: string;
    badge: string;
    icon: string;
}

export function getStageDisplay(stage: string | null | undefined): StageDisplay {
    switch (stage) {
        case "draft":
            return { label: "Draft", badge: "bg-base-content/10 text-base-content/60", icon: "fa-pen" };
        case "ai_review":
        case "ai_reviewed":
            return { label: "AI Review", badge: "bg-info/15 text-info", icon: "fa-robot" };
        case "recruiter_request":
            return { label: "Requested", badge: "bg-warning/15 text-warning", icon: "fa-user-tie" };
        case "recruiter_proposed":
            return { label: "Proposed", badge: "bg-secondary/15 text-secondary", icon: "fa-user-tie" };
        case "recruiter_review":
            return { label: "In Review", badge: "bg-secondary/15 text-secondary", icon: "fa-user-check" };
        case "screen":
            return { label: "Screening", badge: "bg-info/15 text-info", icon: "fa-filter" };
        case "submitted":
            return { label: "Submitted", badge: "bg-primary/15 text-primary", icon: "fa-paper-plane" };
        case "company_review":
            return { label: "Under Review", badge: "bg-accent/15 text-accent", icon: "fa-building" };
        case "company_feedback":
            return { label: "Feedback", badge: "bg-accent/15 text-accent", icon: "fa-comment" };
        case "interview":
            return { label: "Interview", badge: "bg-success/15 text-success", icon: "fa-calendar" };
        case "offer":
            return { label: "Offer", badge: "bg-success/15 text-success", icon: "fa-handshake" };
        case "hired":
            return { label: "Hired", badge: "bg-success/15 text-success", icon: "fa-circle-check" };
        case "rejected":
            return { label: "Rejected", badge: "bg-error/15 text-error", icon: "fa-circle-xmark" };
        case "withdrawn":
            return { label: "Withdrawn", badge: "bg-base-content/10 text-base-content/50", icon: "fa-arrow-left" };
        case "expired":
            return { label: "Expired", badge: "bg-base-content/10 text-base-content/50", icon: "fa-clock" };
        default:
            return { label: stage || "Unknown", badge: "bg-base-content/10 text-base-content/50", icon: "fa-circle-question" };
    }
}

/**
 * Maps AI fit score to DaisyUI semantic color classes.
 */
export function getAIScoreColor(score: number | null): string {
    if (score == null) return "text-base-content/40";
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-error";
}

export function getAIScoreBadge(score: number | null): string {
    if (score == null) return "bg-base-content/10 text-base-content/50";
    if (score >= 90) return "bg-success/15 text-success";
    if (score >= 70) return "bg-primary/15 text-primary";
    if (score >= 50) return "bg-warning/15 text-warning";
    return "bg-error/15 text-error";
}
