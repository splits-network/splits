/**
 * Basel status color system -- replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

export type ViewMode = "table" | "grid" | "split";

/** Relationship status -> DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "pending":
            return "bg-warning/15 text-warning";
        case "declined":
            return "bg-error/15 text-error";
        case "terminated":
            return "bg-base-content/15 text-base-content/50";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Status -> border color class (for selected items) */
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
