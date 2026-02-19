/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

export type ViewMode = "table" | "grid" | "split";

/** Status → DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "paused":
            return "bg-warning/15 text-warning";
        case "filled":
            return "bg-info/15 text-info";
        case "closed":
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
        case "paused":
            return "border-l-warning";
        case "filled":
            return "border-l-info";
        case "closed":
            return "border-l-base-content/30";
        default:
            return "border-l-primary";
    }
}
