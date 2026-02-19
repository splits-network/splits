/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

export type ViewMode = "table" | "grid" | "split";

/** Team status → DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "suspended":
            return "bg-error/15 text-error";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Team status → border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "active":
            return "border-l-success";
        case "suspended":
            return "border-l-error";
        default:
            return "border-l-primary";
    }
}

/** Member role → DaisyUI semantic badge classes */
export function memberRoleColor(role?: string): string {
    switch (role) {
        case "owner":
            return "bg-primary/15 text-primary";
        case "admin":
            return "bg-secondary/15 text-secondary";
        case "member":
            return "bg-success/15 text-success";
        case "collaborator":
            return "bg-info/15 text-info";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Member status → DaisyUI semantic badge classes */
export function memberStatusColor(status?: string): string {
    switch (status) {
        case "active":
            return "bg-success/15 text-success";
        case "invited":
            return "bg-warning/15 text-warning";
        case "removed":
            return "bg-error/15 text-error";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}
