import type { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

export type Invitation = RecruiterCandidateWithCandidate;

export interface InvitationFilters {
    status?: string;
}

export interface InvitationStatusDisplay {
    label: string;
    icon: string;
}

export function getDisplayStatus(invitation: Invitation): InvitationStatusDisplay {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    if (invitation.consent_given) {
        return { label: "Representing", icon: "fa-user-check" };
    }
    if (invitation.declined_at) {
        return { label: "Declined", icon: "fa-user-xmark" };
    }
    if (invitation.status === "terminated") {
        return { label: "Revoked", icon: "fa-ban" };
    }
    if (invitation.status === "cancelled") {
        return { label: "Cancelled", icon: "fa-ban" };
    }
    if (invitation.status === "expired" || isExpired) {
        return { label: "Expired", icon: "fa-clock" };
    }
    if (invitation.status === "accepted" || invitation.status === "active") {
        return { label: "Pending", icon: "fa-hourglass-half" };
    }

    return { label: "Pending", icon: "fa-hourglass-half" };
}

export function canResendInvitation(invitation: Invitation): boolean {
    const terminalStatuses = ["terminated", "cancelled", "declined", "accepted"];
    return (
        !invitation.consent_given &&
        !invitation.declined_at &&
        !terminalStatuses.includes(invitation.status)
    );
}
