/**
 * Basel status color system for placements — DaisyUI semantic tokens only.
 * No Memphis colors (coral, teal, yellow, purple).
 */

export type ViewMode = "table" | "grid" | "split";

/** Status → DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "hired":
            return "bg-success/15 text-success";
        case "active":
            return "bg-info/15 text-info";
        case "completed":
            return "bg-primary/15 text-primary";
        case "pending_payout":
            return "bg-warning/15 text-warning";
        case "failed":
            return "bg-error/15 text-error";
        default:
            return "bg-base-content/15 text-base-content/50";
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
