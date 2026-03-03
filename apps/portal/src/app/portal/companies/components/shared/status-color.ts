/**
 * Basel status color system -- replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Relationship status → Tailwind class string (bg + text) for raw className usage */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/10 text-success";
        case "pending":
            return "bg-warning/10 text-warning";
        case "declined":
            return "bg-error/10 text-error";
        case "terminated":
            return "bg-base-300 text-base-content/50";
        default:
            return "bg-base-300 text-base-content/50";
    }
}

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
