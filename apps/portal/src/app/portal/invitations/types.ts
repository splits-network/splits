import type { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

export type Invitation = RecruiterCandidateWithCandidate;

export interface InvitationFilters {
    status?: string;
}

export interface InvitationStatusDisplay {
    label: string;
    badgeClass: string;
    icon: string;
}

export function getDisplayStatus(invitation: Invitation): InvitationStatusDisplay {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    // Consent given = actively representing, regardless of other fields
    if (invitation.consent_given) {
        return { label: "Representing", badgeClass: "badge-success", icon: "fa-user-check" };
    }
    // Explicitly declined
    if (invitation.declined_at) {
        return { label: "Declined", badgeClass: "badge-error", icon: "fa-user-xmark" };
    }
    // Terminal relationship statuses
    if (invitation.status === "terminated") {
        return { label: "Revoked", badgeClass: "badge-neutral", icon: "fa-ban" };
    }
    if (invitation.status === "cancelled") {
        return { label: "Cancelled", badgeClass: "badge-neutral", icon: "fa-ban" };
    }
    // Invitation expired (must check BEFORE active — the relationship may be
    // "active" but the invitation itself expired without a response)
    if (invitation.status === "expired" || isExpired) {
        return { label: "Expired", badgeClass: "badge-warning", icon: "fa-clock" };
    }
    // Still active and not expired
    if (invitation.status === "accepted" || invitation.status === "active") {
        return { label: "Pending", badgeClass: "badge-info", icon: "fa-hourglass-half" };
    }

    return { label: "Pending", badgeClass: "badge-info", icon: "fa-hourglass-half" };
}

export function canResendInvitation(invitation: Invitation): boolean {
    const terminalStatuses = ["terminated", "cancelled", "declined", "accepted"];
    return (
        !invitation.consent_given &&
        !invitation.declined_at &&
        !terminalStatuses.includes(invitation.status)
    );
}

export function formatInvitationDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return "N/A";
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
