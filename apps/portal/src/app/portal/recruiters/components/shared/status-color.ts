/**
 * Basel status color system — DaisyUI semantic tokens only.
 * Replaces Memphis accent cycling for recruiter statuses.
 */

export type ViewMode = "table" | "grid" | "split";

/** Recruiter status → DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "pending":
            return "bg-warning/15 text-warning";
        case "suspended":
            return "bg-error/15 text-error";
        case "inactive":
            return "bg-base-content/15 text-base-content/50";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Status → border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "active":
            return "border-l-success";
        case "pending":
            return "border-l-warning";
        case "suspended":
            return "border-l-error";
        default:
            return "border-l-primary";
    }
}
