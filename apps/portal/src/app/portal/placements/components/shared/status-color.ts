/**
 * Basel status color system for placements — DaisyUI semantic tokens only.
 * No Memphis colors (coral, teal, yellow, purple).
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Status → BaselSemanticColor name for use with BaselBadge */
export function statusColorName(status?: string): BaselSemanticColor {
    switch (status) {
        case "hired":
            return "success";
        case "active":
            return "info";
        case "completed":
            return "primary";
        case "pending_payout":
            return "warning";
        case "failed":
            return "error";
        default:
            return "neutral";
    }
}

/** Status → border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "hired":
            return "border-l-success";
        case "active":
            return "border-l-info";
        case "completed":
            return "border-l-primary";
        case "pending_payout":
            return "border-l-warning";
        case "failed":
            return "border-l-error";
        default:
            return "border-l-primary";
    }
}
