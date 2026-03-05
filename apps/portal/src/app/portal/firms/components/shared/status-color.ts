/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

export type ViewMode = "table" | "grid" | "split";

/** Firm status -> BaselSemanticColor for use with BaselBadge */
export function firmStatusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "suspended":
            return "error";
        default:
            return "neutral";
    }
}

/** Firm status -> DaisyUI semantic badge/text classes */
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

/** Firm status -> border color class (for selected items) */
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

/** Member role -> BaselSemanticColor for use with BaselBadge */
export function memberRoleBadgeColor(role?: string): BaselSemanticColor {
    switch (role) {
        case "owner":
            return "primary";
        case "admin":
            return "secondary";
        case "member":
            return "success";
        case "collaborator":
            return "info";
        default:
            return "neutral";
    }
}

/** Member status -> BaselSemanticColor for use with BaselBadge */
export function memberStatusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "active":
            return "success";
        case "invited":
            return "warning";
        case "removed":
            return "error";
        default:
            return "neutral";
    }
}

/** Invitation status -> BaselSemanticColor for use with BaselBadge */
export function invitationStatusBadgeColor(status?: string): BaselSemanticColor {
    switch (status) {
        case "pending":
            return "info";
        case "accepted":
            return "success";
        case "expired":
            return "warning";
        case "revoked":
            return "error";
        default:
            return "neutral";
    }
}
