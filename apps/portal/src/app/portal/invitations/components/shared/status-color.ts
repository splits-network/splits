/**
 * Basel status color system for invitations.
 * Uses DaisyUI semantic tokens only.
 */

import type { BaselSemanticColor } from "@splits-network/basel-ui";
import type { Invitation } from "../../types";

export type ViewMode = "table" | "grid" | "split";

/** Invitation status -> BaselSemanticColor for use with BaselBadge */
export function statusColorName(invitation: Invitation): BaselSemanticColor {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    if (invitation.consent_given) return "success";
    if (invitation.declined_at) return "error";
    if (invitation.status === "terminated" || invitation.status === "cancelled")
        return "neutral";
    if (invitation.status === "expired" || isExpired) return "warning";
    return "info";
}

/** Invitation status -> DaisyUI badge class for PanelHeader */
export function statusBadgeClass(invitation: Invitation): string {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    if (invitation.consent_given) return "badge-success";
    if (invitation.declined_at) return "badge-error";
    if (invitation.status === "terminated" || invitation.status === "cancelled")
        return "badge-error badge-outline";
    if (invitation.status === "expired" || isExpired) return "badge-ghost";
    return "badge-warning";
}

/** Invitation status -> border color class */
export function statusBorder(invitation: Invitation): string {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    if (invitation.consent_given) return "border-l-success";
    if (invitation.declined_at) return "border-l-error";
    if (invitation.status === "terminated" || invitation.status === "cancelled")
        return "border-l-base-content/30";
    if (invitation.status === "expired" || isExpired)
        return "border-l-warning";
    return "border-l-info";
}
