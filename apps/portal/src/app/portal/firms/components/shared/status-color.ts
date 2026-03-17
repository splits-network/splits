/**
 * Basel status color system — replaces Memphis accent cycling.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";

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
