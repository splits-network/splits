/**
 * Basel status color system for invitations.
 * Uses DaisyUI semantic tokens only.
 */

import type { Invitation } from "../../types";

export type ViewMode = "table" | "grid" | "split";

/** Invitation status -> DaisyUI semantic badge/text classes */
export function statusColor(invitation: Invitation): string {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    if (invitation.consent_given) return "bg-success/15 text-success";
    if (invitation.declined_at) return "bg-error/15 text-error";
    if (invitation.status === "terminated" || invitation.status === "cancelled")
        return "bg-base-content/15 text-base-content/50";
    if (invitation.status === "expired" || isExpired)
        return "bg-warning/15 text-warning";
    return "bg-info/15 text-info";
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
