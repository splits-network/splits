/**
 * Basel status color system for candidates — DaisyUI semantic tokens only.
 */

export type ViewMode = "table" | "grid" | "split";

/** Verification status → DaisyUI semantic badge/text classes */
export function statusColor(status?: string | null): string {
    switch (status) {
        case "verified":
            return "bg-success/15 text-success";
        case "pending":
            return "bg-warning/15 text-warning";
        case "unverified":
            return "bg-info/15 text-info";
        case "rejected":
            return "bg-error/15 text-error";
        default:
            return "bg-base-content/15 text-base-content/50";
    }
}

/** Verification status → border-left color class (selected items) */
export function statusBorder(status?: string | null): string {
    switch (status) {
        case "verified":
            return "border-l-success";
        case "pending":
            return "border-l-warning";
        case "unverified":
            return "border-l-info";
        case "rejected":
            return "border-l-error";
        default:
            return "border-l-primary";
    }
}

/** Verification status → dot color for indicator */
export function statusDot(status?: string | null): string {
    switch (status) {
        case "verified":
            return "bg-success";
        case "pending":
            return "bg-warning";
        case "unverified":
            return "bg-info";
        case "rejected":
            return "bg-error";
        default:
            return "bg-base-content/50";
    }
}
