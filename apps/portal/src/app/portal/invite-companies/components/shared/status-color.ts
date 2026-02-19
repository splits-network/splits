/**
 * Basel status color system for company invitations.
 * Uses DaisyUI semantic tokens only — no Memphis named colors.
 */

export type ViewMode = "table" | "grid" | "split";

/** Status -> DaisyUI semantic badge/text classes */
export function statusColor(status?: string): string {
    switch (status) {
        case "pending":
            return "bg-warning/15 text-warning";
        case "accepted":
            return "bg-success/15 text-success";
        case "expired":
            return "bg-base-content/15 text-base-content/50";
        case "revoked":
            return "bg-error/15 text-error";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Status -> border color class (for selected items) */
export function statusBorder(status?: string): string {
    switch (status) {
        case "pending":
            return "border-l-warning";
        case "accepted":
            return "border-l-success";
        case "expired":
            return "border-l-base-content/30";
        case "revoked":
            return "border-l-error";
        default:
            return "border-l-primary";
    }
}

/** Status -> FA icon class */
export function statusIcon(status?: string): string {
    switch (status) {
        case "pending":
            return "fa-clock";
        case "accepted":
            return "fa-check-circle";
        case "expired":
            return "fa-hourglass-end";
        case "revoked":
            return "fa-ban";
        default:
            return "fa-circle";
    }
}
