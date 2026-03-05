/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Status → DaisyUI semantic badge/text classes (legacy — for non-BaselBadge callers) */
export function statusColor(status?: string): string {
    switch (status) {
        case "draft":
            return "bg-base-content/10 text-base-content/40";
        case "pending":
        case "paused":
            return "bg-warning/15 text-warning";
        case "early":
            return "bg-accent/15 text-accent";
        case "active":
            return "bg-success/15 text-success";
        case "priority":
            return "bg-primary/15 text-primary";
        case "filled":
            return "bg-info/15 text-info";
        case "closed":
            return "bg-base-content/15 text-base-content/50";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Status → BaselSemanticColor for use with BaselBadge */
export function statusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "draft":
            return "neutral";
        case "pending":
        case "paused":
            return "warning";
        case "early":
            return "accent";
        case "active":
            return "success";
        case "priority":
            return "primary";
        case "filled":
            return "info";
        case "closed":
        default:
            return "neutral";
    }
}

/** Status → border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "draft":
            return "border-l-base-content/20";
        case "pending":
        case "paused":
            return "border-l-warning";
        case "early":
            return "border-l-accent";
        case "active":
            return "border-l-success";
        case "priority":
            return "border-l-primary";
        case "filled":
            return "border-l-info";
        case "closed":
            return "border-l-base-content/30";
        default:
            return "border-l-primary";
    }
}
