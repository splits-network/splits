import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/**
 * Basel stage color utility — returns bg + text classes for pills/badges.
 * Uses semantic DaisyUI tokens only; no Memphis colors.
 * @deprecated Use stageColorName with BaselBadge instead.
 */
export function stageColor(stage: string): string {
    switch (stage) {
        case "draft":
            return "bg-neutral/10 text-neutral";
        case "ai_review":
        case "gpt_review":
        case "ai_reviewed":
            return "bg-info/15 text-info";
        case "ai_failed":
            return "bg-error/15 text-error";
        case "submitted":
        case "recruiter_review":
        case "company_review":
            return "bg-primary/15 text-primary";
        case "recruiter_proposed":
        case "recruiter_request":
            return "bg-secondary/15 text-secondary";
        case "screen":
        case "interview":
        case "company_feedback":
            return "bg-accent/15 text-accent";
        case "offer":
        case "hired":
            return "bg-success/15 text-success";
        case "rejected":
            return "bg-error/15 text-error";
        case "withdrawn":
        case "expired":
            return "bg-warning/15 text-warning";
        default:
            return "bg-base-200 text-base-content/50";
    }
}

/**
 * Returns a BaselSemanticColor for use with BaselBadge.
 * Mirrors the stageColor mapping but returns a typed color name.
 */
export function stageColorName(stage: string): BaselSemanticColor {
    switch (stage) {
        case "draft":
            return "neutral";
        case "ai_review":
        case "gpt_review":
        case "ai_reviewed":
            return "info";
        case "ai_failed":
            return "error";
        case "submitted":
        case "recruiter_review":
        case "company_review":
            return "primary";
        case "recruiter_proposed":
        case "recruiter_request":
            return "secondary";
        case "screen":
        case "interview":
        case "company_feedback":
            return "accent";
        case "offer":
        case "hired":
            return "success";
        case "rejected":
            return "error";
        case "withdrawn":
        case "expired":
            return "warning";
        default:
            return "neutral";
    }
}