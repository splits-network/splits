/**
 * Basel status color system for candidates — DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

/** Verification status → BaselSemanticColor name for use with BaselBadge */
export function statusColorName(status?: string | null): BaselSemanticColor {
    switch (status) {
        case "verified":
            return "success";
        case "pending":
            return "warning";
        case "unverified":
            return "info";
        case "rejected":
            return "error";
        default:
            return "neutral";
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
