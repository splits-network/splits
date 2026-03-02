/**
 * Basel status color system — DaisyUI semantic tokens only.
 * Replaces Memphis accent cycling for recruiter statuses.
 */

export type ViewMode = "table" | "grid" | "split";

/** Recruiter status → DaisyUI badge modifier classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "badge-info badge-soft badge-outline";
        case "pending":
            return "badge-warning badge-soft badge-outline";
        case "suspended":
            return "badge-error badge-soft badge-outline";
        case "inactive":
            return "badge-ghost";
        default:
            return "badge-ghost";
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
