/**
 * Basel status color system -- replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

/** Relationship status → BaselSemanticColor name for use with BaselBadge */
export function statusColorName(status?: string): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "pending":
            return "warning";
        case "declined":
            return "error";
        case "terminated":
            return "neutral";
        default:
            return "neutral";
    }
}

/** Status → border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "active":
            return "border-l-success";
        case "pending":
            return "border-l-warning";
        case "declined":
            return "border-l-error";
        case "terminated":
            return "border-l-base-content/30";
        default:
            return "border-l-primary";
    }
}
