/* ─── Basel Status Colors (DaisyUI semantic tokens ONLY) ─────────────────── */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

/**
 * Maps application stage to DaisyUI semantic colors.
 * Use BaselBadge with the color field — no custom badge classes.
 */

export interface StageDisplay {
    label: string;
    icon: string;
    color: BaselSemanticColor;
}

/**
 * Returns a stage display with an expired overlay when applicable.
 */
export function getStageDisplayWithExpired(
    stage: string | null | undefined,
    expiredAt: string | null | undefined,
): StageDisplay {
    const base = getStageDisplay(stage);
    if (!expiredAt) return base;
    return {
        label: `${base.label} (Expired)`,
        icon: "fa-clock",
        color: "neutral",
    };
}

export function getStageDisplay(stage: string | null | undefined): StageDisplay {
    switch (stage) {
        case "draft":
            return { label: "Draft", icon: "fa-pen", color: "neutral" };
        case "ai_review":
        case "ai_reviewed":
            return { label: "AI Review", icon: "fa-robot", color: "info" };
        case "recruiter_request":
            return { label: "Requested", icon: "fa-user-tie", color: "warning" };
        case "recruiter_proposed":
            return { label: "Proposed", icon: "fa-user-tie", color: "secondary" };
        case "recruiter_review":
            return { label: "In Review", icon: "fa-user-check", color: "secondary" };
        case "screen":
            return { label: "Screening", icon: "fa-filter", color: "info" };
        case "submitted":
            return { label: "Submitted", icon: "fa-paper-plane", color: "primary" };
        case "company_review":
            return { label: "Under Review", icon: "fa-building", color: "accent" };
        case "company_feedback":
            return { label: "Feedback", icon: "fa-comment", color: "accent" };
        case "interview":
            return { label: "Interview", icon: "fa-calendar", color: "success" };
        case "offer":
            return { label: "Offer", icon: "fa-handshake", color: "success" };
        case "hired":
            return { label: "Hired", icon: "fa-circle-check", color: "success" };
        case "rejected":
            return { label: "Rejected", icon: "fa-circle-xmark", color: "error" };
        case "withdrawn":
            return { label: "Withdrawn", icon: "fa-arrow-left", color: "neutral" };
        case "expired":
            return { label: "Expired", icon: "fa-clock", color: "neutral" };
        default:
            return { label: stage || "Unknown", icon: "fa-circle-question", color: "neutral" };
    }
}

/**
 * Maps AI fit score to BaselSemanticColor for use with BaselBadge.
 */
export function getAIScoreBadgeColor(score: number | null): BaselSemanticColor {
    if (score == null) return "neutral";
    if (score >= 90) return "success";
    if (score >= 70) return "primary";
    if (score >= 50) return "warning";
    return "error";
}
