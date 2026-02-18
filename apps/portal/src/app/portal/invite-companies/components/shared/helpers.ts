import { formatRelativeTime } from "@/lib/utils";
import type { CompanyInvitation } from "../../types";

export function formatStatus(status?: string): string {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function createdAgo(invitation: CompanyInvitation): string {
    if (!invitation.created_at) return "";
    return formatRelativeTime(invitation.created_at);
}

export function getDaysUntilExpiry(expiresAt: string): number {
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    return Math.ceil(
        (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
}

export function isExpiringSoon(invitation: CompanyInvitation): boolean {
    if (invitation.status !== "pending" || !invitation.expires_at) return false;
    return getDaysUntilExpiry(invitation.expires_at) <= 3;
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function getInviteLink(invitation: CompanyInvitation): string {
    return (
        invitation.invite_url ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/join/${invitation.invite_link_token}`
    );
}

export function recruiterName(invitation: CompanyInvitation): string {
    return invitation.recruiter?.user?.name || "Unknown Recruiter";
}

export function recruiterInitials(name: string): string {
    const words = name.split(" ");
    return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : (words[0]?.[0] || "").toUpperCase();
}
