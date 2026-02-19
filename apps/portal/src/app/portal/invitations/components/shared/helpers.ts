import type { Invitation } from "../../types";

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

export function candidateName(invitation: Invitation): string {
    return invitation.candidate?.full_name || "Unknown Candidate";
}
