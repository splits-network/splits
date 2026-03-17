/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Status → BaselSemanticColor for use with BaselBadge */
export function statusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "draft":
            return "neutral";
        case "pending":
        case "paused":
            return "warning";
        case "active":
            return "success";
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
        case "active":
            return "border-l-success";
        case "filled":
            return "border-l-info";
        case "closed":
            return "border-l-base-content/30";
        default:
            return "border-l-primary";
    }
}
