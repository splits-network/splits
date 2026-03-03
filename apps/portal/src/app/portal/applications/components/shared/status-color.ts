/* ─── Basel Status Colors (DaisyUI semantic tokens ONLY) ─────────────────── */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

/**
 * Maps application stage to DaisyUI semantic badge/status classes.
 * No Memphis colors — only success, warning, error, info, primary, secondary, neutral.
 */

export interface StageDisplay {
    label: string;
    badge: string;
    icon: string;
    /** BaselSemanticColor for use with BaselBadge */
    color: BaselSemanticColor;
}

/**
 * Returns a stage display with an expired overlay when applicable.
 * When expired_at is set, the label becomes "Stage (Expired)" with dimmed styling.
 */
export function getStageDisplayWithExpired(
    stage: string | null | undefined,
    expiredAt: string | null | undefined,
): StageDisplay {
    const base = getStageDisplay(stage);
    if (!expiredAt) return base;
    return {
        label: `${base.label} (Expired)`,
        badge: "bg-base-content/10 text-base-content/50",
        icon: "fa-clock",
        color: "neutral",
    };
}

export function getStageDisplay(stage: string | null | undefined): StageDisplay {
    switch (stage) {
        case "draft":
            return { label: "Draft", badge: "bg-base-content/10 text-base-content/60", icon: "fa-pen", color: "neutral" };
        case "ai_review":
        case "ai_reviewed":
            return { label: "AI Review", badge: "bg-info/15 text-info", icon: "fa-robot", color: "info" };
        case "recruiter_request":
            return { label: "Requested", badge: "bg-warning/15 text-warning", icon: "fa-user-tie", color: "warning" };
        case "recruiter_proposed":
            return { label: "Proposed", badge: "bg-secondary/15 text-secondary", icon: "fa-user-tie", color: "secondary" };
        case "recruiter_review":
            return { label: "In Review", badge: "bg-secondary/15 text-secondary", icon: "fa-user-check", color: "secondary" };
        case "screen":
            return { label: "Screening", badge: "bg-info/15 text-info", icon: "fa-filter", color: "info" };
        case "submitted":
            return { label: "Submitted", badge: "bg-primary/15 text-primary", icon: "fa-paper-plane", color: "primary" };
        case "company_review":
            return { label: "Under Review", badge: "bg-accent/15 text-accent", icon: "fa-building", color: "accent" };
        case "company_feedback":
            return { label: "Feedback", badge: "bg-accent/15 text-accent", icon: "fa-comment", color: "accent" };
        case "interview":
            return { label: "Interview", badge: "bg-success/15 text-success", icon: "fa-calendar", color: "success" };
        case "offer":
            return { label: "Offer", badge: "bg-success/15 text-success", icon: "fa-handshake", color: "success" };
        case "hired":
            return { label: "Hired", badge: "bg-success/15 text-success", icon: "fa-circle-check", color: "success" };
        case "rejected":
            return { label: "Rejected", badge: "bg-error/15 text-error", icon: "fa-circle-xmark", color: "error" };
        case "withdrawn":
            return { label: "Withdrawn", badge: "bg-base-content/10 text-base-content/50", icon: "fa-arrow-left", color: "neutral" };
        case "expired":
            return { label: "Expired", badge: "bg-base-content/10 text-base-content/50", icon: "fa-clock", color: "neutral" };
        default:
            return { label: stage || "Unknown", badge: "bg-base-content/10 text-base-content/50", icon: "fa-circle-question", color: "neutral" };
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
