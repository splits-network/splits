import type { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";

export type Invitation = RecruiterCandidateWithCandidate;

export interface InvitationFilters {
    status?: string;
}

export type InvitationStatusColor = "teal" | "coral" | "yellow" | "purple";

export interface InvitationStatusDisplay {
    label: string;
    color: InvitationStatusColor;
    icon: string;
}

export function getDisplayStatus(invitation: Invitation): InvitationStatusDisplay {
    const isExpired =
        invitation.invitation_expires_at &&
        new Date(invitation.invitation_expires_at) < new Date();

    // Consent given = actively representing
    if (invitation.consent_given) {
        return { label: "Representing", color: "teal", icon: "fa-user-check" };
    }
    // Explicitly declined
    if (invitation.declined_at) {
        return { label: "Declined", color: "coral", icon: "fa-user-xmark" };
    }
    // Terminal relationship statuses
    if (invitation.status === "terminated") {
        return { label: "Revoked", color: "purple", icon: "fa-ban" };
    }
    if (invitation.status === "cancelled") {
        return { label: "Cancelled", color: "purple", icon: "fa-ban" };
    }
    // Invitation expired
    if (invitation.status === "expired" || isExpired) {
        return { label: "Expired", color: "yellow", icon: "fa-clock" };
    }
    // Still active and not expired
    if (invitation.status === "accepted" || invitation.status === "active") {
        return { label: "Pending", color: "yellow", icon: "fa-hourglass-half" };
    }

    return { label: "Pending", color: "yellow", icon: "fa-hourglass-half" };
}

export function canResendInvitation(invitation: Invitation): boolean {
    const terminalStatuses = ["terminated", "cancelled", "declined", "accepted"];
    return (
        !invitation.consent_given &&
        !invitation.declined_at &&
        !terminalStatuses.includes(invitation.status)
    );
}

export function formatInvitationDate(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "N/A";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateShort(
    dateString: string | Date | null | undefined,
): string {
    if (!dateString) return "";
    const date =
        dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

export function timeAgo(dateString: string | Date | null | undefined): string {
    if (!dateString) return "";
    const d =
        dateString instanceof Date ? dateString : new Date(dateString);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
}

export function getInitials(name: string): string {
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export function isRecentInvitation(invitation: Invitation): boolean {
    if (!invitation.invited_at) return false;
    const d = new Date(invitation.invited_at);
    return (Date.now() - d.getTime()) / 86400000 <= 7;
}
